import React from 'react';
import { 
  Radar, 
  Waves, 
  Cpu, 
  Navigation, 
  FileText, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  stage: string;
  progress: number;
  message: string;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  stage,
  progress,
  message
}) => {
  if (!isOpen) return null;

  const stages = [
    { id: 'PARSING', label: 'PARSING', icon: Radar },
    { id: 'PREPROCESSING', label: 'PREPROCESSING', icon: Waves },
    { id: 'DETECTION', label: 'DETECTION', icon: Cpu },
    { id: 'GEOTAGGING', label: 'GEOTAGGING', icon: Navigation },
    { id: 'REPORT_GENERATION', label: 'REPORT', icon: FileText }
  ];

  const getStageIndex = (current: string) => {
    switch (current) {
      case 'PARSING': return 0;
      case 'PREPROCESSING': return 1;
      case 'DETECTION': return 2;
      case 'GEOTAGGING': return 3;
      case 'REPORT_GENERATION': return 4;
      default: return 2;
    }
  };

  const currentIndex = getStageIndex(stage);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(7, 22, 38, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '560px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        border: '1px solid #CFE2ED',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#071626',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Loader2 size={20} color="#06B6D4" style={{ animation: 'spin 1.2s linear infinite' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', color: '#BAE6FD' }}>
                AQUASCAN AI PIPELINE EXECUTING
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                Multi-Stage Hydrographic Vision & Shadow Geometry Analysis
              </div>
            </div>
          </div>
          <span className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#38BDF8' }}>
            {progress}%
          </span>
        </div>

        {/* Stages Breadcrumb */}
        <div style={{ padding: '24px 20px 16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            {stages.map((stg, idx) => {
              const Icon = stg.icon;
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={stg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? '#0284C7' : isPast ? '#E0F2FE' : '#F1F5F9',
                    border: `2px solid ${isCurrent ? '#0284C7' : isPast ? '#0284C7' : '#CBD5E1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCurrent ? '#FFFFFF' : isPast ? '#0284C7' : '#94A3B8'
                  }}>
                    {isPast ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? '#0284C7' : isPast ? '#334155' : '#94A3B8'
                  }}>
                    {stg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div style={{ height: '8px', width: '100%', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#0284C7',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Status Message */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '12px',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284C7', display: 'inline-block' }} />
            <span className="font-mono">{message || 'Processing sonar waterfall imagery...'}</span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
