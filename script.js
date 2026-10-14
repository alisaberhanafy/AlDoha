const CLOUD_BIN_ID = "67246961ad19ca34f8c21a36"; 
const CLOUD_API_KEY = "$2a$10$22/502Iq2XJIs1TZJf05XGUm9DKZyBL18aPi28G";

let globalClientsDatabase = [
    {
        name: "شركة النور للطاقة",
        phone: "01000000000",
        address: "القاهرة",
        date: "14/10/2026",
        duration: "اسبوع من تاريخه",
        payment: "90% تعاقد | 10% عند التوريد",
        notes: "العرض غير شامل الأعمال المدنية.",
        manager: "م/ وليد محمدين",
        sections: [
            { id: 'solar', title: 'أولاً: محطة طاقة شمسية قدرة 39 كيلو جينكو', badge: 'الخلايا والحوامل', items: [{ name: "خلايا جينكو 650 وات", qty: "39ك", price: 520650 }] },
            { id: 'motor', title: 'ثانياً: الماتور والطلمبة والمستلزمات', badge: 'التجهيز والتشغيل', items: [{ name: "ماتور 40 حصان فانسان", qty: "1", price: 89800 }] }
        ]
    }
];

let currentActiveClientName = "";
let selectedSectionPickerId = "";

let itemsDatabase = [
    { name: "خلايا جينكو 650 وات باي فيشال ذات الوجهين عدد 60 لوح", defaultPrice: 520650, defaultQty: "39ك", category: "solar", subItemOf: "", autoAdd: false },
    { name: "حوامل خلايا حديد الشافعى سمك 3 مم على الساخن بداعمتين", defaultPrice: 0, defaultQty: "39ك", category: "solar", subItemOf: "", autoAdd: false },
    { name: "انفرتر ساج او سانشي 50 حصان", defaultPrice: 0, defaultQty: "1", category: "solar", subItemOf: "", autoAdd: false },
    { name: "برمجة وتوصيل واختبار الانفرتر مجاناً", defaultPrice: 0, defaultQty: "1", category: "solar", subItemOf: "انفرتر ساج او سانشي 50 حصان", autoAdd: true },
    { name: "ماتور 40 حصان فانسان تركي 7بوصة زهر", defaultPrice: 89800, defaultQty: "1", category: "motor", subItemOf: "", autoAdd: false },
    { name: "طلمبة فانسان تركي 30 حصان 6 مرحلة 7075/6", defaultPrice: 57400, defaultQty: "1", category: "motor", subItemOf: "", autoAdd: false }
];

let globalSectionsList = [
    { id: 'solar', title: 'أولاً: محطة طاقة شمسية قدرة 39 كيلو جينكو', badge: 'الخلايا والحوامل' },
    { id: 'motor', title: 'ثانياً: الماتور والطلمبة والمستلزمات', badge: 'التجهيز والتشغيل' }
];

