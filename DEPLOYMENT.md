# 🚀 Deployment Rehberi - Canlıya Alma Kılavuzu

## 🔐 Güvenlik Bilgileri

### Admin Giriş Bilgileri
- **Kullanıcı Adı:** `admin`
- **Şifre:** `Sehrinuh2024!Secure`
- **Admin Panel URL:** `http://yourdomain.com/admin-login.html`

⚠️ **ÖNEMLİ:** Canlıya almadan önce şifreyi değiştirin!

## 📋 Canlıya Alma Öncesi Kontrol Listesi

### 1. Şifre Güvenliği
- [ ] Admin şifresini değiştirin (`data/users.json` dosyasında)
- [ ] `.env` dosyasındaki gizli anahtarları değiştirin
- [ ] `.env` dosyasını `.gitignore`'a ekleyin (version control kullanıyorsanız)

### 2. Domain Ayarları
- [ ] Domain satın alın
- [ ] DNS ayarlarını yapın
- [ ] SSL sertifikası alın (Let's Encrypt ücretsiz)

### 3. Sunucu Seçenekleri

#### A. Vercel (En Kolay)
```bash
# Kurulum
npm i -g vercel
vercel login
vercel
```

#### B. Heroku
```bash
# Kurulum
npm i -g heroku
heroku login
heroku create sehrinuh
git push heroku main
```

#### C. DigitalOcean / VPS
```bash
# Sunucuya bağlanın
ssh user@your-server-ip

# Node.js kurun
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Projeyi yükleyin
git clone your-repo-url
cd sehrinuh
npm install

# Process Manager kurun (PM2)
npm install -g pm2
pm2 start server.js --name sehrinuh
pm2 startup
pm2 save
```

#### D. Render.com (Ücretsiz)
- Render.com'a gidin
- "New Web Service" oluşturun
- GitHub reposunuzu bağlayın
- Build Command: `npm install`
- Start Command: `node server.js`

### 4. Environment Variables (Canlı)
Canlı sunucuda şu environment variables'ı ayarlayın:

```bash
PORT=3000
NODE_ENV=production
SESSION_SECRET=uzun-guvenli-rastgele-string-buraya
JWT_SECRET=baska-uzun-guvenli-rastgele-string
```

### 5. HTTPS Ayarları
Production'da HTTPS kullanmak zorundasınız:

#### Nginx ile (VPS için)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Cloudflare (Ücretsiz SSL)
1. Cloudflare hesabı oluşturun
2. Domain'inizi ekleyin
3. DNS ayarlarını yapın
4. SSL mode "Full" yapın
5. "Always HTTPS" aktif edin

## 🎯 Önerilen Deployment: Render.com

Render.com kullanmanızı öneriyorum çünkü:
- ✅ Ücretsiz
- ✅ Otomatik SSL
- ✅ Kolay kullanım
- ✅ GitHub entegrasyonu
- ✅ Otomatik deployment

### Render.com Adımları:

1. **GitHub Reposu Oluşturun**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/sehrinuh.git
   git push -u origin main
   ```

2. **Render.com'a Gidin**
   - render.com adresine gidin
   - GitHub ile giriş yapın
   - "New +" -> "Web Service" tıklayın

3. **Ayarlar**
   - Repository: Ihren GitHub reposu seçin
   - Name: sehrinuh
   - Region: Frankfurt (veya size en yakın)
   - Branch: main
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`

4. **Environment Variables Ekle**
   - Advanced kısmına gidin
   - Şunu ekleyin:
     - `NODE_ENV` = `production`
     - `PORT` = `3000`
     - `SESSION_SECRET` = `uzun-rastgele-string`
     - `JWT_SECRET` = `baska-uzun-rastgele-string`

5. **Deploy**
   - "Create Web Service" tıklayın
   - Otomatik deploy başlayacak
   - 2-3 dakika sonra siteniz canlı olacak

## 🔧 Canlıya Alındıktan Sonra

### 1. İlk Test
```bash
# Test URL
curl https://your-app.onrender.com/api/content
```

### 2. Admin Paneline Giriş
- URL: `https://your-app.onrender.com/admin-login.html`
- Kullanıcı adı: `admin`
- Şifre: `Sehrinuh2024!Secure`

### 3. İçerik Test
- Admin panelinden içerik değiştirin
- Ana sayfayı kontrol edin
- Değişikliklerin yansıdığını doğrulayın

## 📊 Monitoring

### Logları Görüntüleme
```bash
# Render.com dashboard'da "Logs" sekmesi
# veya PM2 kullanıyorsanız:
pm2 logs sehrinuh
```

### Health Check
```bash
# Sunucu durumu
curl https://your-app.onrender.com/api/stats
```

## 🔄 Güncellemeler

### Yeni Güncelleme Yaparken
1. Kodunuzu GitHub'a push edin
2. Render.com otomatik deploy yapacak
3. 1-2 dakika içinde güncelleme canlı olacak

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Asla** `.env` dosyasını GitHub'a push etmeyin
2. **Asla** gerçek şifreleri kod içine yazmayın
3. **Her zaman** HTTPS kullanın
4. **Düzenli** olarak dependency'leri güncelleyin
5. **Yedekleme** sistemini kurun (JSON dosyaları için)

## 🆘 Sorun Giderme

### Site Çalışmıyorsa
1. Render.com dashboard'da logları kontrol edin
2. Environment variables'ların doğru olduğundan emin olun
3. Build başarılı oldu mu kontrol edin

### API Hataları
1. `/api/content` endpoint'ini test edin
2. JSON dosyalarının varlığını kontrol edin
3. CORS ayarlarını kontrol edin

### Admin Paneline Erişilemiyorsa
1. URL'i kontrol edin (`/admin-login.html`)
2. Şifre doğru mu kontrol edin
3. Browser console'da hata var mı kontrol edin

## 📞 Destek

Sorun yaşarsanız:
1. Bu rehberi tekrar okuyun
2. Logları kontrol edin
3. Environment variables'ları doğrulayın

---

**Başarılar!** 🎉