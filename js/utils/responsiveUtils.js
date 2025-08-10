// Utilidades para diseño responsivo
class ResponsiveUtils {
    static getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            aspectRatio: window.innerWidth / window.innerHeight
        };
    }
    
    static getBreakpoint() {
        const width = window.innerWidth;
        
        if (width < 480) return 'xs';
        if (width < 768) return 'sm';
        if (width < 1024) return 'md';
        if (width < 1440) return 'lg';
        return 'xl';
    }
    
    static isMobileBreakpoint() {
        return ['xs', 'sm'].includes(this.getBreakpoint());
    }
    
    static isTabletBreakpoint() {
        return this.getBreakpoint() === 'md';
    }
    
    static isDesktopBreakpoint() {
        return ['lg', 'xl'].includes(this.getBreakpoint());
    }
    
    // Calcular tamaños escalados
    static scaleValue(baseValue, scaleFactor = 1) {
        const breakpoint = this.getBreakpoint();
        const scales = {
            xs: 0.7,
            sm: 1.2,
            md: 1.4,
            lg: 1.6,
            xl: 1.7
        };
        
        return baseValue * scales[breakpoint] * scaleFactor;
    }
    
    // Obtener padding/margin responsivo
    static getSpacing(size = 'md') {
        const breakpoint = this.getBreakpoint();
        const spacings = {
            xs: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16 },
            sm: { xs: 6, sm: 8, md: 12, lg: 16, xl: 20 },
            md: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24 },
            lg: { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 },
            xl: { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 }
        };
        
        return spacings[size][breakpoint];
    }
    
    // Obtener tamaño de texto responsivo
    static getTextSize(size = 'md') {
        const breakpoint = this.getBreakpoint();
        const sizes = {
            xs: { xs: 10, sm: 11, md: 12, lg: 13, xl: 14 },
            sm: { xs: 12, sm: 13, md: 14, lg: 15, xl: 16 },
            md: { xs: 14, sm: 15, md: 16, lg: 17, xl: 18 },
            lg: { xs: 18, sm: 20, md: 22, lg: 24, xl: 26 },
            xl: { xs: 24, sm: 26, md: 28, lg: 32, xl: 36 },
            xxl: { xs: 32, sm: 36, md: 40, lg: 48, xl: 56 }
        };
        
        return sizes[size][breakpoint];
    }
    
    // Safe area para dispositivos con notch
    static getSafeArea() {
        const computedStyle = getComputedStyle(document.documentElement);
        
        return {
            top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
            right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0,
            bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
            left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0
        };
    }
    
    // Calcular posición centrada
    static getCenteredPosition(elementWidth, elementHeight, containerWidth, containerHeight) {
        return {
            x: (containerWidth - elementWidth) / 2,
            y: (containerHeight - elementHeight) / 2
        };
    }
    
    // Ajustar posición para diferentes aspectos de pantalla
    static adaptToAspectRatio(position, targetAspectRatio = 16/9) {
        const viewport = this.getViewportSize();
        const currentAspectRatio = viewport.aspectRatio;
        
        if (currentAspectRatio > targetAspectRatio) {
            // Pantalla más ancha - ajustar horizontalmente
            const scale = targetAspectRatio / currentAspectRatio;
            return {
                x: position.x * scale + (viewport.width * (1 - scale)) / 2,
                y: position.y
            };
        } else {
            // Pantalla más alta - ajustar verticalmente
            const scale = currentAspectRatio / targetAspectRatio;
            return {
                x: position.x,
                y: position.y * scale + (viewport.height * (1 - scale)) / 2
            };
        }
    }
}

// Gestor de orientación
class OrientationManager {
    constructor(callback) {
        this.callback = callback;
        this.currentOrientation = this.getOrientation();
        this.setupListeners();
    }
    
    getOrientation() {
        if (screen.orientation) {
            return screen.orientation.type;
        }
        
        const angle = window.orientation || 0;
        if (angle === 0 || angle === 180) return 'portrait';
        return 'landscape';
    }
    
    setupListeners() {
        const handleOrientationChange = () => {
            setTimeout(() => {
                const newOrientation = this.getOrientation();
                if (newOrientation !== this.currentOrientation) {
                    this.currentOrientation = newOrientation;
                    if (this.callback) {
                        this.callback(newOrientation);
                    }
                }
            }, 100); // Delay para asegurar que las dimensiones se actualicen
        };
        
        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);
        } else {
            window.addEventListener('orientationchange', handleOrientationChange);
        }
        
        window.addEventListener('resize', handleOrientationChange);
    }
    
    isPortrait() {
        return this.currentOrientation.includes('portrait');
    }
    
    isLandscape() {
        return this.currentOrientation.includes('landscape');
    }
}

