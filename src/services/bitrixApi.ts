// src/services/bitrixApi.ts

import axios from 'axios';
import { 
  RESPONSIBLE_USERS, 
  CUSTOM_FIELDS, 
  formatDateTimeForBitrix 
} from '../config/bitrix';

export interface ContactData {
  ID: string;
  NAME: string;
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

  async getDashboardMetrics(startDate: Date, endDate: Date): Promise<DashboardMetrics> {
    console.log('🚀 [bitrixApi] Iniciando getDashboardMetrics com datas:', { startDate, endDate });
    try {
      const commands: { [key: string]: string } = {};

      const createFilterString = (field: string, start: Date, end: Date, userId?: number) => {
        let filter = `filter[>=${field}]=${encodeURIComponent(formatDateTimeForBitrix(start))}&filter[<=${field}]=${encodeURIComponent(formatDateTimeForBitrix(end))}`;
        if (userId) {
          filter += `&filter[ASSIGNED_BY_ID]=${userId}`;
        }
        return `crm.contact.list?start=-1&${filter}`;
      };

      commands['enviados_count'] = createFilterString(CUSTOM_FIELDS.DATA_ENVIO, startDate, endDate);
      commands['liberados_count'] = createFilterString(CUSTOM_FIELDS.DATA_LIBERACAO, startDate, endDate);

      for (const [name, userId] of Object.entries(RESPONSIBLE_USERS)) {
        commands[`enviados_${name}`] = createFilterString(CUSTOM_FIELDS.DATA_ENVIO, startDate, endDate, userId);
        commands[`liberados_${name}`] = createFilterString(CUSTOM_FIELDS.DATA_LIBERACAO, startDate, endDate, userId);
      }
      
      const response = await this.callBitrixMethod('batch', { cmd: commands });
      
      console.log('📦 [bitrixApi] Resposta do batch recebida:', response);
      
      const resultTotals = response.result.result_total;

      const metrics: DashboardMetrics = {
        totalEnviados: resultTotals.enviados_count || 0,
        totalLiberados: resultTotals.liberados_count || 0,
        responsaveis: {}
      };

      for (const name of Object.keys(RESPONSIBLE_USERS)) {
          metrics.responsaveis[name] = {
              enviados: resultTotals[`enviados_${name}`] || 0,
              liberados: resultTotals[`liberados_${name}`] || 0,
          };
      }

      console.log('📊 [bitrixApi] Métricas calculadas:', metrics);
      return metrics;

    } catch (error) {
      console.error('Erro ao obter métricas do dashboard:', error);
      throw error;
    }
  }

  async getContactsForExport(
    startDate: Date, 
    endDate: Date, 
    responsavelId?: number
  ): Promise<ContactData[]> {
    try {
      const allContacts: ContactData[] = [];
      let start = 0;
      const limit = 50;

      const filter = this.createContactFilter(startDate, endDate, responsavelId);

      while (true) {
        const response = await this.callBitrixMethod('crm.contact.list', {
          filter,
          start,
          order: { ID: 'DESC' },
          select: [
            'ID', 'NAME', 'SECOND_NAME', 'LAST_NAME', 'PHONE', 'EMAIL',
            CUSTOM_FIELDS.DATA_ENVIO,
            CUSTOM_FIELDS.DATA_LIBERACAO,
            CUSTOM_FIELDS.STATUS,
            'ASSIGNED_BY_ID',
            'DATE_CREATE',
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

  private createContactFilter(startDate: Date, endDate: Date, responsavelId?: number) {
    const filter: any = {
      'LOGIC': 'OR',
      [`><${CUSTOM_FIELDS.DATA_ENVIO}`]: [formatDateTimeForBitrix(startDate), formatDateTimeForBitrix(endDate)],
      [`><${CUSTOM_FIELDS.DATA_LIBERACAO}`]: [formatDateTimeForBitrix(startDate), formatDateTimeForBitrix(endDate)],
    };

    if (responsavelId) {
      filter['ASSIGNED_BY_ID'] = responsavelId.toString();
    }

    return filter;
  }

  private async callBitrixMethod(method: string, params: any = {}) {
    console.log(`🔗 [bitrixApi] Chamando callBitrixMethod: ${method}`);
    try {
      const response = await axios.post(this.baseUrl, {
        method,
        params
      });
      console.log(`📥 [bitrixApi] Resposta recebida para ${method}:`, response.data);

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