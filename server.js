require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Render / Cloudflare proxy ortamında doğru IP ve rate-limit çalışması için
app.set('trust proxy', 1);

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'https://nihatbayramm.github.io',
    'https://nihatbayramm.github.io/sehrinnuh',
    'https://sehrinnuh.onrender.com',
    'https://www.sehrinnuh.onrender.com',
    'https://ozelsehrinuhrehabilitasyon.com.tr',
    'https://www.ozelsehrinuhrehabilitasyon.com.tr'
];

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Çok fazla istek, lütfen daha sonra tekrar deneyin.'
});
app.use('/api/', limiter);

// Auth rate limiting (test ederken kilitlenmemesi için limit artırıldı)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin.'
});
app.use('/api/auth/login', authLimiter);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // origin yoksa (aynı origin üzerinden gelen istekler / sayfa içi fetch) veya listedeyse izin ver
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Multer konfigürasyonu - dosya yükleme için
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları (jpeg, jpg, png, gif, webp) yüklenebilir.'));
    }
  }
});

app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Healthcheck for Render
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// JSON dosya okuma/yazma yardımcı fonksiyonları
const readJSON = (filename) => {
    const filePath = path.join(__dirname, 'data', filename);
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    return [];
};

const writeJSON = (filename, data) => {
    const filePath = path.join(__dirname, 'data', filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Aktivite ekleme fonksiyonu
const addActivity = (action) => {
    const activities = readJSON('activities.json');
    activities.unshift({
        id: Date.now(),
        action: action,
        timestamp: new Date().toISOString()
    });
    if (activities.length > 20) {
        activities.pop();
    }
    writeJSON('activities.json', activities);
};

// --- AUTH ENDPOINTS ---

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSON('users.json');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        addActivity(`${user.username} giriş yaptı`);
        res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
        res.status(401).json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre' });
    }
});

// --- CONTENT ENDPOINTS ---

// Get all content
app.get('/api/content', (req, res) => {
    const content = readJSON('content.json');
    res.json(content);
});

// Update content
app.put('/api/content', (req, res) => {
    const content = req.body;
    writeJSON('content.json', content);
    addActivity('İçerik güncellendi');
    res.json({ success: true });
});

// --- GALLERY ENDPOINTS ---

// Get gallery images
app.get('/api/gallery', (req, res) => {
    const gallery = readJSON('gallery.json');
    res.json(gallery);
});

// Add image (URL ile)
app.post('/api/gallery', (req, res) => {
    const gallery = readJSON('gallery.json');
    const newImage = {
        id: Date.now(),
        ...req.body
    };
    gallery.push(newImage);
    writeJSON('gallery.json', gallery);
    addActivity('Yeni resim eklendi');
    res.json({ success: true, image: newImage });
});

// Upload image (dosya yükleme)
app.post('/api/gallery/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Dosya yüklenemedi' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    const gallery = readJSON('gallery.json');
    const newImage = {
        id: Date.now(),
        url: imageUrl,
        alt: req.body.alt || req.file.originalname,
        title: req.body.title || req.file.originalname
    };
    gallery.push(newImage);
    writeJSON('gallery.json', gallery);
    addActivity('Yeni resim yüklendi');
    res.json({ success: true, image: newImage });
});

// Upload team image (uzman kadro resmi için - galeriye eklemez)
app.post('/api/team/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Dosya yüklenemedi' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    // Galeriyi güncelleme, sadece URL'i döndür
    res.json({ 
        success: true, 
        url: imageUrl,
        alt: req.body.alt || req.file.originalname,
        title: req.body.title || req.file.originalname
    });
});

// Delete image
app.delete('/api/gallery/:id', (req, res) => {
    const gallery = readJSON('gallery.json');
    const filteredGallery = gallery.filter(img => img.id !== parseInt(req.params.id));
    writeJSON('gallery.json', filteredGallery);
    addActivity('Resim silindi');
    res.json({ success: true });
});

// --- MESSAGES ENDPOINTS ---

// Get messages
app.get('/api/messages', (req, res) => {
    const messages = readJSON('messages.json');
    res.json(messages);
});

