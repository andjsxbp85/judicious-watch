import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Domain } from '@/lib/mockData';
import AIChatbot from './AIChatbot';
import { 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  Calendar,
  User,
  Link2
} from 'lucide-react';

interface DomainDetailModalProps {
  domain: Domain | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify?: (domainId: string, status: 'judol' | 'non-judol') => void;
}

const DomainDetailModal: React.FC<DomainDetailModalProps> = ({
  domain,
  open,
  onOpenChange,
  onVerify,
}) => {
  if (!domain) return null;

  const isJudol = domain.status === 'judol';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold mb-2 truncate">
                {domain.domain}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link2 className="h-4 w-4 shrink-0" />
                <a
                  href={domain.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:text-primary transition-colors"
                >
                  {domain.url}
                </a>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </div>
            </div>
            <Badge className={isJudol ? 'badge-judol' : 'badge-non-judol'}>
              {isJudol ? 'Judi Online' : 'Non Judi Online'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Panel - Domain Info */}
          <div className="lg:w-1/2 border-r border-border overflow-y-auto scrollbar-thin">
            <div className="p-6 space-y-6">
              {/* Confidence Score */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence Score</span>
                  <span className={`text-lg font-bold ${
                    domain.confidenceScore >= 80 
                      ? isJudol ? 'text-destructive' : 'text-success'
                      : 'text-warning'
                  }`}>
                    {domain.confidenceScore}%
                  </span>
                </div>
                <Progress 
                  value={domain.confidenceScore} 
                  className="h-3"
                />
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Crawled</span>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(domain.crawledAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                {domain.verifiedBy && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Diverifikasi oleh</span>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {domain.verifiedBy}
                    </div>
                  </div>
                )}
              </div>

              {/* Keywords */}
              <div className="space-y-3">
                <span className="text-sm font-medium">Kata Kunci Terdeteksi</span>
                <div className="flex flex-wrap gap-2">
                  {domain.keywords.map((keyword, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Screenshot */}
              <div className="space-y-3">
                <span className="text-sm font-medium">Screenshot</span>
                <div className="rounded-lg overflow-hidden border border-border shadow-sm">
                  <img
                    src={domain.screenshot}
                    alt={`Screenshot of ${domain.domain}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>

              {/* Extracted Content */}
              <div className="space-y-3">
                <span className="text-sm font-medium">Konten Terekstrak</span>
                <ScrollArea className="h-40 rounded-lg border border-border p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {domain.extractedContent}
                  </p>
                </ScrollArea>
              </div>

              {/* Manual Verification Buttons */}
              {onVerify && !domain.verifiedBy && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <span className="text-sm font-medium">Verifikasi Manual</span>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onVerify(domain.id, 'judol')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Tandai Judi Online
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-success text-success hover:bg-success hover:text-success-foreground"
                      onClick={() => onVerify(domain.id, 'non-judol')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Tandai Non Judi
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - AI Chatbot */}
          <div className="lg:w-1/2 flex flex-col bg-muted/20">
            <AIChatbot domain={domain} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DomainDetailModal;
