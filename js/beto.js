let faros = [];
let sofia;
let deviceInfo = {};
let images = {}; // Para almacenar las imágenes
let debugCollisions = false; // Variable para mostrar áreas de colisión

// Variables para el sistema de diálogo
let currentMessage = null;
let messageTimer = 0;
let messageDuration = 3000; // 3 segundos
let lastCollisionTime = 0;
let collisionCooldown = 1000; // 1 segundo de cooldown entre colisiones

// Variables para movimiento continuo
let movementState = {
  up: false,
  down: false,
  left: false,
  right: false
};

function preload() {
  // Cargar las imágenes directamente sin callbacks complejos
  images.abuelo = loadImage('assets/images/abuelo.png');
  images.papa = loadImage('assets/images/papa.png');
  images.tio = loadImage('assets/images/tio.png');
  images.sofia = loadImage('assets/images/sofi-comic.png');
  images.barquito = loadImage('assets/images/barquito.png');
  
  // Cargar SVGs de faros
  images.faroAzul = loadImage('assets/images/faro-azul.svg');
  images.faroVerde = loadImage('assets/images/faro-verde.svg');
  images.faroAmarillo = loadImage('assets/images/faro-amarillo.svg');
}

function setup() {
  // Detectar dispositivo
  deviceInfo = getDeviceInfo();
  
  // Crear canvas responsivo
  let w = windowWidth;
  let h = windowHeight;
  
  if (deviceInfo.isMobile) {
    w = Math.min(w, 800);
    h = Math.min(h, 600);
  }
  
  let canvas = createCanvas(w, h);
  canvas.parent('app-container');
  
  sofia = new Sofia(width / 2, height / 2, images.sofia, images.barquito);
  
  // Debug: verificar que las imágenes se cargaron
  console.log('Imágenes cargadas:', {
    abuelo: images.abuelo ? 'OK' : 'FAIL',
    papa: images.papa ? 'OK' : 'FAIL', 
    tio: images.tio ? 'OK' : 'FAIL',
    sofia: images.sofia ? 'OK' : 'FAIL',
    barquito: images.barquito ? 'OK' : 'FAIL'
  });
  
  // Tres faros (Abuelo, Papá, Tío) con posiciones adaptativas
  faros = [];
  let spacing = ResponsiveUtils.getSpacing('xl');
  let imageSize = ResponsiveUtils.scaleValue(60);
  
  faros.push(new Faro(spacing * 2, spacing * 2, color(0, 100, 255), "Abuelo", images.abuelo, images.faroAzul)); // Azul
  faros.push(new Faro(width - spacing * 3 - 30, spacing * 2, color(100, 255, 100), "Papá", images.papa, images.faroVerde)); // Verde  
  faros.push(new Faro(width / 2 - 15, height - spacing * 6 - imageSize, color(255, 255, 0), "Tío", images.tio, images.faroAmarillo)); // Amarillo
  
  // Ocultar pantalla de carga
  setTimeout(() => {
    let loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.style.display = 'none', 500);
    }
  }, 1000);
}

function draw() {
  background(220);
  
  // Niebla (dificultades familiares)
  let isInteracting = false;
  
  if (deviceInfo.isMobile) {
    isInteracting = touches.length > 0;
  } else {
    isInteracting = mouseIsPressed;
  }
  
  if (isInteracting) {
    // Sofía puede "despejar" la niebla interactuando
    // Usar transparencia en lugar de filter BLUR para mejor rendimiento
    push();
    fill(255, 255, 255, 100);
    rect(0, 0, width, height);
    pop();
  }
  
  faros.forEach(faro => faro.mostrar());
  sofia.mostrar();
  
  // Mostrar áreas de colisión si el debug está activado
  if (debugCollisions) {
    drawCollisionAreas();
  }
  
  // Mostrar diálogo si hay un mensaje activo
  if (currentMessage) {
    drawDialogue();
    
    // Reducir el timer del mensaje
    if (millis() - messageTimer > messageDuration) {
      currentMessage = null;
    }
  }
  
  // Manejar movimiento continuo
  if (movementState.up) sofia.moveUp();
  if (movementState.down) sofia.moveDown();
  if (movementState.left) sofia.moveLeft();
  if (movementState.right) sofia.moveRight();
}

