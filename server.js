/*
Servidor Node/Express conectado a Supabase
**VERSIÓN SEGURA PARA PRODUCCIÓN (con Environment Variables)**
*/
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// --- **CONFIGURACIÓN DE PRODUCCIÓN** ---
// Las claves se leerán desde las "Environment Variables" del hosting
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
// -------------------------------------

// Validar que las claves existan
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias.');
  process.exit(1); // Detiene el servidor si faltan las claves
}

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// --- Endpoints ---

// Endpoint de Comentarios
app.get('/api/comments', async (req, res) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false }); 

  if (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.post('/api/comments', async (req, res) => {
  const { name, text, rating } = req.body;
  if (!name || !text || !rating) return res.status(400).json({ error: 'Faltan campos' });
  
  const { data, error } = await supabase
    .from('comments')
    .insert([{ name: name, text: text, rating: rating }])
    .select();

  if (error) {
    console.error('Error posting comment:', error);
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data[0]);
});


// Endpoint para Técnicos
app.post('/api/tecnicos', async (req, res) => {
    const { nome, whatsapp, email, cidade, cnpj, segmento } = req.body;
    
    if (!nome || !whatsapp || !cidade || !segmento) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const { error } = await supabase
      .from('tecnicos')
      .insert([
        { 
          nome: nome, 
          whatsapp: whatsapp, 
          email: email || 'Não informado', 
          cidade: cidade, 
          cnpj: cnpj || 'Não informado', 
          segmento: segmento 
        }
      ]);

    if (error) {
      console.error('Error saving tecnico:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.status(201).json({ success: true });
});



app.listen(PORT, ()=> console.log(`Servidor rodando na porta ${PORT}!`));