import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200/60 max-w-lg mx-auto mt-12 shadow-sm text-center">
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Something went wrong</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                We encountered an unexpected layout rendering issue. Try reloading the section.
              </p>
              {this.state.error && (
                <pre className="text-[10px] bg-slate-100 p-3 rounded-lg text-red-600 overflow-x-auto text-left max-h-[100px] border border-slate-200">
                  {this.state.error.message}
                </pre>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 mx-auto transition-colors"
            >
              <RefreshCw size={14} /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
