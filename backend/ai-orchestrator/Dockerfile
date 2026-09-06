# ====================================
# Dockerfile para AI Orchestrator
# ====================================

FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-spa \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Crear directorio para logs
RUN mkdir -p logs

# Exponer puerto
EXPOSE 8001

# Variables de entorno (pueden sobrescribirse)
ENV HOST=0.0.0.0
ENV PORT=8001
ENV PYTHONUNBUFFERED=1

# Comando de inicio
CMD ["python", "main.py"]
