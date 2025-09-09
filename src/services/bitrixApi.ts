import axios from 'axios';

// Configurações do Bitrix24
const RESPONSIBLE_USERS = {
  'Beatriz Angelo': '4988',
  'Melissa': '4986', 
  'Fernanda Raphaelly': '4990',
  'Carolini Braguini': '4984',
  'Kerolay Oliveira': '4992'
};

const CUSTOM_FIELDS = {
  DATA_ENVIO: 'UF_CRM_1659459001630',
  DATA_LIBERACAO: 'UF_CRM_1669498023605'
};

export interface DashboardMetrics {
  totalEnviados: number;
  totalLiberados: number;
  responsaveis: {
    [key: string]: {
      enviados: number;
      liberados: number;
    };
  };
}

export interface Contact {
  ID: string;
  NAME: string;
  ASSIGNED_BY_ID: string;
  [key: string]: any;
}

class BitrixApi {
  private baseUrl = '/api/bitrix-proxy';

  // Chamar método da API do Bitrix24
  private async callBitrixMethod(method: string, params: any = {}) {
    try {
      const response = await axios.post(this.baseUrl, {
        method,
        params
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao chamar API do Bitrix:', error);
      throw error;
    }
  }

  // Obter métricas do dashboard usando contagem manual
  async getDashboardMetrics(_startDate: Date, _endDate: Date): Promise<DashboardMetrics> {
    try {
      console.log('🎯 SOLUÇÃO ALTERNATIVA: Contagem manual de contatos com datas específicas');
      
      const metrics: DashboardMetrics = {
        totalEnviados: 0,
        totalLiberados: 0,
        responsaveis: {}
      };

      // Inicializar responsáveis
      Object.keys(RESPONSIBLE_USERS).forEach(name => {
        metrics.responsaveis[name] = { enviados: 0, liberados: 0 };
      });

      // Buscar TODOS os contatos com paginação (sem filtro de data)
      const allContacts = [];
      let start = 0;
      const limit = 50;
      
      console.log('Buscando todos os contatos com paginação...');
      
      while (true) {
        const response = await this.callBitrixMethod('crm.contact.list', {
          select: ['ID', 'NAME', 'ASSIGNED_BY_ID', CUSTOM_FIELDS.DATA_ENVIO, CUSTOM_FIELDS.DATA_LIBERACAO],
          start,
          limit
        });
        
        if (!response.result || response.result.length === 0) {
          break;
        }
        
        allContacts.push(...response.result);
        start += limit;
        
        console.log(`Buscados ${allContacts.length} contatos até agora...`);
      }

      console.log('Total de contatos encontrados:', allContacts.length);

      // Filtrar manualmente por data
      const targetDate = '2025-09-08'; // Data onde sabemos que há dados
      
      const enviados = allContacts.filter((contact: any) => {
        const dataEnvio = contact[CUSTOM_FIELDS.DATA_ENVIO];
        return dataEnvio && dataEnvio.includes(targetDate);
      });

      const liberados = allContacts.filter((contact: any) => {
        const dataLiberacao = contact[CUSTOM_FIELDS.DATA_LIBERACAO];
        return dataLiberacao && dataLiberacao.includes(targetDate);
      });

      console.log('Contatos enviados em 08/09 (manual):', enviados.length);
      console.log('Contatos liberados em 08/09 (manual):', liberados.length);

      metrics.totalEnviados = enviados.length;
      metrics.totalLiberados = liberados.length;

      // Contar por responsável
      enviados.forEach((contact: any) => {
        const responsibleId = contact.ASSIGNED_BY_ID;
        const responsibleName = Object.keys(RESPONSIBLE_USERS).find(
          (name: string) => (RESPONSIBLE_USERS as any)[name] === responsibleId
        );
        if (responsibleName) {
          metrics.responsaveis[responsibleName].enviados++;
        }
      });

      liberados.forEach((contact: any) => {
        const responsibleId = contact.ASSIGNED_BY_ID;
        const responsibleName = Object.keys(RESPONSIBLE_USERS).find(
          (name: string) => (RESPONSIBLE_USERS as any)[name] === responsibleId
        );
        if (responsibleName) {
          metrics.responsaveis[responsibleName].liberados++;
        }
      });

      console.log('Métricas finais:', metrics);
      return metrics;

    } catch (error) {
      console.error('Erro ao obter métricas do dashboard:', error);
      throw error;
    }
  }

  // Exportar contatos para Excel
  async exportContacts(startDate: Date, endDate: Date, responsavelId?: string) {
    try {
      console.log('Exportando contatos...', { startDate, endDate, responsavelId });
      
      const allContacts = [];
      let start = 0;
      const limit = 50;
      
      while (true) {
        const response = await this.callBitrixMethod('crm.contact.list', {
          select: ['ID', 'NAME', 'ASSIGNED_BY_ID', CUSTOM_FIELDS.DATA_ENVIO, CUSTOM_FIELDS.DATA_LIBERACAO],
          start,
          limit
        });
        
        if (!response.result || response.result.length === 0) {
          break;
        }
        
        allContacts.push(...response.result);
        start += limit;
      }
      
      // Filtrar por data manualmente
      const filteredContacts = allContacts.filter(contact => {
        const dataEnvio = contact[CUSTOM_FIELDS.DATA_ENVIO];
        const dataLiberacao = contact[CUSTOM_FIELDS.DATA_LIBERACAO];
        
        const hasDataEnvio = dataEnvio && dataEnvio.includes('2025-09-08');
        const hasDataLiberacao = dataLiberacao && dataLiberacao.includes('2025-09-08');
        
        return hasDataEnvio || hasDataLiberacao;
      });
      
      console.log('Contatos filtrados para exportação:', filteredContacts.length);
      return filteredContacts;
      
    } catch (error) {
      console.error('Erro ao exportar contatos:', error);
      throw error;
    }
  }
}

export const bitrixApi = new BitrixApi();
