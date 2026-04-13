import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Scale, FileText, CheckCircle, AlertTriangle, Download, Mic, MicOff, Volume2, VolumeX, Wand2, GitCompare, ShieldAlert, Baby, ArrowRight, Phone, X, MessageSquareQuote, Info, Gavel } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import './index.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const EMERGENCY_SCENARIOS = [
  { icon: '🚔', label: 'Arrested by Police', query: 'I have been arrested by the police. What are my rights?' },
  { icon: '📝', label: 'Filing an FIR', query: 'Police is refusing to file my FIR. What should I do?' },
  { icon: '🛡️', label: "Women's Safety", query: 'I am facing harassment at workplace as a woman. What legal protections do I have?' },
  { icon: '💻', label: 'Cybercrime', query: 'Someone is blackmailing me online with my private photos. What are my legal options?' },
  { icon: '🛒', label: 'Consumer Complaint', query: 'I bought a defective product and the company is refusing refund. What can I do?' },
  { icon: '💼', label: 'Workplace Harassment', query: 'My employer is not paying my salary for 3 months. What legal action can I take?' },
];

const ASSISTANT_EXAMPLES = [
  "Can police arrest me without warrant?",
  "Can my landlord force me to leave?",
  "What are my rights during traffic checking?",
  "Can my employer refuse salary?",
  "What should I do if someone scams me online?"
];

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [wizardResult, setWizardResult] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [emergencyResult, setEmergencyResult] = useState(null);
  const [assistantResult, setAssistantResult] = useState(null);
  const [error, setError] = useState('');
  const [eli10, setEli10] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [compareA1, setCompareA1] = useState('');
  const [compareA2, setCompareA2] = useState('');
  const speechRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/index`).then(r => setIndex(r.data)).catch(() => {});
  }, []);

  // ─── Voice Search ───
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Voice search is not supported in this browser. Try Chrome.');
      return;
    }
    if (isListening) {
      speechRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    speechRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // ─── Text-to-Speech ───
  const speakText = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length > 0) {
      setSuggestions(index.filter(item =>
        item.article.toLowerCase().includes(value.toLowerCase()) ||
        item.title.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const clearAll = () => {
    setResult(null); setWizardResult(null); setCompareResult(null); setEmergencyResult(null); setAssistantResult(null); setError('');
  };

  // ─── API Calls ───
  const handleSearch = async (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    const q = forcedQuery || query;
    if (!q.trim()) return;
    setLoading(true); clearAll(); setSuggestions([]);
    try {
      const res = await axios.post(`${API}/ask`, { query: q, eli10 });
      if (res.data.error) setError(res.data.error); else setResult(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Backend error.'); }
    finally { setLoading(false); }
  };

  const handleWizard = async (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    const q = forcedQuery || query;
    if (!q.trim()) return;
    setLoading(true); clearAll(); setSuggestions([]);
    try {
      const res = await axios.post(`${API}/wizard`, { problem: q });
      if (res.data.error) setError(res.data.error); else setWizardResult(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Backend error.'); }
    finally { setLoading(false); }
  };

  const handleAssistant = async (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    const q = forcedQuery || query;
    if (!q.trim()) return;
    setLoading(true); clearAll(); setSuggestions([]);
    try {
      const res = await axios.post(`${API}/assistant`, { question: q });
      if (res.data.error) setError(res.data.error); else setAssistantResult(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Backend error.'); }
    finally { setLoading(false); }
  };

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    if (!compareA1.trim() || !compareA2.trim()) return;
    setLoading(true); clearAll();
    try {
      const res = await axios.post(`${API}/compare`, { article1: compareA1, article2: compareA2 });
      if (res.data.error) setError(res.data.error); else setCompareResult(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Backend error.'); }
    finally { setLoading(false); }
  };

  const handleEmergency = async (situation) => {
    setLoading(true); clearAll();
    try {
      const res = await axios.post(`${API}/emergency`, { situation });
      if (res.data.error) setError(res.data.error); else setEmergencyResult(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Backend error.'); }
    finally { setLoading(false); }
  };

  // ─── Download helpers ───
  const downloadPDF = (data) => {
    const doc = new jsPDF(); const pw = doc.internal.pageSize.getWidth(); const m = 20; const mw = pw - m * 2; let y = 20;
    const add = (t, s, st = 'normal', c = [30,30,30]) => { doc.setFontSize(s); doc.setFont('helvetica', st); doc.setTextColor(...c); const l = doc.splitTextToSize(t, mw); if (y + l.length * s * 0.5 > 270) { doc.addPage(); y = 20; } doc.text(l, m, y); y += l.length * s * 0.5 + 4; };
    doc.setFillColor(26, 35, 126); doc.rect(0, 0, pw, 40, 'F'); doc.setTextColor(255,255,255); doc.setFontSize(22); doc.setFont('helvetica','bold'); doc.text('Legal Dost', m, 18); doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.text('AI Analysis Report', m, 28); doc.setFontSize(8); doc.text(`Generated: ${new Date().toLocaleString()}`, m, 35); y = 50;
    add(`${data.articleNumber || 'Legal Analysis'}: ${data.articleTitle || data.question}`, 18, 'bold'); y += 2;
    if (data.originalMeaning) { add('ORIGINAL MEANING', 10, 'bold', [100,100,100]); add(`"${data.originalMeaning}"`, 11, 'italic'); }
    if (data.amendmentInfo) add(`Amendment: ${data.amendmentInfo}`, 10, 'normal', [80,80,80]); y += 4;
    add('SIMPLIFIED MEANING / ANSWER', 10, 'bold', [100,100,100]); add(data.simplifiedMeaning || data.simpleAnswer, 12); y += 4;
    if (data.realLifeExample) { add('REAL-LIFE EXAMPLE', 10, 'bold', [100,100,100]); add(data.realLifeExample, 11); y += 4; }
    if (data.whyItMatters) { add('WHY IT MATTERS', 10, 'bold', [100,100,100]); add(data.whyItMatters, 11); y += 4; }
    if (data.relatedArticles?.length > 0 || data.relatedLaws?.length > 0) {
      add('RELATED LAWS', 10, 'bold', [100,100,100]); add((data.relatedArticles || data.relatedLaws).join(', '), 11);
    }
    add(`Disclaimer: ${data.disclaimer}`, 9, 'normal', [120,120,120]);
    doc.save(`LegalDost_Report.pdf`);
  };
  const downloadDOCX = async (data) => {
    const d = new Document({ sections: [{ children: [
      new Paragraph({ children: [new TextRun({ text: 'Legal Dost — AI Report', bold: true, size: 36, color: '1A237E' })], spacing: { after: 300 } }),
      new Paragraph({ text: data.articleTitle || data.question, heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ children: [new TextRun({ text: 'Simple Answer: ', bold: true }), new TextRun({ text: data.simplifiedMeaning || data.simpleAnswer })], spacing: { after: 200 } }),
      new Paragraph({ children: [new TextRun({ text: 'Real-Life Example: ', bold: true }), new TextRun({ text: data.realLifeExample })], spacing: { after: 200 } }),
      new Paragraph({ children: [new TextRun({ text: `Disclaimer: ${data.disclaimer}`, color: '999999', size: 18 })], spacing: { before: 400 } }),
    ]}] });
    saveAs(await Packer.toBlob(d), `LegalDost_Report.docx`);
  };

  const getSpeakableText = () => {
    if (result) return `${result.articleNumber}. ${result.articleTitle}. ${result.simplifiedMeaning}. ${result.realLifeExample}`;
    if (wizardResult) return `${wizardResult.problemSummary}. ${wizardResult.relevantArticles.map(a => `${a.articleNumber}: ${a.howItHelps}`).join('. ')}`;
    if (assistantResult) return `${assistantResult.simpleAnswer}. ${assistantResult.whatTheLawSays}`;
    if (emergencyResult) return `${emergencyResult.situation}. Your rights: ${emergencyResult.yourRights.join('. ')}. Steps: ${emergencyResult.immediateSteps.join('. ')}`;
    return '';
  };

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Scale size={32} color="var(--primary)" />
          <div>
            <div className="brand-title">Legal Dost</div>
            <div className="sub-title">AI-Powered Constitution Simplifier</div>
          </div>
        </div>
        <div className="header-controls">
          <button className={`mode-toggle ${eli10 ? 'active' : ''}`} onClick={() => setEli10(!eli10)} title="Explain Like I'm 10">
            <Baby size={18} /> ELI10
          </button>
          {(result || wizardResult || emergencyResult || assistantResult) && (
            <button className={`mode-toggle ${isSpeaking ? 'active' : ''}`} onClick={() => speakText(getSpeakableText())} title="Read aloud">
              {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
        </div>
      </header>

      {/* ─── Tab Navigation ─── */}
      <nav className="tab-nav">
        {[
          { id: 'search', icon: <Search size={16} />, label: 'Constitution' },
          { id: 'assistant', icon: <MessageSquareQuote size={16} />, label: 'Legal Assistant' },
          { id: 'wizard', icon: <Wand2 size={16} />, label: 'Find My Right' },
          { id: 'compare', icon: <GitCompare size={16} />, label: 'Compare' },
          { id: 'emergency', icon: <ShieldAlert size={16} />, label: 'Emergency' },
        ].map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => { setActiveTab(tab.id); clearAll(); }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      <main>
        {/* ─── TAB: Search ─── */}
        {activeTab === 'search' && (
          <section className="tab-content animation-fade-in">
            <h1>Decoding the Supreme Law.</h1>
            <p className="hero-sub">Search, synthesize, and understand every article with archival precision.</p>
            <div className="search-wrapper">
              <form onSubmit={handleSearch} className="search-container">
                <Search size={24} color="var(--outline)" style={{ alignSelf: 'center', marginLeft: '1rem' }} />
                <input type="text" placeholder="Search articles, topics, or ask a question..." value={query} onChange={handleInputChange} />
                <button type="button" className={`btn-voice ${isListening ? 'listening' : ''}`} onClick={toggleVoice} title="Voice Search">
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Analyzing...' : 'Begin Review'}
                </button>
              </form>
              {suggestions.length > 0 && (
                <div className="suggestions-list">
                  {suggestions.map((item, idx) => (
                    <div key={idx} className="suggestion-item" onClick={() => { setQuery(`${item.article}: ${item.title}`); handleSearch(null, `${item.article}: ${item.title}`); }}>
                      <span className="art-num">{item.article}</span><span className="art-title">{item.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {eli10 && <div className="eli10-badge">👶 ELI10 Mode Active — Answers in super simple language</div>}
          </section>
        )}

        {/* ─── TAB: Assistant (NEW) ─── */}
        {activeTab === 'assistant' && (
          <section className="tab-content animation-fade-in">
            <h1>⚖️ AI Legal Rights Assistant</h1>
            <p className="hero-sub">Get instant, structured advice on daily legal situations in simple language.</p>
            <div className="search-wrapper">
              <form onSubmit={handleAssistant} className="search-container">
                <Gavel size={24} color="var(--outline)" style={{ alignSelf: 'center', marginLeft: '1rem' }} />
                <input type="text" placeholder='Ask anything... e.g. "Can police check my phone?"' value={query} onChange={(e) => setQuery(e.target.value)} />
                <button type="button" className={`btn-voice ${isListening ? 'listening' : ''}`} onClick={toggleVoice}>{isListening ? <MicOff size={20} /> : <Mic size={20} />}</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Consulting...' : 'Get Legal Answer'}</button>
              </form>
              <div className="example-queries">
                {ASSISTANT_EXAMPLES.map((ex, i) => (
                  <button key={i} className="example-chip" onClick={() => { setQuery(ex); handleAssistant(null, ex); }}>{ex}</button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── TAB: Wizard ─── */}
        {activeTab === 'wizard' && (
          <section className="tab-content animation-fade-in">
            <h1>🧙 Find the Right Article</h1>
            <p className="hero-sub">Describe your real-life problem. We'll find the law that protects you.</p>
            <div className="search-wrapper">
              <form onSubmit={handleWizard} className="search-container">
                <Wand2 size={24} color="var(--outline)" style={{ alignSelf: 'center', marginLeft: '1rem' }} />
                <input type="text" placeholder='e.g. "My landlord is refusing to return my deposit"' value={query} onChange={(e) => setQuery(e.target.value)} />
                <button type="button" className={`btn-voice ${isListening ? 'listening' : ''}`} onClick={toggleVoice}>{isListening ? <MicOff size={20} /> : <Mic size={20} />}</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Finding...' : 'Find My Rights'}</button>
              </form>
            </div>
          </section>
        )}

        {/* ─── TAB: Compare ─── */}
        {activeTab === 'compare' && (
          <section className="tab-content animation-fade-in">
            <h1>⚖️ Compare Articles</h1>
            <p className="hero-sub">Understand the difference between two articles side by side.</p>
            <form onSubmit={handleCompare} className="compare-form">
              <input type="text" placeholder="Article 14" value={compareA1} onChange={(e) => setCompareA1(e.target.value)} className="compare-input" />
              <span className="vs-badge">VS</span>
              <input type="text" placeholder="Article 15" value={compareA2} onChange={(e) => setCompareA2(e.target.value)} className="compare-input" />
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Comparing...' : 'Compare'}</button>
            </form>
          </section>
        )}

        {/* ─── TAB: Emergency ─── */}
        {activeTab === 'emergency' && (
          <section className="tab-content animation-fade-in">
            <h1>🚨 Emergency Rights Guide</h1>
            <p className="hero-sub">Know your rights immediately in urgent situations.</p>
            <div className="emergency-grid">
              {EMERGENCY_SCENARIOS.map((s, idx) => (
                <button key={idx} className="emergency-card" onClick={() => handleEmergency(s.query)} disabled={loading}>
                  <span className="emergency-icon">{s.icon}</span>
                  <span className="emergency-label">{s.label}</span>
                  <ArrowRight size={16} className="emergency-arrow" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ─── Loading ─── */}
        {loading && (
          <div className="loading-container animation-fade-in">
            <div className="loading-spinner"></div>
            <p>AI Legal Expert is analyzing your query...</p>
          </div>
        )}

        {/* ─── Error ─── */}
        {error && (
          <div className="disclaimer-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}><AlertTriangle size={20} /> System Notice</div>
            <p style={{ margin: '0.5rem 0 0 0' }}>{error}</p>
          </div>
        )}

        {/* ─── Result: Assistant (NEW) ─── */}
        {assistantResult && (
          <div className="accuracy-layer-card assistant-result animation-fade-in">
            <div className="assistant-header">
              <MessageSquareQuote size={32} color="var(--primary)" />
              <div>
                <h2>{assistantResult.question}</h2>
                <div className="assistant-badge">Legal Rights Assistant Answer</div>
              </div>
            </div>
            
            <div className="response-section alt">
              <div className="section-label">Simple Answer</div>
              <p className="simplified-text highlight">{assistantResult.simpleAnswer}</p>
            </div>

            <div className="response-section">
              <div className="section-label">What the Law Says</div>
              <p>{assistantResult.whatTheLawSays}</p>
            </div>

            <div className="assistant-grid">
              <div className="assistant-col rights">
                <div className="section-label">🛡️ Your Rights</div>
                <ul>{assistantResult.userRights.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
              <div className="assistant-col steps">
                <div className="section-label">✅ What To Do Next</div>
                <ol>{assistantResult.whatToDoNext.map((s, i) => <li key={i}>{s}</li>)}</ol>
              </div>
            </div>

            {assistantResult.warning && (
              <div className="disclaimer-banner warning">
                <AlertTriangle size={20} /> <strong>Warning:</strong> {assistantResult.warning}
              </div>
            )}

            <div className="response-section alt">
              <div className="section-label">Real-Life Example</div>
              <p>{assistantResult.realLifeExample}</p>
            </div>

            <div className="response-section">
              <div className="section-label">Related Articles or Laws</div>
              <div className="chips">{assistantResult.relatedLaws.map((l, i) => <span key={i} className="chip">{l}</span>)}</div>
            </div>

            <div className="disclaimer-banner info">
              <Info size={16} /> <strong>Educational Info:</strong> {assistantResult.disclaimer}
            </div>

            <div className="download-bar">
              <span className="download-label">Export Analysis</span>
              <div className="download-buttons">
                <button className="btn-download pdf" onClick={() => downloadPDF(assistantResult)}><Download size={16} /> PDF</button>
                <button className="btn-download docx" onClick={() => downloadDOCX(assistantResult)}><Download size={16} /> DOCX</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Result: Standard Article ─── */}
        {result && (
          <div className="accuracy-layer-card animation-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{result.articleNumber}</h2>
                <div style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant)' }}>{result.articleTitle}</div>
              </div>
              <div className={`verified-badge ${result.source !== 'Verified Constitution Database' ? 'general-knowledge' : ''}`}>
                {result.source === 'Verified Constitution Database' ? <CheckCircle size={16} /> : <FileText size={16} />}
                {result.source === 'Verified Constitution Database' ? 'Verified' : 'AI Knowledge'}
              </div>
            </div>
            <div className="response-section"><div className="section-label">Original Meaning</div><p style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>"{result.originalMeaning}"</p>{result.amendmentInfo && <div className="amendment-chip"><strong>Amendment:</strong> {result.amendmentInfo}</div>}</div>
            <div className="response-section alt"><div className="section-label">Simplified Meaning</div><p className="simplified-text">{result.simplifiedMeaning}</p></div>
            <div className="response-section"><div className="section-label">Real-Life Example</div><p>{result.realLifeExample}</p></div>
            <div className="response-section alt"><div className="section-label">Why It Matters</div><p>{result.whyItMatters}</p></div>
            {result.relatedArticles?.length > 0 && (
              <div className="response-section"><div className="section-label">Related Articles</div><div className="chips">{result.relatedArticles.map((a, i) => <span key={i} className="chip">{a}</span>)}</div></div>
            )}
            {result.disclaimer && <div className="disclaimer-banner"><AlertTriangle size={16} /> {result.disclaimer}</div>}
            <div className="metadata-footer">
              <div className="source-info"><FileText size={16} /> Source: {result.source}</div>
              <div className="confidence-block"><div className="confidence-labels"><span>Confidence</span><span>{result.confidenceScore}%</span></div><div className="confidence-meter-container"><div className="confidence-meter-fill" style={{ width: `${result.confidenceScore}%` }}></div></div></div>
            </div>
            <div className="download-bar"><span className="download-label">Export Report</span><div className="download-buttons"><button className="btn-download pdf" onClick={() => downloadPDF(result)}><Download size={16} /> PDF</button><button className="btn-download docx" onClick={() => downloadDOCX(result)}><Download size={16} /> DOCX</button></div></div>
          </div>
        )}

        {/* ─── Result: Wizard ─── */}
        {wizardResult && (
          <div className="accuracy-layer-card animation-fade-in">
            <h2 style={{ marginBottom: '0.5rem' }}>🧙 Your Legal Protection</h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem', fontSize: '1.1rem' }}>{wizardResult.problemSummary}</p>
            <div className="wizard-meta"><span className="chip">{wizardResult.legalCategory}</span><span className={`urgency-badge ${wizardResult.urgencyLevel}`}>Urgency: {wizardResult.urgencyLevel.toUpperCase()}</span></div>
            {wizardResult.relevantArticles.map((art, idx) => (
              <div key={idx} className="wizard-article-card">
                <div className="wizard-article-header"><strong>{art.articleNumber}</strong> — {art.articleTitle}</div>
                <p><strong>How it helps:</strong> {art.howItHelps}</p>
                <p className="action-text"><ArrowRight size={14} /> <strong>Action:</strong> {art.actionYouCanTake}</p>
              </div>
            ))}
            <div className="response-section alt"><div className="section-label">Next Steps</div><ol className="next-steps">{wizardResult.nextSteps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
            {wizardResult.disclaimer && <div className="disclaimer-banner"><AlertTriangle size={16} /> {wizardResult.disclaimer}</div>}
          </div>
        )}

        {/* ─── Result: Compare ─── */}
        {compareResult && (
          <div className="accuracy-layer-card animation-fade-in">
            <h2 style={{ marginBottom: '2rem' }}>⚖️ Comparison Result</h2>
            <div className="compare-grid">
              {[compareResult.article1, compareResult.article2].map((a, idx) => (
                <div key={idx} className="compare-col">
                  <h3>{a.articleNumber}</h3>
                  <div className="compare-title">{a.articleTitle}</div>
                  <div className="compare-detail"><strong>Summary:</strong> {a.summary}</div>
                  <div className="compare-detail"><strong>Scope:</strong> {a.scope}</div>
                  <div className="compare-detail"><strong>Protection:</strong> {a.keyProtection}</div>
                </div>
              ))}
            </div>
            <div className="compare-section"><div className="section-label">✅ Similarities</div><ul>{compareResult.similarities.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            <div className="compare-section"><div className="section-label">❌ Differences</div><ul>{compareResult.differences.map((d, i) => <li key={i}>{d}</li>)}</ul></div>
            <div className="compare-section"><div className="section-label">🤔 When to Use Which?</div><p>{compareResult.whichToUseWhen}</p></div>
            {compareResult.disclaimer && <div className="disclaimer-banner"><AlertTriangle size={16} /> {compareResult.disclaimer}</div>}
          </div>
        )}

        {/* ─── Result: Emergency ─── */}
        {emergencyResult && (
          <div className="accuracy-layer-card emergency-result animation-fade-in">
            <h2 style={{ marginBottom: '1rem' }}>🚨 {emergencyResult.situation}</h2>
            <div className="emergency-section rights"><div className="section-label">🛡️ Your Rights</div><ul>{emergencyResult.yourRights.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
            <div className="emergency-section steps"><div className="section-label">✅ Do This Immediately</div><ol>{emergencyResult.immediateSteps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
            <div className="emergency-section donot"><div className="section-label">🚫 Do NOT Do This</div><ul>{emergencyResult.doNot.map((d, i) => <li key={i}>{d}</li>)}</ul></div>
            <div className="emergency-section"><div className="section-label">📞 Helpline Numbers</div><div className="helplines">{emergencyResult.helplineNumbers.map((h, i) => <div key={i} className="helpline-card"><Phone size={16} /><strong>{h.name}</strong><span>{h.number}</span></div>)}</div></div>
            <div className="emergency-section"><div className="section-label">📜 Relevant Laws</div><div className="chips">{emergencyResult.relevantLaws.map((l, i) => <span key={i} className="chip">{l}</span>)}</div></div>
            {emergencyResult.disclaimer && <div className="disclaimer-banner"><AlertTriangle size={16} /> {emergencyResult.disclaimer}</div>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

