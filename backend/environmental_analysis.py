import re
import numpy as np
from typing import List, Dict, Any, Optional
from PIL import Image
from datetime import datetime
DAY_THRESHOLD = 100  # Average brightness above this = day
NIGHT_THRESHOLD = 60  # Average brightness below this = night
TIME_PATTERNS = {
    "morning": {"hour_range": (6, 11), "expected": "day"},
    "afternoon": {"hour_range": (12, 17), "expected": "day"},
    "evening": {"hour_range": (18, 20), "expected": "twilight"},
    "night": {"hour_range": (21, 5), "expected": "night"},
    "noon": {"hour_range": (11, 13), "expected": "day"},
    "midnight": {"hour_range": (0, 2), "expected": "night"},
    "dawn": {"hour_range": (5, 7), "expected": "twilight"},
    "dusk": {"hour_range": (18, 20), "expected": "twilight"},
}
def calculate_brightness(image_path: str) -> float:

    try:
        img = Image.open(image_path).convert('RGB')
        img_array = np.array(img)
        brightness = np.mean(
            0.299 * img_array[:, :, 0] +
            0.587 * img_array[:, :, 1] +
            0.114 * img_array[:, :, 2]
        )
        return float(brightness)
    except Exception as e:
        print(f"Error calculating brightness for {image_path}: {e}")
        return 100.0  # Return neutral value on error
def classify_lighting(brightness: float) -> str:

    if brightness >= DAY_THRESHOLD:
        return "day"
    elif brightness <= NIGHT_THRESHOLD:
        return "night"
    else:
        return "twilight"
def extract_time_from_claim(claim: str) -> Optional[str]:

    claim_lower = claim.lower()
    for time_keyword in TIME_PATTERNS.keys():
        if time_keyword in claim_lower:
            return time_keyword
    time_pattern = r'\b(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?\b'
    match = re.search(time_pattern, claim)
    if match:
        hour = int(match.group(1))
        meridiem = match.group(3)
        if meridiem:
            if meridiem.lower() == 'pm' and hour != 12:
                hour += 12
            elif meridiem.lower() == 'am' and hour == 12:
                hour = 0
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 18:
            return "afternoon"
        elif 18 <= hour < 21:
            return "evening"
        else:
            return "night"
    return None
def determine_expected_lighting(time_keyword: Optional[str]) -> Optional[str]:

    if not time_keyword:
        return None
    time_info = TIME_PATTERNS.get(time_keyword)
    if time_info:
        return time_info["expected"]
    return None
def analyze_environmental_consistency(frame_paths: List[str], claim: str) -> Dict[str, Any]:

    if not frame_paths:
        return {
            "inconsistent": False,
            "confidence": 0.0,
            "details": "No frames to analyze",
            "detected_lighting": "unknown",
            "expected_lighting": "unknown"
        }
    brightness_values = []
    lighting_classifications = []
    for frame_path in frame_paths:
        brightness = calculate_brightness(frame_path)
        brightness_values.append(brightness)
        lighting = classify_lighting(brightness)
        lighting_classifications.append(lighting)
    lighting_counts = {}
    for lighting in lighting_classifications:
        lighting_counts[lighting] = lighting_counts.get(lighting, 0) + 1
    dominant_lighting = max(lighting_counts, key=lighting_counts.get) if lighting_counts else "unknown"
    avg_brightness = np.mean(brightness_values) if brightness_values else 100.0
    time_keyword = extract_time_from_claim(claim)
    expected_lighting = determine_expected_lighting(time_keyword)
    inconsistent = False
    confidence = 0.0
    if expected_lighting:
        if expected_lighting == "twilight":
            inconsistent = False
            confidence = 0.3
        elif dominant_lighting != expected_lighting:
            inconsistent = True
            confidence = 0.7 if abs(avg_brightness - DAY_THRESHOLD) > 40 else 0.5
        else:
            inconsistent = False
            confidence = 0.8
    else:
        inconsistent = False
        confidence = 0.0
    if expected_lighting:
        if inconsistent:
            details = f"Video shows '{dominant_lighting}' lighting but claim indicates '{time_keyword}' (expected: '{expected_lighting}')"
        else:
            details = f"Lighting conditions match claim ('{time_keyword}' → '{dominant_lighting}')"
    else:
        details = f"No time information in claim. Detected lighting: '{dominant_lighting}'"
    details += f" - Avg brightness: {avg_brightness:.1f}"
    return {
        "inconsistent": inconsistent,
        "confidence": float(confidence),
        "details": details,
        "detected_lighting": dominant_lighting,
        "expected_lighting": expected_lighting or "unknown",
        "time_keyword": time_keyword,
        "avg_brightness": float(avg_brightness)
    }
