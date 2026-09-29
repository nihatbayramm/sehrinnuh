# Özel Şehr-i Nuh - Özel Eğitim ve Rehabilitasyon Merkezi

Bu proje, Özel Şehr-i Nuh Özel Eğitim ve Rehabilitasyon Merkezi için geliştirilmiş modern bir web sitesi ve yönetim panelidir.

## 🌟 Özellikler

### Web Sitesi
- **Responsive Tasarım:** Tüm cihazlarda uyumlu modern arayüz
- **Hakkımızda:** Kurum tanıtımı ve misyon/vizyon bilgileri
- **İletişim Formu:** Ziyaretçilerden mesaj toplama
- **Galeri:** Fotoğraf galerisi
- **Programlar:** Eğitim programları tanıtımı

### Admin Paneli
- **Dashboard:** İstatistikler ve aktivite takibi
- **İçerik Yönetimi:** Hakkımızda, ileişim ve program içeriklerini düzenleme
- **Galeri Yönetimi:** Resim ekleme (dosya yükleme veya URL ile) ve silme
- **Mesaj Yönetimi:** İletişim formundan gelen mesajları görüntüleme ve yönetme
- **Kullanıcı Yönetimi:** Admin ve editör kullanıcı ekleme, düzenleme ve silme
- **Uzman Kadro Yönetimi:** Personel bilgilerini yönetme

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn

### Adımlar

1. Repository'yi klonlayın:
```bash
git clone https://github.com/nihatbayramm/sehrinnuh.git
cd sehrinnuh
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Sunucuyu başlatın:
```bash
npm start
```

4. Tarayıcıda açın:
- **Ana Site:** http://localhost:3000/index.html
- **Admin Panel:** http://localhost:3000/admin-login.html

## 🔐 Varsayılan Admin Bilgileri

Admin paneline giriş için varsayılan bilgiler:
- **Kullanıcı Adı:** admin
- **Şifre:** admin123

⚠️ **Önemli:** İlk girişten sonra şifrenizi değiştirmeniz önerilir.

## 📁 Proje Yapısı

```
sehrinnuh/
├── admin.html              # Admin panel ana sayfası
├── admin-login.html        # Admin giriş sayfası
├── admin.css              # Admin panel stilleri
├── admin.js               # Admin panel JavaScript
├── admin-enhancements.js  # Admin panel eklentileri
├── index.html             # Ana web sitesi
├── styles.css             # Ana site stilleri
├── script.js              # Ana site JavaScript
├── server.js              # Express.js sunucusu
├── package.json           # Proje bağımlılıkları
├── data/                  # Veri dosyaları
│   ├── users.json         # Kullanıcı verileri
│   ├── content.json       # İçerik verileri
│   ├── gallery.json       # Galeri verileri
│   ├── messages.json      # Mesaj verileri
│   └── activities.json    # Aktivite logları
├── uploads/               # Yüklenen resimler
└── README.md              # Bu dosya
```

## 🛠️ Teknolojiler

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **File Upload:** Multer
- **Security:** Helmet, CORS, Rate Limiting
- **Styling:** CSS Grid, Flexbox, CSS Variables

## 📱 Mobil Uyumluluk

Admin paneli ve web sitesi tamamen mobil uyumludur:
- Responsive tasarım
- Mobil menü (hamburger menu)
- Touch-friendly butonlar
- Optimize edilmiş form elemanları

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Giriş yapma

### Content
- `GET /api/content` - İçerik getirme
- `PUT /api/content` - İçerik güncelleme

### Gallery
- `GET /api/gallery` - Galeri getirme
- `POST /api/gallery` - Resim ekleme (URL ile)
- `POST /api/gallery/upload` - Resim yükleme (dosya ile)
- `DELETE /api/gallery/:id` - Resim silme

### Messages
- `GET /api/messages` - Mesajları getirme
- `POST /api/messages` - Mesaj gönderme
- `PUT /api/messages/:id/read` - Mesajı okundu işaretleme
- `PUT /api/messages/read-all` - Tüm mesajları okundu işaretleme
- `DELETE /api/messages/:id` - Mesaj silme

### Users
- `GET /api/users` - Kullanıcıları getirme
- `POST /api/users` - Kullanıcı ekleme
- `PUT /api/users/:id` - Kullanıcı güncelleme
- `DELETE /api/users/:id` - Kullanıcı silme

### Stats
- `GET /api/stats` - Dashboard istatistikleri

### Activities
- `GET /api/activities` - Aktivite logları

## 🚢 Deployment

### Render.com Deployment
1. Repository'yi GitHub'a pushlayın
2. Render.com'da yeni Web Service oluşturun
3. GitHub repository'nizi bağlayın
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Environment Variables (gerekirse):
   - `PORT`: 3000 (veya istediğiniz port)
   - `NODE_ENV`: production

Detaylı deployment bilgileri için `DEPLOYMENT.md` dosyasına bakın.

## 📝 Lisans

Bu proje Özel Şehr-i Nuh Özel Eğitim ve Rehabilitasyon Merkezi için geliştirilmiştir.

## 🤝 Katkıda Bulunma

Katkıda bulunmak isterseniz:
1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i pushlayın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

Sorular ve öneriler için repository'de issue açabilirsiniz.

---

**Özel Şehr-i Nuh Özel Eğitim ve Rehabilitasyon Merkezi** © 2024
