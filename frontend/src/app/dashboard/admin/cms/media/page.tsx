'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Search, 
  ArrowLeft, 
  Loader2,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  category: string;
  createdAt: string;
}

export default function CMSMediaLibrary() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('HERO');

  useEffect(() => {
    if (token) {
      fetchMedia();
    }
  }, [token]);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/admin/cms/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load media library');
      const data = await res.json();
      setMedia(data.media || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', uploadCategory);

    try {
      const res = await fetch('/api/admin/cms/media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      toast.success('Media uploaded successfully');
      setSelectedFile(null);
      // Reset input element
      const input = document.getElementById('file-upload-input') as HTMLInputElement;
      if (input) input.value = '';
      fetchMedia();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item? This cannot be undone and may break page assets.')) return;

    try {
      const res = await fetch(`/api/admin/cms/media?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete media');
      toast.success('Media item deleted');
      fetchMedia();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success('Image link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter media
  const filteredMedia = media.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'ALL' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/cms">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
            <p className="text-white/60 mt-1">Upload, replace, and copy URLs of website images and logo assets.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Upload form */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" /> Upload New Asset
            </CardTitle>
            <CardDescription className="text-white/50">Add files to local storage.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload-input" className="text-white">Choose File</Label>
                <Input
                  id="file-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary cursor-pointer file:text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary/20 file:hover:bg-primary/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uploadCategory" className="text-white">Asset Category</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A1128] border-white/10 text-white">
                    <SelectItem value="LOGO">Logo / Favicon</SelectItem>
                    <SelectItem value="HERO">Hero Banner</SelectItem>
                    <SelectItem value="FEATURE">Feature Showcase</SelectItem>
                    <SelectItem value="CREATOR">Creator Avatars</SelectItem>
                    <SelectItem value="BANNER">Marketing Banner</SelectItem>
                    <SelectItem value="OTHER">Other Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> Upload Asset
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-green-400" /> Uploaded Assets
                </CardTitle>
                <CardDescription className="text-white/50">Manage uploaded assets in uploads folder.</CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Search name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A1128] border-white/10 text-white">
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="LOGO">Logo</SelectItem>
                    <SelectItem value="HERO">Hero</SelectItem>
                    <SelectItem value="FEATURE">Feature</SelectItem>
                    <SelectItem value="CREATOR">Creator</SelectItem>
                    <SelectItem value="BANNER">Banners</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <ImageIcon className="w-12 h-12 mx-auto text-white/20 mb-4" />
                <p className="text-white/80 font-bold">No assets found</p>
                <p className="text-sm text-white/50 mt-1">Upload images to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMedia.map((item) => (
                  <div 
                    key={item.id} 
                    className="group border border-white/10 hover:border-white/20 rounded-2xl bg-white/5 overflow-hidden flex flex-col justify-between transition-all"
                  >
                    <div className="aspect-video bg-black/40 flex items-center justify-center relative overflow-hidden">
                      {item.mimeType.startsWith('image/') ? (
                        <img 
                          src={item.url} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <FileText className="w-10 h-10 text-white/40" />
                      )}
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold text-white/80 tracking-wide uppercase">
                        {item.category}
                      </div>
                    </div>

                    <div className="p-3 space-y-1">
                      <p className="text-sm font-bold truncate text-white" title={item.name}>{item.name}</p>
                      <div className="flex justify-between text-[11px] text-white/40">
                        <span>{formatSize(item.size)}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="p-2 pt-0 flex gap-1 bg-black/20">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(item.url, item.id)}
                        className="flex-1 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg flex items-center justify-center gap-1"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Link
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
