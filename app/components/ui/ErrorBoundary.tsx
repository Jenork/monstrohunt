'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
  stack?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Only log errors that are not from browser extensions
    if (!error.message?.includes('tronlinkParams') && 
        !error.message?.includes('proxy') &&
        !error.stack?.includes('chrome-extension')) {
      console.error('Application error:', error, errorInfo);
    }
    this.setState({
      stack: errorInfo?.componentStack || error?.stack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>
              Something went wrong. Please refresh the page.
            </div>
            {this.state.message && (
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Error: {this.state.message}
              </div>
            )}
            {process.env.NODE_ENV === 'development' && this.state.stack && (
              <pre style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
