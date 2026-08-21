(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) {
    root.AiwaUnitFloorCardDisplay = api;
    if (root.document) api.init();
  }
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const COMPACT_UNIT_CARD_MAX_WIDTH = 1919;

  function isCompactUnitCardViewport(width) {
    return Number(width) <= COMPACT_UNIT_CARD_MAX_WIDTH;
  }

  function classifyUnitSize(size) {
    const squareFeet = Number.parseFloat(String(size || ''));
    if (!Number.isFinite(squareFeet)) return '';
    if (squareFeet <= 12) return '小仓';
    if (squareFeet <= 25) return '中仓';
    return '大仓';
  }

  function getLeaseCountdownMeta(unit, now = new Date()) {
    if (!unit || unit.state !== 'occupied') return { text: '', days: null, urgent: false };
    const match = String(unit.expiry || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return { text: '', days: null, urgent: false };

    const expiryDay = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const currentDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((expiryDay - currentDay) / 86400000);

    if (days > 0) return { text: `余 ${days} 天`, days, urgent: days < 45 };
    if (days === 0) return { text: '今日到期', days, urgent: true };
    return { text: `逾 ${Math.abs(days)} 天`, days, urgent: true };
  }

  function formatLeaseCountdown(unit, now = new Date()) {
    return getLeaseCountdownMeta(unit, now).text;
  }

  function getUnitCardDetails(index, state, expiringCount, now = new Date()) {
    const sizes = ['12 呎', '18 呎', '25 呎', '35 呎'];
    const size = sizes[index % sizes.length];
    const occupied = state === 'occupied';
    const expiry = !occupied
      ? '—'
      : index < expiringCount
        ? `2026-09-${String(12 + index).padStart(2, '0')}`
        : `2027-08-${String(10 + (index % 18)).padStart(2, '0')}`;

    const countdownMeta = getLeaseCountdownMeta({ state, expiry }, now);
    return {
      size,
      sizeType: classifyUnitSize(size),
      expiry,
      countdown: countdownMeta.text,
      urgent: countdownMeta.urgent,
    };
  }

  function getStoreSpaceUnitDetails(index, state, now = new Date()) {
    const number = index + 1;
    const size = ['12 呎', '18 呎', '25 呎', '35 呎'][index % 4];
    const expiry = state === 'occupied'
      ? `2026-${String(9 + (number % 3)).padStart(2, '0')}-${String(10 + (number % 18)).padStart(2, '0')}`
      : '—';
    const countdownMeta = getLeaseCountdownMeta({ state, expiry }, now);
    return {
      size,
      sizeType: classifyUnitSize(size),
      expiry,
      countdown: countdownMeta.text,
      urgent: countdownMeta.urgent,
    };
  }

  const STYLE = `
    .home-unit,.store-plan-unit { min-width:0; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; padding:4px 2px; }
    .home-unit .unit-card-id,.store-plan-unit .unit-card-id { width:100%; overflow:hidden; text-overflow:ellipsis; font-size:clamp(8px,.68vw,10px); font-weight:600; line-height:1.1; letter-spacing:-.03em; white-space:nowrap; }
    .home-unit .unit-card-size,.store-plan-unit .unit-card-size { width:100%; margin:0; overflow:hidden; text-overflow:ellipsis; font-size:clamp(7px,.6vw,9px); line-height:1; color:currentColor; opacity:.72; white-space:nowrap; }
    .home-unit .unit-card-countdown,.store-plan-unit .unit-card-countdown { box-sizing:border-box; width:100%; margin:0; overflow:hidden; text-overflow:ellipsis; padding:0 2px; border-radius:0; background:transparent; color:currentColor; opacity:.68; font-size:clamp(7px,.6vw,9px); font-style:normal; font-weight:600; line-height:1.1; white-space:nowrap; }
    .home-unit .unit-card-countdown.urgent,.store-plan-unit .unit-card-countdown.urgent { width:auto; max-width:calc(100% - 4px); padding:2px 5px; border-radius:8px; background:#fff0f0; color:#c62828; opacity:1; font-weight:700; }
    .theme-dark .home-unit .unit-card-countdown.urgent,.theme-dark .store-plan-unit .unit-card-countdown.urgent { background:rgba(198,40,40,.22); color:#ff8a8a; }
    @media (max-width:${COMPACT_UNIT_CARD_MAX_WIDTH}px) {
      .home-unit,.store-plan-unit { gap:6px; padding:6px 2px; }
      .home-unit .unit-card-size,.store-plan-unit .unit-card-size { display:none; }
      .home-unit .unit-card-id,.store-plan-unit .unit-card-id { font-size:clamp(8px,.72vw,10px); }
      .home-unit .unit-card-countdown,.store-plan-unit .unit-card-countdown { font-size:clamp(7px,.66vw,9px); }
    }
  `;

  function ensureStyle(scope) {
    if (scope.getElementById('aiwa-unit-floor-card-style')) return;
    const style = scope.ownerDocument.createElement('style');
    style.id = 'aiwa-unit-floor-card-style';
    style.textContent = STYLE;
    scope.append(style);
  }

  function unitState(button) {
    if (button.classList.contains('occupied') || button.classList.contains('rented')) return 'occupied';
    if (button.classList.contains('maintenance') || button.classList.contains('repair')) return 'maintenance';
    return ['available', 'reserved', 'disabled'].find(state => button.classList.contains(state)) || 'available';
  }

  function parseExpiringCount(summary) {
    return Number(String(summary || '').match(/(?:将到期|將到期|Expiring)\s*(\d+)/i)?.[1] || 0);
  }

  function renderUnitCard(button, id, details, ownerDocument, signature) {
    if (!id || button.dataset.unitCardSignature === signature) return;
    const idNode = ownerDocument.createElement('strong');
    idNode.className = 'unit-card-id';
    idNode.textContent = id;
    const sizeNode = ownerDocument.createElement('small');
    sizeNode.className = 'unit-card-size';
    sizeNode.textContent = `${details.size} · ${details.sizeType}`;
    const nodes = [idNode, sizeNode];
    if (details.countdown) {
      const countdownNode = ownerDocument.createElement('em');
      countdownNode.className = `unit-card-countdown${details.urgent ? ' urgent' : ''}`;
      countdownNode.textContent = details.countdown;
      nodes.push(countdownNode);
    }
    button.replaceChildren(...nodes);
    button.dataset.unitCardSignature = signature;
    button.setAttribute('title', `${details.size} · ${details.sizeType}`);
    button.setAttribute('aria-label', [id, details.size, details.sizeType, details.countdown].filter(Boolean).join('，'));
  }

  function decorateFloor(scope, now = new Date()) {
    const summary = scope.querySelector?.('.floor-context span')?.textContent || '';
    const expiringCount = parseExpiringCount(summary);
    scope.querySelectorAll?.('.home-unit').forEach((button, index) => {
      const id = button.querySelector('.unit-card-id')?.textContent?.trim()
        || button.textContent.trim();
      const state = unitState(button);
      const details = getUnitCardDetails(index, state, expiringCount, now);
      renderUnitCard(button, id, details, scope.ownerDocument, `home|${id}|${state}|${expiringCount}`);
    });
  }

  function decorateStoreSpace(scope, now = new Date()) {
    scope.querySelectorAll?.('.store-plan-unit').forEach((button, index) => {
      const id = button.querySelector('.unit-card-id')?.textContent?.trim()
        || button.querySelector('span')?.textContent?.trim()
        || button.textContent.trim();
      const state = unitState(button);
      const details = getStoreSpaceUnitDetails(index, state, now);
      renderUnitCard(button, id, details, scope.ownerDocument, `store|${id}|${state}`);
    });
  }

  function init(hostRoot = root) {
    let attempts = 0;
    let connected = false;
    const connect = () => {
      if (connected) return;
      const shadowRoot = hostRoot.document.getElementById('mini-storage-native-host')?.shadowRoot;
      const app = shadowRoot?.getElementById('app');
      if (!app) {
        if (attempts++ < 100) hostRoot.setTimeout(connect, 100);
        return;
      }
      connected = true;
      ensureStyle(shadowRoot);
      let scheduled = false;
      const apply = () => {
        if (scheduled) return;
        scheduled = true;
        hostRoot.requestAnimationFrame(() => {
          scheduled = false;
          decorateFloor(shadowRoot);
          decorateStoreSpace(shadowRoot);
        });
      };
      decorateFloor(shadowRoot);
      decorateStoreSpace(shadowRoot);
      new hostRoot.MutationObserver(apply).observe(shadowRoot, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });
    };
    hostRoot.document.addEventListener('aiwa:ministorage-ready', connect);
    connect();
  }

  return { isCompactUnitCardViewport, classifyUnitSize, getLeaseCountdownMeta, formatLeaseCountdown, getUnitCardDetails, getStoreSpaceUnitDetails, parseExpiringCount, decorateFloor, decorateStoreSpace, ensureStyle, init };
});
