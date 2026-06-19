"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface CMSCreatorPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  campaignLimit: number;
  viewerRewardCoins: number;
  features: string[];
  badgeText: string;
  buttonText: string;
  themeColor: string;
  order: number;
  isActive: boolean;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<CMSCreatorPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CMSCreatorPlan | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    campaignLimit: 0,
    viewerRewardCoins: 0,
    features: '', // We will split by newline
    badgeText: '',
    buttonText: 'Subscribe Now',
    themeColor: 'blue',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/cms/creator-plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (plan?: CMSCreatorPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        ...plan,
        features: plan.features.join('\n')
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '', slug: '', description: '', price: 0, campaignLimit: 0, viewerRewardCoins: 0,
        features: '', badgeText: '', buttonText: 'Subscribe Now', themeColor: 'blue', order: 0, isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        features: formData.features.split('\n').map(f => f.trim()).filter(f => f.length > 0)
      };

      const url = editingPlan ? `/api/admin/cms/creator-plans/${editingPlan.id}` : '/api/admin/cms/creator-plans';
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
        setIsModalOpen(false);
        fetchPlans();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Error saving plan');
      }
    } catch (error) {
      toast.error('Failed to save plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      const res = await fetch(`/api/admin/cms/creator-plans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Plan deleted');
        fetchPlans();
      } else {
        toast.error('Error deleting plan');
      }
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Creator Subscription Plans</h2>
          <p className="text-muted-foreground">Manage the SaaS pricing plans for creators.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>+ Add New Plan</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Limit</TableHead>
                <TableHead>Reward/Viewer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.order}</TableCell>
                  <TableCell>
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-xs text-muted-foreground">{plan.slug}</div>
                  </TableCell>
                  <TableCell>₹{plan.price}/mo</TableCell>
                  <TableCell>{plan.campaignLimit} campaigns</TableCell>
                  <TableCell>{plan.viewerRewardCoins} coins</TableCell>
                  <TableCell>{plan.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(plan)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(plan.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No plans created yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Gold" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. gold" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Short description of the plan" />
            </div>
            <div className="space-y-2">
              <Label>Price (₹/mo)</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Campaign Limit</Label>
              <Input type="number" value={formData.campaignLimit} onChange={(e) => setFormData({ ...formData, campaignLimit: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Viewer Reward (Coins per task)</Label>
              <Input type="number" value={formData.viewerRewardCoins} onChange={(e) => setFormData({ ...formData, viewerRewardCoins: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Theme Color</Label>
              <Input value={formData.themeColor} onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })} placeholder="e.g. from-amber-500 to-yellow-500" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Features (One per line)</Label>
              <Textarea rows={5} value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="Up to 12 Active Campaigns\nPriority Support" />
            </div>
            <div className="space-y-2">
              <Label>Badge Text</Label>
              <Input value={formData.badgeText} onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })} placeholder="e.g. Most Popular" />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
