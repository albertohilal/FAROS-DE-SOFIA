# Instrucciones para las Imágenes de los Faros

## 📸 **Cómo agregar las imágenes reales:**

1. **Guarda las imágenes que adjuntaste como:**
   - `assets/images/abuelo.png` - La imagen del señor con anteojos y sonrisa
   - `assets/images/papa.png` - La imagen del hombre más joven 
   - `assets/images/tio.png` - La imagen del señor calvo con anteojos

2. **Formato recomendado:**
   - **Formato:** PNG con fondo transparente (preferible) o JPG
   - **Tamaño:** Aproximadamente 200x200 píxeles o más
   - **Relación de aspecto:** Cuadrada (1:1) para mejor visualización

3. **Reemplaza los archivos:**
   - Elimina los archivos placeholder actuales
   - Copia tus imágenes reales con los mismos nombres

## 🎨 **Características implementadas:**

✅ **Carga de imágenes en preload()**
✅ **Imágenes redimensionables y responsivas** 
✅ **Posicionamiento automático debajo de cada faro**
✅ **Marco decorativo alrededor de cada imagen**
✅ **Área de interacción expandida (faro + imagen)**
✅ **Ajuste automático para diferentes tamaños de pantalla**

## 🖱️ **Interacción mejorada:**

- **Hover/Touch** sobre el faro O sobre la imagen muestra el mensaje
- Las imágenes se escalan según el dispositivo
- Los mensajes se posicionan para no tapar las imágenes
- Todo funciona tanto en móvil como en escritorio

## 🔧 **Personalización:**

Si quieres cambiar el tamaño de las imágenes, modifica esta línea en `beto.js`:
```javascript
this.imageSize = ResponsiveUtils.scaleValue(60); // Cambiar el 60 por otro valor
```
