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
  CIDADE: 'UF_CRM_1660064582829', // Cidade/Região
};

// Status possíveis para contagem
export const STATUS_VALUES = {
  ENVIADO: ['A Enviar 1.0', 'A Enviar 2.0'],
  LIBERADO: ['Liberado', 'Aberto'],
  EXCLUIR_ENVIO: ['Confirmar', 'Cancelado', 'Abrindo MEI'],
};
