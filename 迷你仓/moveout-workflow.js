(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OneStorageMoveoutWorkflow = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const allowedActions = {
    '待审批': ['approve', 'reject'],
    '已驳回': ['resubmit'],
    '待过账': ['autoRefundSucceeded', 'autoRefundFailed', 'manualRefund'],
    '已过账': [],
  };

  function requireText(value, label) {
    if (!String(value || '').trim()) throw new Error(`请填写${label}`);
    return String(value).trim();
  }

  function money(value) {
    return `HK$${Number(value || 0).toLocaleString('en-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function historyItem(title, description, payload, type) {
    return {
      time: payload.occurredAt || '刚刚',
      title,
      description,
      operator: payload.operator || '系统',
      type: type || 'primary',
    };
  }

  function createApplication(input) {
    const record = {
      id: input.id,
      customer: input.customer || '—',
      unit: input.unit || '—',
      source: input.source || '小程序申请',
      submittedAt: input.submittedAt || '刚刚',
      status: '待审批',
      approvalStatus: '待审批',
      refundStatus: '待处理',
      history: [],
    };
    record.history.unshift(historyItem('客户提交退仓申请', '小程序申请已进入后台审批队列。', {
      operator: record.customer,
      occurredAt: record.submittedAt,
    }, 'primary'));
    return record;
  }

  function calculateRefund(input) {
    const start = Date.parse(`${input.checkoutDate}T00:00:00Z`);
    const end = Date.parse(`${input.leaseEndDate}T00:00:00Z`);
    if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error('退仓日期或租约到期日无效');
    const monthlyRent = Number(input.monthlyRent);
    if (!Number.isFinite(monthlyRent) || monthlyRent < 0) throw new Error('月租金额无效');
    const remainingDays = Math.max(0, Math.ceil((end - start) / 86400000));
    const dailyRent = Math.round((monthlyRent / 30) * 100) / 100;
    const refundableRent = Math.round(dailyRent * remainingDays * 100) / 100;
    return {
      remainingDays,
      dailyRent,
      refundableRent,
      formula: `${money(monthlyRent)} ÷ 30 天 × ${remainingDays} 天`,
    };
  }

  function transition(record, action, payload = {}) {
    const allowed = allowedActions[record.status] || [];
    if (!allowed.includes(action)) throw new Error(`退仓单处于“${record.status}”时不能执行该操作`);
    const next = { ...record, history: [...(record.history || [])] };

    if (action === 'approve') {
      const calculation = payload.calculation || {};
      const reason = String(payload.opinion || '').trim() || '资料核对无误，同意退租';
      next.status = '待过账';
      next.approvalStatus = '审批通过';
      next.approvalRecord = {
        operator: payload.operator || '系统',
        result: '审批通过',
        reason,
        occurredAt: payload.occurredAt || '刚刚',
      };
      next.refundStatus = '退款处理中';
      next.paymentChannel = requireText(payload.paymentChannel, '原支付渠道');
      next.remainingDays = calculation.remainingDays;
      next.dailyRent = calculation.dailyRent;
      next.refundableRent = calculation.refundableRent;
      next.refundFormula = calculation.formula;
      next.history.unshift(historyItem('审批通过，进入待过账', `剩余租期 ${calculation.remainingDays} 天，应退租金 ${money(calculation.refundableRent)}，已向原支付渠道发起退款。`, payload, 'success'));
    } else if (action === 'reject') {
      const opinion = requireText(payload.opinion, '审批意见');
      next.status = '已驳回';
      next.approvalStatus = '已驳回';
      next.rejectionOpinion = opinion;
      next.approvalRecord = {
        operator: payload.operator || '系统',
        result: '审批不通过',
        reason: opinion,
        occurredAt: payload.occurredAt || '刚刚',
      };
      next.history.unshift(historyItem('退仓申请已驳回', opinion, payload, 'danger'));
    } else if (action === 'resubmit') {
      const description = requireText(payload.changeDescription, '修改说明');
      next.status = '待审批';
      next.approvalStatus = '待审批';
      next.refundStatus = '待处理';
      next.history.unshift(historyItem('客户修改后重新提交', description, payload, 'primary'));
    } else if (action === 'autoRefundFailed') {
      const reason = requireText(payload.reason, '退款失败原因');
      next.refundStatus = '退款失败';
      next.refundFailureReason = reason;
      next.history.unshift(historyItem('原路退款失败', reason, payload, 'danger'));
    } else if (action === 'autoRefundSucceeded') {
      const transactionNo = requireText(payload.transactionNo, '退款流水号');
      next.status = '已过账';
      next.refundStatus = '退款成功';
      next.refundTransactionNo = transactionNo;
      next.postedAt = payload.occurredAt || '刚刚';
      next.history.unshift(historyItem('支付平台退款成功，自动过账', `退款流水号 ${transactionNo}`, payload, 'success'));
    } else if (action === 'manualRefund') {
      if (record.refundStatus !== '退款失败') throw new Error('只有自动退款失败的退仓单才能手动退款');
      const voucher = requireText(payload.voucher, '退款凭证');
      const description = requireText(payload.description, '处理描述');
      next.status = '已过账';
      next.refundStatus = '手动退款完成';
      next.postedAt = payload.occurredAt || '刚刚';
      next.manualRefund = { voucher, description, operator: payload.operator || '—' };
      next.history.unshift(historyItem('手动退款完成并过账', `${description}｜凭证：${voucher}`, payload, 'success'));
    }
    return next;
  }

  return { createApplication, calculateRefund, transition };
});
