import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AIChatbot from "./AIChatbot";
import ImageCarousel from "./ImageCarousel";
import {
  ExternalLink,
  Calendar,
  User,
  Link2,
  ChevronDown,
  Save,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { domainService } from "@/services/domainService";
import type {
  FrontendDomainDetail,
  FrontendCrawlItem,
} from "@/types/domainTypes";

type DomainStatus = "manual-check" | "judol" | "non-judol";

interface DomainDetailModalProps {
  domainId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify?: (
    domainId: string,
    status: DomainStatus,
    reasoning?: string
  ) => void;
}

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

/**
 * Truncate URL to specified length with ellipsis
 */
const truncateUrl = (url: string, maxLength: number = 25): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
};

const getStatusLabel = (status: DomainStatus) => {
  switch (status) {
    case "judol":
      return "Judi Online";
    case "non-judol":
      return "Non Judi Online";
    default:
      return "Manual Check";
  }
};

const DomainDetailModal: React.FC<DomainDetailModalProps> = ({
  domainId,
  open,
  onOpenChange,
  onVerify,
}) => {
  // API data state
  const [domainDetail, setDomainDetail] = useState<FrontendDomainDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [currentStatus, setCurrentStatus] =
    useState<DomainStatus>("manual-check");
  const [reasoning, setReasoning] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCrawlIndex, setSelectedCrawlIndex] = useState(0);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  // Fetch domain detail when modal opens
  useEffect(() => {
    if (open && domainId) {
      fetchDomainDetail(domainId);
    }
  }, [open, domainId]);

  const fetchDomainDetail = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const detail = await domainService.getDomainDetailForFrontend(id);
      setDomainDetail(detail);

      // Initialize form state from first crawl
      if (detail.crawls.length > 0) {
        const firstCrawl = detail.crawls[0];
        setCurrentStatus(firstCrawl.status);
        setReasoning(firstCrawl.reasoning || "");
      }
      setSelectedCrawlIndex(0);
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to fetch domain detail:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch domain detail"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get current crawl data
  const currentCrawl: FrontendCrawlItem | null =
    domainDetail?.crawls[selectedCrawlIndex] || null;

  // Get screenshots from all crawls
  const screenshots =
    domainDetail?.crawls.map((crawl) => crawl.screenshot) || [];

  // State for API update loading
  const [isUpdating, setIsUpdating] = useState(false);

  // Convert frontend status to API status format
  const toApiStatus = (
    status: DomainStatus
  ): "judol" | "non_judol" | "manual_check" => {
    switch (status) {
      case "judol":
        return "judol";
      case "non-judol":
        return "non_judol";
      default:
        return "manual_check";
    }
  };

  // Handle status change from dropdown - only update local state
  const handleStatusChange = (newStatus: DomainStatus) => {
    if (newStatus === currentStatus) return;

    setCurrentStatus(newStatus);
    // Mark as having changes so Save button becomes enabled
    const originalStatus = currentCrawl?.status || "manual-check";
    setHasChanges(
      newStatus !== originalStatus ||
        reasoning !== (currentCrawl?.reasoning || "")
    );
  };

  const handleReasoningChange = (value: string) => {
    setReasoning(value);
    const originalReasoning = currentCrawl?.reasoning || "";
    const originalStatus = currentCrawl?.status || "manual-check";
    setHasChanges(
      value !== originalReasoning || currentStatus !== originalStatus
    );
  };

  const handleSave = async () => {
    if (!domainId) return;

    setIsUpdating(true);
    try {
      const apiStatus = toApiStatus(currentStatus);
      const response = await domainService.updateDomainStatus(
        domainId,
        apiStatus
      );

      if (response.success) {
        setHasChanges(false);
        toast.success(response.message || "Status berhasil disimpan");

        // Call onVerify callback if provided
        if (onVerify) {
          onVerify(domainId, currentStatus, reasoning);
        }
      } else {
        toast.error("Gagal menyimpan status");
      }
    } catch (error) {
      console.error("Error saving status:", error);
      toast.error("Terjadi kesalahan saat menyimpan status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCrawlChange = (value: string) => {
    const index = parseInt(value, 10);
    setSelectedCrawlIndex(index);

    // Update form state based on selected crawl
    if (domainDetail && domainDetail.crawls[index]) {
      const crawl = domainDetail.crawls[index];
      setCurrentStatus(crawl.status);
      setReasoning(crawl.reasoning || "");
      setHasChanges(false);
    }
  };

  const handleCarouselIndexChange = (index: number) => {
    setSelectedCrawlIndex(index);
  };

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memuat detail domain...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-destructive">
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={() => domainId && fetchDomainDetail(domainId)}
            >
              Coba Lagi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // No data state
  if (!domainDetail || !currentCrawl) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="domain-detail-modal"
        className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col"
      >
        <DialogHeader className="p-6 pb-4 pr-12 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle
                  id="modal-domain-title"
                  className="text-xl font-bold truncate"
                >
                  {domainDetail.domainName}
                </DialogTitle>
                {/* Save button moved to footer */}
                {hasChanges && (
                  <Button
                    id="save-changes-button"
                    size="sm"
                    onClick={handleSave}
                    className="gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link2 className="h-4 w-4 shrink-0" />
                {domainDetail.crawls.length > 1 ? (
                  <Select
                    value={selectedCrawlIndex.toString()}
                    onValueChange={handleCrawlChange}
                  >
                    <SelectTrigger
                      id="modal-domain-url"
                      className="h-auto p-0 border-0 bg-transparent text-muted-foreground hover:text-primary focus:ring-0 focus:ring-offset-0 w-auto max-w-[400px]"
                    >
                      <SelectValue>
                        <span className="truncate">
                          {truncateUrl(currentCrawl.url, 25)}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-w-[500px]">
                      {domainDetail.crawls.map((crawl, index) => (
                        <SelectItem
                          key={crawl.crawl_id}
                          value={index.toString()}
                          className="truncate"
                        >
                          <span className="truncate block max-w-[450px]">
                            {crawl.url}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <a
                    id="modal-domain-url"
                    href={currentCrawl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:text-primary transition-colors"
                    title={currentCrawl.url}
                  >
                    {truncateUrl(currentCrawl.url, 25)}
                  </a>
                )}
                <a
                  href={currentCrawl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            </div>
            {onVerify ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  id="modal-status-badge"
                  className="focus:outline-none"
                >
                  <Badge
                    className={`${getStatusBadgeClass(
                      currentStatus
                    )} cursor-pointer hover:opacity-80 flex items-center gap-1`}
                  >
                    {getStatusLabel(currentStatus)}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  id="status-dropdown-menu"
                  align="end"
                  className="z-[100]"
                >
                  <DropdownMenuItem
                    id="status-option-manual-check"
                    onClick={() => handleStatusChange("manual-check")}
                    className={
                      currentStatus === "manual-check" ? "bg-muted" : ""
                    }
                  >
                    <Badge className="bg-muted text-muted-foreground mr-2">
                      Manual Check
                    </Badge>
                    {currentStatus === "manual-check" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    id="status-option-judol"
                    onClick={() => handleStatusChange("judol")}
                    className={currentStatus === "judol" ? "bg-muted" : ""}
                  >
                    <Badge className="badge-judol mr-2">Judol</Badge>
                    {currentStatus === "judol" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    id="status-option-non-judol"
                    onClick={() => handleStatusChange("non-judol")}
                    className={currentStatus === "non-judol" ? "bg-muted" : ""}
                  >
                    <Badge className="badge-non-judol mr-2">Non Judol</Badge>
                    {currentStatus === "non-judol" && "✓"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Badge
                id="modal-status-badge"
                className={getStatusBadgeClass(currentStatus)}
              >
                {getStatusLabel(currentStatus)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div
          id="domain-detail-content"
          className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0"
        >
          {/* Left Panel - Domain Info */}
          <div
            id="domain-info-panel"
            className="lg:w-1/2 border-r border-border overflow-y-auto scrollbar-thin"
          >
            <div className="p-6 space-y-6">
              {/* Confidence Score */}
              <div id="confidence-score-section" className="space-y-3">
                <div className="flex items-center justify-between">
                  <span id="confidence-label" className="text-sm font-medium">
                    Confidence Score
                  </span>
                  <span
                    id="confidence-score-value"
                    className={`text-lg font-bold ${
                      currentCrawl.confidenceScore >= 80
                        ? currentStatus === "judol"
                          ? "text-destructive"
                          : "text-success"
                        : "text-warning"
                    }`}
                  >
                      {currentStatus === "manual-check" ? "N/A"
    : `${currentCrawl.confidenceScore.toFixed(2)}%`}
                  </span>
                </div>
                <Progress
                  id="confidence-progress"
                  value={currentCrawl.confidenceScore}
                  className="h-3"
                />
              </div>

              {/* Reasoning */}
              <div id="reasoning-section" className="space-y-3">
                <span id="reasoning-label" className="text-sm font-medium">
                  Reasoning
                </span>
                <div className="min-h-[100px] rounded-lg border border-border p-4 bg-muted/30">
                  <p
                    id="reasoning-text"
                    className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap"
                  >
                    {reasoning || "Tidak ada reasoning dari LLM"}
                  </p>
                </div>
              </div>

              {/* Keywords */}
              <div id="keywords-section" className="space-y-3">
                <span id="keywords-label" className="text-sm font-medium">
                  Kata Kunci Terdeteksi
                </span>
                <div id="keywords-container" className="flex flex-wrap gap-2">
                  {currentCrawl.keyword ? (
                    <Badge
                      id="keyword-badge-0"
                      variant="secondary"
                      className="text-xs"
                    >
                      {currentCrawl.keyword}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Tidak ada kata kunci
                    </span>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div id="metadata-section" className="grid grid-cols-2 gap-4">
                <div id="crawled-date-section" className="space-y-1">
                  <span
                    id="crawled-date-label"
                    className="text-xs text-muted-foreground"
                  >
                    Crawled
                  </span>
                  <div
                    id="crawled-date"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(currentCrawl.timestamp).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                </div>
                {currentCrawl.isAmp && (
                  <div id="amp-indicator-section" className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Format
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">AMP</Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Screenshot Carousel - Controlled mode, synced with URL dropdown */}
              <div id="screenshot-section" className="space-y-3">
                Vit Score :{" "}
                  {currentCrawl.vitScore !== null
                    ? `${currentCrawl.vitScore.toFixed(2)}%`
                    : "N/A"}
                <div className="flex items-center justify-between">
                  <span id="screenshot-label" className="text-sm font-medium">
                    Screenshot
                  </span>
                  <span
                    id="screenshot-count"
                    className="text-xs text-muted-foreground"
                  >
                    {domainDetail.crawls.length} URL dalam domain ini
                  </span>
                </div>
                <ImageCarousel
                  images={screenshots}
                  alt={`Screenshot of ${domainDetail.domainName}`}
                  autoPlay={false}
                  currentIndex={selectedCrawlIndex}
                  onIndexChange={handleCarouselIndexChange}
                />
              </div>

              {/* Extracted Content */}
              <div id="extracted-content-section" className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    id="extracted-content-label"
                    className="text-sm font-medium"
                  >
                    Konten Terekstrak
                  </span>
                  {currentCrawl.innerText &&
                    currentCrawl.innerText.length > 200 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsContentExpanded(!isContentExpanded)}
                        className="h-8 text-xs"
                      >
                        {isContentExpanded
                          ? "Tampilkan Lebih Sedikit"
                          : "Tampilkan Semua"}
                      </Button>
                    )}
                </div>
                <ScrollArea
                  id="extracted-content-area"
                  className={`rounded-lg border border-border p-4 bg-muted/30 transition-all duration-300 ${
                    isContentExpanded ? "h-[600px]" : "h-40"
                  }`}
                >
                  <p
                    id="extracted-content-text"
                    className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap"
                  >
                    {currentCrawl.innerText ||
                      "Tidak ada konten yang terekstrak"}
                  </p>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Right Panel - AI Chatbot */}
          <div
            id="ai-chatbot-panel"
            className="lg:w-1/2 flex flex-col bg-muted/20"
          >
            <AIChatbot
              domain={{
                domain: domainDetail.domainName,
                status: currentStatus,
                confidenceScore: currentCrawl.confidenceScore,
                reasoning: reasoning,
                extractedContent: currentCrawl.innerText,
                keywords: [],
              }}
            />
          </div>
        </div>

        {/* Footer with action buttons */}
        <DialogFooter className="p-4 border-t border-border bg-background flex-shrink-0"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DomainDetailModal;
