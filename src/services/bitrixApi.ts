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
    console.log('🚀 getDashboardMetrics INICIADO:', { startDate, endDate });
    
    // TESTE TEMPORÁRIO: Forçar data 08/09/2025 que sabemos que tem dados
    const testStartDate = new Date('2025-09-08');
    const testEndDate = new Date('2025-09-08');
    console.log('🧪 TESTE: Forçando data 08/09/2025 para verificar se há dados');
    
    try {
      const commands: { [key: string]: string } = {};

      const createFilterString = (field: string, start: Date, end: Date, userId?: number) => {
        // CORREÇÃO CRUCIAL: Use "menor que o dia seguinte" em vez de "menor igual a 23:59:59"
        // Isso é mais robusto e à prova de fuso horário
        const startOfDay = new Date(start);
        startOfDay.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(end);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        
        let filter = `filter[>=${field}]=${encodeURIComponent(formatDateTimeForBitrix(startOfDay))}&filter[<${field}]=${encodeURIComponent(formatDateTimeForBitrix(nextDay))}`;
        if (userId) {
          filter += `&filter[ASSIGNED_BY_ID]=${userId}`;
        }
        return `crm.contact.list?start=-1&${filter}`;
      };

      commands['enviados_count'] = createFilterString(CUSTOM_FIELDS.DATA_ENVIO, testStartDate, testEndDate);
      commands['liberados_count'] = createFilterString(CUSTOM_FIELDS.DATA_LIBERACAO, testStartDate, testEndDate);

      for (const [name, userId] of Object.entries(RESPONSIBLE_USERS)) {
        commands[`enviados_${name}`] = createFilterString(CUSTOM_FIELDS.DATA_ENVIO, testStartDate, testEndDate, userId);
        commands[`liberados_${name}`] = createFilterString(CUSTOM_FIELDS.DATA_LIBERACAO, testStartDate, testEndDate, userId);
      }
      
      console.log('📊 Comandos do batch construídos:', commands);
      console.log('🔗 Chamando API Bitrix...');
      
      const response = await this.callBitrixMethod('batch', { cmd: commands });
      
      console.log('✅ Resposta recebida:', response);
      console.log('🔍 Resposta completa detalhada:', JSON.stringify(response, null, 2));
      
      const resultTotals = response.result.result_total;
      
      console.log('🎯 Result totals recebidos:', resultTotals);

      const metrics: DashboardMetrics = {
        totalEnviados: resultTotals.enviados_count || 0,
        totalLiberados: resultTotals.liberados_count || 0,
        responsaveis: {}
      };

      console.log('📈 Totais principais:', {
        totalEnviados: metrics.totalEnviados,
        totalLiberados: metrics.totalLiberados
      });

      for (const name of Object.keys(RESPONSIBLE_USERS)) {
          metrics.responsaveis[name] = {
              enviados: resultTotals[`enviados_${name}`] || 0,
              liberados: resultTotals[`liberados_${name}`] || 0,
          };
      }

      console.log('🎯 Métricas finais calculadas:', metrics);
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
    // CORREÇÃO CRUCIAL: Use "menor que o dia seguinte" para consistência
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    
    const filter: any = {
      'LOGIC': 'OR',
      // Use >= startOfDay e < nextDay para cada campo
      '0': {
        [`>=${CUSTOM_FIELDS.DATA_ENVIO}`]: formatDateTimeForBitrix(startOfDay),
        [`<${CUSTOM_FIELDS.DATA_ENVIO}`]: formatDateTimeForBitrix(nextDay),
      },
      '1': {
        [`>=${CUSTOM_FIELDS.DATA_LIBERACAO}`]: formatDateTimeForBitrix(startOfDay),
        [`<${CUSTOM_FIELDS.DATA_LIBERACAO}`]: formatDateTimeForBitrix(nextDay),
      }
    };

    if (responsavelId) {
      filter['ASSIGNED_BY_ID'] = responsavelId.toString();
    }

    return filter;
  }

  private async callBitrixMethod(method: string, params: any = {}) {
    console.log(`🔗 Chamando método ${method} com params:`, params);
    
    try {
      const requestData = {
        method,
        params
      };
      
      console.log('📤 Enviando para proxy:', this.baseUrl, requestData);
      
      const response = await axios.post(this.baseUrl, requestData);
      
      console.log('📥 Resposta do proxy recebida:', response.status, response.data);

      if (response.data.error) {
        console.error('❌ Erro do Bitrix24:', response.data.error_description);
        throw new Error(`Erro do Bitrix24: ${response.data.error_description}`);
      }

      return response.data;
    } catch (error) {
      console.error(`❌ Erro na chamada ${method}:`, error);
      throw error;
    }
  }
}

export const bitrixApi = new BitrixApiService();