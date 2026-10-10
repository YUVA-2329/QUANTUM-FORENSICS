# 🕵️‍♂️ Quantum Forensics

Welcome to **Quantum Forensics**! Imagine you are a detective trying to figure out if a photograph is real or if someone secretly changed it using Photoshop. This project is a super-smart robot detective that does exactly that!

## 🌟 What does it do? (For a 2nd Grader!)
Sometimes people change pictures to hide things or make up fake stories. Our robot detective looks at pictures and finds the "hidden clues" to tell us if the picture is REAL (Authentic) or FAKE (Tampered).

We have two main parts that work together like best friends:
1. **The Face (Frontend):** This is the beautiful website you see. It lets you upload a photo easily!
2. **The Brain (Backend):** This is the hidden robot in the background that does the heavy thinking. It uses an "X-Ray" machine on the photo!

---

## 🧩 How does every piece of code work?

### 1. The X-Ray Machine (Error Level Analysis - ELA)
* **File:** `backend/engine.py`
* **What it does:** When you save a photo over and over, it loses a little bit of quality (like copying a drawing too many times). If someone pastes a fake UFO into a picture, the UFO will have a *different* quality than the sky. Our ELA code puts the picture through a special filter that makes the fake parts glow! We keep this picture completely inside our robot's memory (`io.BytesIO`) so it's super fast!

### 2. The Smart Trees (Random Forest AI Model)
* **File:** `backend/engine.py` and `backend/train.py`
* **What it does:** After the X-Ray is done, we need to decide if it's definitely fake. The code uses a "Random Forest". Imagine 100 smart trees looking at the X-Ray. Some trees look at the brightness, some look at the colors. They all take a vote. If the majority says "Fake!", our system flags it! 

### 3. The Robot Mailman (FastAPI Backend)
* **File:** `backend/main.py`
* **What it does:** This is the bridge. When you click "Upload" on the website, this mailman catches your photo and hands it to the Brain (the X-Ray and Smart Trees). Once the Brain makes a decision, the mailman runs back to the website and delivers the final answer!

### 4. The Website (React + Vite)
* **File:** `src/App.tsx` and `src/components/`
* **What it does:** This is the cool screen you look at. 
  - `LandingHero.tsx`: The welcoming front door. It has the text "Advanced Image Forensics".
  - `IntroSequence.tsx`: A cool 2-second animation that plays the *first* time you visit, just like a video game loading screen!
  - `App.tsx`: The boss of the website. It remembers if you've seen the intro using `localStorage` (a little notebook inside your browser).

### 5. The Tester (Audit Script)
* **File:** `audit.py`
* **What it does:** Imagine a teacher giving the robot a test. This script shows the robot 5,000 pictures really fast to make sure it gets the answers right. It then writes a report card to prove our robot is super smart!

---

## 🚀 How to Start the App!

If you want to run this on your own computer, open two separate terminal windows (like opening two black command boxes):

**Step 1: Start the Brain (Backend)**
```bash
cd backend
python main.py
```

**Step 2: Start the Face (Frontend)**
```bash
npm run dev
```

Then, open your web browser and go to `http://localhost:5000/`. Upload a picture and watch the magic happen! ✨
