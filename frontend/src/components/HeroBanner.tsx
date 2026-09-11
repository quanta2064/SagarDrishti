import React from 'react';
import { 
  Compass, 
  Radar, 
  Navigation
} from 'lucide-react';
import { translations, type Language } from '../i18n';

interface HeroBannerProps {
  lang: Language;
  onExploreOceans: () => void;
  onStartSonar: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  lang,
  onExploreOceans,
  onStartSonar
}) => {
  const t = translations[lang];

  return (
    <div style={{
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#06283D',
      background: 'linear-gradient(135deg, #051C2C 0%, #0A324A 45%, #0B4262 100%)',
      border: '1px solid rgba(0, 194, 215, 0.3)',
      boxShadow: '0 4px 20px rgba(6, 40, 61, 0.12)',
      display: 'flex',
      alignItems: 'stretch',
      minHeight: '230px'
    }}>
      {/* Subtle bathymetric wave overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.12,
        backgroundImage: 'radial-gradient(circle at 75% 50%, #00C2D7 0%, transparent 60%)',
        zIndex: 1
      }} />

      {/* Left Content Column */}
      <div style={{
        flex: 1.1,
        padding: '22px 28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 10
      }}>
        {/* Title & Devanagari */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '2px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 900,
            letterSpacing: '1.2px',
            color: '#FFFFFF',
            margin: 0
          }}>
            SAGARDRISHTI
          </h1>
          <span className="font-hindi" style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#FFFFFF'
          }}>
            सागरदृष्टि
          </span>
        </div>

        {/* Subtitles */}
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#00C2D7', letterSpacing: '0.4px', marginBottom: '1px' }}>
          AI-Powered Marine Intelligence for India
        </div>
        <div className="font-hindi" style={{ fontSize: '11px', color: '#BAE6FD', marginBottom: '12px' }}>
          भारत के समुद्रों के लिए AI आधारित समुद्री बुद्धिमत्ता
        </div>

        {/* Taglines */}
        <div style={{ fontSize: '11.5px', color: '#E2F1F8', lineHeight: '1.45', marginBottom: '2px' }}>
          Seeing beneath India's waters.
          <br />
          Protecting what lies beneath.
        </div>
        <div className="font-hindi" style={{ fontSize: '11px', color: '#94CBDD', lineHeight: '1.4', marginBottom: '16px' }}>
          भारत के समुद्रों को समझना, सुरक्षित रखना और संरक्षित करना।
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onExploreOceans}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0077B6',
              background: 'linear-gradient(90deg, #0077B6 0%, #0096C7 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '24px',
              padding: '8px 18px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(0, 119, 182, 0.45)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <Compass size={15} color="#FFFFFF" />
            <span>{t.exploreOceans}</span>
          </button>

          <button
            onClick={onStartSonar}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              border: '1px solid rgba(0, 194, 215, 0.45)',
              borderRadius: '24px',
              padding: '8px 18px',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 194, 215, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
          >
            <Radar size={15} color="#00C2D7" />
            <span>{t.startSonarAnalysis}</span>
          </button>
        </div>
      </div>

      {/* Right Graphic: India's Maritime Map Visualization */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderLeft: '1px solid rgba(0, 194, 215, 0.15)'
      }}>
        {/* SVG Stylized Satellite/Bathymetric Indian Ocean Map */}
        <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
          <defs>
            <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#082F48" />
              <stop offset="50%" stopColor="#0B3E5E" />
              <stop offset="100%" stopColor="#051C2C" />
            </linearGradient>
            <radialGradient id="hotspotPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sonarPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00C2D7" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#0077B6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00C2D7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Deep Ocean Water Matrix */}
          <rect width="400" height="240" fill="url(#oceanGrad)" />

          {/* Bathymetric depth contour lines */}
          <path d="M 60,30 Q 120,80 160,160 T 220,220" fill="none" stroke="#0D4B70" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <path d="M 340,40 Q 280,100 240,170 T 210,230" fill="none" stroke="#0D4B70" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <path d="M 120,210 Q 200,230 280,215" fill="none" stroke="#0D4B70" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

          {/* Peninsular India Outline (Geometrically simplified & faithful to Indian subcontinent) */}
          <path
            d="M 120,10 
               L 165,15 
               L 190,10 
               L 220,20 
               L 255,25 
               L 280,45 
               L 260,75 
               L 245,105 
               L 235,135 
               L 220,175 
               L 205,195 
               L 200,205 
               L 195,195 
               L 185,160 
               L 175,130 
               L 165,95 
               L 145,75 
               L 130,50 Z"
            fill="#103B56"
            stroke="#00A8CC"
            strokeWidth="1.8"
            opacity="0.92"
          />

          {/* Sri Lanka */}
          <ellipse cx="232" cy="205" rx="7" ry="11" fill="#103B56" stroke="#00A8CC" strokeWidth="1.2" opacity="0.85" />

          {/* Lakshadweep Island Chain (West) */}
          <circle cx="150" cy="180" r="2.5" fill="#00C2D7" />
          <circle cx="152" cy="188" r="2" fill="#00C2D7" />
          <circle cx="155" cy="196" r="2.2" fill="#00C2D7" />

          {/* Andaman & Nicobar Island Chain (East) */}
          <ellipse cx="320" cy="140" rx="3" ry="12" fill="#00C2D7" stroke="#159A72" strokeWidth="0.8" />
          <ellipse cx="324" cy="170" rx="2.5" ry="10" fill="#00C2D7" stroke="#159A72" strokeWidth="0.8" />

          {/* Dynamic Pulsing Sonar Sweep Circles */}
          {/* Mumbai Hotspot (West) */}
          <circle cx="158" cy="100" r="14" fill="url(#sonarPulse)" opacity="0.65" />
          <circle cx="158" cy="100" r="3" fill="#00C2D7" />

          {/* Chennai / Coromandel Hotspot (East) */}
          <circle cx="230" cy="152" r="18" fill="url(#hotspotPulse)" opacity="0.85" />
          <circle cx="230" cy="152" r="3.5" fill="#DC2626" />
          <circle cx="230" cy="152" r="8" fill="none" stroke="#DC2626" strokeWidth="1" strokeDasharray="2 2" />

          {/* Odisha / Paradip Hotspot */}
          <circle cx="258" cy="78" r="12" fill="url(#sonarPulse)" opacity="0.65" />
          <circle cx="258" cy="78" r="3" fill="#F59E0B" />

          {/* Sea Basin Labels (Matches Screenshot exactly) */}
          {/* Arabian Sea */}
          <text x="75" y="105" fill="#BAE6FD" fontSize="11" fontWeight="700" fontFamily="sans-serif">Arabian Sea</text>
          <text x="85" y="119" fill="#78B0C8" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">अरब सागर</text>

          {/* Bay of Bengal */}
          <text x="275" y="115" fill="#BAE6FD" fontSize="11" fontWeight="700" fontFamily="sans-serif">Bay of Bengal</text>
          <text x="282" y="129" fill="#78B0C8" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">बंगाल की खाड़ी</text>

          {/* Indian Ocean */}
          <text x="180" y="226" fill="#BAE6FD" fontSize="11" fontWeight="700" fontFamily="sans-serif">Indian Ocean</text>
          <text x="195" y="238" fill="#78B0C8" fontSize="9" fontWeight="600" fontFamily="sans-serif">हिंद महासागर</text>

          {/* Lakshadweep Label */}
          <text x="110" y="185" fill="#00C2D7" fontSize="8" fontWeight="600" fontFamily="sans-serif">Lakshadweep</text>
          <text x="122" y="194" fill="#6BA7C1" fontSize="7" fontFamily="sans-serif">लक्षद्वीप</text>

          {/* Andaman & Nicobar Label */}
          <text x="315" y="196" fill="#00C2D7" fontSize="8" fontWeight="600" fontFamily="sans-serif">Andaman & Nicobar</text>
          <text x="318" y="205" fill="#6BA7C1" fontSize="7" fontFamily="sans-serif">अंडमान और निकोबार</text>

          {/* North Arrow Symbol at top right */}
          <g transform="translate(340, 25)">
            <polygon points="0,-12 4,4 0,0 -4,4" fill="#FFFFFF" />
            <polygon points="0,0 4,4 0,12 -4,4" fill="#648296" />
            <text x="-4" y="-16" fill="#FFFFFF" fontSize="9" fontWeight="800">N</text>
          </g>
        </svg>
      </div>
    </div>
  );
};
