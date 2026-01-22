import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Save,
  Play,
  X,
  Check,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { scrapeService } from "@/services/scrapeService";
import type {
  CrawlEngine,
  SaveKeywordsScheduleRequest,
} from "@/types/scrapeTypes";

interface Keyword {
  id: string;
  keyword: string;
  schedule?: string;
}

// Cron schedule mapping
const CRON_OPTIONS = [
  { value: "30m", label: "Setiap 30 menit", cron: "*/30 * * * *" },
  { value: "1h", label: "Setiap 1 jam", cron: "0 * * * *" },
  { value: "2h", label: "Setiap 2 jam", cron: "0 */2 * * *" },
  { value: "3h", label: "Setiap 3 jam", cron: "0 */3 * * *" },
  { value: "5h", label: "Setiap 5 jam", cron: "0 */5 * * *" },
  { value: "8h", label: "Setiap 8 jam", cron: "0 */8 * * *" },
  { value: "12h", label: "Setiap 12 jam", cron: "0 */12 * * *" },
];

// Helper function to parse cron expression to dropdown value
// Handles various cron formats from the API
const getCronValueFromExpression = (cron?: string): string | undefined => {
  if (!cron) return undefined;

  // First, try exact match
  const exactMatch = CRON_OPTIONS.find((opt) => opt.cron === cron);
  if (exactMatch) return exactMatch.value;

  // If no exact match, try to parse the interval from the cron expression
  // API might return formats like "* */30 * * *" or "*/30 * * * *"
  const parts = cron.split(" ").filter((p) => p.includes("*/"));

  for (const part of parts) {
    const intervalMatch = part.match(/\*\/(\d+)/);
    if (intervalMatch) {
      const interval = parseInt(intervalMatch[1], 10);

      // Match based on interval value
      if (interval === 30) return "30m";
      if (interval === 2) return "2h";
      if (interval === 3) return "3h";
      if (interval === 5) return "5h";
      if (interval === 8) return "8h";
      if (interval === 12) return "12h";
    }
  }

  // Check for hourly pattern (0 * * * *)
  if (cron === "0 * * * *") return "1h";

  return undefined;
};

