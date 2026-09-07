'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Turnstile from 'react-turnstile';

interface TurnstileWidgetProps {
  siteKey?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  action?: string;
  className?: string;
  onVerify?: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: unknown) => void;
}

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function TurnstileWidget({
  siteKey,
  theme = 'auto',
  size = 'normal',
  action,
  className = '',
  onVerify,
  onExpire,
  onError,
}: TurnstileWidgetProps) {
  const [token, setToken] = useState<string>('');
  const isClient = useIsClient();
  const resolvedSiteKey =
    siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  const handleVerify = (receivedToken: string) => {
    setToken(receivedToken);
    onVerify?.(receivedToken);
  };

  const handleExpire = () => {
    setToken('');
    onExpire?.();
  };

  const handleError = (err: unknown) => {
    setToken('');
    onError?.(err);
  };

  if (!isClient) {
    return (
      <div className={`min-h-[65px] flex items-center justify-center ${className}`}>
        <div className="h-10 w-full max-w-[300px] rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center my-2 ${className}`}>
      {/* Hidden input to ensure FormData in Server Actions always captures cf-turnstile-response */}
      <input type="hidden" name="cf-turnstile-response" value={token} />

      <div className="overflow-hidden rounded-xl">
        <Turnstile
          sitekey={resolvedSiteKey}
          theme={theme}
          size={size}
          action={action}
          onVerify={handleVerify}
          onExpire={handleExpire}
          onError={handleError}
          responseField={false}
        />
      </div>
    </div>
  );
}
