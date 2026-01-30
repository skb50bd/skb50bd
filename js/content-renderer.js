/**
 * Content Renderer Module
 * Loads content from JSON Resume + overlay and renders it to the DOM
 */

const ContentRenderer = {
    resume: null,

    /**
     * Initialize the content renderer
     */
    async init() {
        try {
            await this.loadContent();
            this.renderAll();
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    },

    /**
     * Deep merge two objects, with source overriding target
     * Arrays are merged by index (source[i] extends target[i])
     */
    deepMerge(target, source) {
        if (!source) return target;
        if (!target) return source;

        const result = { ...target };

        for (const key of Object.keys(source)) {
            if (source[key] === null || source[key] === undefined) {
                continue;
            }

            if (Array.isArray(source[key]) && Array.isArray(target[key])) {
                // Merge arrays by index
                result[key] = target[key].map((item, index) => {
                    if (source[key][index]) {
                        if (typeof item === 'object' && typeof source[key][index] === 'object') {
                            return this.deepMerge(item, source[key][index]);
                        }
                        return source[key][index];
                    }
                    return item;
                });
                // Add any extra items from source
                if (source[key].length > target[key].length) {
                    result[key] = result[key].concat(source[key].slice(target[key].length));
                }
            } else if (typeof source[key] === 'object' && typeof target[key] === 'object' && !Array.isArray(source[key])) {
                // Deep merge objects
                result[key] = this.deepMerge(target[key], source[key]);
            } else {
                // Override with source value
                result[key] = source[key];
            }
        }

        return result;
    },

    /**
     * Load content from JSON Resume file + overlay
     */
    async loadContent() {
        // Load base resume
        const resumeResponse = await fetch('./resume.json');
        if (!resumeResponse.ok) {
            throw new Error(`Failed to load resume: ${resumeResponse.status}`);
        }
        const baseResume = await resumeResponse.json();

        // Load overlay (optional - don't fail if missing)
        let overlay = {};
        try {
            const overlayResponse = await fetch('./resume.overlay.json');
            if (overlayResponse.ok) {
                overlay = await overlayResponse.json();
            }
        } catch (e) {
            console.warn('No overlay file found, using base resume only');
        }

        // Merge overlay onto base
        this.resume = this.deepMerge(baseResume, overlay);
    },

    /**
     * Render all content sections
     */
    renderAll() {
        if (!this.resume) return;
        
        this.renderMeta();
        this.renderHero();
        this.renderAbout();
        this.renderExperience();
        this.renderServices();
        this.renderSkills();
        this.renderPortfolio();
        this.renderContact();
        this.renderFooter();
        this.renderCommands();
        this.renderThemes();
    },

    /**
     * Render meta tags (for dynamic updates if needed)
     */
    renderMeta() {
        const { ui } = this.resume;
        if (ui?.meta?.title) {
            document.title = ui.meta.title;
        }
    },

    /**
     * Render hero section
     */
    renderHero() {
        const { basics, ui } = this.resume;
        const hero = ui?.hero || {};
        
        // ASCII Logo
        const asciiLogo = document.querySelector('.ascii-logo');
        if (asciiLogo && hero.asciiLogo) {
            asciiLogo.textContent = hero.asciiLogo;
        }
        
        // Name - from JSON Resume basics
        const heroName = document.querySelector('.hero-name');
        if (heroName) {
            heroName.textContent = basics.name;
        }
        
        // Title - from JSON Resume basics
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.textContent = basics.label;
        }
        
        // Tagline - from overlay
        const heroTagline = document.querySelector('.hero-tagline');
        if (heroTagline && hero.tagline) {
            heroTagline.textContent = hero.tagline;
        }
        
        // Stats - from overlay
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats && hero.stats) {
            heroStats.innerHTML = hero.stats.map(stat => `
                <div class="stat-item">
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('');
        }
    },

    /**
     * Render about section
     */
    renderAbout() {
        const { basics, ui } = this.resume;
        const about = ui?.about || {};
        
        // Profile image - from JSON Resume basics
        const profileImage = document.querySelector('.profile-image');
        if (profileImage) {
            profileImage.src = basics.image;
            profileImage.alt = basics.name;
        }
        
        // Headline - from overlay
        const aboutHeadline = document.querySelector('.about-text h2');
        if (aboutHeadline && about.headline) {
            aboutHeadline.textContent = about.headline;
        }
        
        // Bio - from JSON Resume basics.summary
        const aboutBio = document.querySelector('.about-text p');
        if (aboutBio) {
            aboutBio.textContent = basics.summary;
        }
        
        // System Info - from overlay
        const systemInfoGrid = document.querySelector('.system-info-grid');
        if (systemInfoGrid && about.systemInfo) {
            systemInfoGrid.innerHTML = about.systemInfo.map(info => `
                <div class="info-block">
                    <div class="info-label">${info.label}</div>
                    <div class="info-value">${info.value}</div>
                </div>
            `).join('');
        }
        
        // Interests - from overlay
        const interestsContent = document.querySelector('.interests-content');
        if (interestsContent && about.interests) {
            interestsContent.innerHTML = about.interests.map(interest => `
                <div class="interest-item">
                    <span class="interest-icon">${interest.icon}</span>
                    <div class="interest-text">
                        <strong>${interest.title}</strong>
                        <span>${interest.description}</span>
                    </div>
                </div>
            `).join('');
        }
        
        // Quote - from overlay
        const quoteText = document.querySelector('.quote-text');
        const quoteAuthor = document.querySelector('.quote-author');
        if (quoteText && about.quote) {
            quoteText.textContent = `"${about.quote.text}"`;
        }
        if (quoteAuthor && about.quote) {
            quoteAuthor.textContent = `— ${about.quote.author}`;
        }
    },

    /**
     * Format date from JSON Resume format (YYYY-MM) to display format
     */
    formatDateRange(startDate, endDate) {
        const formatDate = (dateStr) => {
            if (!dateStr) return 'Present';
            const [year, month] = dateStr.split('-');
            if (!month) return year;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[parseInt(month) - 1]} ${year}`;
        };
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    },

    /**
     * Render experience section
     */
    renderExperience() {
        const { work, education } = this.resume;
        
        const experienceTree = document.querySelector('.experience-tree');
        if (experienceTree) {
            // Render work experience
            const workItems = work.map(exp => `
                <article class="tree-node">
                    <div class="node-date">${this.formatDateRange(exp.startDate, exp.endDate)}</div>
                    <h3 class="node-title">${exp.position}</h3>
                    <div class="node-company">${exp.name}</div>
                    <ul class="node-highlights">
                        ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
                    </ul>
                    <div class="tool-tags">
                        ${(exp.keywords || []).map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
                    </div>
                </article>
            `).join('');

            // Render education
            const educationItems = education.map(edu => `
                <article class="tree-node">
                    <div class="node-date">${this.formatDateRange(edu.startDate, edu.endDate)}</div>
                    <h3 class="node-title">${edu.studyType} ${edu.area}</h3>
                    <div class="node-company">${edu.institution}</div>
                    <ul class="node-highlights">
                        ${(edu.highlights || []).map(h => `<li>${h}</li>`).join('')}
                    </ul>
                    <div class="tool-tags">
                        ${(edu.keywords || []).map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
                    </div>
                </article>
            `).join('');

            experienceTree.innerHTML = workItems + educationItems;
        }
    },

    /**
     * Render services section
     */
    renderServices() {
        const services = this.resume.ui?.services;
        if (!services) return;
        
        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid) {
            servicesGrid.innerHTML = services.map(service => `
                <article class="service-card">
                    <div class="service-header">
                        <div class="service-icon"><i class="${service.icon}" aria-hidden="true"></i></div>
                        <h3>${service.title}</h3>
                    </div>
                    <p>${service.description}</p>
                    <div class="service-stat">// ${service.projectCount} projects</div>
                </article>
            `).join('');
        }
    },

    /**
     * Generate level dots for skills
     */
    generateLevelDots(level) {
        let dots = '';
        for (let i = 1; i <= 5; i++) {
            dots += `<span class="level-dot${i <= level ? ' filled' : ''}"></span>`;
        }
        return dots;
    },

    /**
     * Render skills section
     */
    renderSkills() {
        const skills = this.resume.ui?.skills;
        if (!skills) return;
        
        const skillsTree = document.querySelector('.skills-tree');
        if (skillsTree) {
            const categories = skills.categories;
            const lastIndex = categories.length - 1;
            
            skillsTree.innerHTML = `
                <div class="tree-root">~/skills</div>
                ${categories.map((category, index) => `
                    <div class="tree-category">
                        <div class="tree-category-header">
                            <span class="tree-branch">${index === lastIndex ? '└──' : '├──'}</span>
                            <div class="tree-folder">
                                <span class="tree-folder-icon">📂</span>
                                <span class="tree-folder-name">${category.displayName}</span>
                                <span class="tree-folder-count">(${category.count})</span>
                            </div>
                        </div>
                        <div class="tree-items">
                            ${category.items.map(skill => `
                                <div class="tree-item">
                                    <div class="tree-item-content">
                                        <img class="tree-item-icon" src="${skill.icon}" alt="${skill.name}">
                                        <span class="tree-item-name">${skill.name}</span>
                                        <div class="tree-item-level" title="${skill.levelName}">${this.generateLevelDots(skill.level)}</div>
                                    </div>
                                    <div class="tree-item-tooltip">
                                        <span class="tooltip-trigger">info</span>
                                        <div class="tooltip-content">
                                            <div class="tooltip-title">
                                                <img src="${skill.icon}" alt="">${skill.name}
                                            </div>
                                            <div class="tooltip-desc">${skill.description}</div>
                                            <div class="tooltip-meta">
                                                <span>${skill.years} years</span> · ${skill.levelName}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            `;
        }
        
        // Skills summary
        const skillsSummary = document.querySelector('.skills-summary');
        if (skillsSummary && skills.summary) {
            const { summary } = skills;
            skillsSummary.innerHTML = `
                <span>Total: <code>${summary.totalTechnologies} technologies</code></span>
                <span>Categories: <code>${summary.categories} domains</code></span>
                <span>Learning: <code>${summary.learning.join(', ')}</code></span>
            `;
        }
    },

    /**
     * Render portfolio section
     */
    renderPortfolio() {
        const { projects } = this.resume;
        
        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = projects.map(project => {
                if (project.type === 'infrastructure') {
                    return `
                        <a href="${project.url}" class="portfolio-card" target="_blank" rel="noopener noreferrer">
                            <div class="portfolio-gradient ${project.gradient || 'gradient-k8s'}">
                                <i class="${project.icon || 'las la-server'} gradient-icon" aria-hidden="true"></i>
                            </div>
                            <div class="portfolio-info">
                                <h3>${project.name}</h3>
                                <p>${project.description}</p>
                                <div class="portfolio-tags">
                                    ${project.highlights.map(tag => `<span class="portfolio-tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                        </a>
                    `;
                } else {
                    return `
                        <a href="${project.url}" class="portfolio-card" target="_blank" rel="noopener noreferrer">
                            <img src="${project.image || './assets/images/me.webp'}" alt="${project.name} screenshot" class="portfolio-image" loading="lazy">
                            <div class="portfolio-info">
                                <h3>${project.name}</h3>
                                <p>${project.description}</p>
                                <div class="portfolio-tags">
                                    ${project.highlights.map(tag => `<span class="portfolio-tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                        </a>
                    `;
                }
            }).join('');
        }
    },

    /**
     * Get icon class for social network
     */
    getSocialIcon(network) {
        const socialIcons = this.resume.ui?.contact?.socialIcons || {};
        return socialIcons[network] || 'las la-link';
    },

    /**
     * Render contact section
     */
    renderContact() {
        const { basics, ui } = this.resume;
        const contact = ui?.contact || {};
        
        // Header
        const contactHeader = document.querySelector('.contact-header h2');
        if (contactHeader && contact.heading) {
            contactHeader.textContent = contact.heading;
        }
        
        const contactSubheader = document.querySelector('.contact-header p');
        if (contactSubheader && contact.subheading) {
            contactSubheader.textContent = contact.subheading;
        }
        
        // Form action
        const contactForm = document.querySelector('.contact-form');
        if (contactForm && contact.formAction) {
            contactForm.action = contact.formAction;
        }
        
        // Social links - from JSON Resume basics.profiles
        const socialLinks = document.querySelector('.social-links');
        if (socialLinks) {
            const profileLinks = basics.profiles.map(profile => `
                <a href="${profile.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${profile.network}">
                    <i class="${this.getSocialIcon(profile.network)}" aria-hidden="true"></i>
                </a>
            `).join('');
            
            // Add email link
            const emailLink = `
                <a href="mailto:${basics.email}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Email">
                    <i class="${this.getSocialIcon('email')}" aria-hidden="true"></i>
                </a>
            `;
            
            socialLinks.innerHTML = profileLinks + emailLink;
        }
    },

    /**
     * Render footer
     */
    renderFooter() {
        const { basics, ui } = this.resume;
        const footer = ui?.footer || {};
        
        // Location - from JSON Resume basics.location
        const footerLocation = document.querySelector('.footer-location');
        if (footerLocation) {
            const location = `${basics.location.city}, ${basics.location.region}`;
            footerLocation.innerHTML = `<i class="las la-map-marker" aria-hidden="true"></i>${location}`;
        }
        
        // Copyright - from overlay
        const footerCopyright = document.querySelector('.terminal-footer > p:nth-child(2)');
        if (footerCopyright && footer.copyright) {
            footerCopyright.textContent = `© ${footer.copyright}`;
        }
    },

    /**
     * Render commands for help modal
     */
    renderCommands() {
        const commands = this.resume.ui?.commands;
        if (!commands) return;
        
        const helpCommands = document.querySelector('.help-commands:not(.theme-list)');
        if (helpCommands) {
            helpCommands.innerHTML = commands.map(cmd => `
                <li>
                    <span class="cmd-name">${cmd.name}</span>
                    <span class="cmd-desc">${cmd.description}</span>
                </li>
            `).join('');
        }
    },

    /**
     * Render themes for theme modal
     */
    renderThemes() {
        const themes = this.resume.ui?.themes;
        if (!themes) return;
        
        const themeList = document.querySelector('.theme-list');
        if (themeList) {
            themeList.innerHTML = themes.map(theme => `
                <li>
                    <span class="cmd-name">${theme.id}</span>
                    <span class="cmd-desc">${theme.description}</span>
                </li>
            `).join('');
        }
        
        // Theme dropdown
        const themeDropdown = document.querySelector('.theme-dropdown');
        if (themeDropdown) {
            themeDropdown.innerHTML = themes.map(theme => `
                <button data-theme="${theme.id}">${theme.name}</button>
            `).join('');
        }
    }
};

// Export for use in other modules
window.ContentRenderer = ContentRenderer;
