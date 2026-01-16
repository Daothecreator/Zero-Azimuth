# PSO v2.0 - Phantom Sovereign Orchestrator

Полнофункциональная система для исследователей и специалистов по безопасности

## 🚀 Возможности

### Core Features
- **Vibe Coding** - Преобразование естественного языка в исполняемый код
- **AIEO (AI-Enhanced Event Orchestration)** - Трехуровневая система оркестрации событий
- **NATS JetStream** - Легковесная система обмена сообщениями (<15MB)
- **Quantum Security** - Квантовая криптография (QKD + PQC)
- **Blinding Method** - Метод заслепления с соотношением 999:1
- **Shadow Libraries** - Интеграция с Sci-Hub, LibGen, Anna's Archive

### Pentest & Security Tools
- **Port Scanning** - Nmap интеграция
- **Vulnerability Scanning** - Автоматическое обнаружение уязвимостей
- **Web Application Scanning** - Nikto, dirb, gobuster
- **SSL/TLS Analysis** - OpenSSL, testssl.sh
- **DNS Enumeration** - dig, DNS reconnaissance
- **Exploit Development** - Python, Ruby, Go, Bash, PowerShell
- **Network Sessions** - Управление активными сессиями

### Hardware Integration
- **Bluetooth** - Low Energy и Classic устройства
- **WiFi** - Сканирование сетей и точек доступа
- **USB** - Работа с USB устройствами
- **Serial** - RS232, UART соединения
- **RFID/NFC** - RFID и NFC устройства
- **SDR** - Software Defined Radio
- **GPIO** - General Purpose Input/Output

### Quantum Security
- **QKD (Quantum Key Distribution)** - BB84 протокол
- **PQC (Post-Quantum Cryptography)** - Kyber, Dilithium, Falcon
- **Quantum Sessions** - Управление квантовыми сессиями
- **Eavesdropping Detection** - Обнаружение подслушивания

## 🏗️ Архитектура

### Backend Stack
- **FastAPI** - Современный Python веб-фреймворк
- **PostgreSQL** - Основная база данных
- **Redis** - Кэширование и сессии
- **NATS JetStream** - Система обмена сообщениями
- **SQLAlchemy** - ORM для работы с базой данных
- **Pydantic** - Валидация данных

### Frontend Stack
- **React 18** - Современный UI фреймворк
- **TypeScript** - Типобезопасность
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - UI компоненты
- **Vite** - Быстрый сборщик

### Infrastructure
- **Docker & Docker Compose** - Контейнеризация
- **Nginx** - Reverse proxy и load balancer
- **Prometheus** - Метрики и мониторинг
- **Grafana** - Визуализация метрик

## 🚀 Быстрый старт

### Требования
- Docker и Docker Compose
- Python 3.11+ (для разработки)
- Node.js 18+ (для фронтенда)
- 8GB+ RAM
- 20GB+ свободного места

### Установка

1. **Клонируйте репозиторий**
```bash
git clone https://github.com/yourusername/pso-v2.git
cd pso-v2
```

2. **Запустите скрипт деплоя**
```bash
chmod +x deploy.sh
./deploy.sh
```

3. **Дождитесь завершения установки**
Скрипт автоматически:
- Создаст все необходимые конфигурации
- Запустит все сервисы
- Выполнит health check

### Ручная установка

1. **Создайте файл окружения**
```bash
cp .env.example .env
# Отредактируйте .env файл
```

2. **Запустите инфраструктуру**
```bash
docker-compose up -d postgres redis nats
```

3. **Установите зависимости бэкенда**
```bash
cd backend
pip install -r requirements.txt
```

4. **Запустите бэкенд**
```bash
python main.py
```

5. **Установите зависимости фронтенда**
```bash
cd ../app
npm install
```

6. **Запустите фронтенд**
```bash
npm run dev
```

## 🔐 Аутентификация

### Регистрация первого пользователя
1. Откройте http://localhost/docs
2. Найдите endpoint `/api/auth/register`
3. Создайте пользователя с role="admin"

### JWT Token
Система использует JWT токены для аутентификации. Токен действителен 7 дней.

## 📡 API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/register` - Регистрация
- `GET /api/auth/me` - Информация о текущем пользователе
- `POST /api/auth/refresh` - Обновление токена

### Сканы
- `POST /api/scans/` - Создать скан
- `GET /api/scans/` - Список сканов
- `GET /api/scans/{id}` - Детали скана
- `GET /api/scans/{id}/results` - Результаты скана
- `GET /api/scans/{id}/vulnerabilities` - Уязвимости

### Эксплойты
- `POST /api/exploits/` - Создать эксплойт
- `GET /api/exploits/` - Список эксплойтов
- `POST /api/exploits/{id}/execute` - Выполнить эксплойт
- `GET /api/exploits/{id}/executions` - История выполнений

### Сеть
- `POST /api/network/targets` - Добавить цель
- `GET /api/network/targets` - Список целей
- `POST /api/network/sessions` - Создать сессию
- `GET /api/network/sessions` - Активные сессии

### Аппаратное обеспечение
- `POST /api/hardware/devices` - Добавить устройство
- `GET /api/hardware/devices` - Список устройств
- `POST /api/hardware/sessions` - Создать сессию
- `POST /api/hardware/scan/{type}` - Сканировать устройства

