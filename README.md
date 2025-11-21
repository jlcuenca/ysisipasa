# ysisipasa 🎲

> **¿Y si sí pasa?** - Aplicación de gamificación para medir tu nivel de riesgo y aseguramiento

Una plataforma web interactiva que ayuda a las personas a evaluar su perfil de riesgo personal, situación financiera y nivel de aseguramiento, utilizando elementos de gamificación para motivar la conciencia sobre protección financiera.

---

## 🌟 Características

- **🎮 Gamificación completa**: Sistema de niveles, insignias y misiones
- **📊 Evaluación de riesgos**: Algoritmo ponderado que calcula el "Índice ¿Y si sí pasa?"
- **🎯 Personalización**: Insights adaptados a tu perfil de riesgo
- **🔒 Privacidad**: Opción de uso anónimo o con cuenta
- **📱 Responsive**: Funciona en cualquier navegador (desktop y móvil)
- **💫 Animaciones suaves**: UX premium con Framer Motion

---

## 🏗️ Arquitectura

### Backend
- **Node.js** + **Express** + **TypeScript**
- **SQLite** (fácil migración a PostgreSQL/Supabase)
- **JWT** para autenticación
- **API RESTful** completa

### Frontend
- **React 18** + **Vite**
- **React Router** para navegación
- **TanStack Query** para manejo de estado del servidor
- **Framer Motion** para animaciones
- **Recharts** para visualizaciones

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/ysisipasa.git
   cd ysisipasa
   ```

2. **Configura el backend**
   ```bash
   cd backend
   npm install
   
   # Crea el archivo .env
   cp ../.env.example .env
   
   # Edita .env y configura JWT_SECRET (en producción)
   ```

3. **Configura el frontend**
   ```bash
   cd ../app
   npm install
   ```

### Ejecución en Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
El backend estará en `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd app
npm run dev
```
El frontend estará en `http://localhost:5173`

¡Abre tu navegador y visita http://localhost:5173!

---

## 📁 Estructura del Proyecto

```
ysisipasa/
├── backend/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuración (DB, env)
│   │   ├── controllers/    # Controladores de API
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Lógica de negocio
│   │   │   ├── riskCalculator.ts
│   │   │   ├── gamificationEngine.ts
│   │   │   └── ...
│   │   ├── middleware/     # Middlewares (auth, errors)
│   │   ├── data/           # Datos estáticos (cuestionarios)
│   │   └── server.ts       # Punto de entrada
│   ├── package.json
│   └── tsconfig.json
│
├── app/                     # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   │   ├── Layout/
│   │   │   ├── Results/
│   │   │   └── Gamification/
│   │   ├── screens/        # Pantallas principales
│   │   │   ├── Welcome.jsx
│   │   │   ├── QuestionnaireFlow.jsx
│   │   │   ├── Results.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/       # Servicios API
│   │   │   ├── api.js
│   │   │   └── authService.js
│   │   ├── App.jsx         # Componente principal
│   │   ├── main.jsx        # Punto de entrada
│   │   └── index.css       # Estilos globales
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .env.example             # Ejemplo de variables de entorno
└── README.md
```

---

## 🎯 Flujo del Usuario

1. **Bienvenida**: Login, registro o continuar anónimo
2. **Selección de categoría**: Salud, Finanzas, Auto, Hogar
3. **Cuestionario interactivo**: Preguntas con opciones ponderadas
4. **Resultados**: Dashboard con:
   - Score total (0-100)
   - Desglose por categoría
   - Insights personalizados
   - Progreso de gamificación (nivel, badges, misiones)
5. **Opcional**: Contactar asesor, exportar resultados

---

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Cuestionarios
- `GET /api/questionnaires` - Listar categorías
- `GET /api/questionnaires/:category` - Obtener cuestionario específico
- `POST /api/questionnaires/submit` - Enviar respuestas (requiere auth)
- `GET /api/questionnaires/responses/me` - Obtener respuestas del usuario

