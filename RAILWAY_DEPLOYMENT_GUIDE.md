# 🚄 Развертывание Decorify на Railway

## 📋 Обзор

Этот документ содержит полную инструкцию по развертыванию мультивендорного маркетплейса Decorify на платформе Railway.

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Микросервисы  │    │   Базы данных   │
│                 │    │                 │    │                 │
│ • REST API      │◄──►│ • Auth Service  │◄──►│ • PostgreSQL    │
│ • HTTPS/SSL     │    │ • Product Svc   │    │ • Redis         │
│ • Rate Limiting │    │ • Order Service │    │                 │
│ • Auth Guards   │    │ • Payment Svc   │    │                 │
│ • Swagger Docs  │    │ • Vendor Svc    │    │                 │
│                 │    │ • Cart Service  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Быстрый старт

### 1. Предварительные требования

```bash
# Установка Node.js 18+
node --version  # v18.x.x или выше

# Установка Railway CLI
npm install -g @railway/cli

# Логин в Railway
railway login
```

### 2. Автоматический деплой

```bash
# Клонируем проект (если еще не сделано)
git clone https://github.com/your-username/decorify.git
cd decorify

# Запускаем автоматический деплой
./scripts/deploy-railway.sh
```

### 3. Ручной деплой (пошаговый)

#### 3.1 Создание проекта

```bash
# Создаем новый проект
railway new
# Выбираем "Empty Project"
# Называем "decorify-marketplace"

# Связываем с GitHub репозиторием
railway connect github.com/your-username/decorify
```

#### 3.2 Добавление баз данных

```bash
# Добавляем PostgreSQL
railway add postgresql

# Добавляем Redis
railway add redis
```

#### 3.3 Деплой сервисов

```bash
# 1. Auth Service
railway service new auth
railway service use auth
railway variables set NODE_ENV=production
railway variables set SERVICE_NAME=auth
railway variables set PORT=50051
railway up --detach

# 2. Product Service
railway service new product
railway service use product
railway variables set NODE_ENV=production
railway variables set SERVICE_NAME=product
railway variables set PORT=50052
railway up --detach

# 3. Order Service
railway service new order
railway service use order
railway variables set NODE_ENV=production
railway variables set SERVICE_NAME=order
railway variables set PORT=50053
railway up --detach

# 4. Payment Service
railway service new payment
railway service use payment
railway variables set NODE_ENV=production
railway variables set SERVICE_NAME=payment
railway variables set PORT=50054
railway up --detach

# 5. Vendor Service
railway service new vendor
railway service use vendor
railway variables set NODE_ENV=production
railway variables set SERVICE_NAME=vendor
railway variables set PORT=50055
railway up --detach

# 6. Cart Service
railway service new cart
railway service use cart
railway variables set NODE_ENV=production
railway variables set SERVICE_NAME=cart
railway variables set PORT=50056
railway up --detach

# 7. API Gateway (последним!)
railway service new api-gateway
railway service use api-gateway
railway variables set NODE_ENV=production
railway variables set SERVICE_NAME=api-gateway
railway up --detach
```

## ⚙️ Настройка переменных окружения

### Общие переменные для всех сервисов

```bash
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=$DATABASE_URL
railway variables set REDIS_URL=$REDIS_URL
railway variables set JWT_SECRET="your-super-secure-jwt-secret-256-bits"
```

### Специфичные переменные для API Gateway

```bash
railway service use api-gateway
railway variables set ALLOWED_ORIGINS="https://your-domain.com,https://www.your-domain.com"
railway variables set RATE_LIMIT_TTL=60
railway variables set RATE_LIMIT_MAX=100
```

### Переменные для Payment Service

```bash
railway service use payment
railway variables set STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
railway variables set STRIPE_PUBLISHABLE_KEY="pk_live_your_publishable_key"
railway variables set STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

### Переменные для уведомлений

```bash
# Для любого сервиса отправляющего email
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT=587
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASSWORD="your-app-password"
```

## 🔧 Настройка внутренней сети

Railway автоматически создает private URLs для сервисов:

```bash
# Получаем URL сервисов
AUTH_URL=$(railway service use auth && railway status --json | jq -r '.url')
PRODUCT_URL=$(railway service use product && railway status --json | jq -r '.url')
ORDER_URL=$(railway service use order && railway status --json | jq -r '.url')
PAYMENT_URL=$(railway service use payment && railway status --json | jq -r '.url')
VENDOR_URL=$(railway service use vendor && railway status --json | jq -r '.url')
CART_URL=$(railway service use cart && railway status --json | jq -r '.url')

