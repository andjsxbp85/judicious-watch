import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import DomainDetailModal from "@/components/DomainDetailModal";
import CrawlKeywordModal from "@/components/CrawlKeywordModal";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Check,
  MoreHorizontal,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { domainService } from "@/services/domainService";
import type { FrontendDomain } from "@/types/domainTypes";
import type { GetDomainsParams, SortBy, SortOrder } from "@/types/domainTypes";

const ITEMS_PER_PAGE = 10;

type DomainStatus = FrontendDomain["status"];

const getStatusBadgeClass = (status: DomainStatus) => {
  switch (status) {
    case "judol":
      return "badge-judol";
    case "non-judol":
      return "badge-non-judol";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusLabel = (status: DomainStatus) => {
  switch (status) {
    case "judol":
      return "Judol";
    case "non-judol":
      return "Non Judol";
    default:
      return "Not Verified";
  }
};

/**
 * Truncate URL to specified length with ellipsis
 */
const truncateUrl = (url: string, maxLength: number = 25): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
};

const Verification: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Data state
  const [domains, setDomains] = useState<FrontendDomain[]>([]);
  const [totalDomains, setTotalDomains] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<SortBy>("domain");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedDomain, setSelectedDomain] = useState<FrontendDomain | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [crawlModalOpen, setCrawlModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Temporary filter states (before applying)
  const [tempStatusFilter, setTempStatusFilter] = useState<string>("all");
  const [tempScoreRange, setTempScoreRange] = useState<[number, number]>([
    0, 100,
  ]);
  const [tempReasoningFilter, setTempReasoningFilter] = useState<string>("all");

  // Applied filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [reasoningFilter, setReasoningFilter] = useState<string>("all");

  // Selected rows for bulk action
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Check if any filter is active
  const hasActiveFilters =
    statusFilter !== "all" ||
    scoreRange[0] !== 0 ||
    scoreRange[1] !== 100 ||
    reasoningFilter !== "all";

  // Fetch domains from API
  const fetchDomains = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Map frontend status filter to API status
      let apiStatus: GetDomainsParams["status"] = undefined;
      if (statusFilter === "judol") apiStatus = "judol";
      else if (statusFilter === "non-judol") apiStatus = "non_judol";
      else if (statusFilter === "not-verified") apiStatus = "not_verified";

      // Map frontend reasoning filter to API reasoning
      let apiReasoning: GetDomainsParams["reasoning"] = undefined;
      if (reasoningFilter === "ada") apiReasoning = "has_reasoning";
      else if (reasoningFilter === "tidak-ada") apiReasoning = "no_reasoning";

      const params: GetDomainsParams = {
        search: searchQuery || undefined,
        status: apiStatus,
        min_score: scoreRange[0],
        max_score: scoreRange[1],
        reasoning: apiReasoning,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort_by: sortColumn,
        order: sortOrder,
      };

      const result = await domainService.getDomainsForFrontend(params);
      setDomains(result.domains);
      setTotalDomains(result.total);
    } catch (err) {
      console.error("Failed to fetch domains:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch domains");
      toast({
        title: "Error",
        description: "Gagal memuat data domain",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    statusFilter,
    scoreRange,
    reasoningFilter,
    currentPage,
    sortColumn,
    sortOrder,
    toast,
  ]);

  // Fetch domains on mount and when filters change
  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(totalDomains / ITEMS_PER_PAGE);

  // Apply filters
  const applyFilters = () => {
    setStatusFilter(tempStatusFilter);
    setScoreRange(tempScoreRange);
    setReasoningFilter(tempReasoningFilter);
    setCurrentPage(1);
    setFilterOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setTempStatusFilter("all");
    setTempScoreRange([0, 100]);
    setTempReasoningFilter("all");
    setStatusFilter("all");
    setScoreRange([0, 100]);
    setReasoningFilter("all");
    setCurrentPage(1);
  };

  // Sync temp states when filter popover opens
  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      setTempStatusFilter(statusFilter);
      setTempScoreRange(scoreRange);
      setTempReasoningFilter(reasoningFilter);
    }
    setFilterOpen(open);
  };

  // Handle column sorting
  const handleSort = (column: SortBy) => {
    if (sortColumn === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Get sort icon for column
  const getSortIcon = (column: SortBy) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const handleViewDetail = (domain: FrontendDomain) => {
    setSelectedDomain(domain);
    setModalOpen(true);
  };

  const handleVerify = (
    domainId: string,
    status: "not-verified" | "judol" | "non-judol",
    reasoning?: string
  ) => {
    const verifierName = user?.username || "Unknown User";

    // Update local state optimistically
    setDomains((prev) =>
      prev.map((d) =>
        d.id === domainId
          ? {
              ...d,
              status,
            }
          : d
      )
    );

    // Update selectedDomain if it's the one being verified
    if (selectedDomain?.id === domainId) {
      setSelectedDomain((prev) =>
        prev
          ? {
              ...prev,
              status,
            }
          : null
      );
    }

    // TODO: Call API to persist verification
  };

  // Toggle row selection
  const toggleRowSelection = (domainId: string) => {
    setSelectedRows((prev) =>
      prev.includes(domainId)
        ? prev.filter((id) => id !== domainId)
        : [...prev, domainId]
    );
  };

  // Toggle select all rows
  const toggleSelectAll = () => {
    if (selectedRows.length === domains.length && domains.length > 0) {
      // Deselect all
      setSelectedRows([]);
    } else {
      // Select all visible domains
      setSelectedRows(domains.map((d) => d.id));
    }
  };

  // Check if all visible rows are selected
  const isAllSelected =
    domains.length > 0 && selectedRows.length === domains.length;
  const isSomeSelected =
    selectedRows.length > 0 && selectedRows.length < domains.length;

  // LLM processing state
  const [isProcessingLLM, setIsProcessingLLM] = useState(false);

  // Handle bulk AI reasoning
  const handleBulkAIReasoning = async () => {
    if (selectedRows.length === 0) {
      toast({
        title: "Tidak ada domain yang dipilih",
        description:
          "Pilih setidaknya satu domain untuk melakukan bulk action.",
        variant: "destructive",
      });
      return;
    }

    // Get domain names from selected IDs
    const selectedDomainNames = domains
      .filter((d) => selectedRows.includes(d.id))
      .map((d) => d.domain);

    if (selectedDomainNames.length === 0) {
      toast({
        title: "Domain tidak ditemukan",
        description: "Tidak dapat menemukan domain yang dipilih.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingLLM(true);

    toast({
      title: "AI Reasoning dimulai",
      description: `Memproses ${selectedDomainNames.length} domain yang dipilih...`,
    });

    try {
      const results = await domainService.sendBulkToLLM(
        selectedDomainNames,
        (current, total, domain) => {
          // Optional: Show progress toast for each domain
          console.log(`Processing ${current}/${total}: ${domain}`);
        }
      );

      // Count successes and failures
      const successCount = results.filter((r) => r.result !== null).length;
      const failureCount = results.filter((r) => r.error !== null).length;

      toast({
        title: "AI Reasoning selesai",
        description: `Berhasil: ${successCount}, Gagal: ${failureCount} dari ${results.length} domain`,
        variant: failureCount > 0 ? "destructive" : "default",
      });

      // Clear selection and refresh data
      setSelectedRows([]);
      fetchDomains();
    } catch (err) {
      console.error("Bulk AI reasoning failed:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Gagal melakukan AI reasoning",
        variant: "destructive",
      });
    } finally {
      setIsProcessingLLM(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1
            id="verification-title"
            className="text-2xl lg:text-3xl font-bold text-foreground"
          >
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter Popover */}
              <Popover open={filterOpen} onOpenChange={handleFilterOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    id="filter-button"
                    variant="outline"
                    className={`w-full sm:w-auto ${
                      hasActiveFilters ? "border-primary text-primary" : ""
                    }`}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {hasActiveFilters && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        !
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  id="filter-popover"
                  className="w-80 bg-popover border border-border"
                  align="start"
                >
                  <div id="filter-content" className="space-y-4">
                    <div
                      id="filter-header"
                      className="flex items-center justify-between"
                    >
                      <h4
                        id="filter-title"
                        className="font-medium text-foreground"
                      >
                        Filter
                      </h4>
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
                      <Label
                        id="filter-status-label"
                        className="text-sm font-medium"
                      >
                        Status
                      </Label>
                      <Select
                        value={tempStatusFilter}
                        onValueChange={setTempStatusFilter}
                      >
                        <SelectTrigger
                          id="status-filter-select"
                          className="w-full"
                        >
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent
                          id="status-filter-dropdown"
                          className="bg-popover border border-border"
                        >
                          <SelectItem id="status-filter-all" value="all">
                            Semua Status
                          </SelectItem>
                          <SelectItem id="status-filter-judol" value="judol">
                            Judol
                          </SelectItem>
                          <SelectItem
                            id="status-filter-non-judol"
                            value="non-judol"
                          >
                            Non Judol
                          </SelectItem>
                          <SelectItem
                            id="status-filter-not-verified"
                            value="not-verified"
                          >
                            Not Verified
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Score Range Filter */}
                    <div id="filter-score-section" className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label
                          id="filter-score-label"
                          className="text-sm font-medium"
                        >
                          Score
                        </Label>
                        <span
                          id="filter-score-value"
                          className="text-sm text-muted-foreground"
                        >
                          {tempScoreRange[0]} - {tempScoreRange[1]}
                        </span>
                      </div>
                      <Slider
                        id="score-range-slider"
                        value={tempScoreRange}
                        onValueChange={(value) =>
                          setTempScoreRange(value as [number, number])
                        }
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div
                        id="filter-score-labels"
                        className="flex justify-between text-xs text-muted-foreground"
                      >
                        <span id="filter-score-min-label">0</span>
                        <span id="filter-score-max-label">100</span>
                      </div>
                    </div>

                    {/* Reasoning Filter */}
                    <div id="filter-reasoning-section" className="space-y-2">
                      <Label
                        id="filter-reasoning-label"
                        className="text-sm font-medium"
                      >
                        Reasoning
                      </Label>
                      <Select
                        value={tempReasoningFilter}
                        onValueChange={setTempReasoningFilter}
                      >
                        <SelectTrigger
                          id="reasoning-filter-select"
                          className="w-full"
                        >
                          <SelectValue placeholder="Pilih Reasoning" />
                        </SelectTrigger>
                        <SelectContent
                          id="reasoning-filter-dropdown"
                          className="bg-popover border border-border"
                        >
                          <SelectItem id="reasoning-filter-all" value="all">
                            Semua
                          </SelectItem>
                          <SelectItem id="reasoning-filter-ada" value="ada">
                            Ada
                          </SelectItem>
                          <SelectItem
                            id="reasoning-filter-tidak-ada"
                            value="tidak-ada"
                          >
                            Tidak Ada
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                Daftar Domain ({totalDomains})
                {selectedRows.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedRows.length} dipilih
                  </Badge>
                )}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="bulk-action-button"
                    variant="outline"
                    size="sm"
                    disabled={isProcessingLLM}
                  >
                    {isProcessingLLM ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                    )}
                    {isProcessingLLM ? "Memproses..." : "Bulk Action"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent id="bulk-action-dropdown" align="end">
                  <DropdownMenuItem
                    id="bulk-action-ai-reasoning"
                    onClick={handleBulkAIReasoning}
                    disabled={isProcessingLLM}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Lakukan AI Reasoning
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table id="domain-table">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead id="table-header-checkbox" className="w-[50px]">
                      <Checkbox
                        id="select-all-checkbox"
                        checked={isAllSelected || isSomeSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all domains"
                      />
                    </TableHead>
                    <TableHead
                      id="table-header-domain"
                      className="w-[300px] cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort("domain")}
                    >
                      <div className="flex items-center">
                        Domain
                        {getSortIcon("domain")}
                      </div>
                    </TableHead>
                    <TableHead id="table-header-status" className="w-[120px]">
                      <div className="flex items-center">Status</div>
                    </TableHead>
                    <TableHead
                      id="table-header-score"
                      className="w-[120px] cursor-pointer select-none hover:bg-muted/80 transition-colors"
                      onClick={() => handleSort("score")}
                    >
                      <div className="flex items-center">
                        Score
                        {getSortIcon("score")}
                      </div>
                    </TableHead>
                    <TableHead
                      id="table-header-screenshot"
                      className="w-[120px] hidden md:table-cell"
                    >
                      Screenshot
                    </TableHead>
                    <TableHead
                      id="table-header-verifikator"
                      className="w-[120px] hidden lg:table-cell"
                    >
                      Verifikator
                    </TableHead>
                    <TableHead
                      id="table-header-aksi"
                      className="w-[100px] text-right"
                    >
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-muted-foreground">
                            Memuat data...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-12 text-destructive"
                      >
                        {error}
                        <Button
                          variant="link"
                          onClick={fetchDomains}
                          className="ml-2"
                        >
                          Coba lagi
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : domains.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-12 text-muted-foreground"
                      >
                        Tidak ada domain yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    domains.map((domain) => (
                      <TableRow
                        key={domain.id}
                        id={`domain-row-${domain.id}`}
                        className={`hover:bg-muted/30 transition-colors ${
                          selectedRows.includes(domain.id) ? "bg-muted/50" : ""
                        }`}
                      >
                        <TableCell>
                          <Checkbox
                            id={`domain-checkbox-${domain.id}`}
                            checked={selectedRows.includes(domain.id)}
                            onCheckedChange={() =>
                              toggleRowSelection(domain.id)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span
                              id={`domain-name-${domain.id}`}
                              className="font-medium break-all"
                            >
                              {domain.domain}
                            </span>
                            {domain.url && (
                              <a
                                id={`domain-url-${domain.id}`}
                                href={domain.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-primary flex items-start gap-1"
                                title={domain.url}
                              >
                                <span>{truncateUrl(domain.url, 25)}</span>
                                <ExternalLink className="h-3 w-3 shrink-0 mt-0.5" />
                              </a>
                            )}
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
                                    domain.status === "not-verified"
                                      ? "hsl(220, 9%, 46%)"
                                      : domain.status === "judol"
                                      ? "hsl(0, 84%, 60%)"
                                      : "hsl(160, 84%, 39%)",
                                }}
                              />
                            </div>
                            <span
                              id={`confidence-score-value-${domain.id}`}
                              className={`text-sm font-medium ${
                                domain.status === "not-verified"
                                  ? "text-muted-foreground"
                                  : domain.status === "judol"
                                  ? "text-red-500"
                                  : "text-green-500"
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
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/screenshots/placeholder.png";
                            }}
                          />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span
                            id={`domain-verifier-${domain.id}`}
                            className="text-sm text-muted-foreground"
                          >
                            {domain.verifiedBy || "-"}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p
                  id="pagination-info"
                  className="text-sm text-muted-foreground"
                >
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalDomains)} dari{" "}
                  {totalDomains} domain
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    id="pagination-prev-button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      // Show pages around current page
                      let page: number;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={page}
                          id={`pagination-page-${page}`}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                          disabled={isLoading}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    id="pagination-next-button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || isLoading}
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
        domainId={selectedDomain?.id || null}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onVerify={handleVerify}
      />

      {/* Crawl Keyword Modal */}
      <CrawlKeywordModal
        open={crawlModalOpen}
        onOpenChange={setCrawlModalOpen}
        onCrawlSuccess={() => fetchDomains()}
      />
    </Layout>
  );
};

export default Verification;
