import io
import os
import base64
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import cv2
import joblib

# Ensure models directory exists
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'tampering_classifier.joblib')
SCALER_PATH = os.path.join(MODEL_DIR, 'feature_scaler.joblib')
METADATA_PATH = os.path.join(MODEL_DIR, 'metadata.json')

classifier = None
scaler = None
metadata = None

def load_models():
    global classifier, scaler, metadata
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        try:
            classifier = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            import json
            if os.path.exists(METADATA_PATH):
                with open(METADATA_PATH, 'r') as f:
                    metadata = json.load(f)
            return True
        except Exception as e:
            print("Error loading models:", e)
            return False
    return False

load_models()

def generate_ela(original_img, quality=90):
    temp_filename = "temp_ela.jpg"
    original_img.save(temp_filename, "JPEG", quality=quality)
    recompressed = Image.open(temp_filename)
    difference = ImageChops.difference(original_img, recompressed)
    
    extrema = difference.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    if max_diff == 0:
        max_diff = 1
    
    scale = 255.0 / max_diff
    ela_image = ImageEnhance.Brightness(difference).enhance(scale)
    os.remove(temp_filename)
    
    return ela_image, difference

def extract_features(ela_difference):
    diff_np = np.array(ela_difference)
    mean_error = np.mean(diff_np)
    std_error = np.std(diff_np)
    max_error = np.max(diff_np)
    
    threshold = 20
    high_error_pixels = np.sum(diff_np > threshold)
    total_pixels = diff_np.size
    high_error_ratio = (high_error_pixels / total_pixels) * 100 if total_pixels > 0 else 0
    
    gray_diff = cv2.cvtColor(diff_np, cv2.COLOR_RGB2GRAY)
    hist = cv2.calcHist([gray_diff], [0], None, [10], [0, 256])
    hist_features = hist.flatten() / total_pixels
    
    features = [mean_error, std_error, float(max_error), high_error_ratio]
    features.extend(hist_features.tolist())
    
    return features, {
        "mean_error": float(mean_error),
        "std_error": float(std_error),
        "max_error": int(max_error),
        "high_error_ratio": float(high_error_ratio)
    }

def detect_regions(ela_difference):
    diff_np = np.array(ela_difference)
    gray_diff = cv2.cvtColor(diff_np, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray_diff, 30, 255, cv2.THRESH_BINARY)
    
    kernel = np.ones((5,5), np.uint8)
    opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel)
    
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    regions = []
    height, width = gray_diff.shape
    for i, contour in enumerate(contours):
        if cv2.contourArea(contour) > 100:
            x, y, w, h = cv2.boundingRect(contour)
            regions.append({
                "id": str(i),
                "x": (x / width) * 100,
                "y": (y / height) * 100,
                "width": (w / width) * 100,
                "height": (h / height) * 100,
                "score": 0.85
            })
            if len(regions) >= 5:
                break
    return regions

def process_image(image_bytes, filename, content_type):
    global classifier, scaler, metadata
    if classifier is None:
        if not load_models():
            raise Exception("Models not found. Please train the model first.")
            
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
    except Exception as e:
        raise Exception(f"Error decoding image: {e}")
        
    width, height = img.size
    ela_quality = 90
    ela_image, difference = generate_ela(img, quality=ela_quality)
    
    buffered = io.BytesIO()
    ela_image.save(buffered, format="JPEG")
    ela_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    ela_data_url = f"data:image/jpeg;base64,{ela_base64}"
    
    features, metrics_dict = extract_features(difference)
    features_np = np.array(features).reshape(1, -1)
    scaled_features = scaler.transform(features_np)
    
    prediction = classifier.predict(scaled_features)[0]
    probabilities = classifier.predict_proba(scaled_features)[0]
    
    verdict = "TAMPERED" if prediction == 1 else "AUTHENTIC"
    confidence = float(probabilities[1] if prediction == 1 else probabilities[0])
    
    regions = detect_regions(difference)
    
    return {
        "verdict": verdict,
        "confidence": confidence,
        "class_probabilities": {
            "AUTHENTIC": float(probabilities[0]),
            "TAMPERED": float(probabilities[1])
        },
        "image": {
            "width": width,
            "height": height,
            "format": img.format or "JPEG",
            "size_bytes": len(image_bytes)
        },
        "ela": {
            "quality": ela_quality,
            "image_url": ela_data_url,
            "mean_error": metrics_dict["mean_error"],
            "std_error": metrics_dict["std_error"],
            "max_error": metrics_dict["max_error"],
            "high_error_ratio": metrics_dict["high_error_ratio"]
        },
        "features": {
            "count": len(features)
        },
        "model": metadata,
        "regions": regions
    }
