(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') {
    window.AiwaInsuranceProductManagement = api;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.mount, { once: true });
    else api.mount();
  }
})(function () {
  'use strict';

  const ACCEPTED_ATTACHMENT = /\.(pdf|doc|docx)$/i;
  const requiredFields = [
    ['name', '请填写产品名称'], ['code', '请填写产品代码'], ['business', '请选择适用业务'],
    ['coverage', '请填写保障金额'], ['premium', '请填写参考保费'], ['version', '请填写条款版本']
  ];

  function validateInsuranceProduct(draft) {
    const errors = {};
    requiredFields.forEach(([field, message]) => {
      if (!String(draft?.[field] || '').trim()) errors[field] = message;
    });
    if (!draft?.attachment) errors.attachment = '请上传保险产品附件';
    else if (!ACCEPTED_ATTACHMENT.test(draft.attachment.name || '')) errors.attachment = '仅支持 PDF、DOC、DOCX 格式';
    return errors;
  }

  function createInsuranceProduct(draft, operator) {
    return { ...draft, provider: 'One Storage 自营', operator, updated: '刚刚', status: '销售中' };
  }

  function toggleInsuranceProductStatus(status) {
    return status === '已停用' ? '销售中' : '已停用';
  }

  const rows = [
    { name: '标准财物保障', code: 'OS-STANDARD-50K', provider: 'One Storage 自营', business: '迷你仓', coverage: 'HK$50,000', premium: 'HK$480 / 年', version: '2026.08', operator: '产品运营 D', updated: '2026-08-20 09:42:00', attachment: { name: '标准财物保障条款.pdf', size: 428032 }, status: '销售中' },
    { name: '迷你箱基础保障', code: 'OS-BOX-20K', provider: 'One Storage 自营', business: '迷你箱', coverage: 'HK$20,000', premium: 'HK$180 / 半年', version: '2026.07', operator: '产品运营 D', updated: '2026-08-20 09:42:00', attachment: { name: '迷你箱基础保障条款.docx', size: 98304 }, status: '销售中' },
    { name: '升级财物保障', code: 'OS-STORAGE-100K', provider: 'One Storage 自营', business: '迷你仓', coverage: 'HK$100,000', premium: 'HK$860 / 年', version: '2026.08', operator: '保险运营 A', updated: '2026-08-19 18:20:00', attachment: { name: '升级财物保障产品说明.pdf', size: 612352 }, status: '销售中' },
    { name: '企业存货保障', code: 'OS-BIZ-300K', provider: 'One Storage 自营', business: '企业仓', coverage: 'HK$300,000', premium: '按方案报价', version: '2026.06', operator: '保险运营 A', updated: '2026-08-12 14:36:00', attachment: { name: '企业存货保障条款.doc', size: 224256 }, status: '已停用' },
    { name: '短租基础保障', code: 'OS-SHORT-10K', provider: 'One Storage 自营', business: '短租仓', coverage: 'HK$10,000', premium: 'HK$60 / 月', version: '2026.06', operator: '产品运营 D', updated: '2026-08-10 09:18:00', attachment: { name: '短租基础保障条款.pdf', size: 356352 }, status: '销售中' }
  ];

  const PAGE_SIZE = 10;
  let keyword = '', statusFilter = 'all', currentPage = 1, currentFile = null, mountedRoot = null, observer = null;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const formatSize = (bytes) => bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  function renderInsuranceStyles() {
    return `
      .ipm-shell{display:flex;flex-direction:column;gap:16px;min-width:0;max-width:100%;color:var(--text-1,#1f2937)}
      .ipm-summary{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border:1px solid var(--border,#e5e7eb);border-radius:12px;background:var(--surface,#fff)}.ipm-summary>div{min-width:0}.ipm-summary>.ipm-btn{flex:none}
      .ipm-summary strong{display:block;font-size:16px}.ipm-summary span{display:block;margin-top:4px;color:var(--text-3,#6b7280);font-size:13px}
      .ipm-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.ipm-search{position:relative;min-width:260px;flex:1}.ipm-search input{padding-left:38px}.ipm-search svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:var(--text-3,#6b7280)}
      .ipm-input,.ipm-select{height:36px;border:1px solid var(--border,#dcdfe6);border-radius:6px;background:var(--surface,#fff);color:inherit;padding:0 12px;box-sizing:border-box;font:inherit;outline:none}.ipm-input:focus,.ipm-select:focus{border-color:var(--accent,#8e579d);box-shadow:0 0 0 2px var(--accent-ring,rgba(142,87,157,.14))}
      .ipm-btn{height:36px;border:1px solid var(--border,#dcdfe6);border-radius:6px;background:var(--surface,#fff);color:inherit;padding:0 14px;cursor:pointer;font:inherit}.ipm-btn:hover{border-color:var(--accent,#8e579d);color:var(--accent,#8e579d)}.ipm-btn.primary{border-color:var(--accent,#8e579d);background:var(--accent,#8e579d);color:#fff;font-weight:600}.ipm-btn.link{height:auto;border:0;background:transparent;padding:4px 7px;color:var(--accent,#8e579d)}.ipm-btn.link.danger{color:var(--danger,#dc2626)}.ipm-btn.link.success{color:var(--success,#059669)}
      .ipm-card{min-width:0;max-width:100%;border:1px solid var(--border,#e5e7eb);border-radius:12px;background:var(--surface,#fff);overflow:hidden}.ipm-card-head{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--border,#e5e7eb)}.ipm-card-head b{font-size:15px}.ipm-card-head span{color:var(--text-3,#6b7280);font-size:13px}
      .ipm-table-wrap{overflow:auto}.ipm-table{width:100%;min-width:1180px;border-collapse:collapse;font-size:13px}.ipm-table th{background:var(--fill-light,#f7f8fa);color:var(--text-2,#4b5563);font-weight:600;text-align:left;padding:12px 14px;white-space:nowrap}.ipm-table td{border-top:1px solid var(--border,#ebeef5);padding:13px 14px;vertical-align:middle}.ipm-table tr:hover td{background:var(--fill-light,#f8fafc)}
      .ipm-pagination{border-top:1px solid var(--border,#e5e7eb)}.ipm-pagination .el-pagination{justify-content:flex-end}.ipm-pagination .el-pager{margin:0;padding:0;display:flex;list-style:none}.ipm-pagination button,.ipm-pagination .el-pager li{cursor:pointer}.ipm-pagination button:disabled{cursor:not-allowed}
      .ipm-product{display:flex;align-items:center;gap:10px}.ipm-mark{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:var(--accent-soft,#f1e6f4);color:var(--accent,#8e579d);font-weight:700}.ipm-product b,.ipm-product small{display:block;white-space:nowrap}.ipm-product small{margin-top:3px;color:var(--text-3,#6b7280)}.ipm-file{display:flex;align-items:center;gap:6px;max-width:190px;color:var(--accent,#8e579d);cursor:pointer}.ipm-file span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ipm-tag{display:inline-flex;padding:4px 10px;border-radius:999px;font-weight:600;white-space:nowrap}.ipm-tag.active{background:var(--success-soft,#e8f7ef);color:var(--success,#087f5b)}.ipm-tag.disabled{background:var(--disabled-soft,#f1f3f5);color:var(--disabled-text,#6b7280)}.ipm-actions{white-space:nowrap}.ipm-empty{padding:48px;text-align:center;color:var(--text-3,#6b7280)}
      .ipm-modal{position:fixed;inset:0;z-index:10020;display:grid;place-items:center;background:rgba(15,23,42,.48);padding:24px}.ipm-modal[hidden]{display:none}.ipm-dialog{width:min(720px,calc(100vw - 48px));max-height:calc(100vh - 48px);display:flex;flex-direction:column;border-radius:14px;background:var(--surface,#fff);color:var(--text-1,#1f2937);box-shadow:0 20px 60px rgba(0,0,0,.22);overflow:hidden}.ipm-dialog-head,.ipm-dialog-foot{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--border,#e5e7eb)}.ipm-dialog-head h3{margin:0;font-size:18px}.ipm-close{border:0;background:transparent;color:inherit;font-size:25px;cursor:pointer}.ipm-dialog-body{padding:20px 22px;overflow:auto}.ipm-dialog-foot{justify-content:flex-end;gap:10px;border-top:1px solid var(--border,#e5e7eb);border-bottom:0}
      .ipm-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:17px 18px}.ipm-field{display:flex;flex-direction:column;gap:7px}.ipm-field.full{grid-column:1/-1}.ipm-field label{font-size:13px;font-weight:600}.ipm-required{color:var(--danger,#dc2626);margin-right:3px}.ipm-field .ipm-input,.ipm-field .ipm-select{width:100%}.ipm-error{min-height:16px;color:var(--danger,#dc2626);font-size:12px}
      .ipm-upload{display:flex;align-items:center;justify-content:center;gap:10px;min-height:88px;border:1px dashed var(--text-3,#9ca3af);border-radius:9px;background:var(--fill-light,#f8fafc);cursor:pointer;color:var(--text-2,#4b5563)}.ipm-upload:hover{border-color:var(--accent,#8e579d);color:var(--accent,#8e579d)}.ipm-upload input{display:none}.ipm-upload svg{width:22px;height:22px}.ipm-file-chip{display:flex;align-items:center;justify-content:space-between;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:11px 12px;background:var(--fill-light,#f8fafc)}.ipm-file-chip b,.ipm-file-chip small{display:block}.ipm-file-chip small{margin-top:3px;color:var(--text-3,#6b7280)}
      .ipm-detail-grid{display:grid;grid-template-columns:130px 1fr;gap:0;border:1px solid var(--border,#e5e7eb);border-radius:9px;overflow:hidden}.ipm-detail-grid dt,.ipm-detail-grid dd{margin:0;padding:12px 14px;border-bottom:1px solid var(--border,#e5e7eb)}.ipm-detail-grid dt{background:var(--fill-light,#f8fafc);color:var(--text-3,#6b7280)}.ipm-detail-grid dt:last-of-type,.ipm-detail-grid dd:last-of-type{border-bottom:0}.ipm-toast{position:fixed;left:50%;bottom:32px;z-index:10040;transform:translate(-50%,12px);padding:10px 16px;border-radius:8px;background:#111827;color:#fff;opacity:0;pointer-events:none;transition:.18s}.ipm-toast.show{opacity:1;transform:translate(-50%,0)}
      .ipm-standalone{min-height:100%;box-sizing:border-box;padding:24px;background:var(--page,#f6f7f9);color:var(--text-1,#1f2937);overflow:auto}.ipm-standalone-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.ipm-standalone-title h1{margin:0;font-size:24px}
      .theme-dark .ipm-shell,.theme-dark .ipm-dialog{--surface:#211d24;--border:rgba(255,255,255,.075);--fill-light:#29232c;--text-1:#f1edf2;--text-2:#d2c9d5;--text-3:#aaa0ae;--accent:#c99bd5;--accent-soft:#35293a;--accent-ring:rgba(201,155,213,.18);--danger:#ef7b7b;--success:#70c391;--success-soft:#26372d;--disabled-soft:#34343a;--disabled-text:#aaa0ae}.theme-dark.ipm-standalone,.theme-dark .ipm-standalone{--surface:#211d24;--border:rgba(255,255,255,.075);--fill-light:#29232c;--text-1:#f1edf2;--text-2:#d2c9d5;--text-3:#aaa0ae;--accent:#c99bd5;--accent-soft:#35293a;--accent-ring:rgba(201,155,213,.18);--danger:#ef7b7b;--success:#70c391;--success-soft:#26372d;--disabled-soft:#34343a;--disabled-text:#aaa0ae;--page:#171419}
      @media(max-width:760px){.ipm-form-grid{grid-template-columns:1fr}.ipm-field.full{grid-column:auto}.ipm-summary{align-items:flex-start;gap:14px;flex-direction:column}.ipm-toolbar{width:100%}.ipm-search{min-width:100%}}
    `;
  }

  function ensureStyles(root) {
    if (root.getElementById('insurance-self-operated-styles')) return;
    const style = document.createElement('style');
    style.id = 'insurance-self-operated-styles';
    style.textContent = renderInsuranceStyles();
    root.appendChild(style);
  }

  function filteredRows() {
    const query = keyword.trim().toLowerCase();
    return rows.filter((row) => (!query || [row.name, row.code, row.business].some((value) => String(value).toLowerCase().includes(query))) && (statusFilter === 'all' || row.status === statusFilter));
  }

  function paginateInsuranceProducts(products, requestedPage = 1, pageSize = PAGE_SIZE) {
    const total = products.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(pageCount, Math.max(1, Number(requestedPage) || 1));
    const start = (page - 1) * pageSize;
    return { rows: products.slice(start, start + pageSize), page, pageSize, total, pageCount };
  }

  function changeInsurancePage(page, action, targetPage, pageCount) {
    const requested = action === 'next' ? page + 1 : action === 'prev' ? page - 1 : Number(targetPage) || page;
    return Math.min(Math.max(1, pageCount), Math.max(1, requested));
  }

  function renderTableRows() {
    const page = paginateInsuranceProducts(filteredRows(), currentPage);
    currentPage = page.page;
    const visibleRows = page.rows;
    if (!visibleRows.length) return '<tr><td colspan="9"><div class="ipm-empty">未找到符合条件的保险产品</div></td></tr>';
    return visibleRows.map((row) => {
      const index = rows.indexOf(row), active = row.status === '销售中';
      return `<tr data-product-row="${index}"><td><div class="ipm-product"><span class="ipm-mark">保</span><span><b>${escapeHtml(row.name)}</b><small>${escapeHtml(row.code)}</small></span></div></td><td>${escapeHtml(row.business)}</td><td>${escapeHtml(row.coverage)}</td><td>${escapeHtml(row.premium)}</td><td>${escapeHtml(row.version)}</td><td><button class="ipm-btn link ipm-file" data-ipm-download="${index}" title="下载 ${escapeHtml(row.attachment.name)}"><span>📎 ${escapeHtml(row.attachment.name)}</span></button></td><td>${escapeHtml(row.operator)}</td><td><span class="ipm-tag ${active ? 'active' : 'disabled'}">${row.status}</span></td><td><div class="ipm-actions"><button class="ipm-btn link" data-ipm-view="${index}">查看</button><button class="ipm-btn link ${active ? 'danger' : 'success'}" data-ipm-toggle="${index}">${active ? '停用' : '启用'}</button></div></td></tr>`;
    }).join('');
  }

  function renderPaginationMarkup() {
    const page = paginateInsuranceProducts(filteredRows(), currentPage);
    currentPage = page.page;
    const pages = Array.from({ length: page.pageCount }, (_, index) => index + 1).map((number) => `<li class="number${number === page.page ? ' is-active' : ''}"${number === page.page ? ' aria-current="page"' : ''} data-ipm-page="${number}">${number}</li>`).join('');
    return `<div class="pagination ipm-pagination"><div class="el-pagination is-background"><span class="el-pagination__total">共 ${page.total} 条</span><button type="button" class="btn-prev" data-ipm-page-prev${page.page === 1 ? ' disabled' : ''} aria-label="上一页">‹</button><ul class="el-pager">${pages}</ul><button type="button" class="btn-next" data-ipm-page-next${page.page === page.pageCount ? ' disabled' : ''} aria-label="下一页">›</button></div></div>`;
  }

  function renderInsurancePageMarkup() {
    return `<div class="ipm-shell" data-insurance-self-operated="true"><section class="panel table-panel ipm-card"><div class="capability-toolbar ipm-card-head"><div class="ipm-toolbar"><label class="ipm-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg><input class="ipm-input" data-ipm-search placeholder="搜索产品名称、产品代码、适用业务…" value="${escapeHtml(keyword)}"></label><select class="ipm-select" data-ipm-status><option value="all"${statusFilter === 'all' ? ' selected' : ''}>全部状态</option><option value="销售中"${statusFilter === '销售中' ? ' selected' : ''}>销售中</option><option value="已停用"${statusFilter === '已停用' ? ' selected' : ''}>已停用</option></select></div><span>共 ${filteredRows().length} 个产品</span></div><div class="ipm-table-wrap"><table class="ipm-table"><thead><tr><th>产品名称 / 产品代码</th><th>适用业务</th><th>保障金额</th><th>参考保费</th><th>条款版本</th><th>产品附件</th><th>操作人</th><th>状态</th><th>操作</th></tr></thead><tbody data-ipm-tbody>${renderTableRows()}</tbody></table></div><div data-ipm-pagination>${renderPaginationMarkup()}</div></section></div>`;
  }

  function renderInsuranceHeaderActionMarkup() {
    return '<button type="button" class="el-button el-button--primary ipm-native-create" data-ipm-create data-ipm-header-action><span class="icon-button-label">＋ 新增保险产品</span></button>';
  }

  function fieldMarkup(name, label, placeholder) {
    return `<div class="ipm-field"><label><span class="ipm-required">*</span>${label}</label><input class="ipm-input" name="${name}" placeholder="${placeholder}" autocomplete="off"><span class="ipm-error" data-error="${name}"></span></div>`;
  }

  function renderInsuranceModalMarkup() {
    return `<div class="ipm-modal" data-ipm-modal hidden><div class="ipm-dialog" role="dialog" aria-modal="true" aria-labelledby="ipm-dialog-title"><header class="ipm-dialog-head"><h3 id="ipm-dialog-title">新增保险产品</h3><button class="ipm-close" data-ipm-close aria-label="关闭">×</button></header><form data-ipm-form><div class="ipm-dialog-body"><div class="ipm-form-grid">${fieldMarkup('name', '产品名称', '例如：安心存储保障')}${fieldMarkup('code', '产品代码', '例如：AIWA-SAFE-50K')}<div class="ipm-field"><label><span class="ipm-required">*</span>适用业务</label><select class="ipm-select" name="business"><option value="">请选择</option><option>迷你仓</option><option>迷你箱</option><option>企业仓</option><option>短租仓</option></select><span class="ipm-error" data-error="business"></span></div>${fieldMarkup('coverage', '保障金额', '例如：HK$50,000')}${fieldMarkup('premium', '参考保费', '例如：HK$480 / 年')}${fieldMarkup('version', '条款版本', '例如：2026.08')}<div class="ipm-field full"><label><span class="ipm-required">*</span>产品附件</label><label class="ipm-upload" data-ipm-upload><input type="file" name="attachment" accept=".pdf,.doc,.docx"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16V4m-5 5 5-5 5 5M4 20h16"></path></svg><span><b>点击上传保险产品附件</b><small style="display:block;margin-top:4px">支持 PDF、DOC、DOCX，单份文件</small></span></label><div data-ipm-file-chip></div><span class="ipm-error" data-error="attachment"></span></div></div></div><footer class="ipm-dialog-foot"><button type="button" class="el-button" data-ipm-close><span>取消</span></button><button type="submit" class="el-button el-button--primary"><span>保存并销售</span></button></footer></form></div></div><div class="ipm-modal" data-ipm-detail hidden><div class="ipm-dialog" role="dialog" aria-modal="true"><header class="ipm-dialog-head"><h3>保险产品详情</h3><button class="ipm-close" data-ipm-detail-close aria-label="关闭">×</button></header><div class="ipm-dialog-body" data-ipm-detail-body></div><footer class="ipm-dialog-foot"><button class="el-button" data-ipm-detail-close><span>关闭</span></button></footer></div></div><div class="ipm-toast" data-ipm-toast></div>`;
  }

  function showToast(message) {
    const toast = mountedRoot?.querySelector('[data-ipm-toast]');
    if (!toast) return;
    toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function refreshList() {
    const body = mountedRoot?.querySelector('[data-ipm-tbody]');
    if (body) body.innerHTML = renderTableRows();
    const count = mountedRoot?.querySelector('.ipm-card-head > span');
    if (count) count.textContent = `共 ${filteredRows().length} 个产品`;
    const pagination = mountedRoot?.querySelector('[data-ipm-pagination]');
    if (pagination) pagination.innerHTML = renderPaginationMarkup();
  }

  function openCreateModal() {
    currentFile = null;
    const form = mountedRoot.querySelector('[data-ipm-form]');
    form.reset(); form.querySelectorAll('.ipm-error').forEach((node) => { node.textContent = ''; });
    form.querySelector('[data-ipm-file-chip]').innerHTML = ''; form.querySelector('[data-ipm-upload]').hidden = false;
    mountedRoot.querySelector('[data-ipm-modal]').hidden = false; setTimeout(() => form.elements.name.focus(), 0);
  }

  function handleFile(file) {
    currentFile = file || null;
    const chip = mountedRoot.querySelector('[data-ipm-file-chip]'), upload = mountedRoot.querySelector('[data-ipm-upload]');
    if (!file) { chip.innerHTML = ''; upload.hidden = false; return; }
    upload.hidden = true;
    chip.innerHTML = `<div class="ipm-file-chip"><span><b>📎 ${escapeHtml(file.name)}</b><small>${formatSize(file.size)}</small></span><button type="button" class="ipm-btn link danger" data-ipm-remove-file>删除</button></div>`;
    mountedRoot.querySelector('[data-error="attachment"]').textContent = ACCEPTED_ATTACHMENT.test(file.name) ? '' : '仅支持 PDF、DOC、DOCX 格式';
  }

  function submitProduct(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    const draft = { ...values, attachment: currentFile ? { name: currentFile.name, size: currentFile.size, file: currentFile } : null };
    const errors = validateInsuranceProduct(draft);
    form.querySelectorAll('.ipm-error').forEach((node) => { node.textContent = errors[node.dataset.error] || ''; });
    if (Object.keys(errors).length) return;
    rows.unshift(createInsuranceProduct(draft, '产品运营 D'));
    currentPage = 1;
    mountedRoot.querySelector('[data-ipm-modal]').hidden = true; refreshList(); showToast('保险产品已新增并进入销售中');
  }

  function renderInsuranceDetailMarkup(row) {
    const labels = [['产品名称', row.name], ['产品代码', row.code], ['适用业务', row.business], ['保障金额', row.coverage], ['参考保费', row.premium], ['条款版本', row.version], ['产品附件', row.attachment.name], ['状态', row.status], ['操作人', row.operator]];
    return `<dl class="ipm-detail-grid">${labels.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl>`;
  }

  function showDetail(index) {
    const row = rows[index]; if (!row) return;
    mountedRoot.querySelector('[data-ipm-detail-body]').innerHTML = renderInsuranceDetailMarkup(row);
    mountedRoot.querySelector('[data-ipm-detail]').hidden = false;
  }

  function downloadAttachment(index) {
    const row = rows[index]; if (!row) return;
    const blob = row.attachment.file || new Blob([`${row.name}\n产品代码：${row.code}\n适用业务：${row.business}\n条款版本：${row.version}`], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = row.attachment.name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); showToast('产品附件已开始下载');
  }

  function handleClick(event) {
    const target = event.target.closest('button,[data-ipm-upload],[data-ipm-page]'); if (!target) return;
    if (target.matches('[data-ipm-create]')) openCreateModal();
    else if (target.matches('[data-ipm-close]')) mountedRoot.querySelector('[data-ipm-modal]').hidden = true;
    else if (target.matches('[data-ipm-remove-file]')) handleFile(null);
    else if (target.matches('[data-ipm-view]')) showDetail(Number(target.dataset.ipmView));
    else if (target.matches('[data-ipm-detail-close]')) mountedRoot.querySelector('[data-ipm-detail]').hidden = true;
    else if (target.matches('[data-ipm-toggle]')) { const row = rows[Number(target.dataset.ipmToggle)]; row.status = toggleInsuranceProductStatus(row.status); row.updated = '刚刚'; row.operator = '产品运营 D'; refreshList(); showToast(`保险产品已${row.status === '销售中' ? '启用' : '停用'}`); }
    else if (target.matches('[data-ipm-download]')) downloadAttachment(Number(target.dataset.ipmDownload));
    else if (target.matches('[data-ipm-page]')) { currentPage = changeInsurancePage(currentPage, 'page', target.dataset.ipmPage, paginateInsuranceProducts(filteredRows(), currentPage).pageCount); refreshList(); }
    else if (target.matches('[data-ipm-page-prev]') && !target.disabled) { currentPage = changeInsurancePage(currentPage, 'prev', null, paginateInsuranceProducts(filteredRows(), currentPage).pageCount); refreshList(); }
    else if (target.matches('[data-ipm-page-next]') && !target.disabled) { currentPage = changeInsurancePage(currentPage, 'next', null, paginateInsuranceProducts(filteredRows(), currentPage).pageCount); refreshList(); }
  }

  function bindRoot(root) {
    if (root.host?.dataset.ipmBound) return;
    root.host.dataset.ipmBound = 'true'; root.addEventListener('click', handleClick);
    root.addEventListener('input', (event) => { if (event.target.matches('[data-ipm-search]')) { keyword = event.target.value; currentPage = 1; refreshList(); } });
    root.addEventListener('change', (event) => { if (event.target.matches('[data-ipm-status]')) { statusFilter = event.target.value; currentPage = 1; refreshList(); } if (event.target.matches('input[name="attachment"]')) handleFile(event.target.files?.[0]); });
    root.addEventListener('submit', (event) => { if (event.target.matches('[data-ipm-form]')) { event.preventDefault(); submitProduct(event.target); } });
  }

  function enhancePage(root) {
    const section = Array.from(root.querySelectorAll('.capability-page')).find((node) => node.querySelector('.insurance-product-name, input[placeholder*="保险产品"], input[placeholder*="insurance" i], [data-insurance-self-operated]'));
    if (!section) { syncHeaderAction(root); return; }
    if (!section.querySelector('[data-insurance-self-operated]')) section.innerHTML = renderInsurancePageMarkup();
    ensureOverlays(root);
    syncHeaderAction(root);
  }

  function syncHeaderAction(root) {
    const insuranceActive = Boolean(root.querySelector('[data-insurance-self-operated]'));
    const action = root.querySelector('[data-ipm-header-action]');
    if (!insuranceActive) { action?.remove(); return; }
    const actions = root.querySelector('.page-header .page-actions, .ipm-standalone-title .page-actions');
    if (!actions || actions.contains(action)) return;
    action?.remove();
    actions.insertAdjacentHTML('beforeend', renderInsuranceHeaderActionMarkup());
  }

  function ensureOverlays(root) {
    if (!root.querySelector('[data-ipm-modal]')) root.getElementById('app').insertAdjacentHTML('beforeend', renderInsuranceModalMarkup());
  }

  function insurancePageRequested() {
    const section = new URLSearchParams(location.search).get('section');
    return section === 'insurance-products' || Boolean(document.querySelector('[data-mini-storage-page="insurance-products"].active'));
  }

  function renderStandaloneIfNeeded() {
    const root = document.getElementById('mini-storage-native-host')?.shadowRoot;
    const app = root?.getElementById('app');
    if (!root || !app || root.querySelector('[data-insurance-self-operated]') || app.children.length) return;
    mountedRoot = root;
    app.removeAttribute('v-cloak');
    app.innerHTML = `<main class="ipm-standalone${document.body.classList.contains('mini-storage-dark-mode') ? ' theme-dark' : ''}"><header class="ipm-standalone-title"><h1>保险管理</h1><div class="page-actions">${renderInsuranceHeaderActionMarkup()}</div></header>${renderInsurancePageMarkup()}</main>`;
    ensureOverlays(root);
  }

  function bindDocumentFallback() {
    if (document.body.dataset.ipmFallbackBound) return;
    document.body.dataset.ipmFallbackBound = 'true';
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-mini-storage-page="insurance-products"]')) setTimeout(renderStandaloneIfNeeded, 80);
    });
    document.addEventListener('aiwa:ministorage-pagechange', (event) => {
      if (event.detail?.page === 'insurance-products') setTimeout(renderStandaloneIfNeeded, 80);
    });
  }

  function connect() {
    const root = document.getElementById('mini-storage-native-host')?.shadowRoot, app = root?.getElementById('app');
    if (!root || !app) return false;
    mountedRoot = root; ensureStyles(root); bindRoot(root); enhancePage(root);
    if (insurancePageRequested()) [80, 300, 900].forEach((delay) => setTimeout(renderStandaloneIfNeeded, delay));
    if (!observer) { let scheduled = false; observer = new MutationObserver(() => { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; enhancePage(root); syncHeaderAction(root); if (insurancePageRequested()) renderStandaloneIfNeeded(); }); }); observer.observe(app, { childList: true, subtree: true }); }
    return true;
  }

  function mount() {
    bindDocumentFallback();
    if (connect()) return;
    let attempts = 0; const timer = setInterval(() => { attempts += 1; if (connect() || attempts > 100) clearInterval(timer); }, 100);
  }

  return { validateInsuranceProduct, createInsuranceProduct, toggleInsuranceProductStatus, paginateInsuranceProducts, changeInsurancePage, renderInsurancePageMarkup, renderInsuranceDetailMarkup, renderInsuranceHeaderActionMarkup, renderInsuranceModalMarkup, renderInsuranceStyles, mount };
});
