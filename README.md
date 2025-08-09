# Faros de Sofia - p5.js

Un proyecto p5.js optimizado para móvil y escritorio con características avanzadas de responsive design y gestión de entrada.

## 🚀 Características

### Compatibilidad Multi-dispositivo
- **Responsive Design**: Se adapta automáticamente a diferentes tamaños de pantalla
- **Detección de Dispositivos**: Identifica automáticamente móvil, tablet o escritorio
- **Optimización de Rendimiento**: Ajusta la calidad y FPS según las capacidades del dispositivo
- **Soporte Táctil**: Gestos multi-touch, pinch-to-zoom, swipe, tap y double-tap
- **Joystick Virtual**: Control táctil para dispositivos móviles

### Gestión de Entrada Avanzada
- **Input Manager**: Manejo unificado de mouse, teclado y touch
- **Reconocimiento de Gestos**: Swipe, pinch, tap, double-tap
- **Eventos de Teclado**: Soporte completo para atajos
- **Vibración Háptica**: Feedback táctil en dispositivos compatibles

### Arquitectura Modular
- **Scene Manager**: Sistema de escenas para organizar diferentes estados
- **Classes Organizadas**: Código modular y reutilizable
- **Utilidades Responsivas**: Helpers para diseño adaptativo
- **Performance Monitor**: Monitoreo automático de rendimiento

### PWA Ready
- **Manifest.json**: Instalable como aplicación nativa
- **Service Worker Ready**: Base para funcionalidad offline
- **Íconos Responsivos**: Múltiples tamaños para diferentes dispositivos

## 📁 Estructura del Proyecto

```
Faros-de-Sofia/
├── index.html                          # Archivo principal HTML
├── manifest.json                       # PWA manifest
├── package.json                        # Configuración del proyecto
├── css/
│   └── styles.css                      # Estilos responsivos
├── js/
│   ├── sketch.js                       # Sketch principal p5.js
│   ├── utils/
│   │   ├── deviceDetection.js          # Detección de dispositivos
│   │   └── responsiveUtils.js          # Utilidades responsivas
│   └── classes/
│       ├── InputManager.js             # Gestión de entrada
│       └── SceneManager.js             # Gestión de escenas
└── assets/                             # Recursos (imágenes, sonidos)
    └── [iconos PWA]
```

## 🛠 Instalación y Uso

### Prerrequisitos
- Python 3.x (para servidor de desarrollo)
- Navegador web moderno

### Instalación
1. Clona o descarga el proyecto
2. Navega al directorio del proyecto
3. Ejecuta el servidor de desarrollo:

```bash
# Usando Python
python -m http.server 8000

# O usando npm si tienes Node.js
npm run dev
```

4. Abre tu navegador en `http://localhost:8000`

## 🎮 Controles

### Escritorio
- **Mouse**: Click para interactuar
- **Teclado**:
  - `F`: Pantalla completa
  - `Espacio`: Pausa/Resume
  - `R`: Reiniciar
  - `Flechas/WASD`: Navegación

### Móvil/Tablet
- **Tap**: Interacción básica
- **Double Tap**: Acción secundaria
- **Swipe**: Navegación direccional
- **Pinch**: Zoom (si está implementado)
- **Joystick Virtual**: Control de movimiento
- **Botones UI**: Controles en pantalla

## 🔧 Configuración

### Ajustes de Rendimiento
El sistema detecta automáticamente las capacidades del dispositivo y ajusta:
- **FPS Target**: 60fps (escritorio) → 45fps (móvil medio) → 30fps (móvil bajo)
- **Resolución**: Escala automática para dispositivos de baja gama
- **Partículas**: Cantidad adaptativa según rendimiento
- **Pixel Density**: Soporte para pantallas Retina/HiDPI

### Personalización
Puedes personalizar el comportamiento editando:
- `js/sketch.js`: Lógica principal del sketch
- `js/classes/SceneManager.js`: Escenas y estados
- `js/classes/InputManager.js`: Manejo de entrada
- `css/styles.css`: Estilos y responsive design

## 📱 Características Móviles Específicas

### Optimizaciones Touch
- Prevención de zoom accidental
- Manejo de área segura (notch)
- Optimización de eventos táctiles
- Feedback háptico

### Responsive Breakpoints
- **XS**: < 480px (móvil pequeño)
- **SM**: 480-768px (móvil grande)
- **MD**: 768-1024px (tablet)
- **LG**: 1024-1440px (escritorio)
- **XL**: > 1440px (escritorio grande)

## 🚀 Despliegue

### Hosting Estático
1. Sube todos los archivos a tu servidor web
2. Asegúrate de que el servidor sirva archivos estáticos
3. Configura HTTPS para funcionalidad PWA completa

### GitHub Pages
1. Sube el código a un repositorio de GitHub
2. Habilita GitHub Pages en la configuración
3. Tu app estará disponible en `https://username.github.io/repo-name`

### Netlify/Vercel
1. Conecta tu repositorio
2. No requiere configuración de build
3. Deploy automático en cada push

## 🔄 Extensiones Futuras

### Funcionalidades Sugeridas
- Sistema de sonido adaptativo
- Shaders WebGL para efectos avanzados
- Sistema de partículas más complejo
- Integración con giroscopio/acelerómetro
- Sistema de guardado local
- Multijugador local
- Temas y personalización

### Optimizaciones Avanzadas
- Service Worker para cache
- Lazy loading de assets
- Compresión de texturas
- Pool de objetos para mejor rendimiento

## 📄 Licencia

MIT License - Puedes usar, modificar y distribuir libremente.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o problemas:
- Revisa la documentación de [p5.js](https://p5js.org/)
- Consulta los ejemplos en el código
- Abre un issue en el repositorio

---

**¡Disfruta creando con p5.js! 🎨**
