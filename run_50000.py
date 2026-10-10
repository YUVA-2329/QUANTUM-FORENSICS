import os
import sys
import time
import numpy as np
import concurrent.futures
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from threading import Lock

sys.path.append(os.path.join(os.getcwd(), 'backend'))
from backend.engine import extract_features, generate_ela

AUTH_DIR = r"C:\Users\yuvak\OneDrive\Desktop\ORIGINAL PHOTOS"
TAMP_DIR = r"C:\Users\yuvak\OneDrive\Desktop\quantum_forensics_5_manipulated_images"

def load_data():
    X = []
    y = []
    print("Extracting features from authentic images...", flush=True)
    for f in os.listdir(AUTH_DIR):
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            try:
                img = Image.open(os.path.join(AUTH_DIR, f))
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                _, diff = generate_ela(img, quality=90)
                features, _ = extract_features(diff)
                X.append(features)
                y.append(0)
            except Exception as e:
                print(f"Error loading {f}: {e}", flush=True)
                
    print("Extracting features from manipulated images...", flush=True)
    for f in os.listdir(TAMP_DIR):
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            try:
                img = Image.open(os.path.join(TAMP_DIR, f))
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                _, diff = generate_ela(img, quality=90)
                features, _ = extract_features(diff)
                X.append(features)
                y.append(1)
            except Exception as e:
                print(f"Error loading {f}: {e}", flush=True)
                
    return np.array(X), np.array(y)

def train_iteration(args):
    iteration, X, y = args
    start = time.time()
    random_state = 42 + iteration
    
    try:
        try:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_state, stratify=y)
        except ValueError:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_state)
            
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        clf = RandomForestClassifier(n_estimators=10, random_state=random_state, class_weight='balanced')
        clf.fit(X_train_scaled, y_train)
        
        y_pred = clf.predict(X_test_scaled)
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
    except Exception as e:
        acc, prec, rec, f1 = 0.0, 0.0, 0.0, 0.0
        
    exec_time = time.time() - start
    return iteration, acc, prec, rec, f1, exec_time

def main():
    target_loops = 50000
    X, y = load_data()
    
    if len(X) == 0:
        print("No valid images found!", flush=True)
        sys.exit(1)
        
    print(f"Loaded {len(X)} total images. Target loops: {target_loops}", flush=True)
    print("Starting massively parallel multithreaded evaluation...", flush=True)
    
    start_global = time.time()
    args_list = [(i, X, y) for i in range(1, target_loops + 1)]
    
    completed = 0
    file_lock = Lock()
    
    with open('iiei_50000.md', 'w', encoding='utf-8') as f:
        f.write("# EXTREME RIGOROUS 10,000 ITERATION AUDIT LOG\n\n")
        f.write(f"**Dataset Source**: {AUTH_DIR} (Authentic) | {TAMP_DIR} (Manipulated)\n\n")
    
    def process_and_write(arg):
        nonlocal completed
        res = train_iteration(arg)
        iteration, acc, prec, rec, f1, exec_time = res
        
        with file_lock:
            with open('iiei_50000.md', 'a', encoding='utf-8') as f:
                f.write(f"### Iteration {iteration}\n")
                f.write(f"- **Accuracy**: {acc*100:.2f}%\n")
                f.write(f"- **Precision**: {prec*100:.2f}%\n")
                f.write(f"- **Recall**: {rec*100:.2f}%\n")
                f.write(f"- **F1 Score**: {f1*100:.2f}%\n")
                f.write(f"- **Execution Time**: {exec_time:.5f}s\n\n")
            completed += 1
            if completed % 100 == 0:
                print(f"Completed {completed} / {target_loops} loops...", flush=True)
                
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
        executor.map(process_and_write, args_list)
                
    with open('iiei_50000.md', 'a', encoding='utf-8') as f:
        f.write(f"\n\n**Total Execution Time**: {time.time() - start_global:.2f} seconds\n")
        
    print("DONE! File written successfully.", flush=True)

if __name__ == "__main__":
    main()
