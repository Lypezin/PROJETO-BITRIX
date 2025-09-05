import { bitrixApi } from '../services/bitrixApi';

// Script para descoberta inicial de IDs do Bitrix24
export const setupBitrixIds = async () => {
  try {
    console.log('🔍 Iniciando descoberta de IDs do Bitrix24...');
    
    const { users, fields } = await bitrixApi.discoverIds();
    
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
export const testConnection = async () => {
  try {
    console.log('🔌 Testando conexão com Bitrix24...');
    
    const response = await bitrixApi.discoverIds();
    
    if (response.users && response.fields) {
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
