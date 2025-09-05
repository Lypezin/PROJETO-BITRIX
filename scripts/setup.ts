import axios from 'axios';

// Script para descoberta inicial de IDs do Bitrix24
const setupBitrixIds = async () => {
  try {
    console.log('🔍 Iniciando descoberta de IDs do Bitrix24...');
    
    const webhookUrl = process.env.BITRIX_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('❌ BITRIX_WEBHOOK_URL não configurada');
      return;
    }

    // Buscar usuários
    const usersResponse = await axios.post(webhookUrl, {
      method: 'user.search',
      params: {
        ACTIVE: 'Y',
        ADMIN: 'N'
      }
    });

    // Buscar campos personalizados
    const fieldsResponse = await axios.post(webhookUrl, {
      method: 'crm.contact.fields',
      params: {}
    });
    
    const users = usersResponse.data.result;
    const fields = fieldsResponse.data.result;
    
    console.log('👥 Usuários encontrados:');
    Object.entries(users).forEach(([id, user]: [string, any]) => {
      console.log(`  ${user.NAME} ${user.LAST_NAME} - ID: ${id}`);
    });
    
    console.log('\n📋 Campos personalizados encontrados:');
    Object.entries(fields).forEach(([key, field]: [string, any]) => {
      if (key.startsWith('UF_CRM_')) {
        console.log(`  ${field.title} - ${key}`);
      }
    });
    
    // Identificar campos específicos
    const dataEnvioField = Object.entries(fields).find(([key, field]: [string, any]) => 
      field.title === 'Data de Envio'
    );
    
    const dataLiberacaoField = Object.entries(fields).find(([key, field]: [string, any]) => 
      field.title === 'Data de Liberação*'
    );
    
    const statusField = Object.entries(fields).find(([key, field]: [string, any]) => 
      field.title === 'Status'
    );
    
    console.log('\n🎯 Campos identificados:');
    if (dataEnvioField) {
      console.log(`  Data de Envio: ${dataEnvioField[0]}`);
    }
    if (dataLiberacaoField) {
      console.log(`  Data de Liberação*: ${dataLiberacaoField[0]}`);
    }
    if (statusField) {
      console.log(`  Status: ${statusField[0]}`);
    }
    
    // Identificar usuários responsáveis
    const responsaveis = [
      'Carolini Braguini',
      'Melissa',
      'Beatriz Angelo', 
      'Fernanda Raphaelly',
      'Kerolay Oliveira'
    ];
    
    console.log('\n👤 Responsáveis identificados:');
    responsaveis.forEach(nome => {
      const user = Object.entries(users).find(([id, user]: [string, any]) => 
        user.NAME === nome.split(' ')[0] && 
        (user.LAST_NAME === nome.split(' ')[1] || nome.split(' ').length === 1)
      );
      
      if (user) {
        console.log(`  ${nome}: ${user[0]}`);
      } else {
        console.log(`  ${nome}: NÃO ENCONTRADO`);
      }
    });
    
    console.log('\n✅ Descoberta concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Atualize os IDs no arquivo src/config/bitrix.ts');
    console.log('2. Verifique se os campos personalizados estão corretos');
    console.log('3. Teste a aplicação');
    
  } catch (error) {
    console.error('❌ Erro na descoberta de IDs:', error);
  }
};

// Função para testar a conexão
const testConnection = async () => {
  try {
    console.log('🔌 Testando conexão com Bitrix24...');
    
    const webhookUrl = process.env.BITRIX_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('❌ BITRIX_WEBHOOK_URL não configurada');
      return false;
    }

    const response = await axios.post(webhookUrl, {
      method: 'user.search',
      params: {
        ACTIVE: 'Y',
        ADMIN: 'N'
      }
    });
    
    if (response.data.result) {
      console.log('✅ Conexão estabelecida com sucesso!');
      return true;
    } else {
      console.log('❌ Resposta inválida do Bitrix24');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    return false;
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  setupBitrixIds();
}

export { setupBitrixIds, testConnection };
