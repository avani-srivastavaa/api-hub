import { create } from 'zustand';
import { connectorsAPI } from '../services/api';

export const useConnectorStore = create((set, get) => ({
  // State
  connectors: [],
  selectedConnector: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    provider: 'all',
  },

  // Actions
  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setConnectors: (connectors) => set({ connectors }),

  setSelectedConnector: (connector) => set({ selectedConnector: connector }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  // Async actions
  fetchConnectors: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await connectorsAPI.list(filters);
      set({ connectors: response.data.data, loading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch connectors',
        loading: false,
      });
      throw error;
    }
  },

  fetchConnectorById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await connectorsAPI.getById(id);
      set({ selectedConnector: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch connector',
        loading: false,
      });
      throw error;
    }
  },

  createConnector: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await connectorsAPI.create(data);
      set((state) => ({
        connectors: [...state.connectors, response.data.data],
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to create connector',
        loading: false,
      });
      throw error;
    }
  },

  updateConnector: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await connectorsAPI.update(id, data);
      set((state) => ({
        connectors: state.connectors.map((c) =>
          c.id === id ? response.data.data : c
        ),
        selectedConnector:
          state.selectedConnector?.id === id
            ? response.data.data
            : state.selectedConnector,
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to update connector',
        loading: false,
      });
      throw error;
    }
  },

  deleteConnector: async (id) => {
    set({ loading: true, error: null });
    try {
      await connectorsAPI.delete(id);
      set((state) => ({
        connectors: state.connectors.filter((c) => c.id !== id),
        selectedConnector:
          state.selectedConnector?.id === id ? null : state.selectedConnector,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to delete connector',
        loading: false,
      });
      throw error;
    }
  },

  disableConnector: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await connectorsAPI.disable(id);
      set((state) => ({
        connectors: state.connectors.map((c) =>
          c.id === id ? response.data.data : c
        ),
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to disable connector',
        loading: false,
      });
      throw error;
    }
  },

  enableConnector: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await connectorsAPI.enable(id);
      set((state) => ({
        connectors: state.connectors.map((c) =>
          c.id === id ? response.data.data : c
        ),
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to enable connector',
        loading: false,
      });
      throw error;
    }
  },
}));

/**
 * Statistics Store
 */
export const useStatsStore = create((set) => ({
  stats: [],
  selectedStats: null,
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setStats: (stats) => set({ stats }),
  setSelectedStats: (stats) => set({ selectedStats: stats }),

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await connectorsAPI.getAllStats();
      set({ stats: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch statistics',
        loading: false,
      });
      throw error;
    }
  },

  fetchConnectorStats: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await connectorsAPI.getStats(id);
      set({ selectedStats: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch connector stats',
        loading: false,
      });
      throw error;
    }
  },
}));
