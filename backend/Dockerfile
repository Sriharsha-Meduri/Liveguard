# LiveGuard AI backend — deployable on Hugging Face Spaces (Docker SDK) or any Docker host.
FROM python:3.10-slim

# System libraries for OpenCV and video decoding.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip: the base image's pip 23.0.1 wrongly rejects the PyTorch index's
# typing_extensions/jinja2 wheels over a name-normalization bug. Newer pip fixes it.
RUN pip install --no-cache-dir --upgrade pip

# CPU-only PyTorch (no CUDA needed on the free Spaces CPU tier; much smaller).
# Pin >= 2.6: transformers refuses to load .bin model weights on older torch (CVE-2025-32434).
RUN pip install --no-cache-dir torch==2.7.1 torchvision==0.22.1 --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Cache models inside the image so cold starts are fast (no ~1.5GB runtime download).
ENV HF_HOME=/app/hf_cache \
    TRANSFORMERS_CACHE=/app/hf_cache \
    TORCH_HOME=/app/torch_cache
RUN mkdir -p /app/hf_cache /app/torch_cache && \
    python -c "from transformers import pipeline; \
pipeline('image-classification', model='dima806/deepfake_vs_real_image_detection'); \
pipeline('image-classification', model='umm-maybe/AI-image-detector'); \
pipeline('zero-shot-image-classification', model='openai/clip-vit-base-patch32')" && \
    python -c "import torchvision.models as m; m.resnet50(weights=m.ResNet50_Weights.DEFAULT)" && \
    chmod -R 777 /app/hf_cache /app/torch_cache

COPY . .

# Writable runtime dirs (Spaces may run the app as a non-root user).
ENV MPLCONFIGDIR=/tmp/mpl \
    PROVENANCE_TEMP=/tmp/provenance \
    PORT=7860

EXPOSE 7860

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
