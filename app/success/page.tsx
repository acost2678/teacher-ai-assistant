'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Verify the payment server-side before firing the conversion
    fetch(`/api/verify-checkout?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.paid) {
          // Fire Google Ads conversion only after Stripe confirms payment
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'conversion', {
              send_to: 'AW-18116639889/ZD5TCM6N1qIcEJH5175D',
              value: 9.99,
              currency: 'USD',
              transaction_id: sessionId,
            });
          }
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Confirming your payment...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-6 text-center max-w-md">
          We couldn't verify your payment. If you were charged, please contact support.
        </p>
        <Link href="/" className="text-blue-600 underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-bold mb-4">Welcome to Thrive & Learn! 🎉</h1>
        <p className="mb-6 text-lg">
          Your membership is active. You now have full access to all 59 AI-powered tools.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}