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
    goal, // Novo estado
    setData, 
    setFilters: setLocalFilters, // Renomeia para evitar conflito
    setLoading, 
    updateLastUpdate,
    setCityData,
    setGoal: setLocalGoal // Nova ação
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

  // Função para salvar a meta no Firebase
  const setGoal = useCallback((newGoal: number) => {
    const goalRef = ref(database, 'metas/liberados');
    set(goalRef, newGoal);
  }, []);

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

  // Efeito para ouvir mudanças na meta do Firebase
  useEffect(() => {
    const goalRef = ref(database, 'metas/liberados');
    const unsubscribe = onValue(goalRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setLocalGoal(data);
      } else {
        setLocalGoal(0); // Valor padrão
      }
    });

    return () => unsubscribe();
  }, [setLocalGoal]);


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
    goal, // Exporta o novo estado
    setFilters,
    fetchData,
    addCity,
    removeCity,
    setGoal, // Exporta a nova função
  };
};