async function fetchClientsFromCloud() {
    localStorage.clear();
    if (!CLOUD_BIN_ID || CLOUD_BIN_ID.includes("ضع_معرف")) {
        initSystem();
        return;
    }
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${CLOUD_BIN_ID}/latest?t=${Date.now()}`, {
            method: 'GET',
            headers: { 
                'X-Access-Key': CLOUD_API_KEY, 
                'X-Master-Key': CLOUD_API_KEY, 
                'X-Bin-Meta': 'false',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        const data = await response.json();
        if (data && data.clientsDB && Array.isArray(data.clientsDB)) {
            globalClientsDatabase = data.clientsDB;
        }
        if (data && data.sectionsList && Array.isArray(data.sectionsList) && data.sectionsList.length > 0) {
            globalSectionsList = data.sectionsList;
        }
        if (data && data.itemsDatabase && Array.isArray(data.itemsDatabase) && data.itemsDatabase.length > 0) {
            itemsDatabase = data.itemsDatabase;
        }
        initSystem();
    } catch (e) {
        initSystem();
    }
}

async function saveClientsToCloud() {
    if (!CLOUD_BIN_ID || CLOUD_BIN_ID.includes("ضع_معرف")) return;
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${CLOUD_BIN_ID}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'X-Access-Key': CLOUD_API_KEY, 
                'X-Master-Key': CLOUD_API_KEY,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ 
                clientsDB: globalClientsDatabase,
                sectionsList: globalSectionsList,
                itemsDatabase: itemsDatabase
            })
        });
    } catch (e) {}
}

function initSystem() {
    renderSecureWatermark();
    populateClientSelect();
    refreshCategorySelect();
    refreshSectionPickerSelect();
    refreshDatalist();

    if (globalClientsDatabase.length > 0 && !currentActiveClientName) {
        loadClientDataToUI(globalClientsDatabase[0].name);
    }

    if (typeof flatpickr !== "undefined") {
        flatpickr("#quote-date", { locale: "ar", dateFormat: "d/m/Y", defaultDate: new Date(), allowInput: true, disableMobile: "true" });
    }
}

// 🎯 محرك البحث القوائم المنسدلة الذكي والمحدث (يظهر كافة العناصر فور النقر أو التركيز)
function setupSelectSearch(inputElement, getOptionsFn, onSelectFn) {
    inputElement.setAttribute('autocomplete', 'off');

    const renderDropdown = (filterKeyword = '') => {
        const dropdown = document.getElementById('custom-dropdown-suggestions');
        const options = getOptionsFn();

        const filtered = filterKeyword 
            ? options.filter(opt => opt.text.toLowerCase().includes(filterKeyword.toLowerCase()))
            : options;

        if (filtered.length === 0) {
            dropdown.classList.add('hidden');
            return;
        }

        const rect = inputElement.getBoundingClientRect();
        dropdown.style.top = `${window.scrollY + rect.bottom + 4}px`;
        dropdown.style.left = `${window.scrollX + rect.left}px`;
        dropdown.style.width = `${rect.width}px`;

        dropdown.innerHTML = '';
        filtered.forEach(opt => {
            const div = document.createElement('div');
            div.className = "px-3 py-2 text-xs hover:bg-indigo-100 cursor-pointer border-b border-slate-100 font-medium text-slate-800 transition select-none bg-white";
            div.textContent = opt.text;
            div.onmousedown = (e) => {
                e.preventDefault(); 
                inputElement.value = opt.text;
                dropdown.classList.add('hidden');
                if (onSelectFn) onSelectFn(opt);
            };
            div.ontouchstart = (e) => {
                e.preventDefault();
                inputElement.value = opt.text;
                dropdown.classList.add('hidden');
                if (onSelectFn) onSelectFn(opt);
            };
            dropdown.appendChild(div);
        });

        dropdown.classList.remove('hidden');
    };

    inputElement.addEventListener('focus', function() {
        renderDropdown('');
    });

    inputElement.addEventListener('click', function(e) {
        e.stopPropagation();
        renderDropdown('');
    });

    inputElement.addEventListener('input', function() {
        renderDropdown(this.value.trim());
    });

    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('custom-dropdown-suggestions');
        if (!inputElement.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}

function populateClientSelect() {
    const input = document.getElementById('client-search-input');
    if (!input) return;

    if (currentActiveClientName) {
        const found = globalClientsDatabase.find(c => c.name === currentActiveClientName);
        if (found) input.value = `${found.name} (${found.address || 'عام'})`;
    }

    setupSelectSearch(
        input,
        () => globalClientsDatabase.map(c => ({ text: `${c.name} (${c.address || 'عام'})`, value: c.name })),
        (selectedOpt) => {
            saveCurrentClientDataState();
            loadClientDataToUI(selectedOpt.value);
        }
    );
}

function saveCurrentClientDataState() {
    if (!currentActiveClientName) return;
    const clientObj = globalClientsDatabase.find(c => c.name === currentActiveClientName);
    if (!clientObj) return;

    clientObj.date = document.getElementById('quote-date').value;
    clientObj.duration = document.getElementById('duration-text').value;
    clientObj.payment = document.getElementById('payment-terms-text').value;
    clientObj.notes = document.getElementById('notes-text').value;
    clientObj.manager = document.getElementById('manager-name').value;

    let updatedSections = [];
    const activeSectionWrappers = document.querySelectorAll('.section-wrapper');
    activeSectionWrappers.forEach(wrapper => {
        const secId = wrapper.dataset.sectionId;
        const title = wrapper.querySelector('.section-title-input').value;
        const badge = wrapper.querySelector('.section-badge-input').value;
        updatedSections.push({
            id: secId,
            title: title,
            badge: badge,
            items: getTableData(secId)
        });
    });
    clientObj.sections = updatedSections;
}

function loadClientDataToUI(clientName) {
    const clientObj = globalClientsDatabase.find(c => c.name === clientName);
    if (!clientObj) return;
    currentActiveClientName = clientName;
    
    const clientInput = document.getElementById('client-search-input');
    if (clientInput) clientInput.value = `${clientObj.name} (${clientObj.address || 'عام'})`;

    if (clientObj.date) document.getElementById('quote-date').value = clientObj.date;
    if (clientObj.duration) document.getElementById('duration-text').value = clientObj.duration;
    if (clientObj.payment) document.getElementById('payment-terms-text').value = clientObj.payment;
    if (clientObj.notes) document.getElementById('notes-text').value = clientObj.notes;
    if (clientObj.manager) document.getElementById('manager-name').value = clientObj.manager;

    const container = document.getElementById('sections-container');
    container.innerHTML = '';

    if (clientObj.sections && clientObj.sections.length > 0) {
        clientObj.sections.forEach(sec => {
            renderSectionDOM(sec.id, sec.title, sec.badge);
            if (sec.items && sec.items.length > 0) {
                sec.items.forEach(i => addRow(sec.id, i.name, i.qty, i.price));
            } else {
                addRow(sec.id, '', '1', 0);
            }
        });
    } else {
        if (globalSectionsList.length > 0) {
            renderSectionDOM(globalSectionsList[0].id, globalSectionsList[0].title, globalSectionsList[0].badge);
            addRow(globalSectionsList[0].id, '', '1', 0);
        }
    }
    calculateTotals();
}

function openAddClientModal() { document.getElementById('client-modal').classList.remove('hidden'); }
function closeAddClientModal() { document.getElementById('client-modal').classList.add('hidden'); }

function createNewClientAndSwitch() {
    const name = document.getElementById('new-client-name').value.trim();
    const phone = document.getElementById('new-client-phone').value.trim();
    const address = document.getElementById('new-client-address').value.trim();

    if (!name) { alert('برجاء كتابة اسم العميل!'); return; }
    if (globalClientsDatabase.some(c => c.name === name)) { alert('هذا العميل موجود بالفعل!'); return; }

    saveCurrentClientDataState();

    const newClient = {
        name: name,
        phone: phone,
        address: address,
        date: new Date().toLocaleDateString('en-GB'),
        duration: "اسبوع من تاريخه",
        payment: "90% تعاقد | 10% عند التوريد",
        notes: "العرض غير شامل الأعمال المدنية.",
        manager: "م/ وليد محمدين",
        sections: globalSectionsList.length > 0 ? [{ id: globalSectionsList[0].id, title: globalSectionsList[0].title, badge: globalSectionsList[0].badge, items: [{ name: '', qty: '1', price: 0 }] }] : []
    };

    globalClientsDatabase.push(newClient);
    saveClientsToCloud();
    populateClientSelect();
    loadClientDataToUI(name);

    document.getElementById('new-client-name').value = '';
    document.getElementById('new-client-phone').value = '';
    document.getElementById('new-client-address').value = '';
    closeAddClientModal();
    alert('تم إنشاء نموذج جديد ومستقل لهذا العميل بنجاح!');
}

async function saveCurrentClientData() {
    saveCurrentClientDataState();
    await saveClientsToCloud();
    alert('تم حفظ بيانات هذا العميل وتحديث السحابة بنجاح!');
}

function addNewItemToCatalog() {
    const nameInput = document.getElementById('new-item-name');
    const priceInput = document.getElementById('new-item-price');
    const qtyInput = document.getElementById('new-item-qty');
    const categoryInput = document.getElementById('new-item-category');
    const subInput = document.getElementById('new-item-sub-input');
    const autoCheckbox = document.getElementById('new-item-auto-checkbox');

    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;
    const qty = qtyInput.value.trim() || "1";
    const category = categoryInput.value;
    const subItemOf = subInput ? subInput.value.trim() : "";
    const autoAdd = autoCheckbox ? autoCheckbox.checked : false;

    if (!name) { alert('برجاء كتابة اسم الصنف أولاً'); return; }

    itemsDatabase.push({ 
        name: name, 
        defaultPrice: price, 
        defaultQty: qty, 
        category: category, 
        subItemOf: subItemOf, 
        autoAdd: autoAdd 
    });

    refreshDatalist();
    saveClientsToCloud();
    
    nameInput.value = ''; 
    priceInput.value = ''; 
    qtyInput.value = '1';
    if (subInput) subInput.value = '';
    if (autoCheckbox) autoCheckbox.checked = false;

    alert('تم حفظ الصنف في الكتالوج الثابت مع إعدادات التبعية بنجاح!');
}

function addNewSectionPrompt() {
    const title = prompt("أدخل عنوان القسم الجديد:", "ثالثاً: قسم جديد");
    if (!title) return;
    const badge = prompt("أدخل وصف القسم:", "تجهيزات");
    const newId = 'sec_' + Date.now();
    globalSectionsList.push({ id: newId, title: title, badge: badge || 'عام' });
    refreshCategorySelect();
    refreshSectionPickerSelect();
    saveClientsToCloud();
    alert('تم إنشاء القسم الرئيسي في الكتالوج بنجاح!');
}

function addSelectedSectionTableToCurrentClient() {
    if (!selectedSectionPickerId) {
        alert('برجاء اختيار قسم من القائمة أولاً!');
        return;
    }
    const secId = selectedSectionPickerId;
    const foundSec = globalSectionsList.find(s => s.id === secId);
    if (!foundSec) return;

    const existingWrapper = document.querySelector(`[data-section-id="${secId}"]`);
    if (existingWrapper) {
        alert('هذا الجدول موجود بالفعل في صفحة العميل الحالي!');
        return;
    }

    renderSectionDOM(foundSec.id, foundSec.title, foundSec.badge);
    addRow(foundSec.id, '', '1', 0);
    saveCurrentClientDataState();
    calculateTotals();
    alert('تم إضافة جدول القسم بنجاح!');
}

function refreshSectionPickerSelect() {
    const input = document.getElementById('section-picker-input');
    if (!input) return;

    setupSelectSearch(
        input,
        () => globalSectionsList.map(sec => ({ text: sec.title, value: sec.id })),
        (selectedOpt) => {
            selectedSectionPickerId = selectedOpt.value;
        }
    );
}

function renderSectionDOM(id, title, badge) {
    const container = document.getElementById('sections-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = "bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden section-wrapper";
    div.dataset.sectionId = id;
    div.innerHTML = `
        <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-3 sm:px-5 sm:py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <input type="text" value="${title}" class="section-title-input bg-transparent border border-transparent hover:border-white/30 focus:border-white rounded px-2 py-1 outline-none text-xs sm:text-base font-bold text-white w-full sm:w-[60%]">
            <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <input type="text" value="${badge}" class="section-badge-input bg-blue-800/80 text-[10px] sm:text-xs px-2.5 py-1 rounded-md text-white outline-none w-28 text-center">
                <button onclick="deleteSection('${id}')" class="text-rose-300 hover:text-rose-100 text-xs font-bold px-2.5 py-1 bg-rose-900/40 rounded no-print">حذف جدول القسم ✕</button>
            </div>
        </div>
        <div class="p-2 sm:p-5">
            <div class="hidden md:block overflow-x-auto pb-2 desktop-table-view">
                <table class="w-full text-right border-collapse">
                    <thead>
                        <tr class="bg-slate-100 text-slate-700 text-xs uppercase">
                            <th class="p-3 border-b w-12 text-center">م</th>
                            <th class="p-3 border-b">الصنف</th>
                            <th class="p-3 border-b w-24 text-center">الكمية</th>
                            <th class="p-3 border-b w-32 text-center">السعر</th>
                            <th class="p-3 border-b w-32 text-center">الإجمالي</th>
                            <th class="p-3 border-b w-14 text-center no-print">إجراء</th>
                        </tr>
                    </thead>
                    <tbody id="${id}-tbody-desktop" class="text-sm divide-y divide-slate-100"></tbody>
                </table>
            </div>
            <div class="md:hidden space-y-3 mobile-card-view" id="${id}-tbody-mobile"></div>
            <div class="flex flex-col sm:flex-row justify-between items-center mt-3 pt-3 border-t border-slate-100 gap-2.5">
                <button onclick="addRow('${id}')" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm no-print">
                    + إضافة صنف يدوياً لهذا القسم
                </button>
                <div class="text-xs sm:text-sm font-bold text-slate-700 bg-blue-50 px-3 py-2 rounded-lg border w-full sm:w-auto text-left">
                    إجمالي القسم: <span id="${id}-total" class="text-blue-900 font-black text-xs sm:text-base">0</span> جنية
                </div>
            </div>
        </div>
    `;
    container.appendChild(div);
}

function deleteSection(id) {
    if (confirm('هل أنت متأكد من حذف هذا الجدول من فاتورة العميل الحالي؟')) {
        const wrapper = document.querySelector(`[data-section-id="${id}"]`);
        if (wrapper) {
            wrapper.remove();
        }
        saveCurrentClientDataState();
        calculateTotals();
    }
}

function refreshCategorySelect() {
    const select = document.getElementById('new-item-category');
    if (!select) return;
    select.innerHTML = '';
    globalSectionsList.forEach(sec => {
        const opt = document.createElement('option');
        opt.value = sec.id;
        opt.textContent = sec.title.substring(0, 30);
        select.appendChild(opt);
    });
}

function refreshDatalist() {
    const subInput = document.getElementById('new-item-sub-input');
    if (subInput) {
        setupSelectSearch(
            subInput,
            () => itemsDatabase.map(item => ({ text: item.name, value: item.name })),
            (selectedOpt) => {
                subInput.value = selectedOpt.value;
            }
        );
    }
}

function addRow(sectionId, name = '', qty = '1', price = 0) {
    const desktopTbody = document.getElementById(`${sectionId}-tbody-desktop`);
    if (!desktopTbody) return;
    const dRowIndex = desktopTbody.rows.length + 1;
    const dTr = document.createElement('tr');
    dTr.className = "hover:bg-slate-50/85 transition desktop-row";
    dTr.innerHTML = `
        <td class="p-3 border-b text-center row-index font-semibold text-slate-500">${dRowIndex}</td>
        <td class="p-3 border-b relative">
            <div class="flex items-center gap-1 relative">
                <input type="text" value="${name}" class="w-full bg-transparent outline-none item-name text-sm font-medium text-slate-800 px-1 rounded pl-6 transition focus:ring-1 focus:ring-indigo-500" placeholder="اكتب أو اختر صنف..." autocomplete="off">
            </div>
        </td>
        <td class="p-3 border-b text-center"><input type="text" value="${qty}" class="w-full text-center bg-transparent outline-none item-qty text-sm px-1 rounded" oninput="syncRowData(this, 'qty')"></td>
        <td class="p-3 border-b text-center"><input type="number" value="${price}" class="w-full text-center bg-transparent outline-none item-price text-sm font-medium px-1 rounded" oninput="syncRowData(this, 'price')"></td>
        <td class="p-3 border-b text-center font-bold text-indigo-900 item-total text-sm">0</td>
        <td class="p-3 border-b text-center no-print"><button type="button" onclick="deleteRowPair(this)" class="text-rose-500 hover:text-rose-700 font-bold p-1 rounded hover:bg-rose-50 transition">✕</button></td>
    `;
    desktopTbody.appendChild(dTr);
    
    const dInput = dTr.querySelector('.item-name');
    setupSelectSearch(
        dInput,
        () => itemsDatabase.map(i => ({ text: i.name, value: i.name })),
        () => onItemSelect(dInput)
    );

    const mobileContainer = document.getElementById(`${sectionId}-tbody-mobile`);
    if (mobileContainer) {
        const mCard = document.createElement('div');
        mCard.className = "bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-sm mobile-card";
        mCard.innerHTML = `
            <div class="flex justify-between items-center border-b border-slate-200 pb-2">
                <span class="text-xs font-bold text-indigo-900 card-index">البند #${dRowIndex}</span>
                <button type="button" onclick="deleteRowPair(this)" class="text-rose-600 font-bold text-xs px-2 py-1 bg-rose-50 rounded-lg no-print">حذف ✕</button>
            </div>
            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">اسم الصنف:</label>
                <input type="text" value="${name}" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 item-name outline-none" placeholder="اكتب أو اختر صنف..." autocomplete="off">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="text-[11px] font-bold text-slate-600 block mb-1">الكمية:</label>
                    <input type="text" value="${qty}" class="w-full text-center bg-white border border-slate-300 rounded-lg px-2 py-2 text-xs font-medium item-qty outline-none" oninput="syncRowData(this, 'qty')">
                </div>
                <div>
                    <label class="text-[11px] font-bold text-slate-600 block mb-1">السعر:</label>
                    <input type="number" value="${price}" class="w-full text-center bg-white border border-slate-300 rounded-lg px-2 py-2 text-xs font-medium item-price outline-none" oninput="syncRowData(this, 'price')">
                </div>
            </div>
            <div class="flex justify-between items-center pt-2 border-t text-xs">
                <span class="text-slate-500 font-semibold">الإجمالي:</span>
                <span class="font-black text-indigo-900 item-total text-sm">0 جنية</span>
            </div>
        `;
        mobileContainer.appendChild(mCard);

        const mInput = mCard.querySelector('.item-name');
        setupSelectSearch(
            mInput,
            () => itemsDatabase.map(i => ({ text: i.name, value: i.name })),
            () => onItemSelect(mInput)
        );
    }
    updateIndices(sectionId);
    calculateTotals();
}

function onItemSelect(input) {
    const selectedName = input.value.trim();
    const isMobile = input.closest('.mobile-card') !== null;
    const container = isMobile ? input.closest('.mobile-card') : input.closest('.desktop-row');
    const sectionId = container.closest('.section-wrapper').dataset.sectionId;
    const desktopRows = document.querySelectorAll(`#${sectionId}-tbody-desktop .desktop-row`);
    const mobileCards = document.querySelectorAll(`#${sectionId}-tbody-mobile .mobile-card`);
    let index = isMobile ? Array.from(mobileCards).indexOf(container) : Array.from(desktopRows).indexOf(container);

    if (index !== -1) {
        if (desktopRows[index]) desktopRows[index].querySelector('.item-name').value = selectedName;
        if (mobileCards[index]) mobileCards[index].querySelector('.item-name').value = selectedName;
        
        const found = itemsDatabase.find(i => i.name.trim().toLowerCase() === selectedName.toLowerCase());
        if (found) {
            if (desktopRows[index]) {
                desktopRows[index].querySelector('.item-price').value = found.defaultPrice;
                desktopRows[index].querySelector('.item-qty').value = found.defaultQty;
            }
            if (mobileCards[index]) {
                mobileCards[index].querySelector('.item-price').value = found.defaultPrice;
                mobileCards[index].querySelector('.item-qty').value = found.defaultQty;
            }

            const subItems = itemsDatabase.filter(i => i.subItemOf && i.subItemOf.trim().toLowerCase() === found.name.toLowerCase() && i.autoAdd);
            subItems.forEach(sub => {
                addRow(sectionId, sub.name, sub.defaultQty, sub.defaultPrice);
            });
        }
    }
    calculateTotals();
}

