/**
 * Theme Manager Module
 * Handles theme cycling with View Transitions API animated reveal (MagicUI-inspired)
 */
const ThemeManager = {
    themes: ['terminal', 'glass', 'light'],
    themeLabels: { terminal: 'Terminal', glass: 'Glass', light: 'Light' },
    current: 'terminal',
    storageKey: 'portfolio-theme',

    init() {
        // Migrate legacy theme keys
        const legacyMap = {
            glassmorphic: 'glass',
            minimal: 'light',
            'minimal-dark': 'terminal',
            'solarized-dark': 'terminal',
            'solarized-light': 'light',
            monokai: 'terminal',
            dracula: 'glass',
            nord: 'glass'
        };
        const savedTheme = localStorage.getItem(this.storageKey);
        const migrated = legacyMap[savedTheme] || savedTheme;

        if (migrated && this.themes.includes(migrated)) {
            this.current = migrated;
            if (migrated !== savedTheme) {
                localStorage.setItem(this.storageKey, migrated);
            }
        }

        this.applyTheme(this.current);
        this.setupEventListeners();
        this.updateLabel();
    },

    setupEventListeners() {
        const toggleBtn = document.querySelector('.theme-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.cycleTheme());
        }

        // Keyboard shortcut: Ctrl/Cmd + Shift + T
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                this.cycleTheme();
            }
        });
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
    },

    setTheme(theme) {
        if (!this.themes.includes(theme)) return;

        const prev = this.current;
        this.current = theme;

        // Animated transition via View Transitions API
        if (typeof document.startViewTransition === 'function') {
            this.animateTransition(theme, prev);
        } else {
            this.applyTheme(theme);
        }

        localStorage.setItem(this.storageKey, theme);
        this.updateLabel();

        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme }
        }));
    },

    /**
     * MagicUI-inspired circle clip-path reveal via View Transitions API
     */
    animateTransition(newTheme, prevTheme) {
        const toggleBtn = document.querySelector('.theme-toggle-btn');
        const rect = toggleBtn ? toggleBtn.getBoundingClientRect() : null;
        const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

        const maxRadius = Math.hypot(
            Math.max(cx, window.innerWidth - cx),
            Math.max(cy, window.innerHeight - cy)
        );

        const root = document.documentElement;
        root.dataset.magicuiThemeVt = 'active';
        root.style.setProperty('--magicui-theme-toggle-vt-duration', '450ms');
        root.style.setProperty('--magicui-theme-vt-clip-from', `circle(0px at ${cx}px ${cy}px)`);

        const cleanup = () => {
            delete root.dataset.magicuiThemeVt;
            root.style.removeProperty('--magicui-theme-toggle-vt-duration');
            root.style.removeProperty('--magicui-theme-vt-clip-from');
        };

        const transition = document.startViewTransition(() => {
            this.applyTheme(newTheme);
        });

        if (transition?.finished?.finally) {
            transition.finished.finally(cleanup);
        } else {
            cleanup();
        }

        transition?.ready?.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${cx}px ${cy}px)`,
                        `circle(${maxRadius}px at ${cx}px ${cy}px)`,
                    ],
                },
                {
                    duration: 450,
                    easing: 'ease-in-out',
                    fill: 'forwards',
                    pseudoElement: '::view-transition-new(root)',
                }
            );
        });
    },

    getTheme() {
        return this.current;
    },

    cycleTheme() {
        const currentIndex = this.themes.indexOf(this.current);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex]);
    },

    updateLabel() {
        const label = document.querySelector('.theme-toggle-label');
        if (label) {
            label.textContent = this.themeLabels[this.current] || this.current;
        }
    },

    getAvailableThemes() {
        return [...this.themes];
    }
};

window.ThemeManager = ThemeManager;
