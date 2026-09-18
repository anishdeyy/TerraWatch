import { api } from './api';
import { SiteAnalytics, ProjectAnalytics, MetricTrends, AlertItem } from '../types';

export const analyticsService = {
  getSiteAnalytics: async (siteId: number): Promise<SiteAnalytics> => {
    const res = await api.get<SiteAnalytics>(`/sites/${siteId}/analytics`);
    return res.data;
  },

  getSiteMetricTrends: async (siteId: number): Promise<MetricTrends> => {
    const res = await api.get<MetricTrends>(`/sites/${siteId}/metrics/trends`);
    return res.data;
  },

  getProjectAnalytics: async (projectId: number): Promise<ProjectAnalytics> => {
    const res = await api.get<ProjectAnalytics>(`/projects/${projectId}/analytics`);
    return res.data;
  },

  getProjectComparison: async (projectId: number): Promise<{ sites: any[] }> => {
    const res = await api.get<{ sites: any[] }>(`/projects/${projectId}/comparison`);
    return res.data;
  },

  getAllAlerts: async (severity?: string): Promise<AlertItem[]> => {
    const res = await api.get<AlertItem[]>('/alerts', { params: { severity } });
    return res.data;
  }
};