function syncRowData(input, field) {
    const isMobile = input.closest('.mobile-card') !== null;
    const container = isMobile ? input.closest('.mobile-card') : input.closest('.desktop-row');
    const sectionId = container.closest('.section-wrapper').dataset.sectionId;
    const desktopRows = document.querySelectorAll(`#${sectionId}-tbody-desktop .desktop-row`);
    const mobileCards = document.querySelectorAll(`#${sectionId}-tbody-mobile .mobile-card`);
    let index = isMobile ? Array.from(mobileCards).indexOf(container) : Array.from(desktopRows).indexOf(container);

    if (index !== -1) {
        const val = input.value;
        if (field === 'qty') {
            if (desktopRows[index]) desktopRows[index].querySelector('.item-qty').value = val;
            if (mobileCards[index]) mobileCards[index].querySelector('.item-qty').value = val;
        } else if (field === 'price') {
            if (desktopRows[index]) desktopRows[index].querySelector('.item-price').value = val;
            if (mobileCards[index]) mobileCards[index].querySelector('.item-price').value = val;
        }
    }
    calculateTotals();
}

function deleteRowPair(btn) {
    const isMobile = btn.closest('.mobile-card') !== null;
    const sectionWrapper = btn.closest('.section-wrapper');
    if (!sectionWrapper) return;
    const sectionId = sectionWrapper.dataset.sectionId;

    const desktopRows = Array.from(document.querySelectorAll(`#${sectionId}-tbody-desktop .desktop-row`));
    const mobileCards = Array.from(document.querySelectorAll(`#${sectionId}-tbody-mobile .mobile-card`));

    let index = -1;
    if (isMobile) {
        const card = btn.closest('.mobile-card');
        index = mobileCards.indexOf(card);
    } else {
        const row = btn.closest('.desktop-row');
        index = desktopRows.indexOf(row);
    }

    if (index !== -1) {
        if (desktopRows[index]) desktopRows[index].remove();
        if (mobileCards[index]) mobileCards[index].remove();
    }

    updateIndices(sectionId);
    calculateTotals();
}

