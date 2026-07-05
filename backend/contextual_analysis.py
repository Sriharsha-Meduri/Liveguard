"""
Contextual consistency: does the scene in the video match the user's claim?

Uses CLIP zero-shot image classification to label each frame's scene, then
compares the dominant detected scene against the scene implied by the claim
text. A mismatch (e.g. claim says "protest" but frames look like an ordinary
street) flags a contextual inconsistency.
"""
from typing import List, Dict, Any

import torch
from PIL import Image
from transformers import pipeline

device = 0 if torch.cuda.is_available() else -1

# Scene category -> natural-language prompt for CLIP, plus claim keywords.
SCENE_PROMPTS = {
    "protest": "a protest, demonstration, rally, or large crowd marching",
    "fire": "a fire with flames, smoke, or a burning building",
    "flood": "a flood with water covering streets or land",
    "accident": "a vehicle accident, crash, or wreck",
    "normal": "an ordinary, everyday scene with nothing unusual",
}
SCENE_KEYWORDS = {
    "protest": ["protest", "demonstration", "rally", "march", "crowd", "riot"],
    "fire": ["fire", "burning", "flame", "smoke", "blaze", "explosion", "wildfire"],
    "flood": ["flood", "flooding", "water", "inundation", "submerged"],
    "accident": ["accident", "crash", "collision", "vehicle", "wreck"],
}
_PROMPT_TO_SCENE = {v: k for k, v in SCENE_PROMPTS.items()}

try:
    classifier = pipeline("zero-shot-image-classification",
                          model="openai/clip-vit-base-patch32", device=device)
    print("[OK] Context scene classifier (CLIP) loaded")
except Exception as e:
    print(f"Warning: could not load CLIP scene classifier: {e}")
    classifier = None


def classify_scene(image_path: str) -> str:
    if classifier is None:
        return "normal"
    try:
        img = Image.open(image_path).convert("RGB")
        preds = classifier(img, candidate_labels=list(SCENE_PROMPTS.values()))
        top = preds[0]["label"]
        return _PROMPT_TO_SCENE.get(top, "normal")
    except Exception as e:
        print(f"Error classifying scene: {e}")
        return "normal"


def determine_expected_scene(claim: str) -> str:
    claim_lower = claim.lower()
    for category, keywords in SCENE_KEYWORDS.items():
        if any(k in claim_lower for k in keywords):
            return category
    return "normal"


def analyze_contextual_consistency(frame_paths: List[str], claim: str) -> Dict[str, Any]:
    if not frame_paths:
        return {"inconsistent": False, "confidence": 0.0, "details": "No frames to analyze",
                "detected_scenes": [], "expected_scene": "unknown"}
    if not claim or len(claim.strip()) < 5:
        return {"inconsistent": False, "confidence": 0.0, "details": "No claim provided for comparison",
                "detected_scenes": [], "expected_scene": "unknown"}

    expected_scene = determine_expected_scene(claim)
    detected_scenes = [classify_scene(p) for p in frame_paths]

    scene_counts: Dict[str, int] = {}
    for s in detected_scenes:
        scene_counts[s] = scene_counts.get(s, 0) + 1
    dominant_scene = max(scene_counts, key=scene_counts.get)
    dominant_ratio = scene_counts[dominant_scene] / len(detected_scenes)

    # Inconsistent only when the claim implies a specific (non-normal) scene the
    # video does not show.
    inconsistent = (expected_scene != "normal") and (dominant_scene != expected_scene)
    confidence = dominant_ratio if inconsistent else (1.0 - dominant_ratio * 0.0 + dominant_ratio) / 2

    if inconsistent:
        details = (f"Video predominantly shows '{dominant_scene}' scenes, but the claim implies "
                   f"'{expected_scene}'. Scene distribution: {scene_counts}")
    else:
        details = (f"Video scenes are consistent with the claim context "
                   f"('{expected_scene}'). Scene distribution: {scene_counts}")

    return {
        "inconsistent": inconsistent,
        "confidence": float(confidence),
        "details": details,
        "detected_scenes": detected_scenes,
        "expected_scene": expected_scene,
        "dominant_scene": dominant_scene,
    }
