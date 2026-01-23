/**
 * Scroll Handler Module
 * Handles scroll reveal, navigation dots, and CRT fade effect
 */

const ScrollHandler = {
    sections: null,
    navDots: null,
    terminalBody: null,
    observer: null,
    scrollTimeout: null,

    /**
     * Initialize the scroll handler
     */
    init() {
        this.sections = document.querySelectorAll('.command-section');
        this.navDots = document.querySelectorAll('.nav-dot');
        this.terminalBody = document.getElementById('terminalBody');

        this.setupIntersectionObserver();
        this.setupNavDots();
        this.setupCRTFade();
    },

    /**
     * Set up Intersection Observer for scroll reveal
     */
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add visible class for reveal animation
                    entry.target.classList.add('visible');

                    // Update nav dots
                    const sectionId = entry.target.id;
                    this.updateNavDots(sectionId);
                }
            });
        }, observerOptions);

        // Observe all sections
        this.sections.forEach(section => {
            this.observer.observe(section);
        });
    },

    /**
     * Set up navigation dots click handlers
     */
    setupNavDots() {
        this.navDots.forEach(dot => {
            // Click handler
            dot.addEventListener('click', () => {
                const sectionId = dot.dataset.section;
                this.scrollToSection(sectionId);
            });

            // Keyboard handler for accessibility
            dot.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dot.click();
                }
            });
        });
    },

    /**
     * Update active state of navigation dots
     * @param {string} activeSectionId - ID of the currently active section
     */
    updateNavDots(activeSectionId) {
        this.navDots.forEach(dot => {
            dot.classList.toggle('active', dot.dataset.section === activeSectionId);
        });
    },

    /**
     * Scroll to a specific section
     * @param {string} sectionId - ID of the section to scroll to
     */
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    },

    /**
     * Set up CRT scanline fade effect on scroll
     */
    setupCRTFade() {
        if (!this.terminalBody) return;

        this.terminalBody.addEventListener('scroll', () => {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.updateCRTOpacity();
            }, 50);
        });
    },

    /**
     * Update CRT scanline opacity based on scroll position
     */
    updateCRTOpacity() {
        if (!this.terminalBody) return;

        const scrollProgress = this.terminalBody.scrollTop /
            (this.terminalBody.scrollHeight - this.terminalBody.clientHeight);
        const opacity = Math.max(0.005, 0.03 - scrollProgress * 0.025);
        document.documentElement.style.setProperty('--scanline-opacity', opacity.toString());
    },

    /**
     * Refresh all section animations
     */
    refreshAnimations() {
        this.sections.forEach(section => {
            section.classList.remove('visible');
        });

        // Re-add visible class after a short delay
        setTimeout(() => {
            this.sections.forEach(section => {
                section.classList.add('visible');
            });
        }, 100);
    },

    /**
     * Clean up observers and listeners
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        clearTimeout(this.scrollTimeout);
    }
};

// Export for use in other modules
window.ScrollHandler = ScrollHandler;