function updateIndices(sectionId) {
    const desktopRows = document.querySelectorAll(`#${sectionId}-tbody-desktop .desktop-row`);
    const mobileCards = document.querySelectorAll(`#${sectionId}-tbody-mobile .mobile-card`);
    desktopRows.forEach((row, index) => { row.querySelector('.row-index').innerText = index + 1; });
    mobileCards.forEach((card, index) => { card.querySelector('.card-index').innerText = `البند #${index + 1}`; });
}

function calculateTotals() {
    let grandTotal = 0;
    const activeSectionWrappers = document.querySelectorAll('.section-wrapper');
    activeSectionWrappers.forEach(wrapper => {
        const secId = wrapper.dataset.sectionId;
        const desktopRows = document.querySelectorAll(`#${secId}-tbody-desktop .desktop-row`);
        const mobileCards = document.querySelectorAll(`#${secId}-tbody-mobile .mobile-card`);
        let sectionSum = 0;
        desktopRows.forEach((dRow, index) => {
            const mCard = mobileCards[index];
            const qtyStr = dRow.querySelector('.item-qty').value;
            const qty = parseFloat(qtyStr) || 1;
            const price = parseFloat(dRow.querySelector('.item-price').value) || 0;
            const total = qty * price;
            dRow.querySelector('.item-total').innerText = total.toLocaleString();
            if (mCard) mCard.querySelector('.item-total').innerText = total.toLocaleString() + " جنية";
            sectionSum += total;
        });
        const totalSpan = document.getElementById(`${secId}-total`);
        if (totalSpan) totalSpan.innerText = sectionSum.toLocaleString();
        grandTotal += sectionSum;
    });
    document.getElementById('grand-total').innerText = grandTotal.toLocaleString() + " جنية";
    document.getElementById('grand-total-words-ar').value = 'مبلغ وقدره ' + grandTotal.toLocaleString() + ' جنيه مصري فقط لا غير';
    document.getElementById('grand-total-words-en').value = grandTotal.toLocaleString() + ' Egyptian Pounds Only';
}

