from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import librosa
import io

app = FastAPI(title="UrbanNoiseNet API")

# Allow the frontend to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now, allow all — we'll tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and label encoder
model = joblib.load("noise_classifier_model.pkl")
label_encoder = joblib.load("label_encoder.pkl")

@app.get("/")
def root():
    return {"status": "UrbanNoiseNet API is running"}

@app.post("/classify")
async def classify_audio(
    file: UploadFile = File(...),
    lat: float = Form(None),
    lng: float = Form(None)
):
    audio_bytes = await file.read()
    audio, sr = librosa.load(io.BytesIO(audio_bytes), duration=4)

    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    mfccs_mean = np.mean(mfccs.T, axis=0).reshape(1, -1)

    prediction = model.predict(mfccs_mean)[0]
    probabilities = model.predict_proba(mfccs_mean)[0]
    confidence = float(np.max(probabilities)) * 100

    classification = label_encoder.inverse_transform([prediction])[0]

    peak_db = float(np.max(librosa.amplitude_to_db(np.abs(librosa.stft(audio)))))

    return {
        "classification": classification,
        "confidence": round(confidence, 2),
        "peak_db": round(peak_db, 2),
        "gps": {"lat": lat, "lng": lng}
    }