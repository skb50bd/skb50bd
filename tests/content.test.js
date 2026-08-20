const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const resume = JSON.parse(fs.readFileSync(path.join(root, 'resume.json'), 'utf8'));
const overlay = JSON.parse(fs.readFileSync(path.join(root, 'resume.overlay.json'), 'utf8'));

const requiredProjects = ['Chokidar', 'ilma', 'Brotal TV', '29'];

test('Brotal is the current workplace and Chaldal ended in August 2026', () => {
    const [currentRole] = resume.work;
    assert.equal(currentRole.name, 'Brotal');
    assert.equal(currentRole.position, 'Founder');
    assert.equal(currentRole.employmentType, 'Self-employed');
    assert.equal(currentRole.startDate, '2018-01');
    assert.equal(currentRole.endDate, '');

    const chaldalRoles = resume.work.filter((role) => role.name === 'Chaldal PLC');
    assert.ok(chaldalRoles.length > 0);
    assert.ok(chaldalRoles.every((role) => role.endDate));
    assert.equal(chaldalRoles[0].endDate, '2026-08');
});

test('the requested recent projects lead the portfolio', () => {
    assert.deepEqual(resume.projects.slice(0, 4).map((project) => project.name), requiredProjects);
    assert.equal(resume.projects.find((project) => project.name === '29').url, 'https://29.ekta.dev');

    for (const project of resume.projects.slice(0, 4)) {
        assert.match(project.url, /^https:\/\//);
        assert.ok(project.description.length >= 80, `${project.name} needs a substantive description`);
        assert.ok(project.highlights.length >= 4, `${project.name} needs at least four stack tags`);
    }
});

test('the visual overlay stays aligned with canonical resume arrays', () => {
    assert.equal(overlay.work.length, resume.work.length);
    assert.equal(overlay.projects.length, resume.projects.length);
    assert.deepEqual(overlay.work.map((entry) => entry.name), resume.work.map((entry) => entry.name));
    assert.deepEqual(overlay.projects.map((entry) => entry.name), resume.projects.map((entry) => entry.name));
    assert.equal(overlay.ui.hero.stats[0].label, 'Years Engineering');

    for (const project of overlay.projects.slice(0, requiredProjects.length)) {
        assert.ok(project.image || project.gradient);
    }
});

test('the GitHub profile introduces Brotal and the requested projects', () => {
    const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
    assert.match(readme, /Founder (?:at|@).*Brotal/i);
    for (const project of requiredProjects) {
        assert.ok(readme.includes(project), `README is missing ${project}`);
    }
});

test('role-targeted resume sources reflect the current career and project data', () => {
    const { generateSoftwareResume, generateInfrastructureResume } = require('../resumes/generate');
    const software = fs.readFileSync(path.join(root, 'resumes', 'shakib_haris_software_engineer.md'), 'utf8');
    const infrastructure = fs.readFileSync(path.join(root, 'resumes', 'shakib_haris_infrastructure_engineer.md'), 'utf8');
    assert.equal(software, generateSoftwareResume(resume), 'software resume source is stale');
    assert.equal(infrastructure, generateInfrastructureResume(resume), 'infrastructure resume source is stale');

    for (const document of [software, infrastructure]) {
        assert.match(document, /Brotal — Founder/);
        assert.match(document, /Chaldal PLC — Infrastructure Engineer/);
        assert.match(document, /Jan 2023 – Aug 2026/);
    }
    assert.match(software, /Jan 2018 – Present · Dhaka, Bangladesh · Hybrid/);
    for (const project of requiredProjects) {
        assert.ok(software.includes(`### ${project}`), `software resume is missing ${project}`);
        assert.ok(infrastructure.includes(`### ${project}`), `infrastructure resume is missing ${project}`);
    }
    assert.match(software, /iterative improvements\.\n\n- Founded Brotal/);
    assert.match(software, /operational simplicity\.\n\n- Designed and operated/);
    assert.match(infrastructure, /Dhaka, Bangladesh · Hybrid\*\n\n- Build and deliver production systems/);
});

test('CI and contributor setup enforce the tracked pre-commit gate', () => {
    for (const workflow of [
        'azure-static-web-apps-purple-river-078090700.yml',
        'azure-static-web-apps-red-field-03b29f300.yml'
    ]) {
        const content = fs.readFileSync(path.join(root, '.github', 'workflows', workflow), 'utf8');
        assert.match(content, /\.githooks\/pre-commit/);
    }

    const contributing = fs.readFileSync(path.join(root, 'CONTRIBUTING.md'), 'utf8');
    assert.match(contributing, /git config core\.hooksPath \.githooks/);
});
