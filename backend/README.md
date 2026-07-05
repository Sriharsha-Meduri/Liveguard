---
title: Provenance Backend
emoji: 🛡️
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Provenance - Backend

Video forensics API (FastAPI) for the [Provenance](https://github.com/Sriharsha-Meduri/Provenance) project.

This folder is deployable as a **Hugging Face Space (Docker SDK)**. When pushed to
a Space, Hugging Face builds the `Dockerfile` and serves the API on port 7860.

## Endpoints
- `GET  /health`
- `POST /analyze/deepfake` - form field `video`
- `POST /analyze/synthetic` - form field `video`
- `POST /analyze/context` - form fields `video`, `claim`

Interactive docs at `/docs`.

## Run locally
```bash
python -m venv .venv && .venv\Scripts\activate   # (Windows)
pip install -r requirements.txt
python app.py    # http://localhost:8000
```

The pretrained models (deepfake, AI-image, CLIP) download on first run.
