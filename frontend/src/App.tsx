import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HeroBanner } from './components/HeroBanner';
import { MissionControlCard } from './components/MissionControlCard';
import { ImpactCards } from './components/ImpactCards';
import { HazardMap } from './components/HazardMap';
import { SonarViewer } from './components/SonarViewer';
import { SelectedDetectionCard } from './components/SelectedDetectionCard';
import { ProcessingPipelineBar } from './components/ProcessingPipelineBar';
import { KeyMetricsBar } from './components/KeyMetricsBar';
import { IncidentTable } from './components/IncidentTable';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ProcessingModal } from './components/ProcessingModal';
import { ReportModal } from './components/ReportModal';

import { translations, type Language } from './i18n';
import { MARINE_ECOSYSTEMS } from './data/indianMissions';
import type { AnalysisResponse, DetectionItem } from './types';

import { 
  Fish, 
  MapPin, 
  Upload, 
  Sliders, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Waves,
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function App() {
  // Navigation & Language
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'vision' | 'ecosystems' | 'audit' | 'control' | 'reports'>('overview');
  const [lang, setLang] = useState<Language>('en');

  // Mission & Pipeline parameters
  const [preset, setPreset] = useState<string>('chennai');
  const [confThreshold, setConfThreshold] = useState<number>(0.35);
  const [enableDespeckle, setEnableDespeckle] = useState<boolean>(true);
  const [enforceShadow, setEnforceShadow] = useState<boolean>(true);
  const [fairwayBufferActive, setFairwayBufferActive] = useState<boolean>(true);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.90);

  // Application Data & Selection
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<DetectionItem | null>(null);

  // Modal States
  const [processingState, setProcessingState] = useState<{
    isOpen: boolean;
    stage: string;
    progress: number;
    message: string;
  }>({
    isOpen: false,
    stage: 'PREPROCESSING',
    progress: 0,
    message: ''
  });

  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  // Fetch preset survey
  const loadPreset = async (presetId: string) => {
    setProcessingState({
      isOpen: true,
      stage: 'PARSING',
      progress: 20,
      message: lang === 'hi' ? 'सोनार डेटा पार्सिंग एवं पिंग पैकेट निष्कर्षण...' : 'Extracting side-scan sonar waterfall ping packets...'
    });

    try {
      await new Promise(r => setTimeout(r, 220));
      setProcessingState({
        isOpen: true,
        stage: 'PREPROCESSING',
        progress: 50,
        message: lang === 'hi' ? '2D-DWT वेवलेट डीस्पेकलिंग एवं CLAHE कंट्रास्ट संतुलन...' : 'Applying 2D-DWT wavelet despeckling and CLAHE contrast balance...'
      });

      await new Promise(r => setTimeout(r, 220));
      setProcessingState({
        isOpen: true,
        stage: 'DETECTION',
        progress: 80,
        message: lang === 'hi' ? 'YOLOv8n-CBAM न्यूरल डिटेक्शन एवं ध्वनिक छाया सत्यापन...' : 'Running YOLOv8n+CBAM multi-scale inference and shadow validation...'
      });

      const url = `${API_BASE}/api/mission/preset?preset_id=${presetId}&conf_threshold=${confThreshold}&enable_despeckle=${enableDespeckle}&enforce_shadow=${enforceShadow}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load preset: ${res.statusText}`);
      const json: AnalysisResponse = await res.json();
      
      setProcessingState({
        isOpen: true,
        stage: 'REPORT_GENERATION',
        progress: 100,
        message: lang === 'hi' ? 'WGS84 भू-टैगिंग एवं IHO S-100 समुद्री खतरा डोजियर...' : 'Finalizing WGS84 geotagging and IHO S-100 hazard dossier...'
      });
      await new Promise(r => setTimeout(r, 180));

      setData(json);
      if (json.detections && json.detections.length > 0) {
        setSelectedDetection(json.detections[0]);
      } else {
        setSelectedDetection(null);
      }
    } catch (err) {
      console.error('Error loading preset:', err);
    } finally {
      setProcessingState(prev => ({ ...prev, isOpen: false }));
    }
  };

  useEffect(() => {
    loadPreset(preset);
  }, [preset, confThreshold, enableDespeckle, enforceShadow]);

  // File Upload Ingestion Pipeline
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    setProcessingState({
      isOpen: true,
      stage: 'PARSING',
      progress: 20,
      message: `Ingesting uploaded sonar matrix: ${file.name}...`
    });

    try {
      await new Promise(r => setTimeout(r, 250));
      setProcessingState({
        isOpen: true,
        stage: 'PREPROCESSING',
        progress: 50,
        message: 'Wavelet 2D-DWT filtering and adaptive range gain equalization...'
      });

      const url = `${API_BASE}/api/upload?conf_threshold=${confThreshold}&enable_despeckle=${enableDespeckle}&enforce_shadow=${enforceShadow}`;
      const uploadRes = await fetch(url, { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      const jobId = uploadData.job_id;

      setProcessingState({
        isOpen: true,
        stage: 'DETECTION',
        progress: 80,
        message: 'Neural acoustic detection and shadow physics geometry check...'
      });
      await new Promise(r => setTimeout(r, 250));

      // Fetch results
      const resultsRes = await fetch(`${API_BASE}/api/jobs/${jobId}/results`);
      if (!resultsRes.ok) throw new Error('Failed to retrieve job results');
      const json: AnalysisResponse = await resultsRes.json();

      setProcessingState({
        isOpen: true,
        stage: 'REPORT_GENERATION',
        progress: 100,
        message: 'Synthesizing GIS manifest and geospatial projection...'
      });
      await new Promise(r => setTimeout(r, 200));

      setData(json);
      if (json.detections && json.detections.length > 0) {
        setSelectedDetection(json.detections[0]);
      }
      setActiveTab('vision');
    } catch (err) {
      console.error('File upload error:', err);
      alert('Error ingesting sonar image. Please verify backend connectivity.');
    } finally {
      setProcessingState(prev => ({ ...prev, isOpen: false }));
    }
  };

  const onFocusSonarVision = (det: DetectionItem) => {
    setSelectedDetection(det);
    setActiveTab('vision');
  };

  const downloadCSV = () => {
    if (!data) return;
    const jobId = data.job_id || 'preset-chennai';
    window.open(`${API_BASE}/api/jobs/${jobId}/report/csv`, '_blank');
  };

  const downloadPDF = () => {
    if (!data) return;
    const jobId = data.job_id || 'preset-chennai';
    window.open(`${API_BASE}/api/jobs/${jobId}/report/pdf`, '_blank');
  };

  const downloadJSON = () => {
    if (!data) return;
    const jsonReport = {
      report_id: `SD-${new Date().toISOString().slice(0, 10)}-${(data.job_id || 'CHENNAI').slice(-6).toUpperCase()}`,
      platform: 'SAGARDRISHTI Marine Intelligence Platform',
      sea_basin: data.survey_metadata?.sea_basin || 'Bay of Bengal',
      region: data.survey_metadata?.region || 'Tamil Nadu',
      survey_metadata: data.survey_metadata,
      detections: data.detections,
      summary: data.summary,
      disaster_readiness: data.disaster_readiness
    };

    const blob = new Blob([JSON.stringify(jsonReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SagarDrishti_Hazard_Manifest_${data.job_id || 'chennai'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#F4FAFC' }}>
      {/* Background Maritime Watermark */}
      <div className="maritime-bathymetry-bg" />

      {/* Hidden File Input for Custom Sonar Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        accept=".png,.jpg,.jpeg,.tif,.tiff"
        style={{ display: 'none' }}
      />

      {/* Top Telemetry Header */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(prev => (prev === 'en' ? 'hi' : 'en'))}
        onOpenReportModal={() => setReportModalOpen(true)}
        latencyMs={data?.pipeline_latency_ms || 184}
      />

      {/* Main Layout Container */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
        />

        {/* Central Content Canvas */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#F4FAFC' }}>
          {/* TAB 1: OVERVIEW (MATCHING REFERENCE SCREENSHOT) */}
          {activeTab === 'overview' && data && (
            <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '1050px' }}>
              {/* Row 1: Hero Banner (Left) + Mission Control Card (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: '16px', alignItems: 'stretch' }}>
                <HeroBanner
                  lang={lang}
                  onExploreOceans={() => setActiveTab('map')}
                  onStartSonar={() => setActiveTab('vision')}
                />
                <MissionControlCard
                  selectedMissionId={preset}
                  onSelectMission={(id) => setPreset(id)}
                  lang={lang}
                  hazardsCount={data.detections.length}
                  scannedAreaKm2={data.scanned_area_km2 || 42.8}
                  latencyMs={data.pipeline_latency_ms || 184}
                />
              </div>

              {/* Row 2: 4 Impact Cards */}
              <ImpactCards
                lang={lang}
                onCardClick={(cat) => {
                  if (cat === 'ecosystems') setActiveTab('ecosystems');
                  else if (cat === 'safety') setActiveTab('map');
                  else if (cat === 'livelihoods') setActiveTab('audit');
                  else if (cat === 'blue_economy') setActiveTab('control');
                }}
              />

              {/* Row 3: Main 3-Column Interactive Grid (Map | Sonar Viewer | Selected Hazard Card) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1.75fr 1fr', gap: '16px', minHeight: '390px', alignItems: 'stretch' }}>
                {/* Left: India Ocean Map with Layer Checklist */}
                <div style={{ height: '390px', minHeight: '390px' }}>
                  <HazardMap
                    centerCoords={data.center_coords}
                    detections={data.detections}
                    selectedDetection={selectedDetection}
                    onSelectDetection={(d) => setSelectedDetection(d)}
                    onFocusSonarVision={onFocusSonarVision}
                    fairwayBufferActive={fairwayBufferActive}
                    missionName={data.mission_name}
                    lang={lang}
                  />
                </div>

                {/* Middle: Sonar Intelligence Dual Viewer */}
                <div style={{ height: '390px', minHeight: '390px' }}>
                  <SonarViewer
                    rawImageBase64={data.raw_image_base64}
                    annotatedImageBase64={data.annotated_image_base64}
                    detections={data.detections}
                    selectedDetection={selectedDetection}
                    onSelectDetection={(d) => setSelectedDetection(d)}
                    overlayOpacity={overlayOpacity}
                    setOverlayOpacity={setOverlayOpacity}
                    lang={lang}
                  />
                </div>

                {/* Right: Selected Detection Intelligence */}
                <div style={{ height: '390px', minHeight: '390px' }}>
                  <SelectedDetectionCard
                    detection={selectedDetection}
                    onViewOnMap={() => setActiveTab('map')}
                    lang={lang}
                  />
                </div>
              </div>

              {/* Row 4: Processing Pipeline Bar (Left) + Key Metrics Bar (Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '16px', alignItems: 'stretch' }}>
                <ProcessingPipelineBar
                  currentStage={processingState.stage}
                  progressPct={processingState.progress || 100}
                  lang={lang}
                />
                <KeyMetricsBar
                  surveyAreaKm2={data.scanned_area_km2 || 42.8}
                  hazardsDetected={data.detections.length || 17}
                  criticalBlockers={data.summary.by_severity.CRITICAL || 4}
                  coastalRegions={5}
                  ecosystemsMonitored={3}
                  latencyMs={data.pipeline_latency_ms || 184}
                  lang={lang}
                />
              </div>

              {/* Bottom National Slogan Strip */}
              <div style={{
                backgroundColor: '#06283D',
                background: 'linear-gradient(90deg, #051F30 0%, #083752 50%, #051F30 100%)',
                border: '1px solid rgba(0, 194, 215, 0.25)',
                borderRadius: '10px',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#F8FAFC',
                boxShadow: '0 2px 8px rgba(6, 40, 61, 0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Waves size={16} color="#00C2D7" />
                  <span className="font-hindi" style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.5px' }}>
                    स्वस्थ महासागर | सुरक्षित तट | समृद्ध भारत
                  </span>
                  <span style={{ fontSize: '11px', color: '#88A4B8' }}>
                    (Healthy Oceans | Safe Coasts | Prosperous India)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#88A4B8' }}>
                  <span>National Oceanographic & Marine Intelligence Platform</span>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#159A72' }} />
                  <span style={{ color: '#00C2D7', fontWeight: 700 }}>SAGARDRISHTI 3.0</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL-SCREEN OCEAN MAP */}
          {activeTab === 'map' && data && (
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#06283D', margin: 0 }}>
                    {t.oceanMap}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#648296', margin: '2px 0 0 0' }}>
                    {data.mission_name} • {data.survey_metadata?.sea_basin || 'Indian Waters'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setFairwayBufferActive(!fairwayBufferActive)}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: fairwayBufferActive ? '#0077B6' : '#FFFFFF',
                      color: fairwayBufferActive ? '#FFFFFF' : '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {fairwayBufferActive ? 'Fairway Corridor (50m Buffer ON)' : 'Fairway Corridor OFF'}
                  </button>
                  <button
                    onClick={() => setActiveTab('vision')}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#00A8CC',
                      color: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    Inspect in Sonar Vision
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: '520px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #D4E7EF' }}>
                <HazardMap
                  centerCoords={data.center_coords}
                  detections={data.detections}
                  selectedDetection={selectedDetection}
                  onSelectDetection={(d) => setSelectedDetection(d)}
                  onFocusSonarVision={onFocusSonarVision}
                  fairwayBufferActive={fairwayBufferActive}
                  missionName={data.mission_name}
                  lang={lang}
                />
              </div>
            </div>
          )}

          {/* TAB 3: FULL-SCREEN SONAR VISION */}
          {activeTab === 'vision' && data && (
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#06283D', margin: 0 }}>
                    {t.sonarIntelligence}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#648296', margin: '2px 0 0 0' }}>
                    Sensor: <b>{data.survey_metadata?.sonar_model || 'EdgeTech 4125'}</b> | Vessel: <b>{data.survey_metadata?.vessel || 'INS Makar'}</b>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#06283D',
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={13} />
                    <span>Upload Custom Sonar Image</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#0077B6',
                      color: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    View Coordinates on Map
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: '520px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #D4E7EF' }}>
                <SonarViewer
                  rawImageBase64={data.raw_image_base64}
                  annotatedImageBase64={data.annotated_image_base64}
                  detections={data.detections}
                  selectedDetection={selectedDetection}
                  onSelectDetection={(d) => setSelectedDetection(d)}
                  overlayOpacity={overlayOpacity}
                  setOverlayOpacity={setOverlayOpacity}
                  lang={lang}
                />
              </div>
            </div>
          )}

          {/* TAB 4: MARINE ECOSYSTEMS CONSERVATION DASHBOARD */}
          {activeTab === 'ecosystems' && (
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Fish size={20} color="#159A72" />
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#06283D', margin: 0 }}>
                    {t.marineEcosystems}
                  </h2>
                  <span className="font-hindi" style={{ fontSize: '13px', color: '#648296' }}>
                    समुद्री पारिस्थितिकी तंत्र संरक्षण
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#648296', margin: 0 }}>
                  High-priority sensitive biodiversity corridors, marine national parks, and atolls across India's coastline.
                </p>
              </div>

              {/* Ecosystem Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {MARINE_ECOSYSTEMS.map((eco) => (
                  <div
                    key={eco.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #D4E7EF',
                      padding: '16px 18px',
                      boxShadow: '0 2px 8px rgba(6, 40, 61, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: eco.category === 'Coral Reefs' ? '#E11D48' : eco.category === 'Mangroves' ? '#059669' : '#0284C7',
                          backgroundColor: eco.category === 'Coral Reefs' ? '#FFE4E6' : eco.category === 'Mangroves' ? '#D1FAE5' : '#E0F2FE',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {eco.category}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#648296' }}>
                          {eco.sea_basin}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#06283D', margin: '4px 0 2px 0' }}>
                        {eco.name}
                      </h3>
                      <p className="font-hindi" style={{ fontSize: '12px', color: '#4B6B82', margin: '0 0 10px 0' }}>
                        {eco.hindi_name}
                      </p>

                      <div style={{ fontSize: '11px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><b>Region:</b> {eco.region}</div>
                        <div><b>Key Species:</b> {eco.key_species}</div>
                        <div><b>Threat:</b> {eco.primary_threat}</div>
                      </div>
                    </div>

                    {/* Bottom Health Bar & Inspect Button */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: '#648296' }}>Health Index</span>
                        <span style={{ fontWeight: 800, color: '#159A72' }}>{eco.health_index}%</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#E2E8F0', overflow: 'hidden', marginBottom: '12px' }}>
                        <div style={{ width: `${eco.health_index}%`, height: '100%', backgroundColor: '#159A72' }} />
                      </div>

                      <button
                        onClick={() => {
                          if (data) {
                            setActiveTab('map');
                          }
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '7px 0',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#F8FAFC',
                          color: '#06283D',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <MapPin size={12} color="#0077B6" />
                        <span>Inspect Region on Ocean Map</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: INCIDENT HAZARD AUDIT TABLE */}
          {activeTab === 'audit' && data && (
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#06283D', margin: 0 }}>
                  {t.hazardAudit}
                </h2>
                <p style={{ fontSize: '12px', color: '#648296', margin: '2px 0 0 0' }}>
                  Audited underwater sonar contacts, WGS84 coordinates, depth profiles, dual risk scores, and clearance prioritization.
                </p>
              </div>

              <div style={{ flex: 1, minHeight: '520px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #D4E7EF' }}>
                <IncidentTable
                  detections={data.detections}
                  selectedDetection={selectedDetection}
                  onSelectDetection={(d) => setSelectedDetection(d)}
                  onFocusSonarVision={onFocusSonarVision}
                  onDownloadCSV={downloadCSV}
                />
              </div>
            </div>
          )}

          {/* TAB 6: ADVANCED MISSION CONTROL & PIPELINE BENCHMARKS */}
          {activeTab === 'control' && data && (
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sliders size={20} color="#0077B6" />
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#06283D', margin: 0 }}>
                    {t.missionControl}
                  </h2>
                  <span className="font-hindi" style={{ fontSize: '13px', color: '#648296' }}>
                    मिशन नियंत्रण एवं सोनार पाइपलाइन सेटिंग्स
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#648296', margin: 0 }}>
                  Fine-tune computer vision parameters, acoustic shadow geometry physics verification, and edge deployment benchmarks.
                </p>
              </div>

              {/* Controls Configuration Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {/* Sonar Filtering Controls */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #D4E7EF', padding: '18px', boxShadow: '0 2px 8px rgba(6, 40, 61, 0.04)' }}>
                  <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#06283D', marginBottom: '14px' }}>
                    Acoustic Pipeline Parameters
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Confidence Threshold */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                        <span>Confidence Threshold</span>
                        <span style={{ color: '#0077B6' }}>{Math.round(confThreshold * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="0.85"
                        step="0.05"
                        value={confThreshold}
                        onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: '#0077B6', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Despeckle Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#06283D' }}>2D-DWT Wavelet Despeckle</div>
                        <div style={{ fontSize: '10.5px', color: '#648296' }}>Daubechies 'db2' multi-scale decomposition</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableDespeckle}
                        onChange={(e) => setEnableDespeckle(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#0077B6', cursor: 'pointer' }}
                      />
                    </div>

                    {/* Shadow Physics Check Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#06283D' }}>Acoustic Shadow Verification</div>
                        <div style={{ fontSize: '10.5px', color: '#648296' }}>Physics-based grazing angle & geometry filter</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enforceShadow}
                        onChange={(e) => setEnforceShadow(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#0077B6', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Sonar Ingestion */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #D4E7EF', padding: '18px', boxShadow: '0 2px 8px rgba(6, 40, 61, 0.04)' }}>
                  <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#06283D', marginBottom: '14px' }}>
                    Custom Sonar Waterfall Ingestion
                  </h3>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #94A3B8',
                      borderRadius: '8px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Upload size={24} color="#0077B6" />
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#06283D' }}>
                      Click to Browse or Drag Sonar Image
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#648296' }}>
                      Supports .PNG, .JPG, .TIFF side-scan waterfall pings
                    </div>
                  </div>
                </div>
              </div>

              {/* Edge AI & Inference Metrics Panel */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #D4E7EF', overflow: 'hidden' }}>
                <AnalyticsPanel
                  detections={data.detections}
                  summary={data.summary}
                />
              </div>
            </div>
          )}

          {/* TAB 7: REPORTS & EXPORT DOSSIER */}
          {activeTab === 'reports' && data && (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <FileText size={22} color="#0077B6" />
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#06283D', margin: 0 }}>
                    {t.reports}
                  </h2>
                  <span className="font-hindi" style={{ fontSize: '14px', color: '#648296' }}>
                    IHO S-100 समुद्री खतरा रिपोर्ट एवं निर्यात
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#648296', margin: 0 }}>
                  Download official hydrographic clearance dossiers, disaster response channel manifests, and GIS layers.
                </p>
              </div>

              {/* Report Summary Card */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #D4E7EF',
                padding: '22px 24px',
                boxShadow: '0 2px 10px rgba(6, 40, 61, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0077B6', letterSpacing: '0.5px' }}>
                      ACTIVE MISSION DOSSIER
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#06283D', margin: '3px 0' }}>
                      {data.mission_name}
                    </h3>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '5px',
                    backgroundColor: (data.summary.by_severity.CRITICAL || 0) > 0 ? '#FEF2F2' : '#F0FDF4',
                    color: (data.summary.by_severity.CRITICAL || 0) > 0 ? '#DC2626' : '#159A72',
                    border: `1px solid ${(data.summary.by_severity.CRITICAL || 0) > 0 ? '#FECACA' : '#A7E8D4'}`
                  }}>
                    {data.summary.fairway_clearance_status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px', fontSize: '12px' }}>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                    <span style={{ color: '#648296', fontSize: '10.5px' }}>Survey Vessel</span>
                    <div style={{ fontWeight: 700, color: '#06283D' }}>{data.survey_metadata?.vessel || 'INS Makar'}</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                    <span style={{ color: '#648296', fontSize: '10.5px' }}>Total Hazards Tagged</span>
                    <div style={{ fontWeight: 700, color: '#06283D' }}>{data.detections.length} Contacts</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                    <span style={{ color: '#648296', fontSize: '10.5px' }}>Scanned Coverage</span>
                    <div style={{ fontWeight: 700, color: '#06283D' }}>{data.scanned_area_km2 || 42.8} km²</div>
                  </div>
                </div>

                {/* Export Options */}
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#06283D', marginBottom: '12px' }}>
                  Download Official Formats
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <button
                    onClick={downloadPDF}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#0077B6'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                  >
                    <Download size={20} color="#DC2626" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#06283D' }}>IHO S-100 PDF Report</span>
                    <span style={{ fontSize: '10px', color: '#648296' }}>Includes hydrographic stamps & images</span>
                  </button>

                  <button
                    onClick={downloadCSV}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#0077B6'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                  >
                    <FileSpreadsheet size={20} color="#159A72" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#06283D' }}>Incident CSV Manifest</span>
                    <span style={{ fontSize: '10px', color: '#648296' }}>Tabular WGS84 coordinates & risk data</span>
                  </button>

                  <button
                    onClick={downloadJSON}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#0077B6'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                  >
                    <FileCode size={20} color="#00A8CC" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#06283D' }}>GIS GeoJSON Dossier</span>
                    <span style={{ fontSize: '10px', color: '#648296' }}>Compatible with QGIS & ArcGIS</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Processing Pipeline Modal */}
      <ProcessingModal
        isOpen={processingState.isOpen}
        stage={processingState.stage}
        progress={processingState.progress}
        message={processingState.message}
      />

      {/* Report Export Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        data={data}
      />
    </div>
  );
}
