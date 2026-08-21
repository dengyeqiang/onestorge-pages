(function appointmentDomainFactory(root, factory) {
  const domain = factory();
  if (typeof module === 'object' && module.exports) module.exports = domain;
  if (root) root.OneStorageAppointmentDomain = domain;
})(typeof window !== 'undefined' ? window : globalThis, function createAppointmentDomain() {
  const types = Object.freeze([
    Object.freeze({ key: 'visit', label: '预约看仓', business: '迷你仓', orderRequired: false, prefix: 'VIS' }),
    Object.freeze({ key: 'collection', label: '预约取箱', business: '迷你箱', orderRequired: true, prefix: 'COL' }),
    Object.freeze({ key: 'recall', label: '预约召回', business: '迷你箱', orderRequired: true, prefix: 'REC' }),
    Object.freeze({ key: 'delivery', label: '预约送箱', business: '迷你箱', orderRequired: true, prefix: 'DEL' }),
  ]);

  const aliases = new Map([
    ['visit', 'visit'], ['预约看仓', 'visit'], ['看仓', 'visit'],
    ['collection', 'collection'], ['预约取箱', 'collection'], ['取箱预约', 'collection'], ['取箱', 'collection'],
    ['recall', 'recall'], ['预约召回', 'recall'], ['召回预约', 'recall'], ['召回', 'recall'],
    ['delivery', 'delivery'], ['预约送箱', 'delivery'], ['送箱预约', 'delivery'], ['送箱', 'delivery'],
  ]);
  const eligibleStatuses = Object.freeze({
    delivery: Object.freeze(['待安排送箱']),
    collection: Object.freeze(['空箱已送达', '等待客户装箱']),
    recall: Object.freeze(['在仓存放', '在仓封存']),
  });
  const fulfillmentFlows = Object.freeze({
    delivery: Object.freeze([
      Object.freeze({ value: 'confirmed', label: '确认送箱安排', appointmentStatus: '已确认', orderStatus: '待安排送箱', stage: '已确认送箱安排' }),
      Object.freeze({ value: 'started', label: '开始配送空箱', appointmentStatus: '服务中', orderStatus: '空箱配送中', stage: '空箱配送中' }),
      Object.freeze({ value: 'completed', label: '完成送达', appointmentStatus: '已完成', orderStatus: '空箱已送达', stage: '空箱已送达' }),
    ]),
    collection: Object.freeze([
      Object.freeze({ value: 'confirmed', label: '确认上门取箱', appointmentStatus: '已确认', orderStatus: '待上门取箱', stage: '已确认上门取箱' }),
      Object.freeze({ value: 'started', label: '开始取箱运输', appointmentStatus: '服务中', orderStatus: '取箱运输中', stage: '箱体取回中' }),
      Object.freeze({ value: 'completed', label: '完成返仓', appointmentStatus: '已完成', orderStatus: '在仓存放', stage: '箱体已返仓' }),
    ]),
    recall: Object.freeze([
      Object.freeze({ value: 'confirmed', label: '确认召回安排', appointmentStatus: '已确认', orderStatus: '待安排召回', stage: '已确认召回安排' }),
      Object.freeze({ value: 'started', label: '开始召回配送', appointmentStatus: '服务中', orderStatus: '召回配送中', stage: '召回配送中' }),
      Object.freeze({ value: 'completed', label: '客户签收完成', appointmentStatus: '已完成', orderStatus: '客户已签收', stage: '召回箱体已签收' }),
    ]),
  });

  function normalizeType(value) {
    return aliases.get(String(value || '').trim()) || 'visit';
  }

  function definitionFor(value) {
    const key = normalizeType(value);
    return types.find(item => item.key === key) || types[0];
  }

  function labelFor(value) { return definitionFor(value).label; }
  function requiresOrder(value) { return definitionFor(value).orderRequired; }
  function businessForType(value) { return definitionFor(value).business; }
  function canConvertToOpportunity(value) { return normalizeType(value) === 'visit'; }
  function canModify(status) { return ['待确认', '已确认'].includes(status); }
  function createId(value, serial) { return `${definitionFor(value).prefix}-${serial}`; }

  function eligibleOrders(value, orders) {
    const key = normalizeType(value);
    if (key === 'visit') return [];
    const statuses = eligibleStatuses[key] || [];
    return (orders || []).filter(order => order && order.type === 'box' && statuses.includes(order.status));
  }

  function fulfillmentOptions(value) {
    return fulfillmentFlows[normalizeType(value)] || [];
  }

  function requiresLogisticsDetails(value) {
    return ['delivery', 'collection'].includes(normalizeType(value));
  }

  function missingLogisticsFields(value, details = {}) {
    if (!requiresLogisticsDetails(value)) return [];
    return [
      ['logisticsNo', '物流单号'],
      ['logisticsCompany', '物流公司'],
      ['courier', '配送人员'],
    ].filter(([field]) => !String(details[field] || '').trim()).map(([, label]) => label);
  }

  function resolveFulfillment(value, result) {
    const option = fulfillmentOptions(value).find(item => item.value === result);
    if (!option) return null;
    return {
      result: option.value,
      appointmentStatus: option.appointmentStatus,
      orderStatus: option.orderStatus,
      stage: option.stage,
      completed: option.value === 'completed',
    };
  }

  return Object.freeze({
    types,
    eligibleStatuses,
    fulfillmentFlows,
    normalizeType,
    definitionFor,
    labelFor,
    requiresOrder,
    businessForType,
    canConvertToOpportunity,
    canModify,
    createId,
    eligibleOrders,
    fulfillmentOptions,
    requiresLogisticsDetails,
    missingLogisticsFields,
    resolveFulfillment,
  });
});