class Sofia {
  constructor(x, y, imagen, barquito) {
    this.x = x;
    this.y = y;
    this.imagen = imagen;
    this.barquito = barquito;
    this.imageSize = ResponsiveUtils.scaleValue(80); // Ligeramente más grande que los faros
    this.barquitoSize = ResponsiveUtils.scaleValue(80); // Tamaño del barquito (duplicado)
    this.speed = 3; // Velocidad de movimiento
  }
  
  mostrar() {
    push();
    
    // Dibujar la imagen de Sofía o placeholder
    let imgX = this.x - this.imageSize/2; // Centrar horizontalmente
    let imgY = this.y - this.imageSize/2; // Centrar verticalmente
    
    if (this.imagen) {
      // Dibujar la imagen real si se cargó correctamente
      image(this.imagen, imgX, imgY, this.imageSize, this.imageSize);
    } else {
      // Dibujar placeholder si no hay imagen
      this.drawPlaceholder(imgX, imgY);
    }
    
    // Dibujar el barquito sobre la imagen de Sofía
    if (this.barquito) {
      let barquitoX = this.x - this.barquitoSize/2; // Centrado horizontalmente con Sofía
      let barquitoY = imgY - this.barquitoSize - 5; // Misma distancia que entre faro y avatar
      image(this.barquito, barquitoX, barquitoY, this.barquitoSize, this.barquitoSize * 0.8);
    } else {
      // Fallback: dibujar barquito simple si no se carga el SVG
      this.drawBarquitoFallback();
    }
    
    // Marco alrededor del área de imagen
    noFill();
    stroke(255, 200, 255); // Color rosado suave para Sofía
    strokeWeight(3);
    rect(imgX, imgY, this.imageSize, this.imageSize, 10);
    
    // Dibujar controles de joystick
    this.drawJoystickControls();
    
    pop();
  }
  
  // Función para dibujar placeholder cuando no hay imagen
  drawPlaceholder(x, y) {
    // Fondo rosado suave
    fill(255, 200, 255, 100);
    rect(x, y, this.imageSize, this.imageSize, 10);
    
    // Círculo central (el diseño original)
    fill(255, 200);
    ellipse(x + this.imageSize/2, y + this.imageSize/2, this.imageSize * 0.6);
    
    // Texto indicativo
    fill(150);
    textAlign(CENTER, CENTER);
    textSize(12);
    text("SOFÍA", x + this.imageSize/2, y + this.imageSize/2);
  }
  
  // Función para dibujar barquito simple si el SVG no carga
  drawBarquitoFallback() {
    push();
    let imgX = this.x - this.imageSize/2;
    let imgY = this.y - this.imageSize/2;
    let barquitoX = this.x - this.barquitoSize/2;
    let barquitoY = imgY - this.barquitoSize - 5; // Misma distancia que entre faro y avatar
    let size = this.barquitoSize;
    
    // Casco del barco
    fill(255);
    stroke(0);
    strokeWeight(2);
    arc(barquitoX + size/2, barquitoY + size*0.7, size*0.8, size*0.3, 0, PI);
    
    // Mástil
    line(barquitoX + size/2, barquitoY + size*0.2, barquitoX + size/2, barquitoY + size*0.7);
    
    // Vela
    fill(255);
    triangle(barquitoX + size/2, barquitoY + size*0.2, 
             barquitoX + size*0.8, barquitoY + size*0.4,
             barquitoX + size/2, barquitoY + size*0.6);
    
    // Bandera
    fill(255, 0, 0);
    rect(barquitoX + size/2, barquitoY + size*0.2, size*0.15, size*0.1);
    
    pop();
  }
  
  // Métodos para mover a Sofía
  moveUp() {
    let newY = this.y - this.speed;
    if (this.canMoveTo(this.x, newY)) {
      // Asegurar que el barquito no se salga por arriba
      let minY = this.imageSize/2 + this.barquitoSize + 15;
      this.y = constrain(newY, minY, height - this.imageSize/2);
    }
  }
  
