import { create } from 'zustand';
import { format, startOfDay, endOfDay } from 'date-fns';

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

export interface FilterState {
  startDate: Date;
  endDate: Date;
  responsavel: string | null;
}

interface DashboardStore {
  data: DashboardData;
  filters: FilterState;
  isLoading: boolean;
  lastUpdate: Date | null;
  
  // Actions
  setData: (data: DashboardData) => void;
  setFilters: (filters: Partial<FilterState>) => void;
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
    startDate: startOfDay(today),
    endDate: endOfDay(today),
    responsavel: null,
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
      startDate: startOfDay(today),
      endDate: endOfDay(today),
      responsavel: null,
    }
  }),
  updateLastUpdate: () => set({ lastUpdate: new Date() }),
}));
