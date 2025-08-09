// Variables globales
let deviceInfo = {};
let canvas;
let inputManager;
let sceneManager;

// Variables específicas de Faros de Sofia
let faros = [];
let sofia;

// Estados del juego
let gameState = {
    isPaused: false,
    isFullscreen: false,
    lastFrameTime: 0,
    targetFPS: 60
};

function preload() {
    // Aquí se cargarían los assets
    // loadImage(), loadSound(), etc.
}

function setup() {
    // Detectar dispositivo y configurar canvas
    deviceInfo = getDeviceInfo();
    
    // Crear canvas responsivo
    canvas = createResponsiveCanvas();
    
    // Configurar frameRate según dispositivo
    if (deviceInfo.isMobile) {
        frameRate(deviceInfo.isLowEnd ? 30 : 45);
    } else {
        frameRate(60);
    }
    
    // Inicializar Faros de Sofia
    initializeFarosSofia();
    
    // Inicializar managers
    inputManager = new InputManager();
    sceneManager = new SceneManager();
    
    // Configurar eventos
    setupEventListeners();
    
    // Ocultar pantalla de carga
    hideLoadingScreen();
    
    console.log('Dispositivo detectado:', deviceInfo);
}

function initializeFarosSofia() {
    // Crear Sofia en el centro
    sofia = new Sofia(width / 2, height / 2);
    
    // Crear faros con posiciones adaptadas al tamaño de pantalla
    faros = [];
    
    // Posiciones responsivas
    let faroSize = ResponsiveUtils.scaleValue(30);
    let spacing = ResponsiveUtils.getSpacing('xl');
    
    // Abuelo (esquina superior izquierda)
    faros.push(new Faro(
        spacing * 2, 
        spacing * 2, 
        color(0, 100, 255), 
        "Abuelo",
        faroSize
    ));
    
    // Papá (esquina superior derecha)
    faros.push(new Faro(
        width - spacing * 2 - faroSize, 
        spacing * 2, 
        color(100, 255, 100), 
        "Papá",
        faroSize
    ));
    
    // Tío (parte inferior central)
    faros.push(new Faro(
        width / 2 - faroSize / 2, 
        height - spacing * 3 - faroSize * 2, 
        color(255, 255, 0), 
        "Tío",
        faroSize
    ));
}

function draw() {
    // Control de FPS
    let currentTime = millis();
    let deltaTime = currentTime - gameState.lastFrameTime;
    gameState.lastFrameTime = currentTime;
    
    if (gameState.isPaused) {
        return;
    }
    
    // Fondo base
    background(220);
    
    // Niebla (dificultades familiares)
    // En móvil: tap y mantener presionado, en escritorio: click y mantener
    let isInteracting = false;
    if (deviceInfo.isMobile) {
        isInteracting = inputManager.getTouchCount() > 0;
    } else {
        isInteracting = mouseIsPressed;
    }
    
    if (isInteracting) {
        // Sofía puede "despejar" la niebla interactuando
        // En lugar de filter(BLUR) que puede ser pesado, usamos transparencia
        push();
        fill(255, 255, 255, 100);
        rect(0, 0, width, height);
        pop();
    } else {
        // Aplicar niebla sutil
        push();
        fill(150, 150, 150, 50);
        rect(0, 0, width, height);
        pop();
    }
    
    // Mostrar faros y Sofia
    faros.forEach(faro => faro.mostrar());
    if (sofia) {
        sofia.mostrar();
    }
    
    // Actualizar managers
    if (inputManager) inputManager.update();
    if (sceneManager) {
        // Solo actualizar scene manager si no estamos usando el modo directo
        // sceneManager.update(deltaTime);
        // sceneManager.draw();
    }
    
    // Dibujar información de debug (solo en desarrollo)
    if (deviceInfo.isDebug) {
        drawDebugInfo();
    }
}

function createResponsiveCanvas() {
    let canvasContainer = document.getElementById('app-container');
    let w = windowWidth;
    let h = windowHeight;
    
    // Ajustar resolución según dispositivo
    if (deviceInfo.isMobile) {
        // Reducir resolución en móviles para mejor rendimiento
        w = Math.min(w, 800);
        h = Math.min(h, 600);
        pixelDensity(deviceInfo.isHighDPI ? 2 : 1);
    } else {
        pixelDensity(deviceInfo.isHighDPI ? 2 : 1);
    }
    
    let canvas = createCanvas(w, h);
    canvas.parent(canvasContainer);
    
    return canvas;
}

