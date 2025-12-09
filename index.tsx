import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Импорт стилей обязателен!

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
          backgroundColor: '#1e293b',
          color: 'white',
          fontFamily: 'sans-serif'
        }}>
          <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>Упс! Произошла ошибка.</h1>
          <p style={{color: '#94a3b8', marginBottom: '2rem'}}>Приложение упало. Покажите этот текст разработчику.</p>
          <div style={{
            backgroundColor: '#0f172a',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            maxWidth: '800px',
            overflow: 'auto',
            border: '1px solid #334155'
          }}>
            <code style={{color: '#ef4444', whiteSpace: 'pre-wrap'}}>
              {this.state.error?.toString()}
            </code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold'
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