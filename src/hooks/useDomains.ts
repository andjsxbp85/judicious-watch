import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef } from "react";
import { domainService } from "@/services/domainService";
import type {
  GetDomainsParams,
  FrontendDomain,
  SortBy,
  SortOrder,
} from "@/types/domainTypes";

// Local storage keys
const ITEMS_PER_PAGE_KEY = "verification_items_per_page";

// Default values
const DEFAULT_ITEMS_PER_PAGE = 10;

/**
 * Get items per page from local storage
 */
function getStoredItemsPerPage(): number {
  try {
    const stored = localStorage.getItem(ITEMS_PER_PAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if ([5, 10, 25, 50, 100].includes(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_ITEMS_PER_PAGE;
}

/**
 * Save items per page to local storage
 */
function setStoredItemsPerPage(value: number): void {
  try {
    localStorage.setItem(ITEMS_PER_PAGE_KEY, value.toString());
  } catch {
    // Ignore localStorage errors
  }
}

export interface UseDomainsParams {
  searchQuery?: string;
  statusFilter?: string;
  scoreRange?: [number, number];
  reasoningFilter?: string;
}

export interface UseDomainsReturn {
  // Data
  domains: FrontendDomain[];
  totalDomains: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;

  // State
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;

  // Sorting
  sortColumn: SortBy;
  sortOrder: SortOrder;

  // Actions
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (limit: number) => void;
  setSortColumn: (column: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  handleSort: (column: SortBy) => void;
  refetch: () => void;
}

/**
 * Custom hook for domain data fetching with React Query caching
 * and local storage for user preferences
 */
export function useDomains(params: UseDomainsParams = {}): UseDomainsReturn {
  const {
    searchQuery = "",
    statusFilter = "all",
    scoreRange = [0, 100],
    reasoningFilter = "all",
  } = params;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(() =>
    getStoredItemsPerPage()
  );

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortBy>("domain");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const queryClient = useQueryClient();

  // Update local storage when itemsPerPage changes
  const setItemsPerPage = useCallback((value: number) => {
    setItemsPerPageState(value);
    setStoredItemsPerPage(value);
    // Reset to page 1 when changing items per page
    setCurrentPage(1);
  }, []);

  // Handle column sorting
  const handleSort = useCallback(
    (column: SortBy) => {
      if (sortColumn === column) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(column);
        setSortOrder("asc");
      }
      setCurrentPage(1);
    },
    [sortColumn]
  );

  // Build API params
  const getApiParams = useCallback((): GetDomainsParams => {
    // Map frontend status filter to API status
    let apiStatus: GetDomainsParams["status"] = undefined;
    if (statusFilter === "judol") apiStatus = "judol";
    else if (statusFilter === "non-judol") apiStatus = "non_judol";
    else if (statusFilter === "not-verified") apiStatus = "not_verified";

    // Map frontend reasoning filter to API reasoning
    let apiReasoning: GetDomainsParams["reasoning"] = undefined;
    if (reasoningFilter === "ada") apiReasoning = "has_reasoning";
    else if (reasoningFilter === "tidak-ada") apiReasoning = "no_reasoning";

    return {
      search: searchQuery || undefined,
      status: apiStatus,
      min_score: scoreRange[0],
      max_score: scoreRange[1],
      reasoning: apiReasoning,
      page: currentPage,
      limit: itemsPerPage,
      sort_by: sortColumn,
      order: sortOrder,
    };
  }, [
    searchQuery,
    statusFilter,
    scoreRange,
    reasoningFilter,
    currentPage,
    itemsPerPage,
    sortColumn,
    sortOrder,
  ]);

  // Query key includes all parameters that affect the data
  const queryKey = [
    "domains",
    searchQuery,
    statusFilter,
    scoreRange[0],
    scoreRange[1],
    reasoningFilter,
    currentPage,
    itemsPerPage,
    sortColumn,
    sortOrder,
  ];

  // React Query with caching
  const {
    data,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = getApiParams();
      return domainService.getDomainsForFrontend(params);
    },
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 30 minutes
    gcTime: 30 * 60 * 1000,
    // Show previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Refetch on window focus only if data is stale
    refetchOnWindowFocus: false,
  });

  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({
    searchQuery,
    statusFilter,
    scoreMin: scoreRange[0],
    scoreMax: scoreRange[1],
    reasoningFilter,
  });

  // Reset to page 1 when filters change (avoiding infinite loop)
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged =
      prev.searchQuery !== searchQuery ||
      prev.statusFilter !== statusFilter ||
      prev.scoreMin !== scoreRange[0] ||
      prev.scoreMax !== scoreRange[1] ||
      prev.reasoningFilter !== reasoningFilter;

    if (filtersChanged) {
      setCurrentPage(1);
      prevFiltersRef.current = {
        searchQuery,
        statusFilter,
        scoreMin: scoreRange[0],
        scoreMax: scoreRange[1],
        reasoningFilter,
      };
    }
  }, [searchQuery, statusFilter, scoreRange, reasoningFilter]);

  // Calculate derived values
  const domains = data?.domains ?? [];
  const totalDomains = data?.total ?? 0;
  const totalPages = Math.ceil(totalDomains / itemsPerPage);

  // Parse error
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch domains"
    : null;

  return {
    // Data
    domains,
    totalDomains,
    currentPage,
    totalPages,
    itemsPerPage,

    // State
    isLoading,
    isFetching,
    error,

    // Sorting
    sortColumn,
    sortOrder,

    // Actions
    setCurrentPage,
    setItemsPerPage,
    setSortColumn,
    setSortOrder,
    handleSort,
    refetch,
  };
}
