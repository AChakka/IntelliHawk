import React, { useState } from "react";
import "./agent.css";

export default function SslCheck() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!domain) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `https://api.ssllabs.com/api/v4/analyze?host=${domain}`
      );
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Failed to fetch SSL Labs results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ssl-wrapper">
      {/* Left: SSL Checker */}
      <div className="ssl-page">
        <h1 className="ssl-title">Vendor SSl Security Check</h1>
        <form className="ssl-form" onSubmit={handleCheck}>
          <input
            type="text"
            placeholder="Enter domain (e.g. example.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="ssl-input"
          />
          <button type="submit" className="ssl-button">
            Check
          </button>
        </form>

        {loading && <p className="ssl-status">Analyzing… please wait</p>}
        {error && <p className="ssl-error">{error}</p>}

        {result && result.endpoints && result.endpoints.length > 0 && (
          <div className="ssl-result">
            <h2>Results for {result.host}</h2>
            {result.endpoints.map((ep, idx) => (
              <div key={idx} className="ssl-card">
                <p><strong>IP:</strong> {ep.ipAddress}</p>
                <p><strong>Grade:</strong> {ep.grade || "Pending…"}</p>
                <p><strong>Status:</strong> {ep.statusMessage}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: ChatGPT Wrapper Skeleton */}
      <div className="chat-wrapper">
        <h1 className="chat-title">IntelliHawk Assistant</h1>
        <div className="chat-window">
          <div className="chat-message bot">
            <p>Hello! Ask me about your SSL results or security best practices.</p>
          </div>
          {/* Future messages will map here */}
        </div>
        <form className="chat-form">
          <input
            type="text"
            placeholder="Type your question..."
            className="chat-input"
          />
          <button type="submit" className="chat-button">Send</button>
        </form>
      </div>
    </div>
  );
}