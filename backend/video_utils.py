import os
import cv2
from typing import List
from pathlib import Path
TEMP_DIR = Path(__file__).parent / "temp"
ALLOWED_EXTENSIONS = {'.mp4', '.mov'}
MIN_DURATION = 5  # seconds
MAX_DURATION = 20  # seconds
def validate_video(video_path: str) -> tuple[bool, str]:

    try:
        ext = Path(video_path).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"Invalid format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return False, "Could not open video file"
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        duration = frame_count / fps if fps > 0 else 0
        cap.release()
        if duration < MIN_DURATION:
            return False, f"Video too short. Minimum {MIN_DURATION} seconds required."
        if duration > MAX_DURATION:
            return False, f"Video too long. Maximum {MAX_DURATION} seconds allowed."
        return True, ""
    except Exception as e:
        return False, f"Error validating video: {str(e)}"
def extract_frames(video_path: str, interval: int = 2) -> List[str]:

    frame_paths = []
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file")
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(fps * interval)
    frame_count = 0
    saved_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % frame_interval == 0:
            frame_path = TEMP_DIR / f"frame_{saved_count:04d}.jpg"
            cv2.imwrite(str(frame_path), frame)
            frame_paths.append(str(frame_path))
            saved_count += 1
        frame_count += 1
    cap.release()
    return frame_paths
def cleanup_temp_files(file_paths: List[str]) -> None:

    for path in file_paths:
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception as e:
            print(f"Warning: Could not delete {path}: {e}")
def save_uploaded_video(file_content: bytes, filename: str) -> str:

    TEMP_DIR.mkdir(exist_ok=True)
    ext = Path(filename).suffix.lower()
    temp_path = TEMP_DIR / f"upload{ext}"
    with open(temp_path, 'wb') as f:
        f.write(file_content)
    return str(temp_path)
