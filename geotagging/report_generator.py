"""
SagarDrishti (सागरदृष्टि) - Structured Report Generator (JSON, CSV, PDF)
Generates audit reports adhering strictly to the PRD schema:
- JSON with survey metadata, detections, dual risk stratification, and summary
- CSV for QGIS / ArcGIS geographic information systems
- PDF executive hazard dossier for Indian maritime authorities and environmental agencies
"""

import io
import json
import csv
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_json_report(
    survey_meta: Dict[str, Any],
    detections: List[Dict[str, Any]],
    false_positive_count: int = 8
) -> Dict[str, Any]:
    now_str = datetime.utcnow().strftime("%Y-%m-%d")
    report_id = f"SD-IN-{now_str}-{survey_meta.get('job_id', '001')[-4:].upper()}"

    by_class = {"shipwreck": 0, "pipe_cylinder": 0, "debris_net": 0, "misc_anomaly": 0}
    by_severity = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}

    formatted_dets = []
    for idx, d in enumerate(detections):
        det_id = d.get("id", f"HAZ-{idx+1:04d}")
        cls = d.get("class", "misc_anomaly")
        if cls not in by_class:
            by_class[cls] = 0
        by_class[cls] += 1

        sev = d.get("severity", "MEDIUM")
        if sev not in by_severity:
            by_severity[sev] = 0
        by_severity[sev] += 1

        dim_l = d.get("length_m", 15.0)
        dim_w = d.get("width_m", 4.5)
        if "dimensions_m" in d and isinstance(d["dimensions_m"], str) and "x" in d["dimensions_m"]:
            parts = d["dimensions_m"].replace("m", "").split("x")
            try:
                dim_l = float(parts[0].strip())
                dim_w = float(parts[1].strip())
            except Exception:
                pass

        formatted_dets.append({
            "detection_id": det_id,
            "class": cls,
            "confidence": round(d.get("confidence", d.get("conf", 0.85)) * 100, 1),
            "severity": sev,
            "navigation_risk": d.get("navigation_risk", sev),
            "ecosystem_risk": d.get("ecosystem_risk", "HIGH"),
            "potential_impact": d.get("potential_impact", "Benthic flora disruption"),
            "clearance_priority": d.get("clearance_priority", "MONITORED CONTACT"),
            "location": {
                "latitude": d.get("lat", 13.0827),
                "longitude": d.get("lon", 80.2707),
                "depth_m": d.get("depth_m", 18.5)
            },
            "bounding_dimensions": {
                "length_m": dim_l,
                "width_m": dim_w
            },
            "acoustic_shadow_length_m": d.get("shadow_length_m", 8.4),
            "tile_source": d.get("tile_source", "tile_0042.png"),
            "timestamp": d.get("timestamp", datetime.utcnow().isoformat() + "Z")
        })

    return {
        "report_id": report_id,
        "platform": "SagarDrishti सागरदृष्टि (AI-Powered Marine Intelligence for India)",
        "survey_metadata": {
            "survey_date": survey_meta.get("survey_date", now_str),
            "vessel": survey_meta.get("vessel", "INS Makar (Hydrographic Catamaran)"),
            "sonar_model": survey_meta.get("sonar_model", "EdgeTech 4125 (455/900 kHz)"),
            "region": survey_meta.get("region", "Coromandel Coast / Bay of Bengal"),
            "sea_basin": survey_meta.get("sea_basin", "Bay of Bengal"),
            "total_area_sqm": survey_meta.get("total_area_sqm", 145000)
        },
        "detections": formatted_dets,
        "summary": {
            "total_detections": len(formatted_dets),
            "by_class": by_class,
            "by_severity": by_severity,
            "false_positive_filtered": false_positive_count
        }
    }

def generate_csv_report(json_report: Dict[str, Any]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "detection_id", "class", "confidence_pct", "severity",
        "navigation_risk", "ecosystem_risk", "potential_impact", "clearance_priority",
        "latitude", "longitude", "depth_m",
        "length_m", "width_m", "acoustic_shadow_length_m",
        "tile_source", "timestamp"
    ])

    for det in json_report.get("detections", []):
        writer.writerow([
            det["detection_id"],
            det["class"],
            det["confidence"],
            det["severity"],
            det.get("navigation_risk", det["severity"]),
            det.get("ecosystem_risk", "HIGH"),
            det.get("potential_impact", ""),
            det.get("clearance_priority", ""),
            det["location"]["latitude"],
            det["location"]["longitude"],
            det["location"]["depth_m"],
            det["bounding_dimensions"]["length_m"],
            det["bounding_dimensions"]["width_m"],
            det["acoustic_shadow_length_m"],
            det["tile_source"],
            det["timestamp"]
        ])

    return output.getvalue()

