import React, { useState } from 'react';
import { User, Monitor, Globe, Bell, BrainCircuit, Bookmark, Scale, Accessibility, HelpCircle, Save, CheckCircle } from 'lucide-react';
import './index.css';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Tamil', 'Marathi', 'Punjabi', 'Odia', 'Bhojpuri'];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showToast, setShowToast] = useState(false);

  const [settings, setSettings] = useState({
     // Profile
     fullName: "Arjun Kumar", email: "arjun.k@example.com", phone: "+91 9876543210", 
     city: "Mumbai", state: "Maharashtra", language: "English",
     // Appearance
     darkMode: true, compactMode: false, fontSize: "Medium", cardStyle: "Glass", sidebarCollapsed: false,
     // Notifications
     pushNotifications: true, dailyTips: false, emergencyAlerts: true, legalNews: false, caseReminders: true, 
     savedReminders: false, emailNotification: true, whatsappNotification: false,
     // AI
     aiStyle: "Simple language", eli10: false, voiceAnswers: true, followUpSuggestions: true, 
     confidenceMeter: true, legalCitations: true, emergencyPriority: true,
     // Legal
     lawyerType: "Criminal Lawyer", courtType: "High Court",
     // Accessibility
     highContrast: false, screenReader: false, voiceNav: false, reducedMotion: false, dyslexiaFont: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Fake save
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const SECTIONS = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Preferences', icon: BrainCircuit },
    { id: 'saved', label: 'Saved Content', icon: Bookmark },
    { id: 'legal', label: 'Legal Preferences', icon: Scale },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'support', label: 'Support & Help', icon: HelpCircle },
  ];

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div className="profile-summary-card">
         <div className="profile-avatar">AK</div>
         <div>
            <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '2.5rem', margin: 0, color: '#FFF'}}>{settings.fullName}</h2>
            <div style={{color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '4px'}}>{settings.email} • {settings.state}, India</div>
         </div>
      </div>

      <div className="settings-layout">
         
         <div className="settings-sidebar">
            {SECTIONS.map(s => {
               const Icon = s.icon;
               return (
                 <div key={s.id} className={`settings-sidebar-item ${activeTab === s.id ? 'active' : ''}`} onClick={() => setActiveTab(s.id)}>
                   <Icon size={18} /> {s.label}
                 </div>
               )
            })}
         </div>

         <div className="settings-content">
            
            {activeTab === 'profile' && (
              <div className="settings-card">
                 <div className="settings-card-header">
                    <User size={24} color="var(--primary-color)"/>
                    <h3 className="settings-card-title">Profile Settings</h3>
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">Full Name</span></div>
                    <input className="settings-input" value={settings.fullName} onChange={e => handleChange('fullName', e.target.value)} />
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">Email Address</span></div>
                    <input className="settings-input" value={settings.email} onChange={e => handleChange('email', e.target.value)} />
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">Mobile Number</span></div>
                    <input className="settings-input" value={settings.phone} onChange={e => handleChange('phone', e.target.value)} />
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">City</span></div>
                    <input className="settings-input" value={settings.city} onChange={e => handleChange('city', e.target.value)} />
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">State</span></div>
                    <select className="settings-input" value={settings.state} onChange={e => handleChange('state', e.target.value)}>
                       {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-card">
                 <div className="settings-card-header">
                    <Monitor size={24} color="var(--primary-color)"/>
                    <h3 className="settings-card-title">Appearance</h3>
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group">
                       <span className="settings-label">Dark Mode</span>
                       <span className="settings-sublabel">Experience the premium dark navy theme</span>
                    </div>
                    <label className="switch">
                       <input type="checkbox" checked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
                       <span className="slider"></span>
                    </label>
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">Font Size</span></div>
                    <select className="settings-input" value={settings.fontSize} onChange={e => handleChange('fontSize', e.target.value)}>
                       <option>Small</option><option>Medium</option><option>Large</option><option>Extra Large</option>
                    </select>
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">Card Style</span></div>
                    <select className="settings-input" value={settings.cardStyle} onChange={e => handleChange('cardStyle', e.target.value)}>
                       <option>Glassmorphism</option><option>Solid Flat</option><option>Minimalist</option>
                    </select>
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">Compact Mode</span></div>
                    <label className="switch"><input type="checkbox" checked={settings.compactMode} onChange={() => handleToggle('compactMode')} /><span className="slider"></span></label>
                 </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="settings-card">
                 <div className="settings-card-header">
                    <Globe size={24} color="var(--primary-color)"/>
                    <h3 className="settings-card-title">Language & Region</h3>
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group">
                       <span className="settings-label">Preferred App Language</span>
                       <span className="settings-sublabel">Select regional language for UI and AI responses</span>
                    </div>
                    <select className="settings-input" value={settings.language} onChange={e => handleChange('language', e.target.value)}>
                       {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                 </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-card">
                 <div className="settings-card-header">
                    <Bell size={24} color="var(--primary-color)"/>
                    <h3 className="settings-card-title">Notifications</h3>
                 </div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">Push Notifications</span></div><label className="switch"><input type="checkbox" checked={settings.pushNotifications} onChange={() => handleToggle('pushNotifications')} /><span className="slider"></span></label></div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">Emergency Alerts</span></div><label className="switch"><input type="checkbox" checked={settings.emergencyAlerts} onChange={() => handleToggle('emergencyAlerts')} /><span className="slider"></span></label></div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">Daily Legal Tips</span></div><label className="switch"><input type="checkbox" checked={settings.dailyTips} onChange={() => handleToggle('dailyTips')} /><span className="slider"></span></label></div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">Email Notifications</span></div><label className="switch"><input type="checkbox" checked={settings.emailNotification} onChange={() => handleToggle('emailNotification')} /><span className="slider"></span></label></div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">WhatsApp Updates</span></div><label className="switch"><input type="checkbox" checked={settings.whatsappNotification} onChange={() => handleToggle('whatsappNotification')} /><span className="slider"></span></label></div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="settings-card">
                 <div className="settings-card-header">
                    <BrainCircuit size={24} color="var(--primary-color)"/>
                    <h3 className="settings-card-title">AI Preferences</h3>
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">AI Response Style</span></div>
                    <select className="settings-input" value={settings.aiStyle} onChange={e => handleChange('aiStyle', e.target.value)}>
                       <option>Simple language</option><option>Detailed explanation</option><option>Lawyer-like explanation</option><option>Short answer mode</option>
                    </select>
                 </div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">"Explain Like I'm 10" Mode</span></div><label className="switch"><input type="checkbox" checked={settings.eli10} onChange={() => handleToggle('eli10')} /><span className="slider"></span></label></div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">Voice Answers (Read Aloud)</span></div><label className="switch"><input type="checkbox" checked={settings.voiceAnswers} onChange={() => handleToggle('voiceAnswers')} /><span className="slider"></span></label></div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">Confidence Meter</span></div><label className="switch"><input type="checkbox" checked={settings.confidenceMeter} onChange={() => handleToggle('confidenceMeter')} /><span className="slider"></span></label></div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">Prioritize Emergency Scenarios</span></div><label className="switch"><input type="checkbox" checked={settings.emergencyPriority} onChange={() => handleToggle('emergencyPriority')} /><span className="slider"></span></label></div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="settings-card">
                 <div className="settings-card-header">
                    <Bookmark size={24} color="var(--primary-color)"/>
                    <h3 className="settings-card-title">Saved Content</h3>
                 </div>
                 <div className="settings-row"><span className="settings-label">Saved Questions (12)</span><button className="search-submit-btn" style={{padding: '8px 16px'}}>View</button></div>
                 <div className="settings-row"><span className="settings-label">Saved Templates (4)</span><button className="search-submit-btn" style={{padding: '8px 16px'}}>View</button></div>
                 <div className="settings-row"><span className="settings-label">Saved Rights Cards (2)</span><button className="search-submit-btn" style={{padding: '8px 16px'}}>View</button></div>
              </div>
            )}

            {activeTab === 'legal' && (
              <div className="settings-card">
                 <div className="settings-card-header">
                    <Scale size={24} color="var(--primary-color)"/>
                    <h3 className="settings-card-title">Legal Preferences</h3>
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">Preferred Lawyer Type</span></div>
                    <select className="settings-input" value={settings.lawyerType} onChange={e => handleChange('lawyerType', e.target.value)}>
                       <option>Criminal Lawyer</option><option>Civil Lawyer</option><option>Corporate Lawyer</option><option>Family Lawyer</option><option>Any</option>
                    </select>
                 </div>
                 <div className="settings-row">
                    <div className="settings-label-group"><span className="settings-label">Preferred Court Type</span></div>
                    <select className="settings-input" value={settings.courtType} onChange={e => handleChange('courtType', e.target.value)}>
                       <option>Supreme Court</option><option>High Court</option><option>District Court</option>
                    </select>
                 </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="settings-card">
                 <div className="settings-card-header">
                    <Accessibility size={24} color="var(--primary-color)"/>
                    <h3 className="settings-card-title">Accessibility</h3>
                 </div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">High Contrast Mode</span></div><label className="switch"><input type="checkbox" checked={settings.highContrast} onChange={() => handleToggle('highContrast')} /><span className="slider"></span></label></div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">Screen Reader Support</span></div><label className="switch"><input type="checkbox" checked={settings.screenReader} onChange={() => handleToggle('screenReader')} /><span className="slider"></span></label></div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">Dyslexia-Friendly Font</span></div><label className="switch"><input type="checkbox" checked={settings.dyslexiaFont} onChange={() => handleToggle('dyslexiaFont')} /><span className="slider"></span></label></div>
                 <div className="settings-row"><div className="settings-label-group"><span className="settings-label">Reduced Motion</span></div><label className="switch"><input type="checkbox" checked={settings.reducedMotion} onChange={() => handleToggle('reducedMotion')} /><span className="slider"></span></label></div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="settings-card">
                 <div className="settings-card-header">
                    <HelpCircle size={24} color="var(--primary-color)"/>
                    <h3 className="settings-card-title">Support & Help</h3>
                 </div>
                 <div className="settings-row" style={{cursor: 'pointer'}}><span className="settings-label">FAQ Section</span><span style={{color: 'var(--primary-color)'}}>Read &rarr;</span></div>
                 <div className="settings-row" style={{cursor: 'pointer'}}><span className="settings-label">Contact Support</span><span style={{color: 'var(--primary-color)'}}>Message &rarr;</span></div>
                 <div className="settings-row" style={{cursor: 'pointer'}}><span className="settings-label">Report a Bug</span><span style={{color: 'var(--primary-color)'}}>Report &rarr;</span></div>
                 <div className="settings-row" style={{cursor: 'pointer'}}><span className="settings-label">Privacy Policy</span><span style={{color: 'var(--primary-color)'}}>View &rarr;</span></div>
              </div>
            )}

            <div className="settings-save-bar">
               <button className="search-submit-btn" style={{display: 'flex', alignItems:'center', gap: '8px'}} onClick={handleSave}>
                  <Save size={20} /> Save Changes
               </button>
            </div>
         </div>
         
      </div>

      <div className={`toast-success ${showToast ? 'show' : ''}`}>
         <CheckCircle size={24} /> Settings Successfully Saved!
      </div>
    </div>
  );
}
