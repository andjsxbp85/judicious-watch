import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import DomainDetailModal from '@/components/DomainDetailModal';
import CrawlKeywordModal from '@/components/CrawlKeywordModal';
import { Domain } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useDomains } from '@/contexts/DomainsContext';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Globe,
  X,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 8;

const getStatusBadgeClass = (status: Domain['status']) => {
  switch (status) {
    case 'judol':
      return 'badge-judol';
    case 'non-judol':
      return 'badge-non-judol';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusLabel = (status: Domain['status']) => {
  switch (status) {
    case 'judol':
      return 'Judol';
    case 'non-judol':
      return 'Non Judol';
    default:
      return 'Not Verified';
  }
};

type SortColumn = 'domain' | 'status' | 'score' | 'verifikator';
type SortOrder = 'asc' | 'desc';

const Verification: React.FC = () => {
  const { user } = useAuth();
  const { domains, setDomains } = useDomains();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [crawlModalOpen, setCrawlModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const { toast } = useToast();

  // Temporary filter states (before applying)
  const [tempStatusFilter, setTempStatusFilter] = useState<string>('all');
  const [tempScoreRange, setTempScoreRange] = useState<[number, number]>([0, 100]);
  const [tempReasoningFilter, setTempReasoningFilter] = useState<string>('all');
  const [tempSelectedVerifikators, setTempSelectedVerifikators] = useState<string[]>([]);
  const [verifikatorSearchInput, setVerifikatorSearchInput] = useState('');

  // Applied filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [reasoningFilter, setReasoningFilter] = useState<string>('all');
  const [selectedVerifikators, setSelectedVerifikators] = useState<string[]>([]);

  // Get unique verifikators for search
  const uniqueVerifikators = useMemo(() => {
    const verifikators = domains
      .map(d => d.verifiedBy)
      .filter((v): v is string => v !== null && v !== undefined);
    return [...new Set(verifikators)];
  }, [domains]);

  // Filter suggestions based on search
  const filteredVerifikators = useMemo(() => {
    return uniqueVerifikators.filter(v =>
      v.toLowerCase().includes(verifikatorSearchInput.toLowerCase())
    );
  }, [uniqueVerifikators, verifikatorSearchInput]);

  // Check if any filter is active
  const hasActiveFilters = statusFilter !== 'all' || 
    scoreRange[0] !== 0 || 
    scoreRange[1] !== 100 || 
    reasoningFilter !== 'all' || 
    selectedVerifikators.length > 0;

  // Apply filters
  const applyFilters = () => {
    setStatusFilter(tempStatusFilter);
    setScoreRange(tempScoreRange);
    setReasoningFilter(tempReasoningFilter);
    setSelectedVerifikators(tempSelectedVerifikators);
    setCurrentPage(1);
    setFilterOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setTempStatusFilter('all');
    setTempScoreRange([0, 100]);
    setTempReasoningFilter('all');
    setTempSelectedVerifikators([]);
    setVerifikatorSearchInput('');
    setStatusFilter('all');
    setScoreRange([0, 100]);
    setReasoningFilter('all');
    setSelectedVerifikators([]);
    setCurrentPage(1);
  };

  // Sync temp states when filter popover opens
  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      setTempStatusFilter(statusFilter);
      setTempScoreRange(scoreRange);
      setTempReasoningFilter(reasoningFilter);
      setTempSelectedVerifikators(selectedVerifikators);
    }
    setFilterOpen(open);
  };

  // Handle column sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  // Get sort icon for column
  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

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

    // Score range filter
    result = result.filter(d => 
      d.confidenceScore >= scoreRange[0] && d.confidenceScore <= scoreRange[1]
    );

    // Reasoning filter
    if (reasoningFilter === 'ada') {
      result = result.filter(d => d.reasoning && d.reasoning.trim() !== '');
    } else if (reasoningFilter === 'tidak-ada') {
      result = result.filter(d => !d.reasoning || d.reasoning.trim() === '');
    }

    // Verifikator filter (multiple selection)
    if (selectedVerifikators.length > 0) {
      result = result.filter(d => 
        d.verifiedBy && selectedVerifikators.includes(d.verifiedBy)
      );
    }

    // Sorting based on selected column
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortColumn) {
        case 'domain':
          comparison = a.domain.localeCompare(b.domain);
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'score':
          comparison = a.confidenceScore - b.confidenceScore;
          break;
        case 'verifikator':
          comparison = (a.verifiedBy || '').localeCompare(b.verifiedBy || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [domains, searchQuery, statusFilter, scoreRange, reasoningFilter, selectedVerifikators, sortColumn, sortOrder]);

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

  const handleVerify = (domainId: string, status: 'not-verified' | 'judol' | 'non-judol', reasoning?: string) => {
    const verifierName = user?.username || 'Unknown User';
    
    setDomains(prev =>
      prev.map(d =>
        d.id === domainId
          ? { 
              ...d, 
              status, 
              reasoning: reasoning ?? d.reasoning,
              verifiedBy: status === 'not-verified' ? null : verifierName, 
              verifiedAt: status === 'not-verified' ? null : new Date().toISOString() 
            }
          : d
      )
    );
    
    // Update selectedDomain if it's the one being verified
    if (selectedDomain?.id === domainId) {
      setSelectedDomain(prev => prev ? {
        ...prev,
        status,
        reasoning: reasoning ?? prev.reasoning,
        verifiedBy: status === 'not-verified' ? null : verifierName,
        verifiedAt: status === 'not-verified' ? null : new Date().toISOString()
      } : null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 id="verification-title" className="text-2xl lg:text-3xl font-bold text-foreground">
            Verifikasi Domain
          </h1>
          <p id="verification-subtitle" className="text-muted-foreground mt-1">
            Kelola dan verifikasi hasil crawling domain
          </p>
        </div>

        {/* Filters */}
        <Card id="filter-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-domain-input"
                  placeholder="Cari domain..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Filter Popover */}
              <Popover open={filterOpen} onOpenChange={handleFilterOpenChange}>
                <PopoverTrigger asChild>
                  <Button 
                    id="filter-button" 
                    variant="outline" 
                    className={`w-full sm:w-auto ${hasActiveFilters ? 'border-primary text-primary' : ''}`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        !
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent id="filter-popover" className="w-80 bg-popover border border-border" align="start">
                  <div id="filter-content" className="space-y-4">
                    <div id="filter-header" className="flex items-center justify-between">
                      <h4 id="filter-title" className="font-medium text-foreground">Filter</h4>
                      {hasActiveFilters && (
                        <Button 
                          id="filter-reset-button"
                          variant="ghost" 
                          size="sm" 
                          onClick={resetFilters}
                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      )}
                    </div>

                    {/* Status Filter */}
                    <div id="filter-status-section" className="space-y-2">
                      <Label id="filter-status-label" className="text-sm font-medium">Status</Label>
                      <Select
                        value={tempStatusFilter}
                        onValueChange={setTempStatusFilter}
                      >
                        <SelectTrigger id="status-filter-select" className="w-full">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent id="status-filter-dropdown" className="bg-popover border border-border">
                          <SelectItem id="status-filter-all" value="all">Semua Status</SelectItem>
                          <SelectItem id="status-filter-judol" value="judol">Judol</SelectItem>
                          <SelectItem id="status-filter-non-judol" value="non-judol">Non Judol</SelectItem>
                          <SelectItem id="status-filter-not-verified" value="not-verified">Not Verified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Score Range Filter */}
                    <div id="filter-score-section" className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label id="filter-score-label" className="text-sm font-medium">Score</Label>
                        <span id="filter-score-value" className="text-sm text-muted-foreground">
                          {tempScoreRange[0]} - {tempScoreRange[1]}
                        </span>
                      </div>
                      <Slider
                        id="score-range-slider"
                        value={tempScoreRange}
                        onValueChange={(value) => setTempScoreRange(value as [number, number])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div id="filter-score-labels" className="flex justify-between text-xs text-muted-foreground">
                        <span id="filter-score-min-label">0</span>
                        <span id="filter-score-max-label">100</span>
                      </div>
                    </div>

                    {/* Reasoning Filter */}
                    <div id="filter-reasoning-section" className="space-y-2">
                      <Label id="filter-reasoning-label" className="text-sm font-medium">Reasoning</Label>
                      <Select
                        value={tempReasoningFilter}
                        onValueChange={setTempReasoningFilter}
                      >
                        <SelectTrigger id="reasoning-filter-select" className="w-full">
                          <SelectValue placeholder="Pilih Reasoning" />
                        </SelectTrigger>
                        <SelectContent id="reasoning-filter-dropdown" className="bg-popover border border-border">
                          <SelectItem id="reasoning-filter-all" value="all">Semua</SelectItem>
                          <SelectItem id="reasoning-filter-ada" value="ada">Ada</SelectItem>
                          <SelectItem id="reasoning-filter-tidak-ada" value="tidak-ada">Tidak Ada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Verifikator Multi-Select Filter */}
                    <div id="filter-verifikator-section" className="space-y-2">
                      <Label id="filter-verifikator-label" className="text-sm font-medium">Verifikator</Label>
                      <div className="relative">
                        <Input
                          id="verifikator-search-input"
                          placeholder="Cari verifikator..."
                          value={verifikatorSearchInput}
                          onChange={(e) => setVerifikatorSearchInput(e.target.value)}
                          className="w-full"
                        />
                        {verifikatorSearchInput && (
                          <Button
                            id="verifikator-search-clear"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setVerifikatorSearchInput('')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Selected verifikators badges */}
                      {tempSelectedVerifikators.length > 0 && (
                        <div id="selected-verifikators" className="flex flex-wrap gap-1 mt-2">
                          {tempSelectedVerifikators.map((v) => (
                            <Badge 
                              key={v} 
                              id={`selected-verifikator-${v.replace(/\s+/g, '-')}`}
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => setTempSelectedVerifikators(prev => prev.filter(x => x !== v))}
                            >
                              {v}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Suggestions dropdown */}
                      {verifikatorSearchInput && filteredVerifikators.filter(v => !tempSelectedVerifikators.includes(v)).length > 0 && (
                        <div id="verifikator-suggestions" className="absolute z-10 w-full mt-1 max-h-32 overflow-y-auto border border-border rounded-md bg-popover shadow-md">
                          {filteredVerifikators
                            .filter(v => !tempSelectedVerifikators.includes(v))
                            .map((v) => (
                              <button
                                key={v}
                                id={`verifikator-suggestion-${v.replace(/\s+/g, '-')}`}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                                onClick={() => {
                                  setTempSelectedVerifikators(prev => [...prev, v]);
                                  setVerifikatorSearchInput('');
                                }}
                              >
                                {v}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Apply Filter Button */}
                    <Button
                      id="apply-filter-button"
                      className="w-full"
                      onClick={applyFilters}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Apply Filter
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>


              {/* Crawl New URL */}
              <Button
                id="crawl-new-url-button"
                onClick={() => setCrawlModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Globe className="h-4 w-4 mr-2" />
                Crawl New URL
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card id="domain-table-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle id="domain-count-title" className="text-lg">
                Daftar Domain ({filteredDomains.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table id="domain-table">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead 
                      id="table-header-domain"
                      className="w-[300px] cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort('domain')}
                    >
                      <div className="flex items-center">
                        Domain
                        {getSortIcon('domain')}
                      </div>
                    </TableHead>
                    <TableHead 
                      id="table-header-status"
                      className="w-[120px] cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead 
                      id="table-header-score"
                      className="w-[120px] cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center">
                        Score
                        {getSortIcon('score')}
                      </div>
                    </TableHead>
                    <TableHead id="table-header-screenshot" className="w-[150px] hidden md:table-cell">Screenshot</TableHead>
                    <TableHead 
                      id="table-header-verifikator"
                      className="w-[120px] hidden lg:table-cell cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort('verifikator')}
                    >
                      <div className="flex items-center">
                        Verifikator
                        {getSortIcon('verifikator')}
                      </div>
                    </TableHead>
                    <TableHead id="table-header-aksi" className="w-[100px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDomains.map((domain) => (
                    <TableRow 
                      key={domain.id}
                      id={`domain-row-${domain.id}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span id={`domain-name-${domain.id}`} className="font-medium truncate max-w-[280px]">
                            {domain.domain}
                          </span>
                          <a
                            id={`domain-url-${domain.id}`}
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
                        <Badge 
                          id={`domain-status-badge-${domain.id}`}
                          className={getStatusBadgeClass(domain.status)}
                        >
                          {getStatusLabel(domain.status)}
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
                                  domain.status === 'not-verified'
                                    ? 'hsl(220, 9%, 46%)'
                                    : domain.status === 'judol'
                                      ? 'hsl(0, 84%, 60%)'
                                      : 'hsl(160, 84%, 39%)',
                              }}
                            />
                          </div>
                          <span 
                            id={`confidence-score-value-${domain.id}`}
                            className={`text-sm font-medium ${
                              domain.status === 'not-verified'
                                ? 'text-muted-foreground'
                                : domain.status === 'judol'
                                  ? 'text-red-500'
                                  : 'text-green-500'
                            }`}
                          >
                            {domain.confidenceScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <img
                          id={`domain-screenshot-${domain.id}`}
                          src={domain.screenshot}
                          alt={domain.domain}
                          className="w-24 h-14 object-cover rounded border border-border"
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span id={`domain-verifier-${domain.id}`} className="text-sm text-muted-foreground">
                          {domain.verifiedBy || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          id={`domain-detail-button-${domain.id}`}
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
                <p id="pagination-info" className="text-sm text-muted-foreground">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredDomains.length)} dari{' '}
                  {filteredDomains.length} domain
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    id="pagination-prev-button"
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
                        id={`pagination-page-${page}`}
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
                    id="pagination-next-button"
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

      {/* Crawl Keyword Modal */}
      <CrawlKeywordModal
        open={crawlModalOpen}
        onOpenChange={setCrawlModalOpen}
      />
    </Layout>
  );
};

export default Verification;