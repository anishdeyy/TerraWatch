import { api } from './api';
import { ReportItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const reportService = {
  getReports: async (): Promise<ReportItem[]> => {
    const res = await api.get<ReportItem[]>('/reports');
    return res.data;
  },

  getReport: async (id: number): Promise<ReportItem> => {
    const res = await api.get<ReportItem>(`/reports/${id}`);
    return res.data;
  },

  generateReport: async (data: {
    project_id?: number;
    site_id?: number;
    report_type?: string;
    title?: string;
  }): Promise<ReportItem> => {
    const res = await api.post<ReportItem>('/reports/generate', data);
    return res.data;
  },

  getDownloadUrl: (id: number): string => {
    return `${API_BASE_URL}/api/reports/${id}/download`;
  }
};
