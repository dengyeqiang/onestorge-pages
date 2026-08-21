(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AiwaMiniStorageCustomerServiceDomain = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const pendingTask = () => ({ id: '', title: '尚未创建跟进任务', owner: '—', dueAt: '—', status: '未创建', priority: '—' });
  const customer = (id, name, phone) => ({ id, name, phone });
  const reference = (type, id) => ({ type, id });

  const ONLINE_RECORDS = [
    {
      id: 'CHAT-260819-001', isToday: true, customer: customer('CUS-1001', '陈小姐', '9123 6688'), channel: 'WhatsApp', businessType: '订单', bot: 'AIWA-ONLINE-01',
      summary: '客户查询订单付款是否到账及电子合同签署状态。AIWA 已核对付款凭证并确认合同待客户签署。', intent: { type: '完成签约', confidence: 96, evidence: '客户主动询问签署入口', valid: true, expiresAt: '2026-08-22' },
      references: [reference('销售订单', 'SO-260818-014'), reference('合同', 'CT-260818-014')], tags: { profile: ['高价值客户'], service: ['电子签约'] }, unresolved: '', status: 'AIWA已解决', owner: '周嘉怡', startedAt: '2026-08-19 09:12:03', lastAt: '2026-08-19 09:26:18',
      messages: [{ role: '客户', text: '付款已经成功，合同在哪里签？' }, { role: 'AIWA', text: '付款已入账，我已发送电子合同签署入口。' }],
      queryLogs: [{ target: 'SO-260818-014', purpose: '核对付款状态', time: '2026-08-19 09:14:20', result: '付款已入账' }, { target: 'CT-260818-014', purpose: '核对签署状态', time: '2026-08-19 09:15:06', result: '待客户签署' }], task: pendingTask(),
    },
    {
      id: 'CHAT-260819-002', isToday: true, customer: customer('CUS-1002', '黄先生', '6338 1028'), channel: '小程序', businessType: '迷你箱', bot: 'AIWA-ONLINE-02',
      summary: '迷你箱配送超过预约时段仍未到达。AIWA 已查询物流轨迹并创建异常工单。', intent: { type: '催促配送', confidence: 99, evidence: '客户提供预约时段及箱号', valid: true, expiresAt: '2026-08-19' },
      references: [reference('迷你箱', 'BX-260817-033'), reference('工单', 'WO-260819-028')], tags: { profile: ['配送异常'], service: ['加急跟进'] }, unresolved: '需配送团队确认最新到达时间', status: '待人工跟进', owner: '林凯晴', startedAt: '2026-08-19 10:03:41', lastAt: '2026-08-19 10:18:22',
      messages: [{ role: '客户', text: '预约十点送到，现在还没有来。' }, { role: 'AIWA', text: '已定位车辆并建立加急工单，人工同事会确认到达时间。' }],
      queryLogs: [{ target: 'BX-260817-033', purpose: '查询配送轨迹', time: '2026-08-19 10:05:11', result: '车辆仍在上一站' }], task: { id: 'TASK-260819-028', title: '确认迷你箱到达时间', owner: '林凯晴', dueAt: '2026-08-19 10:35', status: '待处理', priority: '高' },
    },
    {
      id: 'CHAT-260819-003', isToday: true, customer: customer('CUS-1003', '林小姐', '9812 0477'), channel: '企业微信', businessType: '迷你仓', bot: 'AIWA-ONLINE-01',
      summary: '客户询问即将到期仓位的续租价格。AIWA 已展示当前月租及续租优惠。', intent: { type: '续租', confidence: 88, evidence: '客户询问一年续租价格', valid: true, expiresAt: '2026-08-25' },
      references: [reference('迷你仓', 'ST-KT01-A318')], tags: { profile: ['高价值客户'], service: ['续租意向'] }, unresolved: '等待客户确认续租年期', status: '待人工跟进', owner: '陈晓敏', startedAt: '2026-08-19 10:42:09', lastAt: '2026-08-19 11:06:50',
      messages: [{ role: '客户', text: '续租一年可以维持现在价格吗？' }, { role: 'AIWA', text: '已为你整理当前租金和一年续租优惠。' }],
      queryLogs: [{ target: 'ST-KT01-A318', purpose: '查询到期日与价格', time: '2026-08-19 10:44:00', result: '2026-09-03 到期，可用续租优惠' }], task: pendingTask(),
    },
    {
      id: 'CHAT-260819-004', isToday: true, customer: customer('CUS-1004', '张小姐', '6017 2940'), channel: '网页客服', businessType: '店铺', bot: 'AIWA-ONLINE-03',
      summary: '客户查询荃湾店营业时间并预约现场看仓。AIWA 已提供地址和可预约时段。', intent: { type: '看仓预约', confidence: 93, evidence: '客户选择明日下午时段', valid: true, expiresAt: '2026-08-20' },
      references: [reference('店铺', 'TW02')], tags: { profile: ['新客户'], service: ['看仓预约'] }, unresolved: '', status: 'AIWA已解决', owner: '郭颖欣', startedAt: '2026-08-19 11:21:10', lastAt: '2026-08-19 11:30:32',
      messages: [{ role: '客户', text: '荃湾店几点关门？明天下午可以看仓吗？' }, { role: 'AIWA', text: '门店营业至晚上七点，已为你预留明日下午三点。' }],
      queryLogs: [{ target: 'TW02', purpose: '查询营业时间和预约位', time: '2026-08-19 11:23:02', result: '15:00 可预约' }], task: pendingTask(),
    },
    {
      id: 'CHAT-260819-005', isToday: true, customer: customer('CUS-1005', '郭小姐', '9277 4316'), channel: 'WhatsApp', businessType: '保险', bot: 'AIWA-ONLINE-02',
      summary: '客户询问水浸是否属于保单保障范围。AIWA 已返回保障摘要和理赔条件。', intent: { type: '保障咨询', confidence: 90, evidence: '客户提供保单编号', valid: true, expiresAt: '2026-08-21' },
      references: [reference('保单', 'PL-260401-067')], tags: { profile: ['保险客户'], service: ['保障咨询'] }, unresolved: '特殊物品是否承保需专员核实', status: '待人工跟进', owner: '何文乐', startedAt: '2026-08-19 12:08:36', lastAt: '2026-08-19 12:29:44',
      messages: [{ role: '客户', text: '仓内货物如果水浸可以赔偿吗？' }, { role: 'AIWA', text: '基础保障包含指定水浸事故，特殊物品需由专员核实。' }],
      queryLogs: [{ target: 'PL-260401-067', purpose: '查询保障范围', time: '2026-08-19 12:10:18', result: '包含指定水浸事故' }], task: pendingTask(),
    },
    {
      id: 'CHAT-260819-006', isToday: false, customer: customer('CUS-1006', '周先生', '6880 3165'), channel: '小程序', businessType: '工单', bot: 'AIWA-ONLINE-01',
      summary: '客户追问门锁维修进度。AIWA 已读取工单状态，但现场团队尚未回填完成时间。', intent: { type: '工单催办', confidence: 98, evidence: '客户连续两次查询', valid: true, expiresAt: '2026-08-19' },
      references: [reference('工单', 'WO-260818-011')], tags: { profile: ['工单客户'], service: ['超时跟进'] }, unresolved: '现场团队未提供预计完成时间', status: '超时未处理', owner: '梁志恒', startedAt: '2026-08-18 15:14:20', lastAt: '2026-08-18 16:01:08',
      messages: [{ role: '客户', text: '门锁什么时候能修好？' }, { role: 'AIWA', text: '工单仍在处理中，我已再次提醒现场团队。' }],
      queryLogs: [{ target: 'WO-260818-011', purpose: '查询维修进度', time: '2026-08-18 15:16:02', result: '处理中，未填写预计完成时间' }], task: { id: 'TASK-260818-011', title: '催办门锁维修工单', owner: '梁志恒', dueAt: '2026-08-18 17:00', status: '已逾期', priority: '高' },
    },
    {
      id: 'CHAT-260819-007', isToday: false, customer: customer('CUS-1007', '梁先生', '5441 8802'), channel: '企业微信', businessType: '订单', bot: 'AIWA-ONLINE-03',
      summary: '客户咨询退租流程及按金退款时间。AIWA 已说明退仓检查和退款步骤。', intent: { type: '退租退款', confidence: 95, evidence: '客户确认计划月底退仓', valid: true, expiresAt: '2026-08-31' },
      references: [reference('销售订单', 'SO-251101-088'), reference('合同', 'CT-251101-088')], tags: { profile: ['退租客户'], service: ['退款关注'] }, unresolved: '需人工确认退仓检查预约', status: '待人工跟进', owner: '黄咏诗', startedAt: '2026-08-18 16:33:41', lastAt: '2026-08-18 16:55:05',
      messages: [{ role: '客户', text: '月底退仓，按金多久可以退？' }, { role: 'AIWA', text: '完成退仓检查后会进入退款流程，我可安排人工确认检查时间。' }],
      queryLogs: [{ target: 'CT-251101-088', purpose: '查询退租条款', time: '2026-08-18 16:36:10', result: '需提前通知并完成退仓检查' }], task: pendingTask(),
    },
    {
      id: 'CHAT-260819-008', isToday: false, customer: customer('CUS-1008', '何先生', '9620 5514'), channel: '网页客服', businessType: '综合咨询', bot: 'AIWA-ONLINE-02',
      summary: '客户比较迷你仓与迷你箱方案。AIWA 已按存放体积、使用频率和配送需求给出建议。', intent: { type: '新租咨询', confidence: 82, evidence: '客户询问两种方案报价', valid: true, expiresAt: '2026-08-24' },
      references: [reference('店铺', 'KT01'), reference('迷你箱', 'BX-PACK-M')], tags: { profile: ['新客户'], service: ['方案比较'] }, unresolved: '', status: 'AIWA已解决', owner: '陈晓敏', startedAt: '2026-08-18 17:20:13', lastAt: '2026-08-18 17:45:39',
      messages: [{ role: '客户', text: '不常拿取的话，迷你箱会不会更适合？' }, { role: 'AIWA', text: '按你的物品体积和取用频率，中型迷你箱成本更合适。' }],
      queryLogs: [{ target: 'KT01', purpose: '比较仓位价格', time: '2026-08-18 17:22:00', result: '小型仓位有库存' }, { target: 'BX-PACK-M', purpose: '比较迷你箱套餐', time: '2026-08-18 17:23:12', result: '中型套餐可预约配送' }], task: pendingTask(),
    },
  ];

  const PHONE_RECORDS = [
    { id: 'CALL-260819-001', isToday: true, customer: customer('CUS-1003', '林小姐', '9812 0477'), direction: '外呼', result: '已接通', robot: 'VOICE-01', duration: '04:18', time: '2026-08-19 09:35:18', summary: '续租到期提醒；客户希望比较六个月与一年方案。', intent: { type: '续租', confidence: 91, evidence: '主动询问长期优惠', valid: true }, objection: '担心一次付款金额较高', tags: { before: ['高价值客户'], added: ['续租意向'], confirm: ['价格敏感'] }, recordingId: 'REC-260819-001', snippets: ['机器人：您的仓位将在两周后到期。', '客户：一年方案如果便宜一些可以考虑。'], references: [reference('迷你仓', 'ST-KT01-A318')], task: pendingTask(), followStatus: '待确认' },
    { id: 'CALL-260819-002', isToday: true, customer: customer('CUS-1009', '郑先生', '6112 3098'), direction: '外呼', result: '未接通', robot: 'VOICE-02', duration: '00:00', time: '2026-08-19 09:52:06', summary: '新租线索首次外呼，电话响铃后无人接听。', intent: { type: '新租意向', confidence: 35, evidence: '来自网页报价申请', valid: false }, objection: '尚未沟通', tags: { before: ['网页线索'], added: ['首次未接'], confirm: [] }, recordingId: 'REC-260819-002', snippets: ['系统：响铃 25 秒，无人接听。'], references: [reference('店铺', 'CW05')], task: pendingTask(), followStatus: '待回拨' },
    { id: 'CALL-260819-003', isToday: true, customer: customer('CUS-1010', '叶小姐', '9234 7760'), direction: '呼入', result: '已接通', robot: 'VOICE-01', duration: '06:42', time: '2026-08-19 10:17:44', summary: '客户来电确认看仓预约地点及停车安排。机器人已发送店铺定位。', intent: { type: '预约确认', confidence: 97, evidence: '确认将准时到店', valid: true }, objection: '需要停车位', tags: { before: ['预约客户'], added: ['已确认到店'], confirm: ['自驾到店'] }, recordingId: 'REC-260819-003', snippets: ['客户：我会开车过来，在哪里停车？', '机器人：已发送店铺定位和停车指引。'], references: [reference('店铺', 'TW02')], task: { id: 'TASK-260819-103', title: '门店准备看仓接待', owner: '郭颖欣', dueAt: '2026-08-20 14:30', status: '待处理', priority: '中' }, followStatus: '跟进中' },
    { id: 'CALL-260819-004', isToday: true, customer: customer('CUS-1011', '冯先生', '6508 1182'), direction: '外呼', result: '拒接', robot: 'VOICE-02', duration: '00:07', time: '2026-08-19 10:48:11', summary: '订单付款提醒外呼，客户接听后立即挂断。', intent: { type: '付款提醒', confidence: 60, evidence: '订单存在到期应付款', valid: false }, objection: '拒绝本次通话', tags: { before: ['待付款'], added: ['拒接'], confirm: [] }, recordingId: 'REC-260819-004', snippets: ['系统：客户接听 7 秒后挂断。'], references: [reference('销售订单', 'SO-260815-019')], task: pendingTask(), followStatus: '待回拨' },
    { id: 'CALL-260819-005', isToday: true, customer: customer('CUS-1012', '罗小姐', '9012 3408'), direction: '呼入', result: '留言', robot: 'VOICE-03', duration: '01:11', time: '2026-08-19 11:26:09', summary: '客户在繁忙时段留言，要求查询维修工单进度。', intent: { type: '工单查询', confidence: 94, evidence: '留言提供工单编号', valid: true }, objection: '未与客服实时沟通', tags: { before: ['工单客户'], added: ['语音留言'], confirm: ['急需回复'] }, recordingId: 'REC-260819-005', snippets: ['客户留言：请尽快告诉我维修什么时候完成。'], references: [reference('工单', 'WO-260818-044')], task: pendingTask(), followStatus: '待回拨' },
    { id: 'CALL-260819-006', isToday: false, customer: customer('CUS-1013', '蔡先生', '0000 0000'), direction: '外呼', result: '号码无效', robot: 'VOICE-01', duration: '00:00', time: '2026-08-18 14:05:37', summary: '满意度回访未能拨通，系统判断号码无效。', intent: { type: '满意度回访', confidence: 0, evidence: '号码无法接通', valid: false }, objection: '联系方式无效', tags: { before: ['已完成工单'], added: ['号码无效'], confirm: ['核对联系方式'] }, recordingId: 'REC-260818-006', snippets: ['系统：运营商返回号码无效。'], references: [reference('工单', 'WO-260810-006')], task: pendingTask(), followStatus: '需核实' },
    { id: 'CALL-260819-007', isToday: false, customer: customer('CUS-1014', '杜小姐', '6381 9420'), direction: '外呼', result: '已接通', robot: 'VOICE-03', duration: '05:26', time: '2026-08-18 15:42:10', summary: '退租服务回访；客户认可现场服务，但希望加快按金退款。', intent: { type: '服务回访', confidence: 86, evidence: '完成满意度评分并提出建议', valid: true }, objection: '退款等待时间较长', tags: { before: ['已退租'], added: ['服务满意'], confirm: ['退款催办'] }, recordingId: 'REC-260818-007', snippets: ['客户：现场同事很好，希望退款能快一点。'], references: [reference('合同', 'CT-250901-077')], task: { id: 'TASK-260818-107', title: '核对按金退款进度', owner: '黄咏诗', dueAt: '2026-08-19 16:00', status: '待处理', priority: '中' }, followStatus: '跟进中' },
    { id: 'CALL-260819-008', isToday: false, customer: customer('CUS-1015', '马先生', '9550 2241'), direction: '呼入', result: '已接通', robot: 'VOICE-02', duration: '07:03', time: '2026-08-18 17:18:55', summary: '客户来电咨询新租仓位，偏好观塘、可随时取物。机器人已登记看仓需求。', intent: { type: '新租意向', confidence: 92, evidence: '明确地点、面积和预算', valid: true }, objection: '希望月租不超过 HK$1,500', tags: { before: ['新客户'], added: ['高意向', '观塘'], confirm: ['预算明确'] }, recordingId: 'REC-260818-008', snippets: ['客户：想找观塘附近约二十平方呎的仓位。', '机器人：已登记需求，销售同事会提供可选仓位。'], references: [reference('店铺', 'KT01')], task: pendingTask(), followStatus: '待回拨' },
  ];

  const COPY = {
    'zh-CN': {
      menu: '客户服务', online: '线上客服', phone: '电话服务',
      metrics: { online: ['今日对话', 'AIWA 已解决', '待人工跟进', '超时未处理'], phone: ['今日通话', '接通率', '有效意向', '待回拨'] },
      filters: { keyword: '搜索客户、编号或电话', channel: '渠道', businessType: '业务类型', intent: '客户意向', status: '处理状态', owner: '负责人', direction: '通话方向', result: '通话结果', robot: '电话机器人', tag: '客户标签', followStatus: '跟进状态', all: '全部', reset: '重置' },
      columns: { record: '服务编号', createdAt: '会话创建时间', customer: '客户', channel: '渠道', summary: '服务摘要', intent: '客户意向', business: '关联业务', issue: '未解决问题', task: '跟进任务', owner: '负责人', time: '最后互动时间', phone: '电话号码', direction: '通话方向', robot: '电话机器人', duration: '通话时长', result: '通话结果', tags: '客户标签', action: '操作' },
      detail: { conversation: '会话概览', call: '通话概览', summary: '服务摘要', intent: '客户意向与异议', issue: '未解决问题', messages: '关键对话', snippets: '关键通话片段', queries: 'AIWA 查询记录', tags: '客户标签', business: '关联业务', nextTask: '下一步任务', recording: '录音编号' },
      task: { create: '创建跟进任务', callback: '创建回拨任务', title: '任务标题', owner: '负责人', dueAt: '截止时间', priority: '优先级', high: '高', medium: '中', low: '低' },
      actions: { view: '查看详情', close: '关闭', customer: '查看客户档案', business: '查看业务', cancel: '取消', save: '保存任务', clear: '清除筛选' },
      pagination: { label: '列表分页', total: '共 {count} 条', previous: '上一页', next: '下一页' },
      messages: { saved: '跟进任务已创建', required: '请填写所有必填字段', empty: '没有符合条件的服务记录' },
    },
    'zh-HK': {
      menu: '客戶服務', online: '線上客服', phone: '電話服務',
      metrics: { online: ['今日對話', 'AIWA 已解決', '待人工跟進', '逾時未處理'], phone: ['今日通話', '接通率', '有效意向', '待回撥'] },
      filters: { keyword: '搜尋客戶、編號或電話', channel: '渠道', businessType: '業務類型', intent: '客戶意向', status: '處理狀態', owner: '負責人', direction: '通話方向', result: '通話結果', robot: '電話機械人', tag: '客戶標籤', followStatus: '跟進狀態', all: '全部', reset: '重設' },
      columns: { record: '服務編號', createdAt: '會話建立時間', customer: '客戶', channel: '渠道', summary: '服務摘要', intent: '客戶意向', business: '關聯業務', issue: '未解決問題', task: '跟進任務', owner: '負責人', time: '最後互動時間', phone: '電話號碼', direction: '通話方向', robot: '電話機械人', duration: '通話時長', result: '通話結果', tags: '客戶標籤', action: '操作' },
      detail: { conversation: '會話概覽', call: '通話概覽', summary: '服務摘要', intent: '客戶意向與異議', issue: '未解決問題', messages: '關鍵對話', snippets: '關鍵通話片段', queries: 'AIWA 查詢記錄', tags: '客戶標籤', business: '關聯業務', nextTask: '下一步任務', recording: '錄音編號' },
      task: { create: '建立跟進任務', callback: '建立回撥任務', title: '任務標題', owner: '負責人', dueAt: '截止時間', priority: '優先級', high: '高', medium: '中', low: '低' },
      actions: { view: '查看詳情', close: '關閉', customer: '查看客戶檔案', business: '查看業務', cancel: '取消', save: '儲存任務', clear: '清除篩選' },
      pagination: { label: '列表分頁', total: '共 {count} 條', previous: '上一頁', next: '下一頁' },
      messages: { saved: '跟進任務已建立', required: '請填寫所有必填欄位', empty: '沒有符合條件的服務記錄' },
    },
    en: {
      menu: 'Customer Service', online: 'Online Support', phone: 'Phone Service',
      metrics: { online: ['Conversations Today', 'Resolved by AIWA', 'Human Follow-up', 'Overdue'], phone: ['Calls Today', 'Connection Rate', 'Valid Intent', 'Callbacks Due'] },
      filters: { keyword: 'Search customer, ID or phone', channel: 'Channel', businessType: 'Business Type', intent: 'Customer Intent', status: 'Status', owner: 'Owner', direction: 'Direction', result: 'Call Result', robot: 'Voice Bot', tag: 'Customer Tag', followStatus: 'Follow-up Status', all: 'All', reset: 'Reset' },
      columns: { record: 'Service ID', createdAt: 'Created At', customer: 'Customer', channel: 'Channel', summary: 'Service Summary', intent: 'Intent', business: 'Related Business', issue: 'Unresolved Issue', task: 'Follow-up Task', owner: 'Owner', time: 'Last Interaction', phone: 'Phone', direction: 'Direction', robot: 'Voice Bot', duration: 'Duration', result: 'Call Result', tags: 'Customer Tags', action: 'Actions' },
      detail: { conversation: 'Conversation Overview', call: 'Call Overview', summary: 'Service Summary', intent: 'Intent & Objections', issue: 'Unresolved Issues', messages: 'Key Messages', snippets: 'Key Call Excerpts', queries: 'AIWA Query Log', tags: 'Customer Tags', business: 'Related Business', nextTask: 'Next Task', recording: 'Recording ID' },
      task: { create: 'Create Follow-up Task', callback: 'Create Callback Task', title: 'Task Title', owner: 'Owner', dueAt: 'Due Date', priority: 'Priority', high: 'High', medium: 'Medium', low: 'Low' },
      actions: { view: 'View Details', close: 'Close', customer: 'View Customer', business: 'Open Business', cancel: 'Cancel', save: 'Save Task', clear: 'Clear Filters' },
      pagination: { label: 'List pagination', total: '{count} records', previous: 'Previous', next: 'Next' },
      messages: { saved: 'Follow-up task created', required: 'Complete all required fields', empty: 'No service records match the filters' },
    },
  };

  const BUSINESS_PAGE = { 客户: 'customers', 销售订单: 'orders', 店铺: 'stores', 工单: 'workorders', 迷你仓: 'storage', 迷你箱: 'box', 合同: 'contracts', 保单: 'insurance' };

  function clone(value) {
    return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }

  function createState() {
    return { online: clone(ONLINE_RECORDS), phone: clone(PHONE_RECORDS) };
  }

  function getMetrics(type, records) {
    const list = Array.isArray(records) ? records : [];
    if (type === 'phone') {
      const connected = list.filter(item => item.result === '已接通').length;
      return {
        today: list.filter(item => item.isToday).length,
        connectionRate: `${(list.length ? connected / list.length * 100 : 0).toFixed(1)}%`,
        validIntent: list.filter(item => item.intent && item.intent.valid).length,
        callback: list.filter(item => item.followStatus === '待回拨').length,
      };
    }
    return {
      today: list.filter(item => item.isToday).length,
      resolved: list.filter(item => item.status === 'AIWA已解决').length,
      pending: list.filter(item => item.status === '待人工跟进').length,
      overdue: list.filter(item => item.status === '超时未处理').length,
    };
  }

  function includesKeyword(record, keyword) {
    const needle = String(keyword || '').trim().toLowerCase();
    if (!needle) return true;
    return [record.id, record.customer && record.customer.id, record.customer && record.customer.name, record.customer && record.customer.phone]
      .some(value => String(value || '').toLowerCase().includes(needle));
  }

  function filterRecords(type, records, filters) {
    const values = filters || {};
    const keys = type === 'phone' ? ['direction', 'result', 'robot', 'followStatus'] : ['channel', 'businessType', 'status', 'owner'];
    return (Array.isArray(records) ? records : []).filter(record => {
      if (!includesKeyword(record, values.keyword)) return false;
      if (!keys.every(key => !values[key] || values[key] === '全部' || record[key] === values[key])) return false;
      if (values.intent && values.intent !== '全部' && record.intent?.type !== values.intent) return false;
      if (values.tag && values.tag !== '全部' && !Object.values(record.tags || {}).flat().includes(values.tag)) return false;
      return true;
    });
  }

  function resolveBusinessTarget(businessReference) {
    const item = businessReference || {};
    return { page: BUSINESS_PAGE[item.type] || 'dashboard', id: item.id || '' };
  }

  function createFollowUp(type, record, form) {
    const values = form || {};
    for (const key of ['title', 'owner', 'dueAt', 'priority']) {
      if (!String(values[key] || '').trim()) throw new Error(`Missing required field: ${key}`);
    }
    const updated = clone(record);
    updated.task = {
      id: updated.task?.id || `TASK-${String(updated.id || '').replace(/^(CHAT|CALL)-/, '')}`,
      title: values.title.trim(), owner: values.owner.trim(), dueAt: values.dueAt.trim(), priority: values.priority.trim(), status: '待处理',
    };
    if (type === 'phone') updated.followStatus = '待回拨';
    else updated.status = '待人工跟进';
    return updated;
  }

  function copyForLanguage(language) {
    return clone(COPY[language === 'en' || language === 'zh-HK' ? language : 'zh-CN']);
  }

  return { createState, getMetrics, filterRecords, resolveBusinessTarget, createFollowUp, copyForLanguage };
});
