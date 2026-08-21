(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) api.init();
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const LANGUAGE_STORAGE_KEY = 'aiwabot-prototype-language';
  const RECORDS = { leads: 317, validLeads: 276, appointments: 66, deals: 84 };
  const CHANNELS = [
    { key: 'whatsapp', leads: 108, valid: 91, appointments: 24, deals: 27 },
    { key: 'aiwa', leads: 96, valid: 84, appointments: 22, deals: 21 },
    { key: 'miniProgram', leads: 62, valid: 55, appointments: 12, deals: 19 },
    { key: 'phone', leads: 51, valid: 46, appointments: 8, deals: 17 },
  ];
  const COPY = {
    'zh-CN': {
      title: '获客质量与转化预警', period: '本月至今', leads: '新增线索', validRate: '有效线索率', appointmentRate: '预约转化率', dealRate: '成交转化率',
      aiwaLeads: 'AIWA识别线索', opportunities: '已转销售机会', aiwaDeals: '已成交', channelTitle: '渠道转化对比', alertTitle: '转化预警',
      channel: '渠道', leadCount: '线索', valid: '有效率', appointment: '预约率', deal: '成交率',
      channels: { whatsapp: 'WhatsApp', aiwa: 'AIWA会话', miniProgram: '小程序', phone: '电话' },
      alerts: ['48条线索超过24小时未跟进', '23条AIWA高意向会话尚未建立线索', '18位客户预约后7天仍未成交', '17条线索缺少活动或渠道细分标签'],
      source: '数据来自线索池、AIWA会话、预约记录与销售订单；本模块不包含营销费用口径。',
    },
    'zh-HK': {
      title: '獲客質量與轉化預警', period: '本月至今', leads: '新增線索', validRate: '有效線索率', appointmentRate: '預約轉化率', dealRate: '成交轉化率',
      aiwaLeads: 'AIWA識別線索', opportunities: '已轉銷售機會', aiwaDeals: '已成交', channelTitle: '渠道轉化對比', alertTitle: '轉化預警',
      channel: '渠道', leadCount: '線索', valid: '有效率', appointment: '預約率', deal: '成交率',
      channels: { whatsapp: 'WhatsApp', aiwa: 'AIWA會話', miniProgram: '小程式', phone: '電話' },
      alerts: ['48條線索超過24小時未跟進', '23條AIWA高意向會話尚未建立線索', '18位客戶預約後7天仍未成交', '17條線索缺少活動或渠道細分標籤'],
      source: '數據來自線索池、AIWA會話、預約記錄與銷售訂單；本模組不包含營銷費用口徑。',
    },
    en: {
      title: 'Acquisition Quality & Conversion Alerts', period: 'Month to date', leads: 'New Leads', validRate: 'Valid Lead Rate', appointmentRate: 'Appointment Rate', dealRate: 'Deal Conversion',
      aiwaLeads: 'AIWA-identified Leads', opportunities: 'Sales Opportunities', aiwaDeals: 'Closed Deals', channelTitle: 'Channel Conversion', alertTitle: 'Conversion Alerts',
      channel: 'Channel', leadCount: 'Leads', valid: 'Valid', appointment: 'Appt.', deal: 'Deals',
      channels: { whatsapp: 'WhatsApp', aiwa: 'AIWA Conversations', miniProgram: 'Mini Program', phone: 'Phone' },
      alerts: ['48 leads have not been followed up within 24 hours', '23 high-intent AIWA conversations have no lead record', '18 customers remain unconverted 7 days after appointment', '17 leads lack campaign or channel detail tags'],
      source: 'Data comes from the lead pool, AIWA conversations, appointments and sales orders. Marketing spend is not included.',
    },
  };

  function normalizeLanguage(language) {
    return language === 'en' || language === 'zh-HK' ? language : 'zh-CN';
  }

  function percentage(numerator, denominator) {
    return `${(denominator > 0 ? numerator / denominator * 100 : 0).toFixed(1)}%`;
  }

  function calculateMetrics(records) {
    const leads = Number(records.leads) || 0;
    return {
      leads,
      validRate: percentage(Number(records.validLeads) || 0, leads),
      appointmentRate: percentage(Number(records.appointments) || 0, leads),
      dealRate: percentage(Number(records.deals) || 0, leads),
    };
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function buildDashboardMarkup(language) {
    const copy = COPY[normalizeLanguage(language)];
    const metrics = calculateMetrics(RECORDS);
    const metricItems = [
      [copy.leads, metrics.leads], [copy.validRate, metrics.validRate], [copy.appointmentRate, metrics.appointmentRate], [copy.dealRate, metrics.dealRate],
    ];
    const channelRows = CHANNELS.map(item => `<div class="acquisition-channel-row"><b>${escapeHtml(copy.channels[item.key])}</b><span>${item.leads}</span><span>${percentage(item.valid, item.leads)}</span><span>${percentage(item.appointments, item.leads)}</span><span>${percentage(item.deals, item.leads)}</span></div>`).join('');
    return `<header class="home-v2-card-head" data-i18n-skip="true"><b>${escapeHtml(copy.title)}</b><span>${escapeHtml(copy.period)}</span></header>
      <div class="home-v2-card-body acquisition-quality-body" data-i18n-skip="true">
        <div class="acquisition-kpis">${metricItems.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join('')}</div>
        <div class="acquisition-aiwa-strip"><span>${escapeHtml(copy.aiwaLeads)}</span><b>96</b><em>${escapeHtml(copy.opportunities)} 46</em><em>${escapeHtml(copy.aiwaDeals)} 21</em></div>
        <div class="acquisition-insights">
          <section class="acquisition-channel"><header><b>${escapeHtml(copy.channelTitle)}</b><span>317</span></header><div class="acquisition-channel-head"><b>${escapeHtml(copy.channel)}</b><span>${escapeHtml(copy.leadCount)}</span><span>${escapeHtml(copy.valid)}</span><span>${escapeHtml(copy.appointment)}</span><span>${escapeHtml(copy.deal)}</span></div>${channelRows}</section>
          <section class="acquisition-alerts"><header><b>${escapeHtml(copy.alertTitle)}</b><span>${copy.alerts.length}</span></header>${copy.alerts.map((alert, index) => `<div><i>${index + 1}</i><span>${escapeHtml(alert)}</span></div>`).join('')}</section>
        </div>
        <p class="acquisition-source">ⓘ ${escapeHtml(copy.source)}</p>
      </div>`;
  }

  const STYLE = `
    .acquisition-quality-body{display:flex;flex-direction:column;gap:11px}
    .acquisition-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
    .acquisition-kpis>div{padding:10px;border:1px solid var(--border,#eadfeb);border-radius:10px;background:var(--soft-bg,#faf7fb)}
    .acquisition-kpis span,.acquisition-kpis b{display:block}.acquisition-kpis span{font-size:11px;color:var(--muted,#8b7f8f)}.acquisition-kpis b{margin-top:4px;font-size:20px;color:var(--text,#2d2430)}
    .acquisition-aiwa-strip{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:10px;background:linear-gradient(90deg,rgba(151,83,170,.14),rgba(151,83,170,.04));font-size:12px}
    .acquisition-aiwa-strip>span{font-weight:700;color:var(--brand,#9353a5)}.acquisition-aiwa-strip>b{font-size:20px}.acquisition-aiwa-strip em{font-style:normal;color:var(--muted,#817587)}
    .acquisition-insights{display:grid;grid-template-columns:minmax(0,1.28fr) minmax(210px,.72fr);gap:10px;min-height:0}
    .acquisition-insights section{padding:10px;border:1px solid var(--border,#eadfeb);border-radius:10px}
    .acquisition-insights section>header{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px}.acquisition-insights section>header b{font-size:13px}.acquisition-insights section>header span{color:var(--brand,#9353a5);font-size:11px}
    .acquisition-channel-head,.acquisition-channel-row{display:grid;grid-template-columns:1.4fr .55fr .7fr .7fr .7fr;gap:5px;align-items:center;padding:5px 0;font-size:10px;text-align:right}
    .acquisition-channel-head{color:var(--muted,#938797);border-bottom:1px solid var(--border,#eadfeb)}.acquisition-channel-head b,.acquisition-channel-row b{text-align:left}.acquisition-channel-row{border-bottom:1px dashed var(--border,#eadfeb)}.acquisition-channel-row:last-child{border-bottom:0}.acquisition-channel-row b{font-size:11px}.acquisition-channel-row span{color:var(--muted,#766b7a)}
    .acquisition-alerts>div{display:flex;gap:7px;align-items:flex-start;margin:6px 0;padding:6px 7px;border-radius:8px;background:var(--soft-bg,#faf7fb);font-size:10px;line-height:1.4}.acquisition-alerts i{flex:0 0 16px;height:16px;border-radius:50%;background:#f2dfbd;color:#9b6818;font-style:normal;text-align:center;line-height:16px}
    .acquisition-source{margin:0;color:var(--muted,#8b7f8f);font-size:10px;line-height:1.45}
    .theme-dark .acquisition-kpis>div,.theme-dark .acquisition-insights section{--soft-bg:#29232c;--border:#463b49;--text:#f7f1f8;--muted:#b9acbd}
    .theme-dark .acquisition-aiwa-strip{background:linear-gradient(90deg,rgba(184,103,204,.2),rgba(184,103,204,.06));--muted:#b9acbd}
    .theme-dark .acquisition-channel-head,.theme-dark .acquisition-channel-row{--border:#463b49;--muted:#b9acbd}.theme-dark .acquisition-alerts>div{--soft-bg:#29232c}
    @media(max-width:1100px){.acquisition-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.acquisition-insights{grid-template-columns:1fr}}
  `;

  function currentLanguage() {
    try {
      const saved = root.localStorage && root.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved) return normalizeLanguage(saved);
    } catch (_) {}
    return normalizeLanguage(root.document.documentElement.dataset.language || root.document.documentElement.lang);
  }

  function enhance(shadowRoot) {
    const card = shadowRoot.querySelector('.home-v2-marketing-card');
    if (!card) return false;
    const language = currentLanguage();
    if (card.dataset.acquisitionLanguage === language && card.querySelector('.acquisition-quality-body')) return true;
    card.innerHTML = buildDashboardMarkup(language);
    card.dataset.acquisitionLanguage = language;
    return true;
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
      if (!shadowRoot.getElementById('acquisition-quality-dashboard-style')) {
        const style = root.document.createElement('style');
        style.id = 'acquisition-quality-dashboard-style';
        style.textContent = STYLE;
        shadowRoot.appendChild(style);
      }
      let scheduled = false;
      const render = () => {
        if (scheduled) return;
        scheduled = true;
        root.requestAnimationFrame(() => { scheduled = false; enhance(shadowRoot); });
      };
      enhance(shadowRoot);
      new root.MutationObserver(render).observe(app, { childList: true, subtree: true, characterData: true });
    };
    connect();
  }

  return { calculateMetrics, buildDashboardMarkup, init };
});
