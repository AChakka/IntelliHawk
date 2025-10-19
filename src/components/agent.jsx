import React, { useState, useEffect, useRef } from "react";
import "./agent.css";

export default function SslCheck() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const pollResults = async (domain) => {
    try {
      const res = await fetch(`http://localhost:3001/api/ssl-check/poll/${encodeURIComponent(domain)}`);
      
      if (!res.ok) {
        throw new Error('Failed to poll results');
      }
      
      const data = await res.json();
      
      console.log('Poll result:', data);
      
      // Update progress message
      if (data.status === 'DNS') {
        setProgress('Resolving DNS...');
      } else if (data.status === 'IN_PROGRESS') {
        setProgress('Analysis in progress...');
      } else if (data.status === 'READY') {
        setProgress('Analysis complete!');
        setResult(data);
        setLoading(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else if (data.status === 'ERROR') {
        setError(data.statusMessage || 'Analysis failed');
        setLoading(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
      
      return data;
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message);
      setLoading(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!domain) {
      setError("Please enter a domain");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress("Starting analysis...");

    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    try {
      // Clean domain
      let cleanDomain = domain.trim()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .toLowerCase();

      // Start the analysis
      const startRes = await fetch('http://localhost:3001/api/ssl-check/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: cleanDomain })
      });
      
      if (!startRes.ok) {
        throw new Error('Failed to start SSL analysis');
      }
      
      const startData = await startRes.json();
      console.log('Start result:', startData);

      // Start polling every 10 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollResults(cleanDomain);
      }, 10000);

      // Do first poll immediately after 5 seconds
      setTimeout(() => {
        pollResults(cleanDomain);
      }, 5000);

    } catch (err) {
      setError(err.message || "Failed to check SSL certificate. Please try again.");
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return "#6b7280";
    if (grade === "A+" || grade === "A") return "#10b981";
    if (grade === "A-" || grade === "B") return "#f59e0b";
    if (grade === "C") return "#ff9800";
    return "#ef4444";
  };

  return (
    <div className="ssl-wrapper">
      <div className="ssl-page">
        <h1 className="ssl-title">Vendor SSL Security Check</h1>
        <p style={{ color: "#9fb1c3", marginBottom: "20px" }}>
          Powered by Qualys SSL Labs API
        </p>
        
        <form className="ssl-form" onSubmit={handleCheck}>
          <input
            type="text"
            placeholder="Enter domain (e.g. google.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="ssl-input"
            disabled={loading}
          />
          <button type="submit" className="ssl-button" disabled={loading}>
            {loading ? "Analyzing..." : "Check"}
          </button>
        </form>

        {loading && (
          <div className="ssl-status">
            <p>{progress}</p>
            <p style={{ fontSize: "0.9rem", marginTop: "8px" }}>
              This may take 1-2 minutes. Please wait...
            </p>
          </div>
        )}
        
        {error && <p className="ssl-error">{error}</p>}

        {result && result.status === "READY" && result.endpoints && result.endpoints.length > 0 && (
          <div className="ssl-result">
            <h2>SSL Certificate Results for {result.host}</h2>
            
            {result.endpoints.map((endpoint, idx) => (
              <div key={idx}>
                <div className="ssl-card">
                  <h3 style={{ color: getGradeColor(endpoint.grade), marginTop: 0 }}>
                    Security Grade: {endpoint.grade || "Pending"}
                  </h3>
                  <p><strong>IP Address:</strong> {endpoint.ipAddress}</p>
                  <p><strong>Server Name:</strong> {endpoint.serverName || "N/A"}</p>
                  <p><strong>Status:</strong> {endpoint.statusMessage}</p>
                </div>

                {endpoint.details && (
                  <>
                    <div className="ssl-card">
                      <h3 style={{ marginTop: 0 }}>Certificate Details</h3>
                      <p><strong>Subject:</strong> {endpoint.details.cert?.subject || "N/A"}</p>
                      <p><strong>Issuer:</strong> {endpoint.details.cert?.issuerLabel || "N/A"}</p>
                      <p><strong>Valid From:</strong> {endpoint.details.cert?.notBefore ? new Date(endpoint.details.cert.notBefore).toLocaleDateString() : "N/A"}</p>
                      <p><strong>Valid Until:</strong> {endpoint.details.cert?.notAfter ? new Date(endpoint.details.cert.notAfter).toLocaleDateString() : "N/A"}</p>
                      <p><strong>Key:</strong> {endpoint.details.key?.alg || "N/A"} {endpoint.details.key?.size} bits</p>
                      <p><strong>Signature Algorithm:</strong> {endpoint.details.cert?.sigAlg || "N/A"}</p>
                    </div>

                    <div className="ssl-card">
                      <h3 style={{ marginTop: 0 }}>Protocol Support</h3>
                      {endpoint.details.protocols && endpoint.details.protocols.length > 0 ? (
                        endpoint.details.protocols.map((proto, pidx) => (
                          <p key={pidx}>
                            <strong>{proto.name} {proto.version}:</strong> {proto.q === 0 ? "❌ No" : "✓ Yes"}
                          </p>
                        ))
                      ) : (
                        <p>No protocol information available</p>
                      )}
                    </div>

                    {endpoint.details.suites && (
                      <div className="ssl-card">
                        <h3 style={{ marginTop: 0 }}>Cipher Suites</h3>
                        <p><strong>Total Suites:</strong> {endpoint.details.suites.list?.length || 0}</p>
                        {endpoint.details.suites.list && endpoint.details.suites.list.slice(0, 5).map((suite, sidx) => (
                          <p key={sidx} style={{ fontSize: "0.9rem" }}>
                            {suite.name} ({suite.cipherStrength} bits)
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chat-wrapper">
        <h1 className="chat-title">IntelliHawk Assistant</h1>
        <div className="chat-window">
          <div className="chat-message bot">
            <p>Hello! Ask me about your SSL results or security best practices.</p>
          </div>
          {result && result.status === "READY" && result.endpoints && result.endpoints[0] && (
            <div className="chat-message bot">
              <p><strong>Analysis Summary:</strong></p>
              <p>
                The domain {result.host} received a grade of {result.endpoints[0].grade || "N/A"}. 
                {result.endpoints[0].grade === "A+" && " Excellent security configuration!"}
                {result.endpoints[0].grade === "A" && " Good security configuration."}
                {(result.endpoints[0].grade === "B" || result.endpoints[0].grade === "C") && " There are some security improvements recommended."}
                {(result.endpoints[0].grade === "F" || result.endpoints[0].grade === "T") && " There are serious security issues that need attention."}
              </p>
            </div>
          )}
        </div>
        <form className="chat-form" onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Type your question..." className="chat-input" />
          <button type="submit" className="chat-button">Send</button>
        </form>
      </div>
    </div>
  );
}