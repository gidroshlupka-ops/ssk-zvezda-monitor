import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Простой компонент для отлова ошибок (чтобы не было белого экрана)
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Critical Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#0f172a',
          color: 'white',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <h1 style={{fontSize: '2rem', marginBottom: '1rem', color: '#ef4444'}}>Системная ошибка</h1>
          <p style={{color: '#94a3b8', marginBottom: '2rem'}}>Приложение завершило работу аварийно.</p>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            maxWidth: '600px',
            width: '100%',
            overflow: 'auto',
            border: '1px solid #334155',
            textAlign: 'left',
            marginBottom: '2rem'
          }}>
            <code style={{color: '#f87171', whiteSpace: 'pre-wrap', fontSize: '0.875rem'}}>
              {this.state.error?.toString()}
            </code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Перезагрузить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);