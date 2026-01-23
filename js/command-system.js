/**
 * Command System Module
 * Handles terminal command input and execution
 */

const CommandSystem = {
    input: null,
    commands: {},

    /**
     * Initialize the command system
     */
    init() {
        this.input = document.getElementById('commandInput');
        this.registerDefaultCommands();
        this.setupEventListeners();
    },

    /**
     * Register default commands
     */
    registerDefaultCommands() {
        this.commands = {
            // Navigation commands
            'help': () => this.showHelp(),
            'whoami': () => ScrollHandler.scrollToSection('hero'),
            'about': () => ScrollHandler.scrollToSection('about'),
            'cat about.md': () => ScrollHandler.scrollToSection('about'),
            'experience': () => ScrollHandler.scrollToSection('experience'),
            'tree': () => ScrollHandler.scrollToSection('experience'),
            'resume': () => ScrollHandler.scrollToSection('experience'),
            'services': () => ScrollHandler.scrollToSection('services'),
            'systemctl': () => ScrollHandler.scrollToSection('services'),
            'skills': () => ScrollHandler.scrollToSection('skills'),
            'ls skills': () => ScrollHandler.scrollToSection('skills'),
            'projects': () => ScrollHandler.scrollToSection('portfolio'),
            'portfolio': () => ScrollHandler.scrollToSection('portfolio'),
            'ls': () => ScrollHandler.scrollToSection('portfolio'),
            'contact': () => ScrollHandler.scrollToSection('contact'),
            'mail': () => ScrollHandler.scrollToSection('contact'),

            // Utility commands
            'clear': () => ScrollHandler.refreshAnimations(),

            // Theme commands
            'theme': () => this.showThemeList(),
            'theme terminal': () => ThemeManager.setTheme('terminal'),
            'theme glassmorphic': () => ThemeManager.setTheme('glassmorphic'),
            'theme minimal': () => ThemeManager.setTheme('minimal'),
            'theme minimal-dark': () => ThemeManager.setTheme('minimal-dark'),
            'theme solarized-dark': () => ThemeManager.setTheme('solarized-dark'),
            'theme solarized-light': () => ThemeManager.setTheme('solarized-light'),
            'theme solarized': () => ThemeManager.setTheme('solarized-dark'),
            'theme monokai': () => ThemeManager.setTheme('monokai'),
            'theme dracula': () => ThemeManager.setTheme('dracula'),
            'theme nord': () => ThemeManager.setTheme('nord'),

            // Legacy mode commands (for backwards compatibility)
            'modern': () => ThemeManager.setTheme('glassmorphic'),
            'terminal': () => ThemeManager.setTheme('terminal')
        };
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (!this.input) return;

        // Handle command input
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(this.input.value);
                this.input.value = '';
            }
        });

        // Focus command input on '/' key
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== this.input) {
                e.preventDefault();
                this.input.focus();
            }
        });
    },

    /**
     * Execute a command
     * @param {string} input - User input string
     */
    executeCommand(input) {
        const cmd = input.toLowerCase().trim();

        if (!cmd) return;

        // Exact match
        if (this.commands[cmd]) {
            this.commands[cmd]();
            return;
        }

        // Partial match
        for (const [key, fn] of Object.entries(this.commands)) {
            if (cmd.includes(key) || key.includes(cmd)) {
                fn();
                return;
            }
        }

        // Command not found - could show error or just ignore
        console.log(`Command not found: ${cmd}`);
    },

    /**
     * Register a new command
     * @param {string} name - Command name
     * @param {Function} handler - Command handler function
     */
    registerCommand(name, handler) {
        this.commands[name.toLowerCase()] = handler;
    },

    /**
     * Show help modal
     */
    showHelp() {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) {
            helpModal.classList.add('visible');
        }
    },

    /**
     * Hide help modal
     */
    hideHelp() {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) {
            helpModal.classList.remove('visible');
        }
    },

    /**
     * Show available themes modal
     */
    showThemeList() {
        const themeModal = document.getElementById('themeModal');
        if (themeModal) {
            // Update active state in theme list
            const current = ThemeManager.getTheme();
            const themeItems = themeModal.querySelectorAll('.theme-list li');
            themeItems.forEach(item => {
                const themeName = item.querySelector('.cmd-name').textContent;
                item.classList.toggle('active', themeName === current);
            });
            themeModal.classList.add('visible');
        }
    },

    /**
     * Hide theme modal
     */
    hideThemeList() {
        const themeModal = document.getElementById('themeModal');
        if (themeModal) {
            themeModal.classList.remove('visible');
        }
    },

    /**
     * Get list of available commands
     * @returns {string[]} Array of command names
     */
    getAvailableCommands() {
        return Object.keys(this.commands);
    }
};

// Export for use in other modules
window.CommandSystem = CommandSystem;