function windowResized() {
    // Recalcular dimensiones del canvas
    let w = windowWidth;
    let h = windowHeight;
    
    if (deviceInfo.isMobile) {
        w = Math.min(w, 800);
        h = Math.min(h, 600);
    }
    
    resizeCanvas(w, h);
    
    // Reposicionar elementos de Faros de Sofia
    if (sofia) {
        sofia.x = width / 2;
        sofia.y = height / 2;
    }
    
    if (faros.length > 0) {
        let faroSize = ResponsiveUtils.scaleValue(30);
        let spacing = ResponsiveUtils.getSpacing('xl');
        
        // Reposicionar faros
        faros[0].x = spacing * 2;
        faros[0].y = spacing * 2;
        faros[0].size = faroSize;
        
        faros[1].x = width - spacing * 2 - faroSize;
        faros[1].y = spacing * 2;
        faros[1].size = faroSize;
        
        faros[2].x = width / 2 - faroSize / 2;
        faros[2].y = height - spacing * 3 - faroSize * 2;
        faros[2].size = faroSize;
    }
    
    // Notificar a los managers del cambio de tamaño
    if (sceneManager) {
        sceneManager.onResize(w, h);
    }
}

function setupEventListeners() {
    // Botón de pantalla completa
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
    
    // Botón de pausa
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    
    // Botón de reset
    document.getElementById('reset-btn').addEventListener('click', resetScene);
    
    // Eventos de visibilidad de página
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Prevenir zoom en móviles
    if (deviceInfo.isMobile) {
        preventMobileZoom();
    }
}

function toggleFullscreen() {
    if (!gameState.isFullscreen) {
        enterFullscreen();
    } else {
        exitFullscreen();
    }
}

function enterFullscreen() {
    let element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
    gameState.isFullscreen = true;
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    gameState.isFullscreen = false;
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    let pauseBtn = document.getElementById('pause-btn');
    pauseBtn.innerHTML = gameState.isPaused ? '▶' : '⏸';
    
    if (gameState.isPaused) {
        noLoop();
    } else {
        loop();
    }
}

function resetScene() {
    // Reinicializar Faros de Sofia
    initializeFarosSofia();
    
    if (sceneManager) {
        sceneManager.reset();
    }
    gameState.isPaused = false;
    document.getElementById('pause-btn').innerHTML = '⏸';
    loop();
}

function handleVisibilityChange() {
    if (document.hidden) {
        // Pausar cuando la pestaña está oculta
        if (!gameState.isPaused) {
            togglePause();
        }
    }
}

