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
      const batchCommands = [];
      
      // Comandos para contagem total de enviados e liberados
      batchCommands.push(
        this.createCountCommand('enviados', startDate, endDate),
        this.createCountCommand('liberados', startDate, endDate)
      );

      // Comandos para cada responsável
      Object.entries(RESPONSIBLE_USERS).forEach(([, userId]) => {
        batchCommands.push(
          this.createCountCommand('enviados', startDate, endDate, userId),
          this.createCountCommand('liberados', startDate, endDate, userId)
        );
      });

      const response = await this.callBitrixMethod('batch', {
        cmd: batchCommands
      });

      return this.parseBatchResponse(response.result, Object.keys(RESPONSIBLE_USERS));
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

  // Criar comando de contagem para batch
  private createCountCommand(
    type: 'enviados' | 'liberados', 
    startDate: Date, 
    endDate: Date, 
    responsavelId?: number
  ) {
    const field = type === 'enviados' ? CUSTOM_FIELDS.DATA_ENVIO : CUSTOM_FIELDS.DATA_LIBERACAO;
    const filter = createDateFilter(field, startDate, endDate);
    
    if (responsavelId) {
      filter['ASSIGNED_BY_ID'] = responsavelId.toString();
    }

    return {
      [`crm.contact.list.${type}${responsavelId ? `.${responsavelId}` : ''}`]: {
        filter,
        select: ['ID'],
        start: -1
      }
    };
  }

  // Criar filtro para busca de contatos
  private createContactFilter(startDate: Date, endDate: Date, responsavelId?: number) {
    const filter: any = {
      ...createDateFilter(CUSTOM_FIELDS.DATA_ENVIO, startDate, endDate),
      'LOGIC': 'OR',
      [`>=${CUSTOM_FIELDS.DATA_LIBERACAO}`]: formatDateTimeForBitrix(startDate),
      [`<=${CUSTOM_FIELDS.DATA_LIBERACAO}`]: formatDateTimeForBitrix(endDate),
    };

    if (responsavelId) {
      filter['ASSIGNED_BY_ID'] = responsavelId.toString();
    }

    return { filter };
  }

  // Parsear resposta do batch
  private parseBatchResponse(batchResult: any, responsaveisNames: string[]): DashboardMetrics {
    const metrics: DashboardMetrics = {
      totalEnviados: 0,
      totalLiberados: 0,
      responsaveis: {}
    };

    // Inicializar responsáveis
    responsaveisNames.forEach(name => {
      metrics.responsaveis[name] = { enviados: 0, liberados: 0 };
    });

    // Processar resultados do batch
    Object.entries(batchResult).forEach(([key, value]: [string, any]) => {
      const count = value?.total || 0;
      
      if (key.includes('enviados')) {
        if (key.includes('.')) {
          // É de um responsável específico
          const responsavelId = key.split('.').pop();
          const responsavelName = Object.entries(RESPONSIBLE_USERS)
            .find(([, id]) => id.toString() === responsavelId)?.[0];
          if (responsavelName) {
            metrics.responsaveis[responsavelName].enviados = count;
          }
        } else {
          // Total geral
          metrics.totalEnviados = count;
        }
      } else if (key.includes('liberados')) {
        if (key.includes('.')) {
          // É de um responsável específico
          const responsavelId = key.split('.').pop();
          const responsavelName = Object.entries(RESPONSIBLE_USERS)
            .find(([, id]) => id.toString() === responsavelId)?.[0];
          if (responsavelName) {
            metrics.responsaveis[responsavelName].liberados = count;
          }
        } else {
          // Total geral
          metrics.totalLiberados = count;
        }
      }
    });

    return metrics;
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
