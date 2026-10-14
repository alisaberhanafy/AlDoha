// تهيئة وتوصيل Firebase Firestore السحابية بنجاح وبدون أخطاء
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

// الكتالوج الافتراضي
let catalogItems = JSON.parse(localStorage.getItem('ali_catalog_items')) || [
    { name: "انفرتر طاقة شمسية 50 حصان", price: 45000, defaultQty: 1, category: "الانفرترات", parentItem: "", isAutoSub: false },
    { name: "لوح طاقة شمسية 550 واط", price: 3200, defaultQty: 10, category: "الألواح الشمسية", parentItem: "", isAutoSub: false },
    { name: "كابلات طاقة شمسية 6 مم", price: 85, defaultQty: 50, category: "الكابلات والأسلاك", parentItem: "انفرتر طاقة شمسية 50 حصان", isAutoSub: true }
];

let catalogCategories = JSON.parse(localStorage.getItem('ali_catalog_categories')) || ["الانفرترات", "الألواح الشمسية", "الكابلات والأسلاك", "الهياكل المعدنية"];
let clientsList = JSON.parse(localStorage.getItem('ali_clients_list')) || [{ name: "شركة الضحى للطاقة", phone: "01000000000", address: "القاهرة" }];
let packagesList = JSON.parse(localStorage.getItem('ali_packages_list')) || [];
let activeSections = [];

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initDatePicker();
    renderCategoriesOptions();
    renderSections();
    calculateGrandTotal();
    setupDropdownListeners();
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

function renderSections() {
    const container = document.getElementById('sections-container');
    if (!container) return;
    if (activeSections.length === 0) {
        container.innerHTML = `<div class="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-500 text-xs">لا يوجد جداول مضافة حالياً. اختر قسماً أو باقة من الأعلى لإدراج جدول جديدة بالفاتورة.</div>`;
        return;
    }

    container.innerHTML = activeSections.map((sec, secIdx) => `
        <div class="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3">
            <div class="flex justify-between items-center border-b pb-2">
                <h4 class="font-bold text-sm text-indigo-950">${sec.title}</h4>
                <button onclick="removeSection(${secIdx})" class="text-rose-500 hover:text-rose-700 text-xs font-bold">🗑️ حذف الجدول</button>
            </div>
            
            <!-- جدول الكمبيوتر -->
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
                                <td class="p-2 border border-slate-200 text-center font-bold text-emerald-700">${(it.qty * it.price).toLocaleString()} جنية</td>
                                <td class="p-2 border border-slate-200 text-center no-print">
                                    <button onclick="removeItemFromSection(${secIdx},${itemIdx})" class="text-rose-500 font-bold">✕</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- بطاقات الموبايل -->
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
                        <div class="text-left font-bold text-xs text-emerald-700 pt-1">الإجمالي: ${(it.qty * it.price).toLocaleString()} جنية</div>
                    </div>
                `).join('')}
            </div>

            <button onclick="addItemToSectionPrompt(${secIdx})" class="w-full bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 text-slate-700 py-2 rounded-xl text-xs font-bold no-print">+ إضافة صنف للجدول</button>
        </div>
    `).join('');
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
    const price = parseFloat(prompt("أدخل السعر:", "0")) || 0;
    const qty = parseFloat(prompt("أدخل الكمية:", "1")) || 1;
    activeSections[secIdx].items.push({ name: itemName, price: price, qty: qty });
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

// دالة الحفظ السحابي
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

    // حفظ محلي
    localStorage.setItem(`client_${clientName}`, JSON.stringify(currentData));

    // حفظ سحابي في Firestore
    if (db) {
        try {
            await db.collection("clients").doc(clientName).set(currentData, { merge: true });
            alert("تم حفظ بيانات العميل والسحابة بنجاح! يمكن فتح البيانات الآن من أي متصفح أو جهاز إلكتروني.");
        } catch (err) {
            console.error("Firestore Save Error:", err);
            alert("تم الحفظ محلياً فقط وتعذر الاتصال بالسحابة حالياً.");
        }
    } else {
        alert("تم الحفظ محلياً بنجاح!");
    }
}

// فتح وإغلاق النوافذ
function openAddClientModal() { document.getElementById('client-modal')?.classList.remove('hidden'); }
function closeAddClientModal() { document.getElementById('client-modal')?.classList.add('hidden'); }
function openCatalogModal() { document.getElementById('catalog-modal')?.classList.remove('hidden'); }
function closeCatalogModal() { document.getElementById('catalog-modal')?.classList.add('hidden'); }
function openCreatePackageModal() { document.getElementById('create-package-modal')?.classList.remove('hidden'); }
function closeCreatePackageModal() { document.getElementById('create-package-modal')?.classList.add('hidden'); }

function createNewClientAndSwitch() {
    const name = document.getElementById('new-client-name')?.value.trim();
    if (!name) return;
    clientsList.push({ name: name, phone: document.getElementById('new-client-phone')?.value, address: document.getElementById('new-client-address')?.value });
    localStorage.setItem('ali_clients_list', JSON.stringify(clientsList));
    document.getElementById('client-search-input').value = name;
    closeAddClientModal();
    activeSections = [];
    renderSections();
    calculateGrandTotal();
}

function addNewSectionPrompt() {
    const secName = prompt("أدخل اسم القسم الرئيسي الجديد:");
    if (!secName) return;
    catalogCategories.push(secName);
    localStorage.setItem('ali_catalog_categories', JSON.stringify(catalogCategories));
    renderCategoriesOptions();
}

function setupDropdownListeners() {}