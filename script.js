const API_BASE = (() => {
    const configuredBase = window.APP_CONFIG && window.APP_CONFIG.API_BASE;
    if (configuredBase) return String(configuredBase).replace(/\/$/, '');

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }

    const productionHostnames = [
        'ozelsehrinuhrehabilitasyon.com.tr',
        'www.ozelsehrinuhrehabilitasyon.com.tr'
    ];

    if (productionHostnames.includes(window.location.hostname)) {
        return 'https://sehrinnuh.onrender.com/api';
    }

    if (window.location.hostname.endsWith('github.io')) {
        return 'https://sehrinnuh.onrender.com/api';
    }

    return '/api';
})();
