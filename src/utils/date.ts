// src/utils/date.ts

/**
 * Formata um objeto Date para o formato de string 'YYYY-MM-DD HH:mm:ss',
 * que é o formato esperado pela API do Bitrix24 para filtros de data e hora.
 * @param date - O objeto Date a ser formatado.
 * @returns A data formatada como string.
 */
export const formatDateTimeForBitrix = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
