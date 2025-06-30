# Decorify - Мультивендорный маркетплейс мебели

Декорифай - это современный мультивендорный маркетплейс мебели, построенный на микросервисной архитектуре с использованием NestJS, gRPC и PostgreSQL.

## Архитектура

### Микросервисы

1. **API Gateway** (порт 3000) - Основная точка входа для клиентов
2. **Auth Service** (порт 50051) - Аутентификация и авторизация
3. **Product Service** (порт 50053) - Управление товарами и категориями
4. **Order Service** (порт 50052) - Управление заказами
5. **Payment Service** (порт 50054) - Обработка платежей через Stripe
6. **Vendor Service** (порт 50055) - Управление поставщиками
7. **Cart Service** (порт 50056) - Корзина покупок с Redis

### Технологии

- **NestJS** - Node.js фреймворк
- **gRPC** - Коммуникация между микросервисами
- **PostgreSQL** - Основная база данных
- **Redis** - Кэширование корзины
- **Prisma** - ORM
- **Stripe** - Платежная система
- **Nx** - Монорепозиторий

## Установка и запуск

### Предварительные требования

- Node.js >= 18
- Docker и Docker Compose
- PostgreSQL
- Redis

### 1. Установка зависимостей

\`\`\`bash
npm install
\`\`\`

### 2. Настройка окружения

Скопируйте файл окружения:
\`\`\`bash
cp .env.example .env
\`\`\`

Отредактируйте `.env` файл с вашими настройками.

### 3. Запуск инфраструктуры

Запустите PostgreSQL и Redis:
\`\`\`bash
npm run dev:db
\`\`\`

### 4. Настройка базы данных

Сгенерируйте Prisma клиент:
\`\`\`bash
npm run prisma:generate
\`\`\`

Запустите миграции:
\`\`\`bash
npm run prisma:migrate
\`\`\`

### 5. Генерация Proto файлов

\`\`\`bash
npm run proto:all
\`\`\`

### 6. Запуск микросервисов

В разных терминалах запустите каждый сервис:

\`\`\`bash
# Auth Service
npm run dev:auth

# Product Service
npm run dev:product

# Order Service
npm run dev:order

# Payment Service
npm run dev:payment

# Vendor Service
npm run dev:vendor

# Cart Service
npm run dev:cart

# API Gateway
npm run dev:gateway
\`\`\`

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Товары
- `GET /api/product` - Получить все товары
- `GET /api/product/:id` - Получить товар по ID
- `POST /api/product` - Создать товар (требует авторизации)
- `PUT /api/product/:id` - Обновить товар (требует авторизации)
- `DELETE /api/product/:id` - Удалить товар (требует авторизации)

### Категории
- `GET /api/category` - Получить все категории
- `GET /api/category/:id` - Получить категорию по ID
- `POST /api/category` - Создать категорию (требует авторизации)

### Корзина
- `GET /api/cart` - Получить корзину (требует авторизации)
- `POST /api/cart/add` - Добавить товар в корзину (требует авторизации)
- `PUT /api/cart/update` - Обновить количество (требует авторизации)
- `DELETE /api/cart/remove/:productId` - Удалить товар из корзины (требует авторизации)
- `DELETE /api/cart/clear` - Очистить корзину (требует авторизации)

### Заказы
- `POST /api/order` - Создать заказ (требует авторизации)

### Поставщики
- `GET /api/vendor` - Получить всех поставщиков
- `GET /api/vendor/:id` - Получить поставщика по ID
- `POST /api/vendor` - Создать профиль поставщика (требует авторизации)
- `PUT /api/vendor/:id` - Обновить профиль поставщика (требует авторизации)

### Платежи
- `POST /api/payment/process` - Обработать платеж (требует авторизации)
- `GET /api/payment/status/:paymentId` - Получить статус платежа (требует авторизации)
- `POST /api/payment/refund` - Вернуть платеж (требует авторизации)

## Тестирование

\`\`\`bash
npm run test
\`\`\`

## База данных

Схема базы данных включает следующие основные таблицы:
- `User` - Пользователи
- `Vendor` - Поставщики
- `Product` - Товары
- `Category` - Категории
- `Order` - Заказы
- `OrderItem` - Позиции заказа
- `Payment` - Платежи
- `ShoppingCart` - Корзины
- `CartItem` - Позиции корзины
- `Review` - Отзывы

## Роли пользователей

- `CUSTOMER` - Покупатель
- `VENDOR` - Поставщик
- `ADMIN` - Администратор

## Разработка

### Добавление нового микросервиса

1. Создайте новое приложение в Nx
2. Настройте gRPC сервер
3. Создайте .proto файл
4. Добавьте сгенерированные типы в common библиотеку
5. Добавьте контроллер в API Gateway

### Структура проекта

\`\`\`
apps/
├── api-gateway/          # API Gateway
├── auth/                 # Сервис аутентификации
├── product/              # Сервис товаров
├── order/                # Сервис заказов
├── payment/              # Сервис платежей
├── vendor/               # Сервис поставщиков
└── cart/                 # Сервис корзины

libs/
├── common/               # Общие типы и утилиты
├── prisma/               # Prisma конфигурация
└── shared/               # Общая логика

proto/                    # Protocol Buffer файлы
prisma/                   # База данных схема и миграции
\`\`\`

## Мониторинг

Для мониторинга и логирования рекомендуется использовать:
- **Logging**: Winston или встроенный NestJS Logger
- **Metrics**: Prometheus + Grafana
- **Tracing**: Jaeger
- **Health Checks**: Terminus

## Деплой

Для продакшена рекомендуется:
1. Использовать Docker контейнеры
2. Настроить Kubernetes кластер
3. Использовать внешние сервисы (managed PostgreSQL, Redis)
4. Настроить CI/CD pipeline
5. Использовать HTTPS и SSL сертификаты

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ **This workspace has been generated by [Nx, Smart Monorepos · Fast CI.](https://nx.dev)** ✨

## Integrate with editors

Enhance your Nx experience by installing [Nx Console](https://nx.dev/nx-console) for your favorite editor. Nx Console
provides an interactive UI to view your projects, run tasks, generate code, and more! Available for VSCode, IntelliJ and
comes with a LSP for Vim users.

## Start the application

Run `npx nx serve SofaWeb` to start the development server. Happy coding!

## Build for production

Run `npx nx build SofaWeb` to build the application. The build artifacts are stored in the output directory (e.g. `dist/` or `build/`), ready to be deployed.

## Running tasks

To execute tasks with Nx use the following syntax:

```
npx nx <target> <project> <...options>
```

You can also run multiple targets:

```
npx nx run-many -t <target1> <target2>
```

..or add `-p` to filter specific projects

```
npx nx run-many -t <target1> <target2> -p <proj1> <proj2>
```

Targets can be defined in the `package.json` or `projects.json`. Learn more [in the docs](https://nx.dev/features/run-tasks).

## Set up CI!

Nx comes with local caching already built-in (check your `nx.json`). On CI you might want to go a step further.

- [Set up remote caching](https://nx.dev/features/share-your-cache)
- [Set up task distribution across multiple machines](https://nx.dev/nx-cloud/features/distribute-task-execution)
- [Learn more how to setup CI](https://nx.dev/recipes/ci)

## Explore the project graph

Run `npx nx graph` to show the graph of the workspace.
It will show tasks that you can run with Nx.

- [Learn more about Exploring the Project Graph](https://nx.dev/core-features/explore-graph)

## Connect with us!

- [Join the community](https://nx.dev/community)
- [Subscribe to the Nx Youtube Channel](https://www.youtube.com/@nxdevtools)
- [Follow us on Twitter](https://twitter.com/nxdevtools)
