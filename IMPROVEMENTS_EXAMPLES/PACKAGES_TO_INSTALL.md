# Установка необходимых пакетов для улучшения безопасности и мониторинга

## Критически важные пакеты

### Безопасность
```bash
npm install @nestjs/throttler helmet class-validator class-transformer
npm install @types/helmet --save-dev
```

### Health Checks
```bash
npm install @nestjs/terminus
```

### Логирование
```bash
npm install winston nest-winston
npm install @types/winston --save-dev
```

### Валидация и трансформация
```bash
npm install class-validator class-transformer
```

### Swagger документация
```bash
npm install @nestjs/swagger swagger-ui-express
```

### Кэширование
```bash
npm install @nestjs/cache-manager cache-manager
npm install redis cache-manager-redis-store
```

### Уведомления
```bash
npm install nodemailer @nestjs/bull bull
npm install @types/nodemailer --save-dev
```

## Команды для быстрого старта

### Установить все критически важные пакеты
```bash
npm install @nestjs/throttler helmet class-validator class-transformer @nestjs/terminus winston nest-winston @nestjs/swagger swagger-ui-express
```

### Dev dependencies
```bash
npm install @types/helmet @types/winston --save-dev
```

### Для production мониторинга
```bash
npm install prom-client @nestjs/prometheus
```
