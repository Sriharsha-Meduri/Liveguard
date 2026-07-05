"""
AI-generated (synthetic) video detection module.

Runs a pretrained AI-vs-real image detector (umm-maybe/AI-image-detector, a ViT)
on the sampled frames and aggregates the per-frame "artificial" probability into
a synthetic-media risk score. Unlike the deepfake module this looks at the whole
frame, so it catches fully generated / rendered content, not just faces.
"""
from typing import Dict, Any, List

import cv2
import numpy as np
from PIL import Image
import torch
from transformers import pipeline

device = 0 if torch.cuda.is_available() else -1
print(f"Synthetic detection using device: {'cuda' if device == 0 else 'cpu'}")

SYNTHETIC_MODEL = "umm-maybe/AI-image-detector"

try:
    classifier = pipeline("image-classification", model=SYNTHETIC_MODEL, device=device)
    print("[OK] Synthetic (AI-generated) classifier loaded")
except Exception as e:
    print(f"Warning: could not load synthetic classifier: {e}")
    classifier = None


def _artificial_prob(preds: List[Dict[str, Any]]) -> float:
    # Prefer an explicit "artificial/ai/fake" label; else take the non-human class.
    for p in preds:
        if any(k in p["label"].lower() for k in ("artificial", "ai", "fake", "synthetic", "generated")):
            return float(p["score"])
    for p in preds:
        if not any(k in p["label"].lower() for k in ("human", "real", "natural")):
            return float(p["score"])
    return float(preds[0]["score"])


def _load_frames(frame_paths: List[str]) -> List[Image.Image]:
    imgs = []
    for path in frame_paths:
        frame = cv2.imread(path)
        if frame is not None:
            imgs.append(Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)))
    return imgs


def analyze_synthetic_video(frame_paths: List[str]) -> Dict[str, Any]:
    if not frame_paths:
        return _empty("No frames to analyze.")

    imgs = _load_frames(frame_paths)
    if not imgs or classifier is None:
        return _empty("Could not analyze frames.")

    scores = []
    for img in imgs:
        try:
            scores.append(_artificial_prob(classifier(img)))
        except Exception as e:
            print(f"Synthetic classifier error: {e}")
    if not scores:
        return _empty("Could not analyze frames.")

    synthetic_prob = float(np.mean(scores))
    consistency = float(1.0 - np.std(scores))
    high_ratio = float(np.mean([s > 0.5 for s in scores]))

    risk_score = float(synthetic_prob * 100)
    risk_level = "LOW" if risk_score < 35 else ("MEDIUM" if risk_score < 65 else "HIGH")
    forensic_status = "fail" if synthetic_prob > 0.6 else ("warn" if synthetic_prob > 0.35 else "pass")
    temporal_status = "warn" if consistency < 0.7 else "pass"
    contextual_status = "fail" if high_ratio > 0.6 else ("warn" if high_ratio > 0.3 else "pass")

    forensic_details = (
        f"Pretrained AI-image detector reports {synthetic_prob*100:.1f}% mean 'artificial' likelihood "
        f"across {len(scores)} frames."
    )
    temporal_details = (
        f"Frame-to-frame score consistency: {consistency*100:.1f}%. "
        f"{'Uniform generation signature' if consistency > 0.7 else 'Variable signal across frames'}."
    )
    contextual_details = (
        f"{high_ratio*100:.0f}% of sampled frames scored above the 50% synthetic threshold."
    )

    if risk_level == "HIGH":
        summary = (
            f"⚠️ HIGH RISK: {synthetic_prob*100:.1f}% likelihood of AI-generated content. Frames exhibit "
            "patterns characteristic of synthetic media. This analysis provides probabilistic risk indicators, "
            "not factual determinations."
        )
    elif risk_level == "MEDIUM":
        summary = (
            f"⚠️ MEDIUM RISK: {synthetic_prob*100:.1f}% likelihood of AI generation. Some frames deviate from "
            "camera-captured norms. This analysis provides probabilistic risk indicators, not factual determinations."
        )
    else:
        summary = (
            f"✓ LOW RISK: {synthetic_prob*100:.1f}% AI-generation likelihood, consistent with camera-captured "
            "video. This analysis provides probabilistic risk indicators, not factual determinations."
        )

    return {
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "summary": summary,
        "signals": {
            "forensic": {
                "name": "Synthetic Media Likelihood",
                "status": forensic_status,
                "confidence": 0.8,
                "details": forensic_details,
            },
            "temporal": {
                "name": "Temporal Feature Coherence",
                "status": temporal_status,
                "confidence": consistency,
                "details": temporal_details,
            },
            "contextual": {
                "name": "Per-frame Synthetic Ratio",
                "status": contextual_status,
                "confidence": high_ratio,
                "details": contextual_details,
            },
        },
    }


def _empty(msg: str) -> Dict[str, Any]:
    return {
        "riskScore": 0,
        "riskLevel": "LOW",
        "summary": msg,
        "signals": {
            "forensic": {"name": "Synthetic Media Likelihood", "status": "pass", "confidence": 0.0, "details": "Insufficient data"},
            "temporal": {"name": "Temporal Feature Coherence", "status": "pass", "confidence": 0.0, "details": "No analysis performed"},
            "contextual": {"name": "Per-frame Synthetic Ratio", "status": "pass", "confidence": 0.0, "details": "No analysis performed"},
        },
    }
