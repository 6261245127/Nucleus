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
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export default function CMSFaqs() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: ''
  });

  useEffect(() => {
    if (token) {
      fetchFaqs();
    }
  }, [token]);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/cms/faqs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load FAQs');
      const data = await res.json();
      setFaqs(data.faqs || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({ question: '', answer: '' });
    setIsEditing(true);
  };

  const handleOpenEdit = (faq: FAQItem) => {
    setEditId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      toast.error('Question and answer are required');
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      id: editId
    };

    try {
      const url = '/api/admin/cms/faqs';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save FAQ');
      toast.success(editId ? 'FAQ updated' : 'FAQ created');
      setIsEditing(false);
      fetchFaqs();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const res = await fetch(`/api/admin/cms/faqs?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete FAQ');
      toast.success('FAQ deleted');
      fetchFaqs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newFaqs.length) return;

    // Swap elements
    const temp = newFaqs[index];
    newFaqs[index] = newFaqs[targetIndex];
    newFaqs[targetIndex] = temp;

    // Recalculate orders
    const updatedFaqs = newFaqs.map((f, idx) => ({ ...f, order: idx }));
    setFaqs(updatedFaqs);

    try {
      const res = await fetch('/api/admin/cms/faqs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedFaqs)
      });
      if (!res.ok) throw new Error('Failed to save FAQs order');
      toast.success('FAQs order updated');
    } catch (error: any) {
      toast.error(error.message);
      fetchFaqs();
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
            <h1 className="text-3xl font-bold tracking-tight">FAQs Manager</h1>
            <p className="text-white/60 mt-1">Configure questions and answers appearing in the homepage FAQ section.</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add FAQ
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">{editId ? 'Edit FAQ Item' : 'Add New FAQ Item'}</CardTitle>
              <CardDescription className="text-white/50">Enter FAQ question and answer details below.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="text-white hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faqQuestion" className="text-white">Question</Label>
                <Input
                  id="faqQuestion"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="e.g. How do Viewers earn money?"
                  className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faqAnswer" className="text-white">Answer</Label>
                <Textarea
                  id="faqAnswer"
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="e.g. Viewers earn coins by..."
                  className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  rows={5}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save FAQ
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
      ) : faqs.length === 0 ? (
        <div className="text-center py-20 bg-[#0A1128]/80 border border-white/10 rounded-2xl">
          <HelpCircle className="w-12 h-12 mx-auto text-white/20 mb-4" />
          <p className="text-white/80 font-bold">No FAQs found</p>
          <p className="text-sm text-white/50 mt-1">Add an FAQ to display on the website.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {faqs.map((faq, idx) => (
            <Card key={faq.id} className="bg-[#0A1128]/80 border-white/10 shadow-xl overflow-hidden group">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-white text-md flex items-center gap-2">
                    <span className="text-primary font-extrabold">Q:</span> {faq.question}
                  </h4>
                  <p className="text-sm text-white/60 pl-6">{faq.answer}</p>
                  <p className="text-[10px] text-white/30 pl-6">Position index: {faq.order}</p>
                </div>

                <div className="flex items-center justify-end gap-1.5 md:border-l md:border-white/5 md:pl-4">
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
                    disabled={idx === faqs.length - 1}
                    className="w-8 h-8 text-white/50 hover:text-white disabled:opacity-20 rounded-lg"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenEdit(faq)}
                    className="w-8 h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(faq.id)}
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
