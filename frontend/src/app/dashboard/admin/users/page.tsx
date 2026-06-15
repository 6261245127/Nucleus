'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Shield, Ban, CheckCircle, MoreHorizontal, Download, Users, UserCheck, AlertTriangle } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UserDetailsDrawer } from '@/components/admin/UserDetailsDrawer';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const { data: users, meta, analytics, isLoading, params, updateParams, setPage, refresh } = useUsers();
  
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const toggleSelectUser = (id: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUsers(newSet);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIds: Array.from(selectedUsers), action })
      });
      if (!res.ok) throw new Error('Bulk action failed');
      toast.success(`Bulk ${action} successful`);
      setSelectedUsers(new Set());
      refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const exportCSV = () => {
    if (!users || users.length === 0) {
      toast.error("No data to export");
      return;
    }
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Verified', 'Coins', 'Created At'],
      ...users.map(u => [
        `"${u.name}"`,
        u.email,
        u.role,
        u.accountStatus,
        u.isVerified ? 'Yes' : 'No',
        u.wallet?.coinBalance || 0,
        new Date(u.createdAt).toLocaleDateString()
      ])
    ].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nucleus_users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export successful");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20" variant="outline">Admin</Badge>;
      case 'CREATOR': return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20" variant="outline">Creator</Badge>;
      case 'VIEWER': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20" variant="outline">Viewer</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Search, verify, suspend, or manage all platform users.</p>
        </div>
        <Button onClick={exportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold">{analytics?.totalUsers || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Creators</p>
              <h3 className="text-2xl font-bold">{analytics?.totalCreators || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified</p>
              <h3 className="text-2xl font-bold">{analytics?.verifiedUsers || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suspended</p>
              <h3 className="text-2xl font-bold">{analytics?.suspendedUsers || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-3 flex-1 w-full flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={params.search || ''}
              onChange={(e) => updateParams({ search: e.target.value })}
              className="pl-9"
            />
          </div>
          <Select value={params.role || 'ALL'} onValueChange={(val) => updateParams({ role: val })}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="VIEWER">Viewers</SelectItem>
              <SelectItem value="CREATOR">Creators</SelectItem>
            </SelectContent>
          </Select>
          <Select value={params.status || 'ALL'} onValueChange={(val) => updateParams({ status: val })}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="BANNED">Banned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={params.sort || 'newest'} onValueChange={(val) => updateParams({ sort: val })}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest_coins">Highest Coins</SelectItem>
              <SelectItem value="most_active">Most Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Menu (visible if items selected) */}
      {selectedUsers.size > 0 && (
        <div className="flex gap-2 items-center p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium mr-4">{selectedUsers.size} Selected</span>
          <Button size="sm" onClick={() => handleBulkAction('VERIFY')} className="bg-green-600 hover:bg-green-700">Verify</Button>
          <Button size="sm" onClick={() => handleBulkAction('SUSPEND')} variant="destructive">Suspend</Button>
          <Button size="sm" onClick={() => handleBulkAction('UNSUSPEND')} variant="outline">Unsuspend</Button>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={users.length > 0 && selectedUsers.size === users.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">Loading users...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-col sm:flex-row">
                        {user.isVerified && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
                            <CheckCircle className="w-3 h-3 mr-1" />Verified
                          </Badge>
                        )}
                        {user.accountStatus !== 'ACTIVE' && (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20" variant="outline">
                            {user.accountStatus}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{user.wallet?.coinBalance || 0} 🪙</span>
                        <span className="text-xs text-muted-foreground">${user.totalEarnings || 0} earned</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setDrawerUserId(user.id)}>
                        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-end gap-2 items-center">
          <span className="text-sm text-muted-foreground mr-4">Page {meta.page} of {meta.totalPages}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(meta.page - 1)} 
            disabled={meta.page <= 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(meta.page + 1)} 
            disabled={meta.page >= meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Deep Details Drawer */}
      <UserDetailsDrawer 
        userId={drawerUserId} 
        isOpen={!!drawerUserId} 
        onClose={() => setDrawerUserId(null)}
        onActionComplete={refresh}
      />
    </div>
  );
}
