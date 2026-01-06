import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Keyword {
  id: string;
  keyword: string;
}

interface CrawlKeywordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialKeywords: Keyword[] = [
  { id: '1', keyword: 'slot online' },
  { id: '2', keyword: 'judi bola' },
  { id: '3', keyword: 'poker online' },
  { id: '4', keyword: 'togel online' },
  { id: '5', keyword: 'casino online' },
];

const CrawlKeywordModal: React.FC<CrawlKeywordModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchEngine, setSearchEngine] = useState('cse-google');
  const { toast } = useToast();

  const handleEdit = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setEditValue(keyword.keyword);
  };

  const handleSaveEdit = () => {
    if (!editValue.trim()) {
      toast({
        title: 'Error',
        description: 'Keyword tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    setKeywords(prev =>
      prev.map(k =>
        k.id === editingId ? { ...k, keyword: editValue.trim() } : k
      )
    );
    setEditingId(null);
    setEditValue('');
    toast({
      title: 'Berhasil',
      description: 'Keyword berhasil diubah',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id: string) => {
    setKeywords(prev => prev.filter(k => k.id !== id));
    toast({
      title: 'Berhasil',
      description: 'Keyword berhasil dihapus',
    });
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      toast({
        title: 'Error',
        description: 'Keyword tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    const newId = (Math.max(...keywords.map(k => parseInt(k.id)), 0) + 1).toString();
    setKeywords(prev => [...prev, { id: newId, keyword: newKeyword.trim() }]);
    setNewKeyword('');
    setIsAdding(false);
    toast({
      title: 'Berhasil',
      description: 'Keyword baru berhasil ditambahkan',
    });
  };

  const handleCancelAdd = () => {
    setNewKeyword('');
    setIsAdding(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="crawl-keyword-modal" className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle id="crawl-keyword-modal-title" className="text-xl font-bold">
              Crawl New URL - Kelola Keyword
            </DialogTitle>
          </div>
        </DialogHeader>

        <div id="crawl-keyword-actions" className="flex-shrink-0 mb-4">
          {!isAdding ? (
            <div className="flex flex-wrap gap-2 items-center">
              <Button id="add-keyword-btn" onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add New Keyword
              </Button>
              <Select value={searchEngine} onValueChange={setSearchEngine}>
                <SelectTrigger id="search-engine-select" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Pilih Search Engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem id="search-engine-cse-google" value="cse-google">CSE Google</SelectItem>
                  <SelectItem id="search-engine-baidu" value="baidu">Baidu</SelectItem>
                  <SelectItem id="search-engine-bing" value="bing">Bing</SelectItem>
                </SelectContent>
              </Select>
              <Checkbox
                id={`auto-reason-checkbox`}
              />
              AI Reasoning
              <Button
                id="start-crawl-btn"
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => {
                  toast({
                    title: 'Memulai Crawl',
                    description: `Crawling dengan search engine: ${searchEngine === 'cse-google' ? 'CSE Google' : searchEngine === 'baidu' ? 'Baidu' : 'Bing'}`,
                  });
                  // TODO: Implement actual crawl request with searchEngine value
                  console.log('Start crawl with:', { searchEngine, keywords });
                }}
              >
                Start Crawl
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
                  if (e.key === 'Enter') handleAddKeyword();
                  if (e.key === 'Escape') handleCancelAdd();
                }}
                autoFocus
              />
              <Button id="confirm-add-keyword-btn" size="icon" onClick={handleAddKeyword}>
                <Check className="h-4 w-4" />
              </Button>
              <Button id="cancel-add-keyword-btn" size="icon" variant="outline" onClick={handleCancelAdd}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div id="keyword-table-container" className="flex-1 overflow-y-auto border rounded-lg">
          <Table id="keyword-table">
            <TableHeader className="sticky top-0 bg-muted">
              <TableRow>
                <TableHead id="th-keyword-no" className="w-16 text-center">No</TableHead>
                <TableHead id="th-keyword">Keyword</TableHead>
                <TableHead id="th-keyword-action" className="w-32 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody id="keyword-table-body">
              {keywords.map((keyword, index) => (
                <TableRow key={keyword.id} id={`keyword-row-${keyword.id}`} className="hover:bg-muted/30">
                  <TableCell id={`keyword-no-${keyword.id}`} className="text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell id={`keyword-value-${keyword.id}`}>
                    {editingId === keyword.id ? (
                      <Input
                        id={`edit-keyword-input-${keyword.id}`}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
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
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            id={`delete-keyword-btn-${keyword.id}`}
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(keyword.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {keywords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} id="keyword-empty-message" className="text-center py-8 text-muted-foreground">
                    Belum ada keyword. Klik "Add New Keyword" untuk menambahkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CrawlKeywordModal;
