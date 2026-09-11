import React from 'react';
import { 
  Fish, 
  Ship, 
  Anchor, 
  Sparkles 
} from 'lucide-react';
import { translations, type Language } from '../i18n';

interface ImpactCardsProps {
  lang: Language;
  onCardClick?: (category: string) => void;
}

export const ImpactCards: React.FC<ImpactCardsProps> = ({
  lang,
  onCardClick
}) => {
  const t = translations[lang];

  const cards = [
    {
      id: 'ecosystems',
      title: t.impactEcosystemsTitle,
      hindiTitle: 'समुद्री पारिस्थितिकी तंत्र',
      desc: 'Healthy oceans, thriving biodiversity',
      hindiDesc: 'स्वस्थ समुद्र, समृद्ध जैव विविधता',
      icon: Fish,
      color: '#159A72',
      bgLight: '#E6F7F1',
      borderColor: '#A7E8D4'
    },
    {
      id: 'safety',
      title: t.impactSafetyTitle,
      hindiTitle: 'तटीय सुरक्षा',
      desc: 'Safer navigation, secure trade',
      hindiDesc: 'सुरक्षित नौवहन, सुरक्षित व्यापार',
      icon: Ship,
      color: '#0077B6',
      bgLight: '#E0F2FE',
      borderColor: '#BAE6FD'
    },
    {
      id: 'livelihoods',
      title: t.impactLivelihoodsTitle,
      hindiTitle: 'तटीय आजीविका',
      desc: 'Stronger communities, brighter future',
      hindiDesc: 'मजबूत समुदाय, उज्ज्वल भविष्य',
      icon: Anchor,
      color: '#00A8CC',
      bgLight: '#EAF7FB',
      borderColor: '#BBE6F2'
    },
    {
      id: 'blue_economy',
      title: t.impactBlueEconomyTitle,
      hindiTitle: 'ब्लू इकोनॉमी',
      desc: 'Sustainable growth, ocean prosperity',
      hindiDesc: 'सतत विकास, समुद्री समृद्धि',
      icon: Sparkles,
      color: '#00C2D7',
      bgLight: '#E6FBFD',
      borderColor: '#B4F3F8'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '14px',
      margin: '16px 0'
    }}>
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            onClick={() => onCardClick?.(c.id)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #D4E7EF',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(6, 40, 61, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = c.color;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 40, 61, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#D4E7EF';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(6, 40, 61, 0.03)';
            }}
          >
            {/* Icon Box */}
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: c.bgLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: c.color,
              flexShrink: 0,
              border: `1px solid ${c.borderColor}`
            }}>
              <Icon size={20} />
            </div>

            {/* Text details */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#06283D' }}>
                  {c.title}
                </span>
              </div>
              <div className="font-hindi" style={{ fontSize: '9.5px', fontWeight: 600, color: c.color, marginTop: '-2px' }}>
                {c.hindiTitle}
              </div>
              <div style={{ fontSize: '9.5px', color: '#648296', marginTop: '2px', lineHeight: '1.2' }}>
                {lang === 'hi' ? c.hindiDesc : c.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
