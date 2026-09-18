import { api } from './api';
import { DataSource, IngestionRun, DataQualitySummary, SiteProvenanceItem, SiteDrawPreview } from '../types';

export const dataSourceService = {
  getDataSources: async (): Promise<DataSource[]> => {
    const res = await api.get<DataSource[]>('/data-sources');
    return res.data;
  },

  getDataSource: async (id: string): Promise<DataSource> => {
    const res = await api.get<DataSource>(`/data-sources/${id}`);
    return res.data;
  },

  getIngestionRuns: async (limit: number = 20): Promise<IngestionRun[]> => {
    const res = await api.get<IngestionRun[]>('/data-sources/admin/runs', { params: { limit } });
    return res.data;
  },

  triggerIngestion: async (sourceId: string): Promise<any> => {
    const res = await api.post(`/data-sources/admin/run/${sourceId}`);
    return res.data;
  },

  getDataQualitySummary: async (): Promise<DataQualitySummary> => {
    const res = await api.get<DataQualitySummary>('/data-sources/admin/data-quality');
    return res.data;
  },

  getSiteProvenance: async (siteId: number): Promise<{
    site_id: number;
    site_name: string;
    region?: string;
    ecological_type?: string;
    records_count: number;
    provenance: SiteProvenanceItem[];
  }> => {
    const res = await api.get(`/sites/${siteId}/provenance`);
    return res.data;
  },

  getSiteClimate: async (siteId: number, provider: 'open_meteo' | 'nasa_power' = 'open_meteo'): Promise<any> => {
    const res = await api.get(`/sites/${siteId}/climate`, { params: { provider } });
    return res.data;
  },

  getSiteSoil: async (siteId: number): Promise<any> => {
    const res = await api.get(`/sites/${siteId}/soil`);
    return res.data;
  },

  previewDrawnPolygon: async (geometry: any, projectId?: number): Promise<SiteDrawPreview> => {
    const res = await api.post<SiteDrawPreview>('/sites/preview-draw', { geometry, project_id: projectId });
    return res.data;
  }
};
