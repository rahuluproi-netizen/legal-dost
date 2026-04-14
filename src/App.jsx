import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Scale, FileText, CheckCircle, AlertTriangle, Download, Mic, MicOff, Volume2, VolumeX, Wand2, GitCompare, ShieldAlert, Baby, ArrowRight, Phone, X, MessageSquareQuote, Info, Gavel, ArrowLeft, MapPin, Clock, Share2, FileQuestion, DollarSign, Users, AlertCircle, BookOpen, ChevronRight, CheckSquare, Home, Settings, Bookmark, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import './index.css';
import SettingsView from './SettingsView';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const FOLLOW_UP_SUGGESTIONS = [
  "What should I do next?",
  "Can I file a complaint?",
  "What documents are needed?",
  "What are my rights?",
  "How much time does this process take?"
];

const EMERGENCY_SCENARIOS = [
  { icon: '🚔', label: 'Arrested by Police', query: 'I have been arrested by the police. What are my rights?', color: 'red' },
  { icon: '🛡️', label: "Women's Safety", query: 'I am facing harassment at workplace as a woman. What legal protections do I have?', color: 'green' },
  { icon: '💻', label: 'Cybercrime', query: 'Someone is blackmailing me online with my private photos. What are my legal options?', color: 'blue' },
  { icon: '🛒', label: 'Consumer Complaint', query: 'I bought a defective product and the company is refusing refund. What can I do?', color: 'blue' },
  { icon: '🏠', label: 'Domestic Violence', query: 'I am facing domestic violence. What legal protection do I have?', color: 'red' },
  { icon: '🚗', label: 'Accident', query: 'I met with an accident. What are my legal rights?', color: 'green' },
];

const FORMS_TEMPLATES = [
  { id: 'fir', title: 'FIR Draft', description: 'Draft a First Information Report for police' },
  { id: 'rti', title: 'RTI Application', description: 'Right to Information request template' },
  { id: 'consumer', title: 'Consumer Complaint', description: 'File a complaint with consumer forum' },
  { id: 'legal-notice', title: 'Legal Notice', description: 'Send a legal notice to the opposite party' }
];

