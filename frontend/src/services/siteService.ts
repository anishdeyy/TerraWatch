import { api } from './api';
import { Site, GeoJSONFeatureCollection } from '../types';

export const siteService = {
  getSites: async (params?: { project_id?: number; status?: string; search?: string }): Promise<Site[]> => {
    const res = await api.get<Site[]>('/sites', { params });
    return res.data;
  },

  getSitesGeoJSON: async (params?: { project_id?: number; status?: string }): Promise<GeoJSONFeatureCollection> => {
    const res = await api.get<GeoJSONFeatureCollection>('/sites/geojson', { params });
    return res.data;
  },

  getNearbySites: async (lat: number, lon: number, radiusKm: number = 100): Promise<Site[]> => {
    const res = await api.get<Site[]>('/sites/nearby', {
      params: { lat, lon, radius_km: radiusKm }
    });
    return res.data;
  },

  getSite: async (id: number): Promise<Site> => {
    const res = await api.get<Site>(`/sites/${id}`);
    return res.data;
  },

  createSite: async (data: {
    name: string;
    project_id: number;
    description?: string;
    geometry: any;
    status?: string;
    region?: string;
    ecological_type?: string;
    data_source?: string;
    area_hectares?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<Site> => {
    const res = await api.post<Site>('/sites', data);
    return res.data;
  },

  updateSite: async (id: number, data: Partial<Site>): Promise<Site> => {
    const res = await api.put<Site>(`/sites/${id}`, data);
    return res.data;
  },

  deleteSite: async (id: number): Promise<void> => {
    await api.delete(`/sites/${id}`);
  }
};
