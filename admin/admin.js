// ===== Categories =====
let categories = JSON.parse(localStorage.getItem('shop_categories') || '[]');
if (!categories.length) {
  categories = [
    { id: 1, name: '食品', subs: ['零食', '飲品'] },
    { id: 2, name: '玩具/玩偶', subs: ['玩偶', '積木'] },
    { id: 3, name: '服飾', subs: ['上衣', '褲子', '配件'] },
    { id: 4, name: '生活用品', subs: ['居家', '文具'] },
  ];
  saveCategories();
}
function saveCategories() { localStorage.setItem('shop_categories', JSON.stringify(categories)); }

function renderCategorySelects() {
  const sel = document.getElementById('f-category');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = '<option value="">選擇分類</option>';
  categories.forEach(c => sel.innerHTML += `<option value="${c.name}">${c.name}</option>`);
  if (cur) sel.value = cur;
  updateSubcategory();
}

function updateSubcategory() {
  const cat = document.getElementById('f-category').value;
  const sub = document.getElementById('f-subcategory');
  if (!sub) return;
  sub.innerHTML = '<option value="">選擇子分類</option>';
  const found = categories.find(c => c.name === cat);
  if (found) found.subs.forEach(s => sub.innerHTML += `<option value="${s}">${s}</option>`);
}

function renderCategoryList() {
  const el = document.getElementById('category-list');
  if (!el) return;
  if (!categories.length) { el.innerHTML = '<div style="padding:14px;color:#aaa;font-size:13px;">尚無分類</div>'; return; }
  el.innerHTML = categories.map((c, ci) => `
    <div>
      <div class="category-item">
        <span style="flex:1;font-size:13px;" id="cn-${ci}">${c.name}</span>
        <input style="flex:1;display:none;padding:5px 8px;border:1px solid #378add;border-radius:6px;font-size:13px;outline:none;" id="ci-${ci}" value="${c.name}" onkeydown="if(event.key==='Enter')saveCategory(${ci})" />
        <button class="cat-btn cat-edit" id="ce-${ci}" onclick="editCategory(${ci})">編輯</button>
        <button class="cat-btn cat-save" id="cs-${ci}" onclick="saveCategory(${ci})" style="display:none">儲存</button>
        <button class="cat-btn cat-del" onclick="deleteCategory(${ci})">刪除</button>
      </div>
      <div class="subcategory-list">
        ${c.subs.map((s, si) => `
          <div class="subcategory-item">
            <span style="flex:1;" id="sn-${ci}-${si}">${s}</span>
            <input style="flex:1;display:none;padding:3px 8px;border:1px solid #378add;border-radius:6px;font-size:12px;outline:none;" id="si-${ci}-${si}" value="${s}" onkeydown="if(event.key==='Enter')saveSub(${ci},${si})" />
            <button class="cat-btn cat-edit" id="se-${ci}-${si}" onclick="editSub(${ci},${si})">編輯</button>
            <button class="cat-btn cat-save" id="ss-${ci}-${si}" onclick="saveSub(${ci},${si})" style="display:none">儲存</button>
            <button class="cat-btn cat-del" onclick="deleteSub(${ci},${si})">刪除</button>
          </div>`).join('')}
        <div style="display:flex;gap:6px;margin-top:6px;">
          <input style="flex:1;padding:5px 8px;border:1px solid #e8f0f8;border-radius:6px;font-size:12px;outline:none;" id="newsub-${ci}" placeholder="新增子分類" />
          <button class="cat-btn cat-edit" onclick="addSub(${ci})">新增</button>
        </div>
      </div>
    </div>`).join('');
}

