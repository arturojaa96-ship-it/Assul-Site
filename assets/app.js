// --- CONFIGURAÇÃO ---
const PHONE = '554136675877';
const API_BASE = '/api'; // O la URL de tu backend se está em outro domínio

// --- UTILIDADES ---
function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function whatsappUrl(message) {
    return `https://api.whatsapp.com/send?phone=${PHONE}&text=${encodeURIComponent(message)}`;
}

function openWindow(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

// --- LÓGICA DE CARRUSEL ---
function setupCarousel(carouselListElement, interval = 5000) {
    const list = carouselListElement;
    if (!list || list.children.length <= 1) return;

    let currentIndex = 0;
    const totalSlides = list.querySelectorAll('.testimonial-slide').length;
    
    const visibleSlides = Math.floor(list.offsetWidth / (list.children[0].offsetWidth + 12)) || 1;
    for (let i = 0; i < Math.min(visibleSlides, totalSlides); i++) {
        list.appendChild(list.children[i].cloneNode(true));
    }

    const slideWidth = () => list.children[0].offsetWidth + 12;

    const nextSlide = () => {
        currentIndex++;
        list.style.transition = 'transform 0.5s ease-in-out';
        list.style.transform = `translateX(-${currentIndex * slideWidth()}px)`;

        if (currentIndex >= totalSlides) {
            setTimeout(() => {
                list.style.transition = 'none';
                currentIndex = 0;
                list.style.transform = 'translateX(0px)';
            }, 500);
        }
    };

    let autoInterval = setInterval(nextSlide, interval);
    list.addEventListener('mouseenter', () => clearInterval(autoInterval));
    list.addEventListener('mouseleave', () => autoInterval = setInterval(nextSlide, interval));
}

// --- LÓGICA DE COMENTARIOS (BACKEND) ---

async function fetchComments() {
    try {
        const response = await fetch(`${API_BASE}/comments`);
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error("Error fetching comments:", e);
        return [];
    }
}

async function postComment(comment) {
    try {
        const response = await fetch(`${API_BASE}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comment)
        });
        return response.ok;
    } catch (e) {
        console.error("Error posting comment:", e);
        return false;
    }
}

async function renderComments() {
    const list = document.getElementById('comments-list');
    list.innerHTML = '<div class="testimonial-slide"><p style="text-align:center;color:var(--muted)">Carregando depoimentos...</p></div>';
    
    const comments = (await fetchComments()).slice().reverse();
    
    list.innerHTML = '';
    if (comments.length === 0) {
        list.innerHTML = '<div class="testimonial-slide"><p style="text-align:center;color:var(--muted)">Ainda não há comentários. Seja o primeiro!</p></div>';
        return;
    }

    comments.forEach(c => {
        const slide = document.createElement('div');
        slide.className = 'testimonial-slide';
        slide.innerHTML = `
<div class="comment-item">
    <div class="stars">${escapeHtml(c.rating)}</div>
    <strong>${escapeHtml(c.name)}</strong>
    <p style="margin:5px 0 0">“${escapeHtml(c.text)}”</p>
</div>`;
        list.appendChild(slide);
    });

    setupCarousel(list, 6000);
}

async function handleCommentSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('comment-success-message');

    const selectedRating = form.querySelector('input[name="rating"]:checked');
    if (!selectedRating) {
        alert("Por favor, selecione uma nota.");
        return;
    }
    
    const newComment = {
        name: document.getElementById('comment-name').value,
        text: document.getElementById('comment-text').value,
        rating: selectedRating.value
    };

    button.disabled = true;
    button.textContent = "Publicando...";
    successMessage.classList.add('hidden'); 

    const success = await postComment(newComment);
    
    if (success) {
        form.reset();
        selectedRating.checked = false;
        
        successMessage.classList.remove('hidden'); 
        setTimeout(() => successMessage.classList.add('hidden'), 5000);

        await renderComments();
    } else {
        alert("Erro ao publicar comentário. Tente novamente.");
    }
    
    button.disabled = false;
    button.textContent = "Publicar";
}

// --- LÓGICA DE CHAT BOT ---

const chatState = {
    step: 0, 
    memory: {}
};

const chatContainer = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');

function addChatMessage(message, type = 'bot') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${type}`;
    
    if (type === 'user') {
        msgDiv.textContent = message; 
    } else {
        msgDiv.innerHTML = message;
    }
    
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function processChatInput(message) {
    addChatMessage(message, 'user');
    chatInput.value = '';
    chatInput.disabled = true;

    setTimeout(() => {
        runChatBot(message);
    }, 500);
}

function runChatBot(userInput = null) {
    chatInput.disabled = false;
    
    switch (chatState.step) {
        case 0: 
            addChatMessage("Olá! Para agilizar seu atendimento, qual é o <strong>modelo</strong> do seu equipamento? (Ex: LT12B, DFN41)");
            chatState.step = 1;
            break;
            
        case 1: 
            chatState.memory.modelo = userInput;
            addChatMessage(`Obrigado. Agora, qual <strong>peça</strong> você precisa para o modelo <strong>${escapeHtml(userInput)}</strong>?`);
            chatState.step = 2;
            break;
            
        case 2: 
            chatState.memory.peca = userInput;
            const modelo = chatState.memory.modelo;
            const peca = chatState.memory.peca;
            
            const finalMsg = `Pedido:
- Modelo: ${modelo}
- Peça: ${peca}`;
            
            const finalWppUrl = whatsappUrl(finalMsg);
            
            addChatMessage(`Perfeito! Revise seu pedido:
<div class="notice" style="margin-top: 8px; background: var(--bg); color: var(--text);">
<strong>Modelo:</strong> ${escapeHtml(modelo)}<br>
<strong>Peça:</strong> ${escapeHtml(peca)}
</div>
<div class="chat-options" style="margin-top: 10px;">
  <button id="chat-confirm-wpp" class="btn btn-primary">✔️ Enviar ao especialista</button>
</div>`);
            
            chatInput.disabled = true;
            chatInput.placeholder = "Clique no botão para enviar.";
            
            document.getElementById('chat-confirm-wpp').addEventListener('click', () => {
                openWindow(finalWppUrl);
                resetChatBot("Ótimo! Seu pedido foi enviado. Começando de novo...");
            });
            break;
    }
    chatInput.focus();
}

function resetChatBot(message) {
    addChatMessage(message);
    chatState.step = 0;
    chatState.memory = {};
    chatInput.placeholder = "Digite sua mensagem...";
    setTimeout(() => {
        chatInput.disabled = true;
        runChatBot();
    }, 1000);
}

function initChatBot() {
    const chatButton = document.getElementById('web-chat-button');
    const chatBox = document.getElementById('web-chat-box');
    const chatForm = document.getElementById('chat-form');

    if (!chatButton || !chatBox || !chatForm) {
        console.error("Elementos del Chat Bot no encontrados. Revisa los IDs en index.html.");
        return;
    }

    chatButton.addEventListener('click', () => {
        const isHidden = chatBox.style.display !== 'flex';
        chatBox.style.display = isHidden ? 'flex' : 'none';
        chatButton.setAttribute('aria-expanded', isHidden);
        
        if (isHidden && chatState.step === 0) {
            chatContainer.innerHTML = '';
            runChatBot(); 
        }
    });
    
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
            processChatInput(message);
        }
    });
}

// LÓGICA PARA LOS LINKS RÁPIDOS DE LA TABLA
function initQuickLinks() {
    const links = document.querySelectorAll('a[data-quick]');
    const equipSelect = document.getElementById('equip');
    const modeloInput = document.getElementById('modelo');
    const outroWrapper = document.getElementById('outro-equip-wrapper');

    if (!equipSelect || !modeloInput || !outroWrapper) {
        console.error("Elementos del formulario no encontrados. No se pudo inicializar QuickLinks.");
        return;
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const category = link.dataset.quick;
            
            // 1. Poner el valor en el select
            equipSelect.value = category;
            
            // 2. Asegurarse que el campo "Outro" esté oculto
            outroWrapper.classList.add('hidden'); 
            
            // 3. Hacer scroll suave hacia el campo "Modelo"
            modeloInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // 4. Poner el cursor (focus) en el campo "Modelo"
            setTimeout(() => {
                modeloInput.focus();
            }, 500); // 500ms de espera para dar tiempo al scroll
        });
    });
}