### Cálculo de Riesgo
- `GET /api/risk/calculate` - Calcular índice general (requiere auth)
- `GET /api/risk/category/:category` - Score por categoría

### Gamificación
- `GET /api/gamification/state` - Estado completo (requiere auth)
- `POST /api/gamification/viewed-results` - Marcar resultados vistos
- `POST /api/gamification/award-points` - Otorgar puntos

---

## 🎮 Sistema de Gamificación

### Niveles
1. **Despistado** 🤷 (0 puntos)
2. **Curioso** 🤔 (100 puntos)
3. **Consciente** 💡 (300 puntos)
4. **Prevenido** 🛡️ (600 puntos)
5. **Asegurado** ✅ (1000 puntos)
6. **Blindado** 🏆 (1500 puntos)

### Insignias
- 👣 **Primer Paso**: Completar primer cuestionario
- 🔍 **Descubridor de Riesgos**: Identificar 5 riesgos
- ❤️ **Consciente de Salud**: Completar cuestionario de salud
- 💰 **Maestro del Ahorro**: Completar cuestionario financiero
- 📋 **Perfil Completo**: Completar todos los cuestionarios
- Y más...

### Misiones
- Completar cuestionarios por categoría (80-100 puntos)
- Ver resultados (50 puntos)
- Alcanzar niveles específicos (150+ puntos)
- Desbloquear 5 insignias (200 puntos)

---

## 📊 Algoritmo de Riesgo

El índice "¿Y si sí pasa?" se calcula usando una fórmula ponderada:

```
Score = (Probabilidad × 0.3 + Impacto × 0.4 + Vulnerabilidad × 0.2) - (Aseguramiento × 0.1)
```

**Componentes:**
- **Probabilidad** (30%): Frecuencia del riesgo basada en respuestas
- **Impacto** (40%): Consecuencia económica potencial
- **Vulnerabilidad** (20%): Factores de protección personal
- **Aseguramiento** (10%): Nivel de cobertura actual (reduce el score)

**Resultado**: Score de 0-100
- 0-40: Riesgo **bajo** (verde)
- 40-70: Riesgo **moderado** (amarillo)
- 70-100: Riesgo **alto** (rojo)

---

## 🎨 Diseño y UX

- **Dark theme** premium con paleta cálida
- **Gradientes** y **glassmorphism**
- **Animaciones suaves** con Framer Motion
- **Microcopy** cercano y lúdico (mexicano/latino)
- **Tipografía**: Inter (Google Fonts)
- **Responsive**: Mobile-first design

---

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd app
npm test
```

---

## 📦 Build para Producción

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd app
npm run build
npm run preview
```

---

## 🔒 Seguridad

- **JWT**: Tokens con expiración de 30 días
- **Bcrypt**: Hashing de contraseñas (10 rounds)
- **CORS**: Configurado por origen
- **Validación**: Input validation en todos los endpoints
- **SQL Injection**: Uso de prepared statements

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|-----------|
| Backend | Node.js, Express, TypeScript |
| Base de datos | SQLite (dev), PostgreSQL (prod) |
| Frontend | React 18, Vite |
| Routing | React Router |
| State | TanStack Query |
| Animaciones | Framer Motion |
| Gráficos | Recharts |
| Auth | JWT + Bcrypt |
| Linting | ESLint |
| Testing | Jest, Supertest |

---

## 📝 Variables de Entorno

Ver `.env.example` para configuración completa.

**Backend (`.env`):**
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=tu-secreto-super-seguro
DB_PATH=./database.sqlite
CORS_ORIGIN=http://localhost:5173
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - ve el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

Desarrollado con ❤️ usando IA avanzada.

---

## 🙏 Agradecimientos

- Comunidad de React y Node.js
- Contributors de las librerías utilizadas
- Usuarios beta testers

---

## 📞 Soporte

¿Encontraste un bug? ¿Tienes una sugerencia?
- Abre un [issue](https://github.com/tu-usuario/ysisipasa/issues)
- Contacta al equipo de desarrollo

---

**¿Y si sí pasa? ¡Mejor estar preparado! 🛡️**
