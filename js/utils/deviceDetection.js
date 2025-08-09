// Detección de dispositivo y capacidades
function getDeviceInfo() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Detectar tipo de dispositivo
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;
    
    // Detectar sistema operativo
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const isWindows = /windows/i.test(platform);
    const isMac = /mac/i.test(platform);
    const isLinux = /linux/i.test(platform);
    
    // Detectar capacidades
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasGyroscope = 'DeviceOrientationEvent' in window;
    const hasAccelerometer = 'DeviceMotionEvent' in window;
    const hasVibration = 'vibrate' in navigator;
    
    // Detectar especificaciones de pantalla
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const pixelRatio = window.devicePixelRatio || 1;
    const isHighDPI = pixelRatio > 1;
    const isRetina = pixelRatio >= 2;
    
    // Estimar rendimiento del dispositivo
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 2; // GB
    
    const isLowEnd = (
        (isMobile && memory <= 2) ||
        (isMobile && hardwareConcurrency <= 2) ||
        (screenWidth <= 480)
    );
    
    const isMidRange = (
        (isMobile && memory > 2 && memory <= 4) ||
        (isMobile && hardwareConcurrency > 2 && hardwareConcurrency <= 4)
    );
    
    const isHighEnd = (
        (!isMobile) ||
        (isMobile && memory > 4) ||
        (isMobile && hardwareConcurrency > 4)
    );
    
    // Detectar navegador
    const isChrome = /chrome/i.test(userAgent) && !/edge/i.test(userAgent);
    const isFirefox = /firefox/i.test(userAgent);
    const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);
    const isEdge = /edge/i.test(userAgent);
    
    // Configuraciones recomendadas
    const recommendedFPS = isLowEnd ? 30 : (isMidRange ? 45 : 60);
    const recommendedParticles = isLowEnd ? 50 : (isMidRange ? 150 : 300);
    const useWebGL = isHighEnd || (!isMobile && !isLowEnd);
    
    return {
        // Tipo de dispositivo
        isMobile,
        isTablet,
        isDesktop,
        
        // Sistema operativo
        isIOS,
        isAndroid,
        isWindows,
        isMac,
        isLinux,
        
        // Capacidades
        hasTouch,
        hasGyroscope,
        hasAccelerometer,
        hasVibration,
        
        // Pantalla
        screenWidth,
        screenHeight,
        pixelRatio,
        isHighDPI,
        isRetina,
        
        // Rendimiento
        hardwareConcurrency,
        memory,
        isLowEnd,
        isMidRange,
        isHighEnd,
        
        // Navegador
        isChrome,
        isFirefox,
        isSafari,
        isEdge,
        
        // Configuraciones recomendadas
        recommendedFPS,
        recommendedParticles,
        useWebGL,
        
        // Debug
        isDebug: window.location.hostname === 'localhost' || window.location.search.includes('debug=true'),
        userAgent
    };
}

// Orientación del dispositivo
function getOrientation() {
    if (screen.orientation) {
        return screen.orientation.angle;
    } else if (window.orientation !== undefined) {
        return window.orientation;
    }
    return 0;
}

function isLandscape() {
    return Math.abs(getOrientation()) === 90;
}

function isPortrait() {
    return Math.abs(getOrientation()) === 0 || getOrientation() === 180;
}

// Eventos de orientación
function setupOrientationListeners(callback) {
    if (screen.orientation) {
        screen.orientation.addEventListener('change', callback);
    } else {
        window.addEventListener('orientationchange', callback);
    }
}

// Información de red
function getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
        return {
            effectiveType: 'unknown',
            downlink: 0,
            rtt: 0,
            saveData: false
        };
    }
    
    return {
        effectiveType: connection.effectiveType || 'unknown', // '4g', '3g', '2g', 'slow-2g'
        downlink: connection.downlink || 0, // Mbps
        rtt: connection.rtt || 0, // ms
        saveData: connection.saveData || false
    };
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.avgFPS = 60;
        this.fpsHistory = [];
        this.maxHistoryLength = 60; // 1 segundo a 60fps
    }
    
    update() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime > 0) {
            this.fps = 1000 / deltaTime;
            this.fpsHistory.push(this.fps);
            
            if (this.fpsHistory.length > this.maxHistoryLength) {
                this.fpsHistory.shift();
            }
            
            this.avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        }
        
        this.lastTime = currentTime;
        this.frameCount++;
    }
    
    getPerformanceLevel() {
        if (this.avgFPS >= 55) return 'high';
        if (this.avgFPS >= 35) return 'medium';
        return 'low';
    }
    
    shouldReduceQuality() {
        return this.avgFPS < 25;
    }
    
    shouldIncreaseQuality() {
        return this.avgFPS > 55 && this.fpsHistory.length >= this.maxHistoryLength;
    }
}

// Utilidades de vibración
function vibrateIfSupported(pattern) {
    const deviceInfo = getDeviceInfo();
    if (deviceInfo.hasVibration && deviceInfo.isMobile) {
        navigator.vibrate(pattern);
    }
}

// Patrones de vibración predefinidos
const VibrationPatterns = {
    tap: [10],
    click: [20],
    success: [100, 50, 100],
    error: [200, 100, 200, 100, 200],
    notification: [150, 75, 150],
    heartbeat: [100, 30, 100, 30, 100, 200, 200, 30, 200, 30, 200, 200, 100, 30, 100, 30, 100]
};
