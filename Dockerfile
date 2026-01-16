FROM python:3.11-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    netcat \
    tcpdump \
    nmap \
    nikto \
    sqlmap \
    john \
    hydra \
    hashcat \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Python зависимости
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Копируем приложение
COPY . /app
WORKDIR /app

# Создаем пользователя
RUN useradd -m -u 1000 pso && chown -R pso:pso /app
USER pso

# Экспортируем порт
EXPOSE 8000

# Запускаем приложение
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
