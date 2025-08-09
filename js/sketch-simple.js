// Versión simplificada de Faros de Sofia
let faros = [];
let sofia;

function setup() {
  // Crear canvas responsivo
  let w = min(windowWidth, 800);
  let h = min(windowHeight, 600);
  createCanvas(w, h);
  
  // Crear Sofia en el centro
  sofia = new Sofia(width / 2, height / 2);
  
  // Crear faros
  faros = [];
  faros.push(new Faro(width * 0.15, height * 0.15, color(0, 100, 255), "Abuelo"));
  faros.push(new Faro(width * 0.85 - 30, height * 0.15, color(100, 255, 100), "Papá"));
  faros.push(new Faro(width * 0.5 - 15, height * 0.8, color(255, 255, 0), "Tío"));
  
  // Ocultar pantalla de carga
  setTimeout(() => {
    let loading = document.getElementById('loading-screen');
    if (loading) {
      loading.style.display = 'none';
    }
  }, 1000);
}

function draw() {
  background(220);
  
  // Niebla (dificultades familiares)
  if (mouseIsPressed || touches.length > 0) {
    // Sofia puede "despejar" la niebla interactuando
    tint(255, 200);
  } else {
    tint(255, 100);
  }
  
  // Resetear tint
  noTint();
  
  // Mostrar elementos
  faros.forEach(faro => faro.mostrar());
  if (sofia) {
    sofia.mostrar();
  }
}

function windowResized() {
  let w = min(windowWidth, 800);
  let h = min(windowHeight, 600);
  resizeCanvas(w, h);
  
  // Reposicionar elementos
  if (sofia) {
    sofia.x = width / 2;
    sofia.y = height / 2;
  }
  
  if (faros.length >= 3) {
    faros[0].x = width * 0.15;
    faros[0].y = height * 0.15;
    faros[1].x = width * 0.85 - 30;
    faros[1].y = height * 0.15;
    faros[2].x = width * 0.5 - 15;
    faros[2].y = height * 0.8;
  }
}

class Sofia {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  mostrar() {
    push();
    fill(255, 200);
    ellipse(this.x, this.y, 50);
    fill(0);
    textAlign(CENTER);
    textSize(12);
    text("SOFÍA", this.x, this.y + 40);
    pop();
  }
}

class Faro {
  constructor(x, y, col, nombre) {
    this.x = x;
    this.y = y;
    this.col = col;
    this.nombre = nombre;
    this.showMessage = false;
  }
  
  mostrar() {
    push();
    fill(this.col);
    rect(this.x, this.y, 30, 60);
    
    fill(0);
    textAlign(CENTER);
    textSize(10);
    text(this.nombre, this.x + 15, this.y + 80);
    
    // Verificar interacción
    let mouseOver = dist(mouseX, mouseY, this.x + 15, this.y + 30) < 40;
    let touchOver = false;
    
    // Verificar touch
    for (let i = 0; i < touches.length; i++) {
      if (dist(touches[i].x, touches[i].y, this.x + 15, this.y + 30) < 40) {
        touchOver = true;
        break;
      }
    }
    
    if (mouseOver || touchOver) {
      fill(255, 255, 255, 200);
      rect(this.x - 50, this.y - 30, 130, 25, 5);
      fill(0);
      textAlign(CENTER);
      textSize(9);
      text(this.mensajeSecreto(), this.x + 15, this.y - 15);
    }
    
    pop();
  }
  
  mensajeSecreto() {
    const mensajes = {
      "Abuelo": "A veces me pierdo... pero siempre vuelvo a vos",
      "Papá": "Mi amor es fuerte como el viento", 
      "Tío": "Tus preguntas no tienen por qué tener respuesta"
    };
    return mensajes[this.nombre] || "Mensaje de amor";
  }
}
