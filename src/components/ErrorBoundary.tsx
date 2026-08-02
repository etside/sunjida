import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Optional label to identify which part of the app failed (e.g. a route path). */
  scope?: string;
  /** Renders a compact inline fallback instead of a full-screen page. */
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Catches React render/lifecycle errors and shows a friendly fallback so an
 * unexpected runtime error never leaves the user on a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.scope ? `:${this.props.scope}` : ''}]`, error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    // Recover automatically when the boundary's scope (e.g. route) changes.
    if (this.state.hasError && prevProps.scope !== this.props.scope) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  private handleRetry = () => this.setState({ hasError: false, error: undefined });

  private handleHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (!this.state.hasError) return this.props.children;

    const detail = this.state.error?.message;

    if (this.props.inline) {
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
          <AlertCircle className="size-6 mx-auto text-destructive" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            This section could not be loaded. এই অংশটি লোড করা যায়নি।
          </p>
          <Button size="sm" variant="outline" onClick={this.handleRetry}>
            Try again
          </Button>
        </div>
      );
    }

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center px-6 py-24 bg-background"
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
            <p className="text-base text-muted-foreground">
              An unexpected error occurred, but your data is safe. Try again or head back home.
            </p>
            <p className="text-sm text-muted-foreground">
              অপ্রত্যাশিত একটি সমস্যা হয়েছে। আবার চেষ্টা করুন বা হোমে ফিরে যান।
            </p>
            {detail && (
              <p className="text-xs text-muted-foreground/70 break-words font-mono">{detail}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={this.handleRetry}>Try again</Button>
            <Button variant="outline" onClick={this.handleHome}>
              Return home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
