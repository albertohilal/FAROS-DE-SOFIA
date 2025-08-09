// Gestor de escenas y estados del juego
class SceneManager {
    constructor() {
        this.currentScene = null;
        this.scenes = new Map();
        this.transitionDuration = 500;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        
        // Registrar escenas por defecto
        this.registerScene('main', new MainScene());
        this.registerScene('menu', new MenuScene());
        
        // Cambiar a escena principal
        this.changeScene('main');
    }
    
    registerScene(name, scene) {
        this.scenes.set(name, scene);
        scene.manager = this;
    }
    
    changeScene(sceneName, data = null) {
        if (this.isTransitioning) return;
        
        const newScene = this.scenes.get(sceneName);
        if (!newScene) {
            console.error(`Scene '${sceneName}' not found`);
            return;
        }
        
        this.isTransitioning = true;
        this.transitionProgress = 0;
        
        // Salir de la escena actual
        if (this.currentScene) {
            this.currentScene.exit();
        }
        
        // Cambiar a la nueva escena
        setTimeout(() => {
            this.currentScene = newScene;
            this.currentScene.enter(data);
            this.isTransitioning = false;
        }, this.transitionDuration / 2);
    }
    
    update(deltaTime) {
        if (this.isTransitioning) {
            this.transitionProgress += deltaTime / this.transitionDuration;
            this.transitionProgress = Math.min(this.transitionProgress, 1);
        }
        
        if (this.currentScene && !this.isTransitioning) {
            this.currentScene.update(deltaTime);
        }
    }
    
    draw() {
        if (this.currentScene) {
            this.currentScene.draw();
        }
        
        if (this.isTransitioning) {
            this.drawTransition();
        }
    }
    
    drawTransition() {
        push();
        fill(0, 0, 0, 150 * Math.sin(this.transitionProgress * PI));
        rect(0, 0, width, height);
        pop();
    }
    
    onResize(w, h) {
        this.scenes.forEach(scene => {
            if (scene.onResize) {
                scene.onResize(w, h);
            }
        });
    }
    
    reset() {
        if (this.currentScene) {
            this.currentScene.reset();
        }
    }
    
    getCurrentScene() {
        return this.currentScene;
    }
}

// Clase base para escenas
class BaseScene {
    constructor() {
        this.manager = null;
        this.isActive = false;
        this.elements = [];
        this.cameras = [];
        this.currentCamera = 0;
    }
    
    enter(data = null) {
        this.isActive = true;
        this.onEnter(data);
    }
    
    exit() {
        this.isActive = false;
        this.onExit();
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.elements.forEach(element => {
            if (element.update) {
                element.update(deltaTime);
            }
        });
        
        this.onUpdate(deltaTime);
    }
    
    draw() {
        if (!this.isActive) return;
        
        // Aplicar cámara si existe
        if (this.cameras[this.currentCamera]) {
            this.cameras[this.currentCamera].apply();
        }
        
        this.elements.forEach(element => {
            if (element.draw) {
                element.draw();
            }
        });
        
        this.onDraw();
        
        // Restaurar transformación
        if (this.cameras[this.currentCamera]) {
            this.cameras[this.currentCamera].restore();
        }
    }
    
    addElement(element) {
        this.elements.push(element);
    }
    
    removeElement(element) {
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
        }
    }
    
    reset() {
        this.elements.forEach(element => {
            if (element.reset) {
                element.reset();
            }
        });
        this.onReset();
    }
    
    onResize(w, h) {
        // Override en clases hijas
    }
    
    // Métodos para override
    onEnter(data) {}
    onExit() {}
    onUpdate(deltaTime) {}
    onDraw() {}
    onReset() {}
}

// Escena principal
class MainScene extends BaseScene {
    constructor() {
        super();
        this.particles = [];
        this.maxParticles = getDeviceInfo().recommendedParticles;
        this.backgroundColor = color(20, 25, 40);
        this.time = 0;
    }
    
    onEnter(data) {
        console.log('Entering main scene');
        this.initializeParticles();
    }
    
    onUpdate(deltaTime) {
        this.time += deltaTime / 1000;
        
        // Actualizar partículas
        this.particles.forEach(particle => particle.update(deltaTime));
        
        // Remover partículas muertas
        this.particles = this.particles.filter(particle => particle.isAlive());
        
        // Agregar nuevas partículas si es necesario
        while (this.particles.length < this.maxParticles && random() < 0.1) {
            this.addParticle();
        }
        
        // Responder a input
        this.handleInput();
    }
    
    onDraw() {
        background(this.backgroundColor);
        
        // Dibujar efecto de fondo
        this.drawBackground();
        
        // Dibujar partículas
        this.particles.forEach(particle => particle.draw());
        
        // Dibujar UI
        this.drawUI();
    }
    
