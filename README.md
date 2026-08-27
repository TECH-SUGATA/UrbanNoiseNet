<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-00e5ff?style=for-the-badge&labelColor=0a0a0f" alt="Version"/>
<img src="https://img.shields.io/badge/status-live-00ff88?style=for-the-badge&labelColor=0a0a0f" alt="Status"/>
<img src="https://img.shields.io/badge/license-MIT-a78bfa?style=for-the-badge&labelColor=0a0a0f" alt="License"/>
<img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=0a0a0f" alt="Python"/>
<img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=0a0a0f" alt="FastAPI"/>
<img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black&labelColor=0a0a0f" alt="React"/>

<br/><br/>

```
██╗   ██╗██████╗ ██████╗  █████╗ ███╗   ██╗███╗   ██╗ ██████╗ ██╗███████╗███████╗███╗   ██╗███████╗████████╗
██║   ██║██╔══██╗██╔══██╗██╔══██╗████╗  ██║████╗  ██║██╔═══██╗██║██╔════╝██╔════╝████╗  ██║██╔════╝╚══██╔══╝
██║   ██║██████╔╝██████╔╝███████║██╔██╗ ██║██╔██╗ ██║██║   ██║██║███████╗█████╗  ██╔██╗ ██║█████╗     ██║   
██║   ██║██╔══██╗██╔══██╗██╔══██║██║╚██╗██║██║╚██╗██║██║   ██║██║╚════██║██╔══╝  ██║╚██╗██║██╔══╝     ██║   
╚██████╔╝██║  ██║██████╔╝██║  ██║██║ ╚████║██║ ╚████║╚██████╔╝██║███████║███████╗██║ ╚████║███████╗   ██║   
 ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝   ╚═╝   
```

### **Smart City Acoustic Intelligence & Civic Enforcement Platform**
**Listen to the city. Classify the noise. Enforce the peace.**

<br/>

