"""
Deepfake detection module.

Pipeline: detect faces in each frame with OpenCV YuNet, crop them, and run a
pretrained face-forgery classifier (dima806/deepfake_vs_real_image_detection,
a ViT trained on real/fake faces) on each crop. Frame-level scores are
aggregated into a manipulation-likelihood risk score.

Notes:
- Deepfakes are a face phenomenon, so we only score detected faces. A video
  with no faces returns LOW risk (nothing to assess), which is the honest result.
- The classifier is sensitive (skews toward flagging), so treat the score as a
  probabilistic indicator, not a verdict.
"""
import os
from typing import Dict, Any, List

import cv2
import numpy as np
from PIL import Image
import torch
from transformers import pipeline

device = 0 if torch.cuda.is_available() else -1
print(f"Deepfake detection using device: {'cuda' if device == 0 else 'cpu'}")

_HERE = os.path.dirname(__file__)
YUNET_PATH = os.path.join(_HERE, "models", "face_yunet.onnx")
DEEPFAKE_MODEL = "dima806/deepfake_vs_real_image_detection"

try:
    classifier = pipeline("image-classification", model=DEEPFAKE_MODEL, device=device)
    print("[OK] Deepfake face classifier loaded")
except Exception as e:
    print(f"Warning: could not load deepfake classifier: {e}")
    classifier = None


def _fake_prob(preds: List[Dict[str, Any]]) -> float:
    for p in preds:
        if "fake" in p["label"].lower():
            return float(p["score"])
    return 0.0


def _detect_face_crops(frame_paths: List[str]) -> List[Image.Image]:
    """Return padded face crops (max one per frame) using YuNet."""
    if not os.path.exists(YUNET_PATH):
        return []
    detector = cv2.FaceDetectorYN.create(YUNET_PATH, "", (320, 320), score_threshold=0.6)
    crops = []
    for path in frame_paths:
        frame = cv2.imread(path)
        if frame is None:
            continue
        h, w = frame.shape[:2]
        detector.setInputSize((w, h))
        _, faces = detector.detect(frame)
        if faces is None:
            continue
        for f in faces[:1]:  # dominant face per frame
            x, y, fw, fh = [int(v) for v in f[:4]]
            pad = int(0.25 * fw)
            x0, y0 = max(0, x - pad), max(0, y - pad)
            x1, y1 = min(w, x + fw + pad), min(h, y + fh + pad)
            crop = frame[y0:y1, x0:x1]
            if crop.size:
                crops.append(Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)))
    return crops


def compute_deepfake_score(frame_paths: List[str]) -> Dict[str, Any]:
    crops = _detect_face_crops(frame_paths)
    if not crops or classifier is None:
        return {"fake_probability": 0.1, "confidence": 0.4, "face_count": len(crops),
                "frame_scores": [], "consistency": 1.0, "no_faces": len(crops) == 0}

    scores = []
    for crop in crops:
        try:
            scores.append(_fake_prob(classifier(crop)))
        except Exception as e:
            print(f"Classifier error on a face crop: {e}")
    if not scores:
        return {"fake_probability": 0.1, "confidence": 0.4, "face_count": 0,
                "frame_scores": [], "consistency": 1.0, "no_faces": True}

    fake_prob = float(np.mean(scores))
    consistency = float(1.0 - np.std(scores))
    return {
        "fake_probability": fake_prob,
        "confidence": 0.8,
        "face_count": len(scores),
        "frame_scores": [round(float(s), 3) for s in scores],
        "consistency": consistency,
        "no_faces": False,
    }


def analyze_deepfake_risk(frame_paths: List[str]) -> Dict[str, Any]:
    if not frame_paths:
        return _empty("No frames to analyze.")

    result = compute_deepfake_score(frame_paths)
    fake_prob = result["fake_probability"]
    consistency = result["consistency"]
    face_count = result["face_count"]
    no_faces = result.get("no_faces", False)

    risk_score = float(fake_prob * 100)
    risk_level = "LOW" if risk_score < 35 else ("MEDIUM" if risk_score < 65 else "HIGH")
    forensic_status = "fail" if fake_prob > 0.65 else ("warn" if fake_prob > 0.35 else "pass")
    temporal_status = "pass" if consistency > 0.7 else "warn"

    if no_faces:
        forensic_details = (
            "No faces were detected in the sampled frames, so face-based deepfake "
            "manipulation could not be assessed. This does not rule out other forms of editing."
        )
        temporal_details = "No faces to evaluate for frame-level consistency."
        summary = (
            "✓ LOW RISK: No faces detected in this video, so no deepfake face manipulation "
            "could be assessed. This analysis provides probabilistic risk indicators, not factual determinations."
        )
    else:
        forensic_details = (
            f"Analyzed {face_count} detected face(s) with a pretrained face-forgery classifier. "
            f"Mean manipulation likelihood: {fake_prob*100:.1f}%."
        )
        temporal_details = (
            f"Face-level score consistency: {consistency*100:.1f}%. "
            f"{'High variance across faces' if consistency < 0.7 else 'Consistent scores across faces'}."
        )
        if risk_level == "HIGH":
            summary = (
                f"⚠️ HIGH RISK: The face-forgery classifier flags {fake_prob*100:.1f}% manipulation "
                f"likelihood across {face_count} face(s). Strong indicators of deepfake or face-swap editing. "
                "This analysis provides probabilistic risk indicators, not factual determinations."
            )
        elif risk_level == "MEDIUM":
            summary = (
                f"⚠️ MEDIUM RISK: Some indicators ({fake_prob*100:.1f}% likelihood) of face manipulation "
                f"across {face_count} face(s). Further verification recommended. "
                "This analysis provides probabilistic risk indicators, not factual determinations."
            )
        else:
            summary = (
                f"✓ LOW RISK: Faces show {fake_prob*100:.1f}% manipulation likelihood, consistent with "
                "authentic capture. This analysis provides probabilistic risk indicators, not factual determinations."
            )

    return {
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "summary": summary,
        "signals": {
            "forensic": {
                "name": "Deepfake Manipulation Likelihood",
                "status": forensic_status,
                "confidence": result["confidence"],
                "details": forensic_details,
            },
            "temporal": {
                "name": "Face-level Detection Consistency",
                "status": temporal_status,
                "confidence": consistency,
                "details": temporal_details,
            },
        },
    }


def _empty(msg: str) -> Dict[str, Any]:
    return {
        "riskScore": 0,
        "riskLevel": "LOW",
        "summary": msg,
        "signals": {
            "forensic": {"name": "Deepfake Manipulation Likelihood", "status": "pass",
                         "confidence": 0.0, "details": "Insufficient data"},
            "temporal": {"name": "Face-level Detection Consistency", "status": "pass",
                         "confidence": 0.0, "details": "No frames analyzed"},
        },
    }
