/**
 * Background Animation Module
 * Light rays + CSS dot pattern + meteors background effects
 */
const BackgroundAnimator = {
    isActive: true,

    config: {
    },

    init() {
        this.setupEventListeners();
        this.createLightRays();
        this.createDotPattern();
        this.createMeteors();
        this.updateRayColors();
        this.updateDotColors();
    },

    setupEventListeners() {
        document.addEventListener('themeChanged', () => {
            this.updateRayColors();
            this.updateDotColors();
        });
        window.addEventListener('resize', () => this.createDotPattern());
    },

    destroy() {
        this.isActive = false;
    },

    /**
     * Create MagicUI Light Rays (only visible on glass theme)
     */
    createLightRays() {
        const container = document.getElementById('lightRays');
        if (!container) return;

        const count = 8;
        const cycle = 14; // seconds, matches speed prop

        container.innerHTML = '';

        // Two radial gradient light sources (CSS handles these)
        const source1 = document.createElement('div');
        source1.className = 'ray-source ray-source-left';
        container.appendChild(source1);

        const source2 = document.createElement('div');
        source2.className = 'ray-source ray-source-right';
        container.appendChild(source2);

        // Create the ray beams
        for (let i = 0; i < count; i++) {
            const ray = document.createElement('div');
            ray.className = 'ray-beam';

            const left = 8 + Math.random() * 84;
            const rotate = -28 + Math.random() * 56;
            const width = 160 + Math.random() * 160;
            const swing = 0.8 + Math.random() * 1.8;
            const delay = Math.random() * cycle;
            const duration = cycle * (0.75 + Math.random() * 0.5);
            const intensity = 0.6 + Math.random() * 0.5;

            ray.style.setProperty('--ray-left', left + '%');
            ray.style.setProperty('--ray-width', width + 'px');
            ray.style.setProperty('--ray-rotate', rotate + 'deg');
            ray.style.setProperty('--ray-swing', swing + 'deg');
            ray.style.setProperty('--ray-delay', delay + 's');
            ray.style.setProperty('--ray-duration', duration + 's');
            ray.style.setProperty('--ray-intensity', intensity);

            container.appendChild(ray);
        }
    },

    /**
     * Update ray colors on theme change
     */
    updateRayColors() {
        const style = getComputedStyle(document.body);
        const primary = style.getPropertyValue('--color-primary').trim() || '#a0aec0';
        const accent = style.getPropertyValue('--color-accent').trim() || '#cbd5e0';

        const container = document.getElementById('lightRays');
        if (container) {
            container.style.setProperty('--light-rays-color', primary);
            container.style.setProperty('--light-rays-accent', accent);
        }
    },

    /**
     * Create MagicUI SVG Dot Pattern (only visible on terminal theme)
     * Uses SVG <pattern> for efficient tiling + radial mask + CSS glow animation
     */
    dotPatternTimer: null,
    createDotPattern() {
        const svg = document.getElementById('dotPattern');
        if (!svg) return;

        const spacing = 24;
        const radius = 2;

        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        svg.innerHTML = `
            <defs>
                <pattern id="dots" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
                    <circle cx="${spacing/2}" cy="${spacing/2}" r="${radius}" fill="currentColor" opacity="0.9">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
                        <animate attributeName="r" values="${radius};${radius*2.5};${radius}" dur="3s" repeatCount="indefinite"/>
                    </circle>
                </pattern>
                <radialGradient id="dotMaskGrad" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stop-color="white" stop-opacity="1"/>
                    <stop offset="70%" stop-color="white" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="white" stop-opacity="0.3"/>
                </radialGradient>
                <mask id="dotMask">
                    <rect width="100%" height="100%" fill="url(#dotMaskGrad)"/>
                </mask>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" mask="url(#dotMask)"/>
        `;

        this.updateDotColors();
    },

    /**
     * Update dot pattern color from theme
     */
    updateDotColors() {
        const svg = document.getElementById('dotPattern');
        if (!svg) return;

        const style = getComputedStyle(document.body);
        const primaryDim = style.getPropertyValue('--color-primary-dim').trim() || '#996a00';

        svg.style.color = primaryDim;
    },

    /**
     * Create MagicUI Meteors (only visible on terminal theme)
     */
    createMeteors() {
        const container = document.getElementById('meteorsContainer');
        if (!container) return;

        const count = 25;
        container.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const meteor = document.createElement('span');
            meteor.className = 'meteor';
            meteor.style.setProperty('--meteor-left', Math.floor(Math.random() * window.innerWidth) + 'px');
            meteor.style.setProperty('--meteor-angle', (200 + Math.random() * 40) + 'deg');
            meteor.style.setProperty('--meteor-delay', (Math.random() * 8) + 's');
            meteor.style.setProperty('--meteor-duration', (3 + Math.random() * 7) + 's');
            container.appendChild(meteor);
        }
    }
};
