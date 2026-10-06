import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected application error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
          <section className="card max-w-lg text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Something went wrong
            </h1>
            <p className="mt-3 text-gray-600">
              The page could not be displayed. Reload the app to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Reload app
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
