// Admin Panel JavaScript - API Connected Version

const API_BASE = (() => {
    const configuredBase = window.APP_CONFIG && window.APP_CONFIG.API_BASE;

    if (configuredBase) {
        return String(configuredBase).replace(/\/$/, '');
    }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }

    return '/api';
})();

// Helper functions for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data !== null && data !== undefined) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, options);

        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            return {
                success: false,
                message: typeof payload === 'string'
                    ? payload
                    : (payload && payload.message) || 'İstek başarısız oldu.',
                error: typeof payload === 'string'
                    ? payload
                    : (payload && payload.error) || null
            };
        }

        if (typeof payload === 'string') {
            return { success: true, data: payload };
        }

        return payload;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message || 'Bilinmeyen bir hata oluştu.' };
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Login functionality
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    if (!username || !password) {
        errorMessage.textContent = 'Kullanıcı adı ve şifre zorunludur.';
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
        return;
    }

    const result = await apiCall('/auth/login', 'POST', { username, password });

    if (result.success) {
        localStorage.setItem('currentUser', JSON.stringify(result.user || { username }));
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'admin.html';
    } else {
        errorMessage.textContent = result.message || 'Giriş başarısız';
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }
}

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();

    if (isLoggedIn === 'true' && currentPage === 'admin-login.html') {
        window.location.href = 'admin.html';
    } else if (isLoggedIn !== 'true' && currentPage === 'admin.html') {
        window.location.href = 'admin-login.html';
    }
}

// Logout functionality
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'admin-login.html';
}

// Navigation functionality
function handleNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');

    // Mobil menü toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Sidebar dışına tıklayınca kapat
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });

            const titles = {
                dashboard: 'Dashboard',
                content: 'İçerik Yönetimi',
                gallery: 'Galeri Yönetimi',
                messages: 'Mesajlar',
                users: 'Kullanıcı Yönetimi'
            };
            pageTitle.textContent = titles[targetSection] || 'Admin Panel';

            // Mobilde menüyü kapat
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
            }
        });
    });
}

// Dashboard functionality
async function updateDashboard() {
    const stats = await apiCall('/stats');
    const activities = await apiCall('/activities');

    if (stats.success) {
        document.getElementById('totalMessages').textContent = stats.totalMessages;
        document.getElementById('totalImages').textContent = stats.totalImages;
        document.getElementById('totalUsers').textContent = stats.totalUsers;

        if (stats.lastUpdate) {
            document.getElementById('lastUpdate').textContent = formatDate(stats.lastUpdate);
        }

        const badge = document.getElementById('messageBadge');
        if (badge) {
            badge.textContent = stats.unreadMessages;
            badge.style.display = stats.unreadMessages > 0 ? 'inline' : 'none';
        }
    }

    if (activities.success) {
        renderActivities(activities);
    }
}

function renderActivities(activities) {
    const activityList = document.getElementById('activityList');

    if (!activities || activities.length === 0) {
        activityList.innerHTML = '<p class="no-data">Henüz aktivite yok</p>';
        return;
    }

    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.action}</div>
                <div class="activity-time">${formatDate(activity.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

// Content management functionality
async function handleContentManagement() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });

            loadContentForTab(targetTab);
        });
    });

    loadContentForTab('about');

    document.getElementById('aboutForm').addEventListener('submit', handleAboutSave);
    document.getElementById('contactForm').addEventListener('submit', handleContactSave);
}

async function loadContentForTab(tab) {
    const content = await apiCall('/content');

    if (content.success === false) return;

    if (tab === 'about') {
        document.getElementById('aboutTitle').value = content.about.title;
        document.getElementById('aboutText').value = content.about.text;
    } else if (tab === 'contact') {
        document.getElementById('contactPhone').value = content.contact.phone;
        document.getElementById('contactEmail').value = content.contact.email;
        document.getElementById('contactAddress').value = content.contact.address;
    } else if (tab === 'programs') {
        renderPrograms(content.programs);
    } else if (tab === 'team') {
        renderTeam(content.team);
    }
}

