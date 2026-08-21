(function (root, factory) {
  const domain = root.AiwaMiniStorageCustomerServiceDomain
    || (typeof require === 'function' ? require('./customer-service-domain.js') : null);
  const api = factory(root, domain);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AiwaMiniStorageCustomerServiceAdmin = api;
  if (root && root.document && domain) api.init();
})(typeof window !== 'undefined' ? window : globalThis, function (root, domain) {
  'use strict';

  const PAGE_IDS = ['customer-service-online', 'customer-service-phone'];
  const EN = {
    '客户': 'Customer', '销售订单': 'Sales Order', '店铺': 'Store', '工单': 'Work Order', '迷你仓': 'Storage Unit', '迷你箱': 'Mini Box', '合同': 'Contract', '保单': 'Policy',
    '订单': 'Orders', '迷你仓': 'Self Storage', '迷你箱': 'Mini Box', '保险': 'Insurance', '综合咨询': 'General Inquiry',
    'WhatsApp': 'WhatsApp', '企业微信': 'WeCom', '小程序': 'Mini Program', '网页客服': 'Web Chat',
    'AIWA已解决': 'Resolved by AIWA', '待人工跟进': 'Human Follow-up', '超时未处理': 'Overdue',
    '已接通': 'Connected', '未接通': 'No Answer', '拒接': 'Declined', '留言': 'Voicemail', '号码无效': 'Invalid Number', '呼入': 'Inbound', '外呼': 'Outbound',
    '待回拨': 'Callback Due', '待确认': 'Pending Confirmation', '跟进中': 'In Progress', '需核实': 'Needs Verification',
    '未创建': 'Not Created', '待处理': 'Pending', '已逾期': 'Overdue', '已完成': 'Completed', '高': 'High', '中': 'Medium', '低': 'Low',
    '完成签约': 'Complete Signing', '催促配送': 'Delivery Escalation', '续租': 'Renewal', '看仓预约': 'Site Visit', '保障咨询': 'Coverage Inquiry', '工单催办': 'Work Order Escalation', '退租退款': 'Move-out Refund', '新租咨询': 'New Rental Inquiry',
    '新租意向': 'New Rental', '预约确认': 'Appointment Confirmation', '付款提醒': 'Payment Reminder', '工单查询': 'Work Order Inquiry', '满意度回访': 'Satisfaction Survey', '服务回访': 'Service Follow-up',
    '陈小姐': 'Ms. Chan', '黄先生': 'Mr. Wong', '林小姐': 'Ms. Lam', '张小姐': 'Ms. Cheung', '郭小姐': 'Ms. Kwok', '周先生': 'Mr. Chow', '梁先生': 'Mr. Leung', '何先生': 'Mr. Ho',
    '郑先生': 'Mr. Cheng', '叶小姐': 'Ms. Yip', '冯先生': 'Mr. Fung', '罗小姐': 'Ms. Law', '蔡先生': 'Mr. Choi', '杜小姐': 'Ms. To', '马先生': 'Mr. Ma',
    '周嘉怡': 'Kayi Chow', '林凯晴': 'Hoi-ching Lam', '陈晓敏': 'Hiu-man Chan', '郭颖欣': 'Wing-yan Kwok', '何文乐': 'Man-lok Ho', '梁志恒': 'Chi-hang Leung', '黄咏诗': 'Wing-sze Wong',
    '高价值客户': 'High-value Customer', '续租意向': 'Renewal Intent', '价格敏感': 'Price Sensitive', '网页线索': 'Web Lead', '首次未接': 'First No-answer', '预约客户': 'Appointment Customer', '已确认到店': 'Visit Confirmed', '自驾到店': 'Driving to Store',
    '待付款': 'Payment Due', '拒接': 'Declined', '工单客户': 'Work Order Customer', '语音留言': 'Voicemail', '急需回复': 'Urgent Reply', '已完成工单': 'Completed Work Order', '号码无效': 'Invalid Number', '核对联系方式': 'Verify Contact',
    '已退租': 'Moved Out', '服务满意': 'Satisfied', '退款催办': 'Refund Escalation', '新客户': 'New Customer', '高意向': 'High Intent', '观塘': 'Kwun Tong', '预算明确': 'Budget Confirmed',
    '电子签约': 'Electronic Signing', '配送异常': 'Delivery Exception', '加急跟进': 'Urgent Follow-up', '保险客户': 'Insurance Customer',
    '超时跟进': 'Overdue Follow-up', '退租客户': 'Move-out Customer', '退款关注': 'Refund Concern', '方案比较': 'Plan Comparison',
  };
  const EN_SUMMARY = {
    'CHAT-260819-001': 'The customer asked whether payment was received and whether the electronic contract was signed. AIWA verified the payment and found the contract awaiting signature.',
    'CHAT-260819-002': 'A Mini Box delivery missed its booked time. AIWA checked the tracking record and created an urgent work order.',
    'CHAT-260819-003': 'The customer asked about renewal pricing. AIWA presented the current rent and available renewal offer.',
    'CHAT-260819-004': 'The customer checked store hours and booked a site visit. AIWA supplied the address and an available appointment.',
    'CHAT-260819-005': 'The customer asked whether water damage is covered. AIWA supplied the policy summary and claim conditions.',
    'CHAT-260819-006': 'The customer requested a lock-repair update. The work order has no estimated completion time from the site team.',
    'CHAT-260819-007': 'The customer asked about move-out steps and the deposit refund timeline. AIWA explained inspection and refund stages.',
    'CHAT-260819-008': 'The customer compared self-storage and Mini Box options. AIWA recommended an option based on volume and access frequency.',
    'CALL-260819-001': 'Renewal reminder completed; the customer wants to compare six-month and annual offers.',
    'CALL-260819-002': 'First outbound call for a new-rental lead; the call rang without an answer.',
    'CALL-260819-003': 'The customer confirmed the site-visit location and parking arrangements. The voice bot sent store directions.',
    'CALL-260819-004': 'Payment reminder call; the customer answered and ended the call immediately.',
    'CALL-260819-005': 'The customer left a voicemail requesting a repair work-order update.',
    'CALL-260819-006': 'The satisfaction follow-up could not connect because the number is invalid.',
    'CALL-260819-007': 'Move-out follow-up; the customer praised site service but requested a faster deposit refund.',
    'CALL-260819-008': 'The customer asked about a new unit in Kwun Tong. The voice bot recorded the location, size and budget requirements.',
  };
  const EN_ISSUE = {
    'CHAT-260819-002': 'The delivery team must confirm the latest arrival time.', 'CHAT-260819-003': 'Waiting for the customer to confirm the renewal term.',
    'CHAT-260819-005': 'A specialist must verify coverage for special items.', 'CHAT-260819-006': 'The site team has not supplied an estimated completion time.',
    'CHAT-260819-007': 'A staff member must confirm the move-out inspection appointment.',
  };

  const TRADITIONAL = { 客: '客', 户: '戶', 线: '線', 务: '務', 话: '話', 处: '處', 理: '理', 状: '狀', 态: '態', 号: '號', 码: '碼', 录: '錄', 关: '關', 联: '聯', 业: '業', 标: '標', 签: '簽', 约: '約', 单: '單', 仓: '倉', 险: '險', 询: '詢', 问: '問', 题: '題', 责: '責', 负: '負', 结: '結', 过: '過', 滤: '濾', 选: '選', 查: '查', 详: '詳', 见: '見', 创: '創', 建: '建', 跟: '跟', 进: '進', 任: '任', 电: '電', 机: '機', 器: '器', 人: '人', 时: '時', 间: '間', 这: '這', 个: '個', 为: '為', 后: '後', 门: '門', 复: '復', 还: '還', 转: '轉', 开: '開', 对: '對', 话: '話', 经: '經', 销: '銷', 总: '總', 数: '數', 据: '據', 显: '顯', 示: '示', 已: '已', 未: '未', 优: '優', 级: '級', 语: '語', 音: '音', 营: '營', 达: '達', 货: '貨', 价: '價', 格: '格', 资: '資', 讯: '訊' };

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function languageCode(language) {
    return language === 'en' || language === 'zh-HK' ? language : 'zh-CN';
  }

  function toTraditional(value) {
    return Array.from(String(value == null ? '' : value)).map(character => TRADITIONAL[character] || character).join('');
  }

  function localized(value, language, fallback) {
    if (language === 'en') return EN[value] || fallback || (/[\u3400-\u9fff]/.test(String(value || '')) ? '—' : String(value == null ? '' : value));
    return language === 'zh-HK' ? toTraditional(value) : String(value == null ? '' : value);
  }

  function recordView(record, type, language) {
    if (language !== 'en') {
      const view = JSON.parse(JSON.stringify(record));
      if (language === 'zh-HK') {
        const translateObject = value => {
          if (typeof value === 'string') return toTraditional(value);
          if (Array.isArray(value)) return value.map(translateObject);
          if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateObject(item)]));
          return value;
        };
        return translateObject(view);
      }
      return view;
    }
    const view = JSON.parse(JSON.stringify(record));
    view.customer.name = localized(record.customer.name, 'en');
    view.channel = localized(record.channel, 'en');
    view.businessType = localized(record.businessType, 'en');
    view.summary = EN_SUMMARY[record.id] || 'Service summary synchronized by AIWA.';
    view.status = localized(record.status, 'en');
    view.direction = localized(record.direction, 'en');
    view.result = localized(record.result, 'en');
    view.followStatus = localized(record.followStatus, 'en');
    view.owner = localized(record.owner, 'en');
    view.unresolved = EN_ISSUE[record.id] || '';
    if (view.intent) {
      view.intent.type = localized(record.intent.type, 'en', 'Customer Intent');
      view.intent.evidence = 'Intent evidence captured by AIWA.';
    }
    view.objection = record.objection ? 'Customer objection captured in the call summary.' : '';
    view.references = (record.references || []).map(item => ({ type: localized(item.type, 'en', 'Business Record'), id: item.id, canonicalType: item.type }));
    view.messages = (record.messages || []).map((item, index) => ({ role: item.role === '客户' ? 'Customer' : 'AIWA', text: `Key conversation message ${index + 1}.` }));
    view.queryLogs = (record.queryLogs || []).map(item => ({ target: item.target, purpose: 'Business status query', time: item.time, result: 'Result synchronized from the business record.' }));
    view.snippets = (record.snippets || []).map((_, index) => `Key call excerpt ${index + 1}.`);
    if (view.tags) view.tags = Object.fromEntries(Object.entries(view.tags).map(([key, values]) => [key, values.map(value => localized(value, 'en', 'Customer Tag'))]));
    if (view.task) {
      view.task.title = view.task.status === '未创建' ? 'No follow-up task created' : 'Follow-up task';
      view.task.owner = localized(view.task.owner, 'en');
      view.task.status = localized(view.task.status, 'en');
      view.task.priority = localized(view.task.priority, 'en');
    }
    return view;
  }

  function buildMenuMarkup(language) {
    const copy = domain.copyForLanguage(languageCode(language));
    return `<li class="el-sub-menu is-opened customer-service-menu" data-customer-service-language="${escapeHtml(languageCode(language))}">
      <div class="el-sub-menu__title customer-service-menu-title" role="button" tabindex="0" aria-expanded="true">
        <span class="menu-icon customer-service-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 13v-2a8 8 0 0 1 16 0v2M4 13H2v5h4v-5zm16 0h2v5h-4v-5zM18 20c-1 1-2.5 1.5-4 1.5"/></svg></span><span>${escapeHtml(copy.menu)}</span><i class="el-sub-menu__icon-arrow"></i>
      </div>
      <ul class="el-menu el-menu--inline customer-service-submenu">
        <li class="el-menu-item" data-customer-service-page="customer-service-online" role="menuitem">${escapeHtml(copy.online)}</li>
        <li class="el-menu-item" data-customer-service-page="customer-service-phone" role="menuitem">${escapeHtml(copy.phone)}</li>
      </ul>
    </li>`;
  }

  function buildOuterMenuMarkup(language) {
    const normalizedLanguage = languageCode(language);
    const copy = domain.copyForLanguage(normalizedLanguage);
    return `<div class="mini-storage-category customer-service-outer-menu" data-customer-service-language="${escapeHtml(normalizedLanguage)}">
      <button class="mini-storage-category-toggle" type="button" data-mini-storage-category-toggle aria-expanded="true"><i data-lucide="headphones"></i><span>${escapeHtml(copy.menu)}</span><i data-lucide="chevron-down"></i></button>
      <div class="mini-storage-category-subnav"><button type="button" data-mini-storage-page="customer-service-online">${escapeHtml(copy.online)}</button><button type="button" data-mini-storage-page="customer-service-phone">${escapeHtml(copy.phone)}</button></div>
    </div>`;
  }

  function metricValues(type, records) {
    const metrics = domain.getMetrics(type, records);
    return type === 'phone' ? [metrics.today, metrics.connectionRate, metrics.validIntent, metrics.callback] : [metrics.today, metrics.resolved, metrics.pending, metrics.overdue];
  }

  function buildMetricsMarkup(type, language, records) {
    const copy = domain.copyForLanguage(language);
    return copy.metrics[type].map((label, index) => `<article><span>${escapeHtml(label)}</span><b>${escapeHtml(metricValues(type, records)[index])}</b></article>`).join('');
  }

  function optionMarkup(records, key, language) {
    const copy = domain.copyForLanguage(language);
    const values = [...new Set(records.map(record => key === 'intent' ? record.intent?.type : record[key]).filter(Boolean))];
    return `<option value="">${escapeHtml(copy.filters.all)}</option>${values.map(value => `<option value="${encodeURIComponent(value)}">${escapeHtml(localized(value, language, language === 'en' ? 'Other' : value))}</option>`).join('')}`;
  }

  function buildFiltersMarkup(type, language, records) {
    const copy = domain.copyForLanguage(language);
    const fields = type === 'phone' ? ['direction', 'result', 'robot', 'followStatus'] : ['channel', 'businessType', 'intent', 'status', 'owner'];
    return `<input type="search" data-cs-filter="keyword" placeholder="${escapeHtml(copy.filters.keyword)}" aria-label="${escapeHtml(copy.filters.keyword)}">
      ${fields.map(key => `<label><span>${escapeHtml(copy.filters[key])}</span><select data-cs-filter="${key}">${optionMarkup(records, key, language)}</select></label>`).join('')}
      <button type="button" class="cs-button ghost" data-cs-action="reset">${escapeHtml(copy.filters.reset)}</button>`;
  }

  function referenceMarkup(references, language) {
    return (references || []).map(item => {
      const label = localized(item.type, language, language === 'en' ? 'Business Record' : item.type);
      return `<button type="button" class="cs-reference" data-business-type="${encodeURIComponent(item.canonicalType || item.type)}" data-business-id="${escapeHtml(item.id)}">${escapeHtml(label)} · ${escapeHtml(item.id)}</button>`;
    }).join('');
  }

  function buildRowsMarkup(type, language, records) {
    const copy = domain.copyForLanguage(language);
    return records.map(source => {
      const item = recordView(source, type, language);
      const createdAt = source.startedAt || source.createdAt || source.time || '—';
      if (type === 'phone') {
        return `<tr class="customer-service-row" data-record-id="${escapeHtml(item.id)}"><td><b>${escapeHtml(item.id)}</b></td><td>${escapeHtml(createdAt)}</td><td><b>${escapeHtml(item.customer.name)}</b><small>${escapeHtml(item.customer.id)} · ${escapeHtml(item.customer.phone)}</small></td><td>${escapeHtml(item.direction)}</td><td>${escapeHtml(item.robot)}</td><td>${escapeHtml(item.duration)}</td><td><span class="cs-status">${escapeHtml(item.result)}</span></td><td><div class="cs-clamp">${escapeHtml(item.summary)}</div></td><td><div class="cs-clamp">${escapeHtml(item.task.title)}</div></td><td><button type="button" class="cs-link" data-cs-action="detail" data-record-id="${escapeHtml(item.id)}">${escapeHtml(copy.actions.view)}</button></td></tr>`;
      }
      const tags = Object.values(item.tags || {}).flat().slice(0, 2).map(tag => `<span class="cs-tag">${escapeHtml(tag)}</span>`).join('');
      return `<tr class="customer-service-row" data-record-id="${escapeHtml(item.id)}"><td><b>${escapeHtml(item.id)}</b></td><td>${escapeHtml(createdAt)}</td><td><b>${escapeHtml(item.customer.name)}</b><small>${escapeHtml(item.customer.id)} · ${escapeHtml(item.customer.phone)}</small></td><td>${tags}</td><td>${escapeHtml(item.channel)}</td><td><div class="cs-clamp">${escapeHtml(item.summary)}</div></td><td><span class="cs-tag intent">${escapeHtml(item.intent.type)}</span></td><td><div class="cs-references">${referenceMarkup(item.references, language)}</div></td><td><div class="cs-clamp">${escapeHtml(item.unresolved || '—')}</div></td><td><div class="cs-clamp">${escapeHtml(item.task.title)}</div></td><td>${escapeHtml(item.owner)}</td><td>${escapeHtml(item.lastAt)}</td><td><button type="button" class="cs-link" data-cs-action="detail" data-record-id="${escapeHtml(item.id)}">${escapeHtml(copy.actions.view)}</button></td></tr>`;
    }).join('');
  }

  function tableHeaders(type, copy) {
    const keys = type === 'phone'
      ? ['record', 'createdAt', 'customer', 'direction', 'robot', 'duration', 'result', 'summary', 'task', 'action']
      : ['record', 'createdAt', 'customer', 'tags', 'channel', 'summary', 'intent', 'business', 'issue', 'task', 'owner', 'time', 'action'];
    return keys.map(key => `<th>${escapeHtml(copy.columns[key])}</th>`).join('');
  }

  const DEFAULT_PAGE_SIZE = 5;

  function paginateRecords(records, requestedPage, pageSize = DEFAULT_PAGE_SIZE) {
    const total = records.length;
    const normalizedPageSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(total / normalizedPageSize));
    const currentPage = Math.min(totalPages, Math.max(1, Number(requestedPage) || 1));
    const start = (currentPage - 1) * normalizedPageSize;
    return { records: records.slice(start, start + normalizedPageSize), currentPage, totalPages, total, pageSize: normalizedPageSize };
  }

  function buildPaginationMarkup(language, pagination) {
    const copy = domain.copyForLanguage(languageCode(language));
    const totalLabel = copy.pagination.total.replace('{count}', String(pagination.total));
    const pages = Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map(page => `<button type="button" class="${page === pagination.currentPage ? 'active' : ''}" data-cs-action="page" data-page="${page}" aria-current="${page === pagination.currentPage ? 'page' : 'false'}">${page}</button>`).join('');
    return `<nav class="customer-service-pagination" aria-label="${escapeHtml(copy.pagination.label)}"${pagination.total === 0 ? ' hidden' : ''}><span>${escapeHtml(totalLabel)}</span><div><button type="button" data-cs-action="page" data-page="${pagination.currentPage - 1}" aria-label="${escapeHtml(copy.pagination.previous)}"${pagination.currentPage === 1 ? ' disabled' : ''}>‹</button>${pages}<button type="button" data-cs-action="page" data-page="${pagination.currentPage + 1}" aria-label="${escapeHtml(copy.pagination.next)}"${pagination.currentPage === pagination.totalPages ? ' disabled' : ''}>›</button></div></nav>`;
  }

  function drawerSkeleton(type, copy) {
    const sections = type === 'phone'
      ? [copy.detail.call, copy.detail.summary, copy.detail.intent, copy.detail.snippets, copy.detail.recording, copy.detail.business, copy.detail.nextTask]
      : [copy.detail.conversation, copy.detail.summary, copy.detail.intent, copy.detail.issue, copy.detail.messages, copy.detail.queries, copy.detail.nextTask];
    return `<div class="customer-service-drawer-sections">${sections.map(section => `<span>${escapeHtml(section)}</span>`).join('')}</div>`;
  }

  function buildPageMarkup(type, language, state) {
    const normalizedType = type === 'phone' ? 'phone' : 'online';
    const normalizedLanguage = languageCode(language);
    const copy = domain.copyForLanguage(normalizedLanguage);
    const records = state[normalizedType] || [];
    const pagination = paginateRecords(records, 1);
    const title = normalizedType === 'phone' ? copy.phone : copy.online;
    return `<section class="customer-service-page" data-customer-service-type="${normalizedType}" data-customer-service-language="${normalizedLanguage}" data-i18n-skip="true">
      <header class="customer-service-header"><div><span>AIWA · ONE STORAGE</span><h1>${escapeHtml(title)}</h1></div><em>${records.length}</em></header>
      <div class="customer-service-metrics">${buildMetricsMarkup(normalizedType, normalizedLanguage, records)}</div>
      <div class="customer-service-filter">${buildFiltersMarkup(normalizedType, normalizedLanguage, records)}</div>
      <div class="customer-service-table"><table><thead><tr>${tableHeaders(normalizedType, copy)}</tr></thead><tbody class="customer-service-table-body">${buildRowsMarkup(normalizedType, normalizedLanguage, pagination.records)}</tbody></table><div class="customer-service-empty" hidden>${escapeHtml(copy.messages.empty)}</div></div>
      ${buildPaginationMarkup(normalizedLanguage, pagination)}
      <div class="customer-service-drawer" aria-hidden="true"><button class="cs-overlay" type="button" data-cs-action="close-detail" aria-label="${escapeHtml(copy.actions.close)}"></button><aside><header><b>${escapeHtml(copy.actions.view)}</b><button type="button" data-cs-action="close-detail">×</button></header><div class="customer-service-drawer-body">${drawerSkeleton(normalizedType, copy)}</div></aside></div>
      <div class="customer-service-task-dialog" aria-hidden="true"><button class="cs-overlay" type="button" data-cs-action="close-task" aria-label="${escapeHtml(copy.actions.cancel)}"></button><form><header><b>${escapeHtml(normalizedType === 'phone' ? copy.task.callback : copy.task.create)}</b><button type="button" data-cs-action="close-task">×</button></header><input type="hidden" name="recordId"><label>${escapeHtml(copy.task.title)}<input name="title" required></label><label>${escapeHtml(copy.task.owner)}<input name="owner" required></label><label>${escapeHtml(copy.task.dueAt)}<input name="dueAt" type="datetime-local" required></label><label>${escapeHtml(copy.task.priority)}<select name="priority" required><option value="${encodeURIComponent('高')}">${escapeHtml(copy.task.high)}</option><option value="${encodeURIComponent('中')}">${escapeHtml(copy.task.medium)}</option><option value="${encodeURIComponent('低')}">${escapeHtml(copy.task.low)}</option></select></label><footer><button type="button" class="cs-button ghost" data-cs-action="close-task">${escapeHtml(copy.actions.cancel)}</button><button type="submit" class="cs-button primary">${escapeHtml(copy.actions.save)}</button></footer></form></div>
      <div class="customer-service-toast" role="status" aria-live="polite"></div>
    </section>`;
  }

  function sectionHtml(title, content) {
    return `<section class="cs-detail-section"><h3>${escapeHtml(title)}</h3>${content}</section>`;
  }

  function detailsGrid(items) {
    return `<div class="cs-detail-grid">${items.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value || '—')}</b></div>`).join('')}</div>`;
  }

  function buildDetailMarkup(type, language, source) {
    const copy = domain.copyForLanguage(language);
    const item = recordView(source, type, language);
    const createdAt = source.startedAt || source.createdAt || source.time || '—';
    const common = type === 'phone'
      ? detailsGrid([[copy.columns.record, item.id], [copy.columns.createdAt, createdAt], [copy.columns.customer, `${item.customer.name} · ${item.customer.id}`], [copy.columns.direction, item.direction], [copy.columns.robot, item.robot], [copy.columns.result, item.result], [copy.columns.duration, item.duration]])
      : detailsGrid([[copy.columns.record, item.id], [copy.columns.createdAt, createdAt], [copy.columns.customer, `${item.customer.name} · ${item.customer.id}`], [copy.columns.channel, item.channel], [copy.columns.owner, item.owner], [copy.columns.time, item.lastAt], [copy.filters.status, item.status]]);
    const intent = detailsGrid([[copy.columns.intent, item.intent?.type], ['Confidence', `${item.intent?.confidence || 0}%`], ['Evidence', item.intent?.evidence], ['Objection', item.objection || '—']]);
    const business = `<div class="cs-references">${referenceMarkup(item.references, language)}</div>`;
    const task = detailsGrid([[copy.columns.task, item.task?.title], [copy.task.owner, item.task?.owner], [copy.task.dueAt, item.task?.dueAt], [copy.filters.status, item.task?.status], [copy.task.priority, item.task?.priority]]);
    let body = sectionHtml(type === 'phone' ? copy.detail.call : copy.detail.conversation, common)
      + sectionHtml(copy.detail.summary, `<p>${escapeHtml(item.summary)}</p>`)
      + sectionHtml(copy.detail.intent, intent);
    if (type === 'phone') {
      body += sectionHtml(copy.detail.snippets, `<ul>${(item.snippets || []).map(text => `<li>${escapeHtml(text)}</li>`).join('')}</ul><small>${escapeHtml(copy.detail.recording)} · ${escapeHtml(item.recordingId)}</small>`)
        + sectionHtml(copy.detail.business, business) + sectionHtml(copy.detail.nextTask, task);
    } else {
      body += sectionHtml(copy.detail.issue, `<p>${escapeHtml(item.unresolved || '—')}</p>`)
        + sectionHtml(copy.detail.messages, `<ul>${(item.messages || []).map(message => `<li><b>${escapeHtml(message.role)}</b><span>${escapeHtml(message.text)}</span></li>`).join('')}</ul>`)
        + sectionHtml(copy.detail.queries, `<div class="cs-query-log">${(item.queryLogs || []).map(log => `<div><b>${escapeHtml(log.target)}</b><span>${escapeHtml(log.purpose)}</span><small>${escapeHtml(log.time)} · ${escapeHtml(log.result)}</small></div>`).join('')}</div>`)
        + sectionHtml(copy.detail.business, business) + sectionHtml(copy.detail.nextTask, task);
    }
    return `${body}<footer class="cs-drawer-actions"><button type="button" class="cs-button ghost" data-cs-action="close-detail">${escapeHtml(copy.actions.close)}</button><button type="button" class="cs-button ghost" data-cs-action="customer" data-customer-id="${escapeHtml(source.customer.id)}">${escapeHtml(copy.actions.customer)}</button><button type="button" class="cs-button primary" data-cs-action="open-task" data-record-id="${escapeHtml(source.id)}">${escapeHtml(type === 'phone' ? copy.task.callback : copy.task.create)}</button></footer>`;
  }

  function buildSectionUrl(href, page) {
    const url = new URL(href);
    url.searchParams.set('section', page);
    return url.toString();
  }

  const STYLE = `
    .customer-service-menu-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8}.customer-service-menu .customer-service-submenu{display:block}.customer-service-menu:not(.is-opened) .customer-service-submenu{display:none}.customer-service-menu .el-sub-menu__icon-arrow{transition:transform .2s}.customer-service-menu.is-opened .el-sub-menu__icon-arrow{transform:rotate(180deg)}
    .main.customer-service-active{padding:0!important;overflow:auto!important;background:#f5f6f8}.main.customer-service-active>:not(#customer-service-admin-root){display:none!important}#customer-service-admin-root{min-height:100%;display:block}
    .customer-service-page{--cs-brand:#8d4da2;--cs-brand-soft:#f5edf7;--cs-bg:#f5f6f8;--cs-card:#fff;--cs-line:#e5e7eb;--cs-text:#24262d;--cs-muted:#737885;min-height:100%;padding:26px;color:var(--cs-text);background:var(--cs-bg);box-sizing:border-box;font-size:14px}.customer-service-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:18px}.customer-service-header span{color:var(--cs-brand);font-size:12px;font-weight:700;letter-spacing:.08em}.customer-service-header h1{margin:5px 0 0;font-size:26px}.customer-service-header em{padding:7px 12px;border-radius:18px;color:var(--cs-brand);background:var(--cs-brand-soft);font-style:normal;font-weight:700}
    .customer-service-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}.customer-service-metrics article{padding:16px 18px;border:1px solid var(--cs-line);border-radius:13px;background:var(--cs-card);box-shadow:0 4px 14px rgba(29,25,33,.04)}.customer-service-metrics span,.customer-service-metrics b{display:block}.customer-service-metrics span{color:var(--cs-muted);font-size:14px}.customer-service-metrics b{margin-top:7px;font-size:26px}
    .customer-service-filter{display:flex;align-items:flex-end;gap:9px;padding:13px;margin-bottom:14px;border:1px solid var(--cs-line);border-radius:13px;background:var(--cs-card);overflow:auto}.customer-service-filter>input{min-width:220px}.customer-service-filter label{display:grid;gap:4px;min-width:125px}.customer-service-filter label span{color:var(--cs-muted);font-size:12px}.customer-service-filter input,.customer-service-filter select,.customer-service-task-dialog input,.customer-service-task-dialog select{height:36px;padding:0 10px;border:1px solid var(--cs-line);border-radius:8px;color:var(--cs-text);background:var(--cs-card);outline:0;font-size:14px}.customer-service-filter input:focus,.customer-service-filter select:focus,.customer-service-task-dialog input:focus,.customer-service-task-dialog select:focus{border-color:var(--cs-brand);box-shadow:0 0 0 2px color-mix(in srgb,var(--cs-brand) 18%,transparent)}
    .customer-service-table{position:relative;border:1px solid var(--cs-line);border-radius:13px;background:var(--cs-card);overflow:auto}.customer-service-table table{width:100%;min-width:1660px;border-collapse:collapse;font-size:14px}.customer-service-table th{position:sticky;top:0;z-index:1;padding:12px 10px;color:var(--cs-muted);background:color-mix(in srgb,var(--cs-card) 96%,var(--cs-brand) 4%);text-align:left;white-space:nowrap;font-size:13px}.customer-service-table td{max-width:210px;padding:13px 10px;border-top:1px solid var(--cs-line);vertical-align:top}.customer-service-table td b,.customer-service-table td small{display:block}.customer-service-table td small{margin-top:4px;color:var(--cs-muted);font-size:12px}.customer-service-row:hover{background:var(--cs-brand-soft)}.cs-clamp{line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.cs-tag,.cs-status{display:inline-block;margin:1px 3px 1px 0;padding:3px 7px;border-radius:10px;color:var(--cs-brand);background:var(--cs-brand-soft);font-size:12px}.cs-reference,.cs-link{padding:0;border:0;color:var(--cs-brand);background:transparent;cursor:pointer;text-align:left}.cs-reference{display:block;margin:2px 0;font-size:12px}.cs-link{white-space:nowrap;font-weight:700}.customer-service-empty{padding:40px;text-align:center;color:var(--cs-muted)}.customer-service-pagination{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:12px;padding:10px 12px;border:1px solid var(--cs-line);border-radius:11px;color:var(--cs-muted);background:var(--cs-card);font-size:13px}.customer-service-pagination>div{display:flex;gap:6px}.customer-service-pagination button{min-width:32px;height:32px;padding:0 9px;border:1px solid var(--cs-line);border-radius:8px;color:var(--cs-text);background:var(--cs-card);cursor:pointer}.customer-service-pagination button:hover:not(:disabled),.customer-service-pagination button.active{border-color:var(--cs-brand);color:#fff;background:var(--cs-brand)}.customer-service-pagination button:disabled{cursor:not-allowed;opacity:.42}
    .customer-service-drawer,.customer-service-task-dialog{position:fixed;inset:0;z-index:80;display:none}.customer-service-drawer.open,.customer-service-task-dialog.open{display:block}.cs-overlay{position:absolute;inset:0;width:100%;height:100%;border:0;background:rgba(20,16,22,.48)}.customer-service-drawer>aside{position:absolute;top:0;right:0;width:min(920px,92vw);height:100%;display:flex;flex-direction:column;background:var(--cs-card);box-shadow:-16px 0 42px rgba(0,0,0,.18)}.customer-service-drawer>aside>header,.customer-service-task-dialog form>header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--cs-line)}.customer-service-drawer header button,.customer-service-task-dialog header button{width:32px;height:32px;border:0;border-radius:8px;color:var(--cs-muted);background:transparent;font-size:22px;cursor:pointer}.customer-service-drawer-body{padding:18px 22px;overflow:auto}.customer-service-drawer-sections{display:flex;flex-wrap:wrap;gap:7px}.customer-service-drawer-sections span{padding:6px 9px;border-radius:8px;background:var(--cs-brand-soft);color:var(--cs-brand);font-size:11px}.cs-detail-section{margin-bottom:12px;padding:15px;border:1px solid var(--cs-line);border-radius:11px}.cs-detail-section h3{margin:0 0 11px;font-size:14px}.cs-detail-section p{margin:0;color:var(--cs-muted);line-height:1.65}.cs-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.cs-detail-grid div{padding:9px;border-radius:8px;background:var(--cs-bg)}.cs-detail-grid span,.cs-detail-grid b{display:block}.cs-detail-grid span{color:var(--cs-muted);font-size:10px}.cs-detail-grid b{margin-top:4px;font-size:12px}.cs-detail-section ul{margin:0;padding-left:20px}.cs-detail-section li{margin:6px 0}.cs-detail-section li b,.cs-detail-section li span{display:block}.cs-query-log{display:grid;gap:8px}.cs-query-log>div{display:grid;grid-template-columns:140px 160px 1fr;gap:8px;padding:8px;border-radius:8px;background:var(--cs-bg)}.cs-query-log small{color:var(--cs-muted)}.cs-drawer-actions{position:sticky;bottom:-18px;display:flex;justify-content:flex-end;gap:8px;margin:18px -22px -18px;padding:14px 22px;border-top:1px solid var(--cs-line);background:var(--cs-card)}
    .customer-service-task-dialog form{position:absolute;top:50%;left:50%;width:min(520px,90vw);padding-bottom:18px;border-radius:14px;background:var(--cs-card);box-shadow:0 20px 60px rgba(0,0,0,.24);transform:translate(-50%,-50%)}.customer-service-task-dialog form>label{display:grid;gap:6px;margin:13px 22px;color:var(--cs-muted);font-size:12px}.customer-service-task-dialog form>footer{display:flex;justify-content:flex-end;gap:8px;margin:18px 22px 0}.cs-button{height:36px;padding:0 15px;border:1px solid var(--cs-line);border-radius:8px;cursor:pointer}.cs-button.ghost{color:var(--cs-text);background:var(--cs-card)}.cs-button.primary{border-color:var(--cs-brand);color:#fff;background:var(--cs-brand)}.customer-service-toast{position:fixed;right:28px;bottom:28px;z-index:100;padding:11px 15px;border-radius:9px;color:#fff;background:#2f9b62;opacity:0;pointer-events:none;transform:translateY(8px);transition:.2s}.customer-service-toast.show{opacity:1;transform:none}
    .theme-dark .customer-service-page{--cs-bg:#1f1b22;--cs-card:#29232c;--cs-line:#473c4a;--cs-text:#f3edf4;--cs-muted:#b9adbc;--cs-brand:#d2a1df;--cs-brand-soft:#392c3f}.theme-dark .customer-service-drawer>aside,.theme-dark .customer-service-task-dialog form{color-scheme:dark}
    @media(max-width:1100px){.customer-service-page{padding:18px}.customer-service-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.cs-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;

  function currentLanguage(hostVm) {
    return languageCode(hostVm?.systemLanguage || root.document?.documentElement?.dataset?.language || root.document?.documentElement?.lang);
  }

  function isCustomerPage(page) {
    return PAGE_IDS.includes(page);
  }

  function applyCustomerServiceVisibility(main, pageRoot, visible) {
    if (visible) main.classList.add('customer-service-active');
    else main.classList.remove('customer-service-active');
    pageRoot.hidden = !visible;
    pageRoot.style.display = visible ? 'block' : 'none';
  }

  function mountCustomerService(shadowRoot, hostVm) {
    if (!shadowRoot || !hostVm) return null;
    const app = shadowRoot.getElementById('app');
    const main = shadowRoot.querySelector('.main');
    if (!app || !main) return null;
    if (!shadowRoot.getElementById('customer-service-admin-style')) {
      const style = root.document.createElement('style');
      style.id = 'customer-service-admin-style';
      style.textContent = STYLE;
      shadowRoot.appendChild(style);
    }
    let pageRoot = shadowRoot.getElementById('customer-service-admin-root');
    if (!pageRoot) {
      pageRoot = root.document.createElement('div');
      pageRoot.id = 'customer-service-admin-root';
      main.appendChild(pageRoot);
    }
    const state = domain.createState();
    let activeType = 'online';
    let activeRecordId = '';
    let currentPage = 1;
    let toastTimer = 0;
    let liveShadowRoot = shadowRoot;
    const syncPageRoot = () => {
      liveShadowRoot = root.document.getElementById('mini-storage-native-host')?.shadowRoot || liveShadowRoot;
      pageRoot = liveShadowRoot.getElementById('customer-service-admin-root') || pageRoot;
      return pageRoot;
    };

    const bindMenu = menu => {
      if (!menu || menu.dataset.customerServiceBound) return;
      menu.dataset.customerServiceBound = '1';
      menu.querySelector('.customer-service-menu-title')?.addEventListener('click', () => {
        menu.classList.toggle('is-opened');
        menu.querySelector('.customer-service-menu-title')?.setAttribute('aria-expanded', String(menu.classList.contains('is-opened')));
      });
      menu.addEventListener('click', event => {
        const target = event.target.closest('[data-customer-service-page]');
        if (!target) return;
        navigate(target.dataset.customerServicePage);
      });
    };

    const ensureOuterMenu = () => {
      const visibleNav = root.document.querySelector('#ec-mini-storage-group > .ec-center-subnav');
      if (!visibleNav) return;
      const language = currentLanguage(hostVm);
      let menu = visibleNav.querySelector(':scope > .customer-service-outer-menu');
      if (menu && menu.dataset.customerServiceLanguage !== language) {
        menu.remove();
        menu = null;
      }
      if (!menu) {
        const holder = root.document.createElement('div');
        holder.innerHTML = buildOuterMenuMarkup(language).trim();
        menu = holder.firstElementChild;
        const agreement = Array.from(visibleNav.children).find(item => /合约与保险|合約與保險|Contracts\s*&\s*Insurance/i.test(item.textContent));
        if (agreement) visibleNav.insertBefore(menu, agreement);
        else {
          const profile = Array.from(visibleNav.children).find(item => /客户档案|客戶檔案|Customer Profiles/i.test(item.textContent));
          profile?.after(menu);
          if (!menu.isConnected) visibleNav.appendChild(menu);
        }
        root.lucide?.createIcons?.();
      }
      menu.querySelectorAll('[data-mini-storage-page]').forEach(item => item.classList.toggle('active', item.dataset.miniStoragePage === hostVm.activePage));
      menu.classList.toggle('active', isCustomerPage(hostVm.activePage));
    };

    const ensureMenu = () => {
      ensureOuterMenu();
      const nativeMenu = shadowRoot.querySelector('.aside > .el-menu, .aside .el-menu');
      if (!nativeMenu) return;
      const language = currentLanguage(hostVm);
      let menu = nativeMenu.querySelector(':scope > .customer-service-menu');
      if (menu && menu.dataset.customerServiceLanguage !== language) {
        menu.remove();
        menu = null;
      }
      if (!menu) {
        const holder = root.document.createElement('div');
        holder.innerHTML = buildMenuMarkup(language).trim();
        menu = holder.firstElementChild;
        const agreement = Array.from(nativeMenu.children).find(item => /合约与保险|合約與保險|Contracts\s*&\s*Insurance/i.test(item.textContent));
        if (agreement) nativeMenu.insertBefore(menu, agreement);
        else {
          const profile = Array.from(nativeMenu.children).find(item => /客户档案|客戶檔案|Customer Profiles/i.test(item.textContent));
          profile?.after(menu);
          if (!menu.isConnected) nativeMenu.appendChild(menu);
        }
      }
      bindMenu(menu);
      menu.querySelectorAll('[data-customer-service-page]').forEach(item => item.classList.toggle('is-active', item.dataset.customerServicePage === hostVm.activePage));
    };

    const filtersFromPage = () => Object.fromEntries(Array.from(pageRoot.querySelectorAll('[data-cs-filter]')).map(input => [input.dataset.csFilter, input.tagName === 'SELECT' && input.value ? decodeURIComponent(input.value) : input.value]));
    const filteredRecords = () => domain.filterRecords(activeType, state[activeType], filtersFromPage());
    const refreshList = () => {
      syncPageRoot();
      const language = currentLanguage(hostVm);
      const records = filteredRecords();
      const pagination = paginateRecords(records, currentPage);
      currentPage = pagination.currentPage;
      const metrics = pageRoot.querySelector('.customer-service-metrics');
      const tbody = pageRoot.querySelector('.customer-service-table-body');
      const empty = pageRoot.querySelector('.customer-service-empty');
      const paginationRoot = pageRoot.querySelector('.customer-service-pagination');
      if (metrics) metrics.innerHTML = buildMetricsMarkup(activeType, language, records);
      if (tbody) tbody.innerHTML = buildRowsMarkup(activeType, language, pagination.records);
      if (empty) empty.hidden = records.length > 0;
      if (paginationRoot) paginationRoot.outerHTML = buildPaginationMarkup(language, pagination);
    };

    const renderPage = page => {
      syncPageRoot();
      ensureMenu();
      if (!isCustomerPage(page)) {
        applyCustomerServiceVisibility(main, pageRoot, false);
        return;
      }
      activeType = page === 'customer-service-phone' ? 'phone' : 'online';
      currentPage = 1;
      pageRoot.innerHTML = buildPageMarkup(activeType, currentLanguage(hostVm), state);
      applyCustomerServiceVisibility(main, pageRoot, true);
      ensureMenu();
      main.scrollTop = 0;
    };

    const updateUrl = page => {
      if (!root.location || !root.history?.replaceState) return;
      root.history.replaceState(root.history.state, '', buildSectionUrl(root.location.href, page));
    };

    function navigate(page) {
      if (!isCustomerPage(page)) return;
      if (root.__aiwaMiniStorageActivePage && 'value' in root.__aiwaMiniStorageActivePage) root.__aiwaMiniStorageActivePage.value = page;
      else hostVm.activePage = page;
      updateUrl(page);
      renderPage(page);
    }

    function routeTo(page, id) {
      hostVm.globalKeyword = id || '';
      if (typeof hostVm.selectPage === 'function') hostVm.selectPage(page);
      else hostVm.activePage = page;
      if (root.location && root.history?.replaceState) root.history.replaceState(root.history.state, '', buildSectionUrl(root.location.href, page));
      renderPage(page);
    }

    const closeLayer = selector => {
      const layer = pageRoot.querySelector(selector);
      layer?.classList.remove('open');
      layer?.setAttribute('aria-hidden', 'true');
    };
    const showToast = message => {
      const toast = pageRoot.querySelector('.customer-service-toast');
      if (!toast) return;
      clearTimeout(toastTimer);
      toast.textContent = message;
      toast.classList.add('show');
      toastTimer = root.setTimeout(() => toast.classList.remove('show'), 2200);
    };
    const openDetail = recordId => {
      const record = state[activeType].find(item => item.id === recordId);
      const drawer = pageRoot.querySelector('.customer-service-drawer');
      if (!record || !drawer) return;
      activeRecordId = recordId;
      drawer.querySelector('.customer-service-drawer-body').innerHTML = buildDetailMarkup(activeType, currentLanguage(hostVm), record);
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    };
    const openTask = recordId => {
      const record = state[activeType].find(item => item.id === recordId);
      const dialog = pageRoot.querySelector('.customer-service-task-dialog');
      if (!record || !dialog) return;
      const form = dialog.querySelector('form');
      form.elements.recordId.value = recordId;
      form.elements.title.value = record.task?.status === '未创建' ? '' : record.task.title;
      form.elements.owner.value = record.task?.owner === '—' ? record.owner || '' : record.task?.owner || record.owner || '';
      form.elements.dueAt.value = '';
      dialog.classList.add('open');
      dialog.setAttribute('aria-hidden', 'false');
    };

    shadowRoot.addEventListener('input', event => {
      syncPageRoot();
      if (pageRoot.contains(event.target) && event.target.matches('[data-cs-filter]')) { currentPage = 1; refreshList(); }
    });
    shadowRoot.addEventListener('change', event => {
      syncPageRoot();
      if (pageRoot.contains(event.target) && event.target.matches('[data-cs-filter]')) { currentPage = 1; refreshList(); }
    });
    const handledClicks = new WeakSet();
    const handleCustomerServiceClick = event => {
      if (handledClicks.has(event)) return;
      syncPageRoot();
      const target = (event.composedPath?.() || [event.target]).find(node => node?.matches?.('[data-cs-action],[data-business-type]'));
      if (!target || !pageRoot.contains(target)) return;
      handledClicks.add(event);
      if (target.dataset.businessType) {
        const destination = domain.resolveBusinessTarget({ type: decodeURIComponent(target.dataset.businessType), id: target.dataset.businessId });
        routeTo(destination.page, destination.id);
        return;
      }
      const action = target.dataset.csAction;
      if (action === 'detail') openDetail(target.dataset.recordId);
      if (action === 'close-detail') closeLayer('.customer-service-drawer');
      if (action === 'open-task') openTask(target.dataset.recordId || activeRecordId);
      if (action === 'close-task') closeLayer('.customer-service-task-dialog');
      if (action === 'customer') routeTo('customers', target.dataset.customerId);
      if (action === 'page' && !target.disabled) {
        currentPage = Number(target.dataset.page) || 1;
        refreshList();
      }
      if (action === 'reset') {
        pageRoot.querySelectorAll('[data-cs-filter]').forEach(input => { input.value = ''; });
        currentPage = 1;
        refreshList();
      }
    };
    shadowRoot.addEventListener('click', handleCustomerServiceClick);
    root.document.addEventListener('click', handleCustomerServiceClick);
    shadowRoot.addEventListener('submit', event => {
      syncPageRoot();
      if (!pageRoot.contains(event.target) || !event.target.closest('.customer-service-task-dialog')) return;
      event.preventDefault();
      const form = event.target;
      try {
        const index = state[activeType].findIndex(item => item.id === form.elements.recordId.value);
        state[activeType][index] = domain.createFollowUp(activeType, state[activeType][index], {
          title: form.elements.title.value, owner: form.elements.owner.value, dueAt: form.elements.dueAt.value.replace('T', ' '), priority: decodeURIComponent(form.elements.priority.value),
        });
        closeLayer('.customer-service-task-dialog');
        refreshList();
        if (activeRecordId === state[activeType][index].id) openDetail(activeRecordId);
        showToast(domain.copyForLanguage(currentLanguage(hostVm)).messages.saved);
      } catch (_) {
        showToast(domain.copyForLanguage(currentLanguage(hostVm)).messages.required);
      }
    });

    root.document.addEventListener('aiwa:ministorage-pagechange', event => renderPage(event.detail?.page));
    root.addEventListener('popstate', () => {
      const page = new URL(root.location.href).searchParams.get('section');
      if (isCustomerPage(page)) navigate(page);
    });
    root.addEventListener('onestorage:languagechange', () => root.setTimeout(() => renderPage(hostVm.activePage), 0));
    root.document.addEventListener('aiwa:languagechange', () => root.setTimeout(() => renderPage(hostVm.activePage), 0));

    let scheduled = false;
    new root.MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      root.requestAnimationFrame(() => { scheduled = false; ensureMenu(); });
    }).observe(app, { childList: true, subtree: true });

    const initialPage = root.location ? new URL(root.location.href).searchParams.get('section') : '';
    ensureMenu();
    if (isCustomerPage(initialPage)) navigate(initialPage);
    else renderPage(hostVm.activePage);
    return { state, navigate, renderPage };
  }

  function init() {
    let attempts = 0;
    const connect = () => {
      const host = root.document.getElementById('mini-storage-native-host');
      const shadowRoot = host?.shadowRoot;
      const hostVm = root.__aiwaMiniStorageVm;
      if (!shadowRoot?.getElementById('app') || !hostVm) {
        if (attempts++ < 180) root.setTimeout(connect, 100);
        return;
      }
      if (!shadowRoot.getElementById('customer-service-admin-root')) mountCustomerService(shadowRoot, hostVm);
    };
    connect();
  }

  return { buildMenuMarkup, buildOuterMenuMarkup, buildPageMarkup, buildDetailMarkup, buildSectionUrl, paginateRecords, applyCustomerServiceVisibility, customerServiceStyles: STYLE, mountCustomerService, init };
});