// Add message
app.post('/api/messages', (req, res) => {
    const messages = readJSON('messages.json');
    const newMessage = {
        id: Date.now(),
        read: false,
        timestamp: new Date().toISOString(),
        ...req.body
    };
    messages.push(newMessage);
    writeJSON('messages.json', messages);
    res.json({ success: true, message: newMessage });
});

// Mark message as read
app.put('/api/messages/:id/read', (req, res) => {
    const messages = readJSON('messages.json');
    const message = messages.find(m => m.id === parseInt(req.params.id));
    if (message) {
        message.read = true;
        writeJSON('messages.json', messages);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Mesaj bulunamadı' });
    }
});

// Mark all messages as read
app.put('/api/messages/read-all', (req, res) => {
    const messages = readJSON('messages.json');
    messages.forEach(msg => msg.read = true);
    writeJSON('messages.json', messages);
    addActivity('Tüm mesajlar okundu işaretlendi');
    res.json({ success: true });
});

// Delete message
app.delete('/api/messages/:id', (req, res) => {
    const messages = readJSON('messages.json');
    const filteredMessages = messages.filter(msg => msg.id !== parseInt(req.params.id));
    writeJSON('messages.json', filteredMessages);
    addActivity('Mesaj silindi');
    res.json({ success: true });
});

// --- USERS ENDPOINTS ---

// Get users
app.get('/api/users', (req, res) => {
    const users = readJSON('users.json');
    const safeUsers = users.map(u => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt }));
    res.json(safeUsers);
});

// Add user
app.post('/api/users', (req, res) => {
    const users = readJSON('users.json');
    const { username, password, role } = req.body;

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    const newUser = {
        id: Date.now(),
        username,
        password,
        role,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeJSON('users.json', users);
    addActivity(`Yeni kullanıcı eklendi: ${username}`);
    res.json({ success: true, user: { id: newUser.id, username: newUser.username, role: newUser.role } });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    if (userId === 1) {
        return res.status(403).json({ success: false, message: 'Ana admin silinemez' });
    }

    const users = readJSON('users.json');
    const filteredUsers = users.filter(u => u.id !== userId);
    writeJSON('users.json', filteredUsers);
    addActivity('Kullanıcı silindi');
    res.json({ success: true });
});

// Update user
app.put('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const users = readJSON('users.json');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    
    const { username, password, role } = req.body;
    
    // Kullanıcı adı değişiyorsa, başka biri kullanmıyor mu kontrol et
    if (username && username !== users[userIndex].username) {
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ success: false, message: 'Bu kullanıcı adı zaten kullanılıyor' });
        }
    }
    
    if (username) users[userIndex].username = username;
    if (password) users[userIndex].password = password;
    if (role) users[userIndex].role = role;
    
    writeJSON('users.json', users);
    addActivity(`Kullanıcı güncellendi: ${users[userIndex].username}`);
    res.json({ success: true, user: { id: users[userIndex].id, username: users[userIndex].username, role: users[userIndex].role } });
});

// --- ACTIVITIES ENDPOINTS ---

// Get activities
app.get('/api/activities', (req, res) => {
    const activities = readJSON('activities.json');
    res.json(activities);
});

// --- STATS ENDPOINTS ---

// Get dashboard stats
app.get('/api/stats', (req, res) => {
    const messages = readJSON('messages.json');
    const gallery = readJSON('gallery.json');
    const users = readJSON('users.json');
    const activities = readJSON('activities.json');

    const unreadMessages = messages.filter(m => !m.read).length;
    const lastUpdate = activities.length > 0 ? activities[0].timestamp : null;

    res.json({
        totalMessages: messages.length,
        unreadMessages,
        totalImages: gallery.length,
        totalUsers: users.length,
        lastUpdate
    });
});

// Global Error Handler (CORS veya beklenmeyen hatalarda sunucunun çökmesini engeller)
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ success: false, message: 'CORS Hatası: Bu alan adından erişim izni yok.' });
    }
    console.error('Server Hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu tarafında bir hata oluştu.' });
});

// Server başlatma
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Özel Şehr-i Nuh Server Started');
    console.log('='.repeat(50));
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin-login.html`);
    console.log(`Main site: http://localhost:${PORT}/index.html`);
    console.log('='.repeat(50));
});

module.exports = app;