    drawBackground() {
        // Gradiente animado
        push();
        for (let i = 0; i <= height; i += 2) {
            const alpha = map(i, 0, height, 100, 0);
            const hue = (this.time * 10 + i * 0.1) % 360;
            colorMode(HSB);
            stroke(hue, 30, 20, alpha);
            colorMode(RGB);
            line(0, i, width, i);
        }
        pop();
    }
    
    drawUI() {
        push();
        fill(255, 200);
        textAlign(CENTER, CENTER);
        textSize(ResponsiveUtils.getTextSize('lg'));
        text('Faros de Sofia', width / 2, height / 4);
        
        textSize(ResponsiveUtils.getTextSize('sm'));
        text('Tap para interactuar', width / 2, height / 2);
        pop();
    }
    
    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.maxParticles / 2; i++) {
            this.addParticle();
        }
    }
    
    addParticle() {
        this.particles.push(new Particle(
            random(width),
            random(height),
            random(-1, 1),
            random(-1, 1)
        ));
    }
    
    handleInput() {
        // Responder a joystick
        if (inputManager.joystick) {
            const joystickVector = inputManager.getJoystickVector();
            if (joystickVector.magnitude > 0.1) {
                // Agregar partículas en dirección del joystick
                for (let i = 0; i < joystickVector.magnitude * 3; i++) {
                    this.particles.push(new Particle(
                        width / 2,
                        height / 2,
                        joystickVector.x * 5,
                        joystickVector.y * 5
                    ));
                }
            }
        }
        
        // Responder a teclas
        if (inputManager.isKeyPressed('SPACE') || inputManager.isKeyPressed(' ')) {
            this.addParticle();
        }
    }
    
    onReset() {
        this.initializeParticles();
        this.time = 0;
    }
    
    onResize(w, h) {
        // Reposicionar partículas que estén fuera de pantalla
        this.particles.forEach(particle => {
            if (particle.x > w) particle.x = w - 10;
            if (particle.y > h) particle.y = h - 10;
        });
    }
}

// Escena de menú
class MenuScene extends BaseScene {
    constructor() {
        super();
        this.buttons = [];
        this.selectedButton = 0;
    }
    
    onEnter(data) {
        console.log('Entering menu scene');
        this.createButtons();
    }
    
    createButtons() {
        this.buttons = [
            { text: 'Jugar', action: () => this.manager.changeScene('main') },
            { text: 'Opciones', action: () => console.log('Opciones') },
            { text: 'Acerca de', action: () => console.log('Acerca de') }
        ];
    }
    
    onUpdate(deltaTime) {
        // Navegación con teclas
        if (inputManager.isKeyPressed('ArrowUp') || inputManager.isKeyPressed('w')) {
            this.selectedButton = Math.max(0, this.selectedButton - 1);
        }
        if (inputManager.isKeyPressed('ArrowDown') || inputManager.isKeyPressed('s')) {
            this.selectedButton = Math.min(this.buttons.length - 1, this.selectedButton + 1);
        }
        if (inputManager.isKeyPressed('Enter') || inputManager.isKeyPressed(' ')) {
            this.buttons[this.selectedButton].action();
        }
    }
    
    onDraw() {
        background(10, 15, 25);
        
        push();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(ResponsiveUtils.getTextSize('xxl'));
        text('MENÚ', width / 2, height / 4);
        
        // Dibujar botones
        const buttonHeight = ResponsiveUtils.getTextSize('lg') + ResponsiveUtils.getSpacing('md');
        const startY = height / 2 - (this.buttons.length * buttonHeight) / 2;
        
        this.buttons.forEach((button, index) => {
            const y = startY + index * buttonHeight;
            const isSelected = index === this.selectedButton;
            
            if (isSelected) {
                fill(255, 255, 100);
                rect(width / 2 - 100, y - buttonHeight / 2, 200, buttonHeight);
                fill(0);
            } else {
                fill(255);
            }
            
            textSize(ResponsiveUtils.getTextSize('lg'));
            text(button.text, width / 2, y);
        });
        pop();
    }
}

// Clase de partícula simple
class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = 1.0;
        this.decay = random(0.01, 0.03);
        this.size = random(2, 6);
        this.color = color(random(100, 255), random(100, 255), random(200, 255));
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime / 16;
        this.y += this.vy * deltaTime / 16;
        this.life -= this.decay;
        
        // Física simple
        this.vy += 0.1; // Gravedad
        this.vx *= 0.99; // Fricción
        this.vy *= 0.99;
        
        // Rebotar en bordes
        if (this.x < 0 || this.x > width) this.vx *= -0.8;
        if (this.y < 0 || this.y > height) this.vy *= -0.8;
        
        this.x = constrain(this.x, 0, width);
        this.y = constrain(this.y, 0, height);
    }
    
    draw() {
        push();
        const alpha = this.life * 255;
        this.color.setAlpha(alpha);
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.size * this.life);
        pop();
    }
    
    isAlive() {
        return this.life > 0;
    }
}