const AdminConsole: React.FC = () => {
  const { toast } = useToast();

  // Keyword Management States
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editSchedule, setEditSchedule] = useState<string | undefined>(
    undefined,
  );
  const [newKeyword, setNewKeyword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEngines, setSelectedEngines] = useState<CrawlEngine[]>([
    "google",
    "baidu",
  ]); // Multi-select engines (default: google & baidu)
  const [cronSchedule, setCronSchedule] = useState<string>("1m");

  const DEFAULT_TLDS = [
    ".ac.id",
    ".go.id",
    ".or.id",
    ".sch.id",
    ".mil.id",
    ".desa.id",
  ];
  const [tldList, setTldList] = useState<string[]>(DEFAULT_TLDS);
  const [newTld, setNewTld] = useState("");
  const [isAddingTld, setIsAddingTld] = useState(false);
  const [editingTldIndex, setEditingTldIndex] = useState<number | null>(null);
  const [editTldValue, setEditTldValue] = useState("");

  const [isFetchingKeywords, setIsFetchingKeywords] = useState(false);
  const [isSavingKeyword, setIsSavingKeyword] = useState(false);
  const [deletingKeywordId, setDeletingKeywordId] = useState<string | null>(
    null,
  );
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  // const [isCrawling, setIsCrawling] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalKeywords, setTotalKeywords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Ref for keyword table scroll
  const keywordTableRef = useRef<HTMLDivElement>(null);

  // Fetch keywords on component mount and when pagination changes
  useEffect(() => {
    fetchKeywords();
  }, [currentPage, itemsPerPage]);

  // Scroll to top of keyword table when page changes
  useEffect(() => {
    if (keywordTableRef.current && currentPage > 1) {
      keywordTableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentPage]);

  const fetchKeywords = async () => {
    setIsFetchingKeywords(true);
    try {
      const response = await scrapeService.getKeywordsSchedule(
        currentPage,
        itemsPerPage,
      );
      if (response.success && response.data) {
        setKeywords(
          response.data.map((item) => ({
            id: item.id,
            keyword: item.keyword,
          })),
        );
        // Set pagination info
        setTotalKeywords(response.total || 0);
        setTotalPages(response.total_pages || 0);
        // Set schedule dropdown from API response
        const cronValue = getCronValueFromExpression(response.schedule);
        if (cronValue) {
          setCronSchedule(cronValue);
        }
        // Set crawl engine from API response
        if (response.crawl_engine) {
          // For now, backend only returns single engine, but we display as multi-select
          // Default to show both Google and Baidu as checked
          setSelectedEngines(["google", "baidu"]);
        }
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

  const handleAddTld = () => {
    if (!newTld.trim()) return;
    const newTlds = newTld.trim().split(/[\s,;]+/);
    const validTlds = newTlds.filter((t) => t && !tldList.includes(t));
    if (validTlds.length > 0) {
      setTldList([...tldList, ...validTlds]);
    }
    setNewTld("");
    setIsAddingTld(false);
  };

  const handleRemoveTld = (indexToRemove: number) => {
    setTldList(tldList.filter((_, index) => index !== indexToRemove));
  };

  const handleStartEditTld = (index: number, value: string) => {
    setEditingTldIndex(index);
    setEditTldValue(value);
  };

  const handleSaveEditTld = () => {
    if (editingTldIndex === null) return;
    if (!editTldValue.trim()) {
      setEditingTldIndex(null);
      return;
    }
    const updatedList = [...tldList];
    updatedList[editingTldIndex] = editTldValue.trim();
    setTldList(updatedList);
    setEditingTldIndex(null);
    setEditTldValue("");
  };

  const handleCancelEditTld = () => {
    setEditingTldIndex(null);
    setEditTldValue("");
  };

  const handleEdit = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setEditValue(keyword.keyword);
    setEditSchedule(keyword.schedule);
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
    if (!editingId || isSavingKeyword) return;

    setIsSavingKeyword(true);
    try {
      // Get current cron expression from global schedule selector
      const selectedCron = CRON_OPTIONS.find(
        (opt) => opt.value === cronSchedule,
      )?.cron;

      await scrapeService.updateKeyword(editingId, {
        keyword: editValue.trim(),
        schedule: selectedCron, // Always use schedule from dropdown
      });
      setEditingId(null);
      setEditValue("");
      setEditSchedule(undefined);
      toast({ title: "Berhasil", description: "Keyword berhasil diubah" });
      await fetchKeywords(); // Refresh from DB
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
    } finally {
      setIsSavingKeyword(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
    setEditSchedule(undefined);
  };

  const handleDelete = async (id: string) => {
    if (deletingKeywordId === id) return;

    setDeletingKeywordId(id);
    try {
      await scrapeService.deleteKeyword(id);

      toast({
        title: "Berhasil",
        description: "Keyword berhasil dihapus",
      });

      // Refresh keywords from database
      await fetchKeywords();

      // If current page is empty after deletion, go to previous page
      const remainingItems = totalKeywords - 1;
      const maxPage = Math.ceil(remainingItems / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
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
    } finally {
      setDeletingKeywordId(null);
    }
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      toast({
        title: "Error",
        description: "Keyword tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    // Get selected cron schedule
    const selectedCron = CRON_OPTIONS.find((opt) => opt.value === cronSchedule);

    // Add keyword to frontend state only (not saving to DB yet)
    // Will be saved to DB when user clicks "Simpan Konfigurasi" button
    const newKeywordObj: Keyword = {
      id: `temp-${Date.now()}`, // Temporary ID for frontend
      keyword: newKeyword.trim(),
      schedule: selectedCron?.cron,
    };

    setKeywords((prev) => [...prev, newKeywordObj]);
    setNewKeyword("");
    setIsAdding(false);
    toast({
      title: "Berhasil",
      description: "Keyword berhasil ditambahkan ke daftar keyword",
    });
  };

  const handleCancelAdd = () => {
    setNewKeyword("");
    setIsAdding(false);
  };

  const handleSaveConfiguration = async () => {
    if (keywords.length === 0) {
      toast({
        title: "Error",
        description: "Tambahkan minimal satu keyword sebelum menyimpan",
        variant: "destructive",
      });
      return;
    }

    setIsSavingConfig(true);
    try {
      // Get the cron expression for the current schedule
      const selectedCronExpression = CRON_OPTIONS.find(
        (opt) => opt.value === cronSchedule,
      )?.cron;

      if (!selectedCronExpression) {
        throw new Error("Invalid schedule selected");
      }

      // Prepare request data
      const requestData: SaveKeywordsScheduleRequest = {
        keywords: keywords.map((k) => k.keyword), // Send as array
        schedule: selectedCronExpression,
        crawl_engine: "google", // Always send Google for now (backend only supports Google)
      };

      // Call the API
      const response = await scrapeService.saveKeywordsSchedule(requestData);

      if (response.success) {
        toast({
          title: "Keyword dan Jadwal Berhasil Disimpan",
          description: `${keywords.length} keyword dengan jadwal ${
            CRON_OPTIONS.find((opt) => opt.value === cronSchedule)?.label
          } berhasil disimpan.`,
        });

        // Reset to first page and refresh the keywords list to get updated data
        setCurrentPage(1);
        await fetchKeywords();
      }
    } catch (error) {
      console.error("Save configuration error:", error);
      toast({
        title: "Gagal Menyimpan Keyword dan Jadwal",
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat menyimpan keyword dan jadwal",
        variant: "destructive",
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // const handleStartCrawl = async () => {
  //   if (keywords.length === 0) {
  //     toast({
  //       title: "Error",
  //       description: "Tambahkan minimal satu keyword sebelum memulai crawl",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setIsCrawling(true);
  //   try {
  //     const keywordStrings = keywords.map((k) => k.keyword);
  //     const result = await scrapeService.scrapeMultiKeyword({
  //       keywords: keywordStrings,
  //       crawl_engine: searchEngine,
  //       ai_reasoning: true,
  //       tld_whitelist: tldList.join("; "),
  //     });

  //     const totalInferenceTriggered =
  //       result.results?.reduce((acc: number, r: any) => {
  //         const inferenceCount =
  //           typeof r.inference_triggered === "number"
  //             ? r.inference_triggered
  //             : 0;
  //         return acc + inferenceCount;
  //       }, 0) || 0;

  //     const totalSaved =
  //       result.results?.reduce(
  //         (acc: number, r: any) => acc + (r.total_saved || 0),
  //         0,
  //       ) || 0;

  //     toast({
  //       title: "Crawl & Inference Berhasil",
  //       description: `${keywords.length} keyword berhasil di-crawl menggunakan ${searchEngine}. Total ${totalSaved} data tersimpan dan ${totalInferenceTriggered} inference berhasil dijalankan.`,
  //     });
  //   } catch (error) {
  //     console.error("Crawl error:", error);
  //     toast({
  //       title: "Crawl Gagal",
  //       description:
  //         error instanceof Error
  //           ? error.message
  //           : "Terjadi kesalahan saat melakukan crawl",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsCrawling(false);
  //   }
  // };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Keyword Management Section */}
        <Card id="keyword-management-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Admin Console</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Engine Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Search Engine</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    <span>
                      {selectedEngines.length === 0
                        ? "Pilih Search Engine"
                        : selectedEngines
                            .map(
                              (engine) =>
                                engine.charAt(0).toUpperCase() +
                                engine.slice(1),
                            )
                            .join(", ")}
                    </span>
                    <ChevronRight className="h-4 w-4 ml-2 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-4" align="start">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {["google", "baidu", "bing"].map((engine) => (
                        <div
                          key={engine}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`engine-${engine}`}
                            checked={selectedEngines.includes(
                              engine as CrawlEngine,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEngines([
                                  ...selectedEngines,
                                  engine as CrawlEngine,
                                ]);
                              } else {
                                setSelectedEngines(
                                  selectedEngines.filter((e) => e !== engine),
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`engine-${engine}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {engine.charAt(0).toUpperCase() + engine.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Note: Saat ini hanya Google yang digunakan untuk crawling
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* TLD Whitelist Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Whitelist Domain</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tldList.map((tld, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                  >
                    {editingTldIndex === index ? (
                      <Input
                        value={editTldValue}
                        onChange={(e) => setEditTldValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEditTld();
                          if (e.key === "Escape") handleCancelEditTld();
                        }}
                        className="h-6 w-24 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => handleStartEditTld(index, tld)}
                        className="cursor-pointer"
                      >
                        {tld}
                      </span>
                    )}
                    {editingTldIndex === index ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={handleSaveEditTld}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0"
                          onClick={handleCancelEditTld}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRemoveTld(index)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!isAddingTld ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingTld(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Domain Whitelist
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Tambah whitelist domain (misal: .com, .net)"
                    value={newTld}
                    onChange={(e) => setNewTld(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTld();
                      if (e.key === "Escape") {
                        setNewTld("");
                        setIsAddingTld(false);
                      }
                    }}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddTld}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setNewTld("");
                      setIsAddingTld(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Cron Schedule Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Jadwal Crawl Otomatis
              </Label>
              <Select
                value={cronSchedule}
                onValueChange={(value) => setCronSchedule(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Jadwal" />
                </SelectTrigger>
                <SelectContent>
                  {CRON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Keyword akan di-crawl secara otomatis sesuai jadwal yang dipilih
              </p>
            </div>

            {/* Keyword Table */}
            <div ref={keywordTableRef} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Daftar Keyword ({totalKeywords})
                </Label>
                {!isAdding && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAdding(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Keyword
                  </Button>
                )}
              </div>

              {isAdding && (
                <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
                  <Input
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

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">No</TableHead>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="w-32 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isFetchingKeywords ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
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
                          className="text-center py-8 text-muted-foreground"
                        >
                          Belum ada keyword. Klik "Tambah Keyword" untuk
                          menambahkan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      keywords.map((keyword, index) => (
                        <TableRow
                          key={keyword.id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="text-center font-medium">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </TableCell>
                          <TableCell>
                            {editingId === keyword.id ? (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveEdit();
                                  if (e.key === "Escape") handleCancelEdit();
                                }}
                                disabled={isSavingKeyword}
                                autoFocus
                              />
                            ) : (
                              <span>{keyword.keyword}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              {editingId === keyword.id ? (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleSaveEdit}
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    disabled={isSavingKeyword}
                                  >
                                    {isSavingKeyword ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    disabled={isSavingKeyword}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(keyword)}
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    disabled={isSavingConfig}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDelete(keyword.id)}
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={
                                      isSavingConfig ||
                                      deletingKeywordId === keyword.id
                                    }
                                  >
                                    {deletingKeywordId === keyword.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalKeywords > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(currentPage * itemsPerPage, totalKeywords)} dari{" "}
                      {totalKeywords} keyword
                    </p>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="items-per-page-keywords"
                        className="text-sm text-muted-foreground whitespace-nowrap"
                      >
                        Per halaman:
                      </Label>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1); // Reset to first page
                        }}
                      >
                        <SelectTrigger
                          id="items-per-page-keywords"
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
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1 || isFetchingKeywords}
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
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                disabled={isFetchingKeywords}
                                className="h-8 w-8 p-0"
                              >
                                {page}
                              </Button>
                            );
                          },
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={
                          currentPage === totalPages || isFetchingKeywords
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              {/* <Button
                onClick={handleStartCrawl}
                disabled={isCrawling || keywords.length === 0 || isSavingConfig}
                size="lg"
              >
                {isCrawling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses Crawl...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Mulai Crawling
                  </>
                )}
              </Button> */}

              <Button
                onClick={handleSaveConfiguration}
                disabled={isSavingConfig || keywords.length === 0}
                size="lg"
                variant="default"
              >
                {isSavingConfig ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan Keyword dan Jadwal...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminConsole;
