// Expert team and responsive admin enhancements
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .team-admin-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-bottom:20px}
    .team-admin-card{border:1px solid var(--border-color);border-radius:12px;padding:16px;background:var(--light-gray)}
    .team-admin-card img{width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:10px}
  `;
  document.head.appendChild(style);

  function init() {
    const tabs = document.querySelector('.content-tabs');
    const programs = document.getElementById('programs');
    if (!tabs || !programs || document.getElementById('team')) return;
    const button = document.createElement('button');
    button.className = 'tab-btn'; button.dataset.tab = 'team'; button.textContent = 'Uzman Kadro'; tabs.appendChild(button);
    const section = document.createElement('div');
    section.id = 'team'; section.className = 'tab-content';
    section.innerHTML = `<div class="team-admin-list" id="teamAdminList"></div><form id="teamForm" class="content-form"><div class="form-group"><label for="teamName">Ad Soyad</label><input id="teamName" required></div><div class="form-group"><label for="teamTitle">Unvan</label><input id="teamTitle" required></div><div class="form-group"><label for="teamImage">Fotoğraf yolu</label><input id="teamImage" value="vedat.jpg" required></div><div class="form-group"><label for="teamDescription">Açıklama</label><textarea id="teamDescription" rows="3"></textarea></div><button class="btn-add" type="submit">Uzmanı Kaydet</button></form>`;
    programs.parentNode.appendChild(section);
    button.addEventListener('click', () => { document.querySelectorAll('.content-tabs .tab-btn').forEach(b=>b.classList.remove('active')); document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active')); button.classList.add('active'); section.classList.add('active'); loadTeam(); });
    async function loadTeam(){ const r=await fetch('/api/content'); const c=await r.json(); const team=Array.isArray(c.team)?c.team:[]; document.getElementById('teamAdminList').innerHTML=team.map(x=>`<article class="team-admin-card"><img src="${x.image}" alt="${x.name}"><strong>${x.name}</strong><p>${x.title}</p><small>${x.description||''}</small></article>`).join('') || '<p class="no-data">Henüz uzman eklenmemiş.</p>'; }
    document.getElementById('teamForm').addEventListener('submit', async e=>{e.preventDefault();const r=await fetch('/api/content');const c=await r.json();c.team=Array.isArray(c.team)?c.team:[];c.team.push({id:Date.now(),name:teamName.value,title:teamTitle.value,image:teamImage.value,description:teamDescription.value});const save=await fetch('/api/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(c)});if(save.ok){e.target.reset();teamImage.value='vedat.jpg';loadTeam();alert('Uzman başarıyla eklendi.');}});
  }
  document.addEventListener('DOMContentLoaded', init);
})();
