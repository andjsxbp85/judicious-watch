import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Plus,
  Pencil,
  Trash2,
  User as UserIcon,
  Shield,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  userService,
  User,
  UserCreateInput,
  UserUpdateInput,
} from "@/services/userService";

interface UserFormData {
  full_name: string;
  email: string;
  password: string;
  is_admin: boolean;
}

const UserManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    email: "",
    password: "",
    is_admin: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  // Check admin access
  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki akses ke halaman ini",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [isAdmin, navigate, toast]);

  // Fetch users on mount
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setIsFetching(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data user",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ full_name: "", email: "", password: "", is_admin: false });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: "",
      is_admin: user.is_admin,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingUser) {
        // Update existing user
        const updateData: UserUpdateInput = {
          full_name: formData.full_name,
          email: formData.email,
          is_admin: formData.is_admin,
        };

        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        await userService.updateUser(editingUser.id, updateData);
        toast({
          title: "User Diperbarui",
          description: `User ${formData.full_name} berhasil diperbarui`,
        });
      } else {
        // Add new user
        const createData: UserCreateInput = {
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          is_active: true,
          is_admin: formData.is_admin,
        };

        await userService.createUser(createData);
        toast({
          title: "User Ditambahkan",
          description: `User ${formData.full_name} berhasil ditambahkan`,
        });
      }

      // Refresh users list
      await fetchUsers();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsLoading(true);

    try {
      await userService.deleteUser(deletingUser.id);
      toast({
        title: "User Dihapus",
        description: `User ${deletingUser.full_name} berhasil dihapus`,
      });

      // Refresh users list
      await fetchUsers();
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render content if not admin
  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive" />
          <h2 className="text-2xl font-bold">Akses Ditolak</h2>
          <p className="text-muted-foreground">
            Anda tidak memiliki akses ke halaman ini
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div id="user-management-page" className="space-y-6">
        {/* Header */}
        <div
          id="user-management-header"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1
              id="user-management-title"
              className="text-2xl lg:text-3xl font-bold text-foreground"
            >
              Kelola User
            </h1>
            <p
              id="user-management-subtitle"
              className="text-muted-foreground mt-1"
            >
              Tambah, edit, dan hapus user sistem
            </p>
          </div>
          <Button id="add-user-btn" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah User
          </Button>
        </div>

        {/* Stats */}
        <div
          id="user-stats-container"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card id="stat-card-total-user">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  id="stat-icon-total-user"
                  className="p-3 rounded-xl bg-primary/10"
                >
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p
                    id="stat-label-total-user"
                    className="text-sm text-muted-foreground"
                  >
                    Total User
                  </p>
                  <p id="stat-value-total-user" className="text-2xl font-bold">
                    {users.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card id="stat-card-admin">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  id="stat-icon-admin"
                  className="p-3 rounded-xl bg-destructive/10"
                >
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p
                    id="stat-label-admin"
                    className="text-sm text-muted-foreground"
                  >
                    Admin
                  </p>
                  <p id="stat-value-admin" className="text-2xl font-bold">
                    {users.filter((u) => u.is_admin).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card id="stat-card-verifikator">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  id="stat-icon-verifikator"
                  className="p-3 rounded-xl bg-success/10"
                >
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p
                    id="stat-label-verifikator"
                    className="text-sm text-muted-foreground"
                  >
                    Verifikator
                  </p>
                  <p id="stat-value-verifikator" className="text-2xl font-bold">
                    {users.filter((u) => !u.is_admin).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card id="users-table-card">
          <CardHeader>
            <CardTitle id="users-table-title" className="text-lg">
              Daftar User
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isFetching ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Tidak ada data user
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table id="users-table">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead id="th-name">Nama</TableHead>
                      <TableHead id="th-email">Email</TableHead>
                      <TableHead id="th-role">Role</TableHead>
                      <TableHead
                        id="th-created-at"
                        className="hidden md:table-cell"
                      >
                        Dibuat
                      </TableHead>
                      <TableHead
                        id="th-last-login"
                        className="hidden md:table-cell"
                      >
                        Login Terakhir
                      </TableHead>
                      <TableHead id="th-actions" className="text-right">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody id="users-table-body">
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        id={`user-row-${user.id}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell id={`user-name-${user.id}`}>
                          <div className="flex items-center gap-3">
                            <div
                              id={`user-avatar-${user.id}`}
                              className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center"
                            >
                              <span className="text-sm font-semibold text-primary">
                                {user.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">
                              {user.full_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell id={`user-email-${user.id}`}>
                          {user.email}
                        </TableCell>
                        <TableCell id={`user-role-${user.id}`}>
                          <Badge
                            variant={user.is_admin ? "destructive" : "default"}
                            className="capitalize"
                          >
                            {user.is_admin ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verifikator
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell
                          id={`user-created-${user.id}`}
                          className="hidden md:table-cell text-muted-foreground"
                        >
                          {new Date(user.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell
                          id={`user-last-login-${user.id}`}
                          className="hidden md:table-cell text-muted-foreground"
                        >
                          {user.last_login
                            ? new Date(user.last_login).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </TableCell>
                        <TableCell
                          id={`user-actions-${user.id}`}
                          className="text-right"
                        >
                          <div className="flex justify-end gap-2">
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
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent id="user-form-dialog">
          <DialogHeader>
            <DialogTitle id="user-form-dialog-title">
              {editingUser ? "Edit User" : "Tambah User Baru"}
            </DialogTitle>
          </DialogHeader>
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Masukkan email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password{" "}
                {editingUser && "(kosongkan jika tidak ingin mengubah)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Masukkan password"
                required={!editingUser}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.is_admin ? "admin" : "verifikator"}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_admin: value === "admin",
                  }))
                }
              >
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent id="role-select-content">
                  <SelectItem id="role-option-admin" value="admin">
                    Admin
                  </SelectItem>
                  <SelectItem id="role-option-verifikator" value="verifikator">
                    Verifikator
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter id="user-form-footer">
              <Button
                id="cancel-user-form-btn"
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                id="submit-user-form-btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingUser ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah User"
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
            Apakah Anda yakin ingin menghapus user{" "}
            <strong>{deletingUser?.full_name}</strong>? Tindakan ini tidak dapat
            dibatalkan.
          </p>
          <DialogFooter id="delete-user-dialog-footer">
            <Button
              id="cancel-delete-user-btn"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              id="confirm-delete-user-btn"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default UserManagement;
