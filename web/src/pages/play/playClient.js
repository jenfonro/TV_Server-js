export function initPlayPage() {
  const backBtn = document.getElementById('mobileBackBtn');
        if (backBtn) {
          backBtn.addEventListener('click', () => window.history.back());
        }

        // Collapse toggle (lg+)
        const toggleBtn = document.getElementById('episodePanelToggle');
        const toggleLabel = document.getElementById('episodePanelToggleLabel');
        const toggleIcon = document.getElementById('episodePanelToggleIcon');
        const toggleDot = document.getElementById('episodePanelToggleDot');
        const grid = document.getElementById('playGrid');
        const playerArea = document.getElementById('playerArea');
        const episodePanel = document.getElementById('episodePanel');

        if (toggleBtn && toggleLabel && toggleIcon && toggleDot && grid && playerArea && episodePanel) {
          let collapsed = false;
          const apply = () => {
            episodePanel.classList.toggle('lg:hidden', collapsed);
            grid.classList.toggle('md:grid-cols-4', !collapsed);
            playerArea.classList.toggle('md:col-span-3', !collapsed);
            grid.classList.toggle('episode-panel-collapsed', collapsed);

            toggleLabel.textContent = collapsed ? '显示' : '隐藏';
            toggleIcon.classList.toggle('rotate-180', collapsed);
            toggleDot.classList.toggle('bg-orange-400', collapsed);
            toggleDot.classList.toggle('animate-pulse', collapsed);
            toggleDot.classList.toggle('bg-green-400', !collapsed);
            toggleBtn.title = collapsed ? '显示选集面板' : '隐藏选集面板';
          };

          toggleBtn.addEventListener('click', () => {
            collapsed = !collapsed;
            apply();
          });

          apply();
        }
}
