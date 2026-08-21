(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OneStorageRenewalFlow = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function required(value, field) {
    if (!String(value || '').trim()) throw new Error(`缺少${field}`);
    return value;
  }

  function createCustomerInitiatedRenewal(input) {
    const source = input || {};
    return {
      id: required(source.id, '续租订单编号'),
      relatedOrder: required(source.relatedOrder, '原订单编号'),
      customer: required(source.customer, '客户'),
      unit: required(source.unit, '仓号'),
      expiryDate: required(source.expiryDate, '到期日'),
      node: '小程序申请已生成续租订单',
      source: '客户主动续租',
      status: '待付款',
      applicationAt: required(source.applicationAt, '申请时间'),
      requestedTerm: required(source.requestedTerm, '续租期限'),
      amount: required(source.amount, '应付金额'),
      requiresCustomerFollowUp: false,
    };
  }

  function statusTreatment(record) {
    return record && record.source === '客户主动续租'
      ? 'order-processing'
      : 'customer-follow-up';
  }

  function toDatasetRow(record) {
    return [
      record.id,
      record.relatedOrder,
      record.customer,
      record.unit,
      record.expiryDate,
      record.node,
      record.source,
      record.status,
    ];
  }

  return { createCustomerInitiatedRenewal, statusTreatment, toDatasetRow };
});
