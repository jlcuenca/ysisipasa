# Deployment Guide - ysisipasa

Guía para desplegar la aplicación ysisipasa en producción.

---

## 🚀 Opciones de Deployment

### Opción 1: Servicios Separados (Recomendado)

**Backend:** Railway, Render, Heroku, o DigitalOcean
**Frontend:** Vercel, Netlify, o Cloudflare Pages
**Database:** PostgreSQL en Railway/Render o Supabase

### Opción 2: Todo en uno

**Plataforma:** DigitalOcean App Platform, AWS Elastic Beanstalk, o Google Cloud Run

---

## 📋 Pre-deployment Checklist

- [ ] Cambiar `JWT_SECRET` a un valor seguro
- [ ] Configurar variables de entorno de producción
- [ ] Migrar de SQLite a PostgreSQL
- [ ] Configurar CORS para dominio de producción
- [ ] Habilitar HTTPS
- [ ] Configurar logging
- [ ] Setup monitoring (Sentry, Datadog)

---

## 🔧 Backend Deployment (Railway/Render)

### 1. Preparación

```bash
# En backend/package.json, asegúrate de tener:
"scripts": {
  "start": "node dist/server.js",
  "build": "tsc",
  "postinstall": "npm run build"
}
```

### 2. Variables de Entorno

Configurar en el dashboard de Railway/Render:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=TU_SECRETO_SUPER_SEGURO_AQUI
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ORIGIN=https://tu-frontend.vercel.app
```

### 3. Migrar a PostgreSQL

Instalar dependencia:
```bash
npm install pg
```

Actualizar `backend/src/config/database.ts` para usar PostgreSQL en producción:

```typescript
import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';

export const db = isProduction
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Database(dbPath);
```

### 4. Deploy

**Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Render:**
- Conectar repositorio de GitHub
- Seleccionar "backend" como root directory
- Build command: `npm install && npm run build`
- Start command: `npm start`

---

## 🎨 Frontend Deployment (Vercel/Netlify)

### 1. Configuración

Crear `app/.env.production`:

```env
VITE_API_URL=https://tu-backend.railway.app/api
```

### 2. Vercel

```bash
npm install -g vercel
cd app
vercel
```

O desde el dashboard:
- Conectar repositorio
- Root directory: `app`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_API_URL`

### 3. Netlify

```bash
cd app
npm run build

# Instalar Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 🐳 Docker Deployment (Opcional)

### Backend Dockerfile

Crear `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Frontend Dockerfile

Crear `app/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

Crear `docker-compose.yml` en raíz:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db

  frontend:
    build:
      context: ./app
      args:
        VITE_API_URL: http://localhost:3000/api
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ysisipasa
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

---

## 🔒 Seguridad en Producción

### 1. Environment Variables

**Nunca** commitear:
- JWT secrets
- Database credentials
- API keys

### 2. HTTPS

Asegurarse de que:
- Backend tiene HTTPS habilitado
- Frontend se sirve con HTTPS
- Cookies tienen flag `secure: true`

### 3. CORS

Actualizar `backend/src/config/env.ts`:

```typescript
corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['https://tu-dominio.com'],
```

### 4. Rate Limiting

Instalar:
```bash
npm install express-rate-limit
```

En `backend/src/server.ts`:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite por IP
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring

### Logging

Usar Winston o Pino:

```bash
npm install winston
```

### Error Tracking

Configurar Sentry:

```bash
npm install @sentry/node
```

---

## ✅ Post-Deployment Verification

- [ ] Backend health check: `https://api.tudominio.com/api/health`
- [ ] Frontend carga correctamente
- [ ] Auth funciona (login/registro)
- [ ] Cuestionarios se guardan
- [ ] Resultados se calculan
- [ ] Gamificación funciona
- [ ] No hay errores en consola del navegador
- [ ] Performance (Lighthouse > 90)

---

## 🔄 CI/CD (GitHub Actions)

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm run build
      - run: cd backend && npm test
      # Deploy to Railway/Render
      
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd app && npm ci
      - run: cd app && npm run build
      # Deploy to Vercel/Netlify
```

---

## 🎯 Recomendación Final

**Para empezar rápido:**
1. Backend → Railway (PostgreSQL incluido)
2. Frontend → Vercel
3. Configurar variables de entorno
4. Push a main branch

**Tiempo estimado:** 30-45 minutos

¡La aplicación estará en producción y accesible globalmente! 🚀
