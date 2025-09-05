import axios from 'axios';
import { 
  RESPONSIBLE_USERS, 
  CUSTOM_FIELDS
} from '../config/bitrix';

/**
 * **VERSÃO FINAL E CORRIGIDA**
 * Formata um objeto Date para a string 'YYYY-MM-DD HH:MM:SS',
 * o formato mais compatível para filtros de data em APIs.
 * @param date O objeto de data a ser formatado.
 */
const formatDateForBitrix = (date: Date): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  const d = new Date(date);
  const ano = d.getFullYear();
  const mes = pad(d.getMonth() + 1);
  const dia = pad(d.getDate());
  const horas = pad(d.getHours());
  const minutos = pad(d.getMinutes());
  const segundos = pad(d.getSeconds());
  return `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
};

/**
 * Constrói um objeto de filtro de intervalo de datas para a API
 * usando a lógica de "menor que o dia seguinte" para máxima precisão.
 */
export const buildApiDateFilter = (dateRange: { from: Date; to?: Date }, fieldId: string) => {
  if (!dateRange.from) return {};

  const start = new Date(dateRange.from);
  start.setHours(0, 0, 0, 0);

  const end = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
  // Pega o dia seguinte à data final e define para o início do dia
  const nextDayStart = new Date(end);
  nextDayStart.setDate(nextDayStart.getDate() + 1);
  nextDayStart.setHours(0, 0, 0, 0);

  return {
    [`>=${fieldId}`]: formatDateForBitrix(start),
    [`<${fieldId}`]: formatDateForBitrix(nextDayStart), // Usa "<" (menor que) o início do próximo dia
  };
};

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

  // Obter métricas do dashboard usando a nova lógica de data
  async getDashboardMetrics(startDate: Date, endDate: Date): Promise<DashboardMetrics> {
    try {
      const dateRange = { from: startDate, to: endDate };
      
      // Usar a nova função buildApiDateFilter
      const filterEnviado = buildApiDateFilter(dateRange, CUSTOM_FIELDS.DATA_ENVIO);
      const filterLiberado = buildApiDateFilter(dateRange, CUSTOM_FIELDS.DATA_LIBERACAO);
      
      console.log('Filtro de enviados (nova lógica):', filterEnviado);
      console.log('Filtro de liberados (nova lógica):', filterLiberado);

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
        filter: filterEnviado,
        select: ['ID', CUSTOM_FIELDS.DATA_ENVIO],
        start: -1
      });
      metrics.totalEnviados = enviadosResponse.total || 0;
      console.log('Total enviados:', metrics.totalEnviados);
      console.log('Resposta completa enviados:', enviadosResponse);
      
      // Debug: buscar alguns contatos para ver a estrutura dos dados
      const debugResponse = await this.callBitrixMethod('crm.contact.list', {
        select: ['ID', 'NAME', CUSTOM_FIELDS.DATA_ENVIO, CUSTOM_FIELDS.DATA_LIBERACAO],
        start: 0,
        order: { ID: 'DESC' }
      });
      console.log('Debug - Primeiros 5 contatos:', debugResponse.result?.slice(0, 5));

      // Contar liberados total
      const liberadosResponse = await this.callBitrixMethod('crm.contact.list', {
        filter: filterLiberado,
        select: ['ID'],
        start: -1
      });
      metrics.totalLiberados = liberadosResponse.total || 0;
      console.log('Total liberados:', metrics.totalLiberados);

      // Contar por responsável
      for (const [name, userId] of Object.entries(RESPONSIBLE_USERS)) {
        // Enviados por responsável
        const enviadosResp = await this.callBitrixMethod('crm.contact.list', {
          filter: {
            ...filterEnviado,
            'ASSIGNED_BY_ID': userId.toString()
          },
          select: ['ID'],
          start: -1
        });
        metrics.responsaveis[name].enviados = enviadosResp.total || 0;

        // Liberados por responsável
        const liberadosResp = await this.callBitrixMethod('crm.contact.list', {
          filter: {
            ...filterLiberado,
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
    const start = formatDateForBitrix(startDate);
    const end = formatDateForBitrix(endDate);
    
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
      [`>=${CUSTOM_FIELDS.DATA_LIBERACAO}`]: formatDateForBitrix(startDate),
      [`<=${CUSTOM_FIELDS.DATA_LIBERACAO}`]: formatDateForBitrix(endDate),
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
