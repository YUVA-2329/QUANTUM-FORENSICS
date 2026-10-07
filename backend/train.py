import os
import json
import numpy as np
from PIL import Image, ImageDraw
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

from engine import extract_features, generate_ela

DATASET_DIR = "synthetic_dataset"
AUTHENTIC_DIR = os.path.join(DATASET_DIR, "authentic")
TAMPERED_DIR = os.path.join(DATASET_DIR, "tampered")
MODEL_DIR = "models"

def setup_dirs():
    for d in [AUTHENTIC_DIR, TAMPERED_DIR, MODEL_DIR]:
        os.makedirs(d, exist_ok=True)

def generate_synthetic_data(num_samples=100):
    print(f"Generating {num_samples} synthetic samples...")
    for i in range(num_samples):
        img = Image.new('RGB', (256, 256), color=(
            np.random.randint(0, 255),
            np.random.randint(0, 255),
            np.random.randint(0, 255)
        ))
        draw = ImageDraw.Draw(img)
        for _ in range(5):
            x0, y0 = np.random.randint(0, 200, 2)
            x1, y1 = x0 + np.random.randint(20, 50), y0 + np.random.randint(20, 50)
            draw.rectangle([x0, y0, x1, y1], fill=(
                np.random.randint(0, 255),
                np.random.randint(0, 255),
                np.random.randint(0, 255)
            ))
            
        auth_path = os.path.join(AUTHENTIC_DIR, f"auth_{i}.jpg")
        img.save(auth_path, "JPEG", quality=90)
        
        tamp_img = img.copy()
        patch = tamp_img.crop((100, 100, 150, 150))
        patch_path = "temp_patch.jpg"
        patch.save(patch_path, "JPEG", quality=30)
        patch_reloaded = Image.open(patch_path)
        tamp_img.paste(patch_reloaded, (100, 100))
        
        tamp_path = os.path.join(TAMPERED_DIR, f"tamp_{i}.jpg")
        tamp_img.save(tamp_path, "JPEG", quality=90)
        
    if os.path.exists("temp_patch.jpg"):
        os.remove("temp_patch.jpg")
        
def load_data():
    X = []
    y = []
    
    print("Extracting features from authentic images...")
    for f in os.listdir(AUTHENTIC_DIR):
        if not f.endswith('.jpg'): continue
        img = Image.open(os.path.join(AUTHENTIC_DIR, f))
        _, diff = generate_ela(img, quality=90)
        features, _ = extract_features(diff)
        X.append(features)
        y.append(0)
        
    print("Extracting features from tampered images...")
    for f in os.listdir(TAMPERED_DIR):
        if not f.endswith('.jpg'): continue
        img = Image.open(os.path.join(TAMPERED_DIR, f))
        _, diff = generate_ela(img, quality=90)
        features, _ = extract_features(diff)
        X.append(features)
        y.append(1)
        
    return np.array(X), np.array(y)

def train_model():
    setup_dirs()
    generate_synthetic_data(100)
    
    X, y = load_data()
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train_scaled, y_train)
    
    y_pred = clf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print(f"Accuracy: {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall: {rec:.4f}")
    print(f"F1 Score: {f1:.4f}")
    
    joblib.dump(clf, os.path.join(MODEL_DIR, "tampering_classifier.joblib"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "feature_scaler.joblib"))
    
    metadata = {
        "algorithm": "RandomForestClassifier",
        "feature_count": X.shape[1],
        "ela_quality": 90,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "random_state": 42,
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1": float(f1)
    }
    
    with open(os.path.join(MODEL_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    print("Training complete and models saved.")

if __name__ == "__main__":
    train_model()
