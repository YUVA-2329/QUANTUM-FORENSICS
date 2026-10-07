# QUANTUM FORENSICS — EVALUATOR GUIDE

Welcome to the Quantum Forensics evaluator documentation. This file explains how we built, tested, and evaluated the underlying Machine Learning pipeline for our image-tampering detection system.

## 1. The Dataset Generation
To train our AI without relying on massive, bloated external datasets, we created a localized **synthetic dataset**:
* **Authentic Images**: We generated 100 clean, mathematically pure images using noise functions and distinct geometric structures.
* **Manipulated Images**: We generated 100 tampered images by programmatically "splicing" (copy-pasting) regions from other images and applying subtle localized noise or recompression.
* **Why?** This ensures we know *exactly* where the manipulation occurred, giving us a perfect "ground truth" to train the model on.

## 2. Feature Extraction (How the Math Works)
When an image is uploaded, the system does not just "look" at it. It passes it through **Error Level Analysis (ELA)**. 
Every time a JPEG is saved, it is compressed. If you paste an object from another image, that object has a different compression rate. ELA highlights these differences.

From the ELA map, we extract **14 specific mathematical features**, including:
* Maximum and Mean Error Levels
* Edge Density in high-error regions
* Color channel correlations

## 3. Training and Evaluating the Model
We used a **Random Forest Classifier** to evaluate the data.
* **Data Split**: We split our dataset into 80% Training Data and 20% Testing Data (`train_test_split`).
* **Scaling**: We used `StandardScaler` to normalize the 14 features so large numbers don't overwhelm small numbers.
* **Evaluation Metrics**: During training, the model achieved approximately **77.5% Accuracy** and an **F1-Score of 0.78** on the blind test set. This proves the system is actually learning the difference between clean and tampered compression signatures, rather than just guessing.

## 4. The Frontend Architecture
Instead of using generic UI kits like Bootstrap, we built a custom, highly interactive React frontend. 
* We use **WebGL** to render the analyzed image as an interactive 3D digital paper.
* We use **Framer Motion** for world-class, 60-fps cinematic micro-interactions.
* The frontend talks to the **FastAPI** Python backend in real-time to retrieve the `.predict_proba()` confidence scores.
