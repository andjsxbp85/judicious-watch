import React from 'react';
import { ServiceStatus } from '@/types/serviceTypes';
import { CheckCircle, XCircle, HelpCircle, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ServiceStatusIndicatorProps {
  id: string;
  name: string;
  status: ServiceStatus;
  lastChecked: string | null;
  responseTime: number | null;
  isChecking?: boolean;
  onHealthCheck?: () => void;
}

const statusConfig: Record<ServiceStatus, { 
  icon: typeof CheckCircle; 
  label: string; 
  colorClass: string;
  bgClass: string;
  borderClass: string;
}> = {
  ok: {
    icon: CheckCircle,
    label: 'Ok',
    colorClass: 'text-success',
    bgClass: 'bg-success/10',
    borderClass: 'border-success/30',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/10',
    borderClass: 'border-destructive/30',
  },
  unknown: {
    icon: HelpCircle,
    label: 'Unknown',
    colorClass: 'text-muted-foreground',
    bgClass: 'bg-muted',
    borderClass: 'border-muted-foreground/30',
  },
};

export const ServiceStatusIndicator: React.FC<ServiceStatusIndicatorProps> = ({
  id,
  name,
  status,
  lastChecked,
  responseTime,
  isChecking = false,
  onHealthCheck,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      id={`service-indicator-${id}`}
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border',
        config.bgClass,
        config.borderClass
      )}
    >
      <div className="flex items-center gap-3">
        <div
          id={`service-status-icon-${id}`}
          className={cn('p-2 rounded-full', config.bgClass)}
        >
          <Icon className={cn('h-5 w-5', config.colorClass)} />
        </div>
        <div>
          <h4
            id={`service-name-${id}`}
            className="font-medium text-foreground"
          >
            {name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              id={`service-status-label-${id}`}
              className={cn('font-semibold', config.colorClass)}
            >
              {config.label}
            </span>
            {lastChecked && (
              <>
                <span>•</span>
                <span id={`service-last-checked-${id}`}>
                  {new Date(lastChecked).toLocaleTimeString('id-ID')}
                </span>
              </>
            )}
            {responseTime !== null && (
              <>
                <span>•</span>
                <span id={`service-response-time-${id}`}>
                  {responseTime}ms
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <Button
        id={`service-health-check-btn-${id}`}
        variant="ghost"
        size="sm"
        onClick={onHealthCheck}
        disabled={isChecking}
        className="text-muted-foreground hover:text-foreground"
      >
        {isChecking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
