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

  // Função para buscar dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const metrics = await bitrixApi.getDashboardMetrics(filters.startDate, filters.endDate);
      setData(metrics);
      updateLastUpdate();
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, setData, setLoading, updateLastUpdate]);

  // Função para exportar dados
  const exportData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Determinar o ID do responsável se selecionado
      const responsavelId = filters.responsavel 
        ? Object.entries({
            'Carolini Braguini': 4984,
            'Melissa': 4986,
            'Beatriz Angelo': 4988,
            'Fernanda Raphaelly': 4990,
            'Kerolay Oliveira': 4992,
          }).find(([name]) => name === filters.responsavel)?.[1]
        : undefined;

      const contacts = await bitrixApi.getContactsForExport(
        filters.startDate, 
        filters.endDate, 
        responsavelId
      );

      // Gerar arquivo Excel
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(contacts);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos');
      
      // Nome do arquivo com data
      const fileName = `contatos_${filters.startDate.toISOString().split('T')[0]}_a_${filters.endDate.toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, setLoading]);

  // Efeito para buscar dados quando os filtros mudarem
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Efeito para polling automático a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [fetchData]);

  // Efeito para reagir a mudanças de filtro do admin
  useEffect(() => {
    fetchData();
  }, [filters.startDate, filters.endDate, filters.responsavel]);

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
