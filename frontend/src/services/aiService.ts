import { api } from './api';
import {
  AISiteSummary,
  RecommendationResponse,
  AnomalyExplanationResponse,
  ProjectSummaryResponse,
  AskAIResponse
} from '../types';

export const aiService = {
  getSiteSummary: async (siteId: number): Promise<AISiteSummary> => {
    const res = await api.post<AISiteSummary>('/ai/site-summary', { site_id: siteId });
    return res.data;
  },

  getRecommendations: async (siteId: number): Promise<RecommendationResponse> => {
    const res = await api.post<RecommendationResponse>('/ai/recommendations', { site_id: siteId });
    return res.data;
  },

  getAnomalyExplanation: async (siteId: number, metricName: string = 'ndvi', dropPercentage: number = 16.5): Promise<AnomalyExplanationResponse> => {
    const res = await api.post<AnomalyExplanationResponse>('/ai/anomaly-explanation', {
      site_id: siteId,
      metric_name: metricName,
      drop_percentage: dropPercentage
    });
    return res.data;
  },

  getProjectSummary: async (projectId: number): Promise<ProjectSummaryResponse> => {
    const res = await api.post<ProjectSummaryResponse>('/ai/project-summary', { project_id: projectId });
    return res.data;
  },

  askTerraWatchAI: async (question: string, projectId?: number, siteId?: number): Promise<AskAIResponse> => {
    const res = await api.post<AskAIResponse>('/ai/ask', {
      question,
      project_id: projectId,
      site_id: siteId
    });
    return res.data;
  },

  askDarukaaAI: async (question: string, projectId?: number, siteId?: number): Promise<AskAIResponse> => {
    const res = await api.post<AskAIResponse>('/ai/ask', {
      question,
      project_id: projectId,
      site_id: siteId
    });
    return res.data;
  }
};
