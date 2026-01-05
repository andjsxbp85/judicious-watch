import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ServiceStatusIndicator } from '@/components/ServiceStatusIndicator';
import { ServiceLogTable } from '@/components/ServiceLogTable';
import { Service, ServiceStatus, SERVICES, LogStatus } from '@/types/serviceTypes';
import { mockServiceLogs } from '@/lib/mockServiceLogs';
import { RefreshCw, Loader2, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

const ServiceLog: React.FC = () => {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [checkingServices, setCheckingServices] = useState<Set<string>>(new Set());
  const [isBulkChecking, setIsBulkChecking] = useState(false);
  const [selectedServicesForCheck, setSelectedServicesForCheck] = useState<Set<string>>(new Set());
  
  // Log table state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();

  // Simulate health check for a single service
  const performHealthCheck = async (serviceId: string): Promise<ServiceStatus> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate random status
    const random = Math.random();
    if (random > 0.7) return 'error';
    if (random > 0.1) return 'ok';
    return 'unknown';
  };

  const handleSingleHealthCheck = async (serviceId: string) => {
    setCheckingServices((prev) => new Set(prev).add(serviceId));
    
    try {
      const status = await performHealthCheck(serviceId);
      const responseTime = status === 'ok' ? Math.floor(Math.random() * 500) + 50 : null;
      
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                status,
                lastChecked: new Date().toISOString(),
                responseTime,
              }
            : s
        )
      );

      toast({
        title: 'Health Check Selesai',
        description: `${services.find((s) => s.id === serviceId)?.name}: ${status.toUpperCase()}`,
        variant: status === 'error' ? 'destructive' : 'default',
      });
    } catch (error) {
      toast({
        title: 'Health Check Gagal',
        description: 'Terjadi kesalahan saat melakukan health check',
        variant: 'destructive',
      });
    } finally {
      setCheckingServices((prev) => {
        const next = new Set(prev);
        next.delete(serviceId);
        return next;
      });
    }
  };

  const handleBulkHealthCheck = async () => {
    const serviceIds = selectedServicesForCheck.size > 0 
      ? Array.from(selectedServicesForCheck) 
      : services.map((s) => s.id);
    
    if (serviceIds.length === 0) {
      toast({
        title: 'Pilih Servis',
        description: 'Pilih minimal satu servis untuk health check',
        variant: 'destructive',
      });
      return;
    }

    setIsBulkChecking(true);
    setCheckingServices(new Set(serviceIds));

    for (const serviceId of serviceIds) {
      try {
        const status = await performHealthCheck(serviceId);
        const responseTime = status === 'ok' ? Math.floor(Math.random() * 500) + 50 : null;
        
        setServices((prev) =>
          prev.map((s) =>
            s.id === serviceId
              ? {
                  ...s,
                  status,
                  lastChecked: new Date().toISOString(),
                  responseTime,
                }
              : s
          )
        );
      } catch (error) {
        console.error(`Health check failed for ${serviceId}`, error);
      }
    }

    setIsBulkChecking(false);
    setCheckingServices(new Set());
    setSelectedServicesForCheck(new Set());

    toast({
      title: 'Bulk Health Check Selesai',
      description: `${serviceIds.length} servis telah dicek`,
    });
  };

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServicesForCheck((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  };

  const selectAllServices = () => {
    if (selectedServicesForCheck.size === services.length) {
      setSelectedServicesForCheck(new Set());
    } else {
      setSelectedServicesForCheck(new Set(services.map((s) => s.id)));
    }
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    let result = [...mockServiceLogs];

    if (searchQuery) {
      result = result.filter(
        (log) =>
          log.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.detailLog.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((log) => log.status === statusFilter);
    }

    if (serviceFilter !== 'all') {
      result = result.filter((log) => log.serviceName === serviceFilter);
    }

    return result;
  }, [searchQuery, statusFilter, serviceFilter]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, serviceFilter]);

  return (
    <Layout>
      <div id="service-log-page" className="space-y-6">
        {/* Header */}
        <div id="service-log-header">
          <h1 id="service-log-title" className="text-2xl lg:text-3xl font-bold text-foreground">
            Log Servis
          </h1>
          <p id="service-log-subtitle" className="text-muted-foreground mt-1">
            Monitoring status dan log aktivitas servis
          </p>
        </div>

        {/* Health Check Section */}
        <Card id="health-check-section">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle id="health-check-title" className="text-lg">
                Status Servis
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  id="select-all-services-btn"
                  variant="outline"
                  size="sm"
                  onClick={selectAllServices}
                  disabled={isBulkChecking}
                >
                  {selectedServicesForCheck.size === services.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </Button>
                <Button
                  id="bulk-health-check-btn"
                  onClick={handleBulkHealthCheck}
                  disabled={isBulkChecking}
                  className="gap-2"
                >
                  {isBulkChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengecek...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      {selectedServicesForCheck.size > 0
                        ? `Health Check (${selectedServicesForCheck.size})`
                        : 'Health Check Semua'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div id="services-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  id={`service-card-${service.id}`}
                  className="relative"
                >
                  <div className="absolute top-4 left-4 z-10">
                    <Checkbox
                      id={`select-service-${service.id}`}
                      checked={selectedServicesForCheck.has(service.id)}
                      onCheckedChange={() => toggleServiceSelection(service.id)}
                      disabled={isBulkChecking}
                    />
                  </div>
                  <div className="pl-10">
                    <ServiceStatusIndicator
                      id={service.id}
                      name={service.name}
                      status={service.status}
                      lastChecked={service.lastChecked}
                      responseTime={service.responseTime}
                      isChecking={checkingServices.has(service.id)}
                      onHealthCheck={() => handleSingleHealthCheck(service.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Log Table Section */}
        <Card id="log-table-section">
          <CardHeader>
            <CardTitle id="log-table-title" className="text-lg">
              Log Aktivitas Worker
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div id="log-filters" className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="log-search-input"
                  placeholder="Cari log..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="log-status-filter" className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent id="log-status-filter-content">
                  <SelectItem id="log-status-all" value="all">Semua Status</SelectItem>
                  <SelectItem id="log-status-ok" value="ok">Ok</SelectItem>
                  <SelectItem id="log-status-error" value="error">Error</SelectItem>
                  <SelectItem id="log-status-warning" value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={serviceFilter}
                onValueChange={setServiceFilter}
              >
                <SelectTrigger id="log-service-filter" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter Servis" />
                </SelectTrigger>
                <SelectContent id="log-service-filter-content">
                  <SelectItem id="log-service-all" value="all">Semua Servis</SelectItem>
                  {services.map((s) => (
                    <SelectItem
                      key={s.id}
                      id={`log-service-${s.id}`}
                      value={s.name}
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <ServiceLogTable
              logs={filteredLogs}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ServiceLog;
