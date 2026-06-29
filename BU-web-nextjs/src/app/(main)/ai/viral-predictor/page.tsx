'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

const ViralPredictor = dynamic(
  () =>
    import('@/components/ai/viral-predictor').then((m) => m.ViralPredictor),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    ),
  },
);

export default function ViralPredictorPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Viral Predictor</h1>
        <p className="text-muted-foreground">
          AI-powered content performance prediction
        </p>
      </div>
      <ViralPredictor />
    </div>
  );
}
