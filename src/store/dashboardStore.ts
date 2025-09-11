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

interface DashboardStore {
  data: DashboardData;
  filters: DashboardFilters;
  isLoading: boolean;
  lastUpdate: Date | null;
  
  // Actions
  setData: (data: DashboardData) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  setLoading: (loading: boolean) => void;
  resetFilters: () => void;
  updateLastUpdate: () => void;
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

  setData: (data) => set({ data }),
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  resetFilters: () => set({
    filters: {
      dataEnvioStart: startOfDay(today),
      dataEnvioEnd: endOfDay(today),
      dataLiberacaoStart: startOfDay(today),
      dataLiberacaoEnd: endOfDay(today),
    }
  }),
  updateLastUpdate: () => set({ lastUpdate: new Date() }),
}));
