from typing import Dict, Any
WEIGHTS = {
    "temporal": 0.50,      # 50% - Reuse detection
    "contextual": 0.30,    # 30% - Scene consistency
    "environmental": 0.20  # 20% - Lighting consistency
}
RISK_THRESHOLDS = {
    "LOW": (0, 30),
    "MEDIUM": (30, 70),
    "HIGH": (70, 100)
}
def calculate_signal_score(signal_result: Dict[str, Any]) -> float:

    detected = signal_result.get("detected", False)
    inconsistent = signal_result.get("inconsistent", False)
    confidence = signal_result.get("confidence", 0.0)
    if detected or inconsistent:
        return confidence * 100
    else:
        return 0.0
def aggregate_scores(temporal_result: Dict[str, Any],
                     contextual_result: Dict[str, Any],
                     environmental_result: Dict[str, Any]) -> float:

    temporal_score = calculate_signal_score(temporal_result)
    contextual_score = calculate_signal_score(contextual_result)
    environmental_score = calculate_signal_score(environmental_result)
    weighted_score = (
        temporal_score * WEIGHTS["temporal"] +
        contextual_score * WEIGHTS["contextual"] +
        environmental_score * WEIGHTS["environmental"]
    )
    return max(0.0, min(100.0, weighted_score))
def determine_risk_level(score: float) -> str:

    for level, (min_score, max_score) in RISK_THRESHOLDS.items():
        if min_score <= score < max_score:
            return level
    return "HIGH"
def generate_summary(temporal_result: Dict[str, Any],
                    contextual_result: Dict[str, Any],
                    environmental_result: Dict[str, Any],
                    risk_score: float,
                    risk_level: str) -> str:

    summary_parts = []
    if temporal_result.get("detected"):
        summary_parts.append(
            f"⚠️ Reuse Detection: {temporal_result['details']}"
        )
    else:
        summary_parts.append(
            "✓ No evidence of reused footage detected"
        )
    if contextual_result.get("inconsistent"):
        summary_parts.append(
            f"⚠️ Scene Mismatch: {contextual_result['details']}"
        )
    else:
        summary_parts.append(
            "✓ Video content matches claim context"
        )
    if environmental_result.get("inconsistent"):
        summary_parts.append(
            f"⚠️ Lighting Inconsistency: {environmental_result['details']}"
        )
    else:
        if environmental_result.get("expected_lighting") != "unknown":
            summary_parts.append(
                "✓ Lighting conditions match claimed time"
            )
        else:
            summary_parts.append(
                "○ No time information provided for verification"
            )
    summary_parts.append(f"\nOverall Risk Score: {risk_score:.1f}/100 ({risk_level})")
    if risk_level == "HIGH":
        summary_parts.append(
            "⚠️ HIGH RISK: Multiple red flags detected. Video authenticity is questionable."
        )
    elif risk_level == "MEDIUM":
        summary_parts.append(
            "⚠️ MEDIUM RISK: Some inconsistencies detected. Further verification recommended."
        )
    else:
        summary_parts.append(
            "✓ LOW RISK: No major red flags detected. Video appears consistent with claim."
        )
    return "\n".join(summary_parts)
def calculate_risk_assessment(temporal_result: Dict[str, Any],
                              contextual_result: Dict[str, Any],
                              environmental_result: Dict[str, Any]) -> Dict[str, Any]:

    risk_score = aggregate_scores(temporal_result, contextual_result, environmental_result)
    risk_level = determine_risk_level(risk_score)
    summary = generate_summary(
        temporal_result,
        contextual_result,
        environmental_result,
        risk_score,
        risk_level
    )
    signals = {
        "temporal": {
            "name": "Temporal Reuse Detection",
            "status": "fail" if temporal_result.get("detected") else "pass",
            "confidence": temporal_result.get("confidence", 0.0),
            "details": temporal_result.get("details", "")
        },
        "contextual": {
            "name": "Contextual Consistency",
            "status": "fail" if contextual_result.get("inconsistent") else "pass",
            "confidence": contextual_result.get("confidence", 0.0),
            "details": contextual_result.get("details", "")
        },
        "environmental": {
            "name": "Environmental Consistency",
            "status": "fail" if environmental_result.get("inconsistent") else "pass",
            "confidence": environmental_result.get("confidence", 0.0),
            "details": environmental_result.get("details", "")
        }
    }
    return {
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "summary": summary,
        "signals": signals
    }
