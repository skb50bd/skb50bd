#!/usr/bin/env node
/**
 * Build Script for Portfolio
 *
 * This script generates a pre-rendered version of the site for SEO optimization.
 * It reads content.json and injects it directly into the HTML as a fallback
 * for crawlers that don't execute JavaScript.
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
    contentFile: './data/content.json',
    templateFile: './index.html',
    sitemapFile: './sitemap.xml',
    outputDir: process.argv.includes('--output')
        ? process.argv[process.argv.indexOf('--output') + 1]
        : './dist',
    updateSitemap: process.argv.includes('--update-sitemap')
};

/**
 * Load JSON content
 */
function loadContent() {
    const contentPath = path.resolve(CONFIG.contentFile);
    return JSON.parse(fs.readFileSync(contentPath, 'utf8'));
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
function generateHeroHTML(content) {
    const { hero } = content;
    return `
        <pre class="ascii-logo" aria-hidden="true">${hero.asciiLogo}</pre>
        <h1 class="hero-name">${hero.name}</h1>
        <p class="hero-title">${hero.title}</p>
        <p class="hero-tagline">${hero.tagline}</p>
        <div class="hero-stats">
            ${hero.stats.map(stat => `
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
function generateAboutHTML(content) {
    const { about, hero } = content;
    return {
        profileImage: about.profileImage,
        headline: about.headline,
        bio: about.bio,
        systemInfo: about.systemInfo.map(info => `
            <div class="info-block">
                <div class="info-label">${info.label}</div>
                <div class="info-value">${info.value}</div>
            </div>
        `).join(''),
        interests: about.interests.map(interest => `
            <div class="interest-item">
                <span class="interest-icon">${interest.icon}</span>
                <div class="interest-text">
                    <strong>${interest.title}</strong>
                    <span>${interest.description}</span>
                </div>
            </div>
        `).join(''),
        quote: `"${about.quote.text}"`,
        quoteAuthor: `— ${about.quote.author}`
    };
}

/**
 * Generate experience section HTML
 */
function generateExperienceHTML(content) {
    const { experience } = content;
    return experience.map(exp => `
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

/**
 * Generate services section HTML
 */
function generateServicesHTML(content) {
    const { services } = content;
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
function generateSkillsHTML(content) {
    const { skills } = content;
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
function generatePortfolioHTML(content) {
    const { portfolio } = content;
    return portfolio.map(project => {
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

/**
 * Generate contact section HTML
 */
function generateContactHTML(content) {
    const { contact } = content;
    return {
        heading: contact.heading,
        subheading: contact.subheading,
        formAction: contact.formAction,
        socialLinks: contact.socialLinks.map(link => `
            <a href="${link.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${link.platform}">
                <i class="${link.icon}" aria-hidden="true"></i>
            </a>
        `).join('')
    };
}

/**
 * Generate commands HTML
 */
function generateCommandsHTML(content) {
    const { commands } = content;
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
function generateThemesHTML(content) {
    const { themes } = content;
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
function buildHTML(content) {
    let html = fs.readFileSync(CONFIG.templateFile, 'utf8');

    // Generate all content
    const heroHTML = generateHeroHTML(content);
    const aboutData = generateAboutHTML(content);
    const experienceHTML = generateExperienceHTML(content);
    const servicesHTML = generateServicesHTML(content);
    const skillsData = generateSkillsHTML(content);
    const portfolioHTML = generatePortfolioHTML(content);
    const contactData = generateContactHTML(content);
    const commandsHTML = generateCommandsHTML(content);
    const themesData = generateThemesHTML(content);

    // Replace hero section
    html = html.replace(
        /<div class="output-panel hero-output">[\s\S]*?<\/div>\s*<\/section>/m,
        `<div class="output-panel hero-output">${heroHTML}</div></section>`
    );

    // Replace about profile image
    html = html.replace(
        /<img class="profile-image" src="" alt="">/,
        `<img class="profile-image" src="${aboutData.profileImage}" alt="${content.hero.name}">`
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
        `<p class="footer-location"><i class="las la-map-marker" aria-hidden="true"></i>${content.footer.location}</p>`
    );
    html = html.replace(
        /<footer class="terminal-footer">\s*<p class="footer-location">[^<]*<\/p>\s*<p><\/p>/m,
        `<footer class="terminal-footer"><p class="footer-location"><i class="las la-map-marker" aria-hidden="true"></i>${content.footer.location}</p><p>© ${content.footer.copyright}</p>`
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
    console.log('📄 Loading content.json...');
    const content = loadContent();

    // Build HTML
    console.log('🏗️  Generating pre-rendered HTML...');
    const html = buildHTML(content);

    // Create output directory
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Write pre-rendered HTML
    const outputPath = path.join(CONFIG.outputDir, 'index.html');
    fs.writeFileSync(outputPath, html);
    console.log(`✓ Wrote pre-rendered HTML to ${outputPath}`);

    // Copy assets
    const assetDirs = ['css', 'js', 'assets', 'data'];
    assetDirs.forEach(dir => {
        const src = path.resolve(dir);
        const dest = path.join(CONFIG.outputDir, dir);
        if (fs.existsSync(src)) {
            copyRecursive(src, dest);
            console.log(`✓ Copied ${dir}/`);
        }
    });

    // Copy root files
    const rootFiles = ['robots.txt', 'sitemap.xml', 'favicon.ico'];
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
