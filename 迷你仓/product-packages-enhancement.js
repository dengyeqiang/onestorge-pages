/* AIWA_PRODUCT_PACKAGES_DOMAIN_START */
(() => {
  const order = (id, customerZh, customerEn, business, amount, statusZh, statusEn, createdAt) => ({
    id, customerZh, customerEn, business, amount, statusZh, statusEn, createdAt,
  });
  const presets = [
    { id:'PKG-BX-01', nameZh:'灵活存箱组合', nameEn:'Flexible Box Storage', type:'box', billingCycle:'month', requiresContract:true, price:328, status:'active', items:[{kind:'storage-box',quantity:3},{kind:'transport',quantity:1}], orders:[order('SO-26081123','陈小姐','Ms. Chan','新租','HK$984.00','履约中','In Fulfilment','2026-08-12')] },
    { id:'PKG-BX-02', nameZh:'家庭换季组合', nameEn:'Seasonal Home Package', type:'box', billingCycle:'quarter', requiresContract:true, price:888, status:'active', items:[{kind:'storage-box',quantity:6},{kind:'transport',quantity:2}], orders:[order('SO-26081098','黄先生','Mr. Wong','续租','HK$2,664.00','待付款','Pending Payment','2026-08-11')] },
    { id:'PKG-LG-01', nameZh:'行李寄存组合', nameEn:'Luggage Storage Package', type:'luggage', billingCycle:'month', requiresContract:false, price:268, status:'active', items:[{kind:'luggage',quantity:4},{kind:'transport',quantity:1}], orders:[order('SO-26080726','林小姐','Ms. Lam','新租','HK$536.00','已付款','Paid','2026-08-07')] },
    { id:'PKG-MV-01', nameZh:'搬运存储组合', nameEn:'Moving and Storage Package', type:'mixed', billingCycle:'once', requiresContract:false, price:1280, status:'active', items:[{kind:'transport',quantity:2},{kind:'storage-box',quantity:5}], orders:[order('SO-26080519','周先生','Mr. Chow','新租','HK$1,280.00','已完成','Completed','2026-08-05')] },
    { id:'PKG-CT-01', nameZh:'企业年度组合', nameEn:'Business Annual Package', type:'business', billingCycle:'year', requiresContract:true, price:6880, status:'active', items:[{kind:'contract',quantity:1},{kind:'storage-box',quantity:12},{kind:'transport',quantity:4}], orders:[] },
    { id:'PKG-ST-01', nameZh:'短期试用组合', nameEn:'Short-term Trial Package', type:'trial', billingCycle:'once', requiresContract:false, price:198, status:'inactive', items:[{kind:'storage-box',quantity:1}], orders:[] },
    { id:'PKG-LG-02', nameZh:'学生行李组合', nameEn:'Student Luggage Package', type:'luggage', billingCycle:'quarter', requiresContract:true, price:598, status:'active', items:[{kind:'luggage',quantity:3},{kind:'contract',quantity:1}], orders:[] },
  ];
  const itemCatalog = [
    { kind:'storage-box', nameZh:'标准迷你箱', nameHk:'標準迷你箱', nameEn:'Standard Mini Box', descriptionZh:'60 × 40 × 35 cm，每箱限重 23 kg', descriptionEn:'60 × 40 × 35 cm, maximum 23 kg per box' },
    { kind:'luggage', nameZh:'行李寄存', nameHk:'行李寄存', nameEn:'Luggage Storage', descriptionZh:'适合旅行箱及大件随身物品', descriptionEn:'For suitcases and bulky personal items' },
    { kind:'transport', nameZh:'上门运输', nameHk:'上門運輸', nameEn:'Door-to-door Transport', descriptionZh:'送空箱、收箱或取物上门服务', descriptionEn:'Doorstep box delivery, collection or retrieval' },
    { kind:'contract', nameZh:'合约服务', nameHk:'合約服務', nameEn:'Contract Service', descriptionZh:'电子合约签署与租期管理', descriptionEn:'E-contract signing and rental-term management' },
  ];
  const normalizeItems = items => (Array.isArray(items) ? items : [])
    .filter(item => itemCatalog.some(option => option.kind === item?.kind) && Number(item.quantity) > 0)
    .map(item => ({ kind:item.kind, quantity:Math.max(1, Math.floor(Number(item.quantity))) }));
  const clonePackage = pkg => ({ ...pkg, items:normalizeItems(pkg?.items), orders:[...(pkg?.orders || [])] });
  const validate = value => {
    const errors = [];
    if (!String(value?.nameZh || value?.nameEn || '').trim()) errors.push('name');
    if (!normalizeItems(value?.items).length) errors.push('items');
    if (value?.price === '' || value?.price === null || value?.price === undefined || Number.isNaN(Number(value.price))) errors.push('price');
    if (!value?.billingCycle) errors.push('billingCycle');
    return errors;
  };
  const createPackage = value => {
    const nextNumber = presets.reduce((max, pkg) => {
      const match = /^PKG-NEW-(\d+)$/.exec(pkg.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0) + 1;
    const created = clonePackage({ ...value, id:`PKG-NEW-${String(nextNumber).padStart(2,'0')}`, status:value.status || 'active', orders:[] });
    presets.unshift(created);
    return created;
  };
  const updatePackage = (id, value) => {
    const index = presets.findIndex(pkg => pkg.id === id);
    if (index < 0) return false;
    presets[index] = clonePackage({ ...presets[index], ...value, id, orders:presets[index].orders || [] });
    return true;
  };
  window.AiwaProductPackagesDomain = { presets, itemCatalog, normalizeItems, clonePackage, validate, createPackage, updatePackage };
})();
/* AIWA_PRODUCT_PACKAGES_DOMAIN_END */

/* AIWA_PRODUCT_PACKAGES_MODULE */
(() => {
  const boot = () => {
  const domain = window.AiwaProductPackagesDomain;
  if (!domain || typeof document === 'undefined') return;
  const host = document.getElementById('mini-storage-native-host');
  const root = host?.shadowRoot;
  if (!root) { setTimeout(boot, 120); return; }
  if (window.__AIWA_PRODUCT_PACKAGES_ENHANCEMENT_BOOTED__) return;
  window.__AIWA_PRODUCT_PACKAGES_ENHANCEMENT_BOOTED__ = true;

  const state = { language: localStorage.getItem('aiwabot-prototype-language') || 'zh-CN', keyword:'', type:'all', contract:'all', drawer:'', selected:null };
  const isEnglish = () => state.language === 'en';
  const isTraditional = () => state.language === 'zh-HK';
  const toTraditional = value => String(value).replace(/组/g,'組').replace(/合/g,'合').replace(/关/g,'關').replace(/联/g,'聯').replace(/订/g,'訂').replace(/单/g,'單').replace(/启/g,'啟').replace(/用/g,'用').replace(/签/g,'簽').replace(/约/g,'約').replace(/类/g,'類').replace(/状/g,'狀').replace(/态/g,'態').replace(/筛/g,'篩').replace(/选/g,'選').replace(/显/g,'顯').replace(/详/g,'詳').replace(/创/g,'創').replace(/称/g,'稱').replace(/项/g,'項');
  const copy = {
    'zh-CN':{title:'迷你箱组合',add:'新增迷你箱套餐',drawerCreate:'新增迷你箱套餐',drawerEdit:'编辑迷你箱套餐',keyword:'搜索套餐编号或名称',allType:'全部套餐类型',type:'套餐类型',allContract:'全部签约类型',contract:'签约类型',name:'套餐名称',price:'套餐价格',cycle:'计费周期',status:'状态',actions:'操作',view:'查看',edit:'编辑',toggle:'启用/停用',custom:'选择组合项目',items:'组合项目',itemHint:'勾选套餐包含的服务，并设置每项数量',quantity:'数量',permission:'产品套餐权限',relatedOrders:'关联订单',save:'保存',cancel:'取消',nameZhLabel:'中文套餐名称',nameEnLabel:'英文套餐名称',required:'需要签约',notRequired:'无需签约',formError:'请填写套餐名称、价格、计费周期，并至少选择一个组合项目。'},
    'zh-HK':{title:'迷你箱組合',add:'新增迷你箱套餐',drawerCreate:'新增迷你箱套餐',drawerEdit:'編輯迷你箱套餐',keyword:'搜尋套餐編號或名稱',allType:'全部套餐類型',type:'套餐類型',allContract:'全部簽約類型',contract:'簽約類型',name:'套餐名稱',price:'套餐價格',cycle:'計費週期',status:'狀態',actions:'操作',view:'查看',edit:'編輯',toggle:'啟用/停用',custom:'選擇組合項目',items:'組合項目',itemHint:'勾選套餐包含的服務，並設定每項數量',quantity:'數量',permission:'產品套餐權限',relatedOrders:'關聯訂單',save:'儲存',cancel:'取消',nameZhLabel:'中文套餐名稱',nameEnLabel:'英文套餐名稱',required:'需要簽約',notRequired:'無需簽約',formError:'請填寫套餐名稱、價格、計費週期，並至少選擇一個組合項目。'},
    en:{title:'Mini-box Packages',add:'New Mini-box Package',drawerCreate:'New Mini-box Package',drawerEdit:'Edit Mini-box Package',keyword:'Search package ID or name',allType:'All Package Types',type:'Package Type',allContract:'All Contract Types',contract:'Contract Type',name:'Package Name',price:'Package Price',cycle:'Billing Cycle',status:'Status',actions:'Actions',view:'View',edit:'Edit',toggle:'Enable / Disable',custom:'Select Combination Projects',items:'Combination Projects',itemHint:'Select included services and set a quantity for each',quantity:'Quantity',permission:'Product Package Permissions',relatedOrders:'Related Orders',save:'Save',cancel:'Cancel',nameZhLabel:'Chinese Package Name',nameEnLabel:'English Package Name',required:'Contract required',notRequired:'No contract required',formError:'Enter a package name, price and billing cycle, then select at least one combination project.'},
  };
  const t = key => copy[state.language]?.[key] || copy['zh-CN'][key] || key;
  const localize = value => isEnglish() ? value : (isTraditional() ? toTraditional(value) : value);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const packageName = pkg => isEnglish() ? pkg.nameEn : localize(pkg.nameZh);
  const itemName = item => {
    const option = domain.itemCatalog.find(entry => entry.kind === item.kind);
    return option ? (isEnglish() ? option.nameEn : (isTraditional() ? option.nameHk : option.nameZh)) : item.kind;
  };
  const itemDescription = option => isEnglish() ? option.descriptionEn : localize(option.descriptionZh);
  const typeLabels = { box:['迷你箱','迷你箱','Mini-box'], luggage:['行李寄存','行李寄存','Luggage'], mixed:['综合服务','綜合服務','Mixed'], business:['企业方案','企業方案','Business'], trial:['试用方案','試用方案','Trial'] };
  const cycleLabels = { month:['按月','按月','Monthly'], quarter:['按季','按季','Quarterly'], year:['按年','按年','Yearly'], once:['一次性','一次性','One-time'] };
  const localizedOption = (map, key) => map[key]?.[isEnglish()?2:(isTraditional()?1:0)] || key;
  const filtered = () => domain.presets.filter(pkg => {
    const keyword = state.keyword.toLowerCase();
    return (!keyword || `${pkg.id} ${pkg.nameZh} ${pkg.nameEn}`.toLowerCase().includes(keyword)) && (state.type === 'all' || pkg.type === state.type) && (state.contract === 'all' || String(pkg.requiresContract) === state.contract);
  });

  const style = document.createElement('style');
  style.textContent = `
    .main.pp-host-active>:not(#aiwa-product-packages-page){display:none!important}
    #aiwa-product-packages-page{display:none;color:#25212a;padding:0 8px 32px}
    #aiwa-product-packages-page.active{display:block}.pp-heading{display:flex;align-items:center;justify-content:space-between;margin:4px 0 22px}.pp-heading h1{margin:0;font-size:24px}
    .pp-primary{border:0;border-radius:9px;background:#9856aa;color:#fff;padding:11px 18px;font-weight:700;cursor:pointer}.pp-filters{display:flex;gap:12px;padding:18px;background:#fff;border:1px solid #ece7ef;border-radius:14px 14px 0 0}.pp-filters input,.pp-filters select,.pp-form input,.pp-form select{height:40px;border:1px solid #ddd4e1;border-radius:8px;padding:0 12px;background:transparent;color:inherit}.pp-filters input{min-width:280px}.pp-table-wrap{max-width:100%;overflow-x:auto;border:1px solid #ece7ef;border-top:0}.pp-table{width:100%;min-width:1420px;border-collapse:collapse;background:#fff;border:0}.pp-table th,.pp-table td{padding:14px 13px;text-align:left;border-bottom:1px solid #eee8f0;vertical-align:middle;white-space:nowrap}.pp-table th{background:#faf8fb;color:#716879;font-size:13px}.pp-link{border:0;background:none;color:#9856aa;cursor:pointer;margin-right:10px;white-space:nowrap}.pp-tag{display:inline-flex;padding:3px 9px;border-radius:999px;background:#edf8e9;color:#399625;font-size:12px}.pp-tag.off{background:#f2f1f3;color:#807985}.pp-combination-summary{display:flex;flex-wrap:nowrap;gap:5px;min-width:190px}.pp-item-chip{display:inline-flex;padding:4px 7px;border-radius:6px;color:#684272;background:#f6eef8;font-size:11px;white-space:nowrap}
    #aiwa-product-packages-drawer{position:fixed;inset:0;display:none;z-index:12000;background:rgba(10,8,12,.56)}#aiwa-product-packages-drawer.open{display:block}.pp-drawer-panel{position:absolute;right:0;top:0;height:100%;width:min(760px,94vw);box-sizing:border-box;overflow:auto;background:#fff;padding:26px;color:#25212a}.pp-drawer-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}.pp-drawer-head h2{margin:0}.pp-close{border:0;background:none;font-size:25px;cursor:pointer}.pp-form{display:grid;grid-template-columns:1fr 1fr;gap:16px}.pp-form label{display:grid;gap:7px;font-size:13px}.pp-form .wide{grid-column:1/-1}.pp-items,.pp-related-orders{grid-column:1/-1;border:1px solid #e9e2ec;border-radius:12px;padding:16px}.pp-items-head{display:flex;justify-content:space-between;gap:16px;margin-bottom:12px}.pp-items-head span{color:#817787;font-size:12px}.pp-item-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pp-item-option{min-height:82px;display:grid;grid-template-columns:22px minmax(0,1fr) 76px;gap:10px;align-items:center;padding:12px;border:1px solid #e6dfe9;border-radius:10px;cursor:pointer}.pp-item-option.selected{border-color:#a96fba;background:#fcf7fd;box-shadow:inset 0 0 0 1px #a96fba}.pp-item-option input[type=checkbox]{width:17px;height:17px;accent-color:#9856aa}.pp-item-copy{display:grid;gap:4px}.pp-item-copy b{font-size:13px}.pp-item-copy small{color:#837887;font-size:11px;line-height:16px}.pp-item-quantity{display:grid;gap:4px;color:#837887;font-size:10px}.pp-item-quantity input{width:100%;height:34px;padding:0 7px}.pp-form-error{display:none;grid-column:1/-1;padding:10px 12px;border-radius:8px;color:#a12929;background:#fff0f0;font-size:12px}.pp-form-error.show{display:block}.pp-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}.pp-secondary{border:1px solid #d9d0de;background:transparent;border-radius:9px;padding:10px 16px;color:inherit;cursor:pointer}
    #aiwa-product-packages-drawer.create-mode{align-items:center;justify-content:center}#aiwa-product-packages-drawer.create-mode.open{display:flex}#aiwa-product-packages-drawer.create-mode .pp-drawer-panel{position:relative;right:auto;top:auto;height:auto;max-height:88vh;border-radius:16px}
    :host(.theme-dark-root) #aiwa-product-packages-page{color:#eee8f1}:host(.theme-dark-root) #aiwa-product-packages-page .pp-filters,:host(.theme-dark-root) #aiwa-product-packages-page .pp-table,:host(.theme-dark-root) .pp-drawer-panel{background:#211c24;color:#eee8f1;border-color:#453b4b}:host(.theme-dark-root) #aiwa-product-packages-page .pp-table th{background:#29222d;color:#c9bdce}:host(.theme-dark-root) #aiwa-product-packages-page .pp-table td{border-color:#3b3240}:host(.theme-dark-root) .pp-drawer-panel input,:host(.theme-dark-root) .pp-drawer-panel select{border-color:#514457}:host(.theme-dark-root) .pp-item-option{border-color:#4a3f4f}:host(.theme-dark-root) .pp-item-option.selected{border-color:#bd83cc;background:#302535}:host(.theme-dark-root) .pp-item-chip{color:#e2b9e9;background:#35283a}
  `;
  root.appendChild(style);
  const page = document.createElement('section');
  page.id = 'aiwa-product-packages-page';
  const drawer = document.createElement('div');
  drawer.id = 'aiwa-product-packages-drawer';
  root.append(drawer);

  function renderPage(){
    page.innerHTML = `<div class="pp-heading"><div><h1>${esc(t('title'))}</h1></div><button class="pp-primary" data-action="create">+ ${esc(t('add'))}</button></div><div class="pp-filters"><input data-filter="keyword" value="${esc(state.keyword)}" placeholder="${esc(t('keyword'))}"><select data-filter="type"><option value="all">${esc(t('allType'))}</option>${Object.keys(typeLabels).map(key=>`<option value="${key}">${esc(localizedOption(typeLabels,key))}</option>`).join('')}</select><select data-filter="contract"><option value="all">${esc(t('allContract'))}</option><option value="true">${esc(t('required'))}</option><option value="false">${esc(t('notRequired'))}</option></select></div><div class="pp-table-wrap"><table class="pp-table"><thead><tr><th>ID</th><th>${esc(t('name'))}</th><th>${esc(t('type'))}</th><th>${esc(t('items'))}</th><th>${esc(t('price'))}</th><th>${esc(t('cycle'))}</th><th>${esc(t('contract'))}</th><th>${esc(t('status'))}</th><th>${esc(t('actions'))}</th></tr></thead><tbody>${filtered().map(pkg=>`<tr><td>${pkg.id}</td><td><b>${esc(packageName(pkg))}</b></td><td>${esc(localizedOption(typeLabels,pkg.type))}</td><td><div class="pp-combination-summary">${pkg.items.map(item=>`<span class="pp-item-chip">${esc(itemName(item))} × ${item.quantity}</span>`).join('')}</div></td><td>HK$${pkg.price}</td><td>${esc(localizedOption(cycleLabels,pkg.billingCycle))}</td><td>${esc(pkg.requiresContract?t('required'):t('notRequired'))}</td><td><span class="pp-tag ${pkg.status==='active'?'':'off'}">${pkg.status==='active'?(isEnglish()?'Enabled':'已启用'):(isEnglish()?'Disabled':'已停用')}</span></td><td><button class="pp-link" data-action="view" data-id="${pkg.id}">${esc(t('view'))}</button><button class="pp-link" data-action="edit" data-id="${pkg.id}">${esc(t('edit'))}</button><button class="pp-link" data-action="toggle" data-id="${pkg.id}">${esc(t('toggle'))}</button></td></tr>`).join('')}</tbody></table></div>`;
    page.querySelector('[data-filter="type"]').value=state.type;page.querySelector('[data-filter="contract"]').value=state.contract;
  }
  function renderPagePreservingKeyword(input){
    const selectionStart=input.selectionStart;
    const selectionEnd=input.selectionEnd;
    renderPage();
    const next=page.querySelector('[data-filter="keyword"]');
    next?.focus();
    if(next?.setSelectionRange&&selectionStart!==null)next.setSelectionRange(selectionStart,selectionEnd);
  }
  function renderDrawer(){
    drawer.classList.toggle('create-mode', state.drawer==='create');
    const pkg=state.selected||{id:'',nameZh:'',nameEn:'',type:'box',billingCycle:'month',requiresContract:true,price:'',items:[{kind:'storage-box',quantity:1}],orders:[]};
    const disabled=state.drawer==='view'?'disabled':'';
    drawer.innerHTML=`<div class="pp-drawer-panel"><div class="pp-drawer-head"><h2>${esc(state.drawer==='create'?t('drawerCreate'):(state.drawer==='edit'?t('drawerEdit'):packageName(pkg)))}</h2><button class="pp-close" data-action="close">×</button></div><div class="pp-form"><label>${esc(t('nameZhLabel'))}<input data-field="nameZh" value="${esc(pkg.nameZh)}" ${disabled}></label><label>${esc(t('nameEnLabel'))}<input data-field="nameEn" value="${esc(pkg.nameEn)}" ${disabled}></label><label>${esc(t('type'))}<select data-field="type" ${disabled}>${Object.keys(typeLabels).map(key=>`<option value="${key}" ${pkg.type===key?'selected':''}>${esc(localizedOption(typeLabels,key))}</option>`).join('')}</select></label><label>${esc(t('price'))}<input data-field="price" type="number" min="0" step="1" value="${esc(pkg.price)}" ${disabled}></label><label>${esc(t('cycle'))}<select data-field="billingCycle" ${disabled}>${Object.keys(cycleLabels).map(key=>`<option value="${key}" ${pkg.billingCycle===key?'selected':''}>${esc(localizedOption(cycleLabels,key))}</option>`).join('')}</select></label><label>${esc(t('contract'))}<select data-field="requiresContract" ${disabled}><option value="true" ${pkg.requiresContract?'selected':''}>${esc(t('required'))}</option><option value="false" ${!pkg.requiresContract?'selected':''}>${esc(t('notRequired'))}</option></select></label><div class="pp-items"><div class="pp-items-head"><b>${esc(t('custom'))}</b><span>${esc(t('itemHint'))}</span></div><div class="pp-item-grid">${domain.itemCatalog.map(option=>{const selected=pkg.items.find(item=>item.kind===option.kind);return `<label class="pp-item-option ${selected?'selected':''}"><input type="checkbox" data-item-check="${option.kind}" ${selected?'checked':''} ${disabled}><span class="pp-item-copy"><b>${esc(itemName(option))}</b><small>${esc(itemDescription(option))}</small></span><span class="pp-item-quantity">${esc(t('quantity'))}<input type="number" min="1" max="99" value="${selected?.quantity||1}" data-item-quantity="${option.kind}" ${selected?'': 'disabled'} ${disabled}></span></label>`}).join('')}</div></div><div class="pp-form-error" data-form-error>${esc(t('formError'))}</div>${state.drawer!=='create'?`<div class="pp-related-orders"><b>${esc(t('relatedOrders'))}</b>${(pkg.orders||[]).map(order=>`<p><button class="pp-link" data-action="open-related-order" data-id="${order.id}">${order.id}</button> · ${esc(isEnglish()?order.customerEn:order.customerZh)} · ${esc(order.amount)} · ${esc(isEnglish()?order.statusEn:order.statusZh)}</p>`).join('')||`<p>—</p>`}</div>`:''}</div><div class="pp-actions"><button class="pp-secondary" data-action="close">${esc(t('cancel'))}</button>${state.drawer==='view'?'':`<button class="pp-primary" data-action="save">${esc(t('save'))}</button>`}</div></div>`;
    drawer.classList.add('open');
  }
  function readForm(){
    const field = name => drawer.querySelector(`[data-field="${name}"]`)?.value ?? '';
    return {
      nameZh:field('nameZh').trim(), nameEn:field('nameEn').trim(), type:field('type'),
      price:field('price'), billingCycle:field('billingCycle'), requiresContract:field('requiresContract')==='true',
      items:[...drawer.querySelectorAll('[data-item-check]:checked')].map(check=>({
        kind:check.dataset.itemCheck,
        quantity:Number(drawer.querySelector(`[data-item-quantity="${check.dataset.itemCheck}"]`)?.value || 1),
      })),
    };
  }
  function preserveOpenDraft(){
    if(!drawer.classList.contains('open')||state.drawer==='view')return;
    state.selected={...(state.selected||{}),...readForm()};
  }
  function show(){const main=root.querySelector('.main');if(!main)return;if(!page.isConnected)main.append(page);main.classList.add('pp-host-active');page.classList.add('active');renderPage()}
  function hide(){root.querySelector('.main')?.classList.remove('pp-host-active');page.classList.remove('active');drawer.classList.remove('open')}
  function openRelatedOrder(id){const vm=window.__aiwaMiniStorageVm;vm?.createForm?.openRelatedOrder?.(id)}
  function syncVisibility(event){
    const activePage=event?.detail?.page||window.__aiwaMiniStorageVm?.activePage?.value||window.__aiwaMiniStorageVm?.activePage;
    activePage==='box-products'?show():hide();
  }
  function syncMenuLabel(){
    const menu=document.querySelector('[data-mini-storage-page="box-products"]');
    if(menu)menu.textContent=t('title');
  }
  page.addEventListener('input',event=>{const key=event.target.dataset.filter;if(!key)return;state[key]=event.target.value;key==='keyword'?renderPagePreservingKeyword(event.target):renderPage()});
  page.addEventListener('change',event=>{const key=event.target.dataset.filter;if(!key)return;state[key]=event.target.value;renderPage()});
  page.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button)return;if(button.dataset.action==='create'){state.drawer='create';state.selected=null;renderDrawer();return}const pkg=domain.presets.find(item=>item.id===button.dataset.id);if(['view','edit'].includes(button.dataset.action)&&pkg){state.drawer=button.dataset.action;state.selected=domain.clonePackage(pkg);renderDrawer()}if(button.dataset.action==='toggle'&&pkg){pkg.status=pkg.status==='active'?'inactive':'active';renderPage()}});
  drawer.addEventListener('change',event=>{if(!event.target.matches('[data-item-check]'))return;const option=event.target.closest('.pp-item-option');const quantity=option.querySelector('[data-item-quantity]');option.classList.toggle('selected',event.target.checked);quantity.disabled=!event.target.checked});
  drawer.addEventListener('click',event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(action==='close'||event.target===drawer)drawer.classList.remove('open');if(action==='save'){const value=readForm();const errors=domain.validate(value);drawer.querySelector('[data-form-error]')?.classList.toggle('show',Boolean(errors.length));if(errors.length)return;if(state.drawer==='create')domain.createPackage(value);else domain.updatePackage(state.selected.id,value);drawer.classList.remove('open');renderPage()}if(action==='open-related-order')openRelatedOrder(event.target.closest('[data-id]').dataset.id)});
  document.addEventListener('aiwa:ministorage-pagechange',syncVisibility);
  host.addEventListener('aiwa:ministorage-open',syncVisibility);
  document.addEventListener('aiwa:languagechange',event=>{preserveOpenDraft();state.language=event.detail?.language||'zh-CN';syncMenuLabel();if(page.classList.contains('active'))renderPage();if(drawer.classList.contains('open'))renderDrawer()});
  const pairingItem=document.querySelector('[data-mini-storage-page="logistics"]');const menu=document.querySelector('[data-mini-storage-page="box-products"]');if(pairingItem&&menu&&pairingItem.nextElementSibling!==menu)pairingItem.after(menu);
  syncMenuLabel();
  syncVisibility();
  };
  boot();
})();
