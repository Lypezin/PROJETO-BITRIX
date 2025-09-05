import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { method, params } = req.body;

    if (!method) {
      return res.status(400).json({ error: 'Method is required' });
    }

    // URL do webhook do Bitrix24 (armazenada como variável de ambiente)
    const webhookUrl = process.env.BITRIX_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('BITRIX_WEBHOOK_URL não configurada');
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    // Fazer a chamada para o Bitrix24
    const response = await axios.post(webhookUrl, {
      method,
      params: params || {}
    }, {
      timeout: 30000, // 30 segundos de timeout
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Retornar a resposta do Bitrix24
    return res.status(200).json(response.data);

  } catch (error: any) {
    console.error('Erro na API proxy:', error);
    
    if (error.response) {
      // Erro da API do Bitrix24
      return res.status(error.response.status).json({
        error: error.response.data?.error || 'Erro na API do Bitrix24',
        error_description: error.response.data?.error_description || error.message
      });
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      return res.status(408).json({
        error: 'timeout',
        error_description: 'Timeout na comunicação com o Bitrix24'
      });
    } else {
      // Erro interno
      return res.status(500).json({
        error: 'internal_error',
        error_description: 'Erro interno do servidor'
      });
    }
  }
}
