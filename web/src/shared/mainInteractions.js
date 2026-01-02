export function initMainInteractions() {
  // Sidebar collapse (desktop)
  const sidebarToggle = document.getElementById('sidebarToggleBtn');
  const sidebar = document.getElementById('desktopSidebar');
  const sidebarOffset = document.getElementById('sidebarOffset');
  if (sidebarToggle && sidebar && sidebarOffset) {
    const logoRow = sidebar.querySelector('.logo-row');
    const logoText = sidebar.querySelector('.logo-text');
    const logoImg = sidebar.querySelector('.logo-mark img');
    const brandBox = sidebar.querySelector('.brand-box');
    const navTextSpans = sidebar.querySelectorAll('.nav-label');
    sidebarToggle.addEventListener('click', () => {
      const collapsed = sidebar.classList.toggle('collapsed');
      sidebarOffset.classList.toggle('collapsed', collapsed);
      if (logoRow) logoRow.style.display = collapsed ? 'none' : '';
      if (logoText) logoText.style.display = collapsed ? 'none' : '';
      if (logoImg) logoImg.style.display = collapsed ? 'none' : '';
      if (brandBox) brandBox.style.display = collapsed ? 'none' : '';
      navTextSpans.forEach((s) => (s.style.display = collapsed ? 'none' : ''));
    });
  }

  // segment tabs (首页/收藏夹) active state mimic
  const segButtons = document.querySelectorAll('.seg-toggle .seg-btn');
  if (segButtons.length) {
    segButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        segButtons.forEach((b) => b.classList.toggle('active', b === btn));
      });
    });
  }

  // theme toggle (light/dark class on html/body)
  const themeBtn = document.getElementById('themeToggleBtn');
  const sunIcon = document.querySelector('#themeToggleBtn .sun');
  const moonIcon = document.querySelector('#themeToggleBtn .moon');
  if (themeBtn) {
    const applyTheme = (dark) => {
      document.documentElement.classList.toggle('dark', dark);
      document.body.classList.toggle('dark', dark);
      if (sunIcon && moonIcon) {
        // Light 模式显示月亮，暗色模式显示太阳
        sunIcon.classList.toggle('hidden', !dark);
        moonIcon.classList.toggle('hidden', dark);
      }
      localStorage.setItem('tv_server_theme', dark ? 'dark' : 'light');
    };
    const saved = localStorage.getItem('tv_server_theme') || localStorage.getItem('tvbox_theme');
    const initialDark = saved === 'dark';
    applyTheme(initialDark);
    themeBtn.addEventListener('click', () => {
      const darkNow = !document.documentElement.classList.contains('dark');
      applyTheme(darkNow);
    });
  }

  // user menu
  const userBtn = document.getElementById('userMenuBtn');
  const userMenu = document.getElementById('userMenu');
  if (userBtn && userMenu) {
    const settingsBtn = document.getElementById('userSettingsBtn');
    const closeMenu = (evt) => {
      if (!userMenu.contains(evt.target) && !userBtn.contains(evt.target)) {
        userMenu.classList.add('hidden');
        document.removeEventListener('click', closeMenu);
      }
    };
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('hidden');
      if (!userMenu.classList.contains('hidden')) {
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
      }
    });

    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        userMenu.classList.add('hidden');
        document.removeEventListener('click', closeMenu);
        window.dispatchEvent(new CustomEvent('tv:open-user-settings'));
      });
    }
  }
}
