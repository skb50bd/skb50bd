/**
 * App Module
 * Main initialization and coordination
 */
const App = {
    /**
     * Initialize the application
     */
    async init() {
        // Load content from JSON first
        await ContentRenderer.init();

        // Initialize all modules
        ThemeManager.init();
        ScrollHandler.init();
        CommandSystem.init();

        // Initialize new animation modules
        this.initEnhancements();

        // Initialize pixel image components
        if (typeof PixelImage !== 'undefined') {
            PixelImage.initAll();
        }

        // Set up modals
        this.setupHelpModal();
        this.setupThemeModal();

        // Set up loading screen
        this.setupLoadingScreen();
    },

    /**
     * Initialize enhanced animations and background
     */
    initEnhancements() {
        // Background particle network
        if (typeof BackgroundAnimator !== 'undefined') {
            BackgroundAnimator.init();
        }

        // Motion One enhanced animations
        if (typeof AnimationEnhancer !== 'undefined') {
            // Delay slightly so DOM content is fully rendered
            setTimeout(() => AnimationEnhancer.init(), 300);
        }

        // Sparkles effect on hero name selection
        if (typeof SparklesEffect !== 'undefined') {
            setTimeout(() => SparklesEffect.init(), 500);
        }
    },

    /**
     * Set up loading screen
     */
    setupLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) {
            // No loading screen — start hero typing immediately
            this.startHeroTypingIfReady();
            return;
        }

        const hideLoading = () => {
            loadingScreen.classList.add('hidden');
            // Wait for CSS fade-out transition (0.5s) then start hero typing
            setTimeout(() => this.startHeroTypingIfReady(), 550);
        };

        if (document.readyState === 'complete') {
            setTimeout(hideLoading, 800);
        } else {
            window.addEventListener('load', () => {
                setTimeout(hideLoading, 400);
            });
        }
    },

    /**
     * Start hero typing animation once AnimationEnhancer is ready
     */
    startHeroTypingIfReady() {
        if (typeof AnimationEnhancer !== 'undefined' && AnimationEnhancer.initHeroTyping) {
            AnimationEnhancer.initHeroTyping();
        }
    },

    /**
     * Set up help modal event handlers
     */
    setupHelpModal() {
        const helpModal = document.getElementById('helpModal');
        const helpClose = document.getElementById('helpClose');

        if (!helpModal) return;

        if (helpClose) {
            helpClose.addEventListener('click', () => {
                CommandSystem.hideHelp();
            });
        }

        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                CommandSystem.hideHelp();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                CommandSystem.hideHelp();
                CommandSystem.hideThemeList();
            }
        });
    },

    /**
     * Set up theme modal event handlers
     */
    setupThemeModal() {
        const themeModal = document.getElementById('themeModal');
        const themeClose = document.getElementById('themeClose');

        if (!themeModal) return;

        if (themeClose) {
            themeClose.addEventListener('click', () => {
                CommandSystem.hideThemeList();
            });
        }

        themeModal.addEventListener('click', (e) => {
            if (e.target === themeModal) {
                CommandSystem.hideThemeList();
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for use in other modules
window.App = App;
