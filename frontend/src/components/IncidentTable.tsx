import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  CheckCircle2, 
  Eye
} from 'lucide-react';
import type { DetectionItem } from '../types';

interface IncidentTableProps {
  detections: DetectionItem[];
  selectedDetection: DetectionItem | null;
  onSelectDetection: (det: DetectionItem) => void;
  onFocusSonarVision: (det: DetectionItem) => void;
  onDownloadCSV: () => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  detections,
  selectedDetection,
  onSelectDetection,
  onFocusSonarVision,
  onDownloadCSV
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof DetectionItem>('confidence');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredDetections = useMemo(() => {
    return detections.filter(d => {
      const matchSearch = d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = classFilter === 'all' || d.class_name === classFilter;
      const matchSeverity = severityFilter === 'all' || d.severity === severityFilter;
      return matchSearch && matchClass && matchSeverity;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
  }, [detections, searchTerm, classFilter, severityFilter, sortField, sortAsc]);

  const handleSort = (field: keyof DetectionItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' };
      case 'HIGH':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' };
      case 'MEDIUM':
        return { bg: '#FEFCE8', border: '#FEF08A', text: '#CA8A04' };
      default:
        return { bg: '#F0FDFA', border: '#99F6E4', text: '#0D9488' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF' }}>
      {/* Header & Filter Toolbar */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#F8FAFC'
      }}>
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '240px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '6px 10px',
            width: '100%'
          }}>
            <Search size={14} color="#64748B" />
            <input
              type="text"
              placeholder="Search by ID, class, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                width: '100%',
                color: '#1E293B'
              }}
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} color="#64748B" />
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CLASS:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={{
                padding: '5px 8px',
                borderRadius: '5px',
                border: '1px solid #CBD5E1',
                fontSize: '11px',
                color: '#1E293B',
                outline: 'none'
              }}
            >
              <option value="all">All Classes</option>
              <option value="shipwreck">Shipwreck</option>
              <option value="pipe_cylinder">Pipe / Cylinder</option>
              <option value="debris_net">Debris / Net</option>
              <option value="misc_anomaly">Misc Anomaly</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>SEVERITY:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                padding: '5px 8px',
                borderRadius: '5px',
                border: '1px solid #CBD5E1',
                fontSize: '11px',
                color: '#1E293B',
                outline: 'none'
              }}
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <button
            onClick={onDownloadCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Download size={13} color="#0284C7" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Incident Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>
                <button
                  onClick={() => handleSort('id')}
                  style={{ background: 'none', border: 'none', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <span>ID</span>
                  <ArrowUpDown size={11} />
                </button>
              </th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>Class</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>
                <button
                  onClick={() => handleSort('confidence')}
                  style={{ background: 'none', border: 'none', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <span>Confidence</span>
                  <ArrowUpDown size={11} />
                </button>
              </th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>Severity</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>WGS84 Coordinates</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>Depth</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>Dimensions</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>Shadow Gate</th>
              <th style={{ padding: '10px 14px', fontWeight: 700 }}>Clearance Status</th>
              <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDetections.map((det) => {
              const isSelected = selectedDetection?.id === det.id;
              const badge = getSeverityBadge(det.severity);
              const isBlocked = det.severity === 'CRITICAL';

              return (
                <tr
                  key={det.id}
                  onClick={() => onSelectDetection(det)}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#E0F2FE' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* ID */}
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0369A1' }} className="font-mono">
                    {det.id}
                  </td>

                  {/* Class */}
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A' }}>
                    {det.label || det.class_name}
                  </td>

                  {/* Confidence */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-mono" style={{ fontWeight: 700, color: '#0F172A' }}>
                        {det.confidence}%
                      </span>
                      <div style={{ width: '40px', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${det.confidence}%`, height: '100%', backgroundColor: '#0284C7' }} />
                      </div>
                    </div>
                  </td>

                  {/* Severity */}
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      backgroundColor: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {det.severity}
                    </span>
                  </td>

                  {/* Coordinates */}
                  <td style={{ padding: '12px 14px', color: '#475569' }} className="font-mono">
                    {det.lat.toFixed(4)}°, {det.lon.toFixed(4)}°
                  </td>

                  {/* Depth */}
                  <td style={{ padding: '12px 14px', color: '#0284C7', fontWeight: 600 }} className="font-mono">
                    {det.depth_m}m
                  </td>

                  {/* Dimensions */}
                  <td style={{ padding: '12px 14px', color: '#334155' }} className="font-mono">
                    {det.dimensions_m}
                  </td>

                  {/* Shadow Gate */}
                  <td style={{ padding: '12px 14px' }}>
                    {det.shadow_verified ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                        <CheckCircle2 size={13} />
                        <span>VERIFIED ({det.acoustic_shadow_length_m}m)</span>
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '11px' }}>UNCONFIRMED</span>
                    )}
                  </td>

                  {/* Clearance Status */}
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isBlocked ? '#DC2626' : '#16A34A'
                    }}>
                      {isBlocked ? 'OBSTRUCTING FAIRWAY' : 'CLEARABLE'}
                    </span>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFocusSonarVision(det);
                      }}
                      style={{
                        backgroundColor: '#E0F2FE',
                        color: '#0369A1',
                        border: '1px solid #BAE6FD',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredDetections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', fontSize: '13px' }}>
            No hazard detections match the current filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
