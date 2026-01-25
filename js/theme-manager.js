/**
 * Theme Manager Module
 * Handles theme switching with localStorage persistence
 */

const ThemeManager = {
    themes: ['terminal', 'glassmorphic', 'minimal', 'minimal-dark', 'solarized-dark', 'solarized-light', 'monokai', 'dracula', 'nord'],
    current: 'terminal',
    storageKey: 'portfolio-theme',

    /**
     * Initialize the theme manager
     */
    init() {
        // Load saved theme or use default
        const savedTheme = localStorage.getItem(this.storageKey);
        if (savedTheme && this.themes.includes(savedTheme)) {
            this.current = savedTheme;
        }

        // Apply the theme
        this.applyTheme(this.current);

        // Set up event listeners for theme dropdown
        this.setupEventListeners();

        // Update dropdown active state
        this.updateDropdownState();
    },

    /**
     * Set up event listeners for theme controls
     */
    setupEventListeners() {
        const themeBtn = document.querySelector('.theme-btn');
        const themeDropdown = document.querySelector('.theme-dropdown');
        const themeSelector = document.querySelector('.theme-selector');

        // Toggle dropdown on button click
        if (themeBtn && themeDropdown) {
            themeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                themeDropdown.classList.toggle('open');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (themeDropdown && themeSelector && !themeSelector.contains(e.target)) {
                themeDropdown.classList.remove('open');
            }
        });

        // Close dropdown on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && themeDropdown) {
                themeDropdown.classList.remove('open');
            }
        });

        // Theme dropdown buttons - select theme and close dropdown
        const dropdownButtons = document.querySelectorAll('.theme-dropdown button[data-theme]');
        dropdownButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                if (theme && this.themes.includes(theme)) {
                    this.setTheme(theme);
                    // Close the dropdown after selection
                    if (themeDropdown) {
                        themeDropdown.classList.remove('open');
                    }
                }
            });
        });

        // Keyboard shortcut for cycling themes (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                this.cycleTheme();
            }
        });
    },

    /**
     * Apply theme to the document
     * @param {string} theme - Theme name
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
    },

    /**
     * Set the current theme
     * @param {string} theme - Theme name
     */
    setTheme(theme) {
        if (!this.themes.includes(theme)) {
            console.warn(`Theme "${theme}" not found. Available themes: ${this.themes.join(', ')}`);
            return;
        }

        this.current = theme;
        this.applyTheme(theme);
        localStorage.setItem(this.storageKey, theme);
        this.updateDropdownState();

        // Dispatch custom event for other modules to react
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme }
        }));
    },

    /**
     * Get the current theme
     * @returns {string} Current theme name
     */
    getTheme() {
        return this.current;
    },

    /**
     * Cycle to the next theme
     */
    cycleTheme() {
        const currentIndex = this.themes.indexOf(this.current);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.setTheme(this.themes[nextIndex]);
    },

    /**
     * Update dropdown button active states
     */
    updateDropdownState() {
        const dropdownButtons = document.querySelectorAll('.theme-dropdown button[data-theme]');
        dropdownButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.theme === this.current);
        });
    },

    /**
     * Get list of available themes
     * @returns {string[]} Array of theme names
     */
    getAvailableThemes() {
        return [...this.themes];
    }
};

// Export for use in other modules
window.ThemeManager = ThemeManager;
