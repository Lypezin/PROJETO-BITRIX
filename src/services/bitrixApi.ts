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

  async getDashboardMetrics(
    dataEnvioStart: Date, 
    dataEnvioEnd: Date, 
    dataLiberacaoStart: Date, 
    dataLiberacaoEnd: Date
  ): Promise<DashboardMetrics> {
    try {
      const commands: { [key: string]: string } = {};

      const createFilterString = (field: string, start: Date, end: Date, userId?: number) => {
        // Use "menor que o dia seguinte" para robustez de fuso horário
        const startOfDay = new Date(start);
        startOfDay.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(end);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        
        let filter = `filter[>=${field}]=${encodeURIComponent(formatDateTimeForBitrix(startOfDay))}&filter[<${field}]=${encodeURIComponent(formatDateTimeForBitrix(nextDay))}`;
        if (userId) {
          filter += `&filter[ASSIGNED_BY_ID]=${userId}`;
        }
        return `crm.contact.list?start=0&limit=1000&${filter}`;
      };

      // Enviados baseados na Data de Envio
      commands['enviados_count'] = createFilterString(CUSTOM_FIELDS.DATA_ENVIO, dataEnvioStart, dataEnvioEnd);
      
      // Liberados baseados na Data de Liberação
      commands['liberados_count'] = createFilterString(CUSTOM_FIELDS.DATA_LIBERACAO, dataLiberacaoStart, dataLiberacaoEnd);

      // Por responsável - enviados pela Data de Envio, liberados pela Data de Liberação
      for (const [name, userId] of Object.entries(RESPONSIBLE_USERS)) {
        commands[`enviados_${name}`] = createFilterString(CUSTOM_FIELDS.DATA_ENVIO, dataEnvioStart, dataEnvioEnd, userId);
        commands[`liberados_${name}`] = createFilterString(CUSTOM_FIELDS.DATA_LIBERACAO, dataLiberacaoStart, dataLiberacaoEnd, userId);
      }
      
      const response = await this.callBitrixMethod('batch', { cmd: commands });
      
      // CORREÇÃO FINAL: result_total TEM OS VALORES CORRETOS!
      const resultTotals = response.result.result_total;
      
      // USAR result_total que está funcionando perfeitamente!
      const metrics: DashboardMetrics = {
        totalEnviados: resultTotals.enviados_count || 0,
        totalLiberados: resultTotals.liberados_count || 0,
        responsaveis: {}
      };

      // Usar result_total para responsáveis também
      for (const name of Object.keys(RESPONSIBLE_USERS)) {
          const enviadosKey = `enviados_${name}`;
          const liberadosKey = `liberados_${name}`;
          
          metrics.responsaveis[name] = {
              enviados: resultTotals[enviadosKey] || 0,
              liberados: resultTotals[liberadosKey] || 0,
          };
      }
      return metrics;

    } catch (error) {
      console.error('Erro ao obter métricas do dashboard:', error);
      throw error;
    }
  }

  async getContactsForExport(
    startDate: Date, 
    endDate: Date
  ): Promise<ContactData[]> {
    try {
      const allContacts: ContactData[] = [];
      let start = 0;
      const limit = 50;

      const filter = this.createContactFilter(startDate, endDate);

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

  private createContactFilter(startDate: Date, endDate: Date) {
    // Use "menor que o dia seguinte" para consistência
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    
    // Filtrar apenas pela Data de Envio para exportação
    const filter: any = {
      [`>=${CUSTOM_FIELDS.DATA_ENVIO}`]: formatDateTimeForBitrix(startOfDay),
      [`<${CUSTOM_FIELDS.DATA_ENVIO}`]: formatDateTimeForBitrix(nextDay),
    };

    return filter;
  }

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