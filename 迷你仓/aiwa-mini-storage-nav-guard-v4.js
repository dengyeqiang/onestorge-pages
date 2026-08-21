(() => {
  const MINI_PAGE = 'mini-storage-app';

  function rememberMiniPage(page) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', MINI_PAGE);
      url.searchParams.set('section', page);
      window.history.replaceState(null, '', url.toString());
    } catch (_) {}
  }

  function showMiniStorageShell() {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.toggle('active', page.id === `page-${MINI_PAGE}`);
    });
    [
      'agent-editor-mode', 'agent-list-mode', 'skill-list-mode', 'skill-editor-mode',
      'material-list-mode', 'material-skill-mode', 'voice-skill-mode',
      'human-service-mode', 'mcp-service-mode', 'marketing-mode', 'customer-mode',
      'home-report-mode', 'channel-mode', 'conversation-mode', 'app-store-mode',
      'wecom-broadcast-mode', 'shopify-app-mode'
    ].forEach(name => document.body.classList.remove(name));
    document.body.classList.add('mini-storage-app-mode');
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.toggle('active', nav.dataset.openPage === 'app-store');
    });
  }

  function syncMenu(page) {
    let activeItem = null;
    document.querySelectorAll('.ec-mini-detail-nav [data-mini-storage-page]:not(.ec-current-app)').forEach(item => {
      const active = item.dataset.miniStoragePage === page;
      item.classList.toggle('active', active);
      if (active) activeItem = item;
    });
    document.querySelectorAll('.mini-storage-category').forEach(category => {
      category.classList.toggle('active', Boolean(category.querySelector(`[data-mini-storage-page="${page}"]`)));
    });
    const category = activeItem?.closest('.mini-storage-category');
    category?.classList.remove('collapsed');
    category?.querySelector('[data-mini-storage-category-toggle]')?.setAttribute('aria-expanded', 'true');
  }

  function openMiniPage(page, sourceButton) {
    showMiniStorageShell();
    rememberMiniPage(page);
    syncMenu(page);
    sourceButton?.querySelector('.mini-nav-new-badge')?.remove();
    const launch = () => Promise.resolve(window.AiwaMiniStorage?.open(page)).catch(error => {
      console.error('Mini storage navigation failed:', error);
    });
    if (window.AiwaMiniStorage) launch();
    else document.addEventListener('aiwa:ministorage-bridge-ready', launch, { once: true });
  }

  document.addEventListener('click', event => {
    const categoryToggle = event.target.closest('[data-mini-storage-category-toggle]');
    if (categoryToggle) {
      const category = categoryToggle.closest('.mini-storage-category');
      const sidebar = categoryToggle.closest('.ec-center-sidebar');
      if (sidebar?.classList.contains('collapsed')) {
        try {
          if (typeof showEcCollapsedSubmenu === 'function') {
            showEcCollapsedSubmenu(categoryToggle);
            return;
          }
        } catch (_) {}
        sidebar.classList.remove('collapsed');
      }
      const collapsed = category.classList.toggle('collapsed');
      categoryToggle.setAttribute('aria-expanded', String(!collapsed));
      return;
    }

    const button = event.target.closest('[data-mini-storage-page]');
    if (!button) return;
    const page = button.dataset.miniStoragePage || 'dashboard';
    // 始终把目标页面传给内层应用。URL/高亮可能已由其他监听器提前更新，
    // 不能据此判断内层 Vue 页面已经完成切换。
    openMiniPage(page, button);
  }, true);

  document.addEventListener('aiwa:ministorage-pagechange', event => {
    const page = event.detail?.page || 'dashboard';
    rememberMiniPage(page);
    syncMenu(page);
  });

  function restoreFromLocation() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('page') !== MINI_PAGE) return;
    openMiniPage(params.get('section') || 'dashboard');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreFromLocation, { once: true });
  } else {
    restoreFromLocation();
  }
})();
