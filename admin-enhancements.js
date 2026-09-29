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
    // Uzman kadro artık ana admin panelinde entegre edildi
    // Bu dosya sadece stiller içeriyor
  }
  document.addEventListener('DOMContentLoaded', init);
})();
