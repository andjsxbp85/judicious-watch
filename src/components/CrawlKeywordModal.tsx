import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { scrapeService, CrawlEngine } from "@/services/scrapeService";

interface Keyword {
  id: string;
  keyword: string;
}

interface CrawlKeywordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CrawlKeywordModal: React.FC<CrawlKeywordModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [searchEngine, setSearchEngine] = useState<CrawlEngine>("google");
  const [aiReasoning, setAiReasoning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingKeywords, setIsFetchingKeywords] = useState(false);
  const { toast } = useToast();

  // Fetch keywords from database when modal opens
  useEffect(() => {
    if (open) {
      fetchKeywords();
    }
  }, [open]);

  const fetchKeywords = async () => {
    setIsFetchingKeywords(true);
    try {
      const response = await scrapeService.getKeywords();
      if (response.success && response.data) {
        setKeywords(
          response.data.map((item) => ({
            id: item.id,
            keyword: item.keyword,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch keywords:", error);
      toast({
        title: "Gagal memuat keywords",
        description: "Tidak dapat mengambil data keywords dari server",
        variant: "destructive",
      });
    } finally {
      setIsFetchingKeywords(false);
    }
  };

  const handleEdit = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setEditValue(keyword.keyword);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) {
      toast({
        title: "Error",
        description: "Keyword tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (!editingId) return;

    try {
      const updatedKeyword = await scrapeService.updateKeyword(editingId, {
        keyword: editValue.trim(),
      });

      setKeywords((prev) =>
        prev.map((k) => (k.id === editingId ? updatedKeyword : k))
      );
      setEditingId(null);
      setEditValue("");
      toast({
        title: "Berhasil",
        description: "Keyword berhasil diubah",
      });
    } catch (error) {
      console.error("Failed to update keyword:", error);
      toast({
        title: "Gagal mengubah keyword",
        description:
          error instanceof Error
            ? error.message
            : "Tidak dapat mengubah keyword",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleDelete = async (id: string) => {
    try {
      await scrapeService.deleteKeyword(id);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
      toast({
        title: "Berhasil",
        description: "Keyword berhasil dihapus",
      });
    } catch (error) {
      console.error("Failed to delete keyword:", error);
      toast({
        title: "Gagal menghapus keyword",
        description:
          error instanceof Error
            ? error.message
            : "Tidak dapat menghapus keyword",
        variant: "destructive",
      });
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        title: "Error",
        description: "Keyword tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    try {
      const createdKeyword = await scrapeService.createKeyword({
        keyword: newKeyword.trim(),
      });

      setKeywords((prev) => [...prev, createdKeyword]);
      setNewKeyword("");
      setIsAdding(false);
      toast({
        title: "Berhasil",
        description: "Keyword baru berhasil ditambahkan",
      });
    } catch (error) {
      console.error("Failed to create keyword:", error);
      toast({
        title: "Gagal menambahkan keyword",
        description:
          error instanceof Error
            ? error.message
            : "Tidak dapat menambahkan keyword",
        variant: "destructive",
      });
    }
  };

  const handleCancelAdd = () => {
    setNewKeyword("");
    setIsAdding(false);
  };

  const handleStartCrawl = async () => {
    if (keywords.length === 0) {
      toast({
        title: "Error",
        description: "Tambahkan minimal satu keyword sebelum memulai crawl",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const keywordStrings = keywords.map((k) => k.keyword);

      const result = await scrapeService.scrapeMultiKeyword({
        keywords: keywordStrings,
        crawl_engine: searchEngine,
        ai_reasoning: aiReasoning,
      });

      console.log("Crawl result:", result);

      toast({
        title: "Crawl Berhasil",
        description: `Berhasil melakukan crawl ${keywords.length} keyword dengan ${searchEngine}`,
      });

      // Close modal after successful crawl
      onOpenChange(false);
    } catch (error) {
      console.error("Crawl error:", error);
      toast({
        title: "Crawl Gagal",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat melakukan crawl",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEngineLabel = (engine: CrawlEngine): string => {
    const labels: Record<CrawlEngine, string> = {
      google: "Google",
      baidu: "Baidu",
      bing: "Bing",
    };
    return labels[engine];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="crawl-keyword-modal"
        className="max-w-2xl max-h-[80vh] flex flex-col"
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle
              id="crawl-keyword-modal-title"
              className="text-xl font-bold"
            >
              Crawl New URL - Kelola Keyword
            </DialogTitle>
          </div>
        </DialogHeader>

        <div id="crawl-keyword-actions" className="flex-shrink-0 mb-4">
          {!isAdding ? (
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                id="add-keyword-btn"
                onClick={() => setIsAdding(true)}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Keyword
              </Button>
              <Select
                value={searchEngine}
                onValueChange={(value) => setSearchEngine(value as CrawlEngine)}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="search-engine-select"
                  className="w-full sm:w-[180px]"
                >
                  <SelectValue placeholder="Pilih Search Engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem id="search-engine-google" value="google">
                    Google
                  </SelectItem>
                  <SelectItem id="search-engine-baidu" value="baidu">
                    Baidu
                  </SelectItem>
                  <SelectItem id="search-engine-bing" value="bing">
                    Bing
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ai-reasoning-checkbox"
                  checked={aiReasoning}
                  onCheckedChange={(checked) =>
                    setAiReasoning(checked === true)
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="ai-reasoning-checkbox"
                  className="text-sm cursor-pointer"
                >
                  AI Reasoning
                </label>
              </div>
              <Button
                id="start-crawl-btn"
                variant="default"
                className="w-full sm:w-auto"
                onClick={handleStartCrawl}
                disabled={isLoading || keywords.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Crawling...
                  </>
                ) : (
                  "Start Crawl"
                )}
              </Button>
            </div>
          ) : (
            <div id="add-keyword-form" className="flex gap-2">
              <Input
                id="new-keyword-input"
                placeholder="Masukkan keyword baru..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddKeyword();
                  if (e.key === "Escape") handleCancelAdd();
                }}
                autoFocus
              />
              <Button
                id="confirm-add-keyword-btn"
                size="icon"
                onClick={handleAddKeyword}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                id="cancel-add-keyword-btn"
                size="icon"
                variant="outline"
                onClick={handleCancelAdd}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div
          id="keyword-table-container"
          className="flex-1 overflow-y-auto border rounded-lg"
        >
          <Table id="keyword-table">
            <TableHeader className="sticky top-0 bg-muted">
              <TableRow>
                <TableHead id="th-keyword-no" className="w-16 text-center">
                  No
                </TableHead>
                <TableHead id="th-keyword">Keyword</TableHead>
                <TableHead id="th-keyword-action" className="w-32 text-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody id="keyword-table-body">
              {keywords.map((keyword, index) => (
                <TableRow
                  key={keyword.id}
                  id={`keyword-row-${keyword.id}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell
                    id={`keyword-no-${keyword.id}`}
                    className="text-center font-medium"
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell id={`keyword-value-${keyword.id}`}>
                    {editingId === keyword.id ? (
                      <Input
                        id={`edit-keyword-input-${keyword.id}`}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                      />
                    ) : (
                      <span>{keyword.keyword}</span>
                    )}
                  </TableCell>
                  <TableCell id={`keyword-actions-${keyword.id}`}>
                    <div className="flex items-center justify-center gap-2">
                      {editingId === keyword.id ? (
                        <>
                          <Button
                            id={`save-keyword-btn-${keyword.id}`}
                            size="icon"
                            variant="ghost"
                            onClick={handleSaveEdit}
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            id={`cancel-edit-keyword-btn-${keyword.id}`}
                            size="icon"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            id={`edit-keyword-btn-${keyword.id}`}
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(keyword)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            disabled={isLoading}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            id={`delete-keyword-btn-${keyword.id}`}
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(keyword.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {isFetchingKeywords ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    id="keyword-loading-message"
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memuat keywords...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : keywords.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    id="keyword-empty-message"
                    className="text-center py-8 text-muted-foreground"
                  >
                    Belum ada keyword. Klik "Add New Keyword" untuk menambahkan.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CrawlKeywordModal;
