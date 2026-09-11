import React from 'react';
import { translations, type Language } from '../i18n';

interface KeyMetricsBarProps {
  surveyAreaKm2?: number;
  hazardsDetected?: number;
  criticalBlockers?: number;
  coastalRegions?: number;
  ecosystemsMonitored?: number;
  latencyMs?: number;
  lang: Language;
}

export const KeyMetricsBar: React.FC<KeyMetricsBarProps> = ({
  surveyAreaKm2 = 42.8,
  hazardsDetected = 17,
  criticalBlockers = 4,
  coastalRegions = 5,
  ecosystemsMonitored = 3,
  latencyMs = 184,
  lang
}) => {
  const t = translations[lang];

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
      {/* Title & Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#06283D' }}>
            Key Metrics
          </span>
          <span className="font-hindi" style={{ fontSize: '10.5px', color: '#648296' }}>
            प्रमुख मापदंड
          </span>
        </div>

        <span style={{
          fontSize: '8.5px',
          fontWeight: 800,
          color: '#B45309',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FDE68A',
          padding: '1px 6px',
          borderRadius: '4px'
        }}>
          DEMO DATA
        </span>
      </div>

      {/* Metrics Grid (6 Columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        alignItems: 'center'
      }}>
        {/* Survey Area */}
        <div style={{ borderRight: '1px solid #E2EBF0', paddingRight: '6px' }}>
          <div style={{ fontSize: '9.5px', color: '#648296', fontWeight: 600 }}>Survey Area</div>
          <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#06283D' }}>
            {surveyAreaKm2.toFixed(1)} <span style={{ fontSize: '10px', fontWeight: 500 }}>km²</span>
          </div>
          <div style={{ fontSize: '8.5px', color: '#159A72', fontWeight: 700 }}>↑ 12%</div>
        </div>

        {/* Hazards Detected */}
        <div style={{ borderRight: '1px solid #E2EBF0', paddingRight: '6px' }}>
          <div style={{ fontSize: '9.5px', color: '#648296', fontWeight: 600 }}>Hazards Detected</div>
          <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#DC2626' }}>
            {hazardsDetected}
          </div>
          <div style={{ fontSize: '8.5px', color: '#DC2626', fontWeight: 700 }}>↑ 8%</div>
        </div>

        {/* Critical Blockers */}
        <div style={{ borderRight: '1px solid #E2EBF0', paddingRight: '6px' }}>
          <div style={{ fontSize: '9.5px', color: '#648296', fontWeight: 600 }}>Critical Blockers</div>
          <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#DC2626' }}>
            {criticalBlockers}
          </div>
          <div style={{ fontSize: '8.5px', color: '#DC2626', fontWeight: 700 }}>↑ 33%</div>
        </div>

        {/* Coastal Regions */}
        <div style={{ borderRight: '1px solid #E2EBF0', paddingRight: '6px' }}>
          <div style={{ fontSize: '9.5px', color: '#648296', fontWeight: 600 }}>Coastal Regions</div>
          <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#06283D' }}>
            {coastalRegions}
          </div>
          <div style={{ fontSize: '8.5px', color: '#648296', fontWeight: 700 }}>↑ 0%</div>
        </div>

        {/* Ecosystems Monitored */}
        <div style={{ borderRight: '1px solid #E2EBF0', paddingRight: '6px' }}>
          <div style={{ fontSize: '9.5px', color: '#648296', fontWeight: 600 }}>Ecosystems Monitored</div>
          <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#06283D' }}>
            {ecosystemsMonitored}
          </div>
          <div style={{ fontSize: '8.5px', color: '#159A72', fontWeight: 700 }}>↑ 50%</div>
        </div>

        {/* Latency */}
        <div>
          <div style={{ fontSize: '9.5px', color: '#648296', fontWeight: 600 }}>Latency</div>
          <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#0077B6' }}>
            {latencyMs} <span style={{ fontSize: '10px', fontWeight: 500 }}>ms</span>
          </div>
          <div style={{ fontSize: '8.5px', color: '#159A72', fontWeight: 700 }}>Optimal</div>
        </div>
      </div>
    </div>
  );
};
