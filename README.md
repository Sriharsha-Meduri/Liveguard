# LiveGuard AI

Multi-dimensional video forensics system for detecting deepfakes, AI-generated content, and miscontextualized footage.

## 🎯 Overview

LiveGuard AI provides comprehensive forensic analysis across three independent modules:
- **Deepfake Detection** - GenD model with CLIP-L/14 encoder
- **AI-Generated Detection** - D3 training-free method using temporal statistics
- **Context Integrity** - Temporal reuse and semantic alignment analysis

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- FFmpeg (for video processing)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs at `http://localhost:8000`

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
│   ├── analyze_deepfake.py         # GenD deepfake detection module
│   ├── analyze_synthetic.py        # D3 AI-generated detection module
│   ├── analyze_context.py          # Context integrity module
│   ├── scoring.py                  # Risk scoring logic
│   └── requirements.txt            # Python dependencies
├── index.tsx                       # React frontend (single-file)
├── index.html                      # HTML entry point
└── package.json                    # Node dependencies
```

## 🔬 Technical Architecture

### Module 01: Deepfake Detection (GenD)
- **Model**: OpenAI CLIP-ViT-Large/14
- **Method**: Feature-space metric learning
- **Output**: Manipulation artifact score (0-100)

### Module 02: AI-Generated Detection (D3)
- **Model**: XCLIP / CLIP-ViT-Base-32
- **Method**: Training-free statistical calibration
- **Output**: Synthetic pattern confidence (0-100)

### Module 03: Context Integrity
- **Model**: ResNet-50, Scene classification
- **Method**: Multi-signal aggregation
- **Output**: Temporal/spatial inconsistency score (0-100)

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
  "riskScore": 75.5,
  "riskLevel": "HIGH",
  "summary": "Detailed analysis summary",
  "confidence": 0.85,
  "details": {
    "findings": ["Finding 1", "Finding 2"],
    "evidence": "Supporting forensic evidence"
  }
}
```

## 🛠️ Tech Stack

**Backend:**
- FastAPI
- PyTorch
- OpenAI CLIP
- ResNet-50
- FFmpeg

**Frontend:**
- React 19
- TypeScript
- TailwindCSS
- Vite
- Lucide Icons

## 📊 Performance

- **Analysis Speed**: < 20 seconds per module
- **Video Duration**: 5-20 seconds
- **Supported Formats**: MP4, MOV, WebM
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

- GenD: Generalized Deepfake Detection
- D3: Training-Free Detection for AI-Generated Videos
- OpenAI CLIP
- PyTorch Community
