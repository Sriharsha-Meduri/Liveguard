# LiveGuard AI

Multi-dimensional video forensics system for detecting deepfakes, AI-generated content, and miscontextualized footage.

## 🎯 Overview

LiveGuard AI provides forensic analysis across three independent modules, each backed by a real pretrained model:
- **Deepfake Detection** - face detection (OpenCV YuNet) + a pretrained face-forgery classifier scored per detected face
- **AI-Generated Detection** - a pretrained AI-vs-real image classifier scored across sampled frames
- **Context Integrity** - CLIP zero-shot scene-vs-claim matching, temporal reuse (ResNet-50 embeddings), and lighting/time consistency

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- FFmpeg (for video processing)

### Backend Setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt      # installs CPU PyTorch by default
python app.py
```

Backend runs at `http://localhost:8000`.

**First run** downloads the pretrained models (~1.5 GB total: the deepfake
classifier, the AI-image classifier, and CLIP) and caches them, so the first
startup takes a few minutes. Subsequent starts take ~20 seconds. The YuNet face
detector (`backend/models/face_yunet.onnx`) is bundled.

**Optional GPU (NVIDIA):** for faster inference, install the CUDA build of
PyTorch instead (the code auto-detects and uses the GPU):

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu126
```

### Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

## 📁 Project Structure

```
liveguard-ai/
├── backend/
│   ├── app.py                      # FastAPI main application
│   ├── analyze_deepfake.py         # YuNet face detection + face-forgery classifier
│   ├── analyze_synthetic.py        # AI-generated image classifier
│   ├── analyze_context.py          # Context integrity (scene / reuse / lighting)
│   ├── temporal_analysis.py        # Reuse detection (ResNet-50 embeddings)
│   ├── contextual_analysis.py      # CLIP zero-shot scene-vs-claim
│   ├── environmental_analysis.py   # Lighting/time consistency
│   ├── models/                     # face_yunet.onnx, reference_embeddings.pkl
│   └── requirements.txt            # Python dependencies
├── index.tsx                       # React frontend (single-file)
├── index.html                      # HTML entry point
└── package.json                    # Node dependencies
```

## 🔬 Technical Architecture

### Module 01: Deepfake Detection
- **Models**: OpenCV YuNet (face detection) + `dima806/deepfake_vs_real_image_detection` (ViT face-forgery classifier)
- **Method**: detect faces per frame, crop, and score each face for manipulation; aggregate to a risk score. Videos with no faces return LOW (nothing to assess).
- **Output**: Manipulation likelihood (0-100)

### Module 02: AI-Generated Detection
- **Model**: `umm-maybe/AI-image-detector` (ViT, real-vs-artificial)
- **Method**: classify each sampled frame as real vs AI-generated and aggregate the mean "artificial" probability plus per-frame agreement.
- **Output**: Synthetic-media likelihood (0-100)

### Module 03: Context Integrity
- **Models**: CLIP-ViT-Base/32 (zero-shot scene classification) + ResNet-50 (reuse embeddings)
- **Method**: multi-signal aggregation — scene-vs-claim mismatch (CLIP), temporal reuse against a reference set (cosine similarity), and lighting/time consistency (brightness heuristics).
- **Output**: Context-integrity risk score (0-100)

## 🎨 Frontend Features

- **Three Independent Analysis Sections** - Separate UI for each forensic module
- **Real-time Processing** - Upload video and receive results in < 60 seconds
- **Explainable Results** - Detailed forensic evidence for each module
- **Modern UI** - Brutalist design with TailwindCSS

## 📡 API Usage

### Analyze Video

```bash
POST http://localhost:8000/analyze/deepfake
POST http://localhost:8000/analyze/synthetic
POST http://localhost:8000/analyze/context

Content-Type: multipart/form-data

video: <file>
claim: "Video description text" (for context module only)
```

### Response Format

```json
{
  "riskScore": 99.8,
  "riskLevel": "HIGH",
  "summary": "Detailed analysis summary",
  "signals": {
    "forensic": {
      "name": "Deepfake Manipulation Likelihood",
      "status": "fail",
      "confidence": 0.8,
      "details": "Analyzed 6 detected face(s) ..."
    },
    "temporal": {
      "name": "Face-level Detection Consistency",
      "status": "pass",
      "confidence": 0.99,
      "details": "Face-level score consistency: 99.9% ..."
    }
  }
}
```

`riskLevel` is `LOW` / `MEDIUM` / `HIGH`. Each signal's `status` is `pass` / `warn` / `fail`.

## 🛠️ Tech Stack

**Backend:**
- FastAPI
- PyTorch + Hugging Face Transformers
- OpenCV (YuNet face detection)
- OpenAI CLIP (ViT-B/32), ResNet-50
- Pretrained detectors: `dima806/deepfake_vs_real_image_detection`, `umm-maybe/AI-image-detector`

**Frontend:**
- React 19
- TypeScript
- TailwindCSS
- Vite
- Lucide Icons

## 📊 Performance

- **Analysis Speed**: ~3-10 seconds per module on CPU (faster on GPU)
- **Video Duration**: 5-20 seconds (enforced)
- **Supported Formats**: MP4, MOV
- **Max File Size**: 100MB

## 🔒 Privacy & Security

- No biometric identification - only manipulation pattern detection
- Stateless processing - videos not permanently stored
- TLS encryption for data transmission
- No user data training

## 👨‍💻 Developer

**Sriharsha Meduri**
- BTech IT Student at Andhra University
- ML Engineer | Cybersecurity Enthusiast
- Portfolio: [sriharshameduri.netlify.app](https://sriharshameduri.netlify.app/)
- GitHub: [Sriharsha-Meduri](https://github.com/Sriharsha-Meduri)

## 📄 License

This is a technical demonstration project.

## 🙏 Acknowledgments

- [`dima806/deepfake_vs_real_image_detection`](https://huggingface.co/dima806/deepfake_vs_real_image_detection) - deepfake face classifier
- [`umm-maybe/AI-image-detector`](https://huggingface.co/umm-maybe/AI-image-detector) - AI-generated image classifier
- OpenAI CLIP and torchvision ResNet-50
- OpenCV YuNet face detector
- Hugging Face Transformers and the PyTorch community
