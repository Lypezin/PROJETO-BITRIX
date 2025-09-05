import axios from 'axios';
import { 
  RESPONSIBLE_USERS, 
  CUSTOM_FIELDS, 
  createDateFilter,
  formatDateTimeForBitrix 
} from '../config/bitrix';

export interface ContactData {
  ID: string;
  NAME: string;
  SECOND_NAME: string;
  LAST_NAME: string;
  PHONE: Array<{ VALUE: string; VALUE_TYPE: string }>;
  EMAIL: Array<{ VALUE: string; VALUE_TYPE: string }>;
  [key: string]: any;
}

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

class BitrixApiService {
  private baseUrl = '/api/bitrix-proxy';

  // Método para descoberta de IDs (configuração inicial)
  async discoverIds() {
    try {
      // Buscar usuários
      const usersResponse = await this.callBitrixMethod('user.search', {
        ACTIVE: 'Y',
        ADMIN: 'N'
      });

      // Buscar campos personalizados
      const fieldsResponse = await this.callBitrixMethod('crm.contact.fields');

      return {
        users: usersResponse.result,
        fields: fieldsResponse.result
      };
    } catch (error) {
      console.error('Erro na descoberta de IDs:', error);
      throw error;
    }
  }

  // Obter métricas do dashboard (otimizado com batch)
  async getDashboardMetrics(startDate: Date, endDate: Date): Promise<DashboardMetrics> {
    try {
      // Usar método direto em vez de batch para evitar problemas
      const metrics: DashboardMetrics = {
        totalEnviados: 0,
        totalLiberados: 0,
        responsaveis: {}
      };

      // Inicializar responsáveis
      Object.keys(RESPONSIBLE_USERS).forEach(name => {
        metrics.responsaveis[name] = { enviados: 0, liberados: 0 };
      });

      // Contar enviados total
      const enviadosResponse = await this.callBitrixMethod('crm.contact.list', {
        filter: this.createDateFilter(CUSTOM_FIELDS.DATA_ENVIO, startDate, endDate),
        select: ['ID'],
        start: -1
      });
      metrics.totalEnviados = enviadosResponse.total || 0;

      // Contar liberados total
      const liberadosResponse = await this.callBitrixMethod('crm.contact.list', {
        filter: this.createDateFilter(CUSTOM_FIELDS.DATA_LIBERACAO, startDate, endDate),
        select: ['ID'],
        start: -1
      });
      metrics.totalLiberados = liberadosResponse.total || 0;

      // Contar por responsável
      for (const [name, userId] of Object.entries(RESPONSIBLE_USERS)) {
        // Enviados por responsável
        const enviadosResp = await this.callBitrixMethod('crm.contact.list', {
          filter: {
            ...this.createDateFilter(CUSTOM_FIELDS.DATA_ENVIO, startDate, endDate),
            'ASSIGNED_BY_ID': userId.toString()
          },
          select: ['ID'],
          start: -1
        });
        metrics.responsaveis[name].enviados = enviadosResp.total || 0;

        // Liberados por responsável
        const liberadosResp = await this.callBitrixMethod('crm.contact.list', {
          filter: {
            ...this.createDateFilter(CUSTOM_FIELDS.DATA_LIBERACAO, startDate, endDate),
            'ASSIGNED_BY_ID': userId.toString()
          },
          select: ['ID'],
          start: -1
        });
        metrics.responsaveis[name].liberados = liberadosResp.total || 0;
      }

      return metrics;
    } catch (error) {
      console.error('Erro ao obter métricas do dashboard:', error);
      throw error;
    }
  }

  // Obter lista de contatos para exportação
  async getContactsForExport(
    startDate: Date, 
    endDate: Date, 
    responsavelId?: number
  ): Promise<ContactData[]> {
    try {
      const allContacts: ContactData[] = [];
      let start = 0;
      const limit = 50;

      while (true) {
        const filter = this.createContactFilter(startDate, endDate, responsavelId);
        
        const response = await this.callBitrixMethod('crm.contact.list', {
          ...filter,
          start,
          order: { ID: 'DESC' },
          select: [
            'ID', 'NAME', 'SECOND_NAME', 'LAST_NAME', 'PHONE', 'EMAIL',
            CUSTOM_FIELDS.DATA_ENVIO,
            CUSTOM_FIELDS.DATA_LIBERACAO,
            CUSTOM_FIELDS.STATUS,
            'ASSIGNED_BY_ID',
            'DATE_CREATE',
            'DATE_MODIFY'
          ]
        });

        if (!response.result || response.result.length === 0) {
          break;
        }

        allContacts.push(...response.result);
        
        if (response.result.length < limit) {
          break;
        }
        
        start += limit;
      }

      return allContacts;
    } catch (error) {
      console.error('Erro ao obter contatos para exportação:', error);
      throw error;
    }
  }


  // Criar filtro de data para o Bitrix24
  private createDateFilter(field: string, startDate: Date, endDate: Date) {
    const start = formatDateTimeForBitrix(startDate);
    const end = formatDateTimeForBitrix(endDate);
    
    return {
      [`>=${field}`]: start,
      [`<=${field}`]: end,
    };
  }

  // Criar filtro para busca de contatos
  private createContactFilter(startDate: Date, endDate: Date, responsavelId?: number) {
    const filter: any = {
      ...this.createDateFilter(CUSTOM_FIELDS.DATA_ENVIO, startDate, endDate),
      'LOGIC': 'OR',
      [`>=${CUSTOM_FIELDS.DATA_LIBERACAO}`]: formatDateTimeForBitrix(startDate),
      [`<=${CUSTOM_FIELDS.DATA_LIBERACAO}`]: formatDateTimeForBitrix(endDate),
    };

    if (responsavelId) {
      filter['ASSIGNED_BY_ID'] = responsavelId.toString();
    }

    return { filter };
  }


  // Chamada genérica para métodos do Bitrix24
  private async callBitrixMethod(method: string, params: any = {}) {
    try {
      const response = await axios.post(this.baseUrl, {
        method,
        params
      });

      if (response.data.error) {
        throw new Error(`Erro do Bitrix24: ${response.data.error_description}`);
      }

      return response.data;
    } catch (error) {
      console.error(`Erro na chamada ${method}:`, error);
      throw error;
    }
  }
}

export const bitrixApi = new BitrixApiService();