function editCategory(i) {
  document.getElementById('cn-'+i).style.display='none';
  document.getElementById('ci-'+i).style.display='block';
  document.getElementById('ce-'+i).style.display='none';
  document.getElementById('cs-'+i).style.display='inline-block';
  document.getElementById('ci-'+i).focus();
}
function saveCategory(i) { categories[i].name=document.getElementById('ci-'+i).value; saveCategories(); renderCategoryList(); renderCategorySelects(); }
function deleteCategory(i) { if(!confirm('確定刪除此分類？')) return; categories.splice(i,1); saveCategories(); renderCategoryList(); renderCategorySelects(); }
function addCategory() { const v=document.getElementById('new-cat-input').value.trim(); if(!v) return; categories.push({id:Date.now(),name:v,subs:[]}); document.getElementById('new-cat-input').value=''; saveCategories(); renderCategoryList(); renderCategorySelects(); }
function editSub(ci,si) { document.getElementById('sn-'+ci+'-'+si).style.display='none'; document.getElementById('si-'+ci+'-'+si).style.display='block'; document.getElementById('se-'+ci+'-'+si).style.display='none'; document.getElementById('ss-'+ci+'-'+si).style.display='inline-block'; }
function saveSub(ci,si) { categories[ci].subs[si]=document.getElementById('si-'+ci+'-'+si).value; saveCategories(); renderCategoryList(); renderCategorySelects(); }
function deleteSub(ci,si) { categories[ci].subs.splice(si,1); saveCategories(); renderCategoryList(); renderCategorySelects(); }
function addSub(ci) { const v=document.getElementById('newsub-'+ci).value.trim(); if(!v) return; categories[ci].subs.push(v); saveCategories(); renderCategoryList(); renderCategorySelects(); }

// ===== Specs =====
let specs = [];
function addSpec(main='', sub='') { specs.push({id:Date.now(),main,sub}); renderSpecs(); }
function removeSpec(id) { specs=specs.filter(s=>s.id!==id); renderSpecs(); }
function renderSpecs() {
  const el = document.getElementById('spec-rows');
  if (!el) return;
  el.innerHTML = specs.map(s => `
    <div class="spec-row">
      <input value="${s.main}" placeholder="例如：L號" oninput="updateSpec(${s.id},'main',this.value)" />
      <input value="${s.sub}" placeholder="例如：白色" oninput="updateSpec(${s.id},'sub',this.value)" />
      <button class="spec-remove" onclick="removeSpec(${s.id})">✕</button>
    </div>`).join('');
}
function updateSpec(id, field, val) { const s=specs.find(x=>x.id===id); if(s) s[field]=val; }

// ===== Radio =====
function setRadio(field, val, el, color='blue') {
  document.getElementById('f-'+field).value = val;
  el.parentElement.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('active','active-green'));
  el.classList.add('active');
  if (color === 'green') el.classList.add('active-green');
}

// ===== Date Selects =====
function initDateSelects() {
  const yEl = document.getElementById('f-arrive-year');
  const mEl = document.getElementById('f-arrive-month');
  if (!yEl || !mEl) return;
  yEl.innerHTML = '<option value="">年</option>';
  const yr = new Date().getFullYear();
  for (let y = yr; y <= yr+3; y++) yEl.innerHTML += `<option value="${y}">${y} 年</option>`;
  mEl.innerHTML = '<option value="">月</option>';
  for (let m = 1; m <= 12; m++) mEl.innerHTML += `<option value="${m}">${m} 月</option>`;
}

// ===== Drawer =====
function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

// ===== Product Page =====
const adminToken = localStorage.getItem('admin_token') || '';
const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken };
let products = [];

function initProductPage() {
  initDateSelects();
  loadProducts();
}

async function loadProducts() {
  try {
    const res = await fetch(CONFIG.API_URL + '/api/admin/products', { headers: adminHeaders });
    products = await res.json();
    renderProducts(products);
    const cnt = document.getElementById('product-count');
    if (cnt) cnt.textContent = '共 ' + products.length + ' 件商品';
  } catch(e) {
    const tb = document.getElementById('products-tbody');
    if (tb) tb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#aaa;padding:32px;">載入失敗</td></tr>';
  }
}

function renderProducts(list) {
  const tb = document.getElementById('products-tbody');
  if (!tb) return;
  if (!list.length) { tb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#aaa;padding:32px;">目前沒有商品</td></tr>'; return; }
  tb.innerHTML = list.map(p => `
    <tr>
      <td style="font-size:28px;">${p.emoji||'📦'}</td>
      <td style="font-weight:500;">${p.name}</td>
      <td style="color:#888;">${p.category||'-'}${p.subcategory?'/'+p.subcategory:''}</td>
      <td><span class="badge ${p.product_type==='preorder'?'badge-preorder':'badge-instock'}">${p.product_type==='preorder'?'預購':'現貨'}</span></td>
      <td>NT$${(p.price||0).toLocaleString()}</td>
      <td><span class="badge ${p.is_active?'badge-active':'badge-inactive'}">${p.is_active?'上架':'下架'}</span></td>
      <td>
        <button class="btn-sm btn-edit" onclick="editProduct(${p.id})">編輯</button>
        <button class="btn-sm btn-delete" onclick="deleteProduct(${p.id})">刪除</button>
      </td>
    </tr>`).join('');
}

function filterTable(q) { renderProducts(products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))); }

