// Configuração do Bitrix24
export interface BitrixConfig {
  webhookUrl: string;
  users: {
    [key: string]: {
      id: number;
      name: string;
    };
  };
  fields: {
    dataEnvio: string;
    dataLiberacao: string;
    status: string;
  };
}

// IDs dos responsáveis (serão descobertos dinamicamente)
export const RESPONSIBLE_USERS = {
  'Carolini Braguini': 4984,
  'Melissa': 4986,
  'Beatriz Angelo': 4988,
  'Fernanda Raphaelly': 4990,
  'Kerolay Oliveira': 4992,
};

// Campos personalizados do Bitrix24 (serão descobertos dinamicamente)
export const CUSTOM_FIELDS = {
  DATA_ENVIO: 'UF_CRM_1659459001630', // Data de Envio
  DATA_LIBERACAO: 'UF_CRM_1669498023605', // Data de Liberação*
  STATUS: 'UF_CRM_1659459407558', // Status
};

// Status possíveis para contagem
export const STATUS_VALUES = {
  ENVIADO: ['A Enviar 1.0', 'A Enviar 2.0'],
  LIBERADO: ['Liberado', 'Aberto'],
};

// Formato de data para o Bitrix24
export const formatDateForBitrix = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Formato de data e hora para o Bitrix24
export const formatDateTimeForBitrix = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

// Criar filtro de data para o Bitrix24
export const createDateFilter = (field: string, startDate: Date, endDate: Date) => {
  const start = formatDateTimeForBitrix(startDate);
  const end = formatDateTimeForBitrix(endDate);
  
  return {
    [`>=${field}`]: start,
    [`<=${field}`]: end,
  };
};
