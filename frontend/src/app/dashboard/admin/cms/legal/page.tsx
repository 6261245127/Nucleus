'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  Loader2,
  Edit3
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  effectiveDate: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
}

export default function LegalPagesCMS() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [editingPage, setEditingPage] = useState<LegalPage | null>(null);

  useEffect(() => {
    if (token) {
      fetchPages();
    }
  }, [token]);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/cms/legal', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load legal pages');
      const data = await res.json();
      setPages(data.pages || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPage({
      id: 'NEW',
      slug: '',
      title: '',
      content: '',
      isPublished: false,
      effectiveDate: '',
      metaTitle: '',
      metaDescription: '',
      updatedAt: ''
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    setSaving(true);
    const isNew = editingPage.id === 'NEW';
    const url = isNew ? '/api/admin/cms/legal' : `/api/admin/cms/legal/${editingPage.id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingPage)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save page');
      
      toast.success(data.message);
      setEditingPage(null);
      fetchPages();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this legal page? This may break footer links or compliance.')) return;

    try {
      const res = await fetch(`/api/admin/cms/legal/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete page');
      toast.success('Page deleted successfully');
      fetchPages();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 text-white pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/cms">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Legal & Policies</h1>
            <p className="text-white/60 mt-1">Manage platform Terms, Privacy Policy, and other legal documents.</p>
          </div>
        </div>
        {!editingPage && (
          <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Create New Page
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pages List */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" /> Published & Drafts
            </CardTitle>
            <CardDescription className="text-white/50">All system legal pages</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : pages.length === 0 ? (
              <p className="text-center text-white/50 text-sm py-4">No pages found. Create one to get started.</p>
            ) : (
              <div className="space-y-2">
                {pages.map((page) => (
                  <div 
                    key={page.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      editingPage?.id === page.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer'
                    }`}
                    onClick={() => setEditingPage(page)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{page.title}</p>
                        {page.isPublished ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 uppercase">Live</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 uppercase">Draft</span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-1">/{page.slug}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handleDelete(page.id); }}
                        className="w-8 h-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl lg:col-span-2">
          {editingPage ? (
            <CardContent className="pt-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{editingPage.id === 'NEW' ? 'Create Page' : 'Edit Page'}</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-white">Page Title</Label>
                    <Input
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      placeholder="e.g. Privacy Policy"
                      required
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">URL Slug</Label>
                    <Input
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                      placeholder="e.g. privacy-policy"
                      required
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Page Content (HTML or Markdown)</Label>
                  <Textarea
                    value={editingPage.content}
                    onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                    placeholder="Write your policy here..."
                    required
                    className="bg-white/5 border-white/10 text-white rounded-xl min-h-[300px] font-mono text-sm"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-white">Meta Title (SEO)</Label>
                    <Input
                      value={editingPage.metaTitle || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
                      placeholder="SEO Title"
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Effective Date</Label>
                    <Input
                      type="date"
                      value={editingPage.effectiveDate ? new Date(editingPage.effectiveDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingPage({ ...editingPage, effectiveDate: e.target.value })}
                      className="bg-white/5 border-white/10 text-white rounded-xl [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-white">Meta Description (SEO)</Label>
                    <Textarea
                      value={editingPage.metaDescription || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                      placeholder="SEO Description"
                      className="bg-white/5 border-white/10 text-white rounded-xl"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 border border-white/10 p-4 rounded-xl bg-white/5">
                  <Checkbox 
                    id="published" 
                    checked={editingPage.isPublished}
                    onCheckedChange={(checked) => setEditingPage({ ...editingPage, isPublished: checked as boolean })}
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="published" className="text-white font-medium">Publish Page</Label>
                    <p className="text-xs text-white/50">If checked, this page will be publicly accessible.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                  <Button type="button" variant="outline" onClick={() => setEditingPage(null)} className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Legal Page
                  </Button>
                </div>
              </form>
            </CardContent>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <FileText className="w-16 h-16 text-white/10 mb-4" />
              <h3 className="text-xl font-bold">No Page Selected</h3>
              <p className="text-sm text-white/40 max-w-sm mt-1">
                Select a legal page from the list to edit its content and SEO metadata, or create a new one.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
