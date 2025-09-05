import axios from 'axios';

const testBitrixConnection = async () => {
  const webhookUrl = process.env.BITRIX_WEBHOOK_URL || 'https://fenix-service.bitrix24.com.br/rest/4958/tgqwnsvlpt45iw3t/';
  
  console.log('🔌 Testando conexão com Bitrix24...');
  console.log('URL:', webhookUrl);
  
  try {
    // Teste simples - buscar campos de contato
    const response = await axios.post(webhookUrl, {
      method: 'crm.contact.fields',
      params: {}
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data.result) {
      console.log('✅ Conexão estabelecida com sucesso!');
      console.log('📋 Campos encontrados:', Object.keys(response.data.result).length);
      
      // Verificar campos específicos
      const fields = response.data.result;
      const dataEnvio = Object.entries(fields).find(([key, field]: [string, any]) => 
        field.title === 'Data de Envio'
      );
      const dataLiberacao = Object.entries(fields).find(([key, field]: [string, any]) => 
        field.title === 'Data de Liberação*'
      );
      
      console.log('\n🎯 Campos importantes:');
      if (dataEnvio) {
        console.log(`  ✅ Data de Envio: ${dataEnvio[0]}`);
      } else {
        console.log('  ❌ Data de Envio: NÃO ENCONTRADO');
      }
      
      if (dataLiberacao) {
        console.log(`  ✅ Data de Liberação*: ${dataLiberacao[0]}`);
      } else {
        console.log('  ❌ Data de Liberação*: NÃO ENCONTRADO');
      }
      
      return true;
    } else {
      console.log('❌ Resposta inválida do Bitrix24');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Erro na conexão:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Timeout na conexão');
    } else {
      console.error('Erro:', error.message);
    }
    
    return false;
  }
};

// Executar teste
testBitrixConnection().then(success => {
  process.exit(success ? 0 : 1);
});
