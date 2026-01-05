import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Domain } from "@/lib/mockData";
import AIChatbot from "./AIChatbot";
import ImageCarousel from "./ImageCarousel";
import {
  ExternalLink,
  Calendar,
  User,
  Link2,
  ChevronDown,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface DomainDetailModalProps {
  domain: Domain | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify?: (domainId: string, status: "not-verified" | "judol" | "non-judol", reasoning?: string) => void;
}

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
      return 'Judi Online';
    case 'non-judol':
      return 'Non Judi Online';
    default:
      return 'Not Verified';
  }
};

const DomainDetailModal: React.FC<DomainDetailModalProps> = ({
  domain,
  open,
  onOpenChange,
  onVerify,
}) => {
  const [currentStatus, setCurrentStatus] = useState<Domain['status']>(domain?.status || 'not-verified');
  const [reasoning, setReasoning] = useState<string>(domain?.reasoning || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedUrlIndex, setSelectedUrlIndex] = useState(0);

  // Reset state when domain changes
  useEffect(() => {
    if (domain) {
      setCurrentStatus(domain.status);
      setReasoning(domain.reasoning || '');
      setHasChanges(false);
      setSelectedUrlIndex(0);
    }
  }, [domain]);

  if (!domain) return null;

  // Get URL group data - fallback to single URL if urlGroup not available
  const urlGroup = domain.urlGroup && domain.urlGroup.length > 0
    ? domain.urlGroup
    : [{ url: domain.url, screenshot: domain.screenshot }];

  // Get screenshots from urlGroup
  const screenshots = urlGroup.map(entry => entry.screenshot);
  const currentUrl = urlGroup[selectedUrlIndex]?.url || domain.url;

  const handleStatusChange = (newStatus: "not-verified" | "judol" | "non-judol") => {
    if (newStatus !== currentStatus) {
      setCurrentStatus(newStatus);
      setHasChanges(true);
    }
  };

  const handleReasoningChange = (value: string) => {
    setReasoning(value);
    setHasChanges(value !== (domain.reasoning || '') || currentStatus !== domain.status);
  };

  const handleSave = () => {
    if (onVerify) {
      onVerify(domain.id, currentStatus, reasoning);
      setHasChanges(false);
      toast.success("Perubahan berhasil disimpan");
    }
  };

  const handleUrlChange = (value: string) => {
    const index = parseInt(value, 10);
    setSelectedUrlIndex(index);
  };

  const handleCarouselIndexChange = (index: number) => {
    setSelectedUrlIndex(index);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="domain-detail-modal" className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle id="modal-domain-title" className="text-xl font-bold truncate">
                  {domain.domain}
                </DialogTitle>
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
                {urlGroup.length > 1 ? (
                  <Select
                    value={selectedUrlIndex.toString()}
                    onValueChange={handleUrlChange}
                  >
                    <SelectTrigger 
                      id="modal-domain-url" 
                      className="h-auto p-0 border-0 bg-transparent text-muted-foreground hover:text-primary focus:ring-0 focus:ring-offset-0 w-auto max-w-[400px]"
                    >
                      <SelectValue>
                        <span className="truncate">{currentUrl}</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-w-[500px]">
                      {urlGroup.map((entry, index) => (
                        <SelectItem 
                          key={index} 
                          value={index.toString()}
                          className="truncate"
                        >
                          <span className="truncate block max-w-[450px]">{entry.url}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <a
                    id="modal-domain-url"
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:text-primary transition-colors"
                  >
                    {currentUrl}
                  </a>
                )}
                <a
                  href={currentUrl}
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
                <DropdownMenuTrigger id="modal-status-badge" className="focus:outline-none">
                  <Badge 
                    className={`${getStatusBadgeClass(currentStatus)} cursor-pointer hover:opacity-80 flex items-center gap-1`}
                  >
                    {getStatusLabel(currentStatus)}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent id="status-dropdown-menu" align="end" className="z-[100]">
                  <DropdownMenuItem 
                    id="status-option-not-verified"
                    onClick={() => handleStatusChange("not-verified")}
                    className={currentStatus === "not-verified" ? "bg-muted" : ""}
                  >
                    <Badge className="bg-muted text-muted-foreground mr-2">Not Verified</Badge>
                    {currentStatus === "not-verified" && "✓"}
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
                className={getStatusBadgeClass(domain.status)}
              >
                {getStatusLabel(domain.status)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div id="domain-detail-content" className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Panel - Domain Info */}
          <div id="domain-info-panel" className="lg:w-1/2 border-r border-border overflow-y-auto scrollbar-thin">
            <div className="p-6 space-y-6">
              {/* Confidence Score */}
              <div id="confidence-score-section" className="space-y-3">
                <div className="flex items-center justify-between">
                  <span id="confidence-label" className="text-sm font-medium">Confidence Score</span>
                  <span
                    id="confidence-score-value"
                    className={`text-lg font-bold ${
                      domain.confidenceScore >= 80
                        ? domain.status === "judol"
                          ? "text-destructive"
                          : "text-success"
                        : "text-warning"
                    }`}
                  >
                    {domain.confidenceScore}%
                  </span>
                </div>
                <Progress id="confidence-progress" value={domain.confidenceScore} className="h-3" />
              </div>

              {/* Reasoning Text Area */}
              <div id="reasoning-section" className="space-y-3">
                <label id="reasoning-label" htmlFor="reasoning-textarea" className="text-sm font-medium">
                  Reasoning
                </label>
                <Textarea
                  id="reasoning-textarea"
                  placeholder="Masukkan alasan verifikasi..."
                  value={reasoning}
                  onChange={(e) => handleReasoningChange(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Metadata */}
              <div id="metadata-section" className="grid grid-cols-2 gap-4">
                <div id="crawled-date-section" className="space-y-1">
                  <span id="crawled-date-label" className="text-xs text-muted-foreground">Crawled</span>
                  <div id="crawled-date" className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(domain.crawledAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {domain.verifiedBy && (
                  <div id="verified-by-section" className="space-y-1">
                    <span id="verified-by-label" className="text-xs text-muted-foreground">
                      Diverifikasi oleh
                    </span>
                    <div id="verified-by" className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {domain.verifiedBy}
                    </div>
                  </div>
                )}
              </div>

              {/* Keywords */}
              <div id="keywords-section" className="space-y-3">
                <span id="keywords-label" className="text-sm font-medium">
                  Kata Kunci Terdeteksi
                </span>
                <div id="keywords-container" className="flex flex-wrap gap-2">
                  {domain.keywords.map((keyword, i) => (
                    <Badge 
                      key={i} 
                      id={`keyword-badge-${i}`}
                      variant="secondary" 
                      className="text-xs"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Screenshot Carousel - Controlled mode, synced with URL dropdown */}
              <div id="screenshot-section" className="space-y-3">
                <div className="flex items-center justify-between">
                  <span id="screenshot-label" className="text-sm font-medium">Screenshot</span>
                  <span id="screenshot-count" className="text-xs text-muted-foreground">
                    {urlGroup.length} URL dalam domain ini
                  </span>
                </div>
                <ImageCarousel
                  images={screenshots}
                  alt={`Screenshot of ${domain.domain}`}
                  autoPlay={false}
                  currentIndex={selectedUrlIndex}
                  onIndexChange={handleCarouselIndexChange}
                />
              </div>

              {/* Extracted Content */}
              <div id="extracted-content-section" className="space-y-3">
                <span id="extracted-content-label" className="text-sm font-medium">Konten Terekstrak</span>
                <ScrollArea id="extracted-content-area" className="h-40 rounded-lg border border-border p-4 bg-muted/30">
                  <p id="extracted-content-text" className="text-sm text-muted-foreground leading-relaxed">
                    {domain.extractedContent}
                  </p>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Right Panel - AI Chatbot */}
          <div id="ai-chatbot-panel" className="lg:w-1/2 flex flex-col bg-muted/20">
            <AIChatbot domain={domain} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DomainDetailModal;