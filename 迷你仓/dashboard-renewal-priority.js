(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) api.init();
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const RENEWAL_RESPONSIVE_STYLE = `
    .renewal-overall-card { container-type:inline-size; }
    @container (max-width:430px) {
      .renewal-overall-body { grid-template-columns:1fr; align-items:start; }
      .renewal-rate-ring { justify-self:center; }
      .renewal-overall-summary { width:100%; grid-template-columns:repeat(2,minmax(0,1fr)); }
      .renewal-overall-summary span { white-space:nowrap; word-break:keep-all; }
    }
  `;

  function ensureRenewalResponsiveStyle(scope) {
    if (scope.getElementById('aiwa-renewal-responsive-style')) return;
    const style = scope.ownerDocument.createElement('style');
    style.id = 'aiwa-renewal-responsive-style';
    style.textContent = RENEWAL_RESPONSIVE_STYLE;
    scope.append(style);
  }

  function prioritizeRenewal(scope) {
    const kpiGroup = scope.querySelector('.home-v2-kpis');
    const renewalKpi = kpiGroup && kpiGroup.querySelector('.home-v2-kpi.renewal');
    if (renewalKpi && kpiGroup.firstElementChild !== renewalKpi) {
      kpiGroup.prepend(renewalKpi);
    }

    const renewalSection = scope.querySelector('.renewal-analysis-section');
    const growthSection = scope.querySelector('.home-v2-marketing-card')?.closest('.home-v2-section');
    if (renewalSection && growthSection && renewalSection.nextElementSibling !== growthSection) {
      growthSection.before(renewalSection);
    }
  }

  function init() {
    let attempts = 0;
    const connect = () => {
      const host = root.document.getElementById('mini-storage-native-host');
      const shadowRoot = host && host.shadowRoot;
      const app = shadowRoot && shadowRoot.getElementById('app');
      if (!app) {
        if (attempts++ < 100) root.setTimeout(connect, 100);
        return;
      }

      ensureRenewalResponsiveStyle(shadowRoot);

      let scheduled = false;
      const apply = () => {
        if (scheduled) return;
        scheduled = true;
        root.requestAnimationFrame(() => {
          scheduled = false;
          prioritizeRenewal(app);
        });
      };
      prioritizeRenewal(app);
      new root.MutationObserver(apply).observe(app, { childList: true, subtree: true });
    };
    connect();
  }

  return { prioritizeRenewal, ensureRenewalResponsiveStyle, init };
});
