import React, { useState } from 'react';
import { ServiceLog, LogStatus } from '@/types/serviceTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceLogTableProps {
  logs: ServiceLog[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const statusBadgeConfig: Record<LogStatus, { className: string; label: string }> = {
  ok: {
    className: 'bg-success/15 text-success border-success/20',
    label: 'Ok',
  },
  error: {
    className: 'bg-destructive/15 text-destructive border-destructive/20',
    label: 'Error',
  },
  warning: {
    className: 'bg-warning/15 text-warning border-warning/20',
    label: 'Warning',
  },
};

export const ServiceLogTable: React.FC<ServiceLogTableProps> = ({
  logs,
  currentPage,
  itemsPerPage,
  onPageChange,
}) => {
  const [selectedLog, setSelectedLog] = useState<ServiceLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = logs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetail = (log: ServiceLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('id-ID'),
      time: date.toLocaleTimeString('id-ID'),
    };
  };

  return (
    <div id="service-log-table-container">
      <div className="overflow-x-auto">
        <Table id="service-log-table">
          <TableHeader>
            <TableRow>
              <TableHead id="th-timestamp">Waktu</TableHead>
              <TableHead id="th-service-name">Nama Servis</TableHead>
              <TableHead id="th-status-log">Status Log</TableHead>
              <TableHead id="th-detail-log">Detail Log</TableHead>
              <TableHead id="th-actions" className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody id="service-log-table-body">
            {paginatedLogs.map((log) => {
              const { date, time } = formatTimestamp(log.timestamp);
              const statusConfig = statusBadgeConfig[log.status];
              
              return (
                <TableRow key={log.id} id={`log-row-${log.id}`}>
                  <TableCell id={`log-timestamp-${log.id}`}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{date}</span>
                      <span className="text-xs text-muted-foreground">{time}</span>
                    </div>
                  </TableCell>
                  <TableCell id={`log-service-${log.id}`}>
                    <span className="font-medium">{log.serviceName}</span>
                  </TableCell>
                  <TableCell id={`log-status-${log.id}`}>
                    <Badge 
                      className={cn('border', statusConfig.className)}
                      variant="outline"
                    >
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell id={`log-detail-${log.id}`}>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                      {log.detailLog}
                    </span>
                  </TableCell>
                  <TableCell id={`log-actions-${log.id}`} className="text-right">
                    <Button
                      id={`log-view-detail-btn-${log.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div
        id="service-log-pagination"
        className="flex items-center justify-between mt-4"
      >
        <p id="pagination-info" className="text-sm text-muted-foreground">
          Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, logs.length)} dari {logs.length} log
        </p>
        <div className="flex items-center gap-2">
          <Button
            id="pagination-prev-btn"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span id="pagination-current" className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            id="pagination-next-btn"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent id="log-detail-modal" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle id="log-detail-modal-title">Detail Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div id="log-detail-content" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label id="detail-service-label" className="text-sm font-medium text-muted-foreground">
                    Nama Servis
                  </label>
                  <p id="detail-service-value" className="font-medium">{selectedLog.serviceName}</p>
                </div>
                <div>
                  <label id="detail-status-label" className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div id="detail-status-value">
                    <Badge 
                      className={cn('border', statusBadgeConfig[selectedLog.status].className)}
                      variant="outline"
                    >
                      {statusBadgeConfig[selectedLog.status].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label id="detail-timestamp-label" className="text-sm font-medium text-muted-foreground">
                    Waktu
                  </label>
                  <p id="detail-timestamp-value" className="font-medium">
                    {new Date(selectedLog.timestamp).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div>
                <label id="detail-log-label" className="text-sm font-medium text-muted-foreground">
                  Detail Log
                </label>
                <p id="detail-log-value" className="font-medium mt-1">{selectedLog.detailLog}</p>
              </div>
              {selectedLog.requestPayload && (
                <div>
                  <label id="detail-request-payload-label" className="text-sm font-medium text-muted-foreground">
                    Request Payload
                  </label>
                  <pre 
                    id="detail-request-payload-value" 
                    className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto"
                  >
                    {JSON.stringify(JSON.parse(selectedLog.requestPayload), null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.responsePayload && (
                <div>
                  <label id="detail-response-payload-label" className="text-sm font-medium text-muted-foreground">
                    Response Payload
                  </label>
                  <pre 
                    id="detail-response-payload-value" 
                    className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto"
                  >
                    {JSON.stringify(JSON.parse(selectedLog.responsePayload), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
