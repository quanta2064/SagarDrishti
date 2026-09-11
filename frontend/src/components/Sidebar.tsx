import React from 'react';
import { 
  Home, 
  Map as MapIcon, 
  Radar, 
  Fish, 
  AlertTriangle, 
  Sliders, 
  FileText
} from 'lucide-react';
import { translations, type Language } from '../i18n';

interface SidebarProps {
  activeTab: 'overview' | 'map' | 'vision' | 'ecosystems' | 'audit' | 'control' | 'reports';
  setActiveTab: (tab: 'overview' | 'map' | 'vision' | 'ecosystems' | 'audit' | 'control' | 'reports') => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lang
}) => {
  const t = translations[lang];

  const navItems = [
    { id: 'overview', label: t.overview, hindi: 'अवलोकन', icon: Home },
    { id: 'map', label: t.oceanMap, hindi: 'भारत महासागर मानचित्र', icon: MapIcon },
    { id: 'vision', label: t.sonarIntelligence, hindi: 'सोनार बुद्धिमत्ता', icon: Radar },
    { id: 'ecosystems', label: t.marineEcosystems, hindi: 'समुद्री पारिस्थितिकी', icon: Fish },
    { id: 'audit', label: t.hazardAudit, hindi: 'खतरा ऑडिट', icon: AlertTriangle },
    { id: 'control', label: t.missionControl, hindi: 'मिशन नियंत्रण', icon: Sliders },
    { id: 'reports', label: t.reports, hindi: 'रिपोर्ट', icon: FileText }
  ] as const;

  return (
    <aside style={{
      width: '215px',
      backgroundColor: '#06283D',
      background: 'linear-gradient(180deg, #06283D 0%, #083752 60%, #051F30 100%)',
      borderRight: '1px solid rgba(0, 194, 215, 0.18)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: 'calc(100vh - 62px)',
      color: '#F8FAFC',
      zIndex: 40,
      flexShrink: 0
    }}>
      {/* Navigation Links */}
      <div style={{ padding: '16px 12px' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '11px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#0077B6' : 'transparent',
                  background: isActive ? 'linear-gradient(90deg, #0077B6 0%, #0096C7 100%)' : 'transparent',
                  boxShadow: isActive ? '0 2px 10px rgba(0, 119, 182, 0.45)' : 'none',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  color: isActive ? '#FFFFFF' : '#8AC1D9',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Icon size={17} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : '#E2F1F8',
                    letterSpacing: '0.2px'
                  }}>
                    {item.label}
                  </span>
                  <span className="font-hindi" style={{
                    fontSize: '9.5px',
                    color: isActive ? '#BAE6FD' : '#6BA7C1',
                    marginTop: '-2px'
                  }}>
                    {item.hindi}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Ocean Intelligence Branding Card */}
      <div style={{
        padding: '14px 14px 18px 14px',
        borderTop: '1px solid rgba(0, 194, 215, 0.15)',
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(6, 40, 61, 0) 0%, rgba(4, 24, 38, 0.8) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0077B6 0%, #00C2D7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(0, 194, 215, 0.4)'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M2 12C3.8 7.5 7.5 4 12 4C16.5 4 20.2 7.5 22 12C20.2 16.5 16.5 20 12 20C7.5 20 3.8 16.5 2 12Z" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" fill="#06283D" stroke="#00C2D7" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.3px' }}>
              India Ocean Intelligence
            </div>
          </div>
        </div>

        <div className="font-hindi" style={{
          fontSize: '9px',
          color: '#8AC1D9',
          lineHeight: '1.3',
          paddingLeft: '38px',
          marginBottom: '10px'
        }}>
          भारत की समुद्री सुरक्षा, समृद्धि और सतत भविष्य
        </div>

        {/* Indian Tricolor subtle decorative wave accent */}
        <div style={{
          height: '2.5px',
          borderRadius: '2px',
          background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #159A72 100%)',
          width: '100%',
          opacity: 0.85
        }} />
      </div>
    </aside>
  );
};
