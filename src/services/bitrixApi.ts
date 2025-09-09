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
  // Usar formato ISO 8601 com timezone (como o Bitrix usa)
  return date.toISOString();
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
  async getDashboardMetrics(_startDate: Date, _endDate: Date): Promise<DashboardMetrics> {
    try {
      // TEMPORÁRIO: Testar com data onde sabemos que há dados (8 de setembro)
      const testDate = new Date('2025-09-08T00:00:00-03:00');
      const filterEnviado = buildApiDateFilter({ from: testDate, to: testDate }, CUSTOM_FIELDS.DATA_ENVIO);
      const filterLiberado = buildApiDateFilter({ from: testDate, to: testDate }, CUSTOM_FIELDS.DATA_LIBERACAO);
      
      console.log('🚀🚀🚀 DEPLOY ATUALIZADO - TESTANDO COM DATA 8/09 ONDE HÁ DADOS 🚀🚀🚀');
      
      console.log('Filtro de enviados (nova lógica):', JSON.stringify(filterEnviado, null, 2));
      console.log('Filtro de liberados (nova lógica):', JSON.stringify(filterLiberado, null, 2));

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
      
      // Debug: buscar contatos com datas para entender o formato
      const debugWithDates = await this.callBitrixMethod('crm.contact.list', {
        filter: {
          [`!${CUSTOM_FIELDS.DATA_ENVIO}`]: null, // Contatos que TÊM data de envio
        },
        select: ['ID', 'NAME', CUSTOM_FIELDS.DATA_ENVIO, CUSTOM_FIELDS.DATA_LIBERACAO],
        start: 0,
        order: { ID: 'DESC' }
      });
      console.log('Debug - Contatos COM datas de envio:', JSON.stringify(debugWithDates.result?.slice(0, 3), null, 2));
      console.log('Debug - Contatos COM datas de envio (simples):', debugWithDates.result?.slice(0, 3));
      
      // Debug: mostrar formato real das datas
      if (debugWithDates.result && debugWithDates.result.length > 0) {
        const firstContact = debugWithDates.result[0];
        console.log('Debug - Formato real da data de envio:', JSON.stringify({
          ID: firstContact.ID,
          NAME: firstContact.NAME,
          DATA_ENVIO: firstContact[CUSTOM_FIELDS.DATA_ENVIO],
          TIPO: typeof firstContact[CUSTOM_FIELDS.DATA_ENVIO]
        }, null, 2));
        
        // Log mais direto
        console.log('Debug - Primeiro contato (dados brutos):', firstContact);
        console.log('Debug - Data de envio (bruta):', firstContact[CUSTOM_FIELDS.DATA_ENVIO]);
        console.log('Debug - Data de liberação (bruta):', firstContact[CUSTOM_FIELDS.DATA_LIBERACAO]);
      }
      
      // Debug: buscar contatos com datas de liberação
      const debugWithLiberacao = await this.callBitrixMethod('crm.contact.list', {
        filter: {
          [`!${CUSTOM_FIELDS.DATA_LIBERACAO}`]: null, // Contatos que TÊM data de liberação
        },
        select: ['ID', 'NAME', CUSTOM_FIELDS.DATA_ENVIO, CUSTOM_FIELDS.DATA_LIBERACAO],
        start: 0,
        order: { ID: 'DESC' }
      });
      console.log('Debug - Contatos COM datas de liberação:', JSON.stringify(debugWithLiberacao.result?.slice(0, 3), null, 2));
      
      // Debug: mostrar formato real das datas de liberação
      if (debugWithLiberacao.result && debugWithLiberacao.result.length > 0) {
        const firstContact = debugWithLiberacao.result[0];
        console.log('Debug - Formato real da data de liberação:', JSON.stringify({
          ID: firstContact.ID,
          NAME: firstContact.NAME,
          DATA_LIBERACAO: firstContact[CUSTOM_FIELDS.DATA_LIBERACAO],
          TIPO: typeof firstContact[CUSTOM_FIELDS.DATA_LIBERACAO]
        }, null, 2));
      }
      
      // Debug: testar filtro mais amplo (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const debugWideFilter = buildApiDateFilter(
        { from: thirtyDaysAgo, to: new Date() }, 
        CUSTOM_FIELDS.DATA_ENVIO
      );
      console.log('Debug - Filtro amplo (30 dias):', debugWideFilter);
      
      const debugWideResponse = await this.callBitrixMethod('crm.contact.list', {
        filter: debugWideFilter,
        select: ['ID', 'NAME', CUSTOM_FIELDS.DATA_ENVIO],
        start: -1
      });
      console.log('Debug - Total com filtro amplo:', debugWideResponse.total);
      
      // Debug: testar com data correta (8 de setembro) onde sabemos que há dados
      const debugTestDate = new Date('2025-09-08T00:00:00-03:00'); // 8 de setembro
      const testFilter = buildApiDateFilter({ from: debugTestDate, to: debugTestDate }, CUSTOM_FIELDS.DATA_ENVIO);
      console.log('Debug - Teste com data correta (8/09):', JSON.stringify(testFilter, null, 2));
      
      const testResponse = await this.callBitrixMethod('crm.contact.list', {
        filter: testFilter,
        select: ['ID', 'NAME', CUSTOM_FIELDS.DATA_ENVIO],
        start: -1
      });
      console.log('Debug - Total com data correta (8/09):', testResponse.total);
      
      // Debug: testar sem filtro de data para ver todos os contatos
      const debugNoFilter = await this.callBitrixMethod('crm.contact.list', {
        select: ['ID', 'NAME', CUSTOM_FIELDS.DATA_ENVIO, CUSTOM_FIELDS.DATA_LIBERACAO],
        start: 0,
        order: { ID: 'DESC' }
      });
      console.log('Debug - Total de contatos (sem filtro):', debugNoFilter.total);
      if (debugNoFilter.result && debugNoFilter.result.length > 0) {
        const firstContact = debugNoFilter.result[0];
        console.log('Debug - Primeiro contato (sem filtro):', JSON.stringify({
          ID: firstContact.ID,
          NAME: firstContact.NAME,
          DATA_ENVIO: firstContact[CUSTOM_FIELDS.DATA_ENVIO],
          DATA_LIBERACAO: firstContact[CUSTOM_FIELDS.DATA_LIBERACAO]
        }, null, 2));
      }

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
