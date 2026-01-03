from typing import Dict, Any, List
from temporal_analysis import analyze_temporal_reuse
from contextual_analysis import analyze_contextual_consistency
from environmental_analysis import analyze_environmental_consistency
def analyze_context_integrity(frame_paths: List[str], claim: str) -> Dict[str, Any]:

    temporal_result = analyze_temporal_reuse(frame_paths)
    contextual_result = analyze_contextual_consistency(frame_paths, claim)
    environmental_result = analyze_environmental_consistency(frame_paths, claim)
    temporal_score = temporal_result.get("confidence", 0) * 100 if temporal_result.get("detected") else 0
    contextual_score = contextual_result.get("confidence", 0) * 100 if contextual_result.get("inconsistent") else 0
    environmental_score = environmental_result.get("confidence", 0) * 100 if environmental_result.get("inconsistent") else 0
    risk_score = (temporal_score * 0.5 + contextual_score * 0.3 + environmental_score * 0.2)
    risk_score = min(max(risk_score, 0), 100)
    if risk_score < 30:
        risk_level = "LOW"
    elif risk_score < 70:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"
    issues = []
    if temporal_result.get("detected"):
        issues.append("reused footage detected")
    if contextual_result.get("inconsistent"):
        issues.append("scene-claim mismatch")
    if environmental_result.get("inconsistent"):
        issues.append("lighting-time inconsistency")
    if issues:
        summary = (
            f"⚠️ {risk_level} RISK: Context analysis detected: {', '.join(issues)}. "
            "Further verification recommended. "
            "This analysis provides probabilistic risk indicators, not factual determinations."
        )
    else:
        summary = (
            f"✓ {risk_level} RISK: Video content appears consistent with claim. "
            "No major context integrity issues detected. "
            "This analysis provides probabilistic risk indicators, not factual determinations."
        )
    return {
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "summary": summary,
        "signals": {
            "temporal": {
                "name": "Temporal Reuse Detection",
                "status": "fail" if temporal_result.get("detected") else "pass",
                "confidence": temporal_result.get("confidence", 0),
                "details": temporal_result.get("details", "No analysis performed")
            },
            "contextual": {
                "name": "Contextual Consistency",
                "status": "fail" if contextual_result.get("inconsistent") else "pass",
                "confidence": contextual_result.get("confidence", 0),
                "details": contextual_result.get("details", "No analysis performed")
            },
            "environmental": {
                "name": "Environmental Consistency",
                "status": "fail" if environmental_result.get("inconsistent") else "pass",
                "confidence": environmental_result.get("confidence", 0),
                "details": environmental_result.get("details", "No analysis performed")
            }
        }
    }
