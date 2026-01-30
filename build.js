#!/usr/bin/env node
/**
 * Build Script for Portfolio
 *
 * This script generates a pre-rendered version of the site for SEO optimization.
 * It reads resume.json + resume.overlay.json and injects content directly into
 * the HTML as a fallback for crawlers that don't execute JavaScript.
 *
 * Usage: node build.js
 *
 * Options:
 *   --update-sitemap   Update sitemap.xml with current date
 *   --output <dir>     Output directory (default: ./dist)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    resumeFile: './resume.json',
    overlayFile: './resume.overlay.json',
    templateFile: './index.html',
    sitemapFile: './sitemap.xml',
    outputDir: process.argv.includes('--output')
        ? process.argv[process.argv.indexOf('--output') + 1]
        : './dist',
    updateSitemap: process.argv.includes('--update-sitemap')
};

/**
 * Deep merge two objects, with source overriding target
 * Arrays are merged by index (source[i] extends target[i])
 */
function deepMerge(target, source) {
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
                        return deepMerge(item, source[key][index]);
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
            result[key] = deepMerge(target[key], source[key]);
        } else {
            // Override with source value
            result[key] = source[key];
        }
    }

    return result;
}

/**
 * Load and merge JSON Resume + overlay
 */
function loadContent() {
    // Load base resume
    const resumePath = path.resolve(CONFIG.resumeFile);
    const baseResume = JSON.parse(fs.readFileSync(resumePath, 'utf8'));

    // Load overlay (optional)
    let overlay = {};
    const overlayPath = path.resolve(CONFIG.overlayFile);
    if (fs.existsSync(overlayPath)) {
        overlay = JSON.parse(fs.readFileSync(overlayPath, 'utf8'));
    }

    // Merge and return
    return deepMerge(baseResume, overlay);
}

/**
 * Format date from JSON Resume format (YYYY-MM) to display format
 */
