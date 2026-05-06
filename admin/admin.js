// ===== 共用：Token =====
const adminToken = localStorage.getItem('admin_token') || '';
const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken };

// ===== 共用：分類 =====
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
  const cat = document.getElementById('f-category') ? document.getElementById('f-category').value : '';
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

// ===== 共用：規格 =====
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

// ===== 共用：Radio =====
function setRadio(field, val, el, color='blue') {
  document.getElementById('f-'+field).value = val;
  el.parentElement.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('active','active-green'));
  el.classList.add('active');
  if (color === 'green') el.classList.add('active-green');
}

// ===== 共用：日期選單 =====
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

// ===== 共用：關閉抽屜 =====
function closeDrawer() {
  const d = document.getElementById('drawer');
  const o = document.getElementById('drawer-overlay');
  if (d) d.classList.remove('open');
  if (o) o.classList.remove('open');
}
