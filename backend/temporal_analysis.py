import os
import pickle
import numpy as np
from typing import List, Dict, Any
from pathlib import Path
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
model = torch.nn.Sequential(*list(model.children())[:-1])  # Remove final layer
model.to(device)
model.eval()
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])
MODELS_DIR = Path(__file__).parent / "models"
REFERENCE_EMBEDDINGS_PATH = MODELS_DIR / "reference_embeddings.pkl"
SIMILARITY_THRESHOLD = 0.85  # Threshold for declaring a match
def cosine_similarity_manual(vec1: np.ndarray, vec2: np.ndarray) -> float:

    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)
def extract_embedding(image_path: str) -> np.ndarray:

    try:
        img = Image.open(image_path).convert('RGB')
        img_tensor = preprocess(img).unsqueeze(0).to(device)
        with torch.no_grad():
            embedding = model(img_tensor)
        embedding = embedding.cpu().numpy().flatten()
        return embedding
    except Exception as e:
        print(f"Error extracting embedding from {image_path}: {e}")
        return np.zeros(2048)  # Return zero vector on error
def load_reference_embeddings() -> List[np.ndarray]:

    if not REFERENCE_EMBEDDINGS_PATH.exists():
        print(f"Warning: Reference embeddings not found at {REFERENCE_EMBEDDINGS_PATH}")
        return [np.random.randn(2048) for _ in range(10)]
    try:
        with open(REFERENCE_EMBEDDINGS_PATH, 'rb') as f:
            embeddings = pickle.load(f)
        return embeddings
    except Exception as e:
        print(f"Error loading reference embeddings: {e}")
        return [np.random.randn(2048) for _ in range(10)]
def analyze_temporal_reuse(frame_paths: List[str]) -> Dict[str, Any]:

    if not frame_paths:
        return {
            "detected": False,
            "confidence": 0.0,
            "details": "No frames to analyze",
            "matched_frames": 0,
            "total_frames": 0
        }
    reference_embeddings = load_reference_embeddings()
    if not reference_embeddings:
        return {
            "detected": False,
            "confidence": 0.0,
            "details": "No reference database available",
            "matched_frames": 0,
            "total_frames": len(frame_paths)
        }
    frame_embeddings = []
    for frame_path in frame_paths:
        embedding = extract_embedding(frame_path)
        frame_embeddings.append(embedding)
    matched_frames = 0
    max_similarities = []
    for frame_emb in frame_embeddings:
        similarities = []
        for ref_emb in reference_embeddings:
            sim = cosine_similarity_manual(frame_emb, ref_emb)
            similarities.append(sim)
        max_sim = max(similarities) if similarities else 0.0
        max_similarities.append(max_sim)
        if max_sim >= SIMILARITY_THRESHOLD:
            matched_frames += 1
    total_frames = len(frame_paths)
    match_ratio = matched_frames / total_frames if total_frames > 0 else 0.0
    avg_similarity = np.mean(max_similarities) if max_similarities else 0.0
    detected = match_ratio > 0.3  # If 30% of frames match, flag as reuse
    confidence = avg_similarity
    details = f"Found {matched_frames}/{total_frames} frames matching known footage"
    if detected:
        details += f" (avg similarity: {avg_similarity:.2f})"
    return {
        "detected": detected,
        "confidence": float(confidence),
        "details": details,
        "matched_frames": matched_frames,
        "total_frames": total_frames
    }
def generate_reference_embeddings(sample_video_dir: str, output_path: str = None):

    if output_path is None:
        output_path = REFERENCE_EMBEDDINGS_PATH
    MODELS_DIR.mkdir(exist_ok=True)
    image_files = []
    for ext in ['.jpg', '.jpeg', '.png']:
        image_files.extend(Path(sample_video_dir).glob(f"*{ext}"))
    embeddings = []
    for img_path in image_files:
        emb = extract_embedding(str(img_path))
        embeddings.append(emb)
        print(f"Processed {img_path.name}")
    with open(output_path, 'wb') as f:
        pickle.dump(embeddings, f)
    print(f"Saved {len(embeddings)} reference embeddings to {output_path}")
