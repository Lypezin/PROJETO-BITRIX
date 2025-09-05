import axios from 'axios';

// O nome da variável de ambiente como está cadastrado na Vercel
// SEM o prefixo VITE_
const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL;

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificação de segurança básica: garantir que a variável de ambiente existe
  if (!BITRIX_WEBHOOK_URL) {
    console.error('ERRO GRAVE: Variável de ambiente BITRIX_WEBHOOK_URL não encontrada!');
    return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
  }

  // Permite apenas métodos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Método ${req.method} não é permitido. Use POST.` });
  }
  
  const { method, params } = req.body;

  if (!method) {
    return res.status(400).json({ error: 'O "method" da API do Bitrix não foi fornecido no corpo da requisição.' });
  }
  
  const apiUrl = `${BITRIX_WEBHOOK_URL}${method}`;
  
  try {
    console.log('Chamando Bitrix24:', method, 'com URL:', apiUrl);
    
    const bitrixResponse = await axios.post(apiUrl, params || {}, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Resposta do Bitrix24:', bitrixResponse.status);
    
    // Repassa a resposta do Bitrix para o frontend
    res.status(200).json(bitrixResponse.data);

  } catch (error) {
    console.error('Erro ao chamar a API do Bitrix:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
        error: 'Erro ao se comunicar com a API do Bitrix.',
        details: error.response?.data 
    });
  }
}
