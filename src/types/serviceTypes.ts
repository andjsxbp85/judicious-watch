export type ServiceStatus = 'ok' | 'error' | 'unknown';
export type LogStatus = 'ok' | 'error' | 'warning';

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  lastChecked: string | null;
  responseTime: number | null;
  endpoint: string;
}

export interface ServiceLog {
  id: string;
  serviceName: string;
  status: LogStatus;
  detailLog: string;
  requestType: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEALTH_CHECK';
  responseCode: number | null;
  timestamp: string;
  duration: number | null;
  requestPayload?: string;
  responsePayload?: string;
}

export const SERVICES: Service[] = [
  {
    id: 'crawler',
    name: 'Crawler',
    status: 'unknown',
    lastChecked: null,
    responseTime: null,
    endpoint: '/api/crawler/health',
  },
  {
    id: 'reasoning-ai',
    name: 'Reasoning AI',
    status: 'unknown',
    lastChecked: null,
    responseTime: null,
    endpoint: '/api/reasoning/health',
  },
  {
    id: 'sft-hukum',
    name: 'SFT Hukum',
    status: 'unknown',
    lastChecked: null,
    responseTime: null,
    endpoint: '/api/sft-hukum/health',
  },
  {
    id: 'computer-vision',
    name: 'Computer Vision',
    status: 'unknown',
    lastChecked: null,
    responseTime: null,
    endpoint: '/api/cv/health',
  },
];
