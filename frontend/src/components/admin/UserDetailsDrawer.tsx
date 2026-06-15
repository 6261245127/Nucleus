'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UserDetailsDrawerProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
}

export function UserDetailsDrawer({ userId, isOpen, onClose, onActionComplete }: UserDetailsDrawerProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coinAdjustment, setCoinAdjustment] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserDetails();
    }
  }, [userId, isOpen]);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load user details');
      setUser(await res.json());
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string, payload?: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ action, payload })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Action failed');
      }
      toast.success(`Action ${action} completed successfully`);
      fetchUserDetails();
      onActionComplete();
      
      if (action === 'ADJUST_COINS') {
        setCoinAdjustment('');
        setAdjustmentReason('');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
          <SheetDescription>Manage user account, view history, and perform administrative actions.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-muted rounded-lg" />
              <div className="h-40 bg-muted rounded-lg" />
            </div>
          ) : (
            <>
              {/* Profile Summary */}
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{user.role}</Badge>
                    <Badge variant={user.isVerified ? "default" : "secondary"}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                    <Badge variant={user.accountStatus === 'ACTIVE' ? "outline" : "destructive"}>
                      {user.accountStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-4">Wallet Balance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Coins</p>
                    <p className="text-xl font-bold">{user.wallet?.coinBalance || 0} 🪙</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Fiat</p>
                    <p className="text-xl font-bold">${user.wallet?.fiatBalance || 0}</p>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="p-4 border rounded-lg border-red-500/20 bg-red-500/5">
                <h4 className="font-medium text-red-500 mb-4">Admin Actions</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {!user.isVerified && (
                    <Button onClick={() => handleAction('VERIFY')} variant="outline" className="text-green-500">
                      Verify User
                    </Button>
                  )}
                  {user.accountStatus === 'ACTIVE' ? (
                    <Button onClick={() => handleAction('SUSPEND')} variant="destructive">
                      Suspend
                    </Button>
                  ) : (
                    <Button onClick={() => handleAction('UNSUSPEND')} variant="outline">
                      Unsuspend
                    </Button>
                  )}
                  {user.accountStatus !== 'BANNED' && (
                    <Button onClick={() => handleAction('BAN')} variant="destructive">
                      Ban Permanently
                    </Button>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-red-500/20">
                  <h5 className="text-sm font-medium">Adjust Coins</h5>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Amount (e.g. 100 or -50)" 
                      value={coinAdjustment}
                      onChange={(e) => setCoinAdjustment(e.target.value)}
                    />
                    <Input 
                      placeholder="Reason for audit log" 
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => handleAction('ADJUST_COINS', { amount: parseInt(coinAdjustment), reason: adjustmentReason })}
                    disabled={!coinAdjustment || isNaN(parseInt(coinAdjustment))}
                    className="w-full"
                  >
                    Apply Adjustment
                  </Button>
                </div>
              </div>

              {/* Recent History */}
              <div className="space-y-4">
                <h4 className="font-medium">Recent Audit Logs</h4>
                <div className="space-y-2">
                  {user.auditLogsTargeted?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent actions.</p>
                  ) : (
                    user.auditLogsTargeted?.map((log: any) => (
                      <div key={log.id} className="p-3 bg-muted rounded-md text-sm">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{log.action}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">By Admin: {log.user?.name || 'Unknown'}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
