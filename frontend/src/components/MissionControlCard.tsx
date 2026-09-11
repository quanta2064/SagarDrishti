import React from 'react';
import { ChevronDown } from 'lucide-react';
import { INDIAN_MISSIONS } from '../data/indianMissions';
import { translations, type Language } from '../i18n';

interface MissionControlCardProps {
  selectedMissionId: string;
  onSelectMission: (missionId: string) => void;
  lang: Language;
  hazardsCount: number;
  scannedAreaKm2: number;
  latencyMs: number;
}

export const MissionControlCard: React.FC<MissionControlCardProps> = ({
  selectedMissionId,
  onSelectMission,
  lang,
  hazardsCount,
  scannedAreaKm2,
  latencyMs
}) => {
  const t = translations[lang];

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #D4E7EF',
      padding: '18px 20px',
      boxShadow: '0 2px 10px rgba(6, 40, 61, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '230px',
      height: '100%'
    }}>
      {/* Top Header & Mission Mode Dropdown */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#06283D' }}>
              Mission Mode
            </span>
            <span className="font-hindi" style={{ fontSize: '11px', color: '#648296' }}>
              मिशन मोड
            </span>
          </div>

          <span style={{
            fontSize: '9px',
            fontWeight: 800,
            letterSpacing: '0.6px',
            color: '#B45309',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            padding: '2px 7px',
            borderRadius: '4px'
          }}>
            DEMO MISSION
          </span>
        </div>

        {/* Mission Selector Dropdown */}
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <select
            value={selectedMissionId}
            onChange={(e) => onSelectMission(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 32px 8px 12px',
              borderRadius: '7px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              fontSize: '12px',
              fontWeight: 600,
              color: '#06283D',
              appearance: 'none',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {INDIAN_MISSIONS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            color="#64748B"
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
        </div>

        {/* Live Ocean Intelligence Header */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0077B6' }}>
            Live Ocean Intelligence
          </div>
          <div className="font-hindi" style={{ fontSize: '10px', color: '#648296', marginTop: '-1px' }}>
            लाइव समुद्री बुद्धिमत्ता
          </div>
        </div>

        {/* Live Telemetry Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Hazards Detected */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#335368' }}>Hazards Detected</div>
                <div className="font-hindi" style={{ fontSize: '9px', color: '#94A3B8', marginTop: '-2px' }}>पहचाने गए खतरे</div>
              </div>
            </div>
            <span className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#06283D' }}>
              {hazardsCount}
            </span>
          </div>

          {/* Survey Area */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#0077B6' }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#335368' }}>Survey Area</div>
                <div className="font-hindi" style={{ fontSize: '9px', color: '#94A3B8', marginTop: '-2px' }}>सर्वेक्षण क्षेत्र</div>
              </div>
            </div>
            <span className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#06283D' }}>
              {scannedAreaKm2.toFixed(1)} <span style={{ fontSize: '11px', fontWeight: 500 }}>km²</span>
            </span>
          </div>

          {/* AI Inference Latency */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00A8CC' }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#335368' }}>AI Inference Latency</div>
                <div className="font-hindi" style={{ fontSize: '9px', color: '#94A3B8', marginTop: '-2px' }}>AI प्रसंकरण विलंबता</div>
              </div>
            </div>
            <span className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#06283D' }}>
              {latencyMs} <span style={{ fontSize: '11px', fontWeight: 500 }}>ms</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom DEMO DATA Tag */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <span style={{
          fontSize: '8.5px',
          fontWeight: 700,
          color: '#B45309',
          letterSpacing: '0.6px'
        }}>
          DEMO DATA
        </span>
      </div>
    </div>
  );
};
