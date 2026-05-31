/**
 * Animation Enhancer Module
 * Motion One-powered scroll animations, parallax, 3D tilt, text reveals, and smooth interactions
 */
const AnimationEnhancer = {
    observer: null,
    motionLib: null,

    init() {
        if (typeof Motion === 'undefined' && typeof motion === 'undefined') {
            console.warn('Motion One not loaded, falling back to CSS animations');
            this.initFallback();
            return;
        }

        this.motionLib = typeof motion !== 'undefined' ? motion : Motion;

        this.setupScrollReveal();
        this.setupParallax();
        this.setupTextReveal();
        this.setupHoverEffects();
        this.setupCardTilt();
        this.setupCounterAnimation();
        this.setupTypingAnimation();
    },

    /* ── FALLBACK ─────────────────────────────────────────── */
    initFallback() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('revealed');
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        document.querySelectorAll('.stagger-item').forEach(el => this.observer.observe(el));
        document.querySelectorAll('.text-reveal-word').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 50);
        });
    },

    /* ── SCROLL REVEAL — MagicUI BlurFade (y: -6→0 + blur→0 + fade in) ── */
    setupScrollReveal() {
        if (!this.motionLib) return;

        document.querySelectorAll('.stagger-container').forEach(container => {
            const items = container.querySelectorAll('.stagger-item');
            if (items.length === 0) return;

            items.forEach((item) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(-6px)';
                item.style.filter = 'blur(6px)';
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    items.forEach((item, index) => {
                        this.motionLib.animate(
                            item,
                            {
                                opacity: [0, 1],
                                transform: ['translateY(-6px)', 'translateY(0px)'],
                                filter: ['blur(6px)', 'blur(0px)'],
                            },
                            { duration: 0.4, delay: 0.04 + index * 0.05, easing: 'easeOut' }
                        );
                        item.classList.add('revealed');
                    });
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

            observer.observe(container);
        });
    },

    /* ── PARALLAX ──────────────────────────────────────────── */
    setupParallax() {
        if (!this.motionLib?.scroll) return;

        // Hero ASCII logo — drifts slower than scroll
        const asciiLogo = document.querySelector('.ascii-logo');
        if (asciiLogo) {
            this.motionLib.scroll(
                this.motionLib.animate(asciiLogo, { y: [0, -60] }, { ease: 'linear' }),
                { target: asciiLogo, offset: ['start end', 'end start'] }
            );
        }

        // Profile image — subtle scale + translate on scroll
        const profileImage = document.querySelector('.pixel-image');
        if (profileImage) {
            this.motionLib.scroll(
                this.motionLib.animate(profileImage, { scale: [0.92, 1.05], y: [20, -10] }, { ease: 'linear' }),
                { target: profileImage.closest('.output-panel') || profileImage, offset: ['start end', 'end start'] }
            );
        }

        // Hero tickers — subtle float
        document.querySelectorAll('.hero-ticker').forEach((item, i) => {
            this.motionLib.scroll(
                this.motionLib.animate(item, { y: [10, -10] }, { ease: 'linear' }),
                { target: item, offset: ['start end', 'end start'] }
            );
        });
    },

    /* ── TEXT REVEAL ───────────────────────────────────────── */
    setupTextReveal() {
        document.querySelectorAll('[data-text-reveal]').forEach(el => {
            const text = el.textContent;
            const words = text.split(' ');
            el.textContent = '';
            el.style.display = 'inline';

            words.forEach((word, i) => {
                const span = document.createElement('span');
                span.className = 'text-reveal-word';
                span.textContent = word + (i < words.length - 1 ? '\u00A0' : '');
                span.style.transitionDelay = i * 0.04 + 's';
                el.appendChild(span);
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        el.querySelectorAll('.text-reveal-word').forEach(w => w.classList.add('visible'));
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(el);
        });
    },

    /* ── HOVER LIFT ────────────────────────────────────────── */
    setupHoverEffects() {
        if (!this.motionLib) return;

        document.querySelectorAll('.portfolio-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.motionLib.animate(card, { y: -8 }, { duration: 0.3, easing: [0.16, 1, 0.3, 1] });
            });
            card.addEventListener('mouseleave', () => {
                this.motionLib.animate(card, { y: 0, rotateX: 0, rotateY: 0 }, { duration: 0.4, easing: [0.16, 1, 0.3, 1] });
            });
        });

        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.motionLib.animate(card, { y: -4, scale: 1.02 }, { duration: 0.3, easing: [0.16, 1, 0.3, 1] });
            });
            card.addEventListener('mouseleave', () => {
                this.motionLib.animate(card, { y: 0, scale: 1 }, { duration: 0.3, easing: [0.16, 1, 0.3, 1] });
            });
        });
    },

    /* ── 3D CARD TILT ON HOVER ─────────────────────────────── */
    setupCardTilt() {
        if (!this.motionLib) return;

        document.querySelectorAll('.portfolio-card').forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.style.perspective = '800px';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 … 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                this.motionLib.animate(card, {
                    rotateX: y * -8,
                    rotateY: x * 8,
                    y: -6,
                }, { duration: 0.2, easing: 'ease-out' });
            });
        });
    },

    /* ── NUMBER COUNTER ────────────────────────────────────── */
    setupCounterAnimation() {
        const statValues = document.querySelectorAll('[data-counter]');
        const counted = new Set();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || counted.has(entry.target)) return;
                counted.add(entry.target);
                const target = entry.target;
                const endValue = target.getAttribute('data-counter');
                const isPercent = endValue.includes('%');
                const isPlus = endValue.includes('+');
                const numStr = endValue.replace(/[%+]/g, '');
                const num = parseInt(numStr, 10);

                if (isNaN(num)) { target.textContent = endValue; return; }

                const duration = 1500;
                const startTime = performance.now();

                const update = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(eased * num);
                    target.textContent = current + (isPercent ? '%' : isPlus ? '+' : '');
                    target.classList.add('counter-value');

                    if (progress < 1) requestAnimationFrame(update);
                };
                requestAnimationFrame(update);
            });
        }, { threshold: 0.5 });

        statValues.forEach(el => observer.observe(el));
    },

    /* ── COMMAND TYPING ───────────────────────────────────── */
    heroTypingStarted: false,

    setupTypingAnimation() {
        // Hero typing is started separately after loading screen hides
        this.initSectionTyping();
    },

    initHeroTyping() {
        const commandEl = document.getElementById('heroCommand');
        if (!commandEl) return;

        const commands = [
            commandEl.getAttribute('data-text') || 'whoami --verbose',
            'cat resume.txt',
            './introduce.sh',
        ];
        let cmdIndex = 0;

        const typeCommand = () => {
            const cmd = commands[cmdIndex];
            let charIndex = 0;
            commandEl.textContent = '';

            const typeChar = () => {
                if (charIndex < cmd.length) {
                    commandEl.textContent += cmd[charIndex];
                    charIndex++;
                    setTimeout(typeChar, 80 + Math.random() * 60);
                } else {
                    setTimeout(() => {
                        let eraseIndex = cmd.length;
                        const eraseChar = () => {
                            if (eraseIndex > 0) {
                                commandEl.textContent = cmd.substring(0, eraseIndex - 1);
                                eraseIndex--;
                                setTimeout(eraseChar, 40 + Math.random() * 30);
                            } else {
                                cmdIndex = (cmdIndex + 1) % commands.length;
                                setTimeout(typeCommand, 800);
                            }
                        };
                        eraseChar();
                    }, 2000);
                }
            };
            typeChar();
        };

        setTimeout(typeCommand, 1500);
    },

    initSectionTyping() {
        // Per-section command lists — cycles through related terminal commands
        const sectionCommands = {
            about: ['cat about.md', 'less README.md', 'whois shakib'],
            experience: ['tree --experience', 'git log --oneline', 'history | grep deploy'],
            services: ['systemctl list-services --active', 'ps aux | grep sre', 'netstat -tlnp'],
            skills: ['tree ~/skills --level 2', 'which dotnet kubernetes terraform', 'man infrastructure'],
            projects: ['ls -la ./projects/', 'docker ps', 'kubectl get deployments'],
            contact: ['mail -s "Hello" hello@shakib.bd', 'echo "Let\'s talk" | sendmail'],
        };

        const activeLoops = new Set();
        const commandEls = document.querySelectorAll('.command-section:not(#hero) .command-text[data-text]');

        if (commandEls.length === 0) return;

        const startLoop = (el, commands) => {
            let cmdIndex = 0;

            const typeCycle = () => {
                const cmd = commands[cmdIndex];
                let charIndex = 0;
                el.textContent = '';

                const typeChar = () => {
                    if (charIndex < cmd.length) {
                        el.textContent += cmd[charIndex];
                        charIndex++;
                        setTimeout(typeChar, 80 + Math.random() * 60);
                    } else {
                        // Pause, then erase
                        setTimeout(() => {
                            let eraseIndex = cmd.length;
                            const eraseChar = () => {
                                if (eraseIndex > 0) {
                                    el.textContent = cmd.substring(0, eraseIndex - 1);
                                    eraseIndex--;
                                    setTimeout(eraseChar, 40 + Math.random() * 30);
                                } else {
                                    cmdIndex = (cmdIndex + 1) % commands.length;
                                    setTimeout(typeCycle, 800);
                                }
                            };
                            eraseChar();
                        }, 2000);
                    }
                };
                typeChar();
            };

            typeCycle();
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                const sectionId = el.closest('.command-section')?.id;

                if (!entry.isIntersecting || activeLoops.has(sectionId)) return;
                activeLoops.add(sectionId);

                const commands = sectionCommands[sectionId] || [el.getAttribute('data-text')];
                startLoop(el, commands);
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

        commandEls.forEach(el => observer.observe(el));
    },
};
