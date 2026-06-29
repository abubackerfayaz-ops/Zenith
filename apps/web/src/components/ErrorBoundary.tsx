import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#07071A' }}>
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 glass-strong">
              <AlertTriangle size={28} className="text-amber-400" />
            </div>
            <h2 className="text-white text-xl font-bold font-display mb-2">Something went wrong</h2>
            <p className="text-white/50 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm"
            >
              <RefreshCw size={15} /> Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
