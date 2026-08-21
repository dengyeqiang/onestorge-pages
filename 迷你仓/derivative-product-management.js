(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') {
    window.AiwaDerivativeProductManagement = api;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', api.mount, { once: true });
    else api.mount();
  }
})(function () {
  'use strict';

  function textLength(value) {
    return Array.from(String(value || '').trim()).length;
  }

  function validateDerivativeProduct(draft) {
    const errors = {};
    const name = String(draft?.name || '').trim();
    const description = String(draft?.description || '').trim();
    const images = Array.isArray(draft?.images) ? draft.images : [];
    const price = String(draft?.price ?? '').trim();
    const unit = String(draft?.unit || '').trim();

    if (!name) errors.name = '请填写商品名称';
    if (!description) errors.description = '请填写商品简描述';
    else if (textLength(description) > 20) errors.description = '商品简描述最多 20 个字';
    if (!images.length) errors.images = '请上传商品图片';
    else if (images.length > 3) errors.images = '商品图片不能超过 3 张';
    if (!price) errors.price = '请填写商品价格';
    else if (!Number.isFinite(Number(price)) || Number(price) <= 0) errors.price = '商品价格必须大于 0';
    if (!unit) errors.unit = '请选择价格单位';
    return errors;
  }

  function formatPrice(price, unit) {
    const value = Number(price);
    const amount = Number.isInteger(value) ? String(value) : value.toFixed(2);
    return `HK$${amount} / ${unit}`;
  }

  function cloneProduct(product) {
    return { ...product, images: (product.images || []).map((image) => ({ ...image })) };
  }

  function createDerivativeProductStore(initialProducts) {
    const sourceRows = (initialProducts || []).filter((item) => item && typeof item === 'object');
    const reservedIds = new Set(sourceRows.map((item) => String(item.id || '')).filter((id) => /^DP-\d+$/.test(id)));
    const assignedIds = new Set();
    let replacementId = 1;
    const safeId = (id) => {
      const candidate = String(id || '');
      if (/^DP-\d+$/.test(candidate) && !assignedIds.has(candidate)) { assignedIds.add(candidate); return candidate; }
      while (reservedIds.has(`DP-${String(replacementId).padStart(4, '0')}`) || assignedIds.has(`DP-${String(replacementId).padStart(4, '0')}`)) replacementId += 1;
      const replacement = `DP-${String(replacementId++).padStart(4, '0')}`;
      assignedIds.add(replacement);
      return replacement;
    };
    let rows = sourceRows.map((item) => ({
      id: safeId(item.id),
      name: String(item.name || ''),
      description: String(item.description || ''),
      images: Array.isArray(item.images) ? item.images.filter((image) => image && typeof image === 'object').map((image) => ({ name: String(image.name || ''), url: String(image.url || ''), ...(Number.isFinite(Number(image.size)) ? { size: Number(image.size) } : {}) })) : [],
      price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
      unit: String(item.unit || ''),
      updatedAt: String(item.updatedAt || ''),
      ...(item.i18nKey ? { i18nKey: String(item.i18nKey) } : {}),
      displayPrice: formatPrice(Number.isFinite(Number(item.price)) ? Number(item.price) : 0, String(item.unit || '')),
    }));
    let nextId = rows.reduce((max, item) => {
      const match = String(item.id || '').match(/^DP-(\d+)$/);
      return Math.max(max, match ? Number(match[1]) : 0);
    }, 0) + 1;

    function list() {
      return rows.map(cloneProduct);
    }

    function create(draft) {
      const errors = validateDerivativeProduct(draft);
      if (Object.keys(errors).length) throw new Error('商品资料未通过校验');
      const product = {
        ...cloneProduct(draft),
        id: `DP-${String(nextId++).padStart(4, '0')}`,
        price: Number(draft.price),
        displayPrice: formatPrice(draft.price, draft.unit),
        updatedAt: '刚刚',
      };
      rows.unshift(product);
      return cloneProduct(product);
    }

    function update(id, draft) {
      const index = rows.findIndex((item) => item.id === id);
      if (index < 0) return null;
      const errors = validateDerivativeProduct(draft);
      if (Object.keys(errors).length) throw new Error('商品资料未通过校验');
      rows[index] = {
        ...cloneProduct(draft),
        id,
        price: Number(draft.price),
        displayPrice: formatPrice(draft.price, draft.unit),
        updatedAt: '刚刚',
      };
      return cloneProduct(rows[index]);
    }

    function remove(id) {
      const before = rows.length;
      rows = rows.filter((item) => item.id !== id);
      return rows.length < before;
    }

    function search(keyword) {
      const query = String(keyword || '').trim().toLocaleLowerCase();
      return list().filter((item) => !query || String(item.name || '').toLocaleLowerCase().includes(query));
    }

    function commit(mutation, persist) {
      const previousRows = list();
      const previousNextId = nextId;
      let result;
      try { result = mutation(api); }
      catch (error) { rows = previousRows; nextId = previousNextId; throw error; }
      let persisted = false;
      try { persisted = persist(list()) !== false; } catch (_) { persisted = false; }
      if (!persisted) { rows = previousRows; nextId = previousNextId; return { ok: false, result: null }; }
      return { ok: true, result };
    }

    const api = { list, create, update, remove, search, commit };
    return api;
  }

  const dictionary = {
    'zh-CN': { title: '衍生商品管理', add: '新增商品', search: '请输入商品名称查询', image: '商品图片', name: '商品名称', description: '商品简描述', price: '商品价格', updated: '更新时间', actions: '操作', edit: '编辑', remove: '删除', empty: '暂无符合条件的商品', createTitle: '新增商品', editTitle: '编辑商品', unit: '单位', cancel: '取消', save: '保存', upload: '点击或拖拽上传商品图片', uploadHint: '至少 1 张，最多 3 张；单张 1MB、合计 2MB 以内', confirmDelete: '确定删除该衍生商品吗？删除后无法恢复。', saved: '商品已保存', deleted: '商品已删除', saveFailed: '保存失败，请清理浏览器存储空间后重试', imageType: '仅支持 JPG、PNG、WEBP 图片', imageSize: '单张图片不能超过 1MB', imageTotal: '商品图片合计不能超过 2MB', imageCount: '商品图片不能超过 3 张', imageRead: '图片读取失败，请重新选择', removeImage: '删除图片', count: '件商品', units: [['个','个'],['件','件'],['套','套'],['盒','盒'],['箱','箱'],['包','包']] },
    'zh-HK': { title: '衍生商品管理', add: '新增商品', search: '請輸入商品名稱查詢', image: '商品圖片', name: '商品名稱', description: '商品簡描述', price: '商品價格', updated: '更新時間', actions: '操作', edit: '編輯', remove: '刪除', empty: '暫無符合條件的商品', createTitle: '新增商品', editTitle: '編輯商品', unit: '單位', cancel: '取消', save: '保存', upload: '點擊或拖拽上傳商品圖片', uploadHint: '至少 1 張，最多 3 張；單張 1MB、合計 2MB 以內', confirmDelete: '確定刪除該衍生商品嗎？刪除後無法恢復。', saved: '商品已保存', deleted: '商品已刪除', saveFailed: '保存失敗，請清理瀏覽器儲存空間後重試', imageType: '僅支持 JPG、PNG、WEBP 圖片', imageSize: '單張圖片不能超過 1MB', imageTotal: '商品圖片合計不能超過 2MB', imageCount: '商品圖片不能超過 3 張', imageRead: '圖片讀取失敗，請重新選擇', removeImage: '刪除圖片', count: '件商品', units: [['个','個'],['件','件'],['套','套'],['盒','盒'],['箱','箱'],['包','包']] },
    en: { title: 'Derivative Products', add: 'Add Product', search: 'Search by product name', image: 'Images', name: 'Product Name', description: 'Short Description', price: 'Price', updated: 'Updated', actions: 'Actions', edit: 'Edit', remove: 'Delete', empty: 'No matching products', createTitle: 'Add Product', editTitle: 'Edit Product', unit: 'Unit', cancel: 'Cancel', save: 'Save', upload: 'Click or drag images here', uploadHint: '1–3 images; max 1MB each and 2MB total', confirmDelete: 'Delete this derivative product? This cannot be undone.', saved: 'Product saved', deleted: 'Product deleted', saveFailed: 'Save failed. Clear browser storage and try again.', imageType: 'Only JPG, PNG and WEBP images are supported', imageSize: 'Each image must be 1MB or smaller', imageTotal: 'Product images must be 2MB or smaller in total', imageCount: 'You can upload up to 3 images', imageRead: 'The image could not be read. Select it again.', removeImage: 'Remove image', count: 'products', units: [['个','item'],['件','piece'],['套','set'],['盒','box'],['箱','carton'],['包','pack']] },
  };

  Object.assign(dictionary['zh-CN'], { total: '共 {count} 件商品', previous: '上一页', next: '下一页', perPage: '条 / 页', galleryTitle: '商品图片', galleryClose: '关闭图片', galleryPrevious: '上一张图片', galleryNext: '下一张图片', galleryOpen: '查看商品图片' });
  Object.assign(dictionary['zh-HK'], { total: '共 {count} 件商品', previous: '上一頁', next: '下一頁', perPage: '條 / 頁', galleryTitle: '商品圖片', galleryClose: '關閉圖片', galleryPrevious: '上一張圖片', galleryNext: '下一張圖片', galleryOpen: '查看商品圖片' });
  Object.assign(dictionary.en, { total: '{count} products', previous: 'Previous page', next: 'Next page', perPage: 'per page', galleryTitle: 'Product Images', galleryClose: 'Close images', galleryPrevious: 'Previous image', galleryNext: 'Next image', galleryOpen: 'View product images' });

  const productTranslations = {
    secureLock: {
      'zh-CN': ['高强度密码锁', '防剪锁梁 · 四位密码 · 仓门适配'],
      'zh-HK': ['高強度密碼鎖', '防剪鎖樑 · 四位密碼 · 倉門適配'],
      en: ['High-strength Combination Lock', '4-digit cut-safe lock'],
    },
    foldingBox: {
      'zh-CN': ['折叠收纳箱 45L', '透明可视 · 可叠放 · 到手即用'],
      'zh-HK': ['摺疊收納箱 45L', '透明可視 · 可疊放 · 到手即用'],
      en: ['Foldable Storage Box 45L', 'Clear, foldable, 45L'],
    },
    movingBoxes: {
      'zh-CN': ['加固搬家箱 3件装', '双层瓦楞 · 承重30kg · 附标签'],
      'zh-HK': ['加固搬家箱 3件裝', '雙層瓦楞 · 承重30kg · 附標籤'],
      en: ['Reinforced Moving Boxes (3 pcs)', '3 boxes, 30kg each'],
    },
  };

  function localizeProduct(product, language = 'zh-CN') {
    const translated = productTranslations[product?.i18nKey]?.[language];
    return translated ? { ...cloneProduct(product), name: translated[0], description: translated[1] } : cloneProduct(product);
  }

  function formatLocalizedPrice(price, unit, language = 'zh-CN') {
    const copy = dictionary[language] || dictionary['zh-CN'];
    const label = copy.units.find(([value]) => value === unit)?.[1] || unit;
    const value = Number(price);
    const amount = Number.isInteger(value) ? String(value) : value.toFixed(2);
    return `HK$${amount} / ${label}`;
  }

  function paginateProducts(records, requestedPage = 1, pageSize = 10) {
    const rows = Array.isArray(records) ? records : [];
    const normalizedSize = Math.max(1, Number(pageSize) || 10);
    const totalPages = Math.max(1, Math.ceil(rows.length / normalizedSize));
    const currentPage = Math.min(totalPages, Math.max(1, Number(requestedPage) || 1));
    const start = (currentPage - 1) * normalizedSize;
    return { records: rows.slice(start, start + normalizedSize), currentPage, totalPages, total: rows.length, pageSize: normalizedSize };
  }

  function moveGalleryIndex(currentIndex, directionOrIndex, imageCount, absolute = false) {
    const lastIndex = Math.max(0, Number(imageCount || 0) - 1);
    const next = absolute ? Number(directionOrIndex) : Number(currentIndex || 0) + Number(directionOrIndex || 0);
    return Math.min(lastIndex, Math.max(0, Number.isFinite(next) ? next : 0));
  }

  function applyGalleryNavigationState(previous, next, currentIndex, imageCount) {
    const count = Math.max(0, Number(imageCount) || 0);
    const single = count <= 1;
    previous.hidden = false;
    next.hidden = false;
    previous.disabled = currentIndex <= 0;
    next.disabled = currentIndex >= Math.max(0, count - 1);
    for (const button of [previous, next]) {
      if (single) button.classList.add('is-placeholder');
      else button.classList.remove('is-placeholder');
    }
  }

  function resolveDerivativeLanguage(initialLanguage, documentLanguage, search = '') {
    const requested = initialLanguage || documentLanguage || new URLSearchParams(search).get('lang') || 'zh-CN';
    return ['zh-CN', 'zh-HK', 'en'].includes(requested) ? requested : 'zh-CN';
  }

  function dispatchDerivativeClick(target, handlers = {}) {
    const data = target?.dataset || {};
    const has = (name) => Object.prototype.hasOwnProperty.call(data, name);
    if (has('dpmCreate')) handlers.create?.();
    else if (has('dpmClose')) handlers.close?.();
    else if (has('dpmEdit')) handlers.edit?.(data.dpmEdit);
    else if (has('dpmRemoveImage')) handlers.removeImage?.(Number(data.dpmRemoveImage));
    else if (has('dpmDelete')) handlers.remove?.(data.dpmDelete);
    else if (has('dpmViewImages')) handlers.viewImages?.(data.dpmViewImages);
    else if (has('dpmGalleryClose')) handlers.closeGallery?.();
    else if (has('dpmGalleryPrev')) handlers.moveGallery?.(-1);
    else if (has('dpmGalleryNext')) handlers.moveGallery?.(1);
    else if (has('dpmGalleryThumb')) handlers.selectGallery?.(Number(data.dpmGalleryThumb));
    else if (has('dpmPage')) handlers.page?.(Number(data.dpmPage));
    else return false;
    return true;
  }

  const validationMessages = {
    en: { '请填写商品名称': 'Enter a product name', '请填写商品简描述': 'Enter a short description', '商品简描述最多 20 个字': 'Short description must be 20 characters or fewer', '请上传商品图片': 'Upload at least one product image', '商品图片不能超过 3 张': 'You can upload up to 3 images', '请填写商品价格': 'Enter a product price', '商品价格必须大于 0': 'Product price must be greater than 0', '请选择价格单位': 'Select a price unit' },
    'zh-HK': { '请填写商品名称': '請填寫商品名稱', '请填写商品简描述': '請填寫商品簡描述', '商品简描述最多 20 个字': '商品簡描述最多 20 個字', '请上传商品图片': '請上傳商品圖片', '商品图片不能超过 3 张': '商品圖片不能超過 3 張', '请填写商品价格': '請填寫商品價格', '商品价格必须大于 0': '商品價格必須大於 0', '请选择价格单位': '請選擇價格單位' },
  };

  function localizedValidationErrors(errors, language) {
    const messages = validationMessages[language] || {};
    return Object.fromEntries(Object.entries(errors).map(([field, message]) => [field, messages[message] || message]));
  }

  function validateImageFiles(files, existing = 0) {
    const list = [...(files || [])];
    const existingImages = Array.isArray(existing) ? existing : [];
    const existingCount = existingImages.length || Number(existing) || 0;
    const existingSize = existingImages.reduce((total, image) => total + (Number(image.size) || 0), 0);
    const selectedSize = list.reduce((total, file) => total + (Number(file.size) || 0), 0);
    const errors = [];
    if (existingCount + list.length > 3) errors.push('count');
    if (list.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) errors.push('type');
    const oversized = list.some((file) => Number(file.size) > 1024 * 1024);
    if (oversized) errors.push('size');
    else if (existingSize + selectedSize > 2 * 1024 * 1024) errors.push('totalSize');
    return errors;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  const demoProducts = [
    { id: 'DP-0001', i18nKey: 'secureLock', name: '高强度密码锁', description: '防剪锁梁 · 四位密码 · 仓门适配', images: [{ name: 'secure-lock.png', url: '迷你仓/assets/retail/secure-lock.png' }], price: 128, unit: '个', updatedAt: '2026-08-20 10:30' },
    { id: 'DP-0002', i18nKey: 'foldingBox', name: '折叠收纳箱 45L', description: '透明可视 · 可叠放 · 到手即用', images: [{ name: 'folding-box-45l.png', url: '迷你仓/assets/retail/folding-box-45l.png' }], price: 88, unit: '个', updatedAt: '2026-08-19 16:20' },
    { id: 'DP-0003', i18nKey: 'movingBoxes', name: '加固搬家箱 3件装', description: '双层瓦楞 · 承重30kg · 附标签', images: [{ name: 'moving-box-set.png', url: '迷你仓/assets/retail/moving-box-set.png' }], price: 68, unit: '套', updatedAt: '2026-08-18 09:45' },
  ];

  function selectInitialProducts(stored) {
    if (!Array.isArray(stored)) return demoProducts.map(cloneProduct);
    const legacyNames = ['One Storage 收纳袋', '迷你箱分类标签套装', '防潮除湿包'];
    const isLegacyDemo = stored.length === legacyNames.length && legacyNames.every((name, index) => stored[index]?.name === name);
    if (isLegacyDemo) return demoProducts.map(cloneProduct);
    const retailKeys = { '高强度密码锁': 'secureLock', '折叠收纳箱 45L': 'foldingBox', '加固搬家箱 3件装': 'movingBoxes' };
    return stored.map((item) => item?.i18nKey || !retailKeys[item?.name] ? item : { ...item, i18nKey: retailKeys[item.name] });
  }

  function bindInteractionEvents(root, listeners) {
    Object.entries(listeners).forEach(([type, listener]) => root.addEventListener(type, listener, true));
  }

  function dispatchDerivativeImageDrop(event, onFiles) {
    const zone = event?.composedPath?.().find((node) => node?.matches?.('[data-dpm-upload]'));
    if (!zone) return false;
    event.preventDefault?.();
    const hovering = event.type === 'dragenter' || event.type === 'dragover';
    if (hovering) zone.classList.add('is-dragging');
    else zone.classList.remove('is-dragging');
    if (event.type === 'drop') onFiles?.([...(event.dataTransfer?.files || [])]);
    return true;
  }

  function renderListImages(images, productId, copy) {
    const list = Array.isArray(images) ? images : [];
    const thumbnails = list.slice(0, 3).map((image) => `<img src="${escapeHtml(image.url)}" alt="">`).join('');
    return `<button type="button" class="dpm-thumb-stack" data-dpm-view-images="${escapeHtml(productId)}" aria-label="${escapeHtml(copy.galleryOpen)}">${thumbnails}${list.length > 1 ? `<span>${list.length}</span>` : ''}</button>`;
  }

  function renderProductRow(item, language, copy) {
    const product = localizeProduct(item, language);
    return `<tr><td>${renderListImages(product.images, product.id, copy)}</td><td><b>${escapeHtml(product.name)}</b><br><small>${escapeHtml(product.id)}</small></td><td class="dpm-description">${escapeHtml(product.description)}</td><td><b>${escapeHtml(formatLocalizedPrice(product.price, product.unit, language))}</b></td><td>${escapeHtml(product.updatedAt || '—')}</td><td><button type="button" class="dpm-link" data-dpm-edit="${escapeHtml(product.id)}">${copy.edit}</button><button type="button" class="dpm-link danger" data-dpm-delete="${escapeHtml(product.id)}">${copy.remove}</button></td></tr>`;
  }

  function renderPaginationMarkup(language, pagination) {
    const copy = dictionary[language] || dictionary['zh-CN'];
    const pages = Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => `<button type="button" data-dpm-page="${page}" class="${page === pagination.currentPage ? 'active' : ''}" aria-current="${page === pagination.currentPage ? 'page' : 'false'}">${page}</button>`).join('');
    return `<footer class="dpm-pagination" data-dpm-pagination><span>${escapeHtml(copy.total.replace('{count}', String(pagination.total)))}</span><div><button type="button" data-dpm-page="${pagination.currentPage - 1}" aria-label="${escapeHtml(copy.previous)}"${pagination.currentPage === 1 ? ' disabled' : ''}>‹</button>${pages}<button type="button" data-dpm-page="${pagination.currentPage + 1}" aria-label="${escapeHtml(copy.next)}"${pagination.currentPage === pagination.totalPages ? ' disabled' : ''}>›</button><label><select data-dpm-page-size aria-label="${escapeHtml(copy.perPage)}"><option value="10"${pagination.pageSize === 10 ? ' selected' : ''}>10 ${copy.perPage}</option><option value="20"${pagination.pageSize === 20 ? ' selected' : ''}>20 ${copy.perPage}</option><option value="50"${pagination.pageSize === 50 ? ' selected' : ''}>50 ${copy.perPage}</option></select></label></div></footer>`;
  }

  function renderDerivativeProductPageMarkup(language = 'zh-CN') {
    const copy = dictionary[language] || dictionary['zh-CN'];
    const initialPagination = paginateProducts(demoProducts, 1, 10);
    const initialRows = initialPagination.records.map((item) => renderProductRow(item, language, copy)).join('');
    const unitOptions = copy.units.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
    return `<div class="dpm-heading"><h1>${copy.title}</h1><button type="button" class="dpm-primary" data-dpm-create>+ ${copy.add}</button></div><section class="dpm-card"><div class="dpm-toolbar"><input data-dpm-search type="search" placeholder="${copy.search}" aria-label="${copy.search}"><span data-dpm-count></span></div><div class="dpm-table-wrap"><table class="dpm-table"><thead><tr><th>${copy.image}</th><th>${copy.name}</th><th>${copy.description}</th><th>${copy.price}</th><th>${copy.updated}</th><th>${copy.actions}</th></tr></thead><tbody data-dpm-body>${initialRows}</tbody></table></div>${renderPaginationMarkup(language, initialPagination)}</section><div class="dpm-modal" data-dpm-modal hidden><div class="dpm-dialog" role="dialog" aria-modal="true" aria-labelledby="dpm-dialog-title"><header><h2 id="dpm-dialog-title" data-dpm-dialog-title>${copy.createTitle}</h2><button type="button" data-dpm-close aria-label="${copy.cancel}">×</button></header><form data-dpm-form><div class="dpm-form-body"><label><span><b>*</b>${copy.name}</span><input name="name" maxlength="80"><small data-dpm-error="name"></small></label><label class="wide"><span><b>*</b>${copy.description} <em data-dpm-char-count>0/20</em></span><textarea name="description" maxlength="20" rows="3"></textarea><small data-dpm-error="description"></small></label><label><span><b>*</b>${copy.price}</span><input name="price" type="number" min="0.01" step="0.01" placeholder="0.00"><small data-dpm-error="price"></small></label><label><span><b>*</b>${copy.unit}</span><select name="unit"><option value="">${copy.unit}</option>${unitOptions}</select><small data-dpm-error="unit"></small></label><label class="wide"><span><b>*</b>${copy.image}</span><label class="dpm-upload" data-dpm-upload><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple><strong>${copy.upload}</strong><small>${copy.uploadHint}</small></label><div class="dpm-previews" data-dpm-previews></div><small data-dpm-error="images"></small></label></div><footer><button type="button" class="dpm-secondary" data-dpm-close>${copy.cancel}</button><button type="submit" class="dpm-primary">${copy.save}</button></footer></form></div></div><div class="dpm-gallery" data-dpm-gallery hidden><button type="button" class="dpm-gallery-backdrop" data-dpm-gallery-close aria-label="${copy.galleryClose}"></button><section class="dpm-gallery-panel" role="dialog" aria-modal="true" aria-labelledby="dpm-gallery-title"><header><h2 id="dpm-gallery-title" data-dpm-gallery-title>${copy.galleryTitle}</h2><button type="button" data-dpm-gallery-close aria-label="${copy.galleryClose}">×</button></header><div class="dpm-gallery-stage"><button type="button" data-dpm-gallery-prev aria-label="${copy.galleryPrevious}">‹</button><img data-dpm-gallery-image src="" alt=""><button type="button" data-dpm-gallery-next aria-label="${copy.galleryNext}">›</button></div><div class="dpm-gallery-meta"><span data-dpm-gallery-count></span><div data-dpm-gallery-thumbs></div></div></section></div><div class="dpm-toast" data-dpm-toast></div>`;
  }

  function resolveDerivativePage(eventPage, activePage, search = '') {
    if (eventPage) return eventPage;
    const section = new URLSearchParams(search).get('section');
    return section || activePage || '';
  }

  function syncDerivativePageVisibility(activePage, main, page, renderPage) {
    if (!main || !page) return false;
    const shouldShow = activePage === 'derivative-products';
    if (shouldShow) {
      const needsAttach = !page.isConnected || page.parentElement !== main;
      const needsRender = needsAttach || !page.classList.contains('active');
      if (needsAttach) {
        page.parentElement?.classList?.remove('dpm-host-active');
        main.append(page);
      }
      main.classList.add('dpm-host-active');
      page.classList.add('active');
      if (needsRender && typeof renderPage === 'function') renderPage();
    } else {
      main.classList.remove('dpm-host-active');
      page.parentElement?.classList?.remove('dpm-host-active');
      page.classList.remove('active');
    }
    return shouldShow;
  }

  const styles = `
    .main.dpm-host-active>:not(#aiwa-derivative-products-page){display:none!important}
    #aiwa-derivative-products-page{display:none;padding:0 8px 32px;color:#252128}#aiwa-derivative-products-page.active{display:block}
    .dpm-heading{display:flex;align-items:center;justify-content:space-between;margin:4px 0 22px}.dpm-heading h1{margin:0;font-size:24px}.dpm-primary,.dpm-secondary{border-radius:9px;padding:10px 17px;font-weight:700;cursor:pointer}.dpm-primary{border:0;background:#8d5a9e;color:#fff}.dpm-secondary{border:1px solid #d8d1da;background:transparent;color:inherit}
    .dpm-card{overflow:hidden;border:1px solid #ebe6ed;border-radius:14px;background:#fff}.dpm-toolbar{display:flex;align-items:center;justify-content:space-between;padding:18px}.dpm-toolbar input{width:min(360px,100%);height:40px;border:1px solid #dcd4df;border-radius:8px;padding:0 13px}.dpm-toolbar span{font-size:12px;color:#807886}.dpm-table-wrap{overflow:auto}.dpm-table{width:100%;border-collapse:collapse}.dpm-table th,.dpm-table td{padding:14px;text-align:left;border-top:1px solid #eee9f0;vertical-align:middle}.dpm-table th{background:#faf8fb;color:#716978;font-size:13px;white-space:nowrap}.dpm-thumb-stack{position:relative;display:flex;padding:0;border:0;background:transparent;cursor:zoom-in}.dpm-thumb-stack img{width:64px;height:48px;object-fit:cover;border:2px solid #fff;border-radius:8px;background:#eee}.dpm-thumb-stack img+img{margin-left:-18px}.dpm-thumb-stack>span{position:absolute;right:-7px;bottom:-5px;display:grid;place-items:center;min-width:21px;height:21px;padding:0 5px;border:2px solid #fff;border-radius:12px;background:#8d5a9e;color:#fff;font-size:10px;font-weight:700}.dpm-description{max-width:260px;color:#716978}.dpm-link{border:0;background:none;color:#8d5a9e;cursor:pointer;padding:5px 7px}.dpm-link.danger{color:#d34b52}.dpm-empty{text-align:center!important;color:#948d98;padding:42px!important}.dpm-pagination{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 18px;border-top:1px solid #eee9f0;color:#807886;font-size:12px}.dpm-pagination>div{display:flex;align-items:center;gap:6px}.dpm-pagination button{min-width:32px;height:32px;padding:0 9px;border:1px solid #ded7e1;border-radius:8px;background:#fff;color:#4d4651;cursor:pointer}.dpm-pagination button.active{border-color:#8d5a9e;background:#8d5a9e;color:#fff}.dpm-pagination button:disabled{cursor:not-allowed;opacity:.42}.dpm-pagination select{height:32px;margin-left:4px;padding:0 8px;border:1px solid #ded7e1;border-radius:8px;background:#fff;color:#4d4651}
    .dpm-modal[hidden],.dpm-gallery[hidden]{display:none}.dpm-modal{position:fixed;inset:0;z-index:14000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(20,15,23,.56)}.dpm-dialog{width:min(680px,96vw);max-height:92vh;overflow:auto;border-radius:16px;background:#fff;color:#252128;box-shadow:0 24px 70px rgba(0,0,0,.3)}.dpm-dialog>header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #eee8f0}.dpm-dialog h2{margin:0;font-size:19px}.dpm-dialog>header button{border:0;background:none;font-size:26px;cursor:pointer}.dpm-form-body{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:24px}.dpm-form-body>label{display:grid;gap:7px;font-size:13px}.dpm-form-body>label.wide{grid-column:1/-1}.dpm-form-body label>span{font-weight:700}.dpm-form-body label>span b{margin-right:3px;color:#d84a50}.dpm-form-body label>span em{float:right;color:#948d98;font-style:normal;font-weight:400}.dpm-form-body input:not([type=file]),.dpm-form-body select,.dpm-form-body textarea{box-sizing:border-box;width:100%;border:1px solid #ddd5e0;border-radius:8px;padding:10px 12px;background:transparent;color:inherit;font:inherit}.dpm-form-body small[data-dpm-error]{min-height:16px;color:#d84a50}.dpm-upload{display:flex;align-items:center;gap:8px;border:1px dashed #cbbbd0;border-radius:10px;padding:16px;cursor:pointer}.dpm-upload input{width:1px;height:1px;opacity:0}.dpm-upload small{color:#8b828f}.dpm-previews{display:flex;gap:10px;flex-wrap:wrap}.dpm-preview{position:relative}.dpm-preview img{width:86px;height:68px;object-fit:cover;border:1px solid #eee;border-radius:9px}.dpm-preview button{position:absolute;right:-6px;top:-6px;width:20px;height:20px;border:0;border-radius:50%;background:#d84a50;color:#fff;cursor:pointer}.dpm-dialog footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid #eee8f0}.dpm-gallery{position:fixed;inset:0;z-index:14500;display:grid;place-items:center;padding:22px}.dpm-gallery-backdrop{position:absolute;inset:0;width:100%;height:100%;border:0;background:rgba(15,11,17,.78)}.dpm-gallery-panel{position:relative;width:min(860px,94vw);max-height:92vh;overflow:auto;border-radius:16px;background:#fff;color:#252128;box-shadow:0 24px 80px rgba(0,0,0,.42)}.dpm-gallery-panel>header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #eee8f0}.dpm-gallery-panel h2{margin:0;font-size:18px}.dpm-gallery-panel>header button{border:0;background:transparent;font-size:26px;cursor:pointer}.dpm-gallery-stage{display:grid;grid-template-columns:48px minmax(0,1fr) 48px;align-items:center;gap:12px;padding:20px}.dpm-gallery-stage>img{width:100%;height:min(62vh,560px);object-fit:contain;border-radius:12px;background:#f5f1f6}.dpm-gallery-stage>button{width:42px;height:42px;border:1px solid #ddd5e0;border-radius:50%;background:#fff;color:#8d5a9e;font-size:28px;cursor:pointer}.dpm-gallery-stage>button:disabled{opacity:.25;cursor:not-allowed}.dpm-gallery-meta{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:0 20px 20px;color:#807886;font-size:12px}.dpm-gallery-meta>div{display:flex;gap:8px}.dpm-gallery-meta button{padding:0;border:2px solid transparent;border-radius:9px;background:transparent;cursor:pointer}.dpm-gallery-meta button.active{border-color:#8d5a9e}.dpm-gallery-meta img{display:block;width:58px;height:44px;object-fit:cover;border-radius:7px}.dpm-toast{position:fixed;right:24px;bottom:24px;z-index:15000;display:none;border-radius:9px;background:#252128;color:#fff;padding:11px 16px}.dpm-toast.show{display:block}
    .dpm-gallery-stage>[data-dpm-gallery-prev]{grid-column:1}.dpm-gallery-stage>[data-dpm-gallery-image]{grid-column:2}.dpm-gallery-stage>[data-dpm-gallery-next]{grid-column:3}.dpm-gallery-stage>button.is-placeholder{visibility:hidden;pointer-events:none}
    :host(.theme-dark-root) #aiwa-derivative-products-page{color:#eee8f1}:host(.theme-dark-root) .dpm-card,:host(.theme-dark-root) .dpm-dialog,:host(.theme-dark-root) .dpm-gallery-panel{border-color:#443a48;background:#211c24;color:#eee8f1}:host(.theme-dark-root) .dpm-table th{background:#29222d;color:#c9bdce}:host(.theme-dark-root) .dpm-table td,:host(.theme-dark-root) .dpm-dialog>header,:host(.theme-dark-root) .dpm-dialog footer,:host(.theme-dark-root) .dpm-pagination,:host(.theme-dark-root) .dpm-gallery-panel>header{border-color:#3b3240}:host(.theme-dark-root) .dpm-toolbar input,:host(.theme-dark-root) .dpm-form-body input:not([type=file]),:host(.theme-dark-root) .dpm-form-body select,:host(.theme-dark-root) .dpm-form-body textarea,:host(.theme-dark-root) .dpm-pagination button,:host(.theme-dark-root) .dpm-pagination select,:host(.theme-dark-root) .dpm-gallery-stage>button{border-color:#514557;background:#211c24;color:#eee8f1}:host(.theme-dark-root) .dpm-gallery-stage>img{background:#18131b}
    .dpm-upload{transition:border-color .16s ease,background-color .16s ease}.dpm-upload.is-dragging{border-color:#8d5a9e;background:rgba(141,90,158,.1)}
    :host(.theme-dark-root) .dpm-table th,:host(.theme-dark-root) .dpm-table td{border-color:#3b3240}
    @media(max-width:700px){.dpm-form-body{grid-template-columns:1fr}.dpm-form-body>label.wide{grid-column:auto}.dpm-heading{align-items:flex-start;gap:12px}.dpm-table{min-width:760px}}
  `;

  function canMountDerivativeProductPage(host, viewModel, hostPending = false) {
    return Boolean(!hostPending && viewModel && host?.shadowRoot?.querySelector('.main'));
  }

  let mounted = false;
  function mount() {
    if (mounted || typeof document === 'undefined') return;
    const connect = () => {
      if (mounted) return true;
      const host = document.getElementById('mini-storage-native-host');
      const root = host?.shadowRoot;
      const main = root?.querySelector('.main');
      if (!canMountDerivativeProductPage(host, window.__aiwaMiniStorageVm) || !root || !main) return false;
      const stored = (() => { try { return JSON.parse(localStorage.getItem('aiwa-derivative-products') || 'null'); } catch (_) { return null; } })();
      const store = createDerivativeProductStore(selectInitialProducts(stored));
      let language = resolveDerivativeLanguage(window.__aiwaMiniStorageInitialLanguage, document.documentElement.dataset.language || document.documentElement.lang, location.search);
      let keyword = '';
      let currentPage = 1;
      let pageSize = 10;
      let editingId = null;
      let draftImages = [];
      let galleryProductId = null;
      let galleryIndex = 0;
      let style = root.querySelector('style[data-dpm-styles]');
      if (!style) { style = document.createElement('style'); style.dataset.dpmStyles = ''; style.textContent = styles; root.append(style); }
      let page = root.querySelector('#aiwa-derivative-products-page');
      if (!page) { page = document.createElement('section'); page.id = 'aiwa-derivative-products-page'; }
      if (!page.isConnected || page.parentElement !== main) main.append(page);

      const copy = () => dictionary[language] || dictionary['zh-CN'];
      const saveRows = (rows = store.list()) => { try { localStorage.setItem('aiwa-derivative-products', JSON.stringify(rows)); return true; } catch (_) { return false; } };
      const showToast = (message) => { const toast = page.querySelector('[data-dpm-toast]'); if (!toast) return; toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); };
      const renderRows = () => {
        const query = String(keyword || '').trim().toLocaleLowerCase();
        const rows = store.list().map((item) => localizeProduct(item, language)).filter((item) => !query || item.name.toLocaleLowerCase().includes(query));
        const pagination = paginateProducts(rows, currentPage, pageSize);
        currentPage = pagination.currentPage;
        const body = page.querySelector('[data-dpm-body]');
        if (!body) return;
        body.innerHTML = pagination.records.length ? pagination.records.map((item) => renderProductRow(item, language, copy())).join('') : `<tr><td colspan="6" class="dpm-empty">${copy().empty}</td></tr>`;
        page.querySelector('[data-dpm-count]').textContent = `${pagination.total} ${copy().count}`;
        const paginationRoot = page.querySelector('[data-dpm-pagination]');
        if (paginationRoot) paginationRoot.outerHTML = renderPaginationMarkup(language, pagination);
      };
      const renderPage = () => {
        page.innerHTML = renderDerivativeProductPageMarkup(language);
        page.querySelector('[data-dpm-search]').value = keyword;
        renderRows();
      };
      const renderPreviews = () => { const previews = page.querySelector('[data-dpm-previews]'); if (previews) previews.innerHTML = draftImages.map((image, index) => `<span class="dpm-preview"><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.name)}"><button type="button" data-dpm-remove-image="${index}" aria-label="${copy().removeImage}">×</button></span>`).join(''); };
      const closeGallery = () => { const gallery = page.querySelector('[data-dpm-gallery]'); if (gallery) gallery.hidden = true; galleryProductId = null; galleryIndex = 0; };
      const renderGallery = () => {
        const item = store.list().find((row) => row.id === galleryProductId);
        const gallery = page.querySelector('[data-dpm-gallery]');
        if (!item || !item.images.length || !gallery) { closeGallery(); return; }
        const product = localizeProduct(item, language);
        galleryIndex = moveGalleryIndex(galleryIndex, galleryIndex, item.images.length, true);
        const image = item.images[galleryIndex];
        page.querySelector('[data-dpm-gallery-title]').textContent = `${copy().galleryTitle} · ${product.name}`;
        const mainImage = page.querySelector('[data-dpm-gallery-image]'); mainImage.src = image.url; mainImage.alt = image.name || product.name;
        page.querySelector('[data-dpm-gallery-count]').textContent = `${galleryIndex + 1} / ${item.images.length}`;
        const previous = page.querySelector('[data-dpm-gallery-prev]'); const next = page.querySelector('[data-dpm-gallery-next]');
        applyGalleryNavigationState(previous, next, galleryIndex, item.images.length);
        page.querySelector('[data-dpm-gallery-thumbs]').innerHTML = item.images.map((entry, index) => `<button type="button" data-dpm-gallery-thumb="${index}" class="${index === galleryIndex ? 'active' : ''}" aria-label="${escapeHtml(`${copy().galleryTitle} ${index + 1}`)}"><img src="${escapeHtml(entry.url)}" alt=""></button>`).join('');
      };
      const openGallery = (id) => { galleryProductId = id; galleryIndex = 0; const gallery = page.querySelector('[data-dpm-gallery]'); if (!gallery) return; renderGallery(); gallery.hidden = false; setTimeout(() => page.querySelector('[data-dpm-gallery-close]')?.focus(), 0); };
      const moveGallery = (direction) => { const item = store.list().find((row) => row.id === galleryProductId); if (!item) return; galleryIndex = moveGalleryIndex(galleryIndex, direction, item.images.length); renderGallery(); };
      const selectGallery = (index) => { const item = store.list().find((row) => row.id === galleryProductId); if (!item) return; galleryIndex = moveGalleryIndex(galleryIndex, index, item.images.length, true); renderGallery(); };
      const openForm = (id = null) => {
        editingId = id;
        const item = id ? store.list().find((row) => row.id === id) : null;
        const displayItem = item ? localizeProduct(item, language) : null;
        draftImages = (item?.images || []).map((image) => ({ ...image }));
        const form = page.querySelector('[data-dpm-form]');
        form.reset();
        form.elements.name.value = displayItem?.name || '';
        form.elements.description.value = displayItem?.description || '';
        form.elements.price.value = item?.price || '';
        form.elements.unit.value = item?.unit || '';
        page.querySelector('[data-dpm-dialog-title]').textContent = id ? copy().editTitle : copy().createTitle;
        page.querySelector('[data-dpm-char-count]').textContent = `${textLength(displayItem?.description)}/20`;
        page.querySelectorAll('[data-dpm-error]').forEach((node) => { node.textContent = ''; });
        renderPreviews();
        page.querySelector('[data-dpm-modal]').hidden = false;
        setTimeout(() => form.elements.name.focus(), 0);
      };
      const closeForm = () => { page.querySelector('[data-dpm-modal]').hidden = true; };
      const showErrors = (errors) => page.querySelectorAll('[data-dpm-error]').forEach((node) => { node.textContent = errors[node.dataset.dpmError] || ''; });
      const readFiles = (files) => Promise.all([...files].map((file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, url: reader.result, size: Number(file.size) || 0 }); reader.onerror = reject; reader.readAsDataURL(file); })));
      const processImageFiles = async (files, input = null) => {
        const list = [...(files || [])];
        const fileErrors = validateImageFiles(list, draftImages);
        if (fileErrors.length) {
          const message = fileErrors.includes('count') ? copy().imageCount : fileErrors.includes('type') ? copy().imageType : fileErrors.includes('size') ? copy().imageSize : copy().imageTotal;
          showErrors({ images: message });
          if (input) input.value = '';
          return;
        }
        try { draftImages.push(...await readFiles(list)); if (input) input.value = ''; renderPreviews(); showErrors({}); }
        catch (_) { if (input) input.value = ''; showErrors({ images: copy().imageRead }); }
      };

      const pathTarget = (event, selector) => event.composedPath().find((node) => node?.matches?.(selector));
      const handleInput = (event) => {
        const target = pathTarget(event, '#aiwa-derivative-products-page input, #aiwa-derivative-products-page textarea');
        if (!target) return;
        if (target.matches('[data-dpm-search]')) { keyword = target.value; currentPage = 1; renderRows(); }
        if (target.name === 'description') page.querySelector('[data-dpm-char-count]').textContent = `${textLength(target.value)}/20`;
      };
      const handleChange = async (event) => {
        const pageSizeTarget = event.target?.closest?.('[data-dpm-page-size]');
        if (pageSizeTarget) { pageSize = Number(pageSizeTarget.value) || 10; currentPage = 1; renderRows(); return; }
        const target = pathTarget(event, '#aiwa-derivative-products-page input[name="images"]');
        if (!target) return;
        await processImageFiles(target.files, target);
      };
      const handleImageDrop = (event) => dispatchDerivativeImageDrop(event, (files) => processImageFiles(files));
      const handleSubmit = (event) => {
        const form = pathTarget(event, '#aiwa-derivative-products-page [data-dpm-form]');
        if (!form) return;
        event.preventDefault();
        const values = Object.fromEntries(new FormData(form).entries());
        const draft = { name: values.name, description: values.description, images: draftImages, price: values.price, unit: values.unit };
        const errors = validateDerivativeProduct(draft); showErrors(localizedValidationErrors(errors, language)); if (Object.keys(errors).length) return;
        const committed = store.commit((draftStore) => editingId ? draftStore.update(editingId, draft) : draftStore.create(draft), saveRows);
        if (!committed.ok) { showToast(copy().saveFailed); return; }
        if (!editingId) currentPage = 1;
        closeForm(); renderRows(); showToast(copy().saved);
      };
      const handleClick = (event) => {
        const target = event.target?.closest?.('button');
        if (!target || !page.contains(target) || target.disabled) return;
        dispatchDerivativeClick(target, {
          create: () => openForm(),
          close: closeForm,
          edit: openForm,
          removeImage: (index) => { draftImages.splice(index, 1); renderPreviews(); },
          remove: (id) => { if (!window.confirm(copy().confirmDelete)) return; const committed = store.commit((draftStore) => draftStore.remove(id), saveRows); if (!committed.ok) { showToast(copy().saveFailed); return; } renderRows(); showToast(copy().deleted); },
          viewImages: openGallery,
          closeGallery,
          moveGallery,
          selectGallery,
          page: (nextPage) => { currentPage = nextPage; renderRows(); },
        });
      };
      const handleKeydown = (event) => { if (event.key === 'Escape' && !page.querySelector('[data-dpm-gallery]')?.hidden) closeGallery(); };
      bindInteractionEvents(page, { input: handleInput, change: handleChange, submit: handleSubmit, click: handleClick, keydown: handleKeydown, dragenter: handleImageDrop, dragover: handleImageDrop, dragleave: handleImageDrop, drop: handleImageDrop });

      const currentMain = () => host.shadowRoot?.querySelector('.main') || main;
      const show = () => syncDerivativePageVisibility('derivative-products', currentMain(), page, renderPage);
      const hide = () => syncDerivativePageVisibility('', currentMain(), page);
      const sync = (event) => { const active = resolveDerivativePage(event?.detail?.page, window.__aiwaMiniStorageVm?.activePage?.value || window.__aiwaMiniStorageVm?.activePage, location.search); active === 'derivative-products' ? show() : hide(); };
      document.addEventListener('aiwa:ministorage-pagechange', sync);
      host.addEventListener('aiwa:ministorage-open', sync);
      document.addEventListener('aiwa:languagechange', (event) => {
        const modalOpen = !page.querySelector('[data-dpm-modal]')?.hidden;
        const galleryOpen = !page.querySelector('[data-dpm-gallery]')?.hidden;
        const galleryDraft = galleryOpen ? { productId: galleryProductId, index: galleryIndex } : null;
        const form = modalOpen ? page.querySelector('[data-dpm-form]') : null;
        const draft = form ? { name: form.elements.name.value, description: form.elements.description.value, price: form.elements.price.value, unit: form.elements.unit.value, images: draftImages.map((image) => ({ ...image })), editingId } : null;
        language = event.detail?.language || 'zh-CN';
        const menu = document.querySelector('[data-mini-storage-page="derivative-products"] span'); if (menu) menu.textContent = copy().title;
        if (!page.classList.contains('active')) return;
        renderPage();
        if (draft) {
          openForm(draft.editingId);
          const nextForm = page.querySelector('[data-dpm-form]');
          nextForm.elements.name.value = draft.name; nextForm.elements.description.value = draft.description; nextForm.elements.price.value = draft.price; nextForm.elements.unit.value = draft.unit;
          draftImages = draft.images; renderPreviews(); page.querySelector('[data-dpm-char-count]').textContent = `${textLength(draft.description)}/20`;
        }
        if (galleryDraft) { galleryProductId = galleryDraft.productId; galleryIndex = galleryDraft.index; const gallery = page.querySelector('[data-dpm-gallery]'); renderGallery(); gallery.hidden = false; }
      });
      sync();
      window.setInterval(sync, 120);
      mounted = true;
      return true;
    };
    document.addEventListener('aiwa:ministorage-ready', connect);
    if (!connect()) { let attempts = 0; const timer = setInterval(() => { attempts += 1; if (connect() || attempts > 80) clearInterval(timer); }, 100); }
  }

  return { validateDerivativeProduct, createDerivativeProductStore, formatPrice, renderDerivativeProductPageMarkup, resolveDerivativePage, syncDerivativePageVisibility, validateImageFiles, localizedValidationErrors, selectInitialProducts, bindInteractionEvents, dispatchDerivativeClick, dispatchDerivativeImageDrop, paginateProducts, moveGalleryIndex, applyGalleryNavigationState, resolveDerivativeLanguage, localizeProduct, canMountDerivativeProductPage, derivativeProductStyles: styles, mount };
});