function formatDateRange(startDate, endDate) {
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Present';
        const [year, month] = dateStr.split('-');
        if (!month) return year;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month) - 1]} ${year}`;
    };
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Generate level dots HTML for skills
 */
function generateLevelDots(level) {
    let dots = '';
    for (let i = 1; i <= 5; i++) {
        dots += `<span class="level-dot${i <= level ? ' filled' : ''}"></span>`;
    }
    return dots;
}

/**
 * Generate hero section HTML
 */
function generateHeroHTML(resume) {
    const { basics, ui } = resume;
    const hero = ui?.hero || {};

    return `
        <pre class="ascii-logo" aria-hidden="true">${hero.asciiLogo || ''}</pre>
        <h1 class="hero-name">${basics.name}</h1>
        <p class="hero-title">${basics.label}</p>
        <p class="hero-tagline">${hero.tagline || ''}</p>
        <div class="hero-stats">
            ${(hero.stats || []).map(stat => `
                <div class="stat-item">
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('')}
        </div>
        <div class="scroll-hint">
            <span>Scroll to explore</span>
            <div class="scroll-arrow"></div>
        </div>
    `;
}

/**
 * Generate about section HTML
 */
function generateAboutHTML(resume) {
    const { basics, ui } = resume;
    const about = ui?.about || {};

    return {
        profileImage: basics.image,
        name: basics.name,
        headline: about.headline || '',
        bio: basics.summary,
        systemInfo: (about.systemInfo || []).map(info => `
            <div class="info-block">
                <div class="info-label">${info.label}</div>
                <div class="info-value">${info.value}</div>
            </div>
        `).join(''),
        interests: (about.interests || []).map(interest => `
            <div class="interest-item">
                <span class="interest-icon">${interest.icon}</span>
                <div class="interest-text">
                    <strong>${interest.title}</strong>
                    <span>${interest.description}</span>
                </div>
            </div>
        `).join(''),
        quote: about.quote ? `"${about.quote.text}"` : '',
        quoteAuthor: about.quote ? `— ${about.quote.author}` : ''
    };
}

/**
 * Generate experience section HTML
 */
function generateExperienceHTML(resume) {
    const { work, education } = resume;

    // Work experience
    const workItems = work.map(exp => `
        <article class="tree-node">
            <div class="node-date">${formatDateRange(exp.startDate, exp.endDate)}</div>
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

    // Education
    const educationItems = education.map(edu => `
        <article class="tree-node">
            <div class="node-date">${formatDateRange(edu.startDate, edu.endDate)}</div>
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

    return workItems + educationItems;
}

/**
 * Generate services section HTML
 */
function generateServicesHTML(resume) {
    const services = resume.ui?.services || [];
    return services.map(service => `
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

/**
 * Generate skills section HTML
 */
function generateSkillsHTML(resume) {
    const skills = resume.ui?.skills;
    if (!skills) return { skillsTree: '', summary: '' };

    const categories = skills.categories;
    const lastIndex = categories.length - 1;

    const skillsTree = `
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
                                <div class="tree-item-level" title="${skill.levelName}">${generateLevelDots(skill.level)}</div>
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

    const summary = `
        <span>Total: <code>${skills.summary.totalTechnologies} technologies</code></span>
        <span>Categories: <code>${skills.summary.categories} domains</code></span>
        <span>Learning: <code>${skills.summary.learning.join(', ')}</code></span>
    `;

    return { skillsTree, summary };
}

/**
 * Generate portfolio section HTML
 */
function generatePortfolioHTML(resume) {
    const { projects } = resume;
    return projects.map(project => {
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

/**
 * Get icon class for social network
 */
function getSocialIcon(network, resume) {
    const socialIcons = resume.ui?.contact?.socialIcons || {};
    return socialIcons[network] || 'las la-link';
}

/**
 * Generate contact section HTML
 */
function generateContactHTML(resume) {
    const { basics, ui } = resume;
    const contact = ui?.contact || {};

    // Social links from JSON Resume basics.profiles
    const socialLinks = basics.profiles.map(profile => `
        <a href="${profile.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${profile.network}">
            <i class="${getSocialIcon(profile.network, resume)}" aria-hidden="true"></i>
        </a>
    `).join('');

    // Add email link
    const emailLink = `
        <a href="mailto:${basics.email}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Email">
            <i class="${getSocialIcon('email', resume)}" aria-hidden="true"></i>
        </a>
    `;

    return {
        heading: contact.heading || '',
        subheading: contact.subheading || '',
        formAction: contact.formAction || '',
        socialLinks: socialLinks + emailLink
    };
}

/**
 * Generate commands HTML
 */
function generateCommandsHTML(resume) {
    const commands = resume.ui?.commands || [];
    return commands.map(cmd => `
        <li>
            <span class="cmd-name">${cmd.name}</span>
            <span class="cmd-desc">${cmd.description}</span>
        </li>
    `).join('');
}

/**
 * Generate themes HTML
 */
function generateThemesHTML(resume) {
    const themes = resume.ui?.themes || [];
    return {
        themeList: themes.map(theme => `
            <li>
                <span class="cmd-name">${theme.id}</span>
                <span class="cmd-desc">${theme.description}</span>
            </li>
        `).join(''),
        themeDropdown: themes.map(theme => `
            <button data-theme="${theme.id}">${theme.name}</button>
        `).join('')
    };
}

/**
 * Build the pre-rendered HTML
 */
function buildHTML(resume) {
    let html = fs.readFileSync(CONFIG.templateFile, 'utf8');

    // Generate all content
    const heroHTML = generateHeroHTML(resume);
    const aboutData = generateAboutHTML(resume);
    const experienceHTML = generateExperienceHTML(resume);
    const servicesHTML = generateServicesHTML(resume);
    const skillsData = generateSkillsHTML(resume);
    const portfolioHTML = generatePortfolioHTML(resume);
    const contactData = generateContactHTML(resume);
    const commandsHTML = generateCommandsHTML(resume);
    const themesData = generateThemesHTML(resume);

    // Footer data
    const { basics, ui } = resume;
    const footer = ui?.footer || {};
    const location = `${basics.location.city}, ${basics.location.region}`;

    // Replace hero section
    html = html.replace(
        /<div class="output-panel hero-output">[\s\S]*?<\/div>\s*<\/section>/m,
        `<div class="output-panel hero-output">${heroHTML}</div></section>`
    );

    // Replace about profile image
    html = html.replace(
        /<img class="profile-image" src="" alt="">/,
        `<img class="profile-image" src="${aboutData.profileImage}" alt="${aboutData.name}">`
    );

    // Replace about headline
    html = html.replace(
        /<div class="about-text">\s*<h2><\/h2>/,
        `<div class="about-text"><h2>${aboutData.headline}</h2>`
    );

    // Replace about bio
    html = html.replace(
        /<h2>[^<]*<\/h2>\s*<p><\/p>/,
        `<h2>${aboutData.headline}</h2><p>${aboutData.bio}</p>`
    );

    // Replace system info grid
    html = html.replace(
        /<div class="system-info-grid">\s*<!-- Populated by content-renderer\.js -->\s*<\/div>/,
        `<div class="system-info-grid">${aboutData.systemInfo}</div>`
    );

    // Replace interests content
    html = html.replace(
        /<div class="interests-content">\s*<!-- Populated by content-renderer\.js -->\s*<\/div>/,
        `<div class="interests-content">${aboutData.interests}</div>`
    );

    // Replace quote
    html = html.replace(
        /<p class="quote-text"><\/p>/,
        `<p class="quote-text">${aboutData.quote}</p>`
    );
    html = html.replace(
        /<cite class="quote-author"><\/cite>/,
        `<cite class="quote-author">${aboutData.quoteAuthor}</cite>`
    );

    // Replace experience tree
    html = html.replace(
        /<div class="experience-tree">\s*<!-- Populated by content-renderer\.js -->\s*<\/div>/,
        `<div class="experience-tree">${experienceHTML}</div>`
    );

    // Replace services grid
    html = html.replace(
        /<div class="services-grid">\s*<!-- Populated by content-renderer\.js -->\s*<\/div>/,
        `<div class="services-grid">${servicesHTML}</div>`
    );

    // Replace skills tree
    html = html.replace(
        /<div class="skills-tree">\s*<!-- Populated by content-renderer\.js -->\s*<\/div>/,
        `<div class="skills-tree">${skillsData.skillsTree}</div>`
    );

    // Replace skills summary
    html = html.replace(
        /<div class="skills-summary">\s*<!-- Populated by content-renderer\.js -->\s*<\/div>/,
        `<div class="skills-summary">${skillsData.summary}</div>`
    );

    // Replace portfolio grid
    html = html.replace(
        /<div class="portfolio-grid">\s*<!-- Populated by content-renderer\.js -->\s*<\/div>/,
        `<div class="portfolio-grid">${portfolioHTML}</div>`
    );

    // Replace contact header
    html = html.replace(
        /<div class="contact-header">\s*<h2><\/h2>\s*<p><\/p>\s*<\/div>/,
        `<div class="contact-header"><h2>${contactData.heading}</h2><p>${contactData.subheading}</p></div>`
    );

    // Replace form action
    html = html.replace(
        /<form class="contact-form" action="" method="POST">/,
        `<form class="contact-form" action="${contactData.formAction}" method="POST">`
    );

    // Replace social links
    html = html.replace(
        /<div class="social-links">\s*<!-- Populated by content-renderer\.js -->\s*<\/div>/,
        `<div class="social-links">${contactData.socialLinks}</div>`
    );

    // Replace footer
    html = html.replace(
        /<p class="footer-location">\s*<i class="las la-map-marker" aria-hidden="true"><\/i>\s*<\/p>/,
        `<p class="footer-location"><i class="las la-map-marker" aria-hidden="true"></i>${location}</p>`
    );
    html = html.replace(
        /<footer class="terminal-footer">\s*<p class="footer-location">[^<]*<\/p>\s*<p><\/p>/m,
        `<footer class="terminal-footer"><p class="footer-location"><i class="las la-map-marker" aria-hidden="true"></i>${location}</p><p>© ${footer.copyright || ''}</p>`
    );

    // Replace help commands
    html = html.replace(
        /<ul class="help-commands">\s*<!-- Populated by content-renderer\.js -->\s*<\/ul>/,
        `<ul class="help-commands">${commandsHTML}</ul>`
    );

    // Replace theme list
    html = html.replace(
        /<ul class="help-commands theme-list">\s*<!-- Populated by content-renderer\.js -->\s*<\/ul>/,
        `<ul class="help-commands theme-list">${themesData.themeList}</ul>`
    );

    // Replace theme dropdown
    html = html.replace(
        /<div class="theme-dropdown">\s*<!-- Populated by content-renderer\.js -->\s*<\/div>/,
        `<div class="theme-dropdown">${themesData.themeDropdown}</div>`
    );

    return html;
}

/**
 * Update sitemap with current date
 */
function updateSitemap() {
    const today = new Date().toISOString().split('T')[0];
    let sitemap = fs.readFileSync(CONFIG.sitemapFile, 'utf8');
    sitemap = sitemap.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
    fs.writeFileSync(CONFIG.sitemapFile, sitemap);
    console.log(`✓ Updated sitemap.xml with date: ${today}`);
}

/**
 * Main build function
 */
function build() {
    console.log('🔨 Building pre-rendered portfolio...\n');

    // Load content
    console.log('📄 Loading resume.json + overlay...');
    const resume = loadContent();

    // Build HTML
    console.log('🏗️  Generating pre-rendered HTML...');
    const html = buildHTML(resume);

    // Create output directory
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Write pre-rendered HTML
    const outputPath = path.join(CONFIG.outputDir, 'index.html');
    fs.writeFileSync(outputPath, html);
    console.log(`✓ Wrote pre-rendered HTML to ${outputPath}`);

    // Copy assets
    const assetDirs = ['css', 'js', 'assets'];
    assetDirs.forEach(dir => {
        const src = path.resolve(dir);
        const dest = path.join(CONFIG.outputDir, dir);
        if (fs.existsSync(src)) {
            copyRecursive(src, dest);
            console.log(`✓ Copied ${dir}/`);
        }
    });

    // Copy root files
    const rootFiles = ['robots.txt', 'sitemap.xml', 'favicon.ico', 'resume.json', 'resume.overlay.json'];
    rootFiles.forEach(file => {
        const src = path.resolve(file);
        const dest = path.join(CONFIG.outputDir, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`✓ Copied ${file}`);
        }
    });

    // Update sitemap if requested
    if (CONFIG.updateSitemap) {
        updateSitemap();
    }

    console.log('\n✨ Build complete!');
    console.log(`   Output: ${path.resolve(CONFIG.outputDir)}`);
}

/**
 * Recursively copy directory
 */
function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Run build
build();
