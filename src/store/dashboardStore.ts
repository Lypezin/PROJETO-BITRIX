import { create } from 'zustand';
import { startOfDay, endOfDay } from 'date-fns';

export interface DashboardData {
  totalEnviados: number;
  totalLiberados: number;
  responsaveis: {
    [key: string]: {
      enviados: number;
      liberados: number;
    };
  };
}

export interface DashboardFilters {
  dataEnvioStart: Date;
  dataEnvioEnd: Date;
  dataLiberacaoStart: Date;
  dataLiberacaoEnd: Date;
}

export interface CityData {
  id: string;
  name: string;
  value: string;
}

interface DashboardStore {
  data: DashboardData;
  filters: DashboardFilters;
  isLoading: boolean;
  lastUpdate: Date | null;
  cityData: CityData[];
  
  // Actions
  setData: (data: DashboardData) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  setLoading: (loading: boolean) => void;
  resetFilters: () => void;
  updateLastUpdate: () => void;
  setCityData: (cities: CityData[]) => void;
}

const today = new Date();

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: {
    totalEnviados: 0,
    totalLiberados: 0,
    responsaveis: {
      'Carolini Braguini': { enviados: 0, liberados: 0 },
      'Melissa': { enviados: 0, liberados: 0 },
      'Beatriz Angelo': { enviados: 0, liberados: 0 },
      'Fernanda Raphaelly': { enviados: 0, liberados: 0 },
      'Kerolay Oliveira': { enviados: 0, liberados: 0 },
    },
  },
  filters: {
    dataEnvioStart: startOfDay(today),
    dataEnvioEnd: endOfDay(today),
    dataLiberacaoStart: startOfDay(today),
    dataLiberacaoEnd: endOfDay(today),
  },
  isLoading: false,
  lastUpdate: null,
  cityData: [],

  setData: (data) => set({ data }),
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  resetFilters: () => set((state) => ({
    ...state,
    filters: {
      dataEnvioStart: startOfDay(new Date()),
      dataEnvioEnd: endOfDay(new Date()),
      dataLiberacaoStart: startOfDay(new Date()),
      dataLiberacaoEnd: endOfDay(new Date()),
    }
  })),
  updateLastUpdate: () => set({ lastUpdate: new Date() }),
  setCityData: (cities) => set({ cityData: cities }),
}));
