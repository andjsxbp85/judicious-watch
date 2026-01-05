import { ServiceLog, LogStatus } from '@/types/serviceTypes';

const logStatuses: LogStatus[] = ['ok', 'error', 'warning'];
const serviceNames = ['Crawler', 'Reasoning AI', 'SFT Hukum', 'Computer Vision'];
const requestTypes: ServiceLog['requestType'][] = ['GET', 'POST', 'PUT', 'DELETE', 'HEALTH_CHECK'];

function generateRandomLog(index: number): ServiceLog {
  const serviceName = serviceNames[Math.floor(Math.random() * serviceNames.length)];
  const status = logStatuses[Math.floor(Math.random() * logStatuses.length)];
  const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
  const responseCode = status === 'ok' ? 200 : status === 'error' ? Math.random() > 0.5 ? 500 : 503 : 429;
  
  const detailMessages: Record<LogStatus, string[]> = {
    ok: [
      'Request completed successfully',
      'Health check passed',
      'API response received',
      'Data processed successfully',
      'Connection established',
    ],
    error: [
      'Connection timeout',
      'Internal server error',
      'Service unavailable',
      'Authentication failed',
      'Resource not found',
    ],
    warning: [
      'Rate limit approaching',
      'High latency detected',
      'Partial data received',
      'Retry attempt successful',
      'Memory usage warning',
    ],
  };

  const messages = detailMessages[status];
  const detailLog = messages[Math.floor(Math.random() * messages.length)];
  const duration = status === 'ok' ? Math.floor(Math.random() * 500) + 50 : status === 'error' ? null : Math.floor(Math.random() * 2000) + 500;

  const timestamp = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString();

  return {
    id: `log-${index}-${Date.now()}`,
    serviceName,
    status,
    detailLog,
    requestType,
    responseCode,
    timestamp,
    duration,
    requestPayload: requestType !== 'GET' && requestType !== 'HEALTH_CHECK' 
      ? JSON.stringify({ data: 'sample payload', timestamp })
      : undefined,
    responsePayload: status === 'ok' 
      ? JSON.stringify({ success: true, message: 'Operation completed' })
      : status === 'error'
      ? JSON.stringify({ error: detailLog })
      : JSON.stringify({ warning: detailLog }),
  };
}

export const mockServiceLogs: ServiceLog[] = Array.from({ length: 50 }, (_, i) => generateRandomLog(i))
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
