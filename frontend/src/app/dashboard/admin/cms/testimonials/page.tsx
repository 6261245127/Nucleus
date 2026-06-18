'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  X, 
  Loader2,
  Star,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  image: string | null;
  review: string;
  rating: number;
  order: number;
}

export default function CMSTestimonials() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    image: '',
    review: '',
    rating: 5
  });

  useEffect(() => {
    if (token) {
      fetchTestimonials();
    }
  }, [token]);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/cms/testimonials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load testimonials');
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      name: '',
      role: '',
      company: '',
      image: '',
      review: '',
      rating: 5
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditId(t.id);
    setFormData({
      name: t.name,
      role: t.role,
      company: t.company || '',
      image: t.image || '',
      review: t.review,
      rating: t.rating
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.review) {
      toast.error('Name, role, and review are required');
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      id: editId
    };

    try {
      const url = '/api/admin/cms/testimonials';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save testimonial');
      toast.success(editId ? 'Testimonial updated' : 'Testimonial created');
      setIsEditing(false);
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const res = await fetch(`/api/admin/cms/testimonials?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete testimonial');
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newTestimonials = [...testimonials];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newTestimonials.length) return;

    // Swap elements
    const temp = newTestimonials[index];
    newTestimonials[index] = newTestimonials[targetIndex];
    newTestimonials[targetIndex] = temp;

    // Recalculate orders
    const updatedTestimonials = newTestimonials.map((t, idx) => ({ ...t, order: idx }));
    setTestimonials(updatedTestimonials);

    try {
      const res = await fetch('/api/admin/cms/testimonials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedTestimonials)
      });
      if (!res.ok) throw new Error('Failed to save testimonials order');
      toast.success('Testimonials order updated');
    } catch (error: any) {
      toast.error(error.message);
      fetchTestimonials();
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
            <h1 className="text-3xl font-bold tracking-tight">Testimonials Manager</h1>
            <p className="text-white/60 mt-1">Manage, sort, and display client & user reviews on the landing page.</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Testimonial
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">{editId ? 'Edit Testimonial' : 'Add New Testimonial'}</CardTitle>
              <CardDescription className="text-white/50">Edit reviewer details, quotes, and ratings.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="text-white hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tName" className="text-white">Reviewer Name</Label>
                  <Input
                    id="tName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Sarah Jenkins"
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tRole" className="text-white">Reviewer Role</Label>
                  <Input
                    id="tRole"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. YouTube Creator"
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tCompany" className="text-white">Company (optional)</Label>
                  <Input
                    id="tCompany"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Google"
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tRating" className="text-white">Rating (1 to 5 Stars)</Label>
                  <Select 
                    value={formData.rating.toString()} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, rating: parseInt(val) }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A1128] border-white/10 text-white">
                      <SelectItem value="5">⭐⭐⭐⭐⭐ (5 Stars)</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ (4 Stars)</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ (3 Stars)</SelectItem>
                      <SelectItem value="2">⭐⭐ (2 Stars)</SelectItem>
                      <SelectItem value="1">⭐ (1 Star)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tImage" className="text-white">Reviewer Avatar Image URL</Label>
                  <Input
                    id="tImage"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://images.unsplash.com/... or picking from library"
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tReview" className="text-white">Review Quote</Label>
                <Textarea
                  id="tReview"
                  value={formData.review}
                  onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Paste review message here..."
                  className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Testimonial
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
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 bg-[#0A1128]/80 border border-white/10 rounded-2xl">
          <MessageSquare className="w-12 h-12 mx-auto text-white/20 mb-4" />
          <p className="text-white/80 font-bold">No testimonials found</p>
          <p className="text-sm text-white/50 mt-1">Add a testimonial to display on the site.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, idx) => (
            <Card 
              key={t.id} 
              className="bg-[#0A1128]/80 border-white/10 shadow-xl overflow-hidden flex flex-col justify-between group relative"
            >
              <CardHeader className="pb-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, sIdx) => (
                    <Star key={sIdx} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-white/80 leading-relaxed italic">"{t.review}"</p>
                <div className="flex items-center gap-3 mt-6">
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-white text-sm leading-none">{t.name}</h4>
                    <p className="text-xs text-white/40 mt-1">{t.role} {t.company ? `@ ${t.company}` : ''}</p>
                  </div>
                </div>
              </CardContent>

              <div className="p-3 bg-black/20 flex gap-2 justify-between border-t border-white/5 text-xs text-white/40">
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="w-8 h-8 text-white/50 hover:text-white disabled:opacity-20 rounded-lg"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === testimonials.length - 1}
                    className="w-8 h-8 text-white/50 hover:text-white disabled:opacity-20 rounded-lg"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenEdit(t)}
                    className="w-8 h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(t.id)}
                    className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
