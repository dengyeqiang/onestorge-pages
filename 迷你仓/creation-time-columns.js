(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') api.mount();
})(function () {
  'use strict';

  const appendPages = new Set([
    'leads', 'appointments', 'opportunities', 'contracts',
    'insurance', 'payments', 'insurance-products', 'contract-content',
  ]);
  const beforeActionPages = new Set([
    'stores', 'storage', 'renewal', 'transfer', 'box', 'box-products',
  ]);
  const targetPages = new Set([...appendPages, ...beforeActionPages]);
  const sampleTimes = [
    '2026-08-20 10:18:00',
    '2026-08-19 16:42:00',
    '2026-08-18 09:26:00',
    '2026-08-16 14:05:00',
    '2026-08-14 11:37:00',
    '2026-08-12 17:20:00',
    '2026-08-10 08:56:00',
    '2026-08-08 15:14:00',
    '2026-08-06 13:48:00',
    '2026-08-04 09:32:00',
  ];
  const createdHeaderPattern = /^(创建时间|創建時間|建立時間|Created(?: At| Time)?)$/i;
  const actionHeaderPattern = /^(操作|Actions?)$/i;
  const equivalentTimeHeaders = {
    opportunities: /^(新增时间|新增時間)$/,
  };
  const columnWidth = 170;

  function cleanLabel(label) {
    return String(label || '').replace(/\s+/g, ' ').trim();
  }

  function buildColumnPlan(page, headerLabels, rowCount, enhancedPage) {
    const labels = Array.from(headerLabels || [], cleanLabel);
    if (!targetPages.has(page)) return null;
    if (enhancedPage === page) return null;
    if (page === 'checkout' && labels.some((label) => /^(更新时间|更新時間|Updated At)$/i.test(label))) return null;
    const actionIndex = labels.findIndex((label) => actionHeaderPattern.test(label));
    const existingIndex = labels.findIndex((label) => createdHeaderPattern.test(label));
    const insertionIndex = actionIndex >= 0 ? actionIndex : labels.length;
    const cells = Array.from({ length: Math.max(0, Number(rowCount) || 0) }, (_, index) => sampleTimes[index % sampleTimes.length]);
    if (existingIndex >= 0) return null;
    const equivalentIndex = labels.findIndex((label) => equivalentTimeHeaders[page]?.test(label));
    if (equivalentIndex >= 0) return null;
    return {
      insertionIndex,
      header: '创建时间',
      cells,
    };
  }

  function buildMarkedColumnRepair(page, headerLabels, markedHeaderCount, markedBodyCounts) {
    if (!targetPages.has(page)) return null;
    if (page === 'checkout') return null;
    const labels = Array.from(headerLabels || [], cleanLabel);
    if (labels.some((label) => createdHeaderPattern.test(label)) || Number(markedHeaderCount) > 0) return null;
    const counts = Array.from(markedBodyCounts || [], Number);
    if (!counts.length || counts.some((count) => count < 1)) return null;
    const actionIndex = labels.findIndex((label) => actionHeaderPattern.test(label));
    return { insertionIndex: actionIndex >= 0 ? actionIndex : labels.length, restoreHeader: true };
  }

  function insertAt(parent, node, index) {
    parent.insertBefore(node, parent.children[index] || null);
  }

  function expandedTableWidth(width, increment) {
    const match = String(width || '').trim().match(/^(\d+(?:\.\d+)?)px$/i);
    return match ? `${Number(match[1]) + increment}px` : null;
  }

  function cleanupInjectedElementColumns(root) {
    if (!root) return;
    root.querySelectorAll('.el-table').forEach((container) => {
      const injected = Array.from(container.querySelectorAll('col[name="aiwa-created-time"], .aiwa-created-time-column'));
      if (!injected.length) return;
      const tables = [
        container.querySelector('.el-table__header-wrapper table'),
        container.querySelector('.el-table__body-wrapper table'),
      ].filter(Boolean);
      injected.forEach((node) => node.remove());
      tables.forEach((table) => {
        const width = expandedTableWidth(table.style.width || table.getAttribute('width'), -columnWidth);
        if (width) table.style.width = width;
      });
      delete container.dataset.aiwaCreatedTimePage;
    });
  }

  function addCol(table, index) {
    const group = table.querySelector(':scope > colgroup');
    if (!group) return;
    const col = document.createElement('col');
    col.name = 'aiwa-created-time';
    col.style.width = `${columnWidth}px`;
    insertAt(group, col, index);
    const width = expandedTableWidth(table.style.width || table.getAttribute('width'), columnWidth);
    if (width) table.style.width = width;
  }

  function makeHeaderCell(elementTable) {
    const cell = document.createElement('th');
    cell.className = elementTable ? 'el-table__cell aiwa-created-time-column' : 'aiwa-created-time-column';
    cell.innerHTML = elementTable ? '<div class="cell">创建时间</div>' : '创建时间';
    cell.style.minWidth = `${columnWidth}px`;
    return cell;
  }

  function makeBodyCell(value, elementTable) {
    const cell = document.createElement('td');
    cell.className = elementTable ? 'el-table__cell aiwa-created-time-column' : 'aiwa-created-time-column';
    cell.innerHTML = elementTable ? `<div class="cell">${value}</div>` : value;
    cell.style.minWidth = `${columnWidth}px`;
    return cell;
  }

  function repairElementHeader(headerTable, headerRow, repair) {
    addCol(headerTable, repair.insertionIndex);
    insertAt(headerRow, makeHeaderCell(true), repair.insertionIndex);
    return true;
  }

  function renameExistingHeader(headerRow, plan, elementTable) {
    const cell = headerRow.cells[plan.sourceIndex];
    if (!cell) return false;
    const label = elementTable ? cell.querySelector('.cell') : cell;
    if (!label) return false;
    label.textContent = plan.header;
    return true;
  }

  function moveChild(parent, sourceIndex, insertionIndex) {
    const child = parent?.children?.[sourceIndex];
    if (!child) return null;
    parent.insertBefore(child, parent.children[insertionIndex] || null);
    return child || null;
  }

  function moveExistingColumn(headerTable, bodyTable, headerRow, bodyRows, plan, elementTable) {
    if (!renameExistingHeader(headerRow, plan, elementTable)) return false;
    moveChild(headerTable?.querySelector(':scope > colgroup'), plan.sourceIndex, plan.insertionIndex);
    if (bodyTable !== headerTable) moveChild(bodyTable?.querySelector(':scope > colgroup'), plan.sourceIndex, plan.insertionIndex);
    const headerCell = moveChild(headerRow, plan.sourceIndex, plan.insertionIndex);
    const bodyCells = bodyRows.map((row) => moveChild(row, plan.sourceIndex, plan.insertionIndex)).filter(Boolean);
    headerCell?.classList.add('aiwa-created-time-column');
    bodyCells.forEach((cell) => cell.classList.add('aiwa-created-time-column'));
    return true;
  }

  function isEnhancementTargetState(rendered, inOverlay) {
    return Boolean(rendered) && !inOverlay;
  }

  function isEnhancementTarget(table) {
    return isEnhancementTargetState(table.getClientRects().length > 0, Boolean(table.closest('.el-dialog, .el-drawer, [role="dialog"]')));
  }

  function enhanceNativeTable(table, page) {
    if (table.closest('.el-table') || !isEnhancementTarget(table)) return false;
    const headerRow = table.tHead?.rows?.[0];
    if (!headerRow) return false;
    const bodyRows = Array.from(table.tBodies?.[0]?.rows || []).filter((row) => row.cells.length > 1);
    const labels = Array.from(headerRow.cells, (cell) => cleanLabel(cell.textContent));
    const repair = buildMarkedColumnRepair(
      page,
      labels,
      headerRow.querySelectorAll('.aiwa-created-time-column').length,
      bodyRows.map((row) => row.querySelectorAll('.aiwa-created-time-column').length),
    );
    if (repair) {
      insertAt(headerRow, makeHeaderCell(false), repair.insertionIndex);
      table.dataset.aiwaCreatedTimePage = page;
      return true;
    }
    const plan = buildColumnPlan(page, labels, bodyRows.length, table.dataset.aiwaCreatedTimePage);
    if (!plan) return false;
    if (Number.isInteger(plan.renameSourceIndex)) {
      const source = headerRow.cells[plan.renameSourceIndex];
      if (source) source.textContent = plan.renameSourceHeader;
    }
    if (plan.reuseExisting) {
      const renamed = renameExistingHeader(headerRow, plan, false);
      if (renamed) table.dataset.aiwaCreatedTimePage = page;
      return renamed;
    }
    insertAt(headerRow, makeHeaderCell(false), plan.insertionIndex);
    bodyRows.forEach((row, index) => insertAt(row, makeBodyCell(plan.cells[index], false), plan.insertionIndex));
    table.dataset.aiwaCreatedTimePage = page;
    return true;
  }

  function enhanceElementTable(container, page) {
    if (!isEnhancementTarget(container)) return false;
    const headerTable = container.querySelector('.el-table__header-wrapper table');
    const bodyTable = container.querySelector('.el-table__body-wrapper table');
    const headerRow = headerTable?.tHead?.rows?.[0];
    const bodyRows = Array.from(bodyTable?.tBodies?.[0]?.rows || []).filter((row) => row.cells.length > 1);
    if (!headerRow || !bodyRows.length) return false;
    const labels = Array.from(headerRow.cells, (cell) => cleanLabel(cell.textContent));
    const repair = buildMarkedColumnRepair(
      page,
      labels,
      headerRow.querySelectorAll('.aiwa-created-time-column').length,
      bodyRows.map((row) => row.querySelectorAll('.aiwa-created-time-column').length),
    );
    if (repair) {
      repairElementHeader(headerTable, headerRow, repair);
      container.dataset.aiwaCreatedTimePage = page;
      return true;
    }
    const plan = buildColumnPlan(page, labels, bodyRows.length, container.dataset.aiwaCreatedTimePage);
    if (!plan) return false;
    if (Number.isInteger(plan.renameSourceIndex)) {
      const source = headerRow.cells[plan.renameSourceIndex]?.querySelector('.cell');
      if (source) source.textContent = plan.renameSourceHeader;
    }
    if (plan.reuseExisting) {
      const renamed = renameExistingHeader(headerRow, plan, true);
      if (renamed) {
        container.dataset.aiwaCreatedTimePage = page;
      }
      return renamed;
    }

    addCol(headerTable, plan.insertionIndex);
    addCol(bodyTable, plan.insertionIndex);
    insertAt(headerRow, makeHeaderCell(true), plan.insertionIndex);
    bodyRows.forEach((row, index) => insertAt(row, makeBodyCell(plan.cells[index], true), plan.insertionIndex));
    container.dataset.aiwaCreatedTimePage = page;
    return true;
  }

  function ensureStyles(root) {
    if (root.getElementById('aiwa-created-time-column-styles')) return;
    const style = document.createElement('style');
    style.id = 'aiwa-created-time-column-styles';
    style.textContent = `
      .aiwa-created-time-column{min-width:${columnWidth}px;width:${columnWidth}px;white-space:nowrap}
      th.aiwa-created-time-column{font-weight:600}
      .el-table .aiwa-created-time-column .cell{white-space:nowrap}
    `;
    root.appendChild(style);
  }

  function resolveCurrentPage(section, activeNavigationPage) {
    return section || activeNavigationPage || 'dashboard';
  }

  function currentPageFromDocument() {
    const section = new URL(window.location.href).searchParams.get('section');
    const activeNavigationPage = document.querySelector('.ec-mini-detail-nav .mini-storage-category-subnav [data-mini-storage-page].active')?.dataset.miniStoragePage;
    return resolveCurrentPage(section, activeNavigationPage);
  }

  function mount() {
    let activePage = currentPageFromDocument();
    let observer = null;
    let timer = 0;

    const enhance = () => {
      const root = document.getElementById('mini-storage-native-host')?.shadowRoot;
      if (!root || !targetPages.has(activePage)) return;
      ensureStyles(root);
      root.querySelectorAll('.el-table').forEach((table) => enhanceElementTable(table, activePage));
      root.querySelectorAll('table.ipm-table, table.pp-table, .table-panel table:not(.el-table__header):not(.el-table__body)')
        .forEach((table) => enhanceNativeTable(table, activePage));
      if (!observer) {
        observer = new MutationObserver(schedule);
        const app = root.getElementById('app') || root;
        observer.observe(app, { childList: true, subtree: true });
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(enhance, 100);
    };

    document.addEventListener('aiwa:ministorage-pagechange', (event) => {
      cleanupInjectedElementColumns(document.getElementById('mini-storage-native-host')?.shadowRoot);
      activePage = event.detail?.page || currentPageFromDocument();
      schedule();
    });
    document.addEventListener('aiwa:ministorage-ready', schedule);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
    else schedule();
  }

  return { buildColumnPlan, buildMarkedColumnRepair, cleanupInjectedElementColumns, expandedTableWidth, isEnhancementTargetState, moveChild, repairElementHeader, resolveCurrentPage, mount };
});