[![🚀 Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-UrbanNoiseNet-00e5ff?style=for-the-badge&labelColor=0a0a0f)](https://urban-noise-net.vercel.app)
[![API Docs](https://img.shields.io/badge/📡_API_DOCS-Swagger_UI-00ff88?style=for-the-badge&labelColor=0a0a0f)](https://urbannoisenet-backend.onrender.com/docs)
[![GitHub Repo](https://img.shields.io/badge/📁_GITHUB-TECH--SUGATA%2FUrbanNoiseNet-ffffff?style=for-the-badge&logo=github&logoColor=white&labelColor=0a0a0f)](https://github.com/TECH-SUGATA/UrbanNoiseNet)
[![Python](https://img.shields.io/badge/🐍_PYTHON-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/🧠_ML-RANDOM_FOREST-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)

<br/><br/>

</div>

---

## ✦ Product Snapshot

**UrbanNoiseNet** turns a browser microphone into a live acoustic sensor — classifying urban noise in real time and routing it straight into a full civic enforcement pipeline: geofenced zones, automated e-challans, emergency dispatch, and a public citizen complaint portal.

**Core stack:** Python • FastAPI • scikit-learn • librosa • React • Vite • Tailwind • Render • Vercel

## 🖼️ Project Preview

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="UrbanNoiseNet Command Center Dashboard" width="900">
</p>

<p align="center">
  <b>UrbanNoiseNet — Live Acoustic Command Center</b><br>
  Real-time telemetry, live classification results, and a geofenced acoustic map — all in one dashboard.
</p>

### 🚀 Live Demo

**[Open UrbanNoiseNet →](https://urban-noise-net.vercel.app)**

> Allow microphone permission in your browser to run live acoustic classification.

---

## ✦ Table of Contents

- [Overview](#-overview)
- [Feature Modules](#-feature-modules)
- [Screenshots](#-screenshots)
- [Classification Pipeline](#-classification-pipeline)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Model Performance](#-model-performance)
- [Use Cases](#-use-cases)
- [Roadmap](#-roadmap--future-enhancements)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)
- [Author](#-author)

---

## ✦ Overview

**UrbanNoiseNet** is a full-stack acoustic intelligence system that identifies the *source* of urban noise — sirens, traffic, construction, horns, and more — from a live audio sample, and feeds that classification into a real civic enforcement workflow.

The application captures audio through the Web Audio API, extracts MFCC features server-side, and classifies the source using a Random Forest model trained on thousands of real labeled urban sound clips.

> *"Turn a microphone into municipal-grade acoustic enforcement."*

### Core interaction

| Input | Action |
|---|---|
| 🎙️ Microphone capture | Records a 3–4s live audio sample from the browser |
| 🧠 ML classification | Identifies the noise source and confidence score |
| 📍 GPS metadata | Tags the reading to a real map location |
| 🗺️ Zone engine | Matches the reading against geofenced decibel thresholds |
| 🚨 Auto-enforcement | Issues an e-challan when thresholds are breached |
| 🚓 Dispatch | Routes the nearest patrol unit to critical violations |
| 📣 Citizen portal | Lets residents file and track their own noise complaints |

---

## ✦ Feature Modules

| Capability | Description |
|---|---|
| 🎙️ **Live Acoustic Capture** | Real-time microphone capture via the Web Audio API, streamed for on-demand ML inference |
| 🧠 **ML Classification Engine** | MFCC feature extraction + Random Forest classifier trained on 8,700+ labeled urban audio samples |
| 🗺️ **Geofenced Zone Management** | Draw custom acoustic monitoring zones with per-zone decibel thresholds and curfew rules |
| 🚨 **Automated E-Challan System** | Auto-generates enforceable citations with audit hashes and printable PDF records |
| 🚓 **Emergency Dispatch Console** | 4-step automated dispatch stepper with nearest-unit routing and live GPS tracking |
| 📣 **Citizen Grievance Portal** | Public-facing complaint submission with GPS auto-detect and live ticket tracking |
| 📊 **Predictive Analytics** | Time-series forecasting of ambient noise vs. WHO guideline thresholds, with weekly exceedance heatmaps |

---

## ✦ Screenshots

<div align="center">
<img src="docs/screenshots/dashboard.png" alt="UrbanNoiseNet Command Center" width="96%"/>
</div>

> **Live command center:** real-time telemetry, microphone-driven inference, and a geofenced acoustic map in one view.

<table>
<tr>
<td width="50%"><img src="docs/screenshots/zones.png" alt="Zone Management"/><p align="center"><sub>Acoustic Geofencing & Zone Management</sub></p></td>
<td width="50%"><img src="docs/screenshots/challans.png" alt="E-Challan Ledger"/><p align="center"><sub>E-Challan Citation Ledger</sub></p></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/dispatch.png" alt="Emergency Dispatch"/><p align="center"><sub>Emergency Acoustic Dispatch</sub></p></td>
<td width="50%"><img src="docs/screenshots/analytics.png" alt="Analytics Dashboard"/><p align="center"><sub>Telemetry Trends & AI Forecasting</sub></p></td>
</tr>
</table>

---

## ✦ Classification Pipeline

### Capture

```text
BROWSER MICROPHONE
        🎙️
         ↓
  RECORD 3–4s CLIP
         ↓
  SEND TO /classify
```

### Inference

```text
AUDIO BLOB
    ↓
LIBROSA — MFCC EXTRACTION (40 coefficients)
    ↓
RANDOM FOREST CLASSIFIER
    ↓
LABEL + CONFIDENCE + PEAK dB
```

### Enforcement

```text
CLASSIFICATION RESULT
        ↓
  ZONE THRESHOLD CHECK
        ↓
 ┌──────────────┴──────────────┐
 ▼                              ▼
WITHIN LIMIT               THRESHOLD EXCEEDED
 ↓                              ↓
LOGGED TO TELEMETRY      E-CHALLAN + DISPATCH
```

> **Implementation note:** the project uses a classical ML pipeline — MFCC feature extraction feeding a Random Forest classifier — trained end-to-end on the UrbanSound8K dataset, not a pre-trained third-party audio API.

---

## ✦ Tech Stack

### Backend

![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend_API-009688?style=flat-square&logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-Random_Forest-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)
![librosa](https://img.shields.io/badge/librosa-Audio_Processing-4B8BBE?style=flat-square)
![Uvicorn](https://img.shields.io/badge/Uvicorn-ASGI_Server-2F9E44?style=flat-square)

### Frontend

![React](https://img.shields.io/badge/React-UI_Framework-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

### Deployment

![Render](https://img.shields.io/badge/Render-Backend_Hosting-46E3B7?style=flat-square&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Frontend_Hosting-000000?style=flat-square&logo=vercel&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Version_Control-181717?style=flat-square&logo=github&logoColor=white)

**Dataset:** [UrbanSound8K](https://urbansounddataset.weebly.com/urbansound8k.html) — 8,732 labeled urban sound excerpts across 10 classes.

---

## ✦ System Architecture

```text
                  ┌──────────────────────┐
                  │  BROWSER MICROPHONE   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  REACT + VITE (UI)   │
                  │      (Vercel)         │
                  └──────────┬───────────┘
                             │  multipart/form-data
                             ▼
                  ┌──────────────────────┐
                  │   FASTAPI BACKEND     │
                  │      (Render)          │
                  └──────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
      ┌─────────────────┐       ┌─────────────────┐
      │ LIBROSA (MFCC)   │       │  GPS METADATA    │
      │ Feature Extract  │       │  Tagging         │
      └────────┬────────┘       └────────┬────────┘
               └────────────┬────────────┘
                            ▼
                  ┌──────────────────────┐
                  │ RANDOM FOREST MODEL  │
                  │  (scikit-learn)        │
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │ CLASSIFICATION +     │
                  │ CONFIDENCE + dB      │
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │ ZONES • CHALLANS •   │
                  │ DISPATCH • ANALYTICS │
                  └──────────────────────┘
```

---

## ✦ Project Structure

```text
UrbanNoiseNet/
│
├── 📁 backend/
│   ├── main.py                    # FastAPI app & /classify endpoint
│   ├── requirements.txt
│   ├── noise_classifier_model.pkl # Trained Random Forest model
│   └── label_encoder.pkl          # Class label encoder
│
├── 📁 frontend/
│   ├── src/                       # React application source
│   ├── assets/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json                # SPA routing config
│
├── 📁 docs/
│   └── screenshots/
│
├── 📄 README.md
└── 📄 LICENSE
```

---

## ✦ Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- `pip`, `npm`

### 1. Clone the repository

```bash
git clone https://github.com/TECH-SUGATA/UrbanNoiseNet.git
cd UrbanNoiseNet
```

### 2. Run the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API available at `http://127.0.0.1:8000` — interactive docs at `http://127.0.0.1:8000/docs`.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Set your backend URL in an `.env` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## ✦ API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/classify` | Accepts an audio file (`multipart/form-data`) + optional GPS coordinates → returns classification, confidence, peak dB |

<details>
<summary><strong>Example response</strong></summary>

```json
{
  "classification": "siren",
  "confidence": 94.2,
  "peak_db": 91.6,
  "gps": { "lat": 22.5598, "lng": 88.4981 }
}
```
</details>

---

## ✦ Model Performance

Trained on 8,732 real audio samples (80/20 train-test split, stratified) using 40-coefficient MFCC feature vectors.

| Metric | Score |
|---|---|
| **Overall Accuracy** | **87.75%** |
| Test samples | 1,747 |
| Best-performing class | `air_conditioner` (F1: 0.96) |
| Safety-critical: `siren` | F1: 0.92 |
| Safety-critical: `car_horn` | F1: 0.87 |

<details>
<summary><strong>Full classification report</strong></summary>

```text
                   precision   recall   f1-score   support
air_conditioner       0.97      0.95      0.96       200
car_horn              0.97      0.79      0.87        86
children_playing      0.77      0.87      0.82       200
dog_bark               0.82      0.75      0.79       200
drilling                0.90      0.86      0.88       200
engine_idling           0.95      0.96      0.95       200
gun_shot                 0.94      0.64      0.76        75
jackhammer               0.89      0.94      0.91       200
siren                     0.91      0.94      0.92       186
street_music              0.78      0.88      0.83       200

accuracy                                     0.88      1747
macro avg              0.89      0.86      0.87      1747
weighted avg            0.88      0.88      0.88      1747
```
</details>

---

## ✦ Use Cases

- 🏙️ Municipal noise-pollution monitoring
- 🚨 Automated emergency-siren detection at intersections
- 🏗️ Construction noise-curfew enforcement
- 🚓 Traffic and illegal-horn violation tracking
- 📣 Public grievance and civic complaint intake
- 📊 Urban planning and acoustic-exposure research
- 🎓 College mini-project / final-year prototype
- 💼 Portfolio and GitHub showcase

---

## ✦ Roadmap & Future Enhancements

### Phase 2 — Intelligence

- 🧠 CNN-on-spectrogram benchmark vs. current Random Forest baseline
- 📍 Multi-sensor triangulation for noise-source localization
- 🔊 Continuous streaming inference (not just discrete clips)

### Phase 3 — Hardware

- 🔌 Real sensor-node integration (Raspberry Pi + INMP441 mic array)
- 🌐 Edge inference for offline zones
- 📡 LoRaWAN telemetry for low-power city-wide sensors

### Phase 4 — Civic Scale

- 📱 Native mobile app for citizen reporting
- 🗂️ Historical trend export & municipal reporting dashboard
- 👥 Multi-department role-based access control

---

## ✦ Troubleshooting

### Microphone not detected

Check browser microphone permissions and confirm no other application is using the mic.

### `requirements.txt` not found

Make sure your terminal is inside the `backend/` folder before running `pip install`.

### Backend shows "Offline / Demo Mode"

Confirm `VITE_API_BASE_URL` points to your live Render URL, not `localhost`, and that the Render service is awake (free-tier instances sleep after inactivity — first request can take ~30–50s).

### Classification confidence seems low

MFCC-based classification performs best on audio similar to its training domain (urban ambient sound). Compressed voice clips or unrelated audio may return lower confidence — this is expected model behavior, not a bug.

---

## ✦ Project Value

| Area | Demonstrated Skill |
|---|---|
| Machine Learning | Feature engineering (MFCC) + classical classifier training |
| Backend Engineering | REST API design, model serving with FastAPI |
| Frontend Engineering | Real-time browser audio capture, dashboard UX |
| Systems Design | End-to-end pipeline from sensor input to enforcement action |
| DevOps | Multi-service deployment across Render & Vercel |
| Git / GitHub | Monorepo structuring and version control |

### Why UrbanNoiseNet stands out

UrbanNoiseNet is not a UI mockup — it is a **fully trained, deployed, and end-to-end functioning ML system**, connecting real audio inference to a complete civic enforcement workflow.

---

## ✦ License

This project is licensed under the **MIT License**.

```text
MIT License — Copyright (c) 2026 TECH-SUGATA
```

---

## ✦ Author

<div align="center">

### **Sugata Nayak**
**TECH-SUGATA**

[![GitHub](https://img.shields.io/badge/GitHub-TECH--SUGATA-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/TECH-SUGATA)
[![Live Demo](https://img.shields.io/badge/Live_Demo-UrbanNoiseNet-00e5ff?style=for-the-badge&labelColor=0a0a0f)](https://urban-noise-net.vercel.app)

<br/><br/>

**Built with FastAPI • scikit-learn • React • Vite**

⭐ If you find this project useful, consider giving the repository a star.

</div>