  moveDown() {
    let newY = this.y + this.speed;
    if (this.canMoveTo(this.x, newY)) {
      this.y = constrain(newY, this.imageSize/2 + this.barquitoSize + 15, height - this.imageSize/2);
    }
  }
  
  moveLeft() {
    let newX = this.x - this.speed;
    if (this.canMoveTo(newX, this.y)) {
      this.x = constrain(newX, this.imageSize/2, width - this.imageSize/2);
    }
  }
  
  moveRight() {
    let newX = this.x + this.speed;
    if (this.canMoveTo(newX, this.y)) {
      this.x = constrain(newX, this.imageSize/2, width - this.imageSize/2);
    }
  }
  
  // Función para verificar si Sofía puede moverse a una posición sin colisionar
  canMoveTo(newX, newY) {
    if (typeof faros === 'undefined' || faros.length === 0) return true;
    
    // Crear un rectángulo para la nueva posición de Sofía (incluyendo el barquito)
    let sofiaRect = {
      x: newX - this.imageSize/2,
      y: newY - this.imageSize/2 - this.barquitoSize - 5, // Incluir el barquito en el área
      width: this.imageSize,
      height: this.imageSize + this.barquitoSize + 5 // Altura total incluyendo barquito
    };
    
    // Añadir margen de seguridad para evitar superposición visual
    let margin = 10;
    sofiaRect.x -= margin;
    sofiaRect.y -= margin;
    sofiaRect.width += margin * 2;
    sofiaRect.height += margin * 2;
    
    // Verificar colisión con cada faro
    for (let faro of faros) {
      // Área del faro SVG con margen
      let faroRect = {
        x: faro.x - 5 - margin,
        y: faro.y - 10 - margin,
        width: faro.faroWidth + margin * 2,
        height: faro.faroHeight + margin * 2
      };
      
      // Área de la imagen del avatar con margen
      let imgX = faro.x + 15 - faro.imageSize/2;
      let imgY = faro.y + faro.faroHeight - 5;
      let avatarRect = {
        x: imgX - margin,
        y: imgY - margin,
        width: faro.imageSize + margin * 2,
        height: faro.imageSize + margin * 2
      };
      
      // Verificar colisión con el faro o su avatar
      if (this.rectanglesCollide(sofiaRect, faroRect) || 
          this.rectanglesCollide(sofiaRect, avatarRect)) {
        
        // ¡COLISIÓN DETECTADA! Mostrar mensaje si no está en cooldown
        if (millis() - lastCollisionTime > collisionCooldown) {
          this.showMessage(faro);
          lastCollisionTime = millis();
        }
        
        return false; // No puede moverse, hay colisión
      }
    }
    
    return true; // Puede moverse sin problemas
  }
  
  // Función para mostrar el mensaje del faro
  showMessage(faro) {
    currentMessage = {
      text: faro.mensajeSecreto(),
      character: faro.nombre,
      x: faro.x + 15, // Posición del mensaje cerca del faro
      y: faro.y - 20
    };
    messageTimer = millis();
  }
  
  // Función auxiliar para detectar colisión entre rectángulos
  rectanglesCollide(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }
  
