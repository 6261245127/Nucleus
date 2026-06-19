"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WalletRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/creator/plans');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-muted-foreground animate-pulse">Redirecting to Plans & Billing...</p>
    </div>
  );
}
