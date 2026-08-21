(function initContractTemplateLanguage(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OneStorageContractTemplateLanguage = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createContractTemplateLanguage() {
  'use strict';

  const supportedLanguages = new Set(['zh-CN', 'zh-HK', 'en']);
  const titleCatalog = [
    {
      'zh-CN': '未命名合同模板',
      'zh-HK': '未命名合約範本',
      en: 'Untitled Contract Template',
    },
    {
      'zh-CN': '导入合同模板',
      'zh-HK': '匯入合約範本',
      en: 'Imported Contract Template',
    },
    {
      'zh-CN': '迷你仓标准租赁合同',
      'zh-HK': '迷你倉標準租賃合約',
      en: 'Standard Self-storage Rental Contract',
    },
    {
      'zh-CN': '迷你箱服务合同',
      'zh-HK': '迷你箱服務合約',
      en: 'Mini-box Service Contract',
    },
    {
      'zh-CN': '续租补充协议',
      'zh-HK': '續租補充協議',
      en: 'Renewal Supplementary Agreement',
    },
    {
      'zh-CN': '企业客户特别条款',
      'zh-HK': '企業客戶特別條款',
      en: 'Corporate Customer Special Terms',
    },
  ];

  function normalizeLanguage(language) {
    return supportedLanguages.has(language) ? language : 'zh-CN';
  }

  function localizeTitle(title, language) {
    const normalized = normalizeLanguage(language);
    const value = String(title || '').trim();
    const entry = titleCatalog.find(item => Object.values(item).includes(value));
    return entry ? entry[normalized] : title;
  }

  function editorState(language, title) {
    const normalized = normalizeLanguage(language);
    return {
      language: normalized,
      title: localizeTitle(title, normalized),
    };
  }

  return { editorState, localizeTitle, normalizeLanguage };
});
