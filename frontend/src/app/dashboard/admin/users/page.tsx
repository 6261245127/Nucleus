'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield, Ban, CheckCircle, MoreHorizontal } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  coins: number;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const users: UserData[] = [
    { id: '1', name: 'Vinay Gupta', email: 'vinay@example.com', role: 'ADMIN', isVerified: true, createdAt: '2026-01-15', coins: 0 },
    { id: '2', name: 'Sarah Connor', email: 'sarah@example.com', role: 'CREATOR', isVerified: true, createdAt: '2026-02-20', coins: 5000 },
    { id: '3', name: 'John Smith', email: 'john@example.com', role: 'VIEWER', isVerified: true, createdAt: '2026-03-10', coins: 1250 },
    { id: '4', name: 'Emily Chen', email: 'emily@example.com', role: 'VIEWER', isVerified: false, createdAt: '2026-04-05', coins: 320 },
    { id: '5', name: 'TechGuru', email: 'tech@example.com', role: 'CREATOR', isVerified: false, createdAt: '2026-05-28', coins: 0 },
    { id: '6', name: 'Alex Turner', email: 'alex@example.com', role: 'VIEWER', isVerified: true, createdAt: '2026-05-01', coins: 890 },
    { id: '7', name: 'Maria Lopez', email: 'maria@example.com', role: 'VIEWER', isVerified: true, createdAt: '2026-05-15', coins: 2100 },
    { id: '8', name: 'DanceStudio', email: 'dance@example.com', role: 'CREATOR', isVerified: true, createdAt: '2026-04-20', coins: 3500 },
  ];

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">Search, verify, suspend, or manage all platform users.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="VIEWER">Viewers</SelectItem>
            <SelectItem value="CREATOR">Creators</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
                        <CheckCircle className="w-3 h-3 mr-1" />Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20" variant="outline">
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{user.coins.toLocaleString()} 🪙</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!user.isVerified && (
                        <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-600 hover:bg-green-500/10">
                          <Shield className="w-4 h-4 mr-1" /> Verify
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                        <Ban className="w-4 h-4 mr-1" /> Suspend
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
