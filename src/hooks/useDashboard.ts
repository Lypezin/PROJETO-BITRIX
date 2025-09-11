// src/hooks/useDashboard.ts

import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { bitrixApi } from '../services/bitrixApi';
import { database } from '../config/firebase';
import { ref, onValue, set, push, remove } from "firebase/database";
import { DashboardFilters, CityData } from '../store/dashboardStore';

export const useDashboard = () => {
  const { 
    data, 
    filters, 
    isLoading, 
    lastUpdate,
    cityData,
    setData, 
    setFilters: setLocalFilters, // Renomeia para evitar conflito
    setLoading, 
    updateLastUpdate,
    setCityData
  } = useDashboardStore();

  // Função para salvar filtros no Firebase
  const setFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    const filtersRef = ref(database, 'filters');
    // Mantém os filtros existentes e atualiza com os novos
    const updatedFilters = { ...filters, ...newFilters };
    
    // Converte datas para string antes de salvar, pois o Firebase não armazena `Date`
    const filtersToSave = {
      ...updatedFilters,
      dataEnvioStart: updatedFilters.dataEnvioStart.toISOString(),
      dataEnvioEnd: updatedFilters.dataEnvioEnd.toISOString(),
      dataLiberacaoStart: updatedFilters.dataLiberacaoStart.toISOString(),
      dataLiberacaoEnd: updatedFilters.dataLiberacaoEnd.toISOString(),
    };

    set(filtersRef, filtersToSave);
  }, [filters]);

  // Efeito para ouvir mudanças nos filtros do Firebase
  useEffect(() => {
    const filtersRef = ref(database, 'filters');
    const unsubscribe = onValue(filtersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Converte as strings de data de volta para objetos `Date`
        const filtersFromDb = {
          ...data,
          dataEnvioStart: new Date(data.dataEnvioStart),
          dataEnvioEnd: new Date(data.dataEnvioEnd),
          dataLiberacaoStart: new Date(data.dataLiberacaoStart),
          dataLiberacaoEnd: new Date(data.dataLiberacaoEnd),
        };
        setLocalFilters(filtersFromDb);
      }
    });

    // Limpa o listener quando o componente desmontar
    return () => unsubscribe();
  }, [setLocalFilters]);

  // Efeito para ouvir mudanças nas cidades do Firebase
  useEffect(() => {
    const citiesRef = ref(database, 'cities');
    const unsubscribe = onValue(citiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase retorna um objeto com chaves, convertemos para array
        const citiesArray: CityData[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCityData(citiesArray);
      } else {
        setCityData([]); // Limpa os dados se o nó estiver vazio
      }
    });

    return () => unsubscribe();
  }, [setCityData]);

  const addCity = (name: string, value: string) => {
    if (!name.trim() || !value.trim()) return;
    const citiesRef = ref(database, 'cities');
    const newCityRef = push(citiesRef);
    set(newCityRef, { name, value });
  };

  const removeCity = (id: string) => {
    const cityRef = ref(database, `cities/${id}`);
    remove(cityRef);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const metrics = await bitrixApi.getDashboardMetrics(
        filters.dataEnvioStart,
        filters.dataEnvioEnd,
        filters.dataLiberacaoStart,
        filters.dataLiberacaoEnd
      );
      setData(metrics);
      updateLastUpdate();
    } catch (error) {
      if ((error as any)?.message !== 'Fetch in progress') {
        console.error('Erro ao buscar dados do dashboard:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [
    filters.dataEnvioStart, 
    filters.dataEnvioEnd, 
    filters.dataLiberacaoStart, 
    filters.dataLiberacaoEnd, 
    setData, 
    setLoading, 
    updateLastUpdate
  ]);

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
      
      const fileName = `contatos_${filters.dataEnvioStart.toISOString().split('T')[0]}_a_${filters.dataEnvioEnd.toISOString().split('T')[0]}.xlsx`;
      
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
    cityData,
    setFilters,
    fetchData,
    exportData,
    addCity,
    removeCity,
  };
};