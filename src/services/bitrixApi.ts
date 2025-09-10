// src/services/bitrixApi.ts
import axios from 'axios';
import { RESPONSIBLE_USERS, CUSTOM_FIELDS } from '../config/bitrix';

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
  private isFetchingMetrics = false;

  async getDashboardMetrics(
    dataEnvioStart: Date,
    dataEnvioEnd: Date,
    dataLiberacaoStart: Date,
    dataLiberacaoEnd: Date
  ): Promise<DashboardMetrics> {
    if (this.isFetchingMetrics) {
      console.warn('⚠️ Fetch de métricas já em andamento. Nova chamada ignorada.');
      return Promise.reject(new Error('Fetch in progress'));
    }

    this.isFetchingMetrics = true;
    try {
      console.log('🔄 Iniciando busca de TODOS os contatos para filtragem manual...');
      const allContacts = await this.fetchAllContactsWithPagination();
      console.log(`✅ ${allContacts.length} contatos encontrados. Iniciando filtragem...`);

      const metrics: DashboardMetrics = {
        totalEnviados: 0,
        totalLiberados: 0,
        responsaveis: {}
      };
      for (const name of Object.keys(RESPONSIBLE_USERS)) {
        metrics.responsaveis[name] = { enviados: 0, liberados: 0 };
      }

      const responsibleUserIds = Object.entries(RESPONSIBLE_USERS).reduce((acc, [name, id]) => {
        acc[id] = name;
        return acc;
      }, {} as { [key: number]: string });

      for (const contact of allContacts) {
        // Checar Enviados
        const envioDateStr = contact[CUSTOM_FIELDS.DATA_ENVIO];
        if (envioDateStr) {
          const envioTimestamp = new Date(envioDateStr).getTime();
          if (envioTimestamp >= dataEnvioStart.getTime() && envioTimestamp <= dataEnvioEnd.getTime()) {
            metrics.totalEnviados++;
            const responsibleName = responsibleUserIds[contact.ASSIGNED_BY_ID];
            if (responsibleName && metrics.responsaveis[responsibleName]) {
              metrics.responsaveis[responsibleName].enviados++;
            }
          }
        }

        // Checar Liberados
        const liberacaoDateStr = contact[CUSTOM_FIELDS.DATA_LIBERACAO];
        if (liberacaoDateStr) {
          const liberacaoTimestamp = new Date(liberacaoDateStr).getTime();
          if (liberacaoTimestamp >= dataLiberacaoStart.getTime() && liberacaoTimestamp <= dataLiberacaoEnd.getTime()) {
            metrics.totalLiberados++;
            const responsibleName = responsibleUserIds[contact.ASSIGNED_BY_ID];
            if (responsibleName && metrics.responsaveis[responsibleName]) {
              metrics.responsaveis[responsibleName].liberados++;
            }
          }
        }
      }

      console.log('📊 Métricas FINAIS calculadas manualmente:', metrics);
      return metrics;

    } catch (error) {
      console.error('Erro ao obter métricas do dashboard:', error);
      throw error;
    } finally {
      this.isFetchingMetrics = false;
    }
  }

  private async fetchAllContactsWithPagination(): Promise<any[]> {
    const allContacts: any[] = [];
    let start = 0;
    const limit = 50;

    while (true) {
      await this.waitForRateLimit();
      const response = await this.callBitrixMethod('crm.contact.list', {
        start: start,
        limit: limit,
        select: [
          'ID',
          'ASSIGNED_BY_ID',
          CUSTOM_FIELDS.DATA_ENVIO,
          CUSTOM_FIELDS.DATA_LIBERACAO,
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

  async getContactsForExport(
    startDate: Date,
    endDate: Date
  ): Promise<ContactData[]> {
    // A exportação agora também usará a busca completa e filtragem manual para consistência
    const allContacts = await this.fetchAllContactsWithPagination();
    const filteredContacts = allContacts.filter(contact => {
      const envioDateStr = contact[CUSTOM_FIELDS.DATA_ENVIO];
      if (!envioDateStr) return false;
      const envioDate = new Date(envioDateStr);
      return envioDate >= startDate && envioDate <= endDate;
    });
    return filteredContacts;
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