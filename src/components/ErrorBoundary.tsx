/**
 * Root error boundary: avoids a blank screen when a subtree throws.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '../lib/observability';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Something went wrong.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    captureException(error, { componentStack: info.componentStack ?? '' });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-orange-50 to-white">
          <div className="max-w-md text-center space-y-6">
            <h1 className="text-2xl font-black serif italic brand-text">An unexpected error occurred</h1>
            <p className="text-sm text-gray-600 leading-relaxed">{this.state.message}</p>
            <button
              type="button"
              className="button-brand px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.assign('/');
              }}
            >
              Back to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
