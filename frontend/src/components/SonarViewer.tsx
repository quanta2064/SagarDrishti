import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Activity,
  Radio
} from 'lucide-react';
import type { DetectionItem } from '../types';
import { translations, type Language } from '../i18n';

interface SonarViewerProps {
  rawImageBase64: string;
  annotatedImageBase64: string;
  detections: DetectionItem[];
  selectedDetection: DetectionItem | null;
  onSelectDetection: (det: DetectionItem) => void;
  overlayOpacity: number;
  setOverlayOpacity: (val: number) => void;
  lang: Language;
}

export const SonarViewer: React.FC<SonarViewerProps> = ({
  rawImageBase64,
  annotatedImageBase64,
  detections,
  selectedDetection,
  onSelectDetection,
  overlayOpacity,
  setOverlayOpacity,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'raw' | 'enhanced' | 'comparison'>('comparison');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showShadows, setShowShadows] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1.0);

  const getPillColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
      case 'HIGH': return { color: '#F97316', bg: '#FFF7ED', border: '#FFEDD5' };
      case 'MEDIUM': return { color: '#EAB308', bg: '#FEFCE8', border: '#FEF08A' };
      default: return { color: '#00A8CC', bg: '#E0F2FE', border: '#BAE6FD' };
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #D4E7EF',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxShadow: '0 2px 10px rgba(6, 40, 61, 0.04)'
    }}>
      {/* Top Header & Sub-Navigation Tabs */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid #D4E7EF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#06283D' }}>
            Sonar Intelligence
          </span>
          <span className="font-hindi" style={{ fontSize: '11px', color: '#648296' }}>
            सोनार बुद्धिमत्ता
          </span>
        </div>

        {/* View Mode Tabs (Raw Sonar | AI Enhanced | Comparison) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#F1F5F9',
          borderRadius: '6px',
          padding: '2px',
          border: '1px solid #E2E8F0'
        }}>
          <button
            onClick={() => setActiveTab('raw')}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'raw' ? '#0077B6' : 'transparent',
              color: activeTab === 'raw' ? '#FFFFFF' : '#475569',
              fontSize: '10.5px',
              fontWeight: activeTab === 'raw' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Raw Sonar <span className="font-hindi" style={{ fontSize: '9px', opacity: 0.85 }}>कच्चा सोनार</span>
          </button>

          <button
            onClick={() => setActiveTab('enhanced')}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'enhanced' ? '#0077B6' : 'transparent',
              color: activeTab === 'enhanced' ? '#FFFFFF' : '#475569',
              fontSize: '10.5px',
              fontWeight: activeTab === 'enhanced' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            AI Enhanced <span className="font-hindi" style={{ fontSize: '9px', opacity: 0.85 }}>AI संवर्धित</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'comparison' ? '#0077B6' : 'transparent',
              color: activeTab === 'comparison' ? '#FFFFFF' : '#475569',
              fontSize: '10.5px',
              fontWeight: activeTab === 'comparison' ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            Comparison <span className="font-hindi" style={{ fontSize: '9px', opacity: 0.85 }}>तुलना</span>
          </button>
        </div>

        {/* Live Scan Green Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: '#E6F7F1',
          border: '1px solid #A7E8D4',
          borderRadius: '12px',
          padding: '2px 8px',
          color: '#159A72',
          fontSize: '10px',
          fontWeight: 700
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#159A72' }} />
          <span>Live Scan</span>
        </div>
      </div>

      {/* Main Sonar Imagery Canvas + Right Detections Panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', backgroundColor: '#06131F' }}>
        {/* Sonar Imagery Container */}
        <div 
          ref={containerRef}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            padding: '10px'
          }}
        >
          {activeTab === 'raw' && (
            <img
              src={rawImageBase64}
              alt="Raw Acoustic Sonogram"
              style={{
                width: `${100 * zoomLevel}%`,
                height: 'auto',
                display: 'block',
                borderRadius: '6px',
                border: '1px solid #14334C'
              }}
            />
          )}

          {activeTab === 'enhanced' && (
            <img
              src={annotatedImageBase64}
              alt="AI Enhanced Sonogram"
              style={{
                width: `${100 * zoomLevel}%`,
                height: 'auto',
                display: 'block',
                borderRadius: '6px',
                border: '1px solid #00A8CC',
                opacity: overlayOpacity
              }}
            />
          )}

          {activeTab === 'comparison' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              width: `${100 * zoomLevel}%`,
              maxWidth: '100%'
            }}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px', border: '1px solid #14334C' }}>
                <img
                  src={rawImageBase64}
                  alt="Raw Sonar"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px', border: '1px solid rgba(0, 168, 204, 0.4)' }}>
                <img
                  src={annotatedImageBase64}
                  alt="AI Enhanced"
                  style={{ width: '100%', height: 'auto', display: 'block', opacity: overlayOpacity }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Detections List (Matching Reference Screenshot) */}
        <div style={{
          width: '145px',
          backgroundColor: '#FFFFFF',
          borderLeft: '1px solid #D4E7EF',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#06283D', marginBottom: '2px' }}>
            Detections
          </div>

          {detections.map(d => {
            const isSelected = selectedDetection?.id === d.id;
            const badge = getPillColor(d.severity);

            return (
              <div
                key={d.id}
                onClick={() => onSelectDetection(d)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? '#E0F2FE' : badge.bg,
                  border: `1px solid ${isSelected ? '#0077B6' : badge.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badge.color }} />
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#06283D' }}>
                    {d.class_name === 'shipwreck' ? 'Shipwreck' :
                     d.class_name === 'pipe_cylinder' ? 'Pipe / Cylinder' :
                     d.class_name === 'debris_net' ? 'Net / Debris' : 'Anomaly'}
                  </div>
                </div>

                <span style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  color: badge.color
                }}>
                  {d.confidence}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls Bar (Matches Screenshot Toolbar) */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #D4E7EF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        fontSize: '11px',
        color: '#475569',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {/* Zoom Tool Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleZoomOut}
            style={{ padding: '3px 6px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', cursor: 'pointer' }}
            title="Zoom Out"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={handleZoomIn}
            style={{ padding: '3px 6px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', cursor: 'pointer' }}
            title="Zoom In"
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={handleResetZoom}
            style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', cursor: 'pointer', fontSize: '10.5px', fontWeight: 600 }}
          >
            {Math.round(zoomLevel * 100)}%
          </button>
        </div>

        {/* Overlay Opacity Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#335368' }}>Overlay Opacity</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
            style={{ width: '70px', accentColor: '#0077B6', cursor: 'pointer' }}
          />
          <span className="font-mono" style={{ fontSize: '10.5px', fontWeight: 700, color: '#0077B6' }}>
            {Math.round(overlayOpacity * 100)}%
          </span>
        </div>

        {/* Show Labels Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            style={{ accentColor: '#0077B6' }}
          />
          <span style={{ fontSize: '10.5px', fontWeight: 600 }}>Show Labels</span>
        </label>

        {/* Show Shadows Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showShadows}
            onChange={(e) => setShowShadows(e.target.checked)}
            style={{ accentColor: '#0077B6' }}
          />
          <span style={{ fontSize: '10.5px', fontWeight: 600 }}>Show Shadows</span>
        </label>
      </div>
    </div>
  );
};