  // Función para dibujar controles tipo joystick
  drawJoystickControls() {
    push();
    
    // Posición de los controles (esquina inferior derecha)
    let controlsX = width - 120;
    let controlsY = height - 120;
    let buttonSize = 30;
    let spacing = 40;
    
    // Fondo semi-transparente para los controles
    fill(0, 0, 0, 100);
    stroke(255);
    strokeWeight(2);
    rect(controlsX - 10, controlsY - 10, 100, 100, 10);
    
    stroke(255);
    strokeWeight(2);
    
    // Botón ARRIBA
    let upX = controlsX + spacing;
    let upY = controlsY;
    fill(movementState.up ? color(150, 200, 255) : color(100, 150, 255)); // Más claro si está activo
    rect(upX - buttonSize/2, upY - buttonSize/2, buttonSize, buttonSize, 5);
    this.drawArrow(upX, upY, 0); // Flecha hacia arriba
    
    // Botón IZQUIERDA
    let leftX = controlsX;
    let leftY = controlsY + spacing;
    fill(movementState.left ? color(150, 200, 255) : color(100, 150, 255));
    rect(leftX - buttonSize/2, leftY - buttonSize/2, buttonSize, buttonSize, 5);
    this.drawArrow(leftX, leftY, -PI/2); // Flecha hacia izquierda
    
    // Botón DERECHA  
    let rightX = controlsX + spacing * 2;
    let rightY = controlsY + spacing;
    fill(movementState.right ? color(150, 200, 255) : color(100, 150, 255));
    rect(rightX - buttonSize/2, rightY - buttonSize/2, buttonSize, buttonSize, 5);
    this.drawArrow(rightX, rightY, PI/2); // Flecha hacia derecha
    
    // Botón ABAJO
    let downX = controlsX + spacing;
    let downY = controlsY + spacing * 2;
    fill(movementState.down ? color(150, 200, 255) : color(100, 150, 255));
    rect(downX - buttonSize/2, downY - buttonSize/2, buttonSize, buttonSize, 5);
    this.drawArrow(downX, downY, PI); // Flecha hacia abajo
    
    pop();
  }
  
  // Función auxiliar para dibujar flechas en los botones
  drawArrow(x, y, angle) {
    push();
    translate(x, y);
    rotate(angle);
    
    fill(255);
    noStroke();
    
    // Dibujar triángulo (flecha)
    triangle(0, -8, -5, 5, 5, 5);
    
    pop();
  }
  
  // Función para verificar clics en los controles
  checkJoystickClick(mouseX, mouseY) {
    let controlsX = width - 120;
    let controlsY = height - 120;
    let buttonSize = 30;
    let spacing = 40;
    
    // Coordenadas de cada botón
    let buttons = [
      {x: controlsX + spacing, y: controlsY, action: 'up'},                    // Arriba
      {x: controlsX, y: controlsY + spacing, action: 'left'},                 // Izquierda  
      {x: controlsX + spacing * 2, y: controlsY + spacing, action: 'right'},  // Derecha
      {x: controlsX + spacing, y: controlsY + spacing * 2, action: 'down'}    // Abajo
    ];
    
    for (let button of buttons) {
      if (mouseX > button.x - buttonSize/2 && mouseX < button.x + buttonSize/2 &&
          mouseY > button.y - buttonSize/2 && mouseY < button.y + buttonSize/2) {
        return button.action;
      }
    }
    return null;
  }
}

class Faro {
  constructor(x, y, col, nombre, imagen, faroSvg) {
    this.x = x;
    this.y = y;
    this.col = col;
    this.nombre = nombre;
    this.imagen = imagen;
    this.faroSvg = faroSvg;
    this.imageSize = ResponsiveUtils.scaleValue(60); // Tamaño responsivo de la imagen
    this.faroWidth = ResponsiveUtils.scaleValue(40);
    this.faroHeight = ResponsiveUtils.scaleValue(80);
  }
  
