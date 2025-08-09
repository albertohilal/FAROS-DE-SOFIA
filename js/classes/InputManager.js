// Gestor de entrada para móvil y escritorio
class InputManager {
    constructor() {
        this.touches = [];
        this.mouse = { x: 0, y: 0, isPressed: false, button: null };
        this.keys = {};
        this.gestures = {};
        this.joystick = null;
        
        this.setupJoystick();
        this.setupGestureRecognition();
    }
    
    // === TOUCH EVENTS ===
    handleTouchStart(touches) {
        this.touches = Array.from(touches).map(touch => ({
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY,
            startX: touch.clientX,
            startY: touch.clientY,
            startTime: Date.now()
        }));
        
        // Vibración táctil
        if (this.touches.length === 1) {
            vibrateIfSupported(VibrationPatterns.tap);
        }
        
        this.detectGestureStart();
    }
    
    handleTouchMove(touches) {
        this.touches = Array.from(touches).map(touch => {
            const existingTouch = this.touches.find(t => t.id === touch.identifier);
            return {
                ...(existingTouch || {}),
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                startX: existingTouch ? existingTouch.startX : touch.clientX,
                startY: existingTouch ? existingTouch.startY : touch.clientY,
                startTime: existingTouch ? existingTouch.startTime : Date.now()
            };
        });
        
        this.detectGestureMove();
    }
    
    handleTouchEnd(touches) {
        const endTime = Date.now();
        
        // Detectar taps y swipes antes de limpiar
        this.touches.forEach(touch => {
            const duration = endTime - touch.startTime;
            const distance = Math.sqrt(
                Math.pow(touch.x - touch.startX, 2) + 
                Math.pow(touch.y - touch.startY, 2)
            );
            
            if (duration < 300 && distance < 10) {
                this.onTap(touch.x, touch.y);
            } else if (distance > 30) {
                this.onSwipe(touch);
            }
        });
        
        this.touches = Array.from(touches).map(touch => ({
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY
        }));
        
        if (this.touches.length === 0) {
            this.gestures = {};
        }
    }
    
    // === MOUSE EVENTS ===
    handleMousePress(x, y, button) {
        this.mouse = { x, y, isPressed: true, button };
        this.onTap(x, y); // Tratar click como tap
    }
    
    handleMouseMove(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
    }
    
    handleMouseRelease(x, y, button) {
        this.mouse = { x, y, isPressed: false, button: null };
    }
    
    // === KEYBOARD EVENTS ===
    handleKeyPress(key, keyCode) {
        this.keys[key] = true;
        this.keys[keyCode] = true;
        this.onKeyPress(key, keyCode);
    }
    
    handleKeyRelease(key, keyCode) {
        this.keys[key] = false;
        this.keys[keyCode] = false;
        this.onKeyRelease(key, keyCode);
    }
    
