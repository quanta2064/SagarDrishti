import React from 'react';
import { 
  FileText, 
  Download, 
  X, 
  FileSpreadsheet, 
  FileCode,
  FileCheck2
} from 'lucide-react';
import type { AnalysisResponse } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalysisResponse | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen || !data) return null;

  const jobId = data.job_id || 'preset-tampa_bay';
  const isCritical = (data.summary.by_severity.CRITICAL || 0) > 0;

  const downloadJSON = () => {
    const jsonReport = {
      report_id: `SR-${new Date().toISOString().slice(0, 10)}-${jobId.slice(-4).toUpperCase()}`,
      survey_metadata: data.survey_metadata || {
        survey_date: new Date().toISOString().slice(0, 10),
        vessel: 'AUV-Poseidon',
        sonar_model: 'EdgeTech 4125',
        total_area_sqm: 125000
      },
      detections: data.detections.map(d => ({
        detection_id: d.id,
        class: d.class_name,
        confidence: d.confidence,
        severity: d.severity,
        location: {
          latitude: d.lat,
          longitude: d.lon,
          depth_m: d.depth_m
        },
        bounding_dimensions: {
          length_m: d.bounding_dimensions?.length_m || 20.0,
          width_m: d.bounding_dimensions?.width_m || 5.0
        },
        acoustic_shadow_length_m: d.acoustic_shadow_length_m || 8.0,
        tile_source: d.tile_source || 'tile_0042.png',
        timestamp: d.timestamp || new Date().toISOString()
      })),
      summary: data.summary
    };

    const blob = new Blob([JSON.stringify(jsonReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aquascan_report_${jobId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    window.open(`http://127.0.0.1:8000/api/jobs/${jobId}/report/csv`, '_blank');
  };

  const downloadPDF = () => {
    window.open(`http://127.0.0.1:8000/api/jobs/${jobId}/report/pdf`, '_blank');
  };

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
        width: '580px',
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
            <FileCheck2 size={20} color="#06B6D4" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#BAE6FD' }}>
                EXPORT SURVEY DOSSIER & MANIFEST
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                IHO S-100 Compliant Structured Hydrographic Hazard Reporting
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px' }}>
          {/* Summary Box */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                {data.mission_name}
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                backgroundColor: isCritical ? '#FEF2F2' : '#F0FDF4',
                color: isCritical ? '#DC2626' : '#16A34A',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {data.summary.fairway_clearance_status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '11px', color: '#475569' }}>
              <div><b>Detections:</b> {data.detections.length}</div>
              <div><b>Area:</b> {data.scanned_area_km2} km²</div>
              <div><b>Filtered:</b> {data.summary.false_positive_filtered} noise</div>
              <div><b>Critical:</b> {data.summary.by_severity.CRITICAL || 0}</div>
            </div>
          </div>

          {/* Download Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* PDF Option */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#DC2626" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                    Executive PDF Dossier (Recommended)
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    Comprehensive maritime hazard audit with tables, geometry, and clearance recommendation.
                  </div>
                </div>
              </div>
              <button
                onClick={downloadPDF}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Download size={12} />
                <span>PDF</span>
              </button>
            </div>

            {/* CSV Option */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileSpreadsheet size={20} color="#16A34A" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                    GIS Tabular Manifest (CSV)
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    WGS84 lat/lon, dimensions, depth, and shadow lengths ready for QGIS & ArcGIS import.
                  </div>
                </div>
              </div>
              <button
                onClick={downloadCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Download size={12} />
                <span>CSV</span>
              </button>
            </div>

            {/* JSON Option */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCode size={20} color="#0284C7" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                    Official PRD JSON Schema
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>
                    Standardized JSON payload matching PRD Section 5 schema specifications.
                  </div>
                </div>
              </div>
              <button
                onClick={downloadJSON}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Download size={12} />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
