import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import { 
  Eye, 
  Layers
} from 'lucide-react';
import type { DetectionItem } from '../types';
import { MARINE_ECOSYSTEMS, MAJOR_INDIAN_PORTS } from '../data/indianMissions';
import { translations, type Language } from '../i18n';

interface HazardMapProps {
  centerCoords: [number, number];
  detections: DetectionItem[];
  selectedDetection: DetectionItem | null;
  onSelectDetection: (det: DetectionItem) => void;
  onFocusSonarVision: (det: DetectionItem) => void;
  fairwayBufferActive?: boolean;
  missionName: string;
  lang: Language;
}

// Helper component to center and animate the map smoothly
const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 12, { duration: 1.2 });
  }, [center, map]);
  return null;
};

export const HazardMap: React.FC<HazardMapProps> = ({
  centerCoords,
  detections,
  selectedDetection,
  onSelectDetection,
  onFocusSonarVision,
  fairwayBufferActive = true,
  lang
}) => {
  const [lat, lon] = centerCoords;
  const t = translations[lang];

  // Layer toggles matching screenshot
  const [showSurveyArea, setShowSurveyArea] = useState<boolean>(true);
  const [showHazards, setShowHazards] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showCoral, setShowCoral] = useState<boolean>(true);
  const [showMangrove, setShowMangrove] = useState<boolean>(true);
  const [showSeagrass, setShowSeagrass] = useState<boolean>(true);
  const [showProtected, setShowProtected] = useState<boolean>(true);

  // Survey bounding polygon
  const surveyPolygon: [number, number][] = [
    [lat + 0.014, lon - 0.020],
    [lat + 0.014, lon + 0.020],
    [lat - 0.014, lon + 0.020],
    [lat - 0.014, lon - 0.020]
  ];

  // Navigation Fairway / Shipping Approach Corridor
  const fairwayPolygon: [number, number][] = [
    [lat + 0.012, lon - 0.006],
    [lat + 0.012, lon + 0.006],
    [lat - 0.012, lon + 0.006],
    [lat - 0.012, lon - 0.006]
  ];

  // Towfish Trackline
  const surveyTrackline: [number, number][] = [
    [lat + 0.013, lon],
    [lat - 0.013, lon]
  ];

  const getMarkerColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return '#DC2626'; // Red
      case 'HIGH': return '#F59E0B';     // Orange
      case 'MEDIUM': return '#EAB308';   // Yellow
      default: return '#00A8CC';         // Cyan
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
      boxShadow: '0 2px 10px rgba(6, 40, 61, 0.04)',
      position: 'relative'
    }}>
      {/* Top Card Title */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #D4E7EF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#06283D' }}>
            India Ocean Map
          </span>
          <span className="font-hindi" style={{ fontSize: '11px', color: '#648296' }}>
            भारत महासागर मानचित्र
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '9px',
            fontWeight: 700,
            color: '#0077B6',
            backgroundColor: '#E0F2FE',
            border: '1px solid #BAE6FD',
            padding: '2px 7px',
            borderRadius: '4px'
          }}>
            WGS84 GEOTAGGED
          </span>
        </div>
      </div>

      {/* Map Body with Floating Legend */}
      <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
        {/* Leaflet Map */}
        <MapContainer
          center={centerCoords}
          zoom={11}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <MapRecenter center={centerCoords} />

          {/* Clean OpenStreetMap Cartography */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Survey Swath Polygon */}
          {showSurveyArea && (
            <Polygon
              positions={surveyPolygon}
              pathOptions={{
                color: '#0077B6',
                weight: 1.5,
                fillColor: '#0077B6',
                fillOpacity: 0.08,
                dashArray: '5, 5'
              }}
            />
          )}

          {/* Shipping Fairway Corridor */}
          {showSurveyArea && (
            <Polygon
              positions={fairwayPolygon}
              pathOptions={{
                color: '#159A72',
                weight: 2,
                fillColor: '#159A72',
                fillOpacity: 0.12
              }}
            />
          )}

          {/* Towfish Trackline */}
          {showSurveyArea && (
            <Polyline
              positions={surveyTrackline}
              pathOptions={{
                color: '#00C2D7',
                weight: 2,
                dashArray: '3, 4'
              }}
            />
          )}

          {/* Major Indian Ports */}
          {showPorts && MAJOR_INDIAN_PORTS.map(p => (
            <CircleMarker
              key={p.id}
              center={p.coords}
              radius={5}
              pathOptions={{
                color: '#06283D',
                fillColor: '#0077B6',
                fillOpacity: 0.9,
                weight: 1.5
              }}
            >
              <Popup>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#06283D' }}>
                  ⚓ {p.name} ({p.state})
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Marine Ecosystem Sanctuaries */}
          {MARINE_ECOSYSTEMS.map(eco => {
            const isVisible = (eco.category === 'Coral Reefs' && showCoral) ||
                              (eco.category === 'Mangroves' && showMangrove) ||
                              (eco.category === 'Seagrass' && showSeagrass) ||
                              showProtected;
            if (!isVisible) return null;

            return (
              <Circle
                key={eco.id}
                center={eco.center}
                radius={25000} // 25km radius representation on macro view
                pathOptions={{
                  color: eco.category === 'Coral Reefs' ? '#F97316' : eco.category === 'Mangroves' ? '#159A72' : '#00C2D7',
                  fillColor: eco.category === 'Coral Reefs' ? '#F97316' : eco.category === 'Mangroves' ? '#159A72' : '#00C2D7',
                  fillOpacity: 0.15,
                  weight: 1
                }}
              >
                <Popup>
                  <div style={{ padding: '2px', fontSize: '11px' }}>
                    <b style={{ color: '#06283D' }}>{eco.name}</b>
                    <div style={{ color: '#159A72', fontSize: '10px' }}>{eco.hindi_name}</div>
                    <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '3px' }}>
                      Key Species: {eco.key_species}
                    </div>
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {/* Sonar Hazard Contacts */}
          {showHazards && detections.map(det => {
            const isSelected = selectedDetection?.id === det.id;
            const color = getMarkerColor(det.severity);
            const isCritical = det.severity === 'CRITICAL';

            return (
              <React.Fragment key={det.id}>
                {fairwayBufferActive && (
                  <Circle
                    center={[det.lat, det.lon]}
                    radius={isCritical ? 100 : 50}
                    pathOptions={{
                      color: isCritical ? '#DC2626' : color,
                      weight: 1,
                      fillColor: isCritical ? '#DC2626' : color,
                      fillOpacity: 0.16,
                      dashArray: '3, 3'
                    }}
                  />
                )}

                <CircleMarker
                  center={[det.lat, det.lon]}
                  radius={isSelected ? 10 : isCritical ? 8.5 : 7}
                  pathOptions={{
                    color: isSelected ? '#FFFFFF' : color,
                    weight: isSelected ? 3 : 2,
                    fillColor: color,
                    fillOpacity: 0.95
                  }}
                  eventHandlers={{
                    click: () => onSelectDetection(det)
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '220px', padding: '4px', fontFamily: 'system-ui, sans-serif' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#0077B6' }}>
                          {det.id}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          backgroundColor: isCritical ? '#FEF2F2' : '#F0FDF4',
                          color: isCritical ? '#DC2626' : '#159A72',
                          padding: '1px 6px',
                          borderRadius: '3px'
                        }}>
                          {det.severity}
                        </span>
                      </div>

                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#06283D', marginBottom: '4px' }}>
                        {det.label || det.class_name}
                      </div>

                      <div style={{ fontSize: '10.5px', color: '#475569', marginBottom: '6px', lineHeight: '1.3' }}>
                        {det.description}
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4px',
                        fontSize: '9.5px',
                        color: '#334155',
                        backgroundColor: '#F8FAFC',
                        padding: '6px',
                        borderRadius: '4px',
                        marginBottom: '8px'
                      }}>
                        <div><b>Confidence:</b> {det.confidence}%</div>
                        <div><b>Depth:</b> {det.depth_m}m</div>
                        <div><b>Dimensions:</b> {det.dimensions_m}</div>
                        <div><b>Shadow:</b> {det.acoustic_shadow_length_m}m</div>
                      </div>

                      <button
                        onClick={() => onFocusSonarVision(det)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0077B6',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={13} />
                        <span>Inspect in Sonar Vision</span>
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Right Floating Checklist Legend (Matches Screenshot Exactly) */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #D4E7EF',
          borderRadius: '8px',
          padding: '10px 12px',
          boxShadow: '0 4px 14px rgba(6, 40, 61, 0.1)',
          width: '175px',
          fontSize: '10.5px',
          color: '#06283D'
        }}>
          {/* Top Layer Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingBottom: '8px', borderBottom: '1px solid #E2EBF0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showSurveyArea}
                onChange={(e) => setShowSurveyArea(e.target.checked)}
                style={{ accentColor: '#0077B6' }}
              />
              <span style={{ fontWeight: 600 }}>Survey Area</span>
              <span className="font-hindi" style={{ fontSize: '9px', color: '#648296' }}>सर्वेक्षण क्षेत्र</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showHazards}
                onChange={(e) => setShowHazards(e.target.checked)}
                style={{ accentColor: '#DC2626' }}
              />
              <span style={{ fontWeight: 600 }}>Hazards</span>
              <span className="font-hindi" style={{ fontSize: '9px', color: '#648296' }}>खतरे</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showPorts}
                onChange={(e) => setShowPorts(e.target.checked)}
                style={{ accentColor: '#0077B6' }}
              />
              <span style={{ fontWeight: 600 }}>Ports</span>
              <span className="font-hindi" style={{ fontSize: '9px', color: '#648296' }}>बंदरगाह</span>
            </label>
          </div>

          {/* Marine Ecosystems Sub-Header */}
          <div style={{ paddingTop: '8px', paddingBottom: '6px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#0077B6' }}>
              Marine Ecosystems
            </div>
            <div className="font-hindi" style={{ fontSize: '8.5px', color: '#648296', marginBottom: '4px' }}>
              समुद्री पारिस्थितिकी
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#F97316' }} />
                <span>Coral Reef</span>
                <span className="font-hindi" style={{ fontSize: '8.5px', color: '#648296' }}>प्रवाल भित्ति</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#159A72' }} />
                <span>Mangrove</span>
                <span className="font-hindi" style={{ fontSize: '8.5px', color: '#648296' }}>मैंग्रोव</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#00C2D7' }} />
                <span>Seagrass</span>
                <span className="font-hindi" style={{ fontSize: '8.5px', color: '#648296' }}>समुद्री घास</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#0077B6' }} />
                <span>Protected Area</span>
                <span className="font-hindi" style={{ fontSize: '8.5px', color: '#648296' }}>संरक्षित क्षेत्र</span>
              </label>
            </div>
          </div>

          {/* Action Button: View Region Details */}
          <button
            onClick={() => onFocusSonarVision(detections[0])}
            style={{
              width: '100%',
              marginTop: '6px',
              padding: '5px 8px',
              borderRadius: '5px',
              border: '1px solid #BAE6FD',
              backgroundColor: '#E0F2FE',
              color: '#0077B6',
              fontSize: '9.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span>View Region Details</span>
            <span className="font-hindi" style={{ fontSize: '8.5px' }}>क्षेत्र विवरण देखें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
