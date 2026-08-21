(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AiwaRenewalAdminForm = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const leases = [
    { id:'SO-26080977', customer:'Kelly Wong', customerNo:'CUS-012829', phone:'6888 2103', store:'沙田店 · ST01', unit:'ST-B020', currentExpiry:'2026-09-25', monthlyRent:3100, owner:'客服 B' },
    { id:'SO-26080907', customer:'张小姐', customerNo:'CUS-014602', phone:'6013 8820', store:'荃湾店 · TW02', unit:'TW-C030', currentExpiry:'2026-09-14', monthlyRent:2460, owner:'销售 A' },
    { id:'SO-26080891', customer:'林先生', customerNo:'CUS-013948', phone:'9550 1821', store:'火炭店 · FT05', unit:'FT05-097', currentExpiry:'2026-08-31', monthlyRent:2180, owner:'客服 B' },
  ];

  function shiftDate(dateText, months, days) {
    const date = new Date(`${dateText}T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + Number(months || 0));
    date.setUTCDate(date.getUTCDate() + Number(days || 0));
    return date.toISOString().slice(0, 10);
  }

  function recalculate(value) {
    const termMonths = Number(value.termMonths || 0);
    const monthlyRent = Number(value.monthlyRent || 0);
    const discount = Math.max(0, Number(value.discount || 0));
    return {
      renewalEnd: value.renewalStart && termMonths ? shiftDate(value.renewalStart, termMonths, -1) : '',
      totalAmount: Math.max(0, monthlyRent * termMonths - discount),
    };
  }

  function createDraft(leaseId) {
    const lease = leases.find(item => item.id === leaseId) || leases[0];
    const renewalStart = shiftDate(lease.currentExpiry, 0, 1);
    const termMonths = 12;
    const discount = 300;
    return {
      leaseId: lease.id, customer: lease.customer, customerNo: lease.customerNo, phone: lease.phone,
      store: lease.store, unit: lease.unit, currentExpiry: lease.currentExpiry,
      renewalStart, termMonths, ...recalculate({ renewalStart, termMonths, monthlyRent:lease.monthlyRent, discount }),
      monthlyRent: lease.monthlyRent, discount, paymentStatus:'待付款', paymentMethod:'', owner:lease.owner,
      source:'后台建立', paymentReceiptFiles:[], autoReminder:true, reminderChannels:['WhatsApp','SMS'], remark:'',
    };
  }

  function validate(value) {
    const errors = [];
    if (!value?.leaseId) errors.push('leaseId');
    if (!value?.renewalStart) errors.push('renewalStart');
    if (!Number(value?.termMonths)) errors.push('termMonths');
    if (!Number(value?.monthlyRent)) errors.push('monthlyRent');
    if (!value?.owner) errors.push('owner');
    if (value?.paymentStatus === '已付款' && !value?.paymentMethod) errors.push('paymentMethod');
    if (value?.paymentStatus === '已付款' && !value?.paymentReceiptFiles?.length) errors.push('paymentReceiptFiles');
    return errors;
  }

  function toRenewalRecord(value, serial) {
    return {
      id:`SO-R2609${String(serial).padStart(3, '0')}`,
      relatedOrder:value.leaseId,
      name:value.customer,
      unit:value.unit,
      date:value.renewalEnd,
      node:'后台续租订单已建立',
      status:value.paymentStatus || '待付款',
      source:'后台建立',
      owner:value.owner,
      amount:`HK$${Number(value.totalAmount || 0).toLocaleString('en-HK')}.00`,
      requestedTerm:`${value.termMonths} 个月`,
      autoReminder:Boolean(value.autoReminder),
      reminderChannels:[...(value.reminderChannels || [])],
      requiresCustomerFollowUp:false,
    };
  }

  return { leases, createDraft, recalculate, validate, toRenewalRecord };
});
