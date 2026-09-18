import io
from datetime import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(report_data: Dict[str, Any]) -> bytes:
    """Builds a formatted environmental report PDF using ReportLab."""
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
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1b4332')
    )
    subtitle_style = ParagraphStyle(
        'SubTitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#2d6a4f')
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#2b2d42')
    )
    notice_style = ParagraphStyle(
        'NoticeStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#6c757d')
    )

    story = []

    # Title & Branding
    story.append(Paragraph("DARUKAA.EARTH", header_style))
    story.append(Paragraph("Geospatial Carbon & Biodiversity Intelligence Platform", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2d6a4f"), spaceBefore=5, spaceAfter=15))

    # Report Meta
    title = report_data.get("title", "Environmental Analytics Report")
    story.append(Paragraph(f"<b>Report:</b> {title}", styles['Heading2']))
    story.append(Paragraph(f"<b>Generated:</b> {datetime.utcnow().strftime('%B %d, %Y %H:%M UTC')}", body_style))
    story.append(Paragraph(f"<b>Project/Site:</b> {report_data.get('target_name', 'Western Ghats Sector A')}", body_style))
    story.append(Spacer(1, 15))

    # Section 1: Measured Data
    story.append(Paragraph("1. OBSERVED IN-SITU & SATELLITE MEASUREMENTS", styles['Heading3']))
    metrics = report_data.get("metrics", {})
    table_data = [
        ["Parameter", "Measured Value", "Unit / Scale", "Data Type"],
        ["NDVI Vegetation Index", f"{metrics.get('ndvi', 0.62)}", "-1.0 to +1.0", "Remote Sensing"],
        ["Live Biomass Carbon", f"{metrics.get('carbon_stock', 124)}", "tC / hectare", "Model Calibration"],
        ["Soil Organic Carbon", f"{metrics.get('soil_organic_carbon', 1.4)}", "% topsoil mass", "Soil Telemetry"],
        ["Soil Moisture", f"{metrics.get('soil_moisture', 28)}", "% volumetric", "Soil Sensor"],
        ["Water Stress Index", f"{metrics.get('water_stress', 38)}", "% stress level", "Evapotranspiration Index"],
        ["Biodiversity Score", f"{metrics.get('biodiversity_score', 74)}", "0 to 100", "Species Index"]
    ]

    t = Table(table_data, colWidths=[2.2 * inch, 1.5 * inch, 1.5 * inch, 1.5 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2d6a4f")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f8f9fa")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    # Section 2: Calculated Indicators
    story.append(Paragraph("2. COMPOSITE ENVIRONMENTAL HEALTH SCORE", styles['Heading3']))
    health = report_data.get("health_score", {})
    score_val = health.get("overall_score", 72)
    story.append(Paragraph(f"<b>Composite Index:</b> {score_val} / 100 (Weighted Demo Index)", body_style))
    story.append(Paragraph("<i>Weighting breakdown: Biodiversity 30%, Vegetation 20%, Carbon 20%, Soil 15%, Water 15%</i>", notice_style))
    story.append(Spacer(1, 15))

    # Section 3: AI Intelligence & Recommendations
    story.append(Paragraph("3. GEMINI AI EVIDENCE-GROUNDED SYNTHESIS", styles['Heading3']))
    summary_text = report_data.get("ai_summary", "Site demonstrates robust vegetative vigor with balanced seasonal water stress.")
    story.append(Paragraph(f"<b>Executive Summary:</b> {summary_text}", body_style))
    story.append(Spacer(1, 10))

    recs = report_data.get("recommendations", [
        "Maintain current perimeter protection and assisted natural regeneration.",
        "Initiate contour bunding prior to monsoon peak to boost topsoil moisture retention."
    ])
    story.append(Paragraph("<b>Recommended Interventions:</b>", body_style))
    for r in recs:
        story.append(Paragraph(f"• {r}", body_style))
    story.append(Spacer(1, 20))

    # Scientific Disclaimers & Grounding
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#adb5bd"), spaceBefore=5, spaceAfter=8))
    story.append(Paragraph("<b>Data Grounding & Uncertainty Statement:</b> Measured in-situ parameters are derived from synthetic demonstration telemetry. Calculations distinguish observed values from model estimations. AI interpretations are hypotheses intended for advisory review by ecological managers.", notice_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
