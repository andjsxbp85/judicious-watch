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
import { Skeleton } from "@/components/ui/skeleton";
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
import { useDomains } from "@/hooks/useDomains";
import { domainService } from "@/services/domainService";
import { cn } from "@/lib/utils";
import type {
  FrontendDomain,
  GetDomainsParams,
  SortBy,
} from "@/types/domainTypes";

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
      return "Manual Check";
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

  // Search and filter states (local to component)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  // Use domains hook with React Query caching
  const {
    domains,
    totalDomains,
    currentPage,
    totalPages,
    itemsPerPage,
    isLoading,
    isFetching,
    error,
    sortColumn,
    sortOrder,
    setCurrentPage,
    setItemsPerPage,
    handleSort,
    refetch,
  } = useDomains({
    searchQuery: debouncedSearch,
    statusFilter,
    scoreRange,
    reasoningFilter,
  });

  // Use domains directly from the hook instead of local state to avoid infinite loop
  const localDomains = domains;

  // Modal states
  const [selectedDomain, setSelectedDomain] = useState<FrontendDomain | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [crawlModalOpen, setCrawlModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Selected rows for bulk action
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Check if any filter is active
  const hasActiveFilters =
    statusFilter !== "all" ||
    scoreRange[0] !== 0 ||
    scoreRange[1] !== 100 ||
    reasoningFilter !== "all";

  // Track failed screenshot images to prevent flickering
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // Get sort icon for column with loading indicator
  const getSortIcon = (column: SortBy) => {
    const isActiveColumn = sortColumn === column;
    const isLoadingThisColumn = isFetching && isActiveColumn;

    if (isLoadingThisColumn) {
      return <Loader2 className="h-4 w-4 ml-1 animate-spin" />;
    }

    if (!isActiveColumn) {
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
    status: "manual-check" | "judol" | "non-judol",
    reasoning?: string
  ) => {
    const verifierName = user?.username || "Unknown User";

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
    // After API call, use refetch() to update the list
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
      setSelectedRows(localDomains.map((d) => d.id));
    }
  };

  // Check if all visible rows are selected
  const isAllSelected =
    localDomains.length > 0 && selectedRows.length === localDomains.length;
  const isSomeSelected =
    selectedRows.length > 0 && selectedRows.length < localDomains.length;

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
    const selectedDomainNames = localDomains
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
      refetch();
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
                        onValueChange={(value) => {
                          setTempStatusFilter(value);
                          // Auto-adjust score range based on status
                          if (value === "judol") {
                            setTempScoreRange([90, 100]);
                          } else if (value === "non-judol") {
                            setTempScoreRange([0, 60]);
                          } else if (value === "manual-check") {
                            setTempScoreRange([60, 80]);
                          } else {
                            setTempScoreRange([0, 100]);
                          }
                        }}
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
                            id="status-filter-manual-check"
                            value="manual-check"
                          >
                            Manual Check
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Score Range Filter - HIDDEN
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
                    */}

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
                      id="table-header-timestamp"
                      className={cn(
                        "w-[150px] cursor-pointer select-none hover:bg-muted/80 transition-colors",
                        isFetching && sortColumn === "timestamp" && "opacity-70"
                      )}
                      onClick={() => handleSort("timestamp")}
                    >
                      <div className="flex items-center">
                        Timestamp
                        {getSortIcon("timestamp")}
                      </div>
                    </TableHead>
                    <TableHead
                      id="table-header-domain"
                      className={cn(
                        "w-[300px] cursor-pointer select-none hover:bg-muted/80 transition-colors",
                        isFetching && sortColumn === "domain" && "opacity-70"
                      )}
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
                      className={cn(
                        "w-[120px] cursor-pointer select-none hover:bg-muted/80 transition-colors",
                        isFetching && sortColumn === "score" && "opacity-70"
                      )}
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
                  {isLoading || (isFetching && localDomains.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
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
                        colSpan={8}
                        className="text-center py-12 text-destructive"
                      >
                        {error}
                        <Button
                          variant="link"
                          onClick={() => refetch()}
                          className="ml-2"
                        >
                          Coba lagi
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : localDomains.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-12 text-muted-foreground"
                      >
                        Tidak ada domain yang ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    localDomains.map((domain) => (
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
                          <span
                            id={`domain-timestamp-${domain.id}`}
                            className="text-xs text-muted-foreground whitespace-nowrap"
                          >
                            {domain.timestamp
                              ? new Date(domain.timestamp).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "-"}
                          </span>
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
                                  width: `${domain.finalScore}%`,
                                  backgroundColor:
                                    domain.status === "manual-check"
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
                                domain.status === "manual-check"
                                  ? "text-muted-foreground"
                                  : domain.status === "judol"
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            >
                              {domain.status === "manual-check" &&
                              domain.finalScore === 0
                                ? "N/A"
                                : `${domain.finalScore}%`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <img
                            id={`domain-screenshot-${domain.id}`}
                            src={
                              failedImages.has(domain.id)
                                ? "/screenshots/placeholder.png"
                                : domain.screenshot
                            }
                            alt={domain.domain}
                            className="w-24 h-14 object-cover rounded border border-border bg-muted"
                            loading="lazy"
                            onError={(e) => {
                              if (!failedImages.has(domain.id)) {
                                setFailedImages((prev) =>
                                  new Set(prev).add(domain.id)
                                );
                                (e.target as HTMLImageElement).src =
                                  "/screenshots/placeholder.png";
                              }
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
            {totalDomains > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <p
                    id="pagination-info"
                    className="text-sm text-muted-foreground"
                  >
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, totalDomains)} dari{" "}
                    {totalDomains} domain
                  </p>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="items-per-page"
                      className="text-sm text-muted-foreground whitespace-nowrap"
                    >
                      Per halaman:
                    </Label>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => setItemsPerPage(Number(value))}
                    >
                      <SelectTrigger
                        id="items-per-page"
                        className="w-[70px] h-8"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      id="pagination-prev-button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
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
                              variant={
                                currentPage === page ? "default" : "ghost"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0"
                              disabled={isLoading}
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      id="pagination-next-button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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
        onCrawlSuccess={() => refetch()}
      />
    </Layout>
  );
};

export default Verification;
