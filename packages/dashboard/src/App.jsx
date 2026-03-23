import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Terminal } from 'lucide-react';

function App() {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [targetUrl, setTargetUrl] = useState(() => localStorage.getItem('senrigan_targetUrl') || '');
  const [inputUrl, setInputUrl] = useState(targetUrl);
  const logEndRef = useRef(null);

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    let url = inputUrl.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }
    setTargetUrl(url);
    localStorage.setItem('senrigan_targetUrl', url);
  };

  const handlePulse = useCallback((pulse) => {
    setLogs(prev => {
      const newLogs = [...prev, { ...pulse, timestamp: Date.now() }];
      if (newLogs.length > 1000) {
        return newLogs.slice(newLogs.length - 1000);
      }
      return newLogs;
    });
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9000?client=dashboard');
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'pulse') {
          handlePulse(data.data);
        }
      } catch (err) {
        console.error('Failed to parse pulse', err);
      }
    };
    return () => ws.close();
  }, [handlePulse]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <>
      <div className="header">
        <Eye size={28} color="var(--accent-cyan)" />
        <h1>Senrigan</h1>
        
        <form onSubmit={handleUrlSubmit} style={{ display: 'flex', alignItems: 'center', marginLeft: '24px', gap: '8px' }}>
          <input 
            type="text" 
            value={inputUrl} 
            onChange={(e) => setInputUrl(e.target.value)} 
            placeholder="Enter App URL (e.g. localhost:3000)" 
            style={{ 
              background: 'rgba(0,0,0,0.05)', 
              border: '1px solid rgba(0,0,0,0.1)', 
              color: 'var(--text-primary)', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              outline: 'none',
              width: '250px',
              fontSize: '13px'
            }}
          />
          <button type="submit" style={{
            background: 'rgba(6, 182, 212, 0.1)',
            color: 'var(--accent-cyan)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500
          }}>
            Load
          </button>
        </form>

        <div className="status-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="pulsing-dot" style={{ animationPlayState: isConnected ? 'running' : 'paused', backgroundColor: isConnected ? 'var(--accent-cyan)' : '#ef4444' }}></div>
          {isConnected ? 'Collector Connected' : 'Disconnected'}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        {targetUrl && (
          <div style={{ flex: 2, borderRight: '1px solid rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column' }}>
            <iframe 
              src={targetUrl} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              title="Target App"
            />
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'var(--bg-panel)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Terminal size={14} /> Live Execution Log
            <button 
              onClick={() => setLogs([])}
              style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', padding: '2px 8px', color: 'var(--text-secondary)' }}
            >
              Clear
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', fontSize: '13px', lineHeight: 1.6 }}>
            {logs.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Waiting for the first execution pulse...
              </div>
            )}
            {logs.map((log, i) => {
              const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;
              return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', wordBreak: 'break-all', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)', minWidth: '65px' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <span style={{ color: 'var(--accent-cyan)' }}>
                    [{log.file}{log.line ? `:${log.line}` : ''}]
                  </span>
                  <span style={{ color: 'var(--accent-purple)' }}>
                    {log.functionName || 'File execution'}
                  </span>
                </div>
                {hasMetadata && (
                  <div style={{ color: 'var(--text-primary)', opacity: 0.8, paddingLeft: '77px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>↳</span> {JSON.stringify(log.metadata)}
                  </div>
                )}
              </div>
            )})}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
