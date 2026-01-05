import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import DomainDetailModal from '@/components/DomainDetailModal';
import { mockDomains, Domain } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 8;

const Verification: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [domains, setDomains] = useState(mockDomains);
  const { toast } = useToast();

  // Filtered and sorted data
  const filteredDomains = useMemo(() => {
    let result = [...domains];

    // Search filter
    if (searchQuery) {
      result = result.filter(d =>
        d.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    // Sort by confidence score
    result.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.confidenceScore - a.confidenceScore
        : a.confidenceScore - b.confidenceScore;
    });

    return result;
  }, [domains, searchQuery, statusFilter, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredDomains.length / ITEMS_PER_PAGE);
  const paginatedDomains = filteredDomains.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewDetail = (domain: Domain) => {
    setSelectedDomain(domain);
    setModalOpen(true);
  };

  const handleVerify = (domainId: string, status: 'judol' | 'non-judol') => {
    setDomains(prev =>
      prev.map(d =>
        d.id === domainId
          ? { ...d, status, verifiedBy: 'Current User', verifiedAt: new Date().toISOString() }
          : d
      )
    );
    setModalOpen(false);
    toast({
      title: 'Verifikasi Berhasil',
      description: `Domain telah ditandai sebagai ${status === 'judol' ? 'Judi Online' : 'Non Judi Online'}`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Verifikasi Domain
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola dan verifikasi hasil crawling domain
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari domain..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="judol">Judi Online</SelectItem>
                  <SelectItem value="non-judol">Non Judi Online</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="w-full sm:w-auto"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Score {sortOrder === 'desc' ? '↓' : '↑'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Daftar Domain ({filteredDomains.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[300px]">Domain</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">Score</TableHead>
                    <TableHead className="w-[150px] hidden md:table-cell">Screenshot</TableHead>
                    <TableHead className="w-[120px] hidden lg:table-cell">Verifikator</TableHead>
                    <TableHead className="w-[100px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDomains.map((domain) => (
                    <TableRow 
                      key={domain.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium truncate max-w-[280px]">
                            {domain.domain}
                          </span>
                          <a
                            href={domain.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate max-w-[280px]"
                          >
                            {domain.url}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={domain.status === 'judol' ? 'badge-judol' : 'badge-non-judol'}>
                          {domain.status === 'judol' ? 'Judol' : 'Non Judol'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="confidence-bar w-16">
                            <div
                              className="confidence-fill"
                              style={{
                                width: `${domain.confidenceScore}%`,
                                backgroundColor:
                                  domain.confidenceScore >= 80
                                    ? domain.status === 'judol'
                                      ? 'hsl(0, 84%, 60%)'
                                      : 'hsl(160, 84%, 39%)'
                                    : 'hsl(38, 92%, 50%)',
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{domain.confidenceScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <img
                          src={domain.screenshot}
                          alt={domain.domain}
                          className="w-24 h-14 object-cover rounded border border-border"
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {domain.verifiedBy || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(domain)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedDomains.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Tidak ada domain yang ditemukan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredDomains.length)} dari{' '}
                  {filteredDomains.length} domain
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <DomainDetailModal
        domain={selectedDomain}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onVerify={handleVerify}
      />
    </Layout>
  );
};

export default Verification;
