/**
 * Activity Simulator Module
 * Creates the illusion of a running server with live metrics
 */

const ActivitySimulator = {
    // Configuration
    config: {
        updateInterval: 2000,
        networkUpdateInterval: 500,
        clockUpdateInterval: 1000,
        tickerSpeed: 30000
    },

    // State
    intervals: [],
    uptime: {
        days: 127,
        hours: 14,
        minutes: 32,
        seconds: 0
    },

    /**
     * Initialize the activity simulator
     */
    init() {
        this.startClock();
        this.startNetworkActivity();
        this.startSystemMetrics();
        this.startUptimeCounter();
        this.populateTicker();
    },

    /**
     * Start the header clock
     */
    startClock() {
        const clockEl = document.getElementById('headerClock');
        if (!clockEl) return;

        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = `${hours}:${minutes}:${seconds}`;
        };

        updateClock();
        this.intervals.push(setInterval(updateClock, this.config.clockUpdateInterval));
    },

    /**
     * Start network activity simulation
     */
    startNetworkActivity() {
        const networkEl = document.getElementById('networkActivity');
        if (!networkEl) return;

        const updateNetwork = () => {
            // Simulate varying network activity
            const upload = (Math.random() * 5 + 0.5).toFixed(1);
            const download = (Math.random() * 12 + 1).toFixed(1);
            
            // Alternate between upload and download display
            if (Math.random() > 0.5) {
                networkEl.textContent = `↑ ${upload}kb/s`;
            } else {
                networkEl.textContent = `↓ ${download}kb/s`;
            }
        };

        this.intervals.push(setInterval(updateNetwork, this.config.networkUpdateInterval));
    },

    /**
     * Start system metrics simulation (CPU/Memory)
     */
    startSystemMetrics() {
        const cpuEl = document.getElementById('cpuUsage');
        const memEl = document.getElementById('memUsage');
        
        if (!cpuEl && !memEl) return;

        // Base values that fluctuate slightly
        let cpuBase = 8 + Math.random() * 10;
        let memBase = 350 + Math.random() * 100;

        const updateMetrics = () => {
            // CPU fluctuates more
            cpuBase = Math.max(3, Math.min(45, cpuBase + (Math.random() - 0.5) * 8));
            const cpu = Math.round(cpuBase);
            
            // Memory is more stable
            memBase = Math.max(280, Math.min(512, memBase + (Math.random() - 0.5) * 20));
            const mem = Math.round(memBase);

            if (cpuEl) cpuEl.textContent = `${cpu}%`;
            if (memEl) memEl.textContent = `${mem}MB`;
        };

        this.intervals.push(setInterval(updateMetrics, this.config.updateInterval));
    },

    /**
     * Start uptime counter
     */
    startUptimeCounter() {
        const uptimeEl = document.getElementById('uptime');
        if (!uptimeEl) return;

        const updateUptime = () => {
            this.uptime.seconds++;
            
            if (this.uptime.seconds >= 60) {
                this.uptime.seconds = 0;
                this.uptime.minutes++;
            }
            if (this.uptime.minutes >= 60) {
                this.uptime.minutes = 0;
                this.uptime.hours++;
            }
            if (this.uptime.hours >= 24) {
                this.uptime.hours = 0;
                this.uptime.days++;
            }

            uptimeEl.textContent = `${this.uptime.days}d ${this.uptime.hours}h`;
        };

        // Update every minute for the display
        this.intervals.push(setInterval(updateUptime, 60000));
    },

    /**
     * Populate the system ticker with simulated logs
     */
    populateTicker() {
        const tickerContent = document.querySelector('.ticker-content');
        if (!tickerContent) return;

        const tickerMessages = [
            { icon: 'la-check-circle', text: 'nginx: GET /api/health 200 OK', type: 'success' },
            { icon: 'la-database', text: 'postgres: connection pooled (32 active)', type: '' },
            { icon: 'la-sync', text: 'cron: backup job completed', type: 'success' },
            { icon: 'la-shield-alt', text: 'ssl: certificate valid (89 days)', type: '' },
            { icon: 'la-docker', text: 'docker: container [portfolio] running', type: 'success' },
            { icon: 'la-server', text: 'systemd: all services healthy', type: 'success' },
            { icon: 'la-code-branch', text: 'git: latest commit deployed', type: '' },
            { icon: 'la-fire', text: 'redis: cache hit rate 94.2%', type: 'success' },
            { icon: 'la-globe', text: 'cdn: edge nodes responding', type: 'success' },
            { icon: 'la-hdd', text: 'disk: 42% used (58GB free)', type: '' },
            { icon: 'la-memory', text: 'swap: 0MB used', type: 'success' },
            { icon: 'la-network-wired', text: 'eth0: 1000Mbps full duplex', type: '' },
        ];

        // Create ticker items - duplicate for seamless loop
        const allMessages = [...tickerMessages, ...tickerMessages];
        
        tickerContent.innerHTML = allMessages.map(msg => `
            <div class="ticker-item ${msg.type}">
                <i class="las ${msg.icon}"></i>
                <span>${msg.text}</span>
            </div>
        `).join('');
    },

    /**
     * Clean up intervals
     */
    destroy() {
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ActivitySimulator.init();
});

// Export for use in other modules
window.ActivitySimulator = ActivitySimulator;
