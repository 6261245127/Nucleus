'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Loader2,
  Megaphone,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Announcement {
  id: string;
  message: string;
  link: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export default function CMSAnnouncements() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    message: '',
    link: '',
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (token) {
      fetchAnnouncements();
    }
  }, [token]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/cms/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load announcements');
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      message: '',
      link: '',
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditId(a.id);
    setFormData({
      message: a.message,
      link: a.link || '',
      isActive: a.isActive,
      startDate: a.startDate ? new Date(a.startDate).toISOString().substring(0, 16) : '',
      endDate: a.endDate ? new Date(a.endDate).toISOString().substring(0, 16) : ''
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message) {
      toast.error('Message is required');
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      id: editId,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
    };

    try {
      const url = '/api/admin/cms/announcements';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save announcement');
      toast.success(editId ? 'Announcement updated' : 'Announcement created');
      setIsEditing(false);
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const res = await fetch(`/api/admin/cms/announcements?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete announcement');
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms/announcements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: announcement.id,
          isActive: !announcement.isActive
        })
      });

      if (!res.ok) throw new Error('Failed to toggle status');
      toast.success('Status updated successfully');
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/cms">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Global Announcement Bar</h1>
            <p className="text-white/60 mt-1">Configure promotions or notifications appearing in a banner at the top of the website.</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Announcement
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">{editId ? 'Edit Announcement' : 'Add Announcement'}</CardTitle>
              <CardDescription className="text-white/50">Edit text banner details and scheduling rules.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="text-white hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aMsg" className="text-white">Announcement Message</Label>
                <Input
                  id="aMsg"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="e.g. 🔥 New Feature: We now support dynamic referral codes! Read guidelines."
                  className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aLink" className="text-white">Redirect URL (optional)</Label>
                  <Input
                    id="aLink"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="e.g. /blog/new-features or #pricing"
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                    className="border-white/20 data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="isActive" className="text-white cursor-pointer select-none">
                    Make Active Immediately
                  </Label>
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="font-semibold text-white/80 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" /> Scheduling (Optional)
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-white">Start Date & Time</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-white">End Date & Time</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Announcement
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-20 bg-[#0A1128]/80 border border-white/10 rounded-2xl">
          <Megaphone className="w-12 h-12 mx-auto text-white/20 mb-4" />
          <p className="text-white/80 font-bold">No announcements created</p>
          <p className="text-sm text-white/50 mt-1">Create an announcement to pin to the top of the site.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <Card key={item.id} className={`bg-[#0A1128]/80 border-white/10 shadow-xl overflow-hidden group`}>
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-primary" />
                    <span className="font-bold text-white text-sm">{item.message}</span>
                  </div>
                  {item.link && (
                    <p className="text-xs text-white/40 pl-6">
                      Redirects to: <span className="underline font-mono">{item.link}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pl-6 pt-1 text-[11px] text-white/40">
                    <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
                    {item.startDate && <span>Starts: {new Date(item.startDate).toLocaleString()}</span>}
                    {item.endDate && <span>Ends: {new Date(item.endDate).toLocaleString()}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 sm:border-l sm:border-white/5 sm:pl-4">
                  <Button
                    size="sm"
                    variant={item.isActive ? 'default' : 'outline'}
                    onClick={() => handleToggleActive(item)}
                    className={`rounded-xl text-xs ${
                      item.isActive 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenEdit(item)}
                    className="w-8 h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
