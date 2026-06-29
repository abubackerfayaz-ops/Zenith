import { Spinner } from '@/components/ui/spinner';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading FameWars...
        </p>
      </div>
    </div>
  );
}
