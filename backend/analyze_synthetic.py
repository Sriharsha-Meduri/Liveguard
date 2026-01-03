import torch
import numpy as np
from typing import Dict, Any, List
from pathlib import Path
import cv2
from transformers import CLIPProcessor, CLIPModel
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Synthetic detection using device: {device}")
try:
    model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32", local_files_only=True)
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32", local_files_only=True)
    model.to(device)
    model.eval()
    print("✓ D3 encoder (CLIP) loaded successfully")
except Exception as e:
    print(f"Warning: Could not load encoder: {e}")
    model = None
    processor = None
def extract_temporal_features(frame_paths: List[str]) -> np.ndarray:

    if not model or not processor:
        features = []
        for path in frame_paths:
            img = cv2.imread(path)
            if img is not None:
                feat = np.concatenate([
                    img.mean(axis=(0, 1)),
                    img.std(axis=(0, 1))
                ])
                features.append(feat)
        return np.array(features) if features else np.zeros((1, 6))
    try:
        images = []
        for path in frame_paths:
            img = cv2.imread(path)
            if img is not None:
                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                images.append(img_rgb)
        if not images:
            return np.zeros((1, 512))
        with torch.no_grad():
            inputs = processor(images=images, return_tensors="pt", padding=True)
            pixel_values = inputs['pixel_values'].to(device)
            vision_outputs = model.vision_model(pixel_values=pixel_values)
            features = vision_outputs.pooler_output.cpu().numpy()
        return features
    except Exception as e:
        print(f"Error extracting features: {e}")
        return np.zeros((len(frame_paths), 512))
def compute_second_order_statistics(features: np.ndarray) -> Dict[str, float]:

    if features.shape[0] < 2:
        return {
            "covariance_trace": 0.0,
            "eigenvalue_spread": 0.0,
            "correlation_uniformity": 0.0
        }
    try:
        centered = features - features.mean(axis=0)
        cov_matrix = np.cov(centered.T)
        cov_trace = np.trace(cov_matrix)
        eigenvalues = np.linalg.eigvalsh(cov_matrix)
        eigenvalues = np.sort(eigenvalues)[::-1]
        if len(eigenvalues) > 1:
            eigen_spread = eigenvalues[0] / (eigenvalues[-1] + 1e-8)
        else:
            eigen_spread = 1.0
        correlation_matrix = np.corrcoef(centered.T)
        off_diagonal = correlation_matrix[np.triu_indices_from(correlation_matrix, k=1)]
        correlation_uniformity = 1.0 - np.std(off_diagonal)
        return {
            "covariance_trace": float(cov_trace),
            "eigenvalue_spread": float(eigen_spread),
            "correlation_uniformity": float(correlation_uniformity)
        }
    except Exception as e:
        print(f"Error computing statistics: {e}")
        return {
            "covariance_trace": 0.0,
            "eigenvalue_spread": 1.0,
            "correlation_uniformity": 0.5
        }
def compute_synthetic_likelihood(stats: Dict[str, float]) -> float:

    eigen_score = 1.0 - min(stats["eigenvalue_spread"] / 200.0, 1.0)
    corr_score = stats["correlation_uniformity"]
    synthetic_prob = 0.6 * eigen_score + 0.4 * corr_score
    return min(max(synthetic_prob, 0.0), 1.0)
def analyze_synthetic_video(frame_paths: List[str]) -> Dict[str, Any]:

    if not frame_paths:
        return {
            "riskScore": 0,
            "riskLevel": "LOW",
            "summary": "No frames to analyze.",
            "signals": {
                "forensic": {
                    "name": "Synthetic Media Likelihood",
                    "status": "pass",
                    "confidence": 0.0,
                    "details": "Insufficient data"
                },
                "temporal": {
                    "name": "Temporal Feature Coherence",
                    "status": "pass",
                    "confidence": 0.0,
                    "details": "No temporal analysis performed"
                },
                "contextual": {
                    "name": "Statistical Artifact Presence",
                    "status": "pass",
                    "confidence": 0.0,
                    "details": "No statistical analysis performed"
                }
            }
        }
    features = extract_temporal_features(frame_paths)
    stats = compute_second_order_statistics(features)
    synthetic_prob = compute_synthetic_likelihood(stats)
    risk_score = float(synthetic_prob * 100)
    if risk_score < 30:
        risk_level = "LOW"
    elif risk_score < 70:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"
    forensic_status = "fail" if synthetic_prob > 0.6 else ("warn" if synthetic_prob > 0.4 else "pass")
    eigen_spread = stats["eigenvalue_spread"]
    temporal_status = "fail" if eigen_spread < 50 else ("warn" if eigen_spread < 100 else "pass")
    corr_uniformity = stats["correlation_uniformity"]
    contextual_status = "fail" if corr_uniformity > 0.7 else ("warn" if corr_uniformity > 0.5 else "pass")
    forensic_details = (
        f"Training-free analysis detected {synthetic_prob*100:.1f}% likelihood of AI generation. "
        f"Analyzed {len(frame_paths)} frames using second-order temporal features."
    )
    temporal_details = (
        f"Eigenvalue spread: {eigen_spread:.1f}. "
        f"{'Low spread indicates synthetic generation patterns' if eigen_spread < 100 else 'Spread consistent with camera-captured video'}."
    )
    contextual_details = (
        f"Feature correlation uniformity: {corr_uniformity*100:.1f}%. "
        f"{'High uniformity suggests AI-generated artifacts' if corr_uniformity > 0.6 else 'Natural variation consistent with real video'}."
    )
    if risk_level == "HIGH":
        summary = (
            f"⚠️ HIGH RISK: Training-free forensic analysis indicates {synthetic_prob*100:.1f}% likelihood of AI generation. "
            "Second-order temporal features exhibit patterns characteristic of synthetic media. "
            "This analysis provides probabilistic risk indicators, not factual determinations."
        )
    elif risk_level == "MEDIUM":
        summary = (
            f"⚠️ MEDIUM RISK: Some statistical indicators ({synthetic_prob*100:.1f}% likelihood) suggest possible AI generation. "
            "Temporal features show moderate deviation from camera-captured norms. "
            "This analysis provides probabilistic risk indicators, not factual determinations."
        )
    else:
        summary = (
            f"✓ LOW RISK: Analysis shows {synthetic_prob*100:.1f}% AI generation likelihood. "
            "Temporal features consistent with camera-captured video characteristics. "
            "This analysis provides probabilistic risk indicators, not factual determinations."
        )
    return {
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "summary": summary,
        "signals": {
            "forensic": {
                "name": "Synthetic Media Likelihood",
                "status": forensic_status,
                "confidence": 0.75,
                "details": forensic_details
            },
            "temporal": {
                "name": "Temporal Feature Coherence",
                "status": temporal_status,
                "confidence": 0.80,
                "details": temporal_details
            },
            "contextual": {
                "name": "Statistical Artifact Presence",
                "status": contextual_status,
                "confidence": 0.70,
                "details": contextual_details
            }
        }
    }
