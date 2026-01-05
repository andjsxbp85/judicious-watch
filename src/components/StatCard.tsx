import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'from-primary/10 to-primary/5',
    primary: 'from-primary/15 to-primary/5',
    success: 'from-success/15 to-success/5',
    danger: 'from-destructive/15 to-destructive/5',
    warning: 'from-warning/15 to-warning/5',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary/15 text-primary',
    success: 'bg-success/15 text-success',
    danger: 'bg-destructive/15 text-destructive',
    warning: 'bg-warning/15 text-warning',
  };

  return (
    <div className="stat-card group">
      <div className={cn("stat-card-gradient bg-gradient-to-br", variantStyles[variant])} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl", iconStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                trend.isPositive
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
