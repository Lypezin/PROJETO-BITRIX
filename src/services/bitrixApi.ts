// src/services/bitrixApi.ts
import axios from 'axios';
import { RESPONSIBLE_USERS, CUSTOM_FIELDS, STATUS_VALUES } from '../config/bitrix';

const RATE_LIMIT_MS = 500;
let lastApiCall = 0;

const formatDateTimeForBitrix = (date: Date): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

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
      totalEnviados: number;
      totalLiberados: number;
      enviadosPorCidade: { [cidade: string]: number };
      liberadosPorCidade: { [cidade: string]: number };
    };
  };
}

class BitrixApiService {
  private baseUrl = '/api/bitrix-proxy';
  private isFetchingMetrics = false;
  private cityFieldCache: { [key: string]: string } | null = null;

  private async getCityNameFromId(cityId: string): Promise<string> {
    if (!this.cityFieldCache) {
      try {
        console.log('🔄 Buscando mapeamento de IDs de cidade...');
        const response = await this.callBitrixMethod('crm.contact.fields');
        const cityFieldData = response.result[CUSTOM_FIELDS.CIDADE];
        
        if (cityFieldData && cityFieldData.items) {
          this.cityFieldCache = cityFieldData.items.reduce((acc: any, item: any) => {
            acc[item.ID] = item.VALUE;
            return acc;
          }, {});
          console.log('✅ Mapeamento de cidades carregado e cacheado.');
        } else {
          this.cityFieldCache = {}; // Cache vazio para evitar novas tentativas
        }
      } catch (error) {
        console.error("Erro ao buscar mapeamento de cidades:", error);
        this.cityFieldCache = {}; // Previne chamadas repetidas em caso de erro
        return "Erro Cidades";
      }
    }
    if (this.cityFieldCache && this.cityFieldCache[cityId]) {
      return this.cityFieldCache[cityId];
    }
    return cityId;
  }

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
      const enviadosFilter = {
        [`>=${CUSTOM_FIELDS.DATA_ENVIO}`]: formatDateTimeForBitrix(dataEnvioStart),
        [`<=${CUSTOM_FIELDS.DATA_ENVIO}`]: formatDateTimeForBitrix(dataEnvioEnd),
        [`!=${CUSTOM_FIELDS.STATUS}`]: STATUS_VALUES.EXCLUIR_ENVIO,
      };
      const liberadosFilter = {
        [`>=${CUSTOM_FIELDS.DATA_LIBERACAO}`]: formatDateTimeForBitrix(dataLiberacaoStart),
        [`<=${CUSTOM_FIELDS.DATA_LIBERACAO}`]: formatDateTimeForBitrix(dataLiberacaoEnd),
      };

      const selectFields = ['ID', 'ASSIGNED_BY_ID', CUSTOM_FIELDS.CIDADE];

      console.log('🔄 Iniciando busca de contatos ENVIADOS...');
      const enviadosContacts = await this.fetchContactsByFilter(enviadosFilter, selectFields);
      console.log(`✅ ${enviadosContacts.length} contatos ENVIADOS encontrados.`);

      console.log('🔄 Iniciando busca de contatos LIBERADOS...');
      const liberadosContacts = await this.fetchContactsByFilter(liberadosFilter, selectFields);
      console.log(`✅ ${liberadosContacts.length} contatos LIBERADOS encontrados.`);

      const metrics: DashboardMetrics = {
        totalEnviados: enviadosContacts.length,
        totalLiberados: liberadosContacts.length,
        responsaveis: {}
      };
      for (const name of Object.keys(RESPONSIBLE_USERS)) {
        metrics.responsaveis[name] = { 
          totalEnviados: 0, 
          totalLiberados: 0,
          enviadosPorCidade: {},
          liberadosPorCidade: {},
        };
      }
      const responsibleUserIds = Object.entries(RESPONSIBLE_USERS).reduce((acc, [name, id]) => {
        acc[id.toString()] = name;
        return acc;
      }, {} as { [key: string]: string });

      for (const contact of enviadosContacts) {
        const responsibleName = responsibleUserIds[contact.ASSIGNED_BY_ID];
        if (responsibleName && metrics.responsaveis[responsibleName]) {
          metrics.responsaveis[responsibleName].totalEnviados++;
          const cityId = contact[CUSTOM_FIELDS.CIDADE];
          const cidade = cityId ? await this.getCityNameFromId(cityId) : 'Não especificado';
          metrics.responsaveis[responsibleName].enviadosPorCidade[cidade] = 
            (metrics.responsaveis[responsibleName].enviadosPorCidade[cidade] || 0) + 1;
        }
      }

      for (const contact of liberadosContacts) {
        const responsibleName = responsibleUserIds[contact.ASSIGNED_BY_ID];
        if (responsibleName && metrics.responsaveis[responsibleName]) {
          metrics.responsaveis[responsibleName].totalLiberados++;
          const cityId = contact[CUSTOM_FIELDS.CIDADE];
          const cidade = cityId ? await this.getCityNameFromId(cityId) : 'Não especificado';
          metrics.responsaveis[responsibleName].liberadosPorCidade[cidade] = 
            (metrics.responsaveis[responsibleName].liberadosPorCidade[cidade] || 0) + 1;
        }
      }
      
      console.log('📊 Métricas FINAIS calculadas (server-side filter):', metrics);
      return metrics;

    } catch (error) {
      console.error('Erro ao obter métricas do dashboard:', error);
      throw error;
    } finally {
      this.isFetchingMetrics = false;
    }
  }

  private async fetchContactsByFilter(filter: any, select: string[]): Promise<any[]> {
    const allContacts: any[] = [];
    let start = 0;
    const limit = 50;

    while (true) {
      await this.waitForRateLimit();
      const response = await this.callBitrixMethod('crm.contact.list', {
        start: start,
        limit: limit,
        filter: filter,
        select: select,
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