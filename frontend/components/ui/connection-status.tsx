'use client';

import React from 'react';
import { useRealTimeUpdates } from '@/hooks/use-real-time-updates';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const { isConnected } = useRealTimeUpdates();

  return (
    <Badge
      variant={isConnected ? "default" : "destructive"}
      className="flex items-center gap-1"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Connected
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </Badge>
  );
}