  mostrar() {
    push();
    
    // Dibujar el faro SVG o rectángulo fallback
    if (this.faroSvg) {
      // Usar SVG del faro
      image(this.faroSvg, this.x - 5, this.y - 10, this.faroWidth, this.faroHeight);
    } else {
      // Fallback: rectángulo simple si no se carga el SVG
      fill(this.col);
      rect(this.x, this.y, 30, 60);
    }
    
    // Dibujar la imagen o placeholder debajo del faro
    let imgX = this.x + 15 - this.imageSize/2; // Centrar horizontalmente
    let imgY = this.y + this.faroHeight - 5; // Posicionar debajo del faro SVG
    
    // Asegurarse de que la imagen no se salga de la pantalla
    imgX = constrain(imgX, 5, width - this.imageSize - 5);
    imgY = constrain(imgY, this.y + this.faroHeight - 5, height - this.imageSize - 30);
    
    // Dibujar la imagen directamente - las imágenes ya se cargaron en preload()
    image(this.imagen, imgX, imgY, this.imageSize, this.imageSize);
    
    // Interacción: mouse/touch para revelar mensaje
    let isHovering = this.checkInteraction();
    
    if (isHovering) {
      // Fondo del mensaje
      fill(255, 255, 255, 240);
      stroke(0);
      strokeWeight(1);
      let mensaje = this.mensajeSecreto();
      textSize(ResponsiveUtils.getTextSize('xs'));
      let textW = textWidth(mensaje) + 20;
      let msgX = this.x + 15 - textW/2;
      msgX = constrain(msgX, 10, width - textW - 10);
      
      // Posicionar mensaje arriba del faro para que no tape la imagen
      let msgY = this.y - 30;
      if (msgY < 10) {
        msgY = textY + 25; // Si no cabe arriba, ponerlo abajo
      }
      
      rect(msgX, msgY, textW, 20, 5);
      
      // Texto del mensaje
      fill(0);
      noStroke();
      textAlign(CENTER);
      text(mensaje, this.x + 15, msgY + 15);
    }
    pop();
  }
  
  // Función para verificar interacción con el faro
  checkInteraction() {
    if (deviceInfo.isMobile) {
      // Verificar touch
      for (let i = 0; i < touches.length; i++) {
        if (this.isPointInside(touches[i].x, touches[i].y)) {
          return true;
        }
      }
    } else {
      // Verificar mouse
      if (this.isPointInside(mouseX, mouseY)) {
        return true;
      }
    }
    return false;
  }
  
  // Función para verificar si un punto está dentro del área interactiva (faro + imagen)
  isPointInside(pointX, pointY) {
    // Área del faro SVG
    let faroLeft = this.x - 5;
    let faroRight = this.x - 5 + this.faroWidth;
    let faroTop = this.y - 10;
    let faroBottom = this.y - 10 + this.faroHeight;
    
    // Área de la imagen del avatar
    let imgX = this.x + 15 - this.imageSize/2;
    let imgY = this.y + this.faroHeight - 5;
    let imgLeft = imgX;
    let imgRight = imgX + this.imageSize;
    let imgTop = imgY;
    let imgBottom = imgY + this.imageSize;
    
    // Verificar si el punto está en el faro o en la imagen
    let inFaro = (pointX >= faroLeft && pointX <= faroRight && 
                  pointY >= faroTop && pointY <= faroBottom);
    let inImage = (pointX >= imgLeft && pointX <= imgRight && 
                   pointY >= imgTop && pointY <= imgBottom);
    
    return inFaro || inImage;
  }
  
  // Función para dibujar placeholder cuando no hay imagen
  drawPlaceholder(x, y) {
    // Fondo gris claro
    fill(200);
    rect(x, y, this.imageSize, this.imageSize);
    
    // Icono de persona simple
    fill(150);
    
    // Cabeza (círculo)
    let centerX = x + this.imageSize/2;
    let centerY = y + this.imageSize * 0.3;
    ellipse(centerX, centerY, this.imageSize * 0.3);
    
    // Cuerpo (rectángulo redondeado)
    let bodyY = y + this.imageSize * 0.45;
    let bodyW = this.imageSize * 0.4;
    let bodyH = this.imageSize * 0.4;
    rect(centerX - bodyW/2, bodyY, bodyW, bodyH, 10);
    
    // Texto indicativo
    fill(100);
    textAlign(CENTER, CENTER);
    textSize(8);
    text(this.nombre.charAt(0), centerX, y + this.imageSize - 10);
  }
  
  mensajeSecreto() {
    return {
      "Abuelo": "A veces me pierdo... pero siempre vuelvo a vos",
      "Papá": "Mi amor es fuerte como el viento",
      "Tío": "Tus preguntas no tienen por qué tener respuesta"
    }[this.nombre];
  }
}