// Utilidades de canvas responsivo
class ResponsiveCanvas {
    static calculateOptimalSize(maxWidth = Infinity, maxHeight = Infinity, pixelRatio = 1) {
        const viewport = ResponsiveUtils.getViewportSize();
        const deviceInfo = getDeviceInfo();
        
        let width = Math.min(viewport.width, maxWidth);
        let height = Math.min(viewport.height, maxHeight);
        
        // Ajustar para dispositivos móviles de baja gama
        if (deviceInfo.isLowEnd) {
            width = Math.min(width, 800);
            height = Math.min(height, 600);
        }
        
        // Ajustar para pixel ratio
        const effectivePixelRatio = Math.min(pixelRatio, deviceInfo.pixelRatio);
        
        return {
            width: width,
            height: height,
            pixelRatio: effectivePixelRatio,
            displayWidth: width,
            displayHeight: height,
            bufferWidth: width * effectivePixelRatio,
            bufferHeight: height * effectivePixelRatio
        };
    }
    
    static maintainAspectRatio(targetWidth, targetHeight, containerWidth, containerHeight) {
        const targetRatio = targetWidth / targetHeight;
        const containerRatio = containerWidth / containerHeight;
        
        let width, height;
        
        if (containerRatio > targetRatio) {
            // Contenedor más ancho - ajustar por altura
            height = containerHeight;
            width = height * targetRatio;
        } else {
            // Contenedor más alto - ajustar por ancho
            width = containerWidth;
            height = width / targetRatio;
        }
        
        return {
            width: Math.round(width),
            height: Math.round(height),
            offsetX: (containerWidth - width) / 2,
            offsetY: (containerHeight - height) / 2
        };
    }
}

// Gestor de viewport
class ViewportManager {
    constructor() {
        this.viewport = ResponsiveUtils.getViewportSize();
        this.breakpoint = ResponsiveUtils.getBreakpoint();
        this.callbacks = [];
        
        this.setupListeners();
    }
    
    setupListeners() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.updateViewport();
            }, 100);
        });
    }
    
    updateViewport() {
        const oldViewport = { ...this.viewport };
        const oldBreakpoint = this.breakpoint;
        
        this.viewport = ResponsiveUtils.getViewportSize();
        this.breakpoint = ResponsiveUtils.getBreakpoint();
        
        const hasChanged = (
            oldViewport.width !== this.viewport.width ||
            oldViewport.height !== this.viewport.height ||
            oldBreakpoint !== this.breakpoint
        );
        
        if (hasChanged) {
            this.notifyCallbacks({
                viewport: this.viewport,
                breakpoint: this.breakpoint,
                previousViewport: oldViewport,
                previousBreakpoint: oldBreakpoint
            });
        }
    }
    
    onChange(callback) {
        this.callbacks.push(callback);
    }
    
    notifyCallbacks(data) {
        this.callbacks.forEach(callback => callback(data));
    }
    
    getViewport() {
        return { ...this.viewport };
    }
    
    getBreakpoint() {
        return this.breakpoint;
    }
}

// Utilidades de medidas adaptativas
class AdaptiveMeasures {
    static vw(value) {
        return (value * window.innerWidth) / 100;
    }
    
    static vh(value) {
        return (value * window.innerHeight) / 100;
    }
    
    static vmin(value) {
        return (value * Math.min(window.innerWidth, window.innerHeight)) / 100;
    }
    
    static vmax(value) {
        return (value * Math.max(window.innerWidth, window.innerHeight)) / 100;
    }
    
    static rem(value, baseFontSize = 16) {
        return value * baseFontSize;
    }
    
    // Medida fluida entre dos breakpoints
    static fluid(minValue, maxValue, minViewport = 320, maxViewport = 1200) {
        const viewport = window.innerWidth;
        
        if (viewport <= minViewport) return minValue;
        if (viewport >= maxViewport) return maxValue;
        
        const ratio = (viewport - minViewport) / (maxViewport - minViewport);
        return minValue + (maxValue - minValue) * ratio;
    }
}