function getTableData(sectionId) {
    const rows = document.querySelectorAll(`#${sectionId}-tbody-desktop .desktop-row`);
    let data = [];
    rows.forEach(row => {
        data.push({
            name: row.querySelector('.item-name').value,
            qty: row.querySelector('.item-qty').value,
            price: row.querySelector('.item-price').value
        });
    });
    return data;
}

function openCatalogModal() {
    const desktopTbody = document.getElementById('catalog-modal-tbody-desktop');
    const mobileContainer = document.getElementById('catalog-modal-mobile-list');
    if (desktopTbody) desktopTbody.innerHTML = '';
    if (mobileContainer) mobileContainer.innerHTML = '';
    
    itemsDatabase.forEach((item, index) => {
        let optionsHtml = '';
        globalSectionsList.forEach(sec => {
            optionsHtml += `<option value="${sec.id}" ${item.category === sec.id ? 'selected' : ''}>${sec.title.substring(0, 25)}</option>`;
        });

        let subSelectOptions = '<option value="">-- بدون (رئيسي) --</option>';
        itemsDatabase.forEach(p => {
            subSelectOptions += `<option value="${p.name}" ${item.subItemOf === p.name ? 'selected' : ''}>${p.name}</option>`;
        });

        if (desktopTbody) {
            const tr = document.createElement('tr');
            tr.className = "border-b hover:bg-slate-50 catalog-row-desktop";
            tr.innerHTML = `
                <td class="p-2 border-b"><input type="text" value="${item.name}" class="w-full bg-transparent outline-none catalog-item-name font-medium text-slate-800" data-index="${index}"></td>
                <td class="p-2 border-b text-center"><input type="number" value="${item.defaultPrice}" class="w-full text-center bg-transparent outline-none catalog-item-price font-bold text-indigo-900" data-index="${index}"></td>
                <td class="p-2 border-b text-center"><input type="text" value="${item.defaultQty}" class="w-full text-center bg-transparent outline-none catalog-item-qty" data-index="${index}"></td>
                <td class="p-2 border-b text-center"><select class="bg-transparent outline-none catalog-item-cat w-full text-xs" data-index="${index}">${optionsHtml}</select></td>
                <td class="p-2 border-b text-center"><select class="bg-transparent outline-none catalog-item-sub w-full text-xs" data-index="${index}">${subSelectOptions}</select></td>
                <td class="p-2 border-b text-center"><input type="checkbox" class="catalog-item-auto" data-index="${index}" ${item.autoAdd ? 'checked' : ''}></td>
                <td class="p-2 border-b text-center"><button type="button" onclick="deleteCatalogItem(${index})" class="text-rose-500 font-bold px-2 py-1 hover:bg-rose-50 rounded">حذف</button></td>
            `;
            desktopTbody.appendChild(tr);
        }

        if (mobileContainer) {
            const card = document.createElement('div');
            card.className = "bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-sm catalog-card-mobile";
            card.innerHTML = `
                <div class="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span class="text-xs font-bold text-indigo-900">صنف #${index + 1}</span>
                    <button type="button" onclick="deleteCatalogItem(${index})" class="text-rose-600 font-bold text-xs px-2 py-1 bg-rose-50 rounded-lg">حذف ✕</button>
                </div>
                <div>
                    <label class="text-[10px] font-bold text-slate-600 block mb-0.5">اسم الصنف:</label>
                    <input type="text" value="${item.name}" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs catalog-item-name-m outline-none">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] font-bold text-slate-600 block mb-0.5">السعر:</label>
                        <input type="number" value="${item.defaultPrice}" class="w-full text-center bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-indigo-900 catalog-item-price-m outline-none">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-600 block mb-0.5">الكمية:</label>
                        <input type="text" value="${item.defaultQty}" class="w-full text-center bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs catalog-item-qty-m outline-none">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] font-bold text-slate-600 block mb-0.5">القسم:</label>
                        <select class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs catalog-item-cat-m outline-none">${optionsHtml}</select>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-600 block mb-0.5">ملحق فرعي لـ:</label>
                        <select class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs catalog-item-sub-m outline-none">${subSelectOptions}</select>
                    </div>
                </div>
                <div class="flex items-center gap-2 pt-1">
                    <input type="checkbox" class="catalog-item-auto-m" ${item.autoAdd ? 'checked' : ''}>
                    <span class="text-xs font-semibold text-slate-700">إضافة تلقائية عند اختيار الرئيسي</span>
                </div>
            `;
            mobileContainer.appendChild(card);
        }
    });
    document.getElementById('catalog-modal').classList.remove('hidden');
}