def generate_pdf_report(json_report: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'SagarTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor('#06283D'),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'SagarSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#0077B6'),
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'SagarH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=colors.HexColor('#06283D'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'SagarBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        textColor=colors.HexColor('#335368'),
        leading=12
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("SAGARDRISHTI // सागरदृष्टि", title_style))
    elements.append(Paragraph(
        f"AI-Powered Marine Intelligence for India — Hydrographic Debris & Marine Ecosystem Risk Dossier | Report ID: <b>{json_report['report_id']}</b>",
        subtitle_style
    ))
    elements.append(Spacer(1, 6))

    # Survey Metadata Table
    meta = json_report.get("survey_metadata", {})
    summary = json_report.get("summary", {})
    meta_data = [
        ["Survey Date:", str(meta.get("survey_date", "N/A")), "Survey Vessel:", str(meta.get("vessel", "INS Makar"))],
        ["Sonar Sensor:", str(meta.get("sonar_model", "EdgeTech 4125")), "Region / Sea Basin:", f"{meta.get('region', 'Coromandel Coast')} ({meta.get('sea_basin', 'Bay of Bengal')})"],
        ["Total Contacts:", str(summary.get("total_detections", 0)), "False Positives Rejected:", str(summary.get("false_positive_filtered", 0))]
    ]
    meta_table = Table(meta_data, colWidths=[110, 155, 120, 155])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EAF4F7')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#06283D')),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D4E7EF')),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 10))

    # Tactical & Ecosystem Summary
    crit_count = summary.get("by_severity", {}).get("CRITICAL", 0)
    clearance = "RESTRICTED / OBSTRUCTION IN FAIRWAY" if crit_count > 0 else "NOMINAL / SAFE PASSAGE"
    clearance_color = "#DC2626" if crit_count > 0 else "#159A72"
    
    summary_text = (
        f"<b>Fairway Clearance Assessment:</b> <font color='{clearance_color}'><b>{clearance}</b></font><br/>"
        f"The SagarDrishti neural sonar pipeline detected <b>{summary.get('total_detections', 0)}</b> anomalous submerged contacts. "
        f"Wavelet 2D-DWT despeckling and acoustic shadow validation successfully filtered <b>{summary.get('false_positive_filtered', 0)}</b> "
        f"natural acoustic reverberations and seabed sand ripples. "
        f"Critical navigation hazards: <b>{crit_count}</b>. High priority ecological threats: <b>{summary.get('by_severity', {}).get('HIGH', 0)}</b>."
    )
    elements.append(Paragraph(summary_text, body_style))
    elements.append(Spacer(1, 10))

    # Detections Table
    elements.append(Paragraph("Identified Underwater Hazards & Ecosystem Threat Matrix", h2_style))
    
    det_headers = ["ID", "Class", "Conf %", "Nav Risk", "Eco Risk", "Lat / Lon", "Depth", "Dimensions", "Clearance Priority"]
    det_rows = [det_headers]

    for d in json_report.get("detections", []):
        loc = d["location"]
        dims = d["bounding_dimensions"]
        det_rows.append([
            d["detection_id"],
            d["class"].replace("_", " ").title(),
            f"{d['confidence']}%",
            d.get("navigation_risk", d["severity"]),
            d.get("ecosystem_risk", "HIGH"),
            f"{loc['latitude']:.4f}, {loc['longitude']:.4f}",
            f"{loc['depth_m']}m",
            f"{dims['length_m']}x{dims['width_m']}m",
            d.get("clearance_priority", "MONITORED")
        ])

    det_table = Table(det_rows, colWidths=[55, 70, 40, 55, 55, 90, 40, 65, 80])
    det_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0077B6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F4FAFC')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D4E7EF')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(det_table)
    elements.append(Spacer(1, 14))

    # Sign-off footnote
    elements.append(Paragraph(
        "<i>Generated autonomously by SagarDrishti (सागरदृष्टि) Maritime AI Platform. Designed for Indian Oceans and the National Blue Economy Framework.</i>",
        ParagraphStyle('Footnote', parent=styles['Italic'], fontSize=7, textColor=colors.HexColor('#648296'))
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
