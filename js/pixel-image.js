/**
 * Pixel Image Component
 * MagicUI-inspired: splits image into grid pieces, fades each in with random delay,
 * then transitions from grayscale to color.
 */
const PixelImage = {
    DEFAULT_GRIDS: {
        '6x4':  { rows: 4, cols: 6 },
        '8x8':  { rows: 8, cols: 8 },
        '8x3':  { rows: 3, cols: 8 },
        '4x6':  { rows: 6, cols: 4 },
        '3x8':  { rows: 8, cols: 3 },
    },

    MIN_GRID: 1,
    MAX_GRID: 16,

    /**
     * Initialize all .pixel-image elements on the page
     */
    initAll() {
        document.querySelectorAll('.pixel-image').forEach(el => this.init(el));
    },

    /**
     * Initialize a single pixel-image element
     */
    init(container) {
        const src = container.dataset.src;
        const gridKey = container.dataset.grid || '6x4';
        const grayscaleAnimation = container.dataset.grayscale !== 'false';
        const pixelFadeInDuration = parseInt(container.dataset.fadeDuration, 10) || 800;
        const maxAnimationDelay = parseInt(container.dataset.maxDelay, 10) || 1200;
        const colorRevealDelay = parseInt(container.dataset.colorDelay, 10) || 1300;

        // Parse custom grid if provided
        let rows, cols;
        const customGridRaw = container.dataset.customGrid;
        if (customGridRaw) {
            try {
                const custom = JSON.parse(customGridRaw);
                if (this.isValidGrid(custom)) {
                    rows = custom.rows;
                    cols = custom.cols;
                }
            } catch (_) {
                // ignore invalid JSON
            }
        }
        if (rows === undefined) {
            const grid = this.DEFAULT_GRIDS[gridKey] || this.DEFAULT_GRIDS['6x4'];
            rows = grid.rows;
            cols = grid.cols;
        }

        // Set CSS custom properties for transitions
        container.style.setProperty('--pixel-fade', `${pixelFadeInDuration}ms`);
        container.style.setProperty('--pixel-color', `${pixelFadeInDuration}ms`);

        // Preload image before creating pieces
        const img = new Image();
        img.onload = () => {
            this.createPieces(container, src, rows, cols, grayscaleAnimation, maxAnimationDelay, colorRevealDelay);
        };
        img.onerror = () => {
            // Fallback: show the original img element
            const fallback = container.querySelector('.profile-image');
            if (fallback) {
                fallback.src = src;
                fallback.style.opacity = '1';
            }
        };
        img.src = src;
    },

    /**
     * Validate grid dimensions
     */
    isValidGrid(grid) {
        if (!grid) return false;
        const { rows, cols } = grid;
        return (
            Number.isInteger(rows) &&
            Number.isInteger(cols) &&
            rows >= this.MIN_GRID &&
            cols >= this.MIN_GRID &&
            rows <= this.MAX_GRID &&
            cols <= this.MAX_GRID
        );
    },

    /**
     * Create pixel pieces and append to container
     */
    createPieces(container, src, rows, cols, grayscaleAnimation, maxAnimationDelay, colorRevealDelay) {
        const total = rows * cols;

        for (let index = 0; index < total; index++) {
            const row = Math.floor(index / cols);
            const col = index % cols;

            // Calculate clip-path polygon for this piece
            const left = col * (100 / cols);
            const right = (col + 1) * (100 / cols);
            const top = row * (100 / rows);
            const bottom = (row + 1) * (100 / rows);

            const clipPath = `polygon(${left}% ${top}%, ${right}% ${top}%, ${right}% ${bottom}%, ${left}% ${bottom}%)`;

            // Random delay for staggered animation
            const delay = Math.random() * maxAnimationDelay;

            // Create piece element
            const piece = document.createElement('div');
            piece.className = 'pixel-piece' + (grayscaleAnimation ? ' grayscale' : '');
            piece.style.clipPath = clipPath;
            piece.style.backgroundImage = `url(${src})`;
            piece.style.transitionDelay = `${delay}ms`;

            container.appendChild(piece);

            // Trigger fade-in on next frame
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    piece.classList.add('visible');
                });
            });
        }

        // Trigger grayscale-to-color transition after delay
        if (grayscaleAnimation) {
            setTimeout(() => {
                container.querySelectorAll('.pixel-piece.grayscale').forEach(piece => {
                    piece.classList.remove('grayscale');
                    piece.classList.add('color');
                });
            }, colorRevealDelay);
        }
    }
};

// Auto-init on DOM ready if not handled by App
if (typeof App === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        PixelImage.initAll();
    });
}

window.PixelImage = PixelImage;