function preventMobileZoom() {
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        let now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

function hideLoadingScreen() {
    setTimeout(() => {
        let loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);
}

function drawDebugInfo() {
    push();
    fill(255, 255, 0);
    textAlign(LEFT, TOP);
    textSize(12);
    
    let info = [
        `FPS: ${frameRate().toFixed(1)}`,
        `Dispositivo: ${deviceInfo.isMobile ? 'Móvil' : 'Escritorio'}`,
        `Resolución: ${width} x ${height}`,
        `Pixel Density: ${pixelDensity()}`,
        `Táctil: ${deviceInfo.hasTouch ? 'Sí' : 'No'}`
    ];
    
    for (let i = 0; i < info.length; i++) {
        text(info[i], 10, 10 + i * 15);
    }
    pop();
}

// Eventos p5.js para móvil
function touchStarted() {
    if (inputManager) {
        inputManager.handleTouchStart(touches);
    }
    return false; // Prevenir comportamiento por defecto
}

function touchMoved() {
    if (inputManager) {
        inputManager.handleTouchMove(touches);
    }
    return false;
}

function touchEnded() {
    if (inputManager) {
        inputManager.handleTouchEnd(touches);
    }
    return false;
}

// Eventos p5.js para escritorio
function mousePressed() {
    if (inputManager && !deviceInfo.isMobile) {
        inputManager.handleMousePress(mouseX, mouseY, mouseButton);
    }
}

function mouseMoved() {
    if (inputManager && !deviceInfo.isMobile) {
        inputManager.handleMouseMove(mouseX, mouseY);
    }
}

function mouseReleased() {
    if (inputManager && !deviceInfo.isMobile) {
        inputManager.handleMouseRelease(mouseX, mouseY, mouseButton);
    }
}

function keyPressed() {
    if (inputManager) {
        inputManager.handleKeyPress(key, keyCode);
    }
    
    // Atajos de teclado
    if (key === 'f' || key === 'F') {
        toggleFullscreen();
    } else if (key === ' ') {
        togglePause();
    } else if (key === 'r' || key === 'R') {
        resetScene();
    }
}

function keyReleased() {
    if (inputManager) {
        inputManager.handleKeyRelease(key, keyCode);
    }
}

// === CLASES ESPECÍFICAS DE FAROS DE SOFIA ===

class Sofia {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = ResponsiveUtils.scaleValue(50);
    }
    
    mostrar() {
        push();
        fill(255, 200);
        ellipse(this.x, this.y, this.size); // Sofía es un círculo puro (potencial)
        
        // Texto responsivo
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(ResponsiveUtils.getTextSize('sm'));
        text("SOFÍA", this.x, this.y + this.size/2 + 20);
        pop();
    }
}

class Faro {
    constructor(x, y, col, nombre, size = 30) {
        this.x = x;
        this.y = y;
        this.col = col;
        this.nombre = nombre;
        this.size = size;
        this.showingMessage = false;
        this.messageTimer = 0;
    }
    
    mostrar() {
        push();
        
        // Dibujar faro
        fill(this.col);
        rect(this.x, this.y, this.size, this.size * 2); // Forma simple, pero clave
        
        // Nombre del faro
        fill(0);
        textAlign(CENTER, TOP);
        textSize(ResponsiveUtils.getTextSize('xs'));
        text(this.nombre, this.x + this.size/2, this.y + this.size * 2 + 10);
        
        // Verificar interacción
        this.checkInteraction();
        
        // Mostrar mensaje si está activo
        if (this.showingMessage) {
            this.mostrarMensaje();
            this.messageTimer--;
            if (this.messageTimer <= 0) {
                this.showingMessage = false;
            }
        }
        
        pop();
    }
    
    checkInteraction() {
        let interacting = false;
        
        if (deviceInfo.isMobile) {
            // Verificar touch - versión simplificada
            if (inputManager && inputManager.getTouchCount() > 0) {
                let touches = inputManager.getTouches();
                for (let touch of touches) {
                    if (this.isPointInside(touch.x, touch.y)) {
                        interacting = true;
                        break;
                    }
                }
            }
        } else {
            // Verificar mouse
            if (this.isPointInside(mouseX, mouseY)) {
                interacting = true;
                document.body.style.cursor = 'pointer';
            } else {
                document.body.style.cursor = 'default';
            }
        }
        
        if (interacting) {
            this.showingMessage = true;
            this.messageTimer = 180; // 3 segundos a 60fps
            
            // Vibración en móviles
            if (deviceInfo.isMobile) {
                vibrateIfSupported(VibrationPatterns.notification);
            }
            
            // Cambiar cursor solo en escritorio
            if (!deviceInfo.isMobile) {
                document.body.style.cursor = 'pointer';
            }
        } else if (!deviceInfo.isMobile) {
            document.body.style.cursor = 'default';
        }
    }
    
    isPointInside(px, py) {
        return px >= this.x && 
               px <= this.x + this.size && 
               py >= this.y && 
               py <= this.y + this.size * 2;
    }
    
    mostrarMensaje() {
        push();
        
        // Fondo del mensaje
        fill(0, 0, 0, 200);
        let mensaje = this.mensajeSecreto();
        let textW = textWidth(mensaje) + 20;
        let textH = 40;
        
        // Posicionar mensaje para que no se salga de pantalla
        let msgX = this.x + this.size/2 - textW/2;
        let msgY = this.y - 50;
        
        if (msgX < 10) msgX = 10;
        if (msgX + textW > width - 10) msgX = width - textW - 10;
        if (msgY < 10) msgY = this.y + this.size * 2 + 30;
        
        rect(msgX, msgY, textW, textH, 10);
        
        // Texto del mensaje
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(ResponsiveUtils.getTextSize('xs'));
        text(mensaje, msgX + textW/2, msgY + textH/2);
        
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
