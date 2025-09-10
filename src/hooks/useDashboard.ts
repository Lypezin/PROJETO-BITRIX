// src/hooks/useDashboard.ts

import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { bitrixApi } from '../services/bitrixApi';

export const useDashboard = () => {
  const { 
    data, 
    filters, 
    isLoading, 
    lastUpdate,
    setData, 
    setFilters,
    setLoading, 
    updateLastUpdate 
  } = useDashboardStore();

  const fetchData = useCallback(async () => {
    console.log('🔄 FETCHDATA CHAMADO COM FILTROS:', {
      dataEnvioStart: filters.dataEnvioStart.toISOString(),
      dataEnvioEnd: filters.dataEnvioEnd.toISOString(),
      dataLiberacaoStart: filters.dataLiberacaoStart.toISOString(),
      dataLiberacaoEnd: filters.dataLiberacaoEnd.toISOString()
    });
    
    try {
      setLoading(true);
      const metrics = await bitrixApi.getDashboardMetrics(
        filters.dataEnvioStart,
        filters.dataEnvioEnd,
        filters.dataLiberacaoStart,
        filters.dataLiberacaoEnd
      );
      
      console.log('📊 MÉTRICAS RECEBIDAS DO BITRIX:', metrics);
      setData(metrics);
      updateLastUpdate();
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.dataEnvioStart, filters.dataEnvioEnd, filters.dataLiberacaoStart, filters.dataLiberacaoEnd, setData, setLoading, updateLastUpdate]);

  const exportData = useCallback(async () => {
    try {
      setLoading(true);

      const contacts = await bitrixApi.getContactsForExport(
        filters.dataEnvioStart, 
        filters.dataEnvioEnd
      );

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(contacts);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos');
      
      const fileName = `contatos_envio_${filters.dataEnvioStart.toISOString().split('T')[0]}_a_${filters.dataEnvioEnd.toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.dataEnvioStart, filters.dataEnvioEnd, setLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    filters,
    isLoading,
    lastUpdate,
    setFilters,
    fetchData,
    exportData,
  };
};