async function handleAboutSave(event) {
    event.preventDefault();

    const content = await apiCall('/content');
    if (content.success === false) return;

    content.about.title = document.getElementById('aboutTitle').value;
    content.about.text = document.getElementById('aboutText').value;

    const result = await apiCall('/content', 'PUT', content);

    if (result.success) {
        alert('İçerik başarıyla kaydedildi!');
    } else {
        alert('Kayıt başarısız!');
    }
}

async function handleContactSave(event) {
    event.preventDefault();

    const content = await apiCall('/content');
    if (content.success === false) return;

    content.contact.phone = document.getElementById('contactPhone').value;
    content.contact.email = document.getElementById('contactEmail').value;
    content.contact.address = document.getElementById('contactAddress').value;

    const result = await apiCall('/content', 'PUT', content);

    if (result.success) {
        alert('İçerik başarıyla kaydedildi!');
    } else {
        alert('Kayıt başarısız!');
    }
}

function renderPrograms(programs) {
    const programsList = document.getElementById('programsList');

    if (!programs || programs.length === 0) {
        programsList.innerHTML = '<p class="no-data">Henüz program yok</p>';
        return;
    }

    programsList.innerHTML = programs.map(program => `
        <div class="program-item">
            <div class="program-info">
                <h4>${program.title}</h4>
                <p>${program.description}</p>
            </div>
            <div class="program-actions">
                <button class="btn-delete" onclick="deleteProgram(${program.id})">Sil</button>
            </div>
        </div>
    `).join('');
}

function renderTeam(team) {
    const teamList = document.getElementById('teamList');

    if (!team || team.length === 0) {
        teamList.innerHTML = '<p class="no-data">Henüz uzman eklenmemiş</p>';
        return;
    }

    teamList.innerHTML = team.map(member => `
        <div class="team-item">
            <div class="team-image">
                <img src="${member.image}" alt="${member.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            </div>
            <div class="team-info">
                <h4>${member.name}</h4>
                <p class="team-title">${member.title}</p>
                <p class="team-specialty">${member.specialty || ''}</p>
                <p class="team-description">${member.description || ''}</p>
            </div>
            <div class="team-actions">
                <button class="btn-secondary" onclick="editTeam(${member.id})">Düzenle</button>
                <button class="btn-delete" onclick="deleteTeam(${member.id})">Sil</button>
            </div>
        </div>
    `).join('');
}

async function deleteProgram(id) {
    if (confirm('Bu programı silmek istediğinizden emin misiniz?')) {
        const content = await apiCall('/content');
        if (content.success === false) return;

        content.programs = content.programs.filter(p => p.id !== id);
        const result = await apiCall('/content', 'PUT', content);

        if (result.success) {
            loadContentForTab('programs');
        }
    }
}

async function deleteTeam(id) {
    if (confirm('Bu uzmanı silmek istediğinizden emin misiniz?')) {
        const content = await apiCall('/content');
        if (content.success === false) return;

        content.team = content.team.filter(t => t.id !== id);
        const result = await apiCall('/content', 'PUT', content);

        if (result.success) {
            loadContentForTab('team');
        } else {
            alert('Uzman silinemedi!');
        }
    }
}

// Gallery management functionality
async function handleGalleryManagement() {
    await renderGallery();

    document.getElementById('addImageBtn').addEventListener('click', () => {
        document.getElementById('imageModal').classList.add('show');
    });

    // Yükleme yöntemi değiştirme
    const uploadMethodRadios = document.querySelectorAll('input[name="uploadMethod"]');
    uploadMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const fileInputGroup = document.getElementById('fileInputGroup');
            const urlInputGroup = document.getElementById('urlInputGroup');
            const imageFile = document.getElementById('imageFile');
            const imageUrl = document.getElementById('imageUrl');

            if (e.target.value === 'file') {
                fileInputGroup.style.display = 'block';
                urlInputGroup.style.display = 'none';
                imageFile.required = true;
                imageUrl.required = false;
            } else {
                fileInputGroup.style.display = 'none';
                urlInputGroup.style.display = 'block';
                imageFile.required = false;
                imageUrl.required = true;
            }
        });
    });

    document.getElementById('imageForm').addEventListener('submit', handleImageAdd);

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('show');
        });
    });
}

