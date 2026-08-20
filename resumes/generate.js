#!/usr/bin/env node
/**
 * Resume Markdown Generator
 *
 * Reads the portfolio's resume.json (single source of truth) and generates
 * two role-targeted Markdown resumes, kept strictly to one page.
 */

const fs = require('fs');
const path = require('path');

const RESUME_PATH = path.resolve(__dirname, '..', 'resume.json');
const OUTPUT_DIR = __dirname;

function formatDate(dateStr) {
    if (!dateStr) return 'Present';
    const [year, month] = dateStr.split('-');
    if (!month) return year;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function formatRange(start, end) {
    return `${formatDate(start)} – ${formatDate(end)}`;
}

function formatLocation(resume) {
    const loc = resume.basics.location || {};
    return [loc.city, loc.region].filter(Boolean).join(', ');
}

function formatProfiles(resume) {
    const profiles = resume.basics.profiles || [];
    const gh = profiles.find(p => p.network.toLowerCase() === 'github');
    return gh ? `https://github.com/${gh.username}` : '';
}

function renderWork(work, location, opts = {}) {
    const { limit, hideSummary } = opts;
    const items = limit ? work.slice(0, limit) : work;

    return items.map(job => {
        const lines = [];
        lines.push(`### ${job.name} — ${job.position}`);
        lines.push(`*${formatRange(job.startDate, job.endDate)} · ${job.location || location}*`);
        if (job.summary && !hideSummary) {
            lines.push(job.summary);
        }
        if (job.highlights && job.highlights.length) {
            lines.push('');
            job.highlights.forEach(h => lines.push(`- ${h}`));
        }
        return lines.join('\n');
    }).join('\n\n');
}

function renderProjects(projects) {
    return projects.map(p => {
        const stack = p.highlights ? ` · ${p.highlights.slice(0, 4).join(', ')}` : '';
        return `### ${p.name}\n*${p.url}${stack}*\n`;
    }).join('\n');
}

function renderEducation(education) {
    return education.map(edu => {
        return `**${edu.institution}** · ${edu.studyType} in ${edu.area} · ${formatRange(edu.startDate, edu.endDate)}`;
    }).join('\n');
}

function renderPublications(publications) {
    return publications.map((p, i) => {
        return `${i + 1}. **${p.name}** — ${p.publisher}, ${p.releaseDate}`;
    }).join('\n');
}

function generateSoftwareResume(resume) {
    const basics = resume.basics;
    const location = formatLocation(resume);
    const github = formatProfiles(resume);

    // Limit to the 3 most relevant software/platform roles to keep it on one page.
    const relevantWork = resume.work.slice(0, 3);

    return `---
title: Shakib Haris — Software Engineer
---

# ${basics.name}
**Software Engineer · Founder at Brotal** · ${location} · ${basics.email} · ${basics.url} · ${github}

## Summary
Founder of Brotal and senior software engineer with 8+ years building production products end-to-end. Strong in C#/.NET, F#, Python, TypeScript, PostgreSQL, and distributed system design, with deep experience in infrastructure, observability, CI/CD, and production operations.

## Skills
- **Languages:** C#, F#, Python, TypeScript, JavaScript, SQL
- **Backend:** .NET, ASP.NET Core, Entity Framework Core, REST APIs, gRPC, message queues
- **Databases:** PostgreSQL, SQL Server, Redis, Elasticsearch, query optimization, caching
- **Frontend:** React, Next.js, HTML/CSS, SEO, OAuth/OIDC
- **DevOps / Infrastructure:** Docker, Kubernetes, Rancher, GitHub Actions, Azure DevOps, Ansible, CI/CD, IaC
- **Observability:** Prometheus, Grafana, Elastic Stack, structured logging, distributed tracing
- **Security:** IAM (Zitadel, Active Directory), PKI, WireGuard/OpenVPN, SIEM workflows

## Experience

${renderWork(relevantWork, location)}

## Projects

${renderProjects(resume.projects.slice(0, 4))}

## Education

${renderEducation(resume.education)}

## Publications

${renderPublications(resume.publications)}

## Languages
Bangla — Native · English — Advanced
`;
}

function generateInfrastructureResume(resume) {
    const basics = resume.basics;
    const location = formatLocation(resume);
    const github = formatProfiles(resume);

    // Keep the current founder role, infrastructure role, and a concise note on prior software work.
    const currentRole = resume.work.find(j => !j.endDate);
    const infraRole = resume.work.find(j => j.position.toLowerCase().includes('infrastructure'));
    const otherRoles = resume.work.filter(j => j !== currentRole && j !== infraRole);

    const infrastructureKeywords = new Set([
        'Kubernetes', 'Linux', 'Network', 'Security', 'Elastic', 'Grafana', 'Prometheus',
        'CheckMK', 'MikroTik', 'WireGuard', 'BGP', 'OSPF', 'GPU', 'AI/ML', 'Docker',
        'PostgreSQL', 'ClickHouse', 'MCP', 'Apache AGE'
    ]);
    const filteredInfrastructureProjects = resume.projects.filter(p =>
        p.highlights.some(k => infrastructureKeywords.has(k))
    );
    const featuredProjects = resume.projects.slice(0, 4);
    const infraProjects = [
        ...featuredProjects,
        ...filteredInfrastructureProjects.filter(project => !featuredProjects.includes(project))
    ];

    const founderRole = currentRole
        ? `### ${currentRole.name} — ${currentRole.position}\n*${formatRange(currentRole.startDate, currentRole.endDate)} · ${currentRole.location || location}*\n\n- Build and deliver production systems across software, data, infrastructure, observability, and operations.`
        : '';

    // For space, collapse non-infra roles into a single earlier-career entry.
    const earlierRole = otherRoles.length
        ? `### Chaldal PLC — Software Engineer (2020–2022)\n*2020 – 2022 · ${location}*\n\n- Built last-mile delivery routing, inventory optimization, and 40+ customer-facing features in .NET/PostgreSQL.`
        : '';

    return `---
title: Shakib Haris — Infrastructure / DevOps / SRE Engineer
---

# ${basics.name}
**Infrastructure / DevOps / SRE Engineer · Founder at Brotal** · ${location} · ${basics.email} · ${basics.url} · ${github}

## Summary
Founder of Brotal and infrastructure engineer with 8+ years designing, building, and operating production platforms. Previously owned an on-prem Kubernetes platform end-to-end, from bare metal and networking to workloads, observability, and incident response. A software-engineering background enables durable automation, tooling, and IaC.

## Skills
- **Platforms:** Kubernetes, K3s, Rancher, Docker, bare-metal provisioning, private cloud, Hyper-V, QEMU
- **IaC / Automation:** Ansible, GitHub Actions, Azure DevOps, CI/CD, Terraform-style workflows
- **Networking:** TCP/IP, BGP, HAProxy, NGINX, MikroTik, Juniper, VPNs (WireGuard, OpenVPN), segmentation
- **Storage & Databases:** PostgreSQL, CNPG, SQL Server, Redis, SeaweedFS, MinIO
- **Observability:** Prometheus, Grafana, Elastic Stack, structured logging, alerting, SLOs
- **Security & Identity:** Active Directory, Zitadel, SSSD, PKI, Security Onion, SIEM workflows
- **Development Background:** C#, .NET, ASP.NET Core, Python, F#, SQL, API design

## Experience

${founderRole}
${founderRole ? '\n' : ''}${renderWork([infraRole], location)}
${earlierRole ? '\n' + earlierRole : ''}

## Projects

${renderProjects(infraProjects.slice(0, 5))}

## Education

${renderEducation(resume.education)}

## Publications

${renderPublications(resume.publications)}

## Languages
Bangla — Native · English — Advanced
`;
}

function main() {
    const resume = JSON.parse(fs.readFileSync(RESUME_PATH, 'utf8'));

    const softwareMd = generateSoftwareResume(resume);
    const infraMd = generateInfrastructureResume(resume);

    fs.writeFileSync(path.join(OUTPUT_DIR, 'shakib_haris_software_engineer.md'), softwareMd, 'utf8');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'shakib_haris_infrastructure_engineer.md'), infraMd, 'utf8');

    console.log('Generated resume markdown files from resume.json');
}

if (require.main === module) {
    main();
}

module.exports = { generateSoftwareResume, generateInfrastructureResume };
