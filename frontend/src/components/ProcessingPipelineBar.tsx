import React from 'react';
import { 
  Check, 
  Loader2, 
  ArrowRight
} from 'lucide-react';
import { translations, type Language } from '../i18n';

interface ProcessingPipelineBarProps {
  currentStage?: string;
  progressPct?: number;
  lang: Language;
}

export const ProcessingPipelineBar: React.FC<ProcessingPipelineBarProps> = ({
  currentStage = 'Detection',
  progressPct = 68,
  lang
}) => {
  const t = translations[lang];

  const stages = [
    { id: 'parsing', label: 'Parsing', hindi: 'पार्सिंग', status: 'completed' },
    { id: 'preprocessing', label: 'Preprocessing', hindi: 'प्री-प्रोसेसिंग', status: 'completed' },
    { id: 'detection', label: `Detection (${progressPct}%)`, hindi: 'पहचान', status: 'active' },
    { id: 'geotagging', label: 'Geotagging', hindi: 'भू-टैगिंग', status: 'pending' },
    { id: 'ecosystem', label: 'Ecosystem Analysis', hindi: 'पारिस्थितिकी विश्लेषण', status: 'pending' },
    { id: 'report', label: 'Report Generation', hindi: 'रिपोर्ट निर्माण', status: 'pending' }
  ];

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #D4E7EF',
      padding: '14px 18px',
      boxShadow: '0 2px 10px rgba(6, 40, 61, 0.04)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#06283D' }}>
          Processing Pipeline
        </span>
        <span className="font-hindi" style={{ fontSize: '10.5px', color: '#648296' }}>
          प्रसंस्करण पाइपलाइन
        </span>
      </div>

      {/* Horizontal Steps Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
        {stages.map((stg, idx) => {
          const isCompleted = stg.status === 'completed';
          const isActive = stg.status === 'active';

          return (
            <React.Fragment key={stg.id}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flex: 1
              }}>
                {/* Circle Icon Indicator */}
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#159A72' : isActive ? '#0077B6' : '#F1F5F9',
                  border: `2px solid ${isCompleted ? '#159A72' : isActive ? '#00C2D7' : '#CBD5E1'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: isActive ? '0 0 8px rgba(0, 194, 215, 0.5)' : 'none',
                  marginBottom: '4px'
                }}>
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isActive ? (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF', animation: 'pulse 1.2s infinite' }} />
                  ) : (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
                  )}
                </div>

                {/* Stage Names */}
                <div style={{
                  fontSize: '9.5px',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#0077B6' : isCompleted ? '#06283D' : '#648296'
                }}>
                  {stg.label}
                </div>
                <div className="font-hindi" style={{
                  fontSize: '8px',
                  color: isActive ? '#00A8CC' : '#94A3B8',
                  marginTop: '-2px'
                }}>
                  {stg.hindi}
                </div>
              </div>

              {/* Connecting arrow/divider */}
              {idx < stages.length - 1 && (
                <div style={{
                  height: '2px',
                  backgroundColor: isCompleted ? '#159A72' : '#CBD5E1',
                  flex: 0.6,
                  marginBottom: '14px'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