function openDrawer(p=null) {
  document.getElementById('drawer-title').textContent = p ? '編輯商品' : '新增商品';
  document.getElementById('f-id').value = p ? p.id : '';
  document.getElementById('f-emoji').value = p ? p.emoji||'' : '';
  document.getElementById('f-name').value = p ? p.name : '';
  document.getElementById('f-price').value = p ? p.price : '';
  document.getElementById('f-original').value = p ? p.original_price||'' : '';
  document.getElementById('f-deposit').value = p ? p.deposit||'' : '';
  document.getElementById('f-cost').value = p ? p.cost||'' : '';
  document.getElementById('f-supplier').value = p ? p.supplier||'' : '';
  document.getElementById('f-deadline').value = p ? p.deadline||'' : '';
  document.getElementById('f-desc').value = p ? p.description||'' : '';
  document.getElementById('f-type').value = p ? p.product_type||'preorder' : 'preorder';
  document.getElementById('f-status').value = p ? (p.is_active?'active':'inactive') : 'active';
  document.getElementById('f-sale').value = p ? String(p.is_sale) : 'false';
  specs = p && p.specs ? JSON.parse(p.specs) : [];
  renderSpecs();
  renderCategoryList();
  renderCategorySelects();
  if (p) {
    document.getElementById('f-category').value = p.category||'';
    updateSubcategory();
    if (p.subcategory) setTimeout(() => document.getElementById('f-subcategory').value = p.subcategory, 50);
    if (p.arrive_year) document.getElementById('f-arrive-year').value = p.arrive_year;
    if (p.arrive_month) document.getElementById('f-arrive-month').value = p.arrive_month;
  }
  // Reset radios
  const typeGroup = document.getElementById('type-group');
  const statusGroup = document.getElementById('status-group');
  const saleGroup = document.getElementById('sale-group');
  if (typeGroup) {
    typeGroup.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('active','active-green'));
    const typeVal = document.getElementById('f-type').value;
    const typeBtn = typeGroup.querySelector(`.radio-btn:${typeVal==='preorder'?'first':'last'}-child`);
    if (typeBtn) typeBtn.classList.add('active');
  }
  if (statusGroup) {
    statusGroup.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('active','active-green'));
    const statusVal = document.getElementById('f-status').value;
    const statusBtn = statusGroup.querySelector(`.radio-btn:${statusVal==='active'?'first':'last'}-child`);
    if (statusBtn) statusBtn.classList.add('active','active-green');
  }
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('open');
}

function editProduct(id) { openDrawer(products.find(p => p.id === id)); }

async function deleteProduct(id) {
  if (!confirm('確定要刪除這個商品？')) return;
  await fetch(CONFIG.API_URL + '/api/admin/products/' + id, { method: 'DELETE', headers: adminHeaders });
  loadProducts();
}

async function saveProduct() {
  const emoji = document.getElementById('f-emoji').value.trim();
  const name = document.getElementById('f-name').value.trim();
  const price = document.getElementById('f-price').value;
  const desc = document.getElementById('f-desc').value.trim();
  const category = document.getElementById('f-category').value;
  const type = document.getElementById('f-type').value;
  const status = document.getElementById('f-status').value;
  if (!emoji||!name||!price||!desc||!category||!type||!status) {
    alert('請填寫所有必填欄位（標 * 的欄位）');
    return;
  }
  const id = document.getElementById('f-id').value;
  const body = {
    emoji, name, category,
    subcategory: document.getElementById('f-subcategory').value,
    product_type: type,
    is_active: status === 'active',
    price: Number(price),
    original_price: Number(document.getElementById('f-original').value)||null,
    deposit: Number(document.getElementById('f-deposit').value)||null,
    cost: Number(document.getElementById('f-cost').value)||null,
    supplier: document.getElementById('f-supplier').value,
    arrive_year: document.getElementById('f-arrive-year').value,
    arrive_month: document.getElementById('f-arrive-month').value,
    deadline: document.getElementById('f-deadline').value,
    description: desc,
    is_sale: document.getElementById('f-sale').value === 'true',
    specs: JSON.stringify(specs),
  };
  const url = id ? CONFIG.API_URL+'/api/admin/products/'+id : CONFIG.API_URL+'/api/admin/products';
  await fetch(url, { method: id?'PUT':'POST', headers: adminHeaders, body: JSON.stringify(body) });
  closeDrawer();
  loadProducts();
}
