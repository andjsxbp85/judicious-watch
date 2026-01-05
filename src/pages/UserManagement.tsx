import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { mockUsers, User } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Plus, 
  Pencil, 
  Trash2, 
  User as UserIcon,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserFormData {
  username: string;
  password: string;
  role: 'admin' | 'verifikator';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    role: 'verifikator',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'verifikator' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingUser) {
      // Update existing user
      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id
            ? { ...u, username: formData.username, role: formData.role }
            : u
        )
      );
      toast({
        title: 'User Diperbarui',
        description: `User ${formData.username} berhasil diperbarui`,
      });
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        role: formData.role,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        verificationsCount: 0,
      };
      setUsers(prev => [...prev, newUser]);
      toast({
        title: 'User Ditambahkan',
        description: `User ${formData.username} berhasil ditambahkan`,
      });
    }

    setIsLoading(false);
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
    toast({
      title: 'User Dihapus',
      description: `User ${deletingUser.username} berhasil dihapus`,
    });

    setIsLoading(false);
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  return (
    <Layout>
      <div id="user-management-page" className="space-y-6">
        {/* Header */}
        <div id="user-management-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 id="user-management-title" className="text-2xl lg:text-3xl font-bold text-foreground">
              Kelola User
            </h1>
            <p id="user-management-subtitle" className="text-muted-foreground mt-1">
              Tambah, edit, dan hapus user sistem
            </p>
          </div>
          <Button id="add-user-btn" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah User
          </Button>
        </div>

        {/* Stats */}
        <div id="user-stats-container" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card id="stat-card-total-user">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div id="stat-icon-total-user" className="p-3 rounded-xl bg-primary/10">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p id="stat-label-total-user" className="text-sm text-muted-foreground">Total User</p>
                  <p id="stat-value-total-user" className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card id="stat-card-admin">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div id="stat-icon-admin" className="p-3 rounded-xl bg-destructive/10">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p id="stat-label-admin" className="text-sm text-muted-foreground">Admin</p>
                  <p id="stat-value-admin" className="text-2xl font-bold">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card id="stat-card-verifikator">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div id="stat-icon-verifikator" className="p-3 rounded-xl bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p id="stat-label-verifikator" className="text-sm text-muted-foreground">Verifikator</p>
                  <p id="stat-value-verifikator" className="text-2xl font-bold">
                    {users.filter(u => u.role === 'verifikator').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card id="users-table-card">
          <CardHeader>
            <CardTitle id="users-table-title" className="text-lg">Daftar User</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table id="users-table">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead id="th-username">Username</TableHead>
                    <TableHead id="th-role">Role</TableHead>
                    <TableHead id="th-created-at" className="hidden md:table-cell">Dibuat</TableHead>
                    <TableHead id="th-last-login" className="hidden md:table-cell">Login Terakhir</TableHead>
                    <TableHead id="th-verifications" className="hidden lg:table-cell">Verifikasi</TableHead>
                    <TableHead id="th-actions" className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody id="users-table-body">
                  {users.map((user) => (
                    <TableRow key={user.id} id={`user-row-${user.id}`} className="hover:bg-muted/30">
                      <TableCell id={`user-username-${user.id}`}>
                        <div className="flex items-center gap-3">
                          <div id={`user-avatar-${user.id}`} className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell id={`user-role-${user.id}`}>
                        <Badge
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell id={`user-created-${user.id}`} className="hidden md:table-cell text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell id={`user-last-login-${user.id}`} className="hidden md:table-cell text-muted-foreground">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('id-ID')
                          : '-'}
                      </TableCell>
                      <TableCell id={`user-verifications-${user.id}`} className="hidden lg:table-cell">
                        <span className="font-semibold">{user.verificationsCount}</span>
                      </TableCell>
                      <TableCell id={`user-actions-${user.id}`} className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            id={`edit-user-btn-${user.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            id={`delete-user-btn-${user.id}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDelete(user)}
                            disabled={user.username === 'admin'}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent id="user-form-dialog">
          <DialogHeader>
            <DialogTitle id="user-form-dialog-title">
              {editingUser ? 'Edit User' : 'Tambah User Baru'}
            </DialogTitle>
          </DialogHeader>
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Masukkan username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {editingUser && '(kosongkan jika tidak ingin mengubah)'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Masukkan password"
                required={!editingUser}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'verifikator') =>
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent id="role-select-content">
                  <SelectItem id="role-option-admin" value="admin">Admin</SelectItem>
                  <SelectItem id="role-option-verifikator" value="verifikator">Verifikator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter id="user-form-footer">
              <Button id="cancel-user-form-btn" type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button id="submit-user-form-btn" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingUser ? (
                  'Simpan Perubahan'
                ) : (
                  'Tambah User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent id="delete-user-dialog">
          <DialogHeader>
            <DialogTitle id="delete-user-dialog-title">Hapus User</DialogTitle>
          </DialogHeader>
          <p id="delete-user-message" className="text-muted-foreground">
            Apakah Anda yakin ingin menghapus user <strong>{deletingUser?.username}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter id="delete-user-dialog-footer">
            <Button id="cancel-delete-user-btn" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button id="confirm-delete-user-btn" variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default UserManagement;
