// ==========================================
// 1️⃣ تهيئة وتوصيل Firebase Firestore السحابية
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCfTIA-9DwNBlhBIdfQCX4JMIW9aGyzRb4",
  authDomain: "ali-saber-system.firebaseapp.com",
  projectId: "ali-saber-system",
  storageBucket: "ali-saber-system.firebasestorage.app",
  messagingSenderId: "439316222877",
  appId: "1:439316222877:web:8263f19d8e62c4721d5574"
};

let db = null;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase Connected Successfully!");
    }
} catch (e) {
    console.error("Firebase Initialization Error: ", e);
}

// ==========================================
// 2️⃣ البيانات الأساسية وقواعد البيانات المحلية (مع الدمج التلقائي من الكتالوج الخارجي)
// ==========================================
if (typeof window.SYSTEM_CATALOG_DATA !== 'undefined') {
    // تحديث البيانات المحلية تلقائياً من الكتالوج الخارجي لضمان ظهور كافة الأصناف والباقات الشاملة
    if (window.SYSTEM_CATALOG_DATA.items) {
        localStorage.setItem('ali_catalog_items', JSON.stringify(window.SYSTEM_CATALOG_DATA.items));
    }
    if (window.SYSTEM_CATALOG_DATA.sections) {
        localStorage.setItem('ali_catalog_categories', JSON.stringify(window.SYSTEM_CATALOG_DATA.sections));
    }
    if (window.SYSTEM_CATALOG_DATA.packages) {
        localStorage.setItem('ali_packages_list', JSON.stringify(window.SYSTEM_CATALOG_DATA.packages));
    }
}

let catalogItems = JSON.parse(localStorage.getItem('ali_catalog_items')) || [
    { name: "انفرتر طاقة شمسية 50 حصان", price: 45000, defaultQty: 1, category: "الانفرترات", parentItem: "", isAutoSub: false },
    { name: "لوح طاقة شمسية 550 واط", price: 3200, defaultQty: 10, category: "الألواح الشمسية", parentItem: "", isAutoSub: false },
    { name: "كابلات طاقة شمسية 6 مم", price: 85, defaultQty: 50, category: "الكابلات والأسلاك", parentItem: "انفرتر طاقة شمسية 50 حصان", isAutoSub: true }
];

let catalogCategories = JSON.parse(localStorage.getItem('ali_catalog_categories')) || ["الانفرترات", "الألواح الشمسية", "الكابلات والأسلاك", "الهياكل المعدنية"];
let clientsList = JSON.parse(localStorage.getItem('ali_clients_list')) || [{ name: "شركة الضحى للطاقة", phone: "01000000000", address: "القاهرة" }];
let packagesList = JSON.parse(localStorage.getItem('ali_packages_list')) || [
    {
        title: "باقة كمبيوتر كامل",
        badge: "باقة مجهزة",
        items: [
            { name: "شاشة كمبيوتر 24 بوصة", price: 3500, qty: 1 },
            { name: "كيسة كمبيوتر Core i5", price: 8500, qty: 1 }
        ]
    }
];

let activeSections = [];
let currentPackageBuilderItems = [];

// ==========================================
// 3️⃣ عند تحميل الصفحة
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initDatePicker();
    renderCategoriesOptions();
    renderSections();
    calculateGrandTotal();
    setupDropdownListeners();
    loadClientsFromCloud();
    injectManagementButtonsUI();
});

function initDatePicker() {
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#quote-date", {
            dateFormat: "d/m/Y",
            defaultDate: "today",
            locale: "ar"
        });
    }
}