// Función para dibujar el globo de diálogo
function drawDialogue() {
  if (!currentMessage) return;
  
  push();
  
  // Configurar texto para calcular dimensiones
  textSize(ResponsiveUtils.getTextSize('sm'));
  textAlign(LEFT, TOP);
  
  let message = currentMessage.text;
  let maxWidth = width * 0.6; // 60% del ancho de la pantalla
  let padding = 20;
  let lineHeight = 20;
  
  // Dividir texto en líneas para que quepa en el ancho máximo
  let words = message.split(' ');
  let lines = [];
  let currentLine = '';
  
  for (let word of words) {
    let testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (textWidth(testLine) <= maxWidth - padding * 2) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  // Calcular dimensiones del globo
  let bubbleWidth = maxWidth;
  let bubbleHeight = lines.length * lineHeight + padding * 2;
  
  // Posicionar el globo cerca del personaje pero visible en pantalla
  let bubbleX = constrain(currentMessage.x - bubbleWidth/2, 20, width - bubbleWidth - 20);
  let bubbleY = constrain(currentMessage.y - bubbleHeight - 30, 20, height - bubbleHeight - 20);
  
  // Dibujar sombra del globo
  fill(0, 0, 0, 100);
  rect(bubbleX + 3, bubbleY + 3, bubbleWidth, bubbleHeight, 15);
  
  // Dibujar fondo del globo
  fill(255, 255, 240, 250);
  stroke(100, 100, 100);
  strokeWeight(2);
  rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 15);
  
  // Dibujar "cola" del globo (triángulo apuntando al personaje)
  let triangleX = constrain(currentMessage.x, bubbleX + 30, bubbleX + bubbleWidth - 30);
  let triangleY = bubbleY + bubbleHeight;
  
  fill(255, 255, 240, 250);
  stroke(100, 100, 100);
  triangle(triangleX, triangleY,
           triangleX - 10, triangleY + 15,
           triangleX + 10, triangleY + 15);
  
  // Dibujar nombre del personaje
  fill(150, 100, 50);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(ResponsiveUtils.getTextSize('xs'));
  text(currentMessage.character + ":", bubbleX + padding, bubbleY + padding/2);
  
  // Dibujar texto del mensaje
  fill(50, 50, 50);
  textSize(ResponsiveUtils.getTextSize('sm'));
  
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], bubbleX + padding, bubbleY + padding + (i + 0.5) * lineHeight);
  }
  
  // Agregar efecto de desvanecimiento cuando está por desaparecer
  let timeLeft = messageDuration - (millis() - messageTimer);
  if (timeLeft < 500) { // Último medio segundo
    let alpha = map(timeLeft, 0, 500, 0, 255);
    fill(220, alpha);
    noStroke();
    rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 15);
  }
  
  pop();
}

// Función para dibujar las áreas de colisión (debug)
function drawCollisionAreas() {
  push();
  noFill();
  strokeWeight(2);
  
  // Área de Sofía (incluyendo barquito)
  stroke(255, 0, 255); // Magenta para Sofía
  let sofiaRect = {
    x: sofia.x - sofia.imageSize/2,
    y: sofia.y - sofia.imageSize/2 - sofia.barquitoSize - 5,
    width: sofia.imageSize,
    height: sofia.imageSize + sofia.barquitoSize + 5
  };
  rect(sofiaRect.x, sofiaRect.y, sofiaRect.width, sofiaRect.height);
  
  // Áreas de los faros
  stroke(255, 0, 0); // Rojo para faros
  for (let faro of faros) {
    // Área del faro SVG
    rect(faro.x - 5, faro.y - 10, faro.faroWidth, faro.faroHeight);
    
    // Área del avatar
    let imgX = faro.x + 15 - faro.imageSize/2;
    let imgY = faro.y + faro.faroHeight - 5;
    rect(imgX, imgY, faro.imageSize, faro.imageSize);
  }
  
  // Texto informativo
  fill(0);
  noStroke();
  textAlign(LEFT);
  textSize(12);
  text("Debug Mode: D para desactivar", 10, 20);
  text("Magenta = Sofía, Rojo = Faros", 10, 35);
  
  pop();
}

// Función para redimensionar ventana
function windowResized() {
  let w = windowWidth;
  let h = windowHeight;
  
  if (deviceInfo.isMobile) {
    w = Math.min(w, 800);
    h = Math.min(h, 600);
  }
  
  resizeCanvas(w, h);
  
  // Reposicionar Sofia
  sofia.x = width / 2;
  sofia.y = height / 2;
  sofia.imageSize = ResponsiveUtils.scaleValue(80); // Actualizar tamaño de imagen
  sofia.barquitoSize = ResponsiveUtils.scaleValue(80); // Actualizar tamaño del barquito (duplicado)
  
  // Reposicionar faros y actualizar tamaño de imágenes
  let spacing = ResponsiveUtils.getSpacing('xl');
  let newImageSize = ResponsiveUtils.scaleValue(60);
  
  faros[0].x = spacing * 2;
  faros[0].y = spacing * 2;
  faros[0].imageSize = newImageSize;
  
  faros[1].x = width - spacing * 3 - 30;
  faros[1].y = spacing * 2;
  faros[1].imageSize = newImageSize;
  
  faros[2].x = width / 2 - 15;
  faros[2].y = height - spacing * 6 - newImageSize; // Ajustar para dar espacio a la imagen
  faros[2].imageSize = newImageSize;
}

// Eventos de teclado
function keyPressed() {
  if (key === 'f' || key === 'F') {
    // Pantalla completa
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  } else if (key === ' ') {
    // Pausa/reanuda
    if (isLooping()) {
      noLoop();
    } else {
      loop();
    }
  } else if (key === 'r' || key === 'R') {
    // Reset
    setup();
    if (!isLooping()) {
      loop();
    }
  } else if (key === 'd' || key === 'D') {
    // Activar/desactivar debug de colisiones
    debugCollisions = !debugCollisions;
    console.log('Debug colisiones:', debugCollisions ? 'ON' : 'OFF');
  }
  
  // Controles de movimiento con teclado
  if (key === 'w' || key === 'W' || keyCode === UP_ARROW) {
    movementState.up = true;
  }
  if (key === 's' || key === 'S' || keyCode === DOWN_ARROW) {
    movementState.down = true;
  }
  if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) {
    movementState.left = true;
  }
  if (key === 'd' || key === 'D' || keyCode === RIGHT_ARROW) {
    movementState.right = true;
  }
}

function keyReleased() {
  // Detener movimiento cuando se suelta la tecla
  if (key === 'w' || key === 'W' || keyCode === UP_ARROW) {
    movementState.up = false;
  }
  if (key === 's' || key === 'S' || keyCode === DOWN_ARROW) {
    movementState.down = false;
  }
  if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) {
    movementState.left = false;
  }
  if (key === 'd' || key === 'D' || keyCode === RIGHT_ARROW) {
    movementState.right = false;
  }
}

// Eventos touch para móviles
function touchStarted() {
  if (sofia && touches.length > 0) {
    let touch = touches[0];
    let action = sofia.checkJoystickClick(touch.x, touch.y);
    if (action) {
      // Activar movimiento continuo en touch
      switch(action) {
        case 'up':
          movementState.up = true;
          break;
        case 'down':
          movementState.down = true;
          break;
        case 'left':
          movementState.left = true;
          break;
        case 'right':
          movementState.right = true;
          break;
      }
    }
  }
  return false; // Prevenir comportamiento por defecto
}

function touchMoved() {
  return false;
}

function touchEnded() {
  // Detener todo movimiento cuando se levante el dedo
  movementState.up = false;
  movementState.down = false;
  movementState.left = false;
  movementState.right = false;
  return false;
}

// Controles de mouse para el joystick
function mousePressed() {
  if (sofia) {
    let action = sofia.checkJoystickClick(mouseX, mouseY);
    if (action) {
      // Activar movimiento continuo
      switch(action) {
        case 'up':
          movementState.up = true;
          break;
        case 'down':
          movementState.down = true;
          break;
        case 'left':
          movementState.left = true;
          break;
        case 'right':
          movementState.right = true;
          break;
      }
    }
  }
}

function mouseReleased() {
  // Detener todo movimiento cuando se suelte el mouse
  movementState.up = false;
  movementState.down = false;
  movementState.left = false;
  movementState.right = false;
}