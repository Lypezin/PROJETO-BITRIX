// src/services/bitrixApi.ts
import axios from 'axios';
import { RESPONSIBLE_USERS, CUSTOM_FIELDS } from '../config/bitrix';
import { formatDateTimeForBitrix } from '../utils/date';

// O rate limit não é mais tão crítico para a busca de métricas,
// mas é mantido para a função de exportação.
const RATE_LIMIT_MS = 500; // 2 chamadas por segundo
let lastApiCall = 0;

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
    
    const formattedEnvioStart = formatDateTimeForBitrix(dataEnvioStart);
    const formattedEnvioEnd = formatDateTimeForBitrix(dataEnvioEnd);
    const formattedLiberacaoStart = formatDateTimeForBitrix(dataLiberacaoStart);
    const formattedLiberacaoEnd = formatDateTimeForBitrix(dataLiberacaoEnd);

    const commands: { [key: string]: string } = {};

    // 1. Comandos para totais gerais
    commands['total_enviados'] = this.buildContactListCommand({
      [`><${CUSTOM_FIELDS.DATA_ENVIO}`]: [formattedEnvioStart, formattedEnvioEnd]
    });
    commands['total_liberados'] = this.buildContactListCommand({
      [`><${CUSTOM_FIELDS.DATA_LIBERACAO}`]: [formattedLiberacaoStart, formattedLiberacaoEnd]
    });

    // 2. Comandos por responsável
    for (const [_name, id] of Object.entries(RESPONSIBLE_USERS)) {
      const keyPrefix = `resp_${id}`;
      
      // Enviados por responsável
      commands[`${keyPrefix}_enviados`] = this.buildContactListCommand({
        'ASSIGNED_BY_ID': id,
        [`><${CUSTOM_FIELDS.DATA_ENVIO}`]: [formattedEnvioStart, formattedEnvioEnd]
      });

      // Liberados por responsável
      commands[`${keyPrefix}_liberados`] = this.buildContactListCommand({
        'ASSIGNED_BY_ID': id,
        [`><${CUSTOM_FIELDS.DATA_LIBERACAO}`]: [formattedLiberacaoStart, formattedLiberacaoEnd]
      });
    }

    try {
      console.log("🚀 Enviando comando batch otimizado para o Bitrix24...");
      const response = await this.callBitrixMethod('batch', { cmd: commands });
      console.log("✅ Resposta do batch recebida:", response);
      
      return this.processBatchResponse(response.result.result);

    } catch (error) {
      console.error('Erro ao executar o batch de métricas:', error);
      throw error;
    }
  }

  private buildContactListCommand(filter: any): string {
    const params = new URLSearchParams({
      'start': '-1', // Pega apenas o total
      'filter': JSON.stringify(filter)
    }).toString();
    // A API do batch espera os parâmetros como query string
    return `crm.contact.list?${decodeURIComponent(params)}`;
  }

  private processBatchResponse(batchResult: any): DashboardMetrics {
    const metrics: DashboardMetrics = {
      totalEnviados: batchResult.total_enviados?.total || 0,
      totalLiberados: batchResult.total_liberados?.total || 0,
      responsaveis: {},
    };

    for (const name of Object.keys(RESPONSIBLE_USERS)) {
      metrics.responsaveis[name] = { enviados: 0, liberados: 0 };
    }

    const responsibleUserIds = Object.entries(RESPONSIBLE_USERS).reduce((acc, [name, id]) => {
      acc[id.toString()] = name;
      return acc;
    }, {} as { [key: string]: string });


    for (const [key, result] of Object.entries(batchResult)) {
      if (key.startsWith('resp_')) {
        const parts = key.split('_');
        const userId = parts[1];
        const type = parts[2] as 'enviados' | 'liberados';
        const responsibleName = responsibleUserIds[userId];
        
        if (responsibleName && metrics.responsaveis[responsibleName]) {
          metrics.responsaveis[responsibleName][type] = (result as any)?.total || 0;
        }
      }
    }
    
    console.log('📊 Métricas FINAIS processadas:', metrics);
    return metrics;
  }

  // A função de exportação continua a mesma, pois precisa dos dados completos
  async getContactsForExport(
    startDate: Date,
    endDate: Date
  ): Promise<ContactData[]> {
    console.log('🔄 Iniciando busca de contatos para exportação (paginado)...');
    const allContacts = await this.fetchAllContactsWithPagination(startDate, endDate);
    console.log(`✅ ${allContacts.length} contatos encontrados para o período.`);
    return allContacts;
  }

  private async fetchAllContactsWithPagination(startDate: Date, endDate: Date): Promise<any[]> {
    const allContacts: any[] = [];
    let start = 0;
    const limit = 50;

    const formattedStart = formatDateTimeForBitrix(startDate);
    const formattedEnd = formatDateTimeForBitrix(endDate);

    while (true) {
      await this.waitForRateLimit();
      const response = await this.callBitrixMethod('crm.contact.list', {
        start: start,
        limit: limit,
        filter: {
          [`><${CUSTOM_FIELDS.DATA_ENVIO}`]: [formattedStart, formattedEnd],
        },
        select: [
          'ID', 'NAME', 'ASSIGNED_BY_ID', 
          CUSTOM_FIELDS.DATA_ENVIO, CUSTOM_FIELDS.DATA_LIBERACAO
        ],
      });

      const contacts = response.result || [];
      if (contacts.length > 0) {
        allContacts.push(...contacts);
      }
      
      if (contacts.length < limit || !response.next) {
        break;
      }
      
      start = response.next;
    }
    return allContacts;
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
  
  private async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;

    if (timeSinceLastCall < RATE_LIMIT_MS) {
      const waitTime = RATE_LIMIT_MS - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastApiCall = Date.now();
  }
}

export const bitrixApi = new BitrixApiService();