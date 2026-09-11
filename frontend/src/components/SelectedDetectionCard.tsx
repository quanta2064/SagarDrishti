import React from 'react';
import { 
  Compass, 
  Eye, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Fish 
} from 'lucide-react';
import type { DetectionItem } from '../types';
import { translations, type Language } from '../i18n';

interface SelectedDetectionCardProps {
  detection: DetectionItem | null;
  onViewOnMap: (det: DetectionItem) => void;
  lang: Language;
}

export const SelectedDetectionCard: React.FC<SelectedDetectionCardProps> = ({
  detection,
  onViewOnMap,
  lang
}) => {
  const t = translations[lang];

  if (!detection) {
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #D4E7EF',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(6, 40, 61, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#64748B',
        fontSize: '12px'
      }}>
        Select a detection contact on the map or sonar to view risk intelligence.
      </div>
    );
  }

  const getRiskBadge = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'CRITICAL':
        return { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
      case 'HIGH':
        return { color: '#F97316', bg: '#FFF7ED', border: '#FFEDD5' };
      case 'MEDIUM':
        return { color: '#EAB308', bg: '#FEFCE8', border: '#FEF08A' };
      default:
        return { color: '#00A8CC', bg: '#E0F2FE', border: '#BAE6FD' };
    }
  };

  const navBadge = getRiskBadge(detection.navigation_risk || detection.severity);
  const ecoBadge = getRiskBadge(detection.ecosystem_risk || 'HIGH');

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #D4E7EF',
      padding: '16px 18px',
      boxShadow: '0 2px 10px rgba(6, 40, 61, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%'
    }}>
      {/* Title & Hazard ID */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#06283D', marginBottom: '10px' }}>
          Selected Detection
        </div>

        {/* ID & Class Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#06283D' }} className="font-mono">
            {detection.id.startsWith('HAZ-') ? detection.id : `Hazard #${detection.id}`}
          </span>

          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            backgroundColor: navBadge.bg,
            color: navBadge.color,
            border: `1px solid ${navBadge.border}`,
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {detection.class_name === 'shipwreck' ? 'Shipwreck' :
             detection.class_name === 'pipe_cylinder' ? 'Pipe / Cylinder' :
             detection.class_name === 'debris_net' ? 'Net / Debris' : 'Anomaly'}
          </span>
        </div>

        {/* Attribute List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
          {/* Confidence */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#648296' }}>Confidence</span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#06283D' }}>{detection.confidence}%</span>
          </div>

          {/* Depth */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#648296' }}>Depth</span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#06283D' }}>{detection.depth_m} m</span>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#648296' }}>Location</span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#06283D' }}>
              {detection.lat.toFixed(4)}° N, {detection.lon.toFixed(4)}° E
            </span>
          </div>

          {/* Dimensions */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#648296' }}>Dimensions</span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#06283D' }}>{detection.dimensions_m}</span>
          </div>

          {/* Acoustic Shadow */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#648296' }}>Acoustic Shadow</span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#06283D' }}>
              {detection.acoustic_shadow_length_m || 38.5} m
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: '#E2EBF0', margin: '4px 0' }} />

          {/* Navigation Risk */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#648296', fontWeight: 600 }}>Navigation Risk</span>
            <span style={{
              fontSize: '9.5px',
              fontWeight: 800,
              backgroundColor: navBadge.bg,
              color: navBadge.color,
              padding: '1px 6px',
              borderRadius: '3px',
              border: `1px solid ${navBadge.border}`
            }}>
              {detection.navigation_risk || detection.severity}
            </span>
          </div>

          {/* Ecosystem Risk */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#648296', fontWeight: 600 }}>Ecosystem Risk</span>
            <span style={{
              fontSize: '9.5px',
              fontWeight: 800,
              backgroundColor: ecoBadge.bg,
              color: ecoBadge.color,
              padding: '1px 6px',
              borderRadius: '3px',
              border: `1px solid ${ecoBadge.border}`
            }}>
              {detection.ecosystem_risk || 'High'}
            </span>
          </div>

          {/* Potential Impact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
            <span style={{ color: '#648296', fontWeight: 600 }}>Potential Impact</span>
            <span style={{ fontSize: '10.5px', color: '#0077B6', fontWeight: 600 }}>
              {detection.potential_impact || 'Seagrass Meadow & Coral Fringe'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button: View on Map */}
      <button
        onClick={() => onViewOnMap(detection)}
        style={{
          marginTop: '12px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #0077B6',
          borderRadius: '6px',
          padding: '7px 12px',
          color: '#0077B6',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#0077B6';
          e.currentTarget.style.color = '#FFFFFF';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.color = '#0077B6';
        }}
      >
        <Compass size={14} />
        <span>View on Map</span>
      </button>
    </div>
  );
};