function renderCategoriesOptions() {
    const catSelect = document.getElementById('new-item-category');
    if (!catSelect) return;
    catSelect.innerHTML = catalogCategories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function injectManagementButtonsUI() {
    const pkgParent = document.getElementById('package-picker-input')?.parentElement;
    if (pkgParent && !document.getElementById('manage-pkgs-btn')) {
        const btn = document.createElement('button');
        btn.id = 'manage-pkgs-btn';
        btn.innerHTML = '⚙️';
        btn.className = 'bg-indigo-700 hover:bg-indigo-800 text-white px-2.5 py-2 rounded-lg text-xs font-bold transition shrink-0';
        btn.title = 'إدارة وتعديل وحذف الباقات والأصناف';
        btn.onclick = openManagePackagesModal;
        pkgParent.appendChild(btn);
    }
}

// ==========================================
// 4️⃣ رسم وتحديث الجداول والفواتير
// ==========================================
function renderSections() {
    const container = document.getElementById('sections-container');
    if (!container) return;

    if (activeSections.length === 0) {
        container.innerHTML = `<div class="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-500 text-xs">لا يوجد جداول مضافة حالياً. اختر قسماً أو باقة من الأعلى لإدراج جدول جديد بالفاتورة.</div>`;
        return;
    }

    container.innerHTML = activeSections.map((sec, secIdx) => `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3">
            <div class="flex justify-between items-center border-b pb-2">
                <div class="flex items-center gap-2">
                    <input type="text" value="${sec.title}" onchange="updateSectionTitle(${secIdx}, this.value)" class="font-bold text-sm text-indigo-950 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg outline-none w-48 sm:w-64" title="تعديل اسم الجدول">
                </div>
                <button onclick="removeSection(${secIdx})" class="text-rose-500 hover:text-rose-700 text-xs font-bold">🗑️ حذف الجدول</button>
            </div>
            
            <div class="desktop-table-view overflow-x-auto">
                <table class="w-full text-right border-collapse text-xs">
                    <thead>
                        <tr class="bg-slate-100 text-slate-700">
                            <th class="p-2 border border-slate-200">م</th>
                            <th class="p-2 border border-slate-200">الصنف / البيان</th>
                            <th class="p-2 border border-slate-200 text-center w-20">الكمية</th>
                            <th class="p-2 border border-slate-200 text-center w-28">السعر</th>
                            <th class="p-2 border border-slate-200 text-center w-28">الإجمالي</th>
                            <th class="p-2 border border-slate-200 text-center w-12 no-print">حذف</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sec.items.map((it, itemIdx) => `
                            <tr>
                                <td class="p-2 border border-slate-200 text-center font-bold">${itemIdx + 1}</td>
                                <td class="p-2 border border-slate-200">
                                    <input type="text" value="${it.name}" onchange="updateItemDetails(${secIdx},${itemIdx}, 'name', this.value)" class="w-full bg-transparent outline-none">
                                </td>
                                <td class="p-2 border border-slate-200 text-center">
                                    <input type="number" value="${it.qty}" onchange="updateItemDetails(${secIdx},${itemIdx}, 'qty', this.value)" class="w-full text-center bg-transparent outline-none">
                                </td>
                                <td class="p-2 border border-slate-200 text-center">
                                    <input type="number" value="${it.price}" onchange="updateItemDetails(${secIdx},${itemIdx}, 'price', this.value)" class="w-full text-center bg-transparent outline-none">
                                </td>
                                <td class="p-2 border border-slate-200 text-center font-bold text-emerald-700">${((it.qty || 0) * (it.price || 0)).toLocaleString()} جنية</td>
                                <td class="p-2 border border-slate-200 text-center no-print">
                                    <button onclick="removeItemFromSection(${secIdx},${itemIdx})" class="text-rose-500 font-bold">✕</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="mobile-card-view space-y-2">
                ${sec.items.map((it, itemIdx) => `
                    <div class="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-indigo-900">بند #${itemIdx + 1}</span>
                            <button onclick="removeItemFromSection(${secIdx},${itemIdx})" class="text-rose-500 text-xs font-bold">حذف</button>
                        </div>
                        <input type="text" value="${it.name}" onchange="updateItemDetails(${secIdx},${itemIdx}, 'name', this.value)" placeholder="اسم الصنف..." class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs">
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="text-[10px] text-slate-500">الكمية:</label>
                                <input type="number" value="${it.qty}" onchange="updateItemDetails(${secIdx},${itemIdx}, 'qty', this.value)" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-center">
                            </div>
                            <div>
                                <label class="text-[10px] text-slate-500">السعر:</label>
                                <input type="number" value="${it.price}" onchange="updateItemDetails(${secIdx},${itemIdx}, 'price', this.value)" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-center">
                            </div>
                        </div>
                        <div class="text-left font-bold text-xs text-emerald-700 pt-1">الإجمالي: ${((it.qty || 0) * (it.price || 0)).toLocaleString()} جنية</div>
                    </div>
                `).join('')}
            </div>

            <button onclick="addItemToSectionPrompt(${secIdx})" class="w-full bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 text-slate-700 py-2 rounded-xl text-xs font-bold no-print">+ إضافة صنف للجدول</button>
        </div>
    `).join('');
}

function updateSectionTitle(secIdx, val) {
    activeSections[secIdx].title = val;
}

function updateItemDetails(secIdx, itemIdx, field, val) {
    if (field === 'qty' || field === 'price') {
        activeSections[secIdx].items[itemIdx][field] = parseFloat(val) || 0;
    } else {
        activeSections[secIdx].items[itemIdx][field] = val;
    }
    renderSections();
    calculateGrandTotal();
}

function removeItemFromSection(secIdx, itemIdx) {
    activeSections[secIdx].items.splice(itemIdx, 1);
    renderSections();
    calculateGrandTotal();
}

function removeSection(secIdx) {
    activeSections.splice(secIdx, 1);
    renderSections();
    calculateGrandTotal();
}

function addSelectedSectionTableToCurrentClient() {
    const input = document.getElementById('section-picker-input');
    const val = input ? input.value.trim() : "";
    if (!val) {
        alert("يرجى كتابة أو اختيار اسم القسم أولاً!");
        return;
    }
    activeSections.push({ title: val, items: [] });
    if (input) input.value = "";
    renderSections();
}

function addItemToSectionPrompt(secIdx) {
    const itemName = prompt("أدخل اسم الصنف:");
    if (!itemName) return;
    
    const matchedCatalogItem = catalogItems.find(i => i.name.toLowerCase() === itemName.trim().toLowerCase());
    let price = matchedCatalogItem ? matchedCatalogItem.price : parseFloat(prompt("أدخل السعر:", "0")) || 0;
    let qty = matchedCatalogItem ? parseFloat(matchedCatalogItem.defaultQty) || 1 : parseFloat(prompt("أدخل الكمية:", "1")) || 1;

    activeSections[secIdx].items.push({ name: itemName, price: price, qty: qty });

    const autoSubs = catalogItems.filter(i => (i.parentItem && i.parentItem.toLowerCase() === itemName.trim().toLowerCase()) || (i.subItemFor && i.subItemFor.toLowerCase() === itemName.trim().toLowerCase()));
    autoSubs.forEach(sub => {
        activeSections[secIdx].items.push({ name: sub.name, price: sub.price, qty: parseFloat(sub.qty || sub.defaultQty) || 1 });
    });

    renderSections();
    calculateGrandTotal();
}

function calculateGrandTotal() {
    let total = 0;
    activeSections.forEach(sec => {
        sec.items.forEach(it => {
            total += (it.qty || 0) * (it.price || 0);
        });
    });

    const totalEl = document.getElementById('grand-total');
    if (totalEl) totalEl.innerText = `${total.toLocaleString()} جنية`;

    const arWords = document.getElementById('grand-total-words-ar');
    const enWords = document.getElementById('grand-total-words-en');
    if (arWords) arWords.value = total > 0 ? `مبلغ وقدره ${total.toLocaleString()} جنيه مصري فقط لا غير` : "";
    if (enWords) enWords.value = total > 0 ? `Egyptian Pounds Only ${total.toLocaleString()}` : "";
}

// ==========================================
// 5️⃣ إدارة وتعديل وحذف الباقات المجمعة عبر البحث الذكي ✨
// ==========================================
function openCreatePackageModal() {
    currentPackageBuilderItems = [];
    document.getElementById('pkg-title-input').value = "";
    document.getElementById('pkg-badge-input').value = "باقة مجهزة";
    document.getElementById('pkg-item-search-input').value = "";
    renderPackageBuilderItemsList();
    document.getElementById('create-package-modal')?.classList.remove('hidden');
}

function closeCreatePackageModal() {
    document.getElementById('create-package-modal')?.classList.add('hidden');
}

function addItemToPackageBuilder() {
    const input = document.getElementById('pkg-item-search-input');
    const val = input ? input.value.trim() : "";
    if (!val) {
        alert("يرجى اختيار أو كتابة صنف أولاً!");
        return;
    }

    const matched = catalogItems.find(i => i.name.toLowerCase() === val.toLowerCase());
    const itemToAdd = {
        name: val,
        price: matched ? matched.price : 0,
        qty: matched ? parseFloat(matched.qty || matched.defaultQty) || 1 : 1
    };

    currentPackageBuilderItems.push(itemToAdd);
    if (input) input.value = "";
    renderPackageBuilderItemsList();
}

function renderPackageBuilderItemsList() {
    const listContainer = document.getElementById('pkg-items-list');
    if (!listContainer) return;

    if (currentPackageBuilderItems.length === 0) {
        listContainer.innerHTML = `<div class="text-center text-slate-400 text-xs py-3">لم يتم إضافة أصناف للباقة حتى الآن.</div>`;
        return;
    }

    listContainer.innerHTML = currentPackageBuilderItems.map((it, idx) => `
        <div class="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs">
            <span class="font-bold text-slate-800">${it.name}</span>
            <div class="flex items-center gap-2">
                <span class="text-emerald-700 font-bold">${it.price} ج</span>
                <span class="text-slate-500">x${it.qty}</span>
                <button onclick="removePackageBuilderItem(${idx})" class="text-rose-500 font-bold text-sm mr-1">✕</button>
            </div>
        </div>
    `).join('');
}

function removePackageBuilderItem(idx) {
    currentPackageBuilderItems.splice(idx, 1);
    renderPackageBuilderItemsList();
}

function saveNewCreatedPackage() {
    const title = document.getElementById('pkg-title-input')?.value.trim();
    const badge = document.getElementById('pkg-badge-input')?.value.trim() || "باقة مجهزة";

    if (!title) {
        alert("يرجى كتابة اسم الباقة أولاً!");
        return;
    }
    if (currentPackageBuilderItems.length === 0) {
        alert("يرجى إضافة صنف واحد على الأقل داخل الباقة!");
        return;
    }

    const newPkg = { title, badge, items: [...currentPackageBuilderItems] };
    packagesList.push(newPkg);
    localStorage.setItem('ali_packages_list', JSON.stringify(packagesList));

    closeCreatePackageModal();
    alert(`تم حفظ الباقة (${title}) بالسيستم بنجاح!`);
}

function addSelectedPackageTableToCurrentClient() {
    const input = document.getElementById('package-picker-input');
    const val = input ? input.value.trim() : "";
    if (!val) {
        alert("يرجى اختيار باقة مجمعة لإدراجها!");
        return;
    }

    const pkg = packagesList.find(p => p.title.toLowerCase() === val.toLowerCase());
    if (pkg) {
        activeSections.push({
            title: pkg.title,
            items: pkg.items.map(i => ({ name: i.name, price: i.price, qty: i.qty }))
        });
        if (input) input.value = "";
        renderSections();
        calculateGrandTotal();
    } else {
        alert("لم يتم العثور على الباقة المحددة!");
    }
}

function openManagePackagesModal() {
    let modal = document.getElementById('manage-pkgs-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'manage-pkgs-modal';
        modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 no-print';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
                <div class="bg-indigo-950 text-white p-4 flex justify-between items-center shrink-0">
                    <h3 class="font-bold text-sm">🛠️ تعديل وحذف الباقات والأصناف المجمعة</h3>
                    <button onclick="document.getElementById('manage-pkgs-modal').classList.add('hidden')" class="text-rose-400 font-bold text-lg">✕</button>
                </div>
                <div class="p-3 bg-slate-100 border-b shrink-0">
                    <input type="text" id="manage-pkg-search-input" placeholder="ابحث باسم الباقة لتعديلها أو حذفها..." oninput="filterManagePackagesList(this.value)" class="w-full bg-white border border-slate-300 font-bold text-xs">
                </div>
                <div class="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50" id="manage-pkgs-list"></div>
                <div class="bg-slate-100 p-3 border-t text-left shrink-0">
                    <button onclick="saveAllPackagesChanges()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition">حفظ التغييرات والإغلاق</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('manage-pkg-search-input').value = "";
    renderManagePackagesCards(packagesList);
    modal.classList.remove('hidden');
}

function filterManagePackagesList(query) {
    const q = query.trim().toLowerCase();
    const filtered = packagesList.filter(p => p.title.toLowerCase().includes(q) || p.badge.toLowerCase().includes(q));
    renderManagePackagesCards(filtered);
}

function renderManagePackagesCards(pkgsToRender) {
    const list = document.getElementById('manage-pkgs-list');
    if (!list) return;

    if (pkgsToRender.length === 0) {
        list.innerHTML = `<div class="text-center text-slate-400 text-xs py-4">لا توجد باقات مطابقة لعملية البحث.</div>`;
        return;
    }

    list.innerHTML = pkgsToRender.map((pkg) => {
        const pkgIdx = packagesList.findIndex(p => p.title === pkg.title);
        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2.5">
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <input type="text" value="${pkg.title}" onchange="updatePkgTitle(${pkgIdx}, this.value)" class="font-bold text-xs text-indigo-950 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 w-full sm:w-56 outline-none">
                        <input type="text" value="${pkg.badge}" onchange="updatePkgBadge(${pkgIdx}, this.value)" class="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-2 w-24 outline-none">
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button onclick="addNewSubItemToPackagePrompt(${pkgIdx})" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition">+ إضافة صنف</button>
                        <button onclick="deletePackageItem(${pkgIdx})" class="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-lg text-xs font-bold transition">حذف الباقة</button>
                    </div>
                </div>

                <div class="space-y-2 pt-1">
                    <span class="text-[11px] font-bold text-slate-600 block">الأصناف التابعة لهذه الباقة:</span>
                    ${pkg.items.map((it, itemIdx) => `
                        <div class="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                            <input type="text" value="${it.name}" onchange="updatePkgSubItem(${pkgIdx},${itemIdx}, 'name', this.value)" class="col-span-5 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs outline-none">
                            <input type="number" value="${it.price}" onchange="updatePkgSubItem(${pkgIdx},${itemIdx}, 'price', this.value)" class="col-span-3 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-center outline-none" title="السعر">
                            <input type="number" value="${it.qty}" onchange="updatePkgSubItem(${pkgIdx},${itemIdx}, 'qty', this.value)" class="col-span-2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-center outline-none" title="الكمية">
                            <button onclick="deletePkgSubItem(${pkgIdx},${itemIdx})" class="col-span-2 text-rose-500 font-bold text-center">حذف</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function updatePkgTitle(pkgIdx, val) { packagesList[pkgIdx].title = val; }
function updatePkgBadge(pkgIdx, val) { packagesList[pkgIdx].badge = val; }

function updatePkgSubItem(pkgIdx, itemIdx, field, val) {
    if (field === 'price' || field === 'qty') {
        packagesList[pkgIdx].items[itemIdx][field] = parseFloat(val) || 0;
    } else {
        packagesList[pkgIdx].items[itemIdx][field] = val;
    }
}

function deletePkgSubItem(pkgIdx, itemIdx) {
    packagesList[pkgIdx].items.splice(itemIdx, 1);
    renderManagePackagesCards(packagesList);
}

function addNewSubItemToPackagePrompt(pkgIdx) {
    const name = prompt("أدخل اسم الصنف الجديد:");
    if (!name) return;
    const price = parseFloat(prompt("أدخل السعر:", "0")) || 0;
    const qty = parseFloat(prompt("أدخل الكمية:", "1")) || 1;

    packagesList[pkgIdx].items.push({ name, price, qty });
    renderManagePackagesCards(packagesList);
}

function deletePackageItem(pkgIdx) {
    if (confirm("هل أنت متأكد من حذف هذه الباقة بالكامل؟")) {
        packagesList.splice(pkgIdx, 1);
        renderManagePackagesCards(packagesList);
    }
}

function saveAllPackagesChanges() {
    localStorage.setItem('ali_packages_list', JSON.stringify(packagesList));
    document.getElementById('manage-pkgs-modal')?.classList.add('hidden');
    alert("تم حفظ جميع تعديلات الباقات والأصناف بنجاح!");
}

// ==========================================
// 6️⃣ الكتالوج الثابت والملحقات
// ==========================================
function openCatalogModal() {
    renderCatalogModalTable();
    document.getElementById('catalog-modal')?.classList.remove('hidden');
}

function closeCatalogModal() {
    document.getElementById('catalog-modal')?.classList.add('hidden');
}

function renderCatalogModalTable() {
    const desktopTbody = document.getElementById('catalog-modal-tbody-desktop');
    const mobileList = document.getElementById('catalog-modal-mobile-list');
    
    if (desktopTbody) {
        desktopTbody.innerHTML = catalogItems.map((item, idx) => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-2"><input type="text" value="${item.name}" onchange="updateCatalogItem(${idx}, 'name', this.value)" class="w-full bg-transparent outline-none"></td>
                <td class="p-2 text-center"><input type="number" value="${item.price}" onchange="updateCatalogItem(${idx}, 'price', this.value)" class="w-20 text-center bg-slate-50 border rounded p-1"></td>
                <td class="p-2 text-center"><input type="text" value="${item.defaultQty || item.qty || 1}" onchange="updateCatalogItem(${idx}, 'defaultQty', this.value)" class="w-16 text-center bg-slate-50 border rounded p-1"></td>
                <td class="p-2 text-center"><input type="text" value="${item.category}" onchange="updateCatalogItem(${idx}, 'category', this.value)" class="w-24 text-center bg-slate-50 border rounded p-1"></td>
                <td class="p-2 text-center"><input type="text" value="${item.parentItem || item.subItemFor || ''}" onchange="updateCatalogItem(${idx}, 'parentItem', this.value)" class="w-28 text-center bg-slate-50 border rounded p-1"></td>
                <td class="p-2 text-center"><input type="checkbox" ${item.isAutoSub || item.autoAdd ? 'checked' : ''} onchange="updateCatalogItem(${idx}, 'isAutoSub', this.checked)"></td>
                <td class="p-2 text-center"><button onclick="deleteCatalogItem(${idx})" class="text-rose-500 font-bold">🗑️</button></td>
            </tr>
        `).join('');
    }
}

function updateCatalogItem(idx, field, val) {
    if (field === 'price') catalogItems[idx][field] = parseFloat(val) || 0;
    else catalogItems[idx][field] = val;
    localStorage.setItem('ali_catalog_items', JSON.stringify(catalogItems));
}

function deleteCatalogItem(idx) {
    catalogItems.splice(idx, 1);
    localStorage.setItem('ali_catalog_items', JSON.stringify(catalogItems));
    renderCatalogModalTable();
}

function saveCatalogModalChanges() {
    localStorage.setItem('ali_catalog_items', JSON.stringify(catalogItems));
    closeCatalogModal();
    alert("تم حفظ تحديثات الكتالوج بنجاح!");
}

function addNewItemToCatalog() {
    const name = document.getElementById('new-item-name')?.value.trim();
    const price = parseFloat(document.getElementById('new-item-price')?.value) || 0;
    const qty = document.getElementById('new-item-qty')?.value || "1";
    const category = document.getElementById('new-item-category')?.value || "عام";
    const parentItem = document.getElementById('new-item-sub-input')?.value.trim() || "";
    const isAutoSub = document.getElementById('new-item-auto-checkbox')?.checked || false;

    if (!name) {
        alert("يرجى إدخال اسم الصنف الجديد!");
        return;
    }

    catalogItems.push({ name, price, defaultQty: qty, category, parentItem, isAutoSub });
    localStorage.setItem('ali_catalog_items', JSON.stringify(catalogItems));

    document.getElementById('new-item-name').value = "";
    document.getElementById('new-item-price').value = "";
    document.getElementById('new-item-sub-input').value = "";
    if (document.getElementById('new-item-auto-checkbox')) document.getElementById('new-item-auto-checkbox').checked = false;

    alert(`تم إضافة الصنف (${name}) إلى الكتالوج الثابت بنجاح!`);
}

// ==========================================
// 7️⃣ البحث الفوري وإدارة وتعديل وحذف العملاء عبر البحث
// ==========================================
function setupDropdownListeners() {
    const clientInput = document.getElementById('client-search-input');
    const sectionInput = document.getElementById('section-picker-input');
    const pkgPickerInput = document.getElementById('package-picker-input');
    const pkgItemSearchInput = document.getElementById('pkg-item-search-input');
    const dropdown = document.getElementById('custom-dropdown-suggestions');

    if (clientInput && dropdown) {
        clientInput.addEventListener('input', () => {
            const query = clientInput.value.trim().toLowerCase();
            const matches = clientsList.filter(c => c.name.toLowerCase().includes(query));
            
            if (matches.length > 0) {
                dropdown.innerHTML = matches.map((m, idx) => `
                    <div class="p-2.5 hover:bg-slate-50 cursor-pointer text-xs border-b last:border-0 flex items-center justify-between gap-2">
                        <span class="flex-1 font-bold text-slate-800" onclick="selectClient('${m.name}')">
                            👤 ${m.name} <span class="text-slate-400 font-normal">(${m.phone || 'بدون هاتف'})</span>
                        </span>
                        <div class="flex items-center gap-1 shrink-0">
                            <button onclick="event.stopPropagation(); promptEditClientByName('${m.name}')" class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded text-[11px] font-bold">✏️ تعديل</button>
                            <button onclick="event.stopPropagation(); deleteClientByName('${m.name}')" class="bg-rose-50 text-rose-600 hover:bg-rose-100 px-2 py-1 rounded text-[11px] font-bold">🗑️ حذف</button>
                        </div>
                    </div>
                `).join('');
                showDropdownUnderElement(clientInput, dropdown);
            } else { 
                dropdown.innerHTML = `<div class="p-3 text-xs text-slate-400 text-center">لا توجد نتائج مطابقة. اضغط (+) للإضافة.</div>`;
                showDropdownUnderElement(clientInput, dropdown);
            }
        });

        clientInput.addEventListener('focus', () => {
            clientInput.dispatchEvent(new Event('input'));
        });
    }

    if (sectionInput && dropdown) {
        sectionInput.addEventListener('input', () => {
            const query = sectionInput.value.trim().toLowerCase();
            const matches = catalogCategories.filter(c => c.toLowerCase().includes(query));
            if (matches.length > 0) {
                dropdown.innerHTML = matches.map(m => `<div class="p-2.5 hover:bg-slate-100 cursor-pointer text-xs border-b last:border-0" onclick="selectSection('${m}')">${m}</div>`).join('');
                showDropdownUnderElement(sectionInput, dropdown);
            } else { dropdown.classList.add('hidden'); }
        });
    }

    if (pkgPickerInput && dropdown) {
        pkgPickerInput.addEventListener('input', () => {
            const query = pkgPickerInput.value.trim().toLowerCase();
            const matches = packagesList.filter(p => p.title.toLowerCase().includes(query));
            if (matches.length > 0) {
                dropdown.innerHTML = matches.map(m => `<div class="p-2.5 hover:bg-slate-100 cursor-pointer text-xs border-b last:border-0 flex justify-between" onclick="selectPackage('${m.title}')"><span>${m.title}</span><span class="text-indigo-600 font-bold">${m.badge}</span></div>`).join('');
                showDropdownUnderElement(pkgPickerInput, dropdown);
            } else { dropdown.classList.add('hidden'); }
        });
    }

    if (pkgItemSearchInput && dropdown) {
        pkgItemSearchInput.addEventListener('input', () => {
            const query = pkgItemSearchInput.value.trim().toLowerCase();
            const matches = catalogItems.filter(i => i.name.toLowerCase().includes(query));
            if (matches.length > 0) {
                dropdown.innerHTML = matches.map(m => `<div class="p-2.5 hover:bg-slate-100 cursor-pointer text-xs border-b last:border-0 flex justify-between" onclick="selectPkgItemBuilder('${m.name}')"><span>${m.name}</span><span class="text-emerald-600 font-bold">${m.price} ج</span></div>`).join('');
                showDropdownUnderElement(pkgItemSearchInput, dropdown);
            } else { dropdown.classList.add('hidden'); }
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#custom-dropdown-suggestions') && !e.target.closest('#client-search-input') && !e.target.closest('#section-picker-input') && !e.target.closest('#package-picker-input') && !e.target.closest('#pkg-item-search-input')) {
            if (dropdown) dropdown.classList.add('hidden');
        }
    });
}

function showDropdownUnderElement(el, dropdown) {
    const rect = el.getBoundingClientRect();
    dropdown.style.top = `${window.scrollY + rect.bottom + 4}px`;
    dropdown.style.left = `${window.scrollX + rect.left}px`;
    dropdown.style.width = `${rect.width}px`;
    dropdown.classList.remove('hidden');
}

function selectClient(name) {
    const clientInput = document.getElementById('client-search-input');
    if (clientInput) clientInput.value = name;
    document.getElementById('custom-dropdown-suggestions')?.classList.add('hidden');
    loadClientDataFromCloudOrLocal(name);
}

function selectSection(name) {
    const sectionInput = document.getElementById('section-picker-input');
    if (sectionInput) sectionInput.value = name;
    document.getElementById('custom-dropdown-suggestions')?.classList.add('hidden');
}

function selectPackage(title) {
    const input = document.getElementById('package-picker-input');
    if (input) input.value = title;
    document.getElementById('custom-dropdown-suggestions')?.classList.add('hidden');
}

function selectPkgItemBuilder(itemName) {
    const input = document.getElementById('pkg-item-search-input');
    if (input) input.value = itemName;
    document.getElementById('custom-dropdown-suggestions')?.classList.add('hidden');
}

function promptEditClientByName(clientName) {
    const client = clientsList.find(c => c.name === clientName);
    if (!client) return;

    const newName = prompt("تعديل اسم العميل / الشركة:", client.name);
    if (newName === null) return;
    const newPhone = prompt("تعديل رقم الهاتف:", client.phone || "");
    if (newPhone === null) return;

    client.name = newName.trim();
    client.phone = newPhone.trim();
    localStorage.setItem('ali_clients_list', JSON.stringify(clientsList));
    
    document.getElementById('custom-dropdown-suggestions')?.classList.add('hidden');
    alert("تم تحديث بيانات العميل بنجاح!");
    document.getElementById('client-search-input').value = client.name;
}

function deleteClientByName(clientName) {
    if (confirm(`هل أنت متأكد من حذف العميل (${clientName}) نهائياً؟`)) {
        clientsList = clientsList.filter(c => c.name !== clientName);
        localStorage.setItem('ali_clients_list', JSON.stringify(clientsList));
        
        if (db) {
            db.collection("clients").doc(clientName).delete().catch(err => console.log(err));
        }

        document.getElementById('custom-dropdown-suggestions')?.classList.add('hidden');
        document.getElementById('client-search-input').value = "";
        alert("تم حذف العميل بنجاح!");
    }
}

// ==========================================
// 8️⃣ إدارة العملاء والسحابة (Cloud Sync)
// ==========================================
function openAddClientModal() { document.getElementById('client-modal')?.classList.remove('hidden'); }
function closeAddClientModal() { document.getElementById('client-modal')?.classList.add('hidden'); }

async function createNewClientAndSwitch() {
    const name = document.getElementById('new-client-name')?.value.trim();
    if (!name) {
        alert("يرجى إدخال اسم العميل!");
        return;
    }
    const newClient = { 
        name: name, 
        phone: document.getElementById('new-client-phone')?.value || "", 
        address: document.getElementById('new-client-address')?.value || "" 
    };
    
    clientsList.push(newClient);
    localStorage.setItem('ali_clients_list', JSON.stringify(clientsList));

    const clientInput = document.getElementById('client-search-input');
    if (clientInput) clientInput.value = name;
    
    closeAddClientModal();
    activeSections = [];
    renderSections();
    calculateGrandTotal();

    if (db) {
        try {
            await db.collection("clients").doc(name).set({ clientName: name, phone: newClient.phone, address: newClient.address, activeSections: [] }, { merge: true });
        } catch (e) {
            console.error("Error saving new client to cloud:", e);
        }
    }
    alert(`تم إضافة العميل (${name}) بنجاح!`);
}

async function loadClientsFromCloud() {
    if (!db) return;
    try {
        const snapshot = await db.collection("clients").get();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.clientName && !clientsList.some(c => c.name === data.clientName)) {
                clientsList.push({ name: data.clientName, phone: data.phone || "", address: data.address || "" });
            }
        });
        localStorage.setItem('ali_clients_list', JSON.stringify(clientsList));
    } catch (e) {
        console.error("Error loading clients:", e);
    }
}

async function loadClientDataFromCloudOrLocal(clientName) {
    let clientData = null;
    if (db) {
        try {
            const doc = await db.collection("clients").doc(clientName).get();
            if (doc.exists) {
                clientData = doc.data();
            }
        } catch (e) {
            console.error("Error loading client data:", e);
        }
    }
    
    if (!clientData) {
        const local = localStorage.getItem(`client_${clientName}`);
        if (local) clientData = JSON.parse(local);
    }

    if (clientData) {
        if (document.getElementById('store-name-input')) document.getElementById('store-name-input').value = clientData.storeName || "";
        if (document.getElementById('quote-date')) document.getElementById('quote-date').value = clientData.quoteDate || "";
        if (document.getElementById('duration-text')) document.getElementById('duration-text').value = clientData.durationText || "";
        if (document.getElementById('payment-terms-text')) document.getElementById('payment-terms-text').value = clientData.paymentTermsText || "";
        if (document.getElementById('notes-text')) document.getElementById('notes-text').value = clientData.notesText || "";
        if (document.getElementById('manager-name')) document.getElementById('manager-name').value = clientData.managerName || "";
        activeSections = clientData.activeSections || [];
    } else {
        activeSections = [];
    }
    renderSections();
    calculateGrandTotal();
}

async function saveCurrentClientData() {
    const clientNameInput = document.getElementById('client-search-input');
    const clientName = clientNameInput ? clientNameInput.value.trim() : "";

    if (!clientName) {
        alert("يرجى تحديد أو اختيار اسم العميل أولاً للحفظ!");
        return;
    }

    const currentData = {
        storeName: document.getElementById('store-name-input')?.value || "",
        quoteDate: document.getElementById('quote-date')?.value || "",
        clientName: clientName,
        activeSections: activeSections,
        durationText: document.getElementById('duration-text')?.value || "",
        paymentTermsText: document.getElementById('payment-terms-text')?.value || "",
        notesText: document.getElementById('notes-text')?.value || "",
        managerName: document.getElementById('manager-name')?.value || "",
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`client_${clientName}`, JSON.stringify(currentData));

    if (db) {
        try {
            await db.collection("clients").doc(clientName).set(currentData, { merge: true });
            alert("تم حفظ بيانات العميل وتحديث السحابة بنجاح!");
        } catch (err) {
            console.error("Firestore Save Error:", err);
            alert("تم الحفظ محلياً بنجاح وتعذر الاتصال بالسحابة لحظياً.");
        }
    } else {
        alert("تم الحفظ محلياً بنجاح!");
    }
}

function addNewSectionPrompt() {
    const secName = prompt("أدخل اسم القسم الرئيسي الجديد:");
    if (!secName) return;
    catalogCategories.push(secName);
    localStorage.setItem('ali_catalog_categories', JSON.stringify(catalogCategories));
    renderCategoriesOptions();
    alert(`تم إضافة القسم (${secName}) بنجاح!`);
}