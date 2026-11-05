/* ==========================================================================
   Assul — Peças originais Electrolux
   Único ponto de configuração: número do WhatsApp e UTMs.
   Sem backend: todos os formulários abrem o WhatsApp com a mensagem pronta.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    // Número do WhatsApp comercial, formato internacional sem "+" nem espaços.
    // Se mudar aqui, troque também os links "https://wa.me/..." do index.html
    // (eles funcionam sem JavaScript).
    whatsapp: '554136675877',
    utmSource: 'site',
    utmMedium: 'whatsapp'
  };

  function mensagemPadrao() {
    return 'Olá, Assul! Preciso de uma peça original Electrolux.\nModelo do aparelho: \nPeça ou defeito: ';
  }

  function urlWhatsApp(texto, cta) {
    if (CONFIG.whatsapp !== '554136675877') { throw new Error('Destino de atendimento não autorizado'); }
    var u = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(texto);
    // Parâmetros UTM ajudam a ver no GTM/GA4 qual botão gerou o clique.
    u += '&utm_source=' + CONFIG.utmSource + '&utm_medium=' + CONFIG.utmMedium + '&utm_campaign=' + encodeURIComponent(cta || 'geral');
    return u;
  }

  function abrir(url) {
    window.location.assign(url);
  }

  function limpar(v) { return String(v || '').trim().replace(/\s+/g, ' ').slice(0, 120); }

  /* ---- Links diretos (data-wpp) ---------------------------------------- */
  function prepararLinks() {
    var links = document.querySelectorAll('[data-wpp]');
    Array.prototype.forEach.call(links, function (a) {
      var cta = a.getAttribute('data-cta') || 'link';
      var categoria = a.getAttribute('data-categoria');
      var texto = categoria
        ? 'Olá, Assul! Preciso de uma peça original Electrolux para ' + categoria + '.\nModelo do aparelho: \nPeça ou defeito: '
        : mensagemPadrao();
      a.setAttribute('href', urlWhatsApp(texto, cta));
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  /* ---- Formulário principal: monte sua mensagem ------------------------- */
  function prepararFormPedido() {
    var form = document.getElementById('form-pedido');
    if (!form) { return; }
    var equip = document.getElementById('equipamento');
    var campoOutro = document.getElementById('campo-outro');
    var outro = document.getElementById('outro');
    var modelo = document.getElementById('modelo');
    var peca = document.getElementById('peca');
    var erro = document.getElementById('erro-modelo');

    equip.addEventListener('change', function () {
      var ehOutro = equip.value === 'Outro';
      campoOutro.classList.toggle('oculto', !ehOutro);
      if (ehOutro) { outro.focus(); }
    });

    modelo.addEventListener('input', function () {
      modelo.removeAttribute('aria-invalid');
      erro.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = limpar(modelo.value);
      if (!m) {
        modelo.setAttribute('aria-invalid', 'true');
        erro.hidden = false;
        modelo.focus();
        return;
      }
      var equipamento = equip.value === 'Outro'
        ? 'Outro (' + (limpar(outro.value) || 'não informado') + ')'
        : equip.value;
      var p = limpar(peca.value) || 'não informado';
      var texto = 'Olá, Assul! Preciso de uma peça original Electrolux.\n'
        + 'Equipamento: ' + equipamento + '\n'
        + 'Modelo: ' + m + '\n'
        + 'Peça ou código: ' + p;
      abrir(urlWhatsApp(texto, 'form-pedido'));
    });
  }

  /* ---- Formulário de profissionais -------------------------------------- */
  function prepararFormProfissional() {
    var form = document.getElementById('form-profissional');
    if (!form) { return; }
    var nome = document.getElementById('p-nome');
    var cidade = document.getElementById('p-cidade');
    var segmento = document.getElementById('p-segmento');
    var cnpj = document.getElementById('p-cnpj');
    var consent = document.getElementById('p-consent');
    var erro = document.getElementById('erro-prof');

    // Máscara leve de CNPJ: só dígitos, formata ao digitar.
    cnpj.addEventListener('input', function () {
      var d = cnpj.value.replace(/\D/g, '').slice(0, 14);
      var f = d;
      if (d.length > 2) { f = d.slice(0, 2) + '.' + d.slice(2); }
      if (d.length > 5) { f = f.slice(0, 6) + '.' + d.slice(5); }
      if (d.length > 8) { f = f.slice(0, 10) + '/' + d.slice(8); }
      if (d.length > 12) { f = f.slice(0, 15) + '-' + d.slice(12); }
      cnpj.value = f;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = limpar(nome.value);
      var c = limpar(cidade.value);
      var ok = n && c && consent.checked;
      nome.setAttribute('aria-invalid', String(!n));
      cidade.setAttribute('aria-invalid', String(!c));
      erro.hidden = !!ok;
      if (!ok) { (n ? (c ? consent : cidade) : nome).focus(); return; }

      var texto = 'Olá, Assul! Quero me cadastrar como profissional.\n'
        + 'Nome / razão social: ' + n + '\n'
        + 'Cidade: ' + c + '\n'
        + 'Segmento: ' + segmento.value + '\n'
        + 'CNPJ: ' + (limpar(cnpj.value) || 'não informado');
      abrir(urlWhatsApp(texto, 'form-profissional'));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    prepararLinks();
    prepararFormPedido();
    prepararFormProfissional();
    document.querySelectorAll('button[type=submit]').forEach(function (button) { button.disabled = false; });
  });
})();