    // === JOYSTICK VIRTUAL ===
    setupJoystick() {
        const joystickElement = document.getElementById('joystick');
        const joystickInner = joystickElement.querySelector('.joystick-inner');
        
        if (!joystickElement) return;
        
        this.joystick = {
            element: joystickElement,
            inner: joystickInner,
            centerX: 0,
            centerY: 0,
            x: 0,
            y: 0,
            isActive: false,
            maxDistance: 30
        };
        
        const rect = joystickElement.getBoundingClientRect();
        this.joystick.centerX = rect.left + rect.width / 2;
        this.joystick.centerY = rect.top + rect.height / 2;
        
        // Eventos de touch para joystick
        joystickElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystick.isActive = true;
            this.updateJoystick(e.touches[0]);
        });
        
        joystickElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.joystick.isActive) {
                this.updateJoystick(e.touches[0]);
            }
        });
        
        joystickElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.joystick.isActive = false;
            this.resetJoystick();
        });
        
        // Eventos de mouse para pruebas en escritorio
        joystickElement.addEventListener('mousedown', (e) => {
            this.joystick.isActive = true;
            this.updateJoystick(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.joystick.isActive) {
                this.updateJoystick(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.joystick.isActive) {
                this.joystick.isActive = false;
                this.resetJoystick();
            }
        });
    }
    
    updateJoystick(event) {
        const rect = this.joystick.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = event.clientX - centerX;
        const deltaY = event.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance <= this.joystick.maxDistance) {
            this.joystick.x = deltaX;
            this.joystick.y = deltaY;
        } else {
            const angle = Math.atan2(deltaY, deltaX);
            this.joystick.x = Math.cos(angle) * this.joystick.maxDistance;
            this.joystick.y = Math.sin(angle) * this.joystick.maxDistance;
        }
        
        // Actualizar posición visual
        this.joystick.inner.style.transform = 
            `translate(${this.joystick.x}px, ${this.joystick.y}px)`;
    }
    
    resetJoystick() {
        this.joystick.x = 0;
        this.joystick.y = 0;
        this.joystick.inner.style.transform = 'translate(0px, 0px)';
    }
    
    getJoystickVector() {
        if (!this.joystick || !this.joystick.isActive) {
            return { x: 0, y: 0, magnitude: 0 };
        }
        
        const magnitude = Math.sqrt(
            this.joystick.x * this.joystick.x + 
            this.joystick.y * this.joystick.y
        ) / this.joystick.maxDistance;
        
        return {
            x: this.joystick.x / this.joystick.maxDistance,
            y: this.joystick.y / this.joystick.maxDistance,
            magnitude: Math.min(magnitude, 1)
        };
    }
    
    // === RECONOCIMIENTO DE GESTOS ===
    setupGestureRecognition() {
        this.gestureThresholds = {
            tapMaxDistance: 10,
            tapMaxDuration: 300,
            swipeMinDistance: 30,
            pinchMinDistance: 10,
            doubleTapMaxDelay: 400
        };
        
        this.lastTap = { time: 0, x: 0, y: 0 };
    }
    
    detectGestureStart() {
        if (this.touches.length === 2) {
            this.gestures.pinch = {
                startDistance: this.getDistanceBetweenTouches(),
                currentDistance: this.getDistanceBetweenTouches(),
                scale: 1
            };
        }
    }
    
    detectGestureMove() {
        if (this.touches.length === 2 && this.gestures.pinch) {
            const currentDistance = this.getDistanceBetweenTouches();
            this.gestures.pinch.scale = currentDistance / this.gestures.pinch.startDistance;
            this.gestures.pinch.currentDistance = currentDistance;
            this.onPinch(this.gestures.pinch.scale);
        }
    }
    
    getDistanceBetweenTouches() {
        if (this.touches.length < 2) return 0;
        
        const dx = this.touches[0].x - this.touches[1].x;
        const dy = this.touches[0].y - this.touches[1].y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // === EVENTOS CUSTOMIZABLES ===
    onTap(x, y) {
        // Detectar double tap
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastTap.time;
        const distance = Math.sqrt(
            Math.pow(x - this.lastTap.x, 2) + 
            Math.pow(y - this.lastTap.y, 2)
        );
        
        if (timeDiff < this.gestureThresholds.doubleTapMaxDelay && 
            distance < this.gestureThresholds.tapMaxDistance) {
            this.onDoubleTap(x, y);
        } else {
            this.onSingleTap(x, y);
        }
        
        this.lastTap = { time: currentTime, x, y };
    }
    
    onSingleTap(x, y) {
        // Override en sketch principal - interacción con faros
        console.log('Single tap at:', x, y);
        
        // Vibración suave para feedback
        if (getDeviceInfo().isMobile) {
            vibrateIfSupported(VibrationPatterns.tap);
        }
    }
    
    onDoubleTap(x, y) {
        // Override en sketch principal
        console.log('Double tap at:', x, y);
        vibrateIfSupported(VibrationPatterns.click);
    }
    
    onSwipe(touch) {
        const deltaX = touch.x - touch.startX;
        const deltaY = touch.y - touch.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < this.gestureThresholds.swipeMinDistance) return;
        
        let direction;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        console.log('Swipe detected:', direction, distance);
        // Override en sketch principal
    }
    
    onPinch(scale) {
        // Override en sketch principal
        console.log('Pinch scale:', scale);
    }
    
    onKeyPress(key, keyCode) {
        // Override en sketch principal
        console.log('Key pressed:', key, keyCode);
    }
    
    onKeyRelease(key, keyCode) {
        // Override en sketch principal
        console.log('Key released:', key, keyCode);
    }
    
    // === UTILIDADES ===
    update() {
        // Actualizar estado del joystick y otros inputs
        if (this.joystick && this.joystick.isActive) {
            // El joystick se actualiza automáticamente
        }
    }
    
    isKeyPressed(key) {
        return !!this.keys[key];
    }
    
    isMousePressed() {
        return this.mouse.isPressed;
    }
    
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    getTouchCount() {
        return this.touches.length;
    }
    
    getTouches() {
        return [...this.touches];
    }
}
