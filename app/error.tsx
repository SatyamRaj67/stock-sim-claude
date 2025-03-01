"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] px-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6 text-center">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}