function closeCatalogModal() { document.getElementById('catalog-modal').classList.add('hidden'); }

function saveCatalogModalChanges() {
    const isMobile = window.innerWidth < 768;
    let names = document.querySelectorAll(isMobile ? '.catalog-item-name-m' : '.catalog-item-name');
    let prices = document.querySelectorAll(isMobile ? '.catalog-item-price-m' : '.catalog-item-price');
    let qtys = document.querySelectorAll(isMobile ? '.catalog-item-qty-m' : '.catalog-item-qty');
    let cats = document.querySelectorAll(isMobile ? '.catalog-item-cat-m' : '.catalog-item-cat');
    let subs = document.querySelectorAll(isMobile ? '.catalog-item-sub-m' : '.catalog-item-sub');
    let autos = document.querySelectorAll(isMobile ? '.catalog-item-auto-m' : '.catalog-item-auto');
    
    let newDb = [];
    for (let i = 0; i < names.length; i++) {
        const name = names[i].value.trim();
        if (name) {
            newDb.push({ 
                name: name, 
                defaultPrice: parseFloat(prices[i].value) || 0, 
                defaultQty: qtys[i].value.trim() || "1", 
                category: cats[i].value,
                subItemOf: subs[i].value || "",
                autoAdd: autos[i].checked
            });
        }
    }
    itemsDatabase = newDb;
    saveClientsToCloud();
    refreshDatalist();
    closeCatalogModal();
    alert('تم تحديث الكتالوج الثابت والملحقات الفرعية بنجاح!');
}

function deleteCatalogItem(index) {
    if (confirm('هل أنت متأكد من حذف هذا الصنف من الكتالوج الثابت؟')) {
        itemsDatabase.splice(index, 1);
        openCatalogModal();
    }
}

window.onload = function() {
    fetchClientsFromCloud();
};

const encodedSignatureData = ["2KfZhNmK","INin2YTYp9mE","IMKn","INio2LHYp9mE","INin2YTZhtmK2KfYjCDZhdiq2Kkg","MDEyMjkzMTU1MDM="];
function renderSecureWatermark() {
    const c = document.getElementById('secure-watermark-container');
    if (c) c.innerHTML = `<span class="font-bold text-indigo-900 text-xs md:text-sm">🛡️ تصميم وتطوير: م/ علي صابر حنفي - 01229315503</span>`;
}