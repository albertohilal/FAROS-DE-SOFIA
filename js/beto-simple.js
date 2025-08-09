// Faros de Sofia - Versión sin imágenes externas
let faros = [];
let sofia;
let deviceInfo = {};

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
  
  // Configurar frameRate según dispositivo
  if (deviceInfo.isMobile) {
    frameRate(deviceInfo.isLowEnd ? 30 : 45);
  } else {
    frameRate(60);
  }
  
  // Crear Sofia en el centro
  sofia = new Sofia(width / 2, height / 2);
  
  // Tres faros (Abuelo, Papá, Tío) con posiciones adaptativas
  faros = [];
  let spacing = ResponsiveUtils.getSpacing('xl');
  
  faros.push(new Faro(spacing * 2, spacing * 2, color(0, 100, 255), "Abuelo", "👴")); // Azul
  faros.push(new Faro(width - spacing * 3 - 30, spacing * 2, color(100, 255, 100), "Papá", "👨")); // Verde  
  faros.push(new Faro(width / 2 - 15, height - spacing * 6 - 60, color(255, 255, 0), "Tío", "👨‍🦲")); // Amarillo
  
  // Configurar controles
  setupControls();
  
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
    push();
    fill(255, 255, 255, 100);
    rect(0, 0, width, height);
    pop();
  }
  
  faros.forEach(faro => faro.mostrar());
  sofia.mostrar();
}

class Sofia {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  mostrar() {
    push();
    fill(255, 200);
    ellipse(this.x, this.y, 50); // Sofía es un círculo puro (potencial)
    fill(0);
    textAlign(CENTER);
    textSize(ResponsiveUtils.getTextSize('sm'));
    text("SOFÍA", this.x, this.y + 40);
    pop();
  }
}

class Faro {
  constructor(x, y, col, nombre, emoji) {
    this.x = x;
    this.y = y;
    this.col = col;
    this.nombre = nombre;
    this.emoji = emoji;
    this.portraitSize = ResponsiveUtils.scaleValue(60);
  }
  
  mostrar() {
    push();
    
    // Dibujar el rectángulo de color (faro)
    fill(this.col);
    rect(this.x, this.y, 30, 60);
    
    // Dibujar portrait emoji/ilustración
    let portraitX = this.x + 15;
    let portraitY = this.y + 65 + this.portraitSize/2;
    
    // Fondo del portrait
    fill(250);
    stroke(100);
    strokeWeight(2);
    ellipse(portraitX, portraitY, this.portraitSize);
    
    // Emoji como representación
    textAlign(CENTER, CENTER);
    textSize(this.portraitSize * 0.6);
    text(this.emoji, portraitX, portraitY - 2);
    
    // Nombre del faro debajo del portrait
    fill(0);
    noStroke();
    textSize(ResponsiveUtils.getTextSize('xs'));
    text(this.nombre, portraitX, portraitY + this.portraitSize/2 + 15);
    
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
      let msgX = portraitX - textW/2;
      msgX = constrain(msgX, 10, width - textW - 10);
      
      let msgY = this.y - 30;
      if (msgY < 10) {
        msgY = portraitY + this.portraitSize/2 + 35;
      }
      
      rect(msgX, msgY, textW, 20, 5);
      
      // Texto del mensaje
      fill(0);
      noStroke();
      textAlign(CENTER);
      text(mensaje, portraitX, msgY + 15);
    }
    pop();
  }
  
  checkInteraction() {
    let portraitX = this.x + 15;
    let portraitY = this.y + 65 + this.portraitSize/2;
    
    if (deviceInfo.isMobile) {
      for (let i = 0; i < touches.length; i++) {
        if (dist(touches[i].x, touches[i].y, portraitX, portraitY) < this.portraitSize/2 + 10 ||
            (touches[i].x >= this.x && touches[i].x <= this.x + 30 && 
             touches[i].y >= this.y && touches[i].y <= this.y + 60)) {
          return true;
        }
      }
    } else {
      if (dist(mouseX, mouseY, portraitX, portraitY) < this.portraitSize/2 + 10 ||
          (mouseX >= this.x && mouseX <= this.x + 30 && 
           mouseY >= this.y && mouseY <= this.y + 60)) {
        return true;
      }
    }
    return false;
  }
  
  mensajeSecreto() {
    return {
      "Abuelo": "A veces me pierdo... pero siempre vuelvo a vos",
      "Papá": "Mi amor es fuerte como el viento",
      "Tío": "Tus preguntas no tienen por qué tener respuesta"
    }[this.nombre];
  }
}

// Función para configurar controles UI
function setupControls() {
  document.getElementById('fullscreen-btn').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });
  
  let isPaused = false;
  document.getElementById('pause-btn').addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      noLoop();
      document.getElementById('pause-btn').innerHTML = '▶';
    } else {
      loop();
      document.getElementById('pause-btn').innerHTML = '⏸';
    }
  });
  
  document.getElementById('reset-btn').addEventListener('click', () => {
    setup();
    if (isPaused) {
      isPaused = false;
      loop();
      document.getElementById('pause-btn').innerHTML = '⏸';
    }
  });
}

function windowResized() {
  let w = windowWidth;
  let h = windowHeight;
  
  if (deviceInfo.isMobile) {
    w = Math.min(w, 800);
    h = Math.min(h, 600);
  }
  
  resizeCanvas(w, h);
  
  sofia.x = width / 2;
  sofia.y = height / 2;
  
  let spacing = ResponsiveUtils.getSpacing('xl');
  let newPortraitSize = ResponsiveUtils.scaleValue(60);
  
  faros[0].x = spacing * 2;
  faros[0].y = spacing * 2;
  faros[0].portraitSize = newPortraitSize;
  
  faros[1].x = width - spacing * 3 - 30;
  faros[1].y = spacing * 2;
  faros[1].portraitSize = newPortraitSize;
  
  faros[2].x = width / 2 - 15;
  faros[2].y = height - spacing * 6 - newPortraitSize;
  faros[2].portraitSize = newPortraitSize;
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    document.getElementById('fullscreen-btn').click();
  } else if (key === ' ') {
    document.getElementById('pause-btn').click();
  } else if (key === 'r' || key === 'R') {
    document.getElementById('reset-btn').click();
  }
}

function touchStarted() {
  return false;
}

function touchMoved() {
  return false;
}

function touchEnded() {
  return false;
}