async function renderGallery() {
    const gallery = await apiCall('/gallery');
    const galleryGrid = document.getElementById('galleryGrid');

    if (gallery.success === false || !gallery || gallery.length === 0) {
        galleryGrid.innerHTML = '<p class="no-data">Henüz resim yok</p>';
        return;
    }

    galleryGrid.innerHTML = gallery.map(image => `
        <div class="gallery-item-admin">
            <img src="${image.url}" alt="${image.alt}">
            <div class="gallery-actions">
                <button class="btn-delete" onclick="deleteImage(${image.id})">Sil</button>
            </div>
        </div>
    `).join('');
}

async function handleImageAdd(event) {
    event.preventDefault();

    const uploadMethod = document.querySelector('input[name="uploadMethod"]:checked').value;
    const imageAlt = document.getElementById('imageAlt').value;
    const imageTitle = document.getElementById('imageTitle').value;

    let result;

    if (uploadMethod === 'file') {
        // Dosya yükleme
        const imageFile = document.getElementById('imageFile').files[0];
        if (!imageFile) {
            alert('Lütfen bir resim dosyası seçin.');
            return;
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('alt', imageAlt);
        formData.append('title', imageTitle);

        try {
            const response = await fetch(`${API_BASE}/gallery/upload`, {
                method: 'POST',
                body: formData
            });
            result = await response.json();
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Resim yüklenirken bir hata oluştu.');
            return;
        }
    } else {
        // URL ile ekleme
        const newImage = {
            url: document.getElementById('imageUrl').value,
            alt: imageAlt,
            title: imageTitle
        };

        if (!newImage.url) {
            alert('Lütfen bir resim URL\'i girin.');
            return;
        }

        result = await apiCall('/gallery', 'POST', newImage);
    }

    if (result.success) {
        document.getElementById('imageForm').reset();
        // Radio button'u sıfırla
        document.querySelector('input[name="uploadMethod"][value="file"]').checked = true;
        document.getElementById('fileInputGroup').style.display = 'block';
        document.getElementById('urlInputGroup').style.display = 'none';
        document.getElementById('imageModal').classList.remove('show');
        renderGallery();
        updateDashboard();
    } else {
        alert(result.message || 'Resim eklenemedi!');
    }
}

async function deleteImage(id) {
    if (confirm('Bu resmi silmek istediğinizden emin misiniz?')) {
        const result = await apiCall(`/gallery/${id}`, 'DELETE');

        if (result.success) {
            renderGallery();
            updateDashboard();
        } else {
            alert('Resim silinemedi!');
        }
    }
}

// Messages management functionality
async function handleMessagesManagement() {
    await renderMessages();

    document.getElementById('markAllReadBtn').addEventListener('click', async () => {
        const result = await apiCall('/messages/read-all', 'PUT');
        if (result.success) {
            renderMessages();
            updateDashboard();
        }
    });
}

async function renderMessages() {
    const messages = await apiCall('/messages');
    const messagesList = document.getElementById('messagesList');

    if (messages.success === false || !messages || messages.length === 0) {
        messagesList.innerHTML = '<p class="no-data">Henüz mesaj yok</p>';
        return;
    }

    messagesList.innerHTML = messages.map(message => `
        <div class="message-item ${!message.read ? 'unread' : ''}">
            <div class="message-header">
                <span class="message-sender">${message.name}</span>
                <span class="message-date">${formatDate(message.timestamp)}</span>
            </div>
            <div class="message-body">
                <p><strong>E-posta:</strong> ${message.email}</p>
                <p><strong>Telefon:</strong> ${message.phone}</p>
                <p><strong>Mesaj:</strong> ${message.message}</p>
            </div>
            <div class="message-actions">
                <button class="btn-secondary" onclick="markAsRead(${message.id})">Okundu İşaretle</button>
                <button class="btn-delete" onclick="deleteMessage(${message.id})">Sil</button>
            </div>
        </div>
    `).join('');
}

async function markAsRead(id) {
    const result = await apiCall(`/messages/${id}/read`, 'PUT');
    if (result.success) {
        renderMessages();
        updateDashboard();
    }
}

async function deleteMessage(id) {
    if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
        const result = await apiCall(`/messages/${id}`, 'DELETE');
        if (result.success) {
            renderMessages();
            updateDashboard();
        } else {
            alert('Mesaj silinemedi!');
        }
    }
}

