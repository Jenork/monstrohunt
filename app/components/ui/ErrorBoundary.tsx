'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: false }; // Don't show error UI for extension conflicts
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Only log errors that are not from browser extensions
    if (!error.message?.includes('tronlinkParams') && 
        !error.message?.includes('proxy') &&
        !error.stack?.includes('chrome-extension')) {
      console.error('Application error:', error, errorInfo);
    }
  }

  render() {
    return this.props.children;
  }
}
