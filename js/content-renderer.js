/**
 * Content Renderer Module
 * Loads content from JSON Resume format and renders it to the DOM
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
     * Load content from JSON Resume file
     */
    async loadContent() {
        const response = await fetch('./resume.json');
        if (!response.ok) {
            throw new Error(`Failed to load resume: ${response.status}`);
        }
        this.resume = await response.json();
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
        const { custom } = this.resume;
        document.title = custom.meta.title;
    },

    /**
     * Render hero section
     */
    renderHero() {
        const { basics, custom } = this.resume;
        const { hero } = custom;
        
        // ASCII Logo
        const asciiLogo = document.querySelector('.ascii-logo');
        if (asciiLogo) {
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
        
        // Tagline - from custom
        const heroTagline = document.querySelector('.hero-tagline');
        if (heroTagline) {
            heroTagline.textContent = hero.tagline;
        }
        
        // Stats - from custom
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
        const { basics, custom } = this.resume;
        const { about } = custom;
        
        // Profile image - from JSON Resume basics
        const profileImage = document.querySelector('.profile-image');
        if (profileImage) {
            profileImage.src = basics.image;
            profileImage.alt = basics.name;
        }
        
        // Headline - from custom
        const aboutHeadline = document.querySelector('.about-text h2');
        if (aboutHeadline) {
            aboutHeadline.textContent = about.headline;
        }
        
        // Bio - from JSON Resume basics.summary
        const aboutBio = document.querySelector('.about-text p');
        if (aboutBio) {
            aboutBio.textContent = basics.summary;
        }
        
        // System Info - from custom
        const systemInfoGrid = document.querySelector('.system-info-grid');
        if (systemInfoGrid) {
            systemInfoGrid.innerHTML = about.systemInfo.map(info => `
                <div class="info-block">
                    <div class="info-label">${info.label}</div>
                    <div class="info-value">${info.value}</div>
                </div>
            `).join('');
        }
        
        // Interests - from custom
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
        
        // Quote - from custom
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
                        ${(edu.courses || []).map(c => `<li>${c}</li>`).join('')}
                    </ul>
                    <div class="tool-tags">
                        ${['blockchain', 'smart-contract', 'ieee'].map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
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
        const { services } = this.resume.custom;
        
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
        const { skills } = this.resume.custom;
        
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
        const { projects, custom } = this.resume;
        const { portfolio } = custom;
        
        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = projects.map(project => {
                if (project.type === 'infrastructure') {
                    const visual = portfolio.gradients[project.name] || { gradient: 'gradient-k8s', icon: 'las la-server' };
                    return `
                        <a href="${project.url}" class="portfolio-card" target="_blank" rel="noopener noreferrer">
                            <div class="portfolio-gradient ${visual.gradient}">
                                <i class="${visual.icon} gradient-icon" aria-hidden="true"></i>
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
                    const image = portfolio.images[project.name] || './assets/images/me.webp';
                    return `
                        <a href="${project.url}" class="portfolio-card" target="_blank" rel="noopener noreferrer">
                            <img src="${image}" alt="${project.name} screenshot" class="portfolio-image" loading="lazy">
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
        const { socialIcons } = this.resume.custom.contact;
        return socialIcons[network] || 'las la-link';
    },

    /**
     * Render contact section
     */
    renderContact() {
        const { basics, custom } = this.resume;
        const { contact } = custom;
        
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
        const { basics, custom } = this.resume;
        const { footer } = custom;
        
        // Location - from JSON Resume basics.location
        const footerLocation = document.querySelector('.footer-location');
        if (footerLocation) {
            const location = `${basics.location.city}, ${basics.location.region}`;
            footerLocation.innerHTML = `<i class="las la-map-marker" aria-hidden="true"></i>${location}`;
        }
        
        // Copyright - from custom
        const footerCopyright = document.querySelector('.terminal-footer > p:nth-child(2)');
        if (footerCopyright) {
            footerCopyright.textContent = `© ${footer.copyright}`;
        }
    },

    /**
     * Render commands for help modal
     */
    renderCommands() {
        const { commands } = this.resume.custom;
        
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
        const { themes } = this.resume.custom;
        
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
