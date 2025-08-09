# Assets Directory

Esta carpeta contiene todos los recursos del proyecto:

## Estructura recomendada:

```
assets/
├── images/           # Imágenes del juego
├── sounds/          # Archivos de audio
├── fonts/           # Fuentes personalizadas
├── data/            # Archivos JSON, CSV, etc.
├── shaders/         # Shaders GLSL (si usas WebGL)
└── icons/           # Iconos PWA
```

## Iconos PWA

Para que la aplicación sea completamente compatible como PWA, necesitarás agregar los siguientes iconos:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Optimización

Para mejor rendimiento:
- Comprime las imágenes (WebP cuando sea posible)
- Usa formatos de audio optimizados (OGG, AAC)
- Minimiza el tamaño de archivos para móviles
