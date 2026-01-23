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

        // Set up modals
        this.setupHelpModal();
        this.setupThemeModal();

        // Set up loading screen
        this.setupLoadingScreen();
    },

    /**
     * Set up loading screen and typing animation
     */
    setupLoadingScreen() {
        const hideLoadingAndType = () => {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                this.typeHeroCommand();
            }, 1800);
        };

        // Check if window has already loaded
        if (document.readyState === 'complete') {
            hideLoadingAndType();
        } else {
            window.addEventListener('load', hideLoadingAndType);
        }
    },

    /**
     * Type the hero command with animation
     */
    typeHeroCommand() {
        const heroCommand = document.getElementById('heroCommand');
        if (!heroCommand) return;

        const text = 'whoami --verbose';
        let i = 0;

        function type() {
            if (i < text.length) {
                heroCommand.textContent += text.charAt(i);
                i++;
                setTimeout(type, 80 + Math.random() * 40);
            }
        }

        setTimeout(type, 500);
    },

    /**
     * Set up help modal event handlers
     */
    setupHelpModal() {
        const helpModal = document.getElementById('helpModal');
        const helpClose = document.getElementById('helpClose');

        if (!helpModal) return;

        // Close button
        if (helpClose) {
            helpClose.addEventListener('click', () => {
                CommandSystem.hideHelp();
            });
        }

        // Click outside to close
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                CommandSystem.hideHelp();
            }
        });

        // Escape key to close
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

        // Close button
        if (themeClose) {
            themeClose.addEventListener('click', () => {
                CommandSystem.hideThemeList();
            });
        }

        // Click outside to close
        themeModal.addEventListener('click', (e) => {
            if (e.target === themeModal) {
                CommandSystem.hideThemeList();
            }
        });

        // Make theme items clickable (items are dynamically generated)
        const themeItems = themeModal.querySelectorAll('.theme-list li');
        themeItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                const themeName = item.querySelector('.cmd-name').textContent;
                ThemeManager.setTheme(themeName);
                // Update active state
                themeItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for use in other modules
window.App = App;
