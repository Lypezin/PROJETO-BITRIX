// src/services/bitrixApi.ts

import axios from 'axios';
import { 
  RESPONSIBLE_USERS, 
  CUSTOM_FIELDS, 
  formatDateTimeForBitrix 
} from '../config/bitrix';

// Adicionado rate limiting para não sobrecarregar a API
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
    try {
      // 1. Buscar todos os contatos relevantes (esta chamada pode ser lenta)
      console.log('🔄 Iniciando busca de TODOS os contatos para filtragem manual...');
      const allContacts = await this.fetchAllContactsWithPagination();
      console.log(`✅ ${allContacts.length} contatos encontrados. Iniciando filtragem...`);

      // 2. Inicializar métricas
      const metrics: DashboardMetrics = {
        totalEnviados: 0,
        totalLiberados: 0,
        responsaveis: {}
      };
      for (const name of Object.keys(RESPONSIBLE_USERS)) {
        metrics.responsaveis[name] = { enviados: 0, liberados: 0 };
      }
      
      // Mapear ID para Nome para facilitar a busca
      const responsibleUserIds = Object.entries(RESPONSIBLE_USERS).reduce((acc, [name, id]) => {
        acc[id] = name;
        return acc;
      }, {} as { [key: number]: string });

      // 3. Filtrar manualmente
      for (const contact of allContacts) {
        // Checar Enviados
        const envioDateStr = contact[CUSTOM_FIELDS.DATA_ENVIO];
        if (envioDateStr) {
          const envioDate = new Date(envioDateStr);
          // O filtro de data já vem como objeto Date do hook
          if (envioDate >= dataEnvioStart && envioDate <= dataEnvioEnd) {
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
          const liberacaoDate = new Date(liberacaoDateStr);
          if (liberacaoDate >= dataLiberacaoStart && liberacaoDate <= dataLiberacaoEnd) {
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
    }
  }

  private async fetchAllContactsWithPagination(): Promise<any[]> {
    const allContacts: any[] = [];
    let start = 0;
    const limit = 50; // Limite padrão da API do Bitrix24

    while (true) {
      await this.waitForRateLimit(); // Respeitar o rate limit
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

      // CRITICAL FIX: The loop must terminate if no more contacts are returned,
      // regardless of whether a 'next' value is present.
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

  private async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;

    if (timeSinceLastCall < RATE_LIMIT_MS) {
      const waitTime = RATE_LIMIT_MS - timeSinceLastCall;
      // console.log(`Aguardando ${waitTime}ms para respeitar o rate limit...`); // Removido para limpar o console
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastApiCall = Date.now();
  }
}

export const bitrixApi = new BitrixApiService();