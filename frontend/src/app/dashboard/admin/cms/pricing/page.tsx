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
  ArrowUp, 
  ArrowDown, 
  Save, 
  X, 
  Loader2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  badgeLabel: string | null;
  buttonText: string;
  isPopular: boolean;
  order: number;
}

export default function CMSPricingPlans() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  
  // Form Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    currency: 'INR',
    period: '/mo',
    features: [''],
    badgeLabel: '',
    buttonText: 'Get Started',
    isPopular: false
  });

  useEffect(() => {
    if (token) {
      fetchPlans();
    }
  }, [token]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/cms/pricing', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditPlanId(null);
    setFormData({
      name: '',
      price: '',
      currency: 'INR',
      period: '/mo',
      features: [''],
      badgeLabel: '',
      buttonText: 'Get Started',
      isPopular: false
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (plan: PricingPlan) => {
    setEditPlanId(plan.id);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      currency: plan.currency,
      period: plan.period || '',
      features: plan.features.length > 0 ? [...plan.features] : [''],
      badgeLabel: plan.badgeLabel || '',
      buttonText: plan.buttonText,
      isPopular: plan.isPopular
    });
    setIsEditing(true);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData(prev => ({ ...prev, features: updated }));
  };

  const addFeatureField = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeatureField = (index: number) => {
    const updated = [...formData.features];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, features: updated.length > 0 ? updated : [''] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === '') {
      toast.error('Plan name and price are required');
      return;
    }

    setSaving(true);
    // Filter empty features
    const cleanFeatures = formData.features.filter(f => f.trim() !== '');

    const payload = {
      ...formData,
      id: editPlanId,
      price: parseFloat(formData.price),
      features: cleanFeatures
    };

    try {
      const url = '/api/admin/cms/pricing';
      const method = editPlanId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save pricing plan');
      toast.success(editPlanId ? 'Pricing plan updated' : 'Pricing plan created');
      setIsEditing(false);
      fetchPlans();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;

    try {
      const res = await fetch(`/api/admin/cms/pricing?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete pricing plan');
      toast.success('Pricing plan deleted');
      fetchPlans();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newPlans = [...plans];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newPlans.length) return;

    // Swap elements
    const temp = newPlans[index];
    newPlans[index] = newPlans[targetIndex];
    newPlans[targetIndex] = temp;

    // Recalculate orders
    const updatedPlans = newPlans.map((p, idx) => ({ ...p, order: idx }));
    setPlans(updatedPlans);

    try {
      const res = await fetch('/api/admin/cms/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedPlans)
      });
      if (!res.ok) throw new Error('Failed to save sorting order');
      toast.success('Pricing order updated');
    } catch (error: any) {
      toast.error(error.message);
      fetchPlans(); // revert UI on failure
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
            <h1 className="text-3xl font-bold tracking-tight">Pricing Plans Manager</h1>
            <p className="text-white/60 mt-1">Add, edit, reorder, or delete creator subscription plans shown on the website.</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add New Plan
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">{editPlanId ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}</CardTitle>
              <CardDescription className="text-white/50">Provide pricing plan name, currency, price, and features list.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="text-white hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="planName" className="text-white">Plan Name</Label>
                  <Input
                    id="planName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Pro Creator"
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planPrice" className="text-white">Price (in INR/only)</Label>
                  <Input
                    id="planPrice"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. 3999"
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planCurrency" className="text-white">Currency</Label>
                  <Input
                    id="planCurrency"
                    value={formData.currency}
                    disabled
                    placeholder="INR"
                    className="bg-white/5 border-white/10 text-white/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planPeriod" className="text-white">Billing Period Tag</Label>
                  <Input
                    id="planPeriod"
                    value={formData.period}
                    onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                    placeholder="e.g. /mo or leave empty"
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planBadge" className="text-white">Badge Label</Label>
                  <Input
                    id="planBadge"
                    value={formData.badgeLabel}
                    onChange={(e) => setFormData(prev => ({ ...prev, badgeLabel: e.target.value }))}
                    placeholder="e.g. Most Popular"
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planBtn" className="text-white">Button Text</Label>
                  <Input
                    id="planBtn"
                    value={formData.buttonText}
                    onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="e.g. Get Started"
                    className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isPopular"
                  checked={formData.isPopular}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: !!checked }))}
                  className="border-white/20 data-[state=checked]:bg-primary"
                />
                <Label htmlFor="isPopular" className="text-white cursor-pointer select-none">
                  Highlight as Popular Plan (adds Sparkle badges and gradient borders)
                </Label>
              </div>

              {/* Plan Features */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Plan Features</Label>
                  <Button type="button" size="sm" onClick={addFeatureField} className="bg-primary/20 text-primary hover:bg-primary/30 border-0 rounded-lg">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder={`Feature #${idx + 1}`}
                        className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFeatureField(idx)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Plan
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
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-[#0A1128]/80 border border-white/10 rounded-2xl">
          <CreditCard className="w-12 h-12 mx-auto text-white/20 mb-4" />
          <p className="text-white/80 font-bold">No pricing plans found</p>
          <p className="text-sm text-white/50 mt-1">Create a plan to show on the website.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <Card 
              key={plan.id} 
              className={`bg-[#0A1128]/80 border-white/10 shadow-xl overflow-hidden flex flex-col justify-between group relative ${
                plan.isPopular ? 'border-primary/50 ring-1 ring-primary/30' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-gradient-to-r from-primary to-secondary rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-2.5 h-2.5" /> Popular
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-white/50">
                      Order position: {plan.order}
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-white">₹{plan.price}</span>
                  <span className="text-white/50 ml-1 text-sm">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                <ul className="space-y-2 mt-2">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="text-xs text-white/70 flex items-center gap-1.5">
                      <span className="text-primary font-bold text-sm">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <div className="p-4 bg-black/20 flex gap-2 justify-between border-t border-white/5">
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === plans.length - 1}
                    className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleOpenEdit(plan)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
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
