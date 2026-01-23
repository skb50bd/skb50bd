/**
 * Content Renderer Module
 * Loads content from JSON and renders it to the DOM
 */

const ContentRenderer = {
    content: null,

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
     * Load content from JSON file
     */
    async loadContent() {
        const response = await fetch('./data/content.json');
        if (!response.ok) {
            throw new Error(`Failed to load content: ${response.status}`);
        }
        this.content = await response.json();
    },

    /**
     * Render all content sections
     */
    renderAll() {
        if (!this.content) return;
        
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
        const { meta } = this.content;
        document.title = meta.title;
    },

    /**
     * Render hero section
     */
    renderHero() {
        const { hero } = this.content;
        
        // ASCII Logo
        const asciiLogo = document.querySelector('.ascii-logo');
        if (asciiLogo) {
            asciiLogo.textContent = hero.asciiLogo;
        }
        
        // Name
        const heroName = document.querySelector('.hero-name');
        if (heroName) {
            heroName.textContent = hero.name;
        }
        
        // Title
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.textContent = hero.title;
        }
        
        // Tagline
        const heroTagline = document.querySelector('.hero-tagline');
        if (heroTagline) {
            heroTagline.textContent = hero.tagline;
        }
        
        // Stats
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
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
        const { about } = this.content;
        
        // Profile image
        const profileImage = document.querySelector('.profile-image');
        if (profileImage) {
            profileImage.src = about.profileImage;
            profileImage.alt = this.content.hero.name;
        }
        
        // Headline
        const aboutHeadline = document.querySelector('.about-text h2');
        if (aboutHeadline) {
            aboutHeadline.textContent = about.headline;
        }
        
        // Bio
        const aboutBio = document.querySelector('.about-text p');
        if (aboutBio) {
            aboutBio.textContent = about.bio;
        }
        
        // System Info
        const systemInfoGrid = document.querySelector('.system-info-grid');
        if (systemInfoGrid) {
            systemInfoGrid.innerHTML = about.systemInfo.map(info => `
                <div class="info-block">
                    <div class="info-label">${info.label}</div>
                    <div class="info-value">${info.value}</div>
                </div>
            `).join('');
        }
        
        // Interests
        const interestsContent = document.querySelector('.interests-content');
        if (interestsContent) {
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
        
        // Quote
        const quoteText = document.querySelector('.quote-text');
        const quoteAuthor = document.querySelector('.quote-author');
        if (quoteText) {
            quoteText.textContent = `"${about.quote.text}"`;
        }
        if (quoteAuthor) {
            quoteAuthor.textContent = `— ${about.quote.author}`;
        }
    },

    /**
     * Render experience section
     */
    renderExperience() {
        const { experience } = this.content;
        
        const experienceTree = document.querySelector('.experience-tree');
        if (experienceTree) {
            experienceTree.innerHTML = experience.map(exp => `
                <article class="tree-node">
                    <div class="node-date">${exp.date}</div>
                    <h3 class="node-title">${exp.title}</h3>
                    <div class="node-company">${exp.company}</div>
                    <ul class="node-highlights">
                        ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
                    </ul>
                    <div class="tool-tags">
                        ${exp.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
                    </div>
                </article>
            `).join('');
        }
    },

    /**
     * Render services section
     */
    renderServices() {
        const { services } = this.content;
        
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
        const { skills } = this.content;
        
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
        if (skillsSummary) {
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
        const { portfolio } = this.content;
        
        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = portfolio.map(project => {
                if (project.type === 'infrastructure') {
                    return `
                        <a href="${project.url}" class="portfolio-card" target="_blank" rel="noopener noreferrer">
                            <div class="portfolio-gradient ${project.gradient}">
                                <i class="${project.icon} gradient-icon" aria-hidden="true"></i>
                            </div>
                            <div class="portfolio-info">
                                <h3>${project.title}</h3>
                                <p>${project.description}</p>
                                <div class="portfolio-tags">
                                    ${project.tags.map(tag => `<span class="portfolio-tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                        </a>
                    `;
                } else {
                    return `
                        <a href="${project.url}" class="portfolio-card" target="_blank" rel="noopener noreferrer">
                            <img src="${project.image}" alt="${project.title} screenshot" class="portfolio-image" loading="lazy">
                            <div class="portfolio-info">
                                <h3>${project.title}</h3>
                                <p>${project.description}</p>
                                <div class="portfolio-tags">
                                    ${project.tags.map(tag => `<span class="portfolio-tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                        </a>
                    `;
                }
            }).join('');
        }
    },

    /**
     * Render contact section
     */
    renderContact() {
        const { contact } = this.content;
        
        // Header
        const contactHeader = document.querySelector('.contact-header h2');
        if (contactHeader) {
            contactHeader.textContent = contact.heading;
        }
        
        const contactSubheader = document.querySelector('.contact-header p');
        if (contactSubheader) {
            contactSubheader.textContent = contact.subheading;
        }
        
        // Form action
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.action = contact.formAction;
        }
        
        // Social links
        const socialLinks = document.querySelector('.social-links');
        if (socialLinks) {
            socialLinks.innerHTML = contact.socialLinks.map(link => `
                <a href="${link.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${link.platform}">
                    <i class="${link.icon}" aria-hidden="true"></i>
                </a>
            `).join('');
        }
    },

    /**
     * Render footer
     */
    renderFooter() {
        const { footer } = this.content;
        
        const footerLocation = document.querySelector('.footer-location');
        if (footerLocation) {
            footerLocation.innerHTML = `<i class="las la-map-marker" aria-hidden="true"></i>${footer.location}`;
        }
        
        const footerCopyright = document.querySelector('.terminal-footer > p:nth-child(2)');
        if (footerCopyright) {
            footerCopyright.textContent = `© ${footer.copyright}`;
        }
    },

    /**
     * Render commands for help modal
     */
    renderCommands() {
        const { commands } = this.content;
        
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
        const { themes } = this.content;
        
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