### Квантовая безопасность
- `POST /api/quantum/session` - Создать квантовую сессию
- `POST /api/quantum/session/{id}/qkd` - QKD ключ
- `POST /api/quantum/encrypt` - Квантовое шифрование
- `POST /api/quantum/pqc/keypair` - PQC ключи

### База знаний
- `POST /api/knowledge/bases` - Создать базу знаний
- `POST /api/knowledge/papers` - Добавить статью
- `POST /api/knowledge/shadow-library/search` - Поиск в теневых библиотеках

### AIEO
- `GET /api/aieo/status` - Статус AIEO
- `POST /api/aieo/event` - Отправить событие
- `GET /api/aieo/metrics` - Метрики
- `GET /api/aieo/predictions` - Предсказания

## 🔧 Конфигурация

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# NATS
NATS_URL=nats://localhost:4222

# Security
SECRET_KEY=your_secret_key
ENCRYPTION_KEY=your_encryption_key

# Environment
ENVIRONMENT=development|production
```

### Docker Compose Services
- `postgres` - PostgreSQL база данных
- `redis` - Redis кэш
- `nats` - NATS JetStream
- `pso-backend` - FastAPI бэкенд
- `pso-frontend` - React фронтенд
- `nginx` - Reverse proxy
- `metasploit` - Metasploit Framework (опционально)
- `prometheus` - Метрики (опционально)
- `grafana` - Мониторинг (опционально)

## 🛡️ Безопасность

### Метод заслепления (Blinding Method)
- Соотношение шума к реальным данным: 999:1
- Рандомизация времени отправки
- Использование распределенных узлов
- Обфускация трафика

### Квантовая безопасность
- **QKD** - Quantum Key Distribution (BB84 протокол)
- **PQC** - Post-Quantum Cryptography
  - Kyber (KEM)
  - Dilithium (подпись)
  - Falcon (компактные подписи)

### Ролевая модель
- **Admin** - Полный доступ
- **Researcher** - Создание эксплойтов и исследования
- **Operator** - Запуск сканов и эксплойтов
- **Viewer** - Только просмотр

## 📊 Мониторинг

### Prometheus Metrics
- Системные метрики (CPU, RAM, Disk)
- Сетевой трафик
- Количество сканов
- Время выполнения задач
- Очереди NATS

### Grafana Dashboards
- System Overview
- Network Activity
- Scan Statistics
- Security Events
- AIEO Performance

### Health Checks
- `/health` - Общий health check
- `/health/db` - База данных
- `/health/redis` - Redis
- `/health/nats` - NATS

## 🧪 Разработка

### Структура проекта
```
pso-v2/
├── backend/              # FastAPI бэкенд
│   ├── main.py          # Точка входа
│   ├── config.py        # Конфигурация
│   ├── models/          # SQLAlchemy модели
│   ├── core/           # Ядро системы
│   ├── api/            # API endpoints
│   └── services/       # Сервисы
├── app/                # React фронтенд
│   ├── src/
│   │   ├── components/ # Компоненты
│   │   ├── hooks/      # Custom hooks
│   │   ├── utils/      # Утилиты
│   │   └── types/      # TypeScript типы
├── monitoring/         # Мониторинг
├── docker-compose.yml  # Docker Compose
├── Dockerfile         # Backend Dockerfile
└── deploy.sh          # Скрипт деплоя
```

### Добавление нового сканера
1. Создайте функцию в `backend/core/scanners/`
2. Добавьте модель данных в `backend/models/`
3. Создайте API endpoint в `backend/api/`
4. Добавьте UI компонент в `app/src/components/`

### Тестирование
```bash
# Unit тесты
cd backend
pytest

# Интеграционные тесты
docker-compose exec pso-backend pytest tests/integration/

# Нагрузочное тестирование
locust -f tests/load/locustfile.py
```

## 🔍 Устранение неполадок

### Логи
```bash
# Все логи
docker-compose logs -f

# Только бэкенд
docker-compose logs -f pso-backend

# Только конкретный сервис
docker-compose logs -f postgres
```

### Распространенные проблемы

1. **Не запускаются контейнеры**
   - Проверьте занятые порты
   - Убедитесь, что Docker запущен

2. **Ошибки базы данных**
   - Проверьте DATABASE_URL
   - Запустите миграции

3. **Redis connection refused**
   - Проверьте REDIS_HOST и REDIS_PORT
   - Убедитесь, что Redis контейнер запущен

4. **NATS connection failed**
   - Проверьте NATS_URL
   - Проверьте логи NATS контейнера

## 📄 Лицензия

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Участие

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Поддержка

- 📧 Email: support@pso-system.com
- 💬 Discord: [PSO Community](https://discord.gg/pso)
- 📖 Documentation: [docs.pso-system.com](https://docs.pso-system.com)

## 🙏 Благодарности

- Metasploit Framework
- Nmap Project
- NATS.io Team
- Quantum Computing Research Groups
- Cybersecurity Community

---

**⚠️ Важно**: Эта система предназначена исключительно для легальных исследовательских целей и тестирования на собственной инфраструктуре. Использование на чужих системах без разрешения является незаконным.