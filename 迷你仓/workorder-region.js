(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OneStorageWorkorderRegion = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const regions = ['九龙东', '新界东', '新界西', '港岛东', '港岛南'];
  const rules = [
    { region: '九龙东', patterns: ['KT01', 'KC10', '观塘', '九龙湾', '新蒲岗'] },
    { region: '新界东', patterns: ['ST01', 'TP03', 'FT01', 'DH03', '沙田', '大埔', '火炭', '大围'] },
    { region: '新界西', patterns: ['TW02', 'TY01', '荃湾', '葵芳', '屯门', '元朗'] },
    { region: '港岛东', patterns: ['NP01', 'CW03', 'CW05', '北角', '柴湾', '筲箕湾'] },
    { region: '港岛南', patterns: ['WCH01', 'WH01', '黄竹坑', '香港仔'] },
  ];

  function resolveRegion(store) {
    const text = String(store || '').trim();
    const match = rules.find(rule => rule.patterns.some(pattern => text.includes(pattern)));
    return match ? match.region : '未归类';
  }

  function enrich(row) {
    return { ...row, region: resolveRegion(row.store) };
  }

  function summarizeByRegion(rows) {
    return regions.map(region => {
      const matching = (rows || []).map(enrich).filter(row => row.region === region);
      const resolved = matching.filter(row => row.status === '已解决').length;
      return {
        region,
        total: matching.length,
        open: matching.length - resolved,
        risk: matching.filter(row => row.slaRisk).length,
        resolved,
        resolutionRate: matching.length ? Math.round((resolved / matching.length) * 100) : 0,
      };
    });
  }

  return { regions, resolveRegion, enrich, summarizeByRegion };
});
