/**
 * Sparkles Effect Module (MagicUI-inspired)
 * Shows animated star sparkles around the hero name when text is selected
 */
const SparklesEffect = {
    container: null,
    sparkles: [],
    isActive: false,
    intervalId: null,

    config: {
        count: 12,
        // Colors use CSS variables set per theme
        firstColor: 'var(--color-primary)',
        secondColor: 'var(--color-accent)',
    },

    init() {
        const nameEl = document.querySelector('.hero-name');
        if (!nameEl) return;

        // Wrap the name text in a relative container for sparkle positioning
        this.wrapName(nameEl);
        this.container = nameEl.parentElement;

        // Listen for selection changes
        document.addEventListener('selectionchange', () => this.onSelectionChange());
    },

    wrapName(nameEl) {
        // Already wrapped?
        if (nameEl.parentElement?.classList.contains('hero-name-wrapper')) return;

        const wrapper = document.createElement('span');
        wrapper.className = 'hero-name-wrapper';
        nameEl.parentNode.insertBefore(wrapper, nameEl);
        wrapper.appendChild(nameEl);
    },

    onSelectionChange() {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
            this.stop();
            return;
        }

        const nameEl = document.querySelector('.hero-name');
        if (!nameEl) return;

        // Check if selection overlaps with the hero name
        const range = selection.getRangeAt(0);
        const nameRange = document.createRange();
        nameRange.selectNodeContents(nameEl);

        const intersects = this.rangesIntersect(range, nameRange);

        if (intersects && !this.isActive) {
            this.start();
        } else if (!intersects && this.isActive) {
            this.stop();
        }
    },

    rangesIntersect(a, b) {
        // Compare positions
        try {
            return a.compareBoundaryPoints(Range.END_TO_START, b) <= 0 &&
                   b.compareBoundaryPoints(Range.END_TO_START, a) <= 0;
        } catch {
            // If ranges are in different documents, fall back to node check
            const nameEl = document.querySelector('.hero-name');
            return nameEl && (
                nameEl.contains(a.commonAncestorContainer) ||
                a.commonAncestorContainer.contains(nameEl)
            );
        }
    },

    start() {
        if (this.isActive) return;
        this.isActive = true;

        this.spawnSparkles();

        // Regenerate sparkles periodically
        this.intervalId = setInterval(() => this.refreshSparkles(), 800);
    },

    stop() {
        this.isActive = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.clearSparkles();
    },

    spawnSparkles() {
        this.clearSparkles();
        for (let i = 0; i < this.config.count; i++) {
            this.createSparkle(i);
        }
    },

    createSparkle(index) {
        if (!this.container) return;

        const sparkle = document.createElement('span');
        sparkle.className = 'hero-sparkle';

        // Random position within the container bounds
        const x = 10 + Math.random() * 80;  // % from left
        const y = 5 + Math.random() * 90;   // % from top
        const delay = Math.random() * 1.5;
        const scale = 0.3 + Math.random() * 1.0;
        const color = Math.random() > 0.5
            ? 'var(--sparkles-first-color, var(--color-primary))'
            : 'var(--sparkles-second-color, var(--color-accent))';

        sparkle.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            z-index: 20;
            pointer-events: none;
            animation: sparkleAnim 0.8s ease-in-out ${delay}s infinite;
            --sparkle-scale: ${scale};
            color: ${color};
        `;

        // SVG star path (from MagicUI)
        sparkle.innerHTML = `<svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z"
            fill="currentColor"/>
        </svg>`;

        this.container.appendChild(sparkle);
        this.sparkles.push(sparkle);
    },

    refreshSparkles() {
        // Remove some old sparkles and spawn new ones
        const toRemove = Math.floor(this.sparkles.length * 0.4);
        for (let i = 0; i < toRemove; i++) {
            const idx = Math.floor(Math.random() * this.sparkles.length);
            const sparkle = this.sparkles[idx];
            if (sparkle) {
                sparkle.remove();
                this.sparkles.splice(idx, 1);
            }
        }

        // Spawn replacements
        const needed = this.config.count - this.sparkles.length;
        for (let i = 0; i < needed; i++) {
            this.createSparkle(i);
        }
    },

    clearSparkles() {
        this.sparkles.forEach(s => s.remove());
        this.sparkles = [];
    },

    destroy() {
        this.stop();
    }
};

window.SparklesEffect = SparklesEffect;