// Users management functionality
async function handleUsersManagement() {
    await renderUsers();

    document.getElementById('addUserBtn').addEventListener('click', () => {
        document.getElementById('userModal').classList.add('show');
    });

    document.getElementById('userForm').addEventListener('submit', handleUserAdd);
    document.getElementById('editUserForm').addEventListener('submit', handleUserEdit);
}

async function renderUsers() {
    const users = await apiCall('/users');
    const usersList = document.getElementById('usersList');

    if (users.success === false || !users || users.length === 0) {
        usersList.innerHTML = '<p class="no-data">Henüz kullanıcı yok</p>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div class="user-info">
                <div class="user-name">${user.username}</div>
                <div class="user-role">${user.role === 'admin' ? 'Admin' : 'Editör'}</div>
            </div>
            <div class="user-actions">
                <button class="btn-secondary" onclick="editUser(${user.id})">Düzenle</button>
                ${user.id !== 1 ? `<button class="btn-delete" onclick="deleteUser(${user.id})">Sil</button>` : ''}
            </div>
        </div>
    `).join('');
}

async function handleUserAdd(event) {
    event.preventDefault();

    const newUser = {
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newPassword').value,
        role: document.getElementById('newUserRole').value
    };

    const result = await apiCall('/users', 'POST', newUser);

    if (result.success) {
        document.getElementById('userForm').reset();
        document.getElementById('userModal').classList.remove('show');
        renderUsers();
        updateDashboard();
    } else {
        alert(result.message || 'Kullanıcı eklenemedi!');
    }
}

async function deleteUser(id) {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
        const result = await apiCall(`/users/${id}`, 'DELETE');
        if (result.success) {
            renderUsers();
            updateDashboard();
        } else {
            alert(result.message || 'Kullanıcı silinemedi!');
        }
    }
}

async function editUser(id) {
    const users = await apiCall('/users');
    if (users.success === false) return;

    const user = users.find(u => u.id === id);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editPassword').value = '';
    document.getElementById('editUserRole').value = user.role;

    document.getElementById('editUserModal').classList.add('show');
}

async function handleUserEdit(event) {
    event.preventDefault();

    const userId = parseInt(document.getElementById('editUserId').value);
    const username = document.getElementById('editUsername').value;
    const password = document.getElementById('editPassword').value;
    const role = document.getElementById('editUserRole').value;

    const updateData = { username, role };
    if (password) {
        updateData.password = password;
    }

    const result = await apiCall(`/users/${userId}`, 'PUT', updateData);

    if (result.success) {
        document.getElementById('editUserForm').reset();
        document.getElementById('editUserModal').classList.remove('show');
        renderUsers();
        updateDashboard();
    } else {
        alert(result.message || 'Kullanıcı güncellenemedi!');
    }
}

// Program modal functionality
function handleProgramModal() {
    document.getElementById('addProgramBtn').addEventListener('click', () => {
        document.getElementById('programModal').classList.add('show');
    });

    document.getElementById('programForm').addEventListener('submit', handleProgramAdd);
}

// Team modal functionality
function handleTeamModal() {
    document.getElementById('addTeamBtn').addEventListener('click', () => {
        document.getElementById('teamModal').classList.add('show');
    });

    // Yükleme yöntemi değiştirme
    const teamUploadMethodRadios = document.querySelectorAll('input[name="teamUploadMethod"]');
    teamUploadMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const fileInputGroup = document.getElementById('teamFileInputGroup');
            const urlInputGroup = document.getElementById('teamUrlInputGroup');
            const imageFile = document.getElementById('teamImageFile');
            const imageUrl = document.getElementById('teamImageUrl');

            if (e.target.value === 'file') {
                fileInputGroup.style.display = 'block';
                urlInputGroup.style.display = 'none';
                imageFile.required = true;
                imageUrl.required = false;
            } else {
                fileInputGroup.style.display = 'none';
                urlInputGroup.style.display = 'block';
                imageFile.required = false;
                imageUrl.required = true;
            }
        });
    });

    document.getElementById('teamForm').addEventListener('submit', handleTeamAdd);

    // Edit team modal yöntemi değiştirme
    const editTeamUploadMethodRadios = document.querySelectorAll('input[name="editTeamUploadMethod"]');
    editTeamUploadMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const fileInputGroup = document.getElementById('editTeamFileInputGroup');
            const urlInputGroup = document.getElementById('editTeamUrlInputGroup');
            const imageFile = document.getElementById('editTeamImageFile');
            const imageUrl = document.getElementById('editTeamImageUrl');

            if (e.target.value === 'keep') {
                fileInputGroup.style.display = 'none';
                urlInputGroup.style.display = 'none';
                imageFile.required = false;
                imageUrl.required = false;
            } else if (e.target.value === 'file') {
                fileInputGroup.style.display = 'block';
                urlInputGroup.style.display = 'none';
                imageFile.required = true;
                imageUrl.required = false;
            } else {
                fileInputGroup.style.display = 'none';
                urlInputGroup.style.display = 'block';
                imageFile.required = false;
                imageUrl.required = true;
            }
        });
    });

    document.getElementById('editTeamForm').addEventListener('submit', handleTeamEdit);
}

async function handleProgramAdd(event) {
    event.preventDefault();

    const content = await apiCall('/content');
    if (content.success === false) return;

    const newProgram = {
        id: Date.now(),
        title: document.getElementById('programTitle').value,
        description: document.getElementById('programDescription').value
    };

    content.programs.push(newProgram);
    const result = await apiCall('/content', 'PUT', content);

    if (result.success) {
        document.getElementById('programForm').reset();
        document.getElementById('programModal').classList.remove('show');
        loadContentForTab('programs');
    } else {
        alert('Program eklenemedi!');
    }
}

async function handleTeamAdd(event) {
    event.preventDefault();

    const uploadMethod = document.querySelector('input[name="teamUploadMethod"]:checked').value;
    const teamName = document.getElementById('teamName').value;
    const teamTitle = document.getElementById('teamTitle').value;
    const teamSpecialty = document.getElementById('teamSpecialty').value;
    const teamDescription = document.getElementById('teamDescription').value;

    let imageUrl;

    if (uploadMethod === 'file') {
        const imageFile = document.getElementById('teamImageFile').files[0];
        if (!imageFile) {
            alert('Lütfen bir resim dosyası seçin.');
            return;
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('alt', teamName);
        formData.append('title', teamName);

        try {
            const response = await fetch(`${API_BASE}/team/upload`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                imageUrl = result.url;
            } else {
                alert('Resim yüklenirken bir hata oluştu.');
                return;
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Resim yüklenirken bir hata oluştu.');
            return;
        }
    } else {
        imageUrl = document.getElementById('teamImageUrl').value;
        if (!imageUrl) {
            alert('Lütfen bir resim URL\'i girin.');
            return;
        }
    }

    const content = await apiCall('/content');
    if (content.success === false) return;

    const newTeamMember = {
        id: Date.now(),
        name: teamName,
        title: teamTitle,
        specialty: teamSpecialty,
        description: teamDescription,
        image: imageUrl
    };

    content.team = content.team || [];
    content.team.push(newTeamMember);
    const result = await apiCall('/content', 'PUT', content);

    if (result.success) {
        document.getElementById('teamForm').reset();
        document.querySelector('input[name="teamUploadMethod"][value="file"]').checked = true;
        document.getElementById('teamFileInputGroup').style.display = 'block';
        document.getElementById('teamUrlInputGroup').style.display = 'none';
        document.getElementById('teamModal').classList.remove('show');
        loadContentForTab('team');
    } else {
        alert('Uzman eklenemedi!');
    }
}

async function editTeam(id) {
    const content = await apiCall('/content');
    if (content.success === false) return;

    const member = content.team.find(t => t.id === id);
    if (!member) return;

    document.getElementById('editTeamId').value = member.id;
    document.getElementById('editTeamName').value = member.name;
    document.getElementById('editTeamTitle').value = member.title;
    document.getElementById('editTeamSpecialty').value = member.specialty || '';
    document.getElementById('editTeamDescription').value = member.description || '';

    // Reset upload method
    document.querySelector('input[name="editTeamUploadMethod"][value="keep"]').checked = true;
    document.getElementById('editTeamFileInputGroup').style.display = 'none';
    document.getElementById('editTeamUrlInputGroup').style.display = 'none';

    document.getElementById('editTeamModal').classList.add('show');
}

async function handleTeamEdit(event) {
    event.preventDefault();

    const id = parseInt(document.getElementById('editTeamId').value);
    const uploadMethod = document.querySelector('input[name="editTeamUploadMethod"]:checked').value;
    const teamName = document.getElementById('editTeamName').value;
    const teamTitle = document.getElementById('editTeamTitle').value;
    const teamSpecialty = document.getElementById('editTeamSpecialty').value;
    const teamDescription = document.getElementById('editTeamDescription').value;

    const content = await apiCall('/content');
    if (content.success === false) return;

    const memberIndex = content.team.findIndex(t => t.id === id);
    if (memberIndex === -1) {
        alert('Uzman bulunamadı!');
        return;
    }

    // Update member info
    content.team[memberIndex].name = teamName;
    content.team[memberIndex].title = teamTitle;
    content.team[memberIndex].specialty = teamSpecialty;
    content.team[memberIndex].description = teamDescription;

    // Handle image update
    if (uploadMethod === 'file') {
        const imageFile = document.getElementById('editTeamImageFile').files[0];
        if (!imageFile) {
            alert('Lütfen bir resim dosyası seçin.');
            return;
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('alt', teamName);
        formData.append('title', teamName);

        try {
            const response = await fetch(`${API_BASE}/team/upload`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                content.team[memberIndex].image = result.url;
            } else {
                alert('Resim yüklenirken bir hata oluştu.');
                return;
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Resim yüklenirken bir hata oluştu.');
            return;
        }
    } else if (uploadMethod === 'url') {
        const imageUrl = document.getElementById('editTeamImageUrl').value;
        if (!imageUrl) {
            alert('Lütfen bir resim URL\'i girin.');
            return;
        }
        content.team[memberIndex].image = imageUrl;
    }
    // If 'keep', don't change the image

    const result = await apiCall('/content', 'PUT', content);

    if (result.success) {
        document.getElementById('editTeamForm').reset();
        document.getElementById('editTeamModal').classList.remove('show');
        loadContentForTab('team');
    } else {
        alert('Uzman güncellenemedi!');
    }
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'admin-login.html') {
        checkAuth();
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    } else if (currentPage === 'admin.html') {
        checkAuth();

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            document.getElementById('currentUserName').textContent = currentUser.username;
        }

        handleNavigation();
        updateDashboard();
        handleContentManagement();
        handleGalleryManagement();
        handleMessagesManagement();
        handleUsersManagement();
        handleProgramModal();
        handleTeamModal();

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        setInterval(updateDashboard, 30000);
    }
});

// Make functions globally available
window.deleteProgram = deleteProgram;
window.deleteImage = deleteImage;
window.markAsRead = markAsRead;
window.deleteMessage = deleteMessage;
window.deleteUser = deleteUser;
window.editUser = editUser;
window.deleteTeam = deleteTeam;
window.editTeam = editTeam;
