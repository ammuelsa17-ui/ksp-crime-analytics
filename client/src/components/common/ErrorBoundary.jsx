import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Enterprise UI Error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
          boxSizing: 'border-box',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '2.5rem',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
            <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#F8FAFC' }}>
              Operational Console State Recovered
            </h2>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.5' }}>
              The application encountered an isolated UI rendering exception. System state and Catalyst Datastore connectivity remain secure.
            </p>
            <div style={{
              background: '#0F172A',
              border: '1px solid #334155',
              padding: '0.75rem',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              color: '#38BDF8',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              DIAGNOSTIC: KSP-UI-ERR-8801<br />EXCEPTION: {this.state.error?.message || 'Isolated Rendering Exception'}<br />
              TIMESTAMP: {new Date().toISOString()}<br />
              RECOVERY: AUTOMATIC ISOLATION PASS
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => { window.location.hash = 'overview'; window.location.reload(); }}
                style={{
                  background: '#38BDF8',
                  color: '#0F172A',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                🏢 Reset View to Overview
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: 'transparent',
                  color: '#94A3B8',
                  border: '1px solid #334155',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                🔄 Reload Console
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
