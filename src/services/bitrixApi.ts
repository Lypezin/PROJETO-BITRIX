import axios from 'axios';

// Configurações do Bitrix24
const RESPONSIBLE_USERS = {
  'Beatriz Angelo': '4988',
  'Melissa': '4986', 
  'Fernanda Raphaelly': '4990',
  'Carolini Braguini': '4984',
  'Kerolay Oliveira': '4992'
} as const;

const CUSTOM_FIELDS = {
  DATA_ENVIO: 'UF_CRM_1659459001630',
  DATA_LIBERACAO: 'UF_CRM_1669498023605'
} as const;

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

export interface Contact {
  ID: string;
  NAME: string;
  ASSIGNED_BY_ID: string;
  [key: string]: any;
}

interface DateRange {
  from: Date;
  to: Date;
}

class BitrixApi {
  private baseUrl = '/api/bitrix-proxy';
  private lastRequestTime = 0;
  private readonly REQUEST_DELAY = 500; // 500ms = 2 requests per second

  // Rate limiting: espera entre requisições para respeitar limite da API
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      const waitTime = this.REQUEST_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Chamar método da API do Bitrix24 com rate limiting
  private async callBitrixMethod(method: string, params: any = {}) {
    await this.waitForRateLimit();
    
    try {
      const response = await axios.post(this.baseUrl, {
        method,
        params
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao chamar API do Bitrix:', error);
      throw error;
    }
  }

  // Formatar data para filtro Bitrix24 (formato correto)
  private formatDateForBitrix(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // Construir filtro de data otimizado
  private buildDateFilter(dateRange: DateRange, fieldId: string) {
    const startDate = new Date(dateRange.from);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateRange.to);
    endDate.setHours(23, 59, 59, 999);
    
    const filter = {
      [`>=${fieldId}`]: this.formatDateForBitrix(startDate),
      [`<=${fieldId}`]: this.formatDateForBitrix(endDate)
    };
    
    console.log(`🔍 Filtro construído para ${fieldId}:`, {
      dateRange: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      },
      processedDates: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      bitrixFormat: {
        startFormatted: this.formatDateForBitrix(startDate),
        endFormatted: this.formatDateForBitrix(endDate)
      },
      finalFilter: filter
    });
    
    return filter;
  }

  // Obter métricas do dashboard usando filtros otimizados
  async getDashboardMetrics(startDate: Date, endDate: Date): Promise<DashboardMetrics> {
    try {
      console.log('🚀 Buscando métricas otimizadas para:', {
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString()
      });
      
      console.log('🔧 Configurações sendo usadas:', {
        CUSTOM_FIELDS,
        RESPONSIBLE_USERS
      });
      
      const metrics: DashboardMetrics = {
        totalEnviados: 0,
        totalLiberados: 0,
        responsaveis: {}
      };

      // Inicializar responsáveis
      Object.keys(RESPONSIBLE_USERS).forEach(name => {
        metrics.responsaveis[name] = { enviados: 0, liberados: 0 };
      });

      const dateRange = { from: startDate, to: endDate };
      
      // TESTE: Primeiro fazer uma consulta simples para verificar se há dados
      console.log('🧪 TESTE: Verificando se há dados no período...');
      try {
        const testFilter = this.buildDateFilter(dateRange, CUSTOM_FIELDS.DATA_ENVIO);
        const testResponse = await this.callBitrixMethod('crm.contact.list', {
          filter: testFilter,
          select: ['ID'],
          start: 0,
          limit: 1
        });
        console.log('🧪 TESTE - Resposta da consulta simples:', testResponse);
        
        // Teste sem filtro de data para ver se há contatos com o campo
        const testNoDateFilter = await this.callBitrixMethod('crm.contact.list', {
          filter: {
            [`!${CUSTOM_FIELDS.DATA_ENVIO}`]: false // Apenas contatos com o campo preenchido
          },
          select: ['ID', CUSTOM_FIELDS.DATA_ENVIO],
          start: 0,
          limit: 5
        });
        console.log('🧪 TESTE - Contatos com campo preenchido (amostra):', testNoDateFilter);
      } catch (testError) {
        console.error('🧪 TESTE - Erro na consulta simples:', testError);
      }
      
      // Usar batch request para eficiência máxima
      const batchCommands: any = {
        // Contar enviados total - usando cmd format correto
        enviados_count: `crm.contact.list?filter[>=${CUSTOM_FIELDS.DATA_ENVIO}]=${this.formatDateForBitrix(new Date(dateRange.from))}&filter[<=${CUSTOM_FIELDS.DATA_ENVIO}]=${this.formatDateForBitrix(new Date(dateRange.to))}&filter[!${CUSTOM_FIELDS.DATA_ENVIO}]=false&start=-1`,
        
        // Contar liberados total
        liberados_count: `crm.contact.list?filter[>=${CUSTOM_FIELDS.DATA_LIBERACAO}]=${this.formatDateForBitrix(new Date(dateRange.from))}&filter[<=${CUSTOM_FIELDS.DATA_LIBERACAO}]=${this.formatDateForBitrix(new Date(dateRange.to))}&filter[!${CUSTOM_FIELDS.DATA_LIBERACAO}]=false&start=-1`
      };

      // Adicionar comandos para cada responsável
      Object.entries(RESPONSIBLE_USERS).forEach(([name, id]) => {
        // Enviados por responsável
        batchCommands[`enviados_${name.replace(/\s+/g, '_')}`] = `crm.contact.list?filter[>=${CUSTOM_FIELDS.DATA_ENVIO}]=${this.formatDateForBitrix(new Date(dateRange.from))}&filter[<=${CUSTOM_FIELDS.DATA_ENVIO}]=${this.formatDateForBitrix(new Date(dateRange.to))}&filter[!${CUSTOM_FIELDS.DATA_ENVIO}]=false&filter[ASSIGNED_BY_ID]=${id}&start=-1`;
        
        // Liberados por responsável
        batchCommands[`liberados_${name.replace(/\s+/g, '_')}`] = `crm.contact.list?filter[>=${CUSTOM_FIELDS.DATA_LIBERACAO}]=${this.formatDateForBitrix(new Date(dateRange.from))}&filter[<=${CUSTOM_FIELDS.DATA_LIBERACAO}]=${this.formatDateForBitrix(new Date(dateRange.to))}&filter[!${CUSTOM_FIELDS.DATA_LIBERACAO}]=false&filter[ASSIGNED_BY_ID]=${id}&start=-1`;
      });

      console.log('Executando batch request com', Object.keys(batchCommands).length, 'comandos');
      console.log('Comandos do batch:', JSON.stringify(batchCommands, null, 2));
      
      // Executar batch request
      const batchResponse = await this.callBitrixMethod('batch', {
        cmd: batchCommands
      });

      console.log('Resposta do batch completa:', JSON.stringify(batchResponse, null, 2));

      if (batchResponse.result) {
        console.log('Processando resultados do batch...');
        
        // Com start=-1, os totais estão em result_total
        const resultTotals = batchResponse.result.result_total;
        
        console.log('🎯 Result totals extraídos:', resultTotals);
        
        // Processar totais diretos por chave
        metrics.totalEnviados = resultTotals.enviados_count || 0;
        metrics.totalLiberados = resultTotals.liberados_count || 0;

        console.log('✅ Totais extraídos:', {
          totalEnviados: metrics.totalEnviados,
          totalLiberados: metrics.totalLiberados
        });

        // Processar por responsável usando as chaves corretas (com underscores)
        for (const name of Object.keys(RESPONSIBLE_USERS)) {
          const keyName = name.replace(/\s+/g, '_'); // Converter espaços para underscores
          const enviadosKey = `enviados_${keyName}`;
          const liberadosKey = `liberados_${keyName}`;
          
          console.log(`Processando ${name}:`, {
            keyName,
            enviadosKey,
            liberadosKey,
            enviadosValue: resultTotals[enviadosKey],
            liberadosValue: resultTotals[liberadosKey]
          });
          
          metrics.responsaveis[name] = {
            enviados: resultTotals[enviadosKey] || 0,
            liberados: resultTotals[liberadosKey] || 0,
          };
        }
      } else {
        console.error('❌ Nenhum resultado no batch response');
      }

      console.log('✅ Métricas calculadas:', metrics);
      return metrics;

    } catch (error) {
      console.error('❌ Erro ao obter métricas do dashboard:', error);
      
      // Fallback: tentar método simples se batch falhar
      return this.getFallbackMetrics(startDate, endDate);
    }
  }

  // Método fallback se batch request falhar
  private async getFallbackMetrics(startDate: Date, endDate: Date): Promise<DashboardMetrics> {
    console.log('🔄 Usando método fallback...');
    
    const metrics: DashboardMetrics = {
      totalEnviados: 0,
      totalLiberados: 0,
      responsaveis: {}
    };

    // Inicializar responsáveis
    Object.keys(RESPONSIBLE_USERS).forEach(name => {
      metrics.responsaveis[name] = { enviados: 0, liberados: 0 };
    });

    const dateRange = { from: startDate, to: endDate };

    try {
      // Buscar enviados
      const enviadosResponse = await this.callBitrixMethod('crm.contact.list', {
        filter: {
          ...this.buildDateFilter(dateRange, CUSTOM_FIELDS.DATA_ENVIO),
          [`!${CUSTOM_FIELDS.DATA_ENVIO}`]: false
        },
        select: ['ID', 'ASSIGNED_BY_ID'],
        start: -1
      });

      metrics.totalEnviados = enviadosResponse.total || 0;

      // Buscar liberados
      const liberadosResponse = await this.callBitrixMethod('crm.contact.list', {
        filter: {
          ...this.buildDateFilter(dateRange, CUSTOM_FIELDS.DATA_LIBERACAO),
          [`!${CUSTOM_FIELDS.DATA_LIBERACAO}`]: false
        },
        select: ['ID', 'ASSIGNED_BY_ID'],
        start: -1
      });

      metrics.totalLiberados = liberadosResponse.total || 0;

      // Se precisar dos dados por responsável, buscar mais detalhes
      if (enviadosResponse.result) {
        enviadosResponse.result.forEach((contact: any) => {
          const responsibleName = Object.keys(RESPONSIBLE_USERS).find(
            name => RESPONSIBLE_USERS[name as keyof typeof RESPONSIBLE_USERS] === contact.ASSIGNED_BY_ID
          );
          if (responsibleName) {
            metrics.responsaveis[responsibleName].enviados++;
          }
        });
      }

      if (liberadosResponse.result) {
        liberadosResponse.result.forEach((contact: any) => {
          const responsibleName = Object.keys(RESPONSIBLE_USERS).find(
            name => RESPONSIBLE_USERS[name as keyof typeof RESPONSIBLE_USERS] === contact.ASSIGNED_BY_ID
          );
          if (responsibleName) {
            metrics.responsaveis[responsibleName].liberados++;
          }
        });
      }

    } catch (error) {
      console.error('❌ Erro no método fallback:', error);
    }

    return metrics;
  }

  // Exportar contatos com paginação otimizada
  async exportContacts(startDate: Date, endDate: Date, responsavelId?: string): Promise<Contact[]> {
    try {
      console.log('📊 Exportando contatos...', { startDate, endDate, responsavelId });
      
      const dateRange = { from: startDate, to: endDate };
      const allContacts: Contact[] = [];
      
      // Construir filtro base
      const baseFilter: any = {
        ...this.buildDateFilter(dateRange, CUSTOM_FIELDS.DATA_ENVIO),
        [`!${CUSTOM_FIELDS.DATA_ENVIO}`]: false
      };

      // Adicionar filtro de responsável se especificado
      if (responsavelId) {
        baseFilter['ASSIGNED_BY_ID'] = responsavelId;
      }

      let start = 0;
      const limit = 50;
      
      while (true) {
        const response = await this.callBitrixMethod('crm.contact.list', {
          filter: baseFilter,
          select: ['ID', 'NAME', 'ASSIGNED_BY_ID', CUSTOM_FIELDS.DATA_ENVIO, CUSTOM_FIELDS.DATA_LIBERACAO],
          start,
          limit
        });
        
        if (!response.result || response.result.length === 0) {
          break;
        }
        
        allContacts.push(...response.result);
        start += limit;
        
        console.log(`📦 Exportados ${allContacts.length} contatos até agora...`);
      }
      
      console.log('✅ Exportação concluída:', allContacts.length, 'contatos');
      return allContacts;
      
    } catch (error) {
      console.error('❌ Erro ao exportar contatos:', error);
      throw error;
    }
  }
}

export const bitrixApi = new BitrixApi();
