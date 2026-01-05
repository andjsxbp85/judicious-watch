import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockDomains, Domain, TrendData, VerifikatorStats } from '@/lib/mockData';

interface DomainsContextType {
  domains: Domain[];
  setDomains: React.Dispatch<React.SetStateAction<Domain[]>>;
  updateDomain: (domainId: string, updates: Partial<Domain>) => void;
  getStatistics: () => {
    totalDomains: number;
    totalUrls: number;
    judolCount: number;
    nonJudolCount: number;
    notVerifiedCount: number;
    todayVerified: number;
  };
  getTrendData: () => TrendData[];
  getVerifikatorStats: () => VerifikatorStats[];
  getRecentVerifications: (limit?: number) => Domain[];
}

const DomainsContext = createContext<DomainsContextType | undefined>(undefined);

export const DomainsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [domains, setDomains] = useState<Domain[]>(mockDomains);

  const updateDomain = useCallback((domainId: string, updates: Partial<Domain>) => {
    setDomains(prev =>
      prev.map(d =>
        d.id === domainId ? { ...d, ...updates } : d
      )
    );
  }, []);

  const getStatistics = useCallback(() => {
    const totalDomains = domains.length;
    const totalUrls = domains.reduce((sum, d) => sum + (d.urlGroup?.length || 1), 0);
    const judolCount = domains.filter((d) => d.status === 'judol').length;
    const nonJudolCount = domains.filter((d) => d.status === 'non-judol').length;
    const notVerifiedCount = domains.filter((d) => d.status === 'not-verified').length;
    
    const todayVerified = domains.filter((d) => {
      if (!d.verifiedAt) return false;
      const today = new Date().toDateString();
      return new Date(d.verifiedAt).toDateString() === today;
    }).length;

    return {
      totalDomains,
      totalUrls,
      judolCount,
      nonJudolCount,
      notVerifiedCount,
      todayVerified,
    };
  }, [domains]);

  const getTrendData = useCallback((): TrendData[] => {
    // Group verifications by date
    const dateMap = new Map<string, { judol: number; nonJudol: number }>();
    
    // Get last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      dateMap.set(dateStr, { judol: 0, nonJudol: 0 });
    }
    
    // Count verifications by date
    domains.forEach(d => {
      if (d.verifiedAt) {
        const verifiedDate = new Date(d.verifiedAt);
        const dateStr = verifiedDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        
        if (dateMap.has(dateStr)) {
          const current = dateMap.get(dateStr)!;
          if (d.status === 'judol') {
            current.judol++;
          } else if (d.status === 'non-judol') {
            current.nonJudol++;
          }
        }
      }
    });
    
    return Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      judol: counts.judol,
      nonJudol: counts.nonJudol,
    }));
  }, [domains]);

  const getVerifikatorStats = useCallback((): VerifikatorStats[] => {
    const verifikatorMap = new Map<string, number>();
    
    domains.forEach(d => {
      if (d.verifiedBy && d.status !== 'not-verified') {
        const current = verifikatorMap.get(d.verifiedBy) || 0;
        verifikatorMap.set(d.verifiedBy, current + 1);
      }
    });
    
    return Array.from(verifikatorMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [domains]);

  const getRecentVerifications = useCallback((limit = 5): Domain[] => {
    return domains
      .filter((d) => d.verifiedBy)
      .sort(
        (a, b) =>
          new Date(b.verifiedAt!).getTime() - new Date(a.verifiedAt!).getTime()
      )
      .slice(0, limit);
  }, [domains]);

  const value = useMemo(() => ({
    domains,
    setDomains,
    updateDomain,
    getStatistics,
    getTrendData,
    getVerifikatorStats,
    getRecentVerifications,
  }), [domains, updateDomain, getStatistics, getTrendData, getVerifikatorStats, getRecentVerifications]);

  return (
    <DomainsContext.Provider value={value}>
      {children}
    </DomainsContext.Provider>
  );
};

export const useDomains = () => {
  const context = useContext(DomainsContext);
  if (context === undefined) {
    throw new Error('useDomains must be used within a DomainsProvider');
  }
  return context;
};