# Устанавливаем их в API Gateway
railway service use api-gateway
railway variables set AUTH_SERVICE_URL=$AUTH_URL
railway variables set PRODUCT_SERVICE_URL=$PRODUCT_URL
railway variables set ORDER_SERVICE_URL=$ORDER_URL
railway variables set PAYMENT_SERVICE_URL=$PAYMENT_URL
railway variables set VENDOR_SERVICE_URL=$VENDOR_URL
railway variables set CART_SERVICE_URL=$CART_URL
```

## 🌐 Настройка домена

```bash
# Добавляем custom domain к API Gateway
railway service use api-gateway
railway domain add yourdomain.com

# Настраиваем DNS записы:
# A record: yourdomain.com -> Railway IP
# CNAME: www.yourdomain.com -> yourdomain.com
```

## 📊 Мониторинг и логи

### Проверка статуса всех сервисов

```bash
# Используем наш скрипт
./scripts/railway-status.sh

# Или вручную
railway status
```

### Просмотр логов

```bash
# Логи в реальном времени для всех сервисов
railway logs --follow

# Логи конкретного сервиса
railway service use api-gateway
railway logs --follow
```

### Health checks

```bash
# Проверка API Gateway
curl https://yourdomain.com/health

# Ответ должен быть:
{
  "status": "ok",
  "service": "api-gateway",
  "timestamp": "2024-12-10T15:30:45.123Z",
  "uptime": 12345.67,
  "environment": "production",
  "version": "1.0.0",
  "railway": {
    "deployment_id": "xxx",
    "replica_id": "yyy"
  }
}
```

## 🗄️ Управление базой данных

### Применение миграций

```bash
# Подключаемся к любому сервису с доступом к БД
railway service use api-gateway

# Применяем миграции
railway run npm run prisma:migrate:deploy

# Проверяем состояние БД
railway run npx prisma db push --preview-feature
```

### Резервное копирование

```bash
# Экспорт данных
railway service use postgresql
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## 🔄 CI/CD с GitHub Actions

Создайте `.github/workflows/railway-deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run build:all

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Install Railway
        run: npm install -g @railway/cli
      - name: Deploy
        run: railway up --detach
        env:
          RAILWAY_TOKEN: \${{ secrets.RAILWAY_TOKEN }}
```

## 🔍 Диагностика проблем

### Общие проблемы и решения

1. **Сервис не запускается**
   ```bash
   railway logs
   # Проверьте переменные окружения
   railway variables
   ```

2. **Ошибка подключения к БД**
   ```bash
   # Проверьте DATABASE_URL
   railway variables | grep DATABASE_URL
   ```

3. **gRPC соединения не работают**
   ```bash
   # Убедитесь что все микросервисы запущены
   ./scripts/railway-status.sh
   ```

4. **Превышение лимитов памяти**
   ```bash
   # Увеличьте лимиты ресурсов
   railway resource-limits set --memory=1024 --cpu=500
   ```

## 📈 Масштабирование

### Увеличение ресурсов

```bash
# Для API Gateway (наибольшая нагрузка)
railway service use api-gateway
railway resource-limits set --memory=2048 --cpu=1000

# Для микросервисов
railway service use auth
railway resource-limits set --memory=512 --cpu=250
```

### Горизонтальное масштабирование

Railway автоматически масштабирует при необходимости, но можно настроить:

```bash
railway scale set --replicas=2
```

## 💰 Стоимость

Примерная стоимость на Railway:

- **API Gateway**: $10-15/месяц (повышенные ресурсы)
- **Микросервисы** (6): $5/месяц × 6 = $30/месяц
- **PostgreSQL**: $5/месяц
- **Redis**: $5/месяц
- **Общая стоимость**: ~$50-55/месяц

## ✅ Checklist готовности к production

- [ ] Все сервисы развернуты и работают
- [ ] Health checks возвращают 200 OK
- [ ] База данных PostgreSQL настроена
- [ ] Redis кэширование активно
- [ ] SSL сертификаты настроены
- [ ] Custom domain подключен
- [ ] Переменные окружения настроены
- [ ] Мониторинг логов работает
- [ ] Backup стратегия реализована
- [ ] Rate limiting настроен
- [ ] CORS политики применены

## 🎯 Полезные команды

```bash
# Быстрая проверка всех сервисов
./scripts/railway-status.sh

# Перезапуск всех сервисов
railway redeploy

# Откатиться к предыдущей версии
railway rollback

# Просмотр переменных окружения
railway variables

# Подключение к базе данных
railway service use postgresql
railway connect
```

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте логи: `railway logs`
2. Проверьте статус: `./scripts/railway-status.sh`
3. Проверьте переменные: `railway variables`
4. Создайте issue в репозитории проекта

---

## 🎉 Поздравляем!

Ваш мультивендорный маркетплейс Decorify успешно развернут на Railway и готов к production использованию!

**Доступные URL:**
- **API**: `https://yourdomain.com/api`
- **Документация**: `https://yourdomain.com/docs`
- **Health Check**: `https://yourdomain.com/health`
