import React, { useState, useEffect } from 'react';
import { 
  FileDown, 
  User
} from 'lucide-react';
import { translations, type Language } from '../i18n';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenReportModal: () => void;
  latencyMs: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  onOpenReportModal
}) => {
  const [timeStr, setTimeStr] = useState<string>('18:42:17');
  const [dateStr, setDateStr] = useState<string>('15 May 2025');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-GB', { hour12: false }));
      setDateStr(now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const t = translations[lang];

  return (
    <header style={{
      height: '62px',
      backgroundColor: '#06283D',
      background: 'linear-gradient(90deg, #051F30 0%, #0A3750 40%, #08405E 75%, #06283D 100%)',
      borderBottom: '1px solid rgba(0, 194, 215, 0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      color: '#F8FAFC',
      position: 'relative',
      zIndex: 50,
      boxShadow: '0 3px 12px rgba(6, 40, 61, 0.25)'
    }}>
      {/* Top subtle tricolor accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #159A72 100%)',
        opacity: 0.95
      }} />

      {/* Left Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Eye/Chakra Sonar Logo */}
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0077B6 0%, #00C2D7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 14px rgba(0, 194, 215, 0.45)',
          border: '1.5px solid rgba(255, 255, 255, 0.6)'
        }}>
          {/* Custom Stylized Marine Eye Icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M2 12C3.8 7.5 7.5 4 12 4C16.5 4 20.2 7.5 22 12C20.2 16.5 16.5 20 12 20C7.5 20 3.8 16.5 2 12Z" stroke="#FFFFFF" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="4.5" fill="#06283D" stroke="#00C2D7" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
            <path d="M12 2C17.5 2 22 6.5 22 12" stroke="#FF9933" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Title & Devanagari */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              fontWeight: 900,
              fontSize: '17px',
              letterSpacing: '1.5px',
              color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              SAGARDRISHTI
            </span>
          </div>
          <div className="font-hindi" style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#00C2D7',
            letterSpacing: '0.8px',
            marginTop: '-2px'
          }}>
            सागरदृष्टि
          </div>
        </div>

        {/* Vertical Divider */}
        <div style={{
          height: '28px',
          width: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          margin: '0 6px'
        }} />

        {/* Subtitle & Hindi Tagline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#E2F1F8', letterSpacing: '0.2px' }}>
            AI-Powered Marine Intelligence for India
          </span>
          <span className="font-hindi" style={{ fontSize: '10px', color: '#8AC1D9', marginTop: '-1px' }}>
            भारत के समुद्रों के लिए AI आधारित समुद्री बुद्धिमत्ता
          </span>
        </div>
      </div>

      {/* Right Telemetry Gauges, Language Switch, Clock, and Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* System Online Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#159A72', boxShadow: '0 0 6px #159A72' }} />
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#FFFFFF' }}>System Online</span>
          </div>
          <span className="font-hindi" style={{ fontSize: '9px', color: '#159A72', paddingLeft: '11px', marginTop: '-2px' }}>
            प्रणाली सक्रिय
          </span>
        </div>

        {/* Sonar Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00A8CC', boxShadow: '0 0 6px #00A8CC' }} />
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#FFFFFF' }}>Sonar</span>
          </div>
          <span className="font-hindi" style={{ fontSize: '9px', color: '#8AC1D9', paddingLeft: '11px', marginTop: '-2px' }}>
            सोनार
          </span>
        </div>

        {/* AI Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00C2D7', boxShadow: '0 0 6px #00C2D7' }} />
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#FFFFFF' }}>AI</span>
          </div>
          <span className="font-hindi" style={{ fontSize: '9px', color: '#8AC1D9', paddingLeft: '11px', marginTop: '-2px' }}>
            AI
          </span>
        </div>

        {/* GPS Status */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0077B6', boxShadow: '0 0 6px #0077B6' }} />
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#FFFFFF' }}>GPS</span>
          </div>
          <span className="font-hindi" style={{ fontSize: '9px', color: '#8AC1D9', paddingLeft: '11px', marginTop: '-2px' }}>
            GPS
          </span>
        </div>

        {/* Language Toggle Button: EN | हिंदी */}
        <button
          onClick={onToggleLang}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(0, 194, 215, 0.35)',
            borderRadius: '16px',
            padding: '3px 10px',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            backdropFilter: 'blur(4px)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 194, 215, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
          title="Toggle Language / भाषा बदलें"
        >
          <span style={{ color: lang === 'en' ? '#00C2D7' : '#94A3B8' }}>EN</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
          <span className="font-hindi" style={{ color: lang === 'hi' ? '#FF9933' : '#94A3B8' }}>हिंदी</span>
        </button>

        {/* Digital Clock & Date */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '70px' }}>
          <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.5px' }}>
            {timeStr}
          </span>
          <span style={{ fontSize: '9.5px', color: '#8AC1D9', marginTop: '-2px' }}>
            {dateStr}
          </span>
        </div>

        {/* Export Dossier Button */}
        <button
          onClick={onOpenReportModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#0077B6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0, 119, 182, 0.4)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#02659B'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0077B6'}
        >
          <FileDown size={13} />
          <span>{t.exportDossier}</span>
        </button>

        {/* User Profile Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E2E8F0',
          cursor: 'pointer'
        }}
        title="Maritime Operator Profile"
        >
          <User size={16} />
        </div>
      </div>
    </header>
  );
};
