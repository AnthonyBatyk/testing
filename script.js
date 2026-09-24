document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const PRODUCTS_KEY = "kbjv_products";
  const CALCULATOR_KEY = "kbjv_calculator";
  const ARCHIVE_KEY = "kbjv_archive";
  const ACTIVE_TAB_KEY = "kbjv_active_tab";
  const CALCULATOR_DRAFT_KEY = "kbjv_calculator_draft";
  const SORT_KEY = "kbjv_product_sort";
  const CONSOLE_KEY = "kbjv_console";
  const EXPORT_VERSION_KEY = "kbjv_export_version";
  const DATABASE_UPDATED_KEY = "kbjv_database_updated_at";
  const EXPORT_FINGERPRINT_KEY = "kbjv_export_fingerprint";
  const MEDICINES_KEY = "kbjv_medicines";
  const MEDICINE_ARCHIVE_KEY = "kbjv_medicine_archive";
  const MEDICINE_BUY_KEY = "kbjv_medicine_buy";

  let products = [];
  let calculatorItems = [];
  let archiveItems = [];
  let selectedProduct = null;
  let editingProduct = null;
  let draggedCard = null;
  let reorderMode = false;
  let reorderChanged = false;
  let archiveEditingId = null;
  let archiveOriginalText = null;
  let currentSort = localStorage.getItem(SORT_KEY) || "manual";
  let sortTarget = "blocks";
  let consoleItems = [];
  let draggedCalcIndex = null;
  let calculatorReorderMode = false;
  let calculatorReorderChanged = false;
  let medicines = [];
  let medicineArchive = [];
  let medicineBuy = [];

  const $ = id => document.getElementById(id);
  const tabs = document.querySelectorAll(".tab");
  const pages = document.querySelectorAll(".page");
  const grid = $("grid");
  const searchInput = $("search");
  const clearSearch = $("clear-search");
  const exportButton = $("export-products");
  const importButton = $("import-products");
  const importFile = $("import-file");
  const addProductButton = $("add-product");
  const deleteProductButton = $("delete-product");
  const reorderProductsButton = $("reorder-products");
  const sortProductsButton = $("sort-products");

  const productModal = $("product-modal");
  const productModalName = $("product-modal-name");
  const productWeight = $("product-weight");
  const productCancel = $("product-cancel");
  const productCopy = $("product-copy");
  const productCalculator = $("product-calculator");

  const addProductModal = $("add-product-modal");
  const addProductCancel = $("add-product-cancel");
  const addProductSave = $("add-product-save");
  const newProductName = $("new-product-name");
  const newProductKcal = $("new-product-kcal");
  const newProductProtein = $("new-product-protein");
  const newProductFat = $("new-product-fat");
  const newProductCarb = $("new-product-carb");
  const newProductSugar = $("new-product-sugar");
  const newProductSalt = $("new-product-salt");
  const newProductFiber = $("new-product-fiber");
  const newProductDescription = $("new-product-description");

  const editProductModal = $("edit-product-modal");
  const editProductCancel = $("edit-product-cancel");
  const editProductSave = $("edit-product-save");
  const editProductName = $("edit-product-name");
  const editProductKcal = $("edit-product-kcal");
  const editProductProtein = $("edit-product-protein");
  const editProductFat = $("edit-product-fat");
  const editProductCarb = $("edit-product-carb");
  const editProductSugar = $("edit-product-sugar");
  const editProductSalt = $("edit-product-salt");
  const editProductFiber = $("edit-product-fiber");
  const editProductDescription = $("edit-product-description");

  const sortProductsModal = $("sort-products-modal");
  const sortOldest = $("sort-oldest");
  const sortNewest = $("sort-newest");
  const sortProductsCancel = $("sort-products-cancel");

  const deleteProductModal = $("delete-product-modal");
  const deleteProductList = $("delete-product-list");
  const deleteProductCancelTop = $("delete-product-cancel-top");
  const deleteProductCancelBottom = $("delete-product-cancel-bottom");
  const deleteSortProducts = $("delete-sort-products");

  const calcInput = $("calc-input");
  const calcAdd = $("calc-add");
  const calcClearText = $("calc-clear-text");
  const calcClearBlocks = $("calc-clear-blocks");
  const calcSection = $("calc-section");
  const kcalElement = $("kcal");
  const proteinElement = $("protein");
  const fatElement = $("fat");
  const carbElement = $("carb");
  const sugarElement = $("sugar");
  const saltElement = $("salt");
  const fiberElement = $("fiber");
  const copyTotal = $("copy-total");
  const saveArchive = $("save-archive");
  const reorderCalculatorHistory = $("reorder-calculator-history");
  const calcLog = $("calc-log");
  const archiveLog = $("archive-log");
  const siteProductsCount = $("site-products-count");
  const siteArchiveCount = $("site-archive-count");
  const siteDatabaseUpdated = $("site-database-updated");
  const siteCurrentDate = $("site-current-date");
  const leaveSiteButton = $("leave-site");
  const medicineOpenAdd = $("medicine-open-add");
  const medicineClearAll = $("medicine-clear-all");
  const medicineBaseList = $("medicine-base-list");
  const medicineBuyList = $("medicine-buy-list");
  const medicineOpenBuyAdd = $("medicine-open-buy-add");
  const medicineTodaySummary = $("medicine-today-summary");
  const medicineOpenToday = $("medicine-open-today");
  const medicineSelectModal = $("medicine-select-modal");
  const medicineSelectList = $("medicine-select-list");
  const medicineSelectCancel = $("medicine-select-cancel");
  const medicineSaveDay = $("medicine-save-day");
  const medicineHistory = $("medicine-history");
  const medicineAddModal = $("medicine-add-modal");
  const medicineFormName = $("medicine-form-name");
  const medicineFormDose = $("medicine-form-dose");
  const medicineFormFull = $("medicine-form-full");
  const medicineAddCancel = $("medicine-add-cancel");
  const medicineAddSave = $("medicine-add-save");
  const medicineBuyModal = $("medicine-buy-modal");
  const medicineBuyName = $("medicine-buy-name");
  const medicineBuyDose = $("medicine-buy-dose");
  const medicineBuyFull = $("medicine-buy-full");
  const medicineBuyCancel = $("medicine-buy-cancel");
  const medicineBuySave = $("medicine-buy-save");
  const consoleLog = $("console-log");
  const statsChart = $("stats-chart");
  const statsEmpty = $("stats-empty");
  const statsTooltip = $("stats-tooltip");
  let statsRenderedPoints = [];
  let statsChartGeometry = null;
  const statsFrom = $("stats-from");
  const statsTo = $("stats-to");
  const statsMetricButtons = document.querySelectorAll(".stats-metric");
  let statsMetric = "kcal";

  const archiveTextModal = $("archive-text-modal");
  const archiveTextInput = $("archive-text-input");
  const archiveTextCancel = $("archive-text-cancel");
  const archiveTextSave = $("archive-text-save");

  const statusStyle = document.createElement("style");
  statusStyle.textContent = `
    .button-status-success{background:#22c55e!important;color:#fff!important;box-shadow:0 0 0 1px rgba(34,197,94,.35),0 0 18px rgba(34,197,94,.35)!important}
    .button-status-error{background:#ef4444!important;color:#fff!important;box-shadow:0 0 0 1px rgba(239,68,68,.35),0 0 18px rgba(239,68,68,.35)!important}
    .button-status-info{background:#7289da!important;color:#fff!important;box-shadow:0 0 0 1px rgba(114,137,218,.35),0 0 18px rgba(114,137,218,.35)!important}
    .button-status-success::after{content:"✓";margin-left:7px;font-weight:800}
    .button-status-error::after{content:"✕";margin-left:7px;font-weight:800}
  `;
  document.head.appendChild(statusStyle);

  function clearButtonStatus(button) {
    button?.classList.remove("button-status-success","button-status-error","button-status-info");
  }
  function showButtonState(button,text,state,duration=1500) {
    if (!button) return;
    if (!button.dataset.originalText) button.dataset.originalText = button.textContent.trim();
    clearTimeout(button._statusTimeout);
    clearButtonStatus(button);
    button.textContent = text;
    if (state) button.classList.add(`button-status-${state}`);
    if (duration > 0) button._statusTimeout = setTimeout(() => {
      button.textContent = button.dataset.originalText || "";
      clearButtonStatus(button);
    }, duration);
  }
  function setButtonStatusPermanent(button,text,state) { showButtonState(button,text,state,0); }

  function formatConsoleDate(date = new Date()) {
    const d=String(date.getDate()).padStart(2,"0"),m=String(date.getMonth()+1).padStart(2,"0"),y=date.getFullYear();
    const h=String(date.getHours()).padStart(2,"0"),mi=String(date.getMinutes()).padStart(2,"0"),se=String(date.getSeconds()).padStart(2,"0");
    return `${d}.${m}.${y} ${h}:${mi}:${se}`;
  }
  function saveConsoleLocal(){ localStorage.setItem(CONSOLE_KEY,JSON.stringify(consoleItems)); }
  function logAction(message){
    consoleItems.push({id:createId("console"),time:new Date().toISOString(),message:String(message ?? "Невідома дія")});
    saveConsoleLocal(); renderConsole();
  }
  function renderConsole(){
    if(!consoleLog)return; consoleLog.innerHTML="";
    if(!consoleItems.length){consoleLog.innerHTML='<div class="console-entry">Журнал дій порожній.</div>';return;}
    [...consoleItems].reverse().forEach(item=>{
      const row=document.createElement("div");row.className="console-entry";
      const dt=item.time?new Date(item.time):new Date();row.textContent=`[${formatConsoleDate(dt)}] ${item.message}`;consoleLog.append(row);
    });
  }

  function createId(prefix="id") { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`; }
  function number(value) { const n=Number(value); return Number.isFinite(n)?n:0; }
  function round(value,decimals=1) { const f=10**decimals; return Math.round((number(value)+Number.EPSILON)*f)/f; }
  function formatNumber(value) { return number(value).toFixed(2); }
  function getInitials(name) {
    const words=String(name||"").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "?";
    return words.length===1?words[0].slice(0,2).toUpperCase():(words[0][0]+words[1][0]).toUpperCase();
  }
  function normalizeProduct(product,index=0) {
    return {
      id:String(product.id ?? createId("product")),
      name:String(product.name ?? "").trim(),
      kcal:number(product.kcal),
      protein:number(product.protein ?? product.proteins),
      fat:number(product.fat),
      carb:number(product.carb ?? product.carbs),
      sugar:number(product.sugar ?? product.sugars),
      salt:number(product.salt),
      fiber:number(product.fiber ?? product.fibre),
      unit:product.unit==="мл"?"мл":"г",
      full_name:String(product.full_name ?? product.description ?? "").trim(),
      created_at:String(product.created_at || new Date(2000,0,1,0,0,index).toISOString())
    };
  }
  function loadArray(key) {
    try { const p=JSON.parse(localStorage.getItem(key)||"[]"); return Array.isArray(p)?p:[]; } catch { return []; }
  }
  function saveProductsLocal(){
    localStorage.setItem(PRODUCTS_KEY,JSON.stringify(products));
    localStorage.setItem(DATABASE_UPDATED_KEY,new Date().toISOString());
    updateSiteDataCounts();
  }
  function saveCalculatorLocal(){ localStorage.setItem(CALCULATOR_KEY,JSON.stringify(calculatorItems)); }
  function saveArchiveLocal(){ localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archiveItems)); }
  function saveMedicinesLocal(){ localStorage.setItem(MEDICINES_KEY,JSON.stringify(medicines)); }
  function saveMedicineArchiveLocal(){ localStorage.setItem(MEDICINE_ARCHIVE_KEY,JSON.stringify(medicineArchive)); }
  function saveMedicineBuyLocal(){ localStorage.setItem(MEDICINE_BUY_KEY,JSON.stringify(medicineBuy)); }
  function saveCalculatorDraft(){ if(calcInput)localStorage.setItem(CALCULATOR_DRAFT_KEY,calcInput.value); }
  function updateSiteDataCounts(){
    if(siteProductsCount)siteProductsCount.textContent=String(products.length);
    if(siteArchiveCount)siteArchiveCount.textContent=String(archiveItems.length);
    if(siteDatabaseUpdated){
      const raw=localStorage.getItem(DATABASE_UPDATED_KEY);
      if(!raw){siteDatabaseUpdated.textContent="Ще не оновлювалася";}
      else{const d=new Date(raw);siteDatabaseUpdated.textContent=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()} о ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;}
    }
    if(siteCurrentDate){const d=new Date();siteCurrentDate.textContent=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;}
  }
  function exportFingerprint(){
    return JSON.stringify({products:products.map((p,i)=>normalizeProduct(p,i)),archive:archiveItems,medicines,medicine_archive:medicineArchive,medicine_buy:medicineBuy});
  }
  function getExportVersion(){
    const fingerprint=exportFingerprint();
    const previous=localStorage.getItem(EXPORT_FINGERPRINT_KEY);
    let version=Math.max(0,parseInt(localStorage.getItem(EXPORT_VERSION_KEY)||"0",10)||0);
    if(previous!==fingerprint){version+=1;localStorage.setItem(EXPORT_VERSION_KEY,String(version));localStorage.setItem(EXPORT_FINGERPRINT_KEY,fingerprint);}
    if(version<1){version=1;localStorage.setItem(EXPORT_VERSION_KEY,"1");localStorage.setItem(EXPORT_FINGERPRINT_KEY,fingerprint);}
    return version;
  }
  function getSortedProducts() {
    const arr=[...products];
    if(currentSort==="oldest") arr.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    if(currentSort==="newest") arr.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    return arr;
  }

  tabs.forEach(tab=>tab.addEventListener("click",()=>{
    const target=tab.dataset.tab;
    tabs.forEach(t=>t.classList.remove("active"));
    pages.forEach(p=>p.classList.remove("active"));
    tab.classList.add("active");
    $(target)?.classList.add("active");
    localStorage.setItem(ACTIVE_TAB_KEY,target);
    if(target==="archive"){renderArchive();requestAnimationFrame(()=>renderStatistics());}
    if(target==="calculator"){renderCalculatorLog();updateTotals();}
    if(target==="medicines")renderMedicines();
    if(target==="console")renderConsole();
  }));

  function renderProducts(filter="") {
    if(!grid)return;
    updateSiteDataCounts();
    const q=String(filter).trim().toLowerCase();
    grid.innerHTML="";
    const filtered=getSortedProducts().filter(p=>!q||p.name.toLowerCase().includes(q)||p.full_name.toLowerCase().includes(q));
    if(!filtered.length){
      const empty=document.createElement("div");
      empty.style.cssText="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-secondary)";
      empty.textContent="Продуктів не знайдено.";
      grid.appendChild(empty); return;
    }
    filtered.forEach(p=>grid.appendChild(createProductCard(p)));
    updateReorderState();
  }

  function iconCopy(){
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 21H6a2 2 0 0 1-2-2V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="8" y="3" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/></svg><span class="tooltip">Скопіювати</span>`;
  }
  function iconEdit(){
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="tooltip">Редагувати</span>`;
  }
  function createProductCard(product){
    const card=document.createElement("article");
    card.className="food-card"; card.dataset.id=product.id;
    const actions=document.createElement("div"); actions.className="card-actions";
    const copy=document.createElement("button"); copy.type="button"; copy.className="copy-btn"; copy.innerHTML=iconCopy();
    const edit=document.createElement("button"); edit.type="button"; edit.className="edit-btn"; edit.innerHTML=iconEdit();
    copy.addEventListener("click",e=>{e.stopPropagation();openProductModal(product);});
    edit.addEventListener("click",e=>{e.stopPropagation();openEditProductModal(product);});
    actions.append(copy,edit);

    const title=document.createElement("div"); title.className="food-title";
    const badge=document.createElement("div"); badge.className="badge"; badge.textContent=getInitials(product.name);
    const tc=document.createElement("div");
    const name=document.createElement("div"); name.className="name"; name.textContent=product.name;
    const meta=document.createElement("div"); meta.className="meta"; meta.textContent=`100 ${product.unit||"г"}`;
    tc.append(name,meta); title.append(badge,tc);

    const kbjv=document.createElement("div"); kbjv.className="kbjv";
    const row=(key,val,unit="г")=>`<div class="row"><div class="key">${key}</div><div class="val">${formatNumber(val)} ${unit}</div></div>`;
    kbjv.innerHTML =
      row("Калорії",product.kcal,"ккал") +
      `<div class="kbjv-divider"></div>` +
      row("Білки",product.protein) + row("Жири",product.fat) + row("Вуглеводи",product.carb) +
      `<div class="kbjv-divider"></div>` +
      row("Цукри",product.sugar) + row("Сіль",product.salt) +
      `<div class="kbjv-divider"></div>` +
      row("Клітковина",product.fiber) +
      `<div class="kbjv-divider"></div>`;

    const full=document.createElement("div"); full.className="full-name"; full.textContent=product.full_name||"";
    card.append(actions,title,kbjv,full);
    card.addEventListener("click",e=>{if(!reorderMode&&!e.target.closest(".card-actions"))openProductModal(product);});
    return card;
  }

  searchInput?.addEventListener("input",()=>{renderProducts(searchInput.value);clearSearch.style.display=searchInput.value?"block":"none";});
  clearSearch?.addEventListener("click",()=>{searchInput.value="";clearSearch.style.display="none";renderProducts();searchInput.focus();});

  function openProductModal(product){selectedProduct=product;productModalName.textContent=product.name;productWeight.value="100";productModal.classList.add("active");}
  function closeProductModal(){selectedProduct=null;productModal.classList.remove("active");}
  productCancel?.addEventListener("click",closeProductModal);
  productModal?.addEventListener("click",e=>{if(e.target===productModal)closeProductModal();});

  function calculateProduct(product,weight){
    const m=number(weight)/100;
    return {kcal:product.kcal*m,protein:product.protein*m,fat:product.fat*m,carb:product.carb*m,sugar:product.sugar*m,salt:product.salt*m,fiber:product.fiber*m};
  }
  function getProductSummary(product,weight){
    const v=calculateProduct(product,weight);
    return `${product.name}, для ${formatNumber(weight)} грам - ${formatNumber(v.kcal)} ккал / ${formatNumber(v.protein)} білка / ${formatNumber(v.fat)} жирів / ${formatNumber(v.carb)} вуглеводів / ${formatNumber(v.sugar)} цукрів / ${formatNumber(v.salt)} солі / ${formatNumber(v.fiber)} клітковини`;
  }
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);return true;}catch{
      const t=document.createElement("textarea");t.value=text;t.style.position="fixed";t.style.left="-9999px";document.body.append(t);t.select();document.execCommand("copy");t.remove();return true;
    }
  }
  productCopy?.addEventListener("click",async()=>{
    if(!selectedProduct)return; const w=number(productWeight.value); if(w<=0)return productWeight.focus();
    if(await copyText(getProductSummary(selectedProduct,w))){showButtonState(productCopy,"Скопійовано","success",1200);logAction(`Скопійовано продукт «${selectedProduct.name}» (${formatNumber(w)} г).`);}
  });
  productCalculator?.addEventListener("click",()=>{
    if(!selectedProduct)return; const w=number(productWeight.value); if(w<=0)return productWeight.focus();
    const productName=selectedProduct.name;
    const text=getProductSummary(selectedProduct,w);
    const current=calcInput.value.trim(); calcInput.value=current?`${current}\n${text}`:text; saveCalculatorDraft();
    closeProductModal(); showButtonState(productCalculator,"Додано","success",1500); logAction(`Продукт «${productName}» додано в калькулятор.`);
  });

  function clearAddForm(){
    [newProductName,newProductKcal,newProductProtein,newProductFat,newProductCarb,newProductSugar,newProductSalt,newProductFiber,newProductDescription].forEach(el=>el.value="");
  }
  addProductButton?.addEventListener("click",()=>{clearAddForm();addProductModal.classList.add("active");setTimeout(()=>newProductName.focus(),50);});
  addProductCancel?.addEventListener("click",()=>{addProductModal.classList.remove("active");showButtonState(addProductButton,"Продукт не додано","error",1500);logAction("Додавання продукту скасовано.");});
  addProductModal?.addEventListener("click",e=>{if(e.target===addProductModal)addProductModal.classList.remove("active");});
  addProductSave?.addEventListener("click",()=>{
    const name=newProductName.value.trim(); if(!name)return newProductName.focus();
    products.push(normalizeProduct({
      id:createId("product"),name,kcal:newProductKcal.value,protein:newProductProtein.value,fat:newProductFat.value,
      carb:newProductCarb.value,sugar:newProductSugar.value,salt:newProductSalt.value,fiber:newProductFiber.value,unit:"г",
      full_name:newProductDescription.value.trim(),created_at:new Date().toISOString()
    }));
    saveProductsLocal();renderProducts(searchInput?.value||"");addProductModal.classList.remove("active");
    showButtonState(addProductButton,"Продукт додано","success",1500); logAction(`Додано продукт «${name}».`);
  });

  function openEditProductModal(product){
    editingProduct=product;
    editProductName.value=product.name;editProductKcal.value=product.kcal;editProductProtein.value=product.protein;
    editProductFat.value=product.fat;editProductCarb.value=product.carb;editProductSugar.value=product.sugar;
    editProductSalt.value=product.salt;editProductFiber.value=product.fiber;editProductDescription.value=product.full_name||"";
    editProductModal.classList.add("active");document.body.classList.add("edit-modal-open");setTimeout(()=>editProductName.focus(),50);
  }
  function closeEditProductModal(){editingProduct=null;editProductModal.classList.remove("active");document.body.classList.remove("edit-modal-open");}
  editProductCancel?.addEventListener("click",()=>{const n=editingProduct?.name||"продукту";closeEditProductModal();showButtonState(editProductSave,"Не збережено","error",1500);logAction(`Редагування «${n}» скасовано.`);});
  editProductModal?.addEventListener("click",e=>{if(e.target===editProductModal)closeEditProductModal();});
  editProductModal?.addEventListener("touchmove",e=>{if(e.target===editProductModal)e.preventDefault();},{passive:false});
  editProductSave?.addEventListener("click",()=>{
    if(!editingProduct)return;
    const name=editProductName.value.trim(); if(!name)return editProductName.focus();
    Object.assign(editingProduct,{
      name,kcal:number(editProductKcal.value),protein:number(editProductProtein.value),fat:number(editProductFat.value),
      carb:number(editProductCarb.value),sugar:number(editProductSugar.value),salt:number(editProductSalt.value),fiber:number(editProductFiber.value),
      full_name:editProductDescription.value.trim()
    });
    saveProductsLocal();renderProducts(searchInput?.value||"");closeEditProductModal();
    showButtonState(editProductSave,"Збережено","success",1500); logAction(`Зміни продукту «${name}» збережено.`);
  });

  function openSortModal(target="blocks"){sortTarget=target;sortProductsModal.classList.add("active");}
  sortProductsButton?.addEventListener("click",()=>openSortModal("blocks"));
  deleteSortProducts?.addEventListener("click",()=>openSortModal("delete"));
  sortProductsCancel?.addEventListener("click",()=>{sortProductsModal.classList.remove("active");const b=sortTarget==="delete"?deleteSortProducts:sortProductsButton;showButtonState(b,"Не відсортовано","error",1500);logAction("Сортування продуктів скасовано.");});
  sortProductsModal?.addEventListener("click",e=>{if(e.target===sortProductsModal)sortProductsModal.classList.remove("active");});
  function applySort(mode){
    currentSort=mode;localStorage.setItem(SORT_KEY,mode);sortProductsModal.classList.remove("active");
    renderProducts(searchInput?.value||""); if(deleteProductModal.classList.contains("active"))renderDeleteProductList();
    showButtonState(sortTarget==="delete"?deleteSortProducts:sortProductsButton,mode==="oldest"?"Старіші → новіші":"Новіші → старіші","success",1500); logAction(`Продукти відсортовано: ${mode==="oldest"?"від старіших до новіших":"від новіших до старіших"}.`);
  }
  sortOldest?.addEventListener("click",()=>applySort("oldest"));
  sortNewest?.addEventListener("click",()=>applySort("newest"));

  deleteProductButton?.addEventListener("click",()=>{renderDeleteProductList();deleteProductModal.classList.add("active");});
  [deleteProductCancelTop,deleteProductCancelBottom].forEach(b=>b?.addEventListener("click",()=>{deleteProductModal.classList.remove("active");showButtonState(deleteProductButton,"Продукт не видалено","error",1500);logAction("Видалення продукту скасовано.");}));
  deleteProductModal?.addEventListener("click",e=>{if(e.target===deleteProductModal)deleteProductModal.classList.remove("active");});
  function renderDeleteProductList(){
    deleteProductList.innerHTML="";
    const list=getSortedProducts();
    if(!list.length){deleteProductList.innerHTML='<div class="delete-product-empty">База продуктів порожня.</div>';return;}
    list.forEach(product=>{
      const item=document.createElement("div");item.className="delete-product-item";
      const name=document.createElement("div");name.className="delete-product-item-name";name.textContent=product.name;
      const button=document.createElement("button");button.className="delete-product-item-button";button.textContent="Видалити";
      button.addEventListener("click",()=>{
        if(!confirm(`Видалити продукт "${product.name}"?`))return;
        products=products.filter(p=>p.id!==product.id);saveProductsLocal();renderProducts(searchInput?.value||"");renderDeleteProductList();
        showButtonState(deleteProductButton,"Продукт видалено","success",1500); logAction(`Видалено продукт «${product.name}».`);
      });
      item.append(name,button);deleteProductList.append(item);
    });
  }

  reorderProductsButton?.addEventListener("click",()=>{
    if(!reorderMode){reorderMode=true;reorderChanged=false;currentSort="manual";localStorage.setItem(SORT_KEY,"manual");setButtonStatusPermanent(reorderProductsButton,"Завершити зміну розташування?","info");updateReorderState();return;}
    reorderMode=false;updateReorderState();showButtonState(reorderProductsButton,reorderChanged?"Розташування змінено":"Розташування не змінено",reorderChanged?"success":"error",1800);logAction(reorderChanged?"Розташування продуктів змінено.":"Зміну розташування продуктів завершено без змін.");
  });
  function updateReorderState(){
    if(!grid)return;grid.classList.toggle("reorder-mode",reorderMode);
    grid.querySelectorAll(".food-card").forEach(card=>{card.draggable=reorderMode;if(reorderMode)attachDragEvents(card);});
  }
  function attachDragEvents(card){
    card.ondragstart=e=>{draggedCard=card;card.classList.add("dragging");e.dataTransfer.setData("text/plain",card.dataset.id);};
    card.ondragend=()=>{card.classList.remove("dragging");draggedCard=null;};
    card.ondragover=e=>{e.preventDefault();if(draggedCard&&draggedCard!==card)card.classList.add("drag-over");};
    card.ondragleave=()=>card.classList.remove("drag-over");
    card.ondrop=e=>{
      e.preventDefault();card.classList.remove("drag-over");if(!draggedCard||draggedCard===card)return;
      const from=products.findIndex(p=>p.id===draggedCard.dataset.id),to=products.findIndex(p=>p.id===card.dataset.id);
      if(from<0||to<0)return;const [moved]=products.splice(from,1);products.splice(to,0,moved);reorderChanged=true;saveProductsLocal();renderProducts(searchInput?.value||"");
    };
  }

  exportButton?.addEventListener("click",()=>{
    if(!confirm(`Експортувати базу продуктів, КБЖВ-архів та ліки?\n\nБуде експортовано ${products.length} продуктів, ${archiveItems.length} записів КБЖВ-архіву, ${medicines.length} ліків/добавок і ${medicineArchive.length} записів архіву ліків.`)){showButtonState(exportButton,"Не експортовано","error",1800);logAction("Експорт бази та архіву скасовано.");return;}
    const version=getExportVersion();
    const data={version,exported_at:new Date().toISOString(),products:products.map((p,i)=>normalizeProduct(p,i)),archive:archiveItems,medicines,medicine_archive:medicineArchive,medicine_buy:medicineBuy};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download=`version-${version}.json`;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
    showButtonState(exportButton,"Експортовано","success",1800);logAction(`Експортовано version-${version}: ${products.length} продуктів, ${archiveItems.length} записів КБЖВ-архіву, ${medicines.length} ліків/добавок і ${medicineArchive.length} записів архіву ліків.`);
  });
  let importDialogOpened=false;
  importButton?.addEventListener("click",()=>{importDialogOpened=true;importFile?.click();});
  window.addEventListener("focus",()=>{
    if(!importDialogOpened)return;
    setTimeout(()=>{
      if(importFile && (!importFile.files || importFile.files.length===0)){showButtonState(importButton,"Не імпортовано","error",1500);logAction("Імпорт бази скасовано.");}
      importDialogOpened=false;
    },200);
  });
  importFile?.addEventListener("change",async()=>{
    const file=importFile.files?.[0];if(!file)return;
    try{
      const parsed=JSON.parse(await file.text());const arr=Array.isArray(parsed)?parsed:parsed.products;
      if(!Array.isArray(arr))throw new Error("Невірний формат");
      const normalized=arr.map((p,i)=>normalizeProduct(p,i)).filter(p=>p.name);
      if(!normalized.length)throw new Error("Порожня база");
      const hasArchive=!Array.isArray(parsed)&&Array.isArray(parsed.archive);
      const importedArchive=hasArchive?parsed.archive:[];
      const hasMedicines=!Array.isArray(parsed)&&Array.isArray(parsed.medicines);
      const hasMedicineArchive=!Array.isArray(parsed)&&Array.isArray(parsed.medicine_archive);
      const importedMedicines=hasMedicines?parsed.medicines:[];
      const importedMedicineArchive=hasMedicineArchive?parsed.medicine_archive:[];
      const hasMedicineBuy=!Array.isArray(parsed)&&Array.isArray(parsed.medicine_buy);
      const importedMedicineBuy=hasMedicineBuy?parsed.medicine_buy:[];
      const archiveText=hasArchive?` і ${importedArchive.length} записів архіву`:"";
      const medicineText=hasMedicines?`, ${importedMedicines.length} ліків/добавок і ${importedMedicineArchive.length} записів архіву ліків`:"";
      if(!confirm(`Імпортувати ${normalized.length} продуктів${archiveText}${medicineText}?\n\nПоточні імпортовані дані будуть замінені.`)){showButtonState(importButton,"Не імпортовано","error",1500);logAction("Імпорт бази скасовано.");return;}
      products=normalized;
      if(hasArchive)archiveItems=importedArchive;
      if(hasMedicines)medicines=importedMedicines;
      if(hasMedicineArchive)medicineArchive=importedMedicineArchive;
      if(hasMedicineBuy)medicineBuy=importedMedicineBuy;
      saveProductsLocal();if(hasArchive)saveArchiveLocal();if(hasMedicines)saveMedicinesLocal();if(hasMedicineArchive)saveMedicineArchiveLocal();if(hasMedicineBuy)saveMedicineBuyLocal();
      if(!Array.isArray(parsed)&&Number.isFinite(Number(parsed.version))){localStorage.setItem(EXPORT_VERSION_KEY,String(Math.max(1,Number(parsed.version))));localStorage.setItem(EXPORT_FINGERPRINT_KEY,exportFingerprint());}
      renderProducts(searchInput?.value||"");renderArchive();renderStatistics();renderMedicines();updateSiteDataCounts();
      showButtonState(importButton,"Імпортовано","success",1500);logAction(`Імпортовано ${products.length} продуктів${hasArchive?` і ${archiveItems.length} записів КБЖВ-архіву`:"; КБЖВ-архів не змінювався"}${hasMedicines?`, ${medicines.length} ліків/добавок і ${medicineArchive.length} записів архіву ліків`:"; ліки не змінювалися"}.`);
    }catch(e){console.error(e);showButtonState(importButton,"Не імпортовано","error",1500);logAction("Помилка імпорту бази.");alert("Не вдалося імпортувати базу.\n\nПеревірте JSON-файл.");}
    finally{importFile.value="";importDialogOpened=false;}
  });

  function parseCalculatorLine(line){
    const clean=String(line).trim().replace(/\s+/g," ");if(!clean)return null;
    const re=/^(.+?),\s*для\s*([\d.,]+)\s*(?:грам|г|мл)\s*-\s*([\d.,]+)\s*ккал\s*\/\s*([\d.,]+)\s*білка\s*\/\s*([\d.,]+)\s*жирів\s*\/\s*([\d.,]+)\s*вуглеводів(?:\s*\/\s*([\d.,]+)\s*цукрів)?(?:\s*\/\s*([\d.,]+)\s*солі)?(?:\s*\/\s*([\d.,]+)\s*клітковини)?/i;
    const m=clean.match(re);
    if(m)return{id:createId("calc"),name:m[1].trim(),weight:number(m[2].replace(",",".")),kcal:number(m[3].replace(",",".")),protein:number(m[4].replace(",",".")),fat:number(m[5].replace(",",".")),carb:number(m[6].replace(",",".")),sugar:number((m[7]||"0").replace(",",".")),salt:number((m[8]||"0").replace(",",".")),fiber:number((m[9]||"0").replace(",",".")),text:clean,created_at:new Date().toISOString()};
    const km=clean.match(/^[+]?\s*([\d.,]+)\s*(?:ккал|калор(?:і|и|ій|ія|ійність)?)\s*$/i);
    if(km)return{id:createId("calc"),name:clean,weight:0,kcal:number(km[1].replace(",",".")),protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0,text:clean,created_at:new Date().toISOString()};
    return{id:createId("calc"),name:clean,weight:0,kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0,text:clean,created_at:new Date().toISOString()};
  }
  calcInput?.addEventListener("input",saveCalculatorDraft);
  calcAdd?.addEventListener("click",()=>{
    const text=calcInput.value.trim();if(!text){showButtonState(calcAdd,"Немає даних","error",1500);logAction("Додавання в калькулятор не виконано: поле порожнє.");return;}
    const items=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(parseCalculatorLine).filter(Boolean);
    calculatorItems.push(...items);saveCalculatorLocal();renderCalculatorLog();updateTotals();calcInput.value="";localStorage.removeItem(CALCULATOR_DRAFT_KEY);showButtonState(calcAdd,"Додано","success",1500); logAction(`У калькулятор додано записів: ${items.length}.`);
  });
  calcSection?.addEventListener("click",()=>{calculatorItems.push({text:"/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/",kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0});saveCalculatorLocal();renderCalculatorLog();showButtonState(calcSection,"Додано","success",1500);logAction("У калькулятор додано розділ.");});
  calcClearText?.addEventListener("click",()=>{if(!calcInput.value.trim()){showButtonState(calcClearText,"Немає даних","error",1500);logAction("Очищення тексту не виконано: поле вже порожнє.");return;}calcInput.value="";localStorage.removeItem(CALCULATOR_DRAFT_KEY);showButtonState(calcClearText,"Очищено","success",1500);logAction("Поле введення калькулятора очищено.");});
  calcClearBlocks?.addEventListener("click",()=>{if(!calculatorItems.length){showButtonState(calcClearBlocks,"Немає даних","error",1500);logAction("Очищення історії калькулятора не виконано: історія порожня.");return;}if(!confirm("Очистити всю історію калькулятора?")){showButtonState(calcClearBlocks,"Не очищено","error",1500);logAction("Очищення історії калькулятора скасовано.");return;}calculatorItems=[];saveCalculatorLocal();renderCalculatorLog();updateTotals();showButtonState(calcClearBlocks,"Очищено","success",1500);logAction("Історію калькулятора очищено.");});
  function updateTotals(){
    const t=calculatorItems.reduce((a,i)=>{for(const k of ["kcal","protein","fat","carb","sugar","salt","fiber"])a[k]+=number(i[k]);return a;},{kcal:0,protein:0,fat:0,carb:0,sugar:0,salt:0,fiber:0});
    kcalElement.textContent=formatNumber(t.kcal);proteinElement.textContent=formatNumber(t.protein);fatElement.textContent=formatNumber(t.fat);carbElement.textContent=formatNumber(t.carb);sugarElement.textContent=formatNumber(t.sugar);saltElement.textContent=formatNumber(t.salt);fiberElement.textContent=formatNumber(t.fiber);
  }
  function renderCalculatorLog(){
    calcLog.innerHTML="";
    calcLog.classList.toggle("calc-history-reorder-mode",calculatorReorderMode);
    if(!calculatorItems.length){calcLog.innerHTML='<div style="padding:10px 0;">Історія порожня.</div>';return;}
    calculatorItems.forEach((item,index)=>{
      const row=document.createElement("div");row.className="log-item calc-log-item";row.dataset.index=String(index);
      const text=document.createElement("span");text.className="calc-log-text";text.textContent=item.text||item.name||"";
      const remove=document.createElement("button");remove.className="remove";remove.textContent="Видалити";remove.onclick=()=>{const removed=calculatorItems[index];calculatorItems.splice(index,1);saveCalculatorLocal();renderCalculatorLog();updateTotals();logAction(`З калькулятора видалено: ${removed?.text||removed?.name||"запис"}.`);};
      const move=document.createElement("div");move.className="calc-history-move";
      const up=document.createElement("button");up.className="calc-move-button";up.textContent="↑";up.title="Перемістити вище";up.disabled=index===0;
      const down=document.createElement("button");down.className="calc-move-button";down.textContent="↓";down.title="Перемістити нижче";down.disabled=index===calculatorItems.length-1;
      up.onclick=()=>{if(index<=0)return;[calculatorItems[index-1],calculatorItems[index]]=[calculatorItems[index],calculatorItems[index-1]];calculatorReorderChanged=true;renderCalculatorLog();};
      down.onclick=()=>{if(index>=calculatorItems.length-1)return;[calculatorItems[index],calculatorItems[index+1]]=[calculatorItems[index+1],calculatorItems[index]];calculatorReorderChanged=true;renderCalculatorLog();};
      move.append(up,down);
      const actions=document.createElement("div");actions.className="calc-log-actions";actions.append(remove,move);
      row.append(text,actions);calcLog.append(row);
    });
  }
  reorderCalculatorHistory?.addEventListener("click",()=>{
    if(!calculatorItems.length){showButtonState(reorderCalculatorHistory,"Немає історії","error",1600);logAction("Зміну розташування історії не розпочато: історія порожня.");return;}
    if(!calculatorReorderMode){
      calculatorReorderMode=true;calculatorReorderChanged=false;
      setButtonStatusPermanent(reorderCalculatorHistory,"Готово","info");
      renderCalculatorLog();
      logAction("Розпочато зміну розташування історії калькулятора.");
      return;
    }
    calculatorReorderMode=false;
    if(calculatorReorderChanged){
      saveCalculatorLocal();updateTotals();renderCalculatorLog();
      showButtonState(reorderCalculatorHistory,"Розташування змінено","success",1800);
      logAction("Розташування історії калькулятора змінено.");
    }else{
      renderCalculatorLog();
      showButtonState(reorderCalculatorHistory,"Розташування не змінено","error",1800);
      logAction("Зміну розташування історії калькулятора завершено без змін.");
    }
  });
  function getTotalSummary(){return `Денний підсумок: ${kcalElement.textContent} калорій / ${proteinElement.textContent} білка / ${fatElement.textContent} жирів / ${carbElement.textContent} вуглеводів / ${sugarElement.textContent} цукрів / ${saltElement.textContent} солі / ${fiberElement.textContent} клітковини`;}
  copyTotal?.addEventListener("click",async()=>{if(await copyText(getTotalSummary()))showButtonState(copyTotal,"Скопійовано","success",1500);logAction("Денний підсумок скопійовано.");});
  function getCurrentDate(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;}
  saveArchive?.addEventListener("click",()=>{if(!calculatorItems.length){showButtonState(saveArchive,"Немає даних","error",1500);logAction("Збереження в архів не виконано: калькулятор порожній.");return alert("Немає даних для збереження в архів.");}archiveItems.unshift({id:createId("archive"),date:getCurrentDate(),text:getTotalSummary(),kcal:number(kcalElement.textContent),protein:number(proteinElement.textContent),fat:number(fatElement.textContent),carb:number(carbElement.textContent),sugar:number(sugarElement.textContent),salt:number(saltElement.textContent),fiber:number(fiberElement.textContent),created_at:new Date().toISOString()});saveArchiveLocal();renderArchive();renderStatistics();showButtonState(saveArchive,"Збережено","success",1500);logAction("Денний підсумок збережено в архів.");});
  function formatArchiveDate(v){const m=String(v||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}.${m[2]}.${m[1]}`:v;}
  function renderArchive(){
    updateSiteDataCounts();
    archiveLog.innerHTML="";if(!archiveItems.length){archiveLog.innerHTML='<div style="padding:10px 0;">Архів порожній.</div>';return;}
    archiveItems.forEach(item=>{
      const row=document.createElement("div");row.className="log-item archive-item";
      const content=document.createElement("div");content.className="archive-content";
      const date=document.createElement("div");date.style.fontWeight="600";date.style.color="var(--text-main)";date.textContent=formatArchiveDate(item.date);
      const text=document.createElement("div");text.textContent=item.text;content.append(date,text);
      const actions=document.createElement("div");actions.className="archive-actions";
      const ed=document.createElement("button");ed.className="edit-date";ed.textContent="Дата";
      const et=document.createElement("button");et.className="edit-text";et.textContent="Текст";
      const rm=document.createElement("button");rm.className="remove";rm.textContent="Видалити";
      ed.onclick=()=>editArchiveDate(item,date);et.onclick=()=>openArchiveTextModal(item);rm.onclick=()=>{if(confirm("Видалити цей запис з архіву?")){archiveItems=archiveItems.filter(a=>a.id!==item.id);saveArchiveLocal();renderArchive();renderStatistics();logAction("Запис видалено з архіву.");}else{showButtonState(rm,"Не видалено","error",1500);logAction("Видалення запису з архіву скасовано.");}};
      actions.append(ed,et,rm);row.append(content,actions);archiveLog.append(row);
    });
  }
  function editArchiveDate(item,dateElement){
    if(dateElement.querySelector("input"))return;const original=item.date||"";const input=document.createElement("input");input.type="date";input.className="archive-date-input";input.value=original||getCurrentDate();dateElement.textContent="";dateElement.append(input);input.focus();
    let done=false;const finish=()=>{if(done)return;done=true;if(input.value&&input.value!==original){item.date=input.value;saveArchiveLocal();logAction(`Дата запису архіву змінена з ${original} на ${input.value}.`);renderStatistics();}else{logAction("Зміну дати архіву завершено без змін.");}renderArchive();};input.addEventListener("change",finish,{once:true});input.addEventListener("blur",finish,{once:true});
  }
  function openArchiveTextModal(item){archiveEditingId=item.id;archiveOriginalText=item.text||"";archiveTextInput.value=item.text||"";archiveTextModal.classList.add("active");setTimeout(()=>archiveTextInput.focus(),50);}
  function closeArchiveTextModal(){archiveEditingId=null;archiveOriginalText=null;archiveTextModal.classList.remove("active");}
  archiveTextCancel?.addEventListener("click",()=>{closeArchiveTextModal();showButtonState(archiveTextCancel,"Скасовано","error",1500);logAction("Редагування тексту архіву скасовано.");});
  archiveTextModal?.addEventListener("click",e=>{if(e.target===archiveTextModal)closeArchiveTextModal();});
  archiveTextSave?.addEventListener("click",()=>{const item=archiveItems.find(a=>a.id===archiveEditingId);if(!item)return closeArchiveTextModal();const text=archiveTextInput.value.trim();if(!text)return archiveTextInput.focus();if(text!==archiveOriginalText){item.text=text;saveArchiveLocal();renderArchive();showButtonState(archiveTextSave,"Збережено","success",1500);logAction("Текст запису архіву змінено.");}else{showButtonState(archiveTextSave,"Не змінено","error",1500);logAction("Текст запису архіву залишено без змін.");}closeArchiveTextModal();});

  function parseArchiveMetrics(item){
    const result={kcal:number(item.kcal),protein:number(item.protein),fat:number(item.fat),carb:number(item.carb),sugar:number(item.sugar),salt:number(item.salt),fiber:number(item.fiber)};
    if(Object.values(result).some(v=>v!==0))return result;
    const t=String(item.text||"");
    const patterns={kcal:/([\d.,]+)\s*(?:калорій|ккал)/i,protein:/([\d.,]+)\s*білка/i,fat:/([\d.,]+)\s*жирів/i,carb:/([\d.,]+)\s*вуглеводів/i,sugar:/([\d.,]+)\s*цукрів/i,salt:/([\d.,]+)\s*солі/i,fiber:/([\d.,]+)\s*клітковини/i};
    for(const [k,re] of Object.entries(patterns)){const m=t.match(re);if(m)result[k]=number(m[1].replace(",","."));}
    return result;
  }
  function setupStatisticsDates(){
    const dates=archiveItems.map(i=>i.date).filter(Boolean).sort();
    if(!dates.length)return;
    if(!statsFrom.value)statsFrom.value=dates[0];
    if(!statsTo.value)statsTo.value=dates[dates.length-1];
  }
  function statsMetricLabel(){
    return ({kcal:"Калорії",protein:"Білки",fat:"Жири",carb:"Вуглеводи",sugar:"Цукри",salt:"Сіль",fiber:"Клітковина"})[statsMetric]||statsMetric;
  }
  function formatStatsDate(iso){const [y,m,d]=String(iso).split("-");return `${d}.${m}.${y}`;}
  function renderStatistics(){
    if(!statsChart)return;
    const archivePage=document.getElementById("archive");
    if(!archivePage?.classList.contains("active"))return;
    setupStatisticsDates();
    const from=statsFrom.value||"0000-01-01",to=statsTo.value||"9999-12-31";
    const points=archiveItems.filter(i=>i.date>=from&&i.date<=to).map(i=>({date:i.date,value:parseArchiveMetrics(i)[statsMetric]})).sort((a,b)=>a.date.localeCompare(b.date));
    const ctx=statsChart.getContext("2d"),rect=statsChart.getBoundingClientRect(),dpr=window.devicePixelRatio||1,w=Math.max(300,rect.width),h=Math.max(260,rect.height);
    statsChart.width=w*dpr;statsChart.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    statsRenderedPoints=[];statsChartGeometry=null;if(statsTooltip)statsTooltip.classList.remove("active");
    if(points.length<3){statsEmpty.style.display="flex";return;}statsEmpty.style.display="none";
    const vals=points.map(p=>p.value),rawMin=Math.min(...vals),rawMax=Math.max(...vals),rawRange=rawMax-rawMin||Math.max(Math.abs(rawMax)*.1,1),margin=rawRange*.12;
    const min=Math.max(0,rawMin-margin),max=rawMax+margin,range=max-min||1;
    const pad={l:58,r:18,t:18,b:48},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
    const css=getComputedStyle(document.documentElement),primary=css.getPropertyValue("--primary-color").trim(),secondary=css.getPropertyValue("--text-secondary").trim(),gridColor=css.getPropertyValue("--bg-card").trim(),bodyStyle=getComputedStyle(document.body);
    ctx.font=`11px ${bodyStyle.fontFamily}`;ctx.lineWidth=1;ctx.strokeStyle=gridColor;ctx.fillStyle=secondary;
    const yTicks=6;
    for(let i=0;i<=yTicks;i++){const y=pad.t+ch*i/yTicks;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.textAlign="right";ctx.fillText(formatNumber(max-range*i/yTicks),pad.l-7,y+4);}
    const coords=points.map((p,i)=>({x:pad.l+(points.length===1?cw/2:cw*i/(points.length-1)),y:pad.t+ch*(max-p.value)/range,...p}));
    const xStep=Math.max(1,Math.ceil(points.length/(w<520?4:7)));
    coords.forEach((p,i)=>{if(i%xStep===0||i===coords.length-1){ctx.strokeStyle=gridColor;ctx.beginPath();ctx.moveTo(p.x,pad.t);ctx.lineTo(p.x,h-pad.b);ctx.stroke();ctx.fillStyle=secondary;ctx.textAlign="center";ctx.fillText(p.date.slice(8,10)+"."+p.date.slice(5,7),p.x,h-18);}});
    ctx.strokeStyle=primary;ctx.lineWidth=2;ctx.beginPath();coords.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
    ctx.fillStyle="#ef4444";coords.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,4.5,0,Math.PI*2);ctx.fill();});
    statsRenderedPoints=coords;statsChartGeometry={w,h,pad};
  }
  function inspectStatisticsPoint(clientX,clientY){
    if(!statsRenderedPoints.length||!statsTooltip)return;
    const rect=statsChart.getBoundingClientRect(),x=clientX-rect.left,y=clientY-rect.top;
    let nearest=statsRenderedPoints[0],dist=Infinity;
    statsRenderedPoints.forEach(p=>{const d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;nearest=p;}});
    const ctx=statsChart.getContext("2d"),g=statsChartGeometry;if(!g)return;
    renderStatistics();
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle="rgba(220,221,222,.65)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(nearest.x,g.pad.t);ctx.lineTo(nearest.x,g.h-g.pad.b);ctx.moveTo(g.pad.l,nearest.y);ctx.lineTo(g.w-g.pad.r,nearest.y);ctx.stroke();ctx.restore();
    ctx.fillStyle="#ef4444";ctx.beginPath();ctx.arc(nearest.x,nearest.y,6.5,0,Math.PI*2);ctx.fill();
    statsTooltip.innerHTML=`<strong>${formatNumber(nearest.value)} ${statsMetric==="kcal"?"калорій":"г"}</strong><span>${formatStatsDate(nearest.date)} · ${statsMetricLabel()}</span>`;
    const wrap=statsChart.parentElement,tw=statsTooltip.offsetWidth||160,th=statsTooltip.offsetHeight||54;
    statsTooltip.style.left=`${Math.max(8,Math.min(wrap.clientWidth-tw-8,nearest.x+14))}px`;
    statsTooltip.style.top=`${Math.max(8,Math.min(wrap.clientHeight-th-8,nearest.y-th-10))}px`;statsTooltip.classList.add("active");
  }
  statsChart?.addEventListener("mousemove",e=>inspectStatisticsPoint(e.clientX,e.clientY));
  function medicineTodayRecord(){ return medicineArchive.find(r=>r.date===getCurrentDate()); }
  function closeMedicineModal(modal){modal?.classList.remove("active");modal?.setAttribute("aria-hidden","true");document.body.classList.remove("edit-modal-open");}
  function openMedicineForm(modal){modal?.classList.add("active");modal?.setAttribute("aria-hidden","false");document.body.classList.add("edit-modal-open");setTimeout(()=>modal?.querySelector("input")?.focus(),50);}
  function closeMedicineSelectModal(){closeMedicineModal(medicineSelectModal);}
  function medicineDetail(m){return [m.name,m.dose,m.full_name].filter(Boolean).join(" · ");}
  function openMedicineSelectModal(){
    if(!medicines.length){showButtonState(medicineOpenToday,"Немає ліків","error",1500);logAction("Вибір ліків не відкрито: база ліків порожня.");return;}
    const today=medicineTodayRecord(),taken=new Set(Array.isArray(today?.taken_ids)?today.taken_ids:[]);medicineSelectList.innerHTML="";
    medicines.forEach(m=>{const row=document.createElement("div");row.className="medicine-row medicine-select-row";const label=document.createElement("label");label.className="medicine-check";const check=document.createElement("input");check.type="checkbox";check.checked=taken.has(m.id);check.dataset.id=m.id;const text=document.createElement("span");text.innerHTML=`<strong>${escapeHtml(m.name)}</strong>${m.dose?`<small>${escapeHtml(m.dose)}</small>`:""}`;label.append(check,text);row.append(label);medicineSelectList.append(row);});
    openMedicineForm(medicineSelectModal);
  }
  function renderMedicineCard(m,container,kind){const row=document.createElement("div");row.className="medicine-row medicine-base-item";const info=document.createElement("div");info.className="medicine-info";info.innerHTML=`<strong>${escapeHtml(m.name)}</strong>${m.dose?`<span>Дозування: ${escapeHtml(m.dose)}</span>`:""}${m.full_name?`<small>${escapeHtml(m.full_name)}</small>`:""}`;const remove=document.createElement("button");remove.type="button";remove.className="medicine-remove";remove.textContent="Видалити";remove.onclick=()=>{const label=kind==="buy"?"зі списку покупок":"з бази ліків";if(!confirm(`Видалити «${m.name}» ${label}?`)){showButtonState(remove,"Не видалено","error",1300);logAction(`Видалення «${m.name}» скасовано.`);return;}if(kind==="buy"){medicineBuy=medicineBuy.filter(x=>x.id!==m.id);saveMedicineBuyLocal();}else{medicines=medicines.filter(x=>x.id!==m.id);saveMedicinesLocal();}renderMedicines();logAction(`Видалено «${m.name}» ${label}.`);};row.append(info,remove);container.append(row);}
  function renderMedicines(){
    if(!medicineBaseList||!medicineHistory)return;const today=medicineTodayRecord();medicineBaseList.innerHTML="";medicineBuyList.innerHTML="";
    if(!medicines.length)medicineBaseList.innerHTML='<div class="medicine-empty">База ліків порожня.</div>';else medicines.forEach(m=>renderMedicineCard(m,medicineBaseList,"base"));
    if(!medicineBuy.length)medicineBuyList.innerHTML='<div class="medicine-empty">Список покупок порожній.</div>';else medicineBuy.forEach(m=>renderMedicineCard(m,medicineBuyList,"buy"));
    if(!medicines.length)medicineTodaySummary.textContent="Спочатку додайте ліки до своєї бази.";else if(!today)medicineTodaySummary.textContent="За сьогодні ліки ще не записані.";else{const names=today.taken_names||[];medicineTodaySummary.textContent=names.length?`Сьогодні записано: ${names.join(", ")}.`:"За сьогодні жодні ліки не відмічені як прийняті.";}
    medicineHistory.innerHTML="";if(!medicineArchive.length){medicineHistory.innerHTML='<div class="medicine-empty">Архів ліків порожній.</div>';return;}
    [...medicineArchive].sort((a,b)=>String(b.date).localeCompare(String(a.date))).forEach(r=>{const all=r.all_names||[],taken=r.taken_names||[],missed=all.filter(n=>!taken.includes(n));let status="Ліки зовсім не записані.";if(all.length&&taken.length===all.length)status="Всі ліки записано.";else if(taken.length)status=`Записані: ${taken.join(", ")}. Не записані: ${missed.join(", ")||"—"}.`;const row=document.createElement("div");row.className="medicine-history-item";const content=document.createElement("div");const date=document.createElement("strong");date.textContent=formatArchiveDate(r.date);const text=document.createElement("div");text.textContent=status;content.append(date,text);const actions=document.createElement("div");actions.className="archive-actions medicine-history-actions";const dateBtn=document.createElement("button");dateBtn.textContent="Дата";const del=document.createElement("button");del.className="remove";del.textContent="Видалити";dateBtn.onclick=()=>editMedicineDate(r,date);del.onclick=()=>{if(!confirm("Видалити цей запис з архіву ліків?")){showButtonState(del,"Не видалено","error",1300);logAction("Видалення запису архіву ліків скасовано.");return;}medicineArchive=medicineArchive.filter(x=>x!==r);saveMedicineArchiveLocal();renderMedicines();logAction("Запис видалено з архіву ліків.");};actions.append(dateBtn,del);row.append(content,actions);medicineHistory.append(row);});
  }
  function editMedicineDate(item,dateElement){if(dateElement.querySelector("input"))return;const original=item.date||"";const input=document.createElement("input");input.type="date";input.className="archive-date-input";input.value=original||getCurrentDate();dateElement.textContent="";dateElement.append(input);input.focus();let done=false;const finish=()=>{if(done)return;done=true;if(input.value&&input.value!==original){item.date=input.value;saveMedicineArchiveLocal();logAction(`Дата запису архіву ліків змінена з ${original} на ${input.value}.`);}else logAction("Зміну дати архіву ліків завершено без змін.");renderMedicines();};input.addEventListener("change",finish,{once:true});input.addEventListener("blur",finish,{once:true});}
  medicineOpenAdd?.addEventListener("click",()=>openMedicineForm(medicineAddModal));
  medicineAddCancel?.addEventListener("click",()=>{closeMedicineModal(medicineAddModal);showButtonState(medicineAddCancel,"Скасовано","error",1200);});
  medicineAddSave?.addEventListener("click",()=>{const name=medicineFormName.value.trim(),dose=medicineFormDose.value.trim(),full_name=medicineFormFull.value.trim();if(!name||!dose||!full_name){showButtonState(medicineAddSave,"Заповніть поля","error",1500);return;}if(medicines.some(m=>m.name.toLowerCase()===name.toLowerCase())){showButtonState(medicineAddSave,"Вже є","error",1400);return;}medicines.push({id:createId("medicine"),name,dose,full_name,created_at:new Date().toISOString()});saveMedicinesLocal();[medicineFormName,medicineFormDose,medicineFormFull].forEach(x=>x.value="");closeMedicineModal(medicineAddModal);renderMedicines();showButtonState(medicineOpenAdd,"Додано","success",1400);logAction(`Додано ліки «${name}».`);});
  medicineOpenBuyAdd?.addEventListener("click",()=>openMedicineForm(medicineBuyModal));medicineBuyCancel?.addEventListener("click",()=>{closeMedicineModal(medicineBuyModal);showButtonState(medicineBuyCancel,"Скасовано","error",1200);});
  medicineBuySave?.addEventListener("click",()=>{const name=medicineBuyName.value.trim(),dose=medicineBuyDose.value.trim(),full_name=medicineBuyFull.value.trim();if(!name||!dose||!full_name){showButtonState(medicineBuySave,"Заповніть поля","error",1500);return;}medicineBuy.push({id:createId("buy"),name,dose,full_name,created_at:new Date().toISOString()});saveMedicineBuyLocal();[medicineBuyName,medicineBuyDose,medicineBuyFull].forEach(x=>x.value="");closeMedicineModal(medicineBuyModal);renderMedicines();showButtonState(medicineOpenBuyAdd,"Додано","success",1400);logAction(`До списку покупок додано «${name}».`);});
  medicineClearAll?.addEventListener("click",()=>{if(!medicines.length){showButtonState(medicineClearAll,"База порожня","error",1300);return;}if(!confirm("Ви справді бажаєте очистити всю базу даних ліків?")){showButtonState(medicineClearAll,"Скасовано","error",1400);logAction("Очищення бази ліків скасовано.");return;}medicines=[];saveMedicinesLocal();renderMedicines();showButtonState(medicineClearAll,"Очищено","success",1400);logAction("Базу ліків повністю очищено.");});
  medicineOpenToday?.addEventListener("click",openMedicineSelectModal);medicineSelectCancel?.addEventListener("click",()=>{closeMedicineSelectModal();showButtonState(medicineSelectCancel,"Скасовано","error",1200);});medicineSelectModal?.addEventListener("click",e=>{if(e.target===medicineSelectModal)closeMedicineSelectModal();});
  medicineSaveDay?.addEventListener("click",()=>{if(!medicines.length)return;const checked=[...medicineSelectList.querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.dataset.id),allNames=medicines.map(m=>m.name),takenNames=medicines.filter(m=>checked.includes(m.id)).map(m=>m.name),rec={date:getCurrentDate(),taken_ids:checked,all_names:allNames,taken_names:takenNames,updated_at:new Date().toISOString()};const i=medicineArchive.findIndex(r=>r.date===rec.date);if(i>=0)medicineArchive[i]=rec;else medicineArchive.unshift(rec);saveMedicineArchiveLocal();closeMedicineSelectModal();renderMedicines();showButtonState(medicineOpenToday,"Додано","success",1500);logAction("Ліки за сьогодні записано в архів.");});

  statsChart?.addEventListener("mouseleave",()=>{statsTooltip?.classList.remove("active");renderStatistics();});
  statsChart?.addEventListener("click",e=>inspectStatisticsPoint(e.clientX,e.clientY));
  statsChart?.addEventListener("touchstart",e=>{const t=e.touches[0];if(t)inspectStatisticsPoint(t.clientX,t.clientY);},{passive:true});
  statsMetricButtons.forEach(button=>button.addEventListener("click",()=>{statsMetric=button.dataset.metric;statsMetricButtons.forEach(b=>b.classList.toggle("active",b===button));renderStatistics();showButtonState(button,button.dataset.originalText||button.textContent,"success",800);logAction(`Статистику перемкнено на показник «${button.dataset.originalText||button.textContent}».`);}));
  [statsFrom,statsTo].forEach(input=>input?.addEventListener("change",()=>{if(statsFrom.value&&statsTo.value){const days=Math.round((new Date(statsTo.value)-new Date(statsFrom.value))/86400000);if(days<3){showButtonState(input===statsFrom?statsMetricButtons[0]:statsMetricButtons[0],"Мінімум 3 дні","error",1200);logAction("Період статистики не змінено: мінімальний період 3 дні.");return;}}renderStatistics();logAction(`Період статистики змінено: ${statsFrom.value||"початок"} — ${statsTo.value||"кінець"}.`);}));
  window.addEventListener("resize",()=>{if(document.getElementById("archive")?.classList.contains("active"))renderStatistics();});

  leaveSiteButton?.addEventListener("click",()=>{
    const ok=confirm("Ви справді хочете покинути та очистити весь сайт?\n\nБудуть видалені всі КБЖВ-блоки, калькулятор, архів, статистика, консоль та локальні налаштування цієї програми.");
    if(!ok){showButtonState(leaveSiteButton,"Скасовано","error",1600);logAction("Очищення сайту скасовано.");return;}
    const keys=[PRODUCTS_KEY,CALCULATOR_KEY,ARCHIVE_KEY,ACTIVE_TAB_KEY,CALCULATOR_DRAFT_KEY,SORT_KEY,CONSOLE_KEY,EXPORT_VERSION_KEY,DATABASE_UPDATED_KEY,EXPORT_FINGERPRINT_KEY,MEDICINES_KEY,MEDICINE_ARCHIVE_KEY,MEDICINE_BUY_KEY];
    keys.forEach(k=>localStorage.removeItem(k));
    showButtonState(leaveSiteButton,"Очищено","success",700);
    setTimeout(()=>location.reload(),750);
  });

  document.addEventListener("keydown",e=>{
    if(e.key!=="Escape")return;
    [productModal,addProductModal,editProductModal,sortProductsModal,deleteProductModal,archiveTextModal].forEach(m=>m?.classList.remove("active"));
    selectedProduct=null;editingProduct=null;archiveEditingId=null;document.body.classList.remove("edit-modal-open");
  });
  productWeight?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();productCopy.click();}});
  [newProductName,newProductKcal,newProductProtein,newProductFat,newProductCarb,newProductSugar,newProductSalt,newProductFiber].forEach(i=>i?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addProductSave.click();}}));
  [editProductName,editProductKcal,editProductProtein,editProductFat,editProductCarb,editProductSugar,editProductSalt,editProductFiber].forEach(i=>i?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();editProductSave.click();}}));

  products=loadArray(PRODUCTS_KEY).map((p,i)=>normalizeProduct(p,i));
  calculatorItems=loadArray(CALCULATOR_KEY).map(i=>({...i,sugar:number(i.sugar),salt:number(i.salt),fiber:number(i.fiber)}));
  archiveItems=loadArray(ARCHIVE_KEY);
  consoleItems=loadArray(CONSOLE_KEY);
  medicines=loadArray(MEDICINES_KEY).filter(m=>m&&m.id&&m.name);
  medicineArchive=loadArray(MEDICINE_ARCHIVE_KEY);
  medicineBuy=loadArray(MEDICINE_BUY_KEY);
  const draft=localStorage.getItem(CALCULATOR_DRAFT_KEY);if(draft!==null)calcInput.value=draft;
  renderProducts();renderCalculatorLog();updateTotals();renderArchive();renderMedicines();renderConsole();renderStatistics();updateSiteDataCounts();setInterval(updateSiteDataCounts,60000);

  const saved=localStorage.getItem(ACTIVE_TAB_KEY)||"blocks";
  tabs.forEach(t=>t.classList.toggle("active",t.dataset.tab===saved));
  pages.forEach(p=>p.classList.toggle("active",p.id===saved));
  if(saved==="archive")requestAnimationFrame(()=>renderStatistics());
});
