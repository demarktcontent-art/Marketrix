import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let isFirestoreError = false;

      try {
        // Check if it's our custom Firestore error JSON
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error && parsed.operationType) {
          errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path || 'unknown path'}`;
          isFirestoreError = true;
        }
      } catch (e) {
        // Not a JSON error
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full shadow-lg border-t-4 border-t-red-500">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
              
              <div className="bg-red-50 p-4 rounded-lg text-left mb-8 overflow-auto max-h-48">
                <p className="text-sm font-mono text-red-800 break-words">
                  {errorMessage}
                </p>
              </div>

              {isFirestoreError && (
                <p className="text-sm text-gray-500 mb-8">
                  This might be due to missing permissions or a configuration issue. 
                  Please contact your administrator if this persists.
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleReset} className="flex items-center">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