// --- **Lógica para Formulario de Técnico (Añadida en un paso anterior)** ---
async function handleTecnicoSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('tecnico-success-message');

    const data = {
        nome: document.getElementById('t-nome').value,
        whatsapp: document.getElementById('t-whats').value,
        email: document.getElementById('t-email').value,
        cidade: document.getElementById('t-cidade').value,
        cnpj: document.getElementById('t-cnpj').value,
        segmento: document.getElementById('t-seg').value,
    };

    button.disabled = true;
    button.textContent = "Enviando...";
    successMessage.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE}/tecnicos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            form.reset();
            successMessage.classList.remove('hidden');
            setTimeout(() => successMessage.classList.add('hidden'), 8000);
        } else {
            alert("Erro ao enviar cadastro. Tente novamente.");
        }

    } catch (e) {
        console.error("Error submitting tecnico form:", e);
        alert("Erro de conexão. Verifique e tente novamente.");
    }

    button.disabled = false;
    button.textContent = "Enviar cadastro";
}


// --- INICIALIZACIÓN DE LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Lógica del formulario principal
    const whatsappForm = document.getElementById('whatsapp-form');
    const equipSelect = document.getElementById('equip');
    const outroWrapper = document.getElementById('outro-equip-wrapper');

    if (equipSelect && outroWrapper) {
        equipSelect.addEventListener('change', () => {
            if (equipSelect.value === 'Outro') {
                outroWrapper.classList.remove('hidden');
            } else {
                outroWrapper.classList.add('hidden');
            }
        });
    }

    if (whatsappForm) {
        whatsappForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let equipamento = equipSelect.value;
            
            if (equipamento === 'Outro') {
                const outroEquip = document.getElementById('outro-equip').value;
                equipamento = `Outro: ${outroEquip || 'Não especificado'}`;
            }
            
            const msg = `Equipamento: ${equipamento}\n- Modelo: ${document.getElementById('modelo').value}\n- Código da Peça: ${document.getElementById('codigo').value || 'Não informado'}`;
            
            openWindow(whatsappUrl(msg));
        });
    }

    // Activar el Chat Bot
    initChatBot();
    
    // Cargar comentarios desde el Backend
    renderComments();

    // Listener para formulario de comentarios
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }
    
    // Listener para formulario de técnico
    const tecnicoForm = document.getElementById('tecnico-form');
    if (tecnicoForm) {
        tecnicoForm.addEventListener('submit', handleTecnicoSubmit);
    }
    
    const staticCarousel = document.getElementById('testimonials-carousel-auto');
    if (staticCarousel) {
        setupCarousel(staticCarousel, 4000);
    }
    
    // Inicializar los links rápidos de la tabla
    initQuickLinks();
});