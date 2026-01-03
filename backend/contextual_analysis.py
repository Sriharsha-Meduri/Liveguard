import re
import numpy as np
from typing import List, Dict, Any
from PIL import Image
import torch
import torchvision.models as models
import torchvision.transforms as transforms
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet50(pretrained=True)
model.to(device)
model.eval()
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])
SCENE_CATEGORIES = {
    "protest": ["protest", "demonstration", "rally", "march", "crowd", "riot"],
    "fire": ["fire", "burning", "flame", "smoke", "blaze", "explosion"],
    "flood": ["flood", "water", "inundation", "submerged", "rain"],
    "accident": ["accident", "crash", "collision", "vehicle", "wreck"],
    "normal": ["normal", "everyday", "routine", "regular"]
}
SCENE_CLASS_MAPPING = {
    "street": "protest",
    "crowd": "protest",
    "torch": "fire",
    "volcano": "fire",
    "street_sign": "normal",
    "traffic_light": "normal",
    "fountain": "normal",
    "park": "normal",
}
def classify_scene(image_path: str) -> str:

    try:
        img = Image.open(image_path).convert('RGB')
        img_tensor = preprocess(img).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
        top_prob, top_class = torch.topk(probabilities, 1)
        img_array = np.array(img)
        brightness = np.mean(img_array)
        red_channel = np.mean(img_array[:, :, 0])
        if red_channel > 150 and brightness > 120:
            return "fire"
        elif brightness < 80:
            return "normal"  # Dark scene
        else:
            return "normal"  # Default to normal
    except Exception as e:
        print(f"Error classifying scene: {e}")
        return "normal"
def extract_keywords_from_claim(claim: str) -> List[str]:

    claim_lower = claim.lower()
    keywords = []
    for category, words in SCENE_CATEGORIES.items():
        for word in words:
            if word in claim_lower:
                keywords.append(word)
    return keywords
def determine_expected_scene(claim: str) -> str:

    claim_lower = claim.lower()
    for category, keywords in SCENE_CATEGORIES.items():
        for keyword in keywords:
            if keyword in claim_lower:
                return category
    return "normal"  # Default
def analyze_contextual_consistency(frame_paths: List[str], claim: str) -> Dict[str, Any]:

    if not frame_paths:
        return {
            "inconsistent": False,
            "confidence": 0.0,
            "details": "No frames to analyze",
            "detected_scenes": [],
            "expected_scene": "unknown"
        }
    if not claim or len(claim.strip()) < 5:
        return {
            "inconsistent": False,
            "confidence": 0.0,
            "details": "No claim provided for comparison",
            "detected_scenes": [],
            "expected_scene": "unknown"
        }
    expected_scene = determine_expected_scene(claim)
    detected_scenes = []
    for frame_path in frame_paths:
        scene = classify_scene(frame_path)
        detected_scenes.append(scene)
    scene_counts = {}
    for scene in detected_scenes:
        scene_counts[scene] = scene_counts.get(scene, 0) + 1
    dominant_scene = max(scene_counts, key=scene_counts.get) if scene_counts else "normal"
    dominant_ratio = scene_counts.get(dominant_scene, 0) / len(detected_scenes)
    inconsistent = (dominant_scene != expected_scene) and (expected_scene != "normal")
    confidence = dominant_ratio if inconsistent else (1.0 - dominant_ratio)
    if inconsistent:
        details = f"Video shows '{dominant_scene}' scenes but claim suggests '{expected_scene}'"
    else:
        details = f"Video scenes match claim context ('{expected_scene}')"
    details += f" - Scene distribution: {scene_counts}"
    return {
        "inconsistent": inconsistent,
        "confidence": float(confidence),
        "details": details,
        "detected_scenes": detected_scenes,
        "expected_scene": expected_scene,
        "dominant_scene": dominant_scene
    }