const RIGHTS_CARDS = [
  { title: "Police cannot take your phone without permission", content: "Your mobile phone is personal property. Police cannot seize it without a proper reason or warrant." },
  { title: "Women can file FIR at any police station", content: "A woman can file an FIR at any police station regardless of jurisdiction. They cannot refuse." },
  { title: "Tenant cannot be evicted without notice", content: "A landlord must give you a written notice before eviction. Self-help eviction is illegal." }
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
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
  const [selectedRelatedArticle, setSelectedRelatedArticle] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [showRightCards, setShowRightCards] = useState(false);
  const [showCostEstimator, setShowCostEstimator] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const speechRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentQuestions');
    if (saved) setRecentQuestions(JSON.parse(saved));
    const savedState = localStorage.getItem('selectedState');
    if (savedState) setSelectedState(savedState);
    axios.get(`${API}/index`).then(r => setIndex(r.data)).catch(() => {});
  }, []);

  const addRecentQuestion = (q) => {
    const updated = [q, ...recentQuestions.filter(x => x !== q)].slice(0, 10);
    setRecentQuestions(updated);
    localStorage.setItem('recentQuestions', JSON.stringify(updated));
  };

  const clearRecentQuestions = () => {
    setRecentQuestions([]);
    localStorage.removeItem('recentQuestions');
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    localStorage.setItem('selectedState', state);
  };

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
    setResult(null); setWizardResult(null); setCompareResult(null); setEmergencyResult(null); setAssistantResult(null); setError(''); setSelectedRelatedArticle(null);
  };

  const executeApiCall = async (endpoint, payload, setter) => {
    setLoading(true); clearAll(); setSuggestions([]);
    if (payload.query || payload.question || payload.problem) {
      addRecentQuestion(payload.query || payload.question || payload.problem);
    }
    try {
      const res = await axios.post(`${API}/${endpoint}`, payload);
      if (res.data.error) setError(res.data.error); else setter(res.data);
    } catch (err) { setError(err.response?.data?.error || 'Backend error.'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    const q = forcedQuery || query;
    if (!q.trim()) return;
    executeApiCall('ask', { query: q, eli10, state: selectedState }, setResult);
  };

  const handleAssistant = (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    const q = forcedQuery || query;
    if (!q.trim()) return;
    executeApiCall('assistant', { question: q }, setAssistantResult);
  };

  const handleWizard = (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    const q = forcedQuery || query;
    if (!q.trim()) return;
    executeApiCall('wizard', { problem: q }, setWizardResult);
  };

  const handleCompare = (e) => {
    if (e) e.preventDefault();
    if (!compareA1.trim() || !compareA2.trim()) return;
    executeApiCall('compare', { article1: compareA1, article2: compareA2 }, setCompareResult);
  };

  const handleEmergency = (situation) => {
    executeApiCall('emergency', { situation }, setEmergencyResult);
  };

  const handleRelatedArticleClick = async (articleName) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/ask`, { query: articleName, eli10 });
      if (!res.data.error) {
        setSelectedRelatedArticle({
          id: articleName,
          title: res.data.articleTitle,
          subtitle: res.data.articleNumber,
          content: {
            originalMeaning: res.data.originalMeaning,
            simplifiedMeaning: res.data.simplifiedMeaning,
            realLifeExample: res.data.realLifeExample,
            whyItMatters: res.data.whyItMatters,
            amendmentInfo: res.data.amendmentInfo
          },
          confidence: res.data.confidenceScore,
          source: res.data.source
        });
      }
    } catch (err) { setError(err.response?.data?.error || 'Error loading article.'); }
    finally { setLoading(false); }
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.text(data.articleTitle || data.question || "Report", 20, 20);
    doc.save(`LegalDost_Report.pdf`);
  };

  const downloadDOCX = async (data) => {
    const d = new Document({ sections: [{ children: [new Paragraph({ text: data.articleTitle || data.question, heading: HeadingLevel.HEADING_1 })] }] });
    saveAs(await Packer.toBlob(d), `LegalDost_Report.docx`);
  };

  const getSpeakableText = () => {
    if (result) return `${result.articleNumber}. ${result.simplifiedMeaning}`;
    if (assistantResult) return assistantResult.simpleAnswer;
    if (wizardResult) return wizardResult.problemSummary;
    if (emergencyResult) return `Emergency: ${emergencyResult.situation}`;
    return '';
  };

  // Switch tabs
  const changeTab = (id) => {
    setActiveTab(id);
    clearAll();
  };

  return (
    <>
      <div className="bg-glow-wrapper"></div>
      <div className="app-wrapper">
        
        {/* SIDEBAR */}
        <nav className="sidebar">
          <div className="brand-header">
            <div className="brand-icon-box">
              <Scale size={28} color="#FFF" />
            </div>
            <div className="brand-title">Legal Dost</div>
          </div>
          
          <div className="nav-menu">
            <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => changeTab('home')}>
              <Home size={20} /> Constitution Search
            </button>
            <button className={`nav-item ${activeTab === 'assistant' ? 'active' : ''}`} onClick={() => changeTab('assistant')}>
              <MessageSquareQuote size={20} /> AI Legal Assistant
            </button>
            <button className={`nav-item ${activeTab === 'wizard' ? 'active' : ''}`} onClick={() => changeTab('wizard')}>
              <Wand2 size={20} /> Find My Right
            </button>
            <button className={`nav-item ${activeTab === 'emergency' ? 'active' : ''}`} onClick={() => changeTab('emergency')}>
              <ShieldAlert size={20} color={activeTab === 'emergency' ? 'var(--danger-color)' : 'inherit'} /> Emergency Help
            </button>
            <button className={`nav-item ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => changeTab('compare')}>
              <GitCompare size={20} /> Compare Laws
            </button>
            <button className={`nav-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => changeTab('templates')}>
              <FileQuestion size={20} /> Legal Templates
            </button>
          </div>
          <div className="nav-menu" style={{ marginTop: 'auto', flex: 0 }}>
             <button className="nav-item" onClick={() => setShowRightCards(true)}>
              <BookOpen size={20} /> Know Your Rights
            </button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => changeTab('settings')}>
              <Settings size={20} /> Settings
            </button>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <div className="main-content">
          
          {/* TOPBAR */}
          <header className="topbar">
            <div className="location-selector">
              <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
                <option value="">India (Central)</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="top-actions">
              <button className={`icon-btn ${eli10 ? 'active' : ''}`} onClick={() => setEli10(!eli10)} title="ELI10: Very Simple Language">
                <Baby size={20} color={eli10 ? 'var(--primary-color)' : 'currentColor'} />
              </button>
              {(result || assistantResult || wizardResult || emergencyResult) && (
                <button className={`icon-btn`} onClick={() => speakText(getSpeakableText())}>
                  {isSpeaking ? <VolumeX size={20} color="var(--primary-color)" /> : <Volume2 size={20} />}
                </button>
              )}
              <button className="icon-btn" onClick={() => setShowCostEstimator(true)} title="Cost Estimator">
                <DollarSign size={20} />
              </button>
            </div>
          </header>

          <div className="page-container">
            
            <div style={{ display: 'flex', flexDirection: 'row', gap: '32px' }}>
              
              {/* LEFT PRIMARY AREA */}
              <div style={{ flex: 1 }}>
                
                {activeTab === 'home' && (
                  <div className="animate-fade-in">
                    <div className="hero-section">
                      <h1 className="hero-title">Decoding the Supreme Law</h1>
                      <p className="hero-subtitle">Search, synthesize, and rigorously understand every constitutional article with AI-powered precision.</p>
                      
                      <form onSubmit={(e) => handleSearch(e)} className="search-bar-wrapper">
                        <Search size={24} className="search-icon" />
                        <input 
                          type="text" 
                          className="search-input" 
                          placeholder="Ask about Article 14, property rights, or general laws..." 
                          value={query} 
                          onChange={handleInputChange} 
                        />
                        <button type="button" className={`voice-btn ${isListening ? 'listening' : ''}`} onClick={toggleVoice}>
                          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                        <button type="submit" className="search-submit-btn" disabled={loading}>
                          {loading ? 'Analyzing...' : 'Search'}
                        </button>
                      </form>
                      
                      {suggestions.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '800px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '16px', marginTop: '12px', zIndex: 10, padding: '12px' }}>
                          {suggestions.map((item, idx) => (
                            <div key={idx} className="recent-item-clean" onClick={() => { setQuery(`${item.article}: ${item.title}`); handleSearch(null, `${item.article}: ${item.title}`); }}>
                                <strong>{item.article}</strong> {item.title}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="search-chips">
                         <span className="chip" onClick={() => {setQuery("Fundamental Rights"); handleSearch(null, "Fundamental Rights")}}>Fundamental Rights</span>
                         <span className="chip" onClick={() => {setQuery("Freedom of Speech"); handleSearch(null, "Freedom of Speech")}}>Freedom of Speech</span>
                         <span className="chip" onClick={() => {setQuery("Article 21"); handleSearch(null, "Article 21")}}>Article 21</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'assistant' && (
                  <div className="animate-fade-in">
                    <div className="hero-section" style={{marginBottom: '32px'}}>
                      <h1 className="hero-title" style={{fontSize: '3.5rem'}}>AI Legal Assistant</h1>
                      <p className="hero-subtitle">Consult a top-tier intelligence on your daily legal situations.</p>
                      <form onSubmit={handleAssistant} className="search-bar-wrapper" style={{maxWidth: '100%'}}>
                        <Gavel size={24} className="search-icon" />
                        <input type="text" className="search-input" placeholder='e.g. "Can police check my phone?"' value={query} onChange={(e) => setQuery(e.target.value)} />
                        <button type="submit" className="search-submit-btn" disabled={loading}>Get Advice</button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loading && <div className="lux-loader"></div>}

                {/* Error Banner */}
                {error && (
                  <div className="glass-card animate-fade-in" style={{ borderColor: 'var(--danger-color)', marginBottom: '32px' }}>
                     <h4 style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle/> System Error</h4>
                     <p>{error}</p>
                  </div>
                )}

                {/* General Home/Constitution Result */}
                {result && !selectedRelatedArticle && (
                  <div className="glass-card ai-response-card">
                     <div className="ai-header">
                       <div className="ai-icon-box"><FileText size={28} /></div>
                       <div>
                         <h2 className="ai-title">{result.articleNumber}</h2>
                         <div style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginTop: '4px' }}>{result.articleTitle}</div>
                         <div className="ai-meta"><CheckCircle size={14} /> {result.source}</div>
                       </div>
                     </div>
                     
                     <div className="response-section">
                       <h4><MessageSquareQuote size={18}/> Simplified Meaning</h4>
                       <p className="response-text highlight">{result.simplifiedMeaning}</p>
                     </div>
                     <div className="response-section">
                       <h4><Scale size={18}/> Real-Life Example</h4>
                       <p className="response-text">{result.realLifeExample}</p>
                     </div>
                     <div className="response-section">
                       <h4><BookOpen size={18}/> Why It Matters</h4>
                       <p className="response-text">{result.whyItMatters}</p>
                     </div>
                     
                     {result.relatedArticles && result.relatedArticles.length > 0 && (
                       <div className="response-section">
                         <h4>Related Articles</h4>
                         <div className="search-chips" style={{ justifyContent: 'flex-start', marginTop: 0 }}>
                            {result.relatedArticles.map((a, i) => (
                              <button key={i} className="chip" onClick={() => handleRelatedArticleClick(a)}>{a}</button>
                            ))}
                         </div>
                       </div>
                     )}
                     
                     <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{flex: 1, height: '8px', background: 'var(--surface-base)', borderRadius: '4px', overflow: 'hidden'}}>
                           <div style={{width: `${result.confidenceScore}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))'}}></div>
                        </div>
                        <span style={{fontWeight: 600, color: 'var(--text-muted)'}}>{result.confidenceScore}% Confidence</span>
                     </div>
                  </div>
                )}

                {/* AI Assistant Result (Perplexity Style) */}
                {assistantResult && (
                  <div className="glass-card ai-response-card">
                     <div className="ai-header">
                       <div className="ai-icon-box"><MessageSquareQuote size={28} /></div>
                       <div>
                         <h2 className="ai-title" style={{fontSize: '1.75rem'}}>{assistantResult.question}</h2>
                         <div className="ai-meta"><CheckCircle size={14} /> AI Analysis</div>
                       </div>
                     </div>
                     
                     <div className="response-section">
                       <h4>Simplified Answer</h4>
                       <p className="response-text highlight" style={{fontSize: '1.5rem', lineHeight: '1.4'}}>{assistantResult.simpleAnswer}</p>
                     </div>
                     
                     <div className="response-section">
                       <h4>What the Law Says</h4>
                       <p className="response-text">{assistantResult.whatTheLawSays}</p>
                     </div>

                     <div className="response-section">
                       <h4>🛡️ Your Rights</h4>
                       <div className="rights-grid">
                          {assistantResult.userRights.map((r, i) => (
                            <div key={i} className="right-item">
                               <CheckSquare size={20} className="right-icon" />
                               <span>{r}</span>
                            </div>
                          ))}
                       </div>
                     </div>

                     <div className="response-section">
                       <h4>✅ What To Do Next</h4>
                       <ol className="steps-list">
                          {assistantResult.whatToDoNext.map((s, i) => <li key={i}>{s}</li>)}
                       </ol>
                     </div>

                     <div className="card-actions">
                        <button className="action-btn"><Bookmark size={18}/> Save</button>
                        <button className="action-btn" onClick={() => downloadPDF(assistantResult)}><Download size={18}/> Export PDF</button>
                        <button className="action-btn"><Share2 size={18}/> Share</button>
                     </div>
                  </div>
                )}
                {/* Wizard Tab */}
                {activeTab === 'wizard' && !wizardResult && (
                  <div className="animate-fade-in">
                     <h1 className="hero-title" style={{fontSize: '3.5rem'}}>Find My Right</h1>
                     <p className="hero-subtitle">Describe your situation, and Legal Dost will find the exact legal rights protecting you.</p>
                     
                     <form onSubmit={handleWizard} className="search-bar-wrapper" style={{maxWidth: '100%', marginBottom: '48px'}}>
                        <Wand2 size={24} className="search-icon" />
                        <input type="text" className="search-input" placeholder='e.g. "My boss fired me without any warning or severance."' value={query} onChange={(e) => setQuery(e.target.value)} />
                        <button type="submit" className="search-submit-btn" disabled={loading}>Identify Rights</button>
                     </form>

                     <h3 style={{fontFamily: 'var(--font-heading)', fontSize: '1.75rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px'}}><BookOpen size={24} color="var(--primary-color)"/> Basic Legal Knowledge in India</h3>
                     <div className="emergency-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'}}>
                        <div className="glass-card" style={{padding: '24px'}}>
                           <h4 style={{color: 'var(--primary-color)', marginBottom: '8px', fontSize: '1.1rem'}}>Right to Information (RTI)</h4>
                           <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5'}}>Every citizen can request information from public authorities. They are obligated to reply within 30 days.</p>
                        </div>
                        <div className="glass-card" style={{padding: '24px'}}>
                           <h4 style={{color: 'var(--primary-color)', marginBottom: '8px', fontSize: '1.1rem'}}>Consumer Protection</h4>
                           <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5'}}>You have the right to be protected against unfair trade practices and demand refunds for defective products.</p>
                        </div>
                        <div className="glass-card" style={{padding: '24px'}}>
                           <h4 style={{color: 'var(--primary-color)', marginBottom: '8px', fontSize: '1.1rem'}}>Right against Exploitation</h4>
                           <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5'}}>Constitutional protection against human trafficking, forced labor, and child labor under Article 23 & 24.</p>
                        </div>
                        <div className="glass-card" style={{padding: '24px'}}>
                           <h4 style={{color: 'var(--primary-color)', marginBottom: '8px', fontSize: '1.1rem'}}>Free Legal Aid</h4>
                           <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5'}}>Under Article 39A, the state must provide free legal aid to ensure justice is not denied to any citizen due to economic disability.</p>
                        </div>
                     </div>
                  </div>
                )}
                
                {wizardResult && (
                  <div className="glass-card ai-response-card">
                     <div className="ai-header">
                       <div className="ai-icon-box"><Wand2 size={28} /></div>
                       <div>
                         <h2 className="ai-title" style={{fontSize: '1.75rem'}}>Rights Analysis</h2>
                         <div className="ai-meta"><CheckCircle size={14} /> Custom Assessment</div>
                       </div>
                     </div>
                     
                     <div className="response-section">
                       <h4>Situation Summary</h4>
                       <p className="response-text highlight">{wizardResult.problemSummary}</p>
                     </div>
                     
                     <div className="response-section">
                       <h4>🛡️ Applicable Rights</h4>
                       <div className="rights-grid">
                          {wizardResult.applicableRights.map((r, i) => (
                            <div key={i} className="right-item">
                               <CheckSquare size={20} className="right-icon" />
                               <span>{r}</span>
                            </div>
                          ))}
                       </div>
                     </div>

                     <div className="response-section">
                       <h4>✅ Recommended Actions</h4>
                       <ol className="steps-list">
                          {wizardResult.recommendedActions.map((s, i) => <li key={i}>{s}</li>)}
                       </ol>
                     </div>
                     
                     <div className="card-actions">
                        <button className="action-btn"><Bookmark size={18}/> Save Analysis</button>
                        <button className="action-btn" onClick={() => downloadPDF(wizardResult)}><Download size={18}/> Export PDF</button>
                     </div>
                  </div>
                )}
                
                {/* Emergency Tab */}
                {activeTab === 'emergency' && !emergencyResult && (
                  <div className="animate-fade-in">
                     <h1 className="hero-title" style={{fontSize: '3rem', color: '#FFF', background: 'none', webkitTextFillColor: '#FFF', textShadow: 'none', marginBottom: '40px'}}>🚨 Emergency Rights</h1>
                     <div className="emergency-grid">
                       {EMERGENCY_SCENARIOS.map((s, idx) => (
                         <div key={idx} className={`emergency-card ${s.color}`} onClick={() => handleEmergency(s.query)}>
                            <div className="emergency-icon">{s.icon}</div>
                            <div className="emergency-title">{s.label}</div>
                            <div className="emergency-subtitle">Immediate actionable legal rights for this situation.</div>
                            <div className="emergency-cta">Get Help <ArrowRight size={16}/></div>
                         </div>
                       ))}
                     </div>
                  </div>
                )}
                
                {emergencyResult && (
                  <div className="glass-card ai-response-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                     <div className="ai-header">
                       <div className="ai-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.2)' }}><ShieldAlert size={28} /></div>
                       <div>
                         <h2 className="ai-title" style={{fontSize: '2rem'}}>{emergencyResult.situation}</h2>
                         <div className="ai-meta" style={{color: 'var(--danger-color)', background: 'rgba(239, 68, 68, 0.1)'}}>Immediate Action Required</div>
                       </div>
                     </div>
                     <div className="response-section">
                       <h4 style={{color: 'var(--success-color)'}}>🛡️ Your Rights</h4>
                       <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         {emergencyResult.yourRights.map((r, i) => <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '1.1rem' }}><CheckCircle color="var(--success-color)" size={20}/> {r}</li>)}
                       </ul>
                     </div>
                     <div className="response-section">
                       <h4 style={{color: 'var(--primary-color)'}}>✅ Do This Immediately</h4>
                       <ol className="steps-list">
                         {emergencyResult.immediateSteps.map((s, i) => <li key={i}>{s}</li>)}
                       </ol>
                     </div>
                     <div className="response-section">
                       <h4 style={{color: 'var(--danger-color)'}}>🚫 Do NOT Do This</h4>
                       <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         {emergencyResult.doNot.map((d, i) => <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '1.1rem' }}><X color="var(--danger-color)" size={20}/> {d}</li>)}
                       </ul>
                     </div>
                     <div className="response-section">
                        <h4>📞 Helplines</h4>
                        <div className="rights-grid">
                           {emergencyResult.helplineNumbers.map((h, i) => (
                             <div key={i} className="right-item" style={{alignItems: 'center'}}>
                                <Phone size={24} color="var(--danger-color)" />
                                <div><div style={{fontWeight: 'bold', fontSize:'1.1rem'}}>{h.number}</div><div style={{fontSize:'0.85rem', color: 'var(--text-muted)'}}>{h.name}</div></div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}
                
                {/* Compare Tab */}
                {activeTab === 'compare' && (
                   <div className="animate-fade-in">
                      <h1 className="hero-title" style={{fontSize: '3rem'}}>Compare Laws</h1>
                      <div className="search-bar-wrapper" style={{maxWidth: '100%', marginBottom: '48px', background: 'transparent', boxShadow: 'none', border: 'none'}}>
                         <form onSubmit={handleCompare} style={{display: 'flex', gap: '24px', width: '100%', alignItems: 'center'}}>
                            <input type="text" className="search-input" style={{background: 'var(--surface-base)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--surface-border)'}} placeholder="e.g. Article 14" value={compareA1} onChange={(e) => setCompareA1(e.target.value)} />
                            <div className="vs-badge" style={{flexShrink: 0}}>VS</div>
                            <input type="text" className="search-input" style={{background: 'var(--surface-base)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--surface-border)'}} placeholder="e.g. Article 15" value={compareA2} onChange={(e) => setCompareA2(e.target.value)} />
                            <button type="submit" className="search-submit-btn" disabled={loading}>Compare</button>
                         </form>
                      </div>
                      
                      {compareResult && (
                         <div className="compare-container">
                            <div className="compare-pane">
                               <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '16px', color: 'var(--primary-color)'}}>{compareResult.article1.articleNumber}</h2>
                               <p className="response-text" style={{marginBottom: '16px'}}><strong>{compareResult.article1.articleTitle}</strong></p>
                               <p>{compareResult.article1.summary}</p>
                            </div>
                            <div className="vs-badge" style={{alignSelf: 'stretch', height: '100%', width: '4px', borderRadius: 0, padding: 0, textIndent: '-9999px'}}>|</div>
                            <div className="compare-pane">
                               <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '16px', color: 'var(--secondary-color)'}}>{compareResult.article2.articleNumber}</h2>
                               <p className="response-text" style={{marginBottom: '16px'}}><strong>{compareResult.article2.articleTitle}</strong></p>
                               <p>{compareResult.article2.summary}</p>
                            </div>
                         </div>
                      )}
                   </div>
                )}
                
                {/* Templates Tab */}
                {activeTab === 'templates' && (
                  <div className="animate-fade-in">
                     <h1 className="hero-title" style={{fontSize: '3rem'}}>Legal Templates</h1>
                     <div className="emergency-grid" style={{marginTop: '40px'}}>
                        {FORMS_TEMPLATES.map(form => (
                           <div key={form.id} className="glass-card" style={{cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px'}} onClick={() => setActiveForm(form)}>
                              <FileText size={32} color="var(--accent-gold)" />
                              <h3 style={{fontSize: '1.25rem', color: '#FFF'}}>{form.title}</h3>
                              <p style={{color: 'var(--text-muted)'}}>{form.description}</p>
                              <div style={{marginTop: 'auto', color: 'var(--primary-color)', fontWeight: 600}}>Preview & Download &rarr;</div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
                
                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <SettingsView />
                )}
                
              </div>
              
              {/* RIGHT META AREA */}
              {(activeTab === 'home' || activeTab === 'assistant') && (
                <div className="right-panel">
                  {recentQuestions.length > 0 && (
                    <div className="panel-card mb-4" style={{marginBottom: '24px'}}>
                       <h3 className="panel-title"><Clock size={20} /> Recent Queries</h3>
                       <div style={{marginTop: '16px'}}>
                         {recentQuestions.slice(0, 5).map((q, i) => (
                            <div key={i} className="recent-item-clean" onClick={() => { setQuery(q); (activeTab==='home'?handleSearch:handleAssistant)(null, q); }}>
                               <MessageSquareQuote size={16} /> <span style={{lineHeight: '1.4'}}>{q}</span>
                            </div>
                         ))}
                       </div>
                       <button onClick={clearRecentQuestions} style={{background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}><Trash2 size={16} /> Clear All</button>
                    </div>
                  )}

                  {(result || assistantResult) && (
                     <div className="panel-card">
                       <h3 className="panel-title"><Wand2 size={20} /> Suggested Follow-Ups</h3>
                       <div style={{marginTop: '16px'}}>
                          {FOLLOW_UP_SUGGESTIONS.map((suggestion, i) => (
                             <div key={i} className="recent-item-clean" onClick={() => { setQuery(suggestion); (activeTab==='home'?handleSearch:handleAssistant)(null, suggestion); }}>
                                {suggestion}
                             </div>
                          ))}
                       </div>
                     </div>
                  )}
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showRightCards && (
         <div className="premium-modal-overlay" onClick={() => setShowRightCards(false)}>
            <div className="premium-modal" onClick={e => e.stopPropagation()}>
               <button className="modal-close" onClick={() => setShowRightCards(false)}><X size={24}/></button>
               <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '32px'}}>Know Your Rights</h2>
               <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                  {RIGHTS_CARDS.map((card, i) => (
                     <div key={i} style={{borderBottom: '1px solid var(--surface-border)', paddingBottom: '24px'}}>
                        <h4 style={{color: 'var(--primary-color)', marginBottom: '8px', fontSize: '1.1rem'}}>{card.title}</h4>
                        <p style={{color: 'var(--text-muted)', lineHeight: '1.5'}}>{card.content}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}
      
      {showCostEstimator && (
         <div className="premium-modal-overlay" onClick={() => setShowCostEstimator(false)}>
            <div className="premium-modal" onClick={e => e.stopPropagation()}>
               <button className="modal-close" onClick={() => setShowCostEstimator(false)}><X size={24}/></button>
               <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '32px'}}><DollarSign size={28} style={{verticalAlign: 'middle', marginRight: '8px'}}/> Legal Cost Estimator</h2>
               <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Lawyer Consultation</span><strong>₹500 - ₹5,000</strong></div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Court Filing Fee</span><strong>₹100 - ₹5,000</strong></div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Notary Fee</span><strong>₹50 - ₹500</strong></div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Legal Notice Draft</span><strong>₹200 - ₹1,000</strong></div>
               </div>
               <p style={{marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.85rem'}}>* These are approximate estimates. Actual costs vary by location and case complexity.</p>
            </div>
         </div>
      )}
      
      {activeForm && (
         <div className="premium-modal-overlay" onClick={() => setActiveForm(null)}>
            <div className="premium-modal" onClick={e => e.stopPropagation()}>
               <button className="modal-close" onClick={() => setActiveForm(null)}><X size={24}/></button>
               <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '16px'}}><FileText size={28} style={{verticalAlign: 'middle', marginRight: '8px'}}/> {activeForm.title}</h2>
               <p style={{color: 'var(--text-muted)', marginBottom: '32px'}}>{activeForm.description}</p>
               
               <div style={{background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--surface-border)', marginBottom: '32px', fontFamily: 'monospace'}}>
                  To: [Name]<br/>
                  From: [Your Name]<br/>
                  Date: {new Date().toLocaleDateString()}<br/><br/>
                  Subject: {activeForm.title}<br/><br/>
                  [Details of exactly what occurred, where, and when...]
               </div>
               
               <button className="search-submit-btn" style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}} onClick={() => {
                  const doc = new jsPDF();
                  doc.setFontSize(18); doc.text(activeForm.title, 20, 20);
                  doc.save(`${activeForm.title.replace(/\s+/g, '_')}.pdf`);
               }}>
                  <Download size={20} /> Download Template
               </button>
            </div>
         </div>
      )}
      
    </>
  );
}

export default App;
