import { Mic } from 'lucide-react';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="relative flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Mic className="size-4" strokeWidth={2.5} />
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        Sales<span className="text-primary">Daddy</span>
      </span>
    </span>
  );
}
