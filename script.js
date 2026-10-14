const encodedSignatureData = [
    "2KfZhNmK",                  // تصميم
    "INin2YTYp9mE",              // و تنفيذ:
    "IMKn",                      // م/
    "INio2LHYp9mE",              // علي
    "INin2YTZhtmK2KfYjCDZhdiq2Kkg", // صابر حنفي - 
    "MDEyMjkzMTU1MDM="           // 01229315503
];

function decodeSecureSignature(base64Array) {
    try {
        const fullB64 = base64Array.join('');
        const binString = atob(fullB64);
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
        return new TextDecoder().decode(bytes);
    } catch (e) {
        return "تصميم: م/ علي صابر حنفي - 01229315503";
    }
}

function renderSecureWatermark() {
    const container = document.getElementById('secure-watermark-container');
    if (container) {
        const signature = "تصميم وتطوير: م/ علي صابر حنفي - 01229315503"; 
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center gap-1">
                <span class="font-bold text-indigo-900 text-xs md:text-sm">🛡️ ${signature}</span>
                <span class="text-[10px] text-slate-400">هذا التصميم محمي نظامياً (يظهر على الشاشة فقط ويختفي تماماً عند الطباعة أو التصدير PDF)</span>
            </div>
        `;
    }
}

function tafqeetArabic(amount) {
    if (!amount || isNaN(amount) || amount === 0) return 'صفر جنيه مصري فقط لا غير';
    let units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    let teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    let tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    let hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    let n = Math.floor(amount);

    function convertHundreds(num) {
        let res = '';
        let h = Math.floor(num / 100);
        let t = num % 100;
        if (h > 0) res += hundreds[h];
        if (t > 0) {
            if (res !== '') res += ' و';
            if (t < 10) res += units[t];
            else if (t >= 10 && t < 20) res += teens[t - 10];
            else {
                let ten = Math.floor(t / 10);
                let unit = t % 10;
                if (unit > 0) res += units[unit] + ' و' + tens[ten];
                else res += tens[ten];
            }
        }
        return res;
    }

    let millions = Math.floor(n / 1000000);
    let thousands = Math.floor((n % 1000000) / 1000);
    let rem = n % 1000;
    let parts = [];

    if (millions > 0) {
        let mStr = '';
        if (millions === 1) mStr = 'مليون واحد';
        else if (millions === 2) mStr = 'مليونان';
        else if (millions >= 3 && millions <= 10) mStr = convertHundreds(millions) + ' ملايين';
        else mStr = convertHundreds(millions) + ' مليوناً';
        parts.push(mStr);
    }
    if (thousands > 0) {
        let tStr = '';
        if (thousands === 1) tStr = 'ألف';
        else if (thousands === 2) tStr = 'ألفان';
        else if (thousands >= 3 && thousands <= 10) tStr = convertHundreds(thousands) + ' آلاف';
        else tStr = convertHundreds(thousands) + ' ألفاً';
        parts.push(tStr);
    }
    if (rem > 0) parts.push(convertHundreds(rem));
    return parts.join(' و') + ' جنيه مصري فقط لا غير';
}

function numberToWordsEnglish(amount) {
    if (!amount || isNaN(amount) || amount === 0) return 'Zero Egyptian Pounds Only';
    let a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    let b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function getLessThanThousand(n) {
        if (n === 0) return '';
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + getLessThanThousand(n % 100) : '');
    }

    let n = Math.floor(amount);
    let str = '';
    let millions = Math.floor(n / 1000000);
    let thousands = Math.floor((n % 1000000) / 1000);
    let remainder = n % 1000;

    if (millions > 0) str += getLessThanThousand(millions) + (millions === 1 ? 'Million ' : 'Millions ');
    if (thousands > 0) str += getLessThanThousand(thousands) + 'Thousand ';
    if (remainder > 0) str += getLessThanThousand(remainder);
    return str.trim() + ' Egyptian Pounds Only';
}

const defaultDatabase = [
    { name: "خلايا جينكو 650 وات باي فيشال ذات الوجهين عدد 60 لوح", defaultPrice: 520650, defaultQty: "39ك", category: "solar" },
    { name: "حوامل خلايا حديد الشافعى سمك 3 مم على الساخن بداعمتين", defaultPrice: 0, defaultQty: "39ك", category: "solar" },
    { name: "انفرتر ساج او سانشي 50 حصان", defaultPrice: 0, defaultQty: "1", category: "solar" },
    { name: "لوحة تجميع DC بالقاطع العمومي وسلك DC قطر 6 مم المانى", defaultPrice: 0, defaultQty: "1", category: "solar" },
    { name: "برمجه وتوصيل الانفرتر", defaultPrice: 0, defaultQty: "1", category: "solar" },
    { name: "ماتور 40 حصان فانسان تركي 7بوصة زهر", defaultPrice: 89800, defaultQty: "1", category: "motor" },
    { name: "طلمبة فانسان تركي 30 حصان 6 مرحلة 7075/6", defaultPrice: 57400, defaultQty: "1", category: "motor" },
    { name: "كابل سيفال 3*25 تركي", defaultPrice: 900, defaultQty: "75", category: "motor" },
    { name: "ماسورة 5 بوصة هندى اشريفاد 16 بار", defaultPrice: 3450, defaultQty: "22", category: "motor" },
    { name: "بداية استاليس استيل 5/5", defaultPrice: 3750, defaultQty: "1", category: "motor" },
    { name: "كوع حديد 5 بوصة", defaultPrice: 2000, defaultQty: "1", category: "motor" },
    { name: "وش بير حديد 5 بوصة 45سم", defaultPrice: 2500, defaultQty: "1", category: "motor" },
    { name: "نهاية استاليس 5 بوصة", defaultPrice: 4500, defaultQty: "1", category: "motor" },
    { name: "حبل حرير 16 مم", defaultPrice: 35, defaultQty: "150", category: "motor" },
    { name: "وصله لحام ريكم كاملة 25 مم", defaultPrice: 450, defaultQty: "1", category: "motor" }
];

let itemsDatabase = [];
let sectionsList = [
    { id: 'solar', title: 'أولاً: محطة طاقة شمسية قدرة 39 كيلو جينكو', badge: 'الخلايا والحوامل' },
    { id: 'motor', title: 'ثانياً: الماتور والطلمبة والمستلزمات', badge: 'التجهيز والتشغيل' }
];

window.onload = function() {
    renderSecureWatermark();

    if (typeof flatpickr !== "undefined") {
        flatpickr("#quote-date", {
            locale: "ar",
            dateFormat: "d/m/Y",
            defaultDate: new Date(),
            allowInput: true,
            disableMobile: "true"
        });
    }

    const savedItems = localStorage.getItem('solar_items_catalog');
    if (savedItems) itemsDatabase = JSON.parse(savedItems);
    else { itemsDatabase = [...defaultDatabase]; saveCatalogToLocalStorage(); }

    const savedSections = localStorage.getItem('solar_sections_list');
    if (savedSections) sectionsList = JSON.parse(savedSections);

    refreshCategorySelect();
    refreshDatalist();
    renderAllSections();
};

function saveCatalogToLocalStorage() {
    localStorage.setItem('solar_items_catalog', JSON.stringify(itemsDatabase));
    localStorage.setItem('solar_sections_list', JSON.stringify(sectionsList));
}

function refreshCategorySelect() {
    const select = document.getElementById('new-item-category');
    if (!select) return;
    select.innerHTML = '';
    sectionsList.forEach(sec => {
        const opt = document.createElement('option');
        opt.value = sec.id;
        opt.textContent = sec.title.substring(0, 30) + '...';
        select.appendChild(opt);
    });
}

function refreshDatalist() {
    const datalist = document.getElementById('items-list');
    if (!datalist) return;
    datalist.innerHTML = '';
    itemsDatabase.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        datalist.appendChild(option);
    });
}

function addNewSectionPrompt() {
    const title = prompt("أدخل عنوان القسم الجديد:", "ثالثاً: قسم جديد");
    if (!title) return;
    const badge = prompt("أدخل وصف القسم أو الشارة:", "تجهيزات إضافية");
    const newId = 'sec_' + Date.now();
    sectionsList.push({ id: newId, title: title, badge: badge || 'عام' });
    saveCatalogToLocalStorage();
    refreshCategorySelect();
    renderSectionDOM(newId, title, badge || 'عام');
}

function renderAllSections() {
    const container = document.getElementById('sections-container');
    container.innerHTML = '';
    sectionsList.forEach(sec => {
        renderSectionDOM(sec.id, sec.title, sec.badge);
        const matchingItems = itemsDatabase.filter(i => i.category === sec.id);
        if (matchingItems.length > 0) {
            matchingItems.forEach(item => addRow(sec.id, item.name, item.defaultQty, item.defaultPrice));
        } else {
            addRow(sec.id, '', '1', 0);
        }
    });
}

function renderSectionDOM(id, title, badge) {
    const container = document.getElementById('sections-container');
    const div = document.createElement('div');
    div.className = "bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden section-wrapper";
    div.dataset.sectionId = id;
    div.innerHTML = `
        <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-3 sm:px-5 sm:py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <input type="text" value="${title}" class="section-title-input bg-transparent border border-transparent hover:border-white/30 focus:border-white rounded px-2 py-1 outline-none text-xs sm:text-base font-bold text-white w-full sm:w-[60%]">
            <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                <input type="text" value="${badge}" class="section-badge-input bg-blue-800/80 text-[10px] sm:text-xs px-2.5 py-1 rounded-md border border-blue-400/20 text-white outline-none w-28 sm:w-32 text-center">
                <button onclick="deleteSection('${id}')" class="text-rose-300 hover:text-rose-100 text-xs font-bold px-2.5 py-1 bg-rose-900/40 hover:bg-rose-900 rounded no-print">حذف القسم ✕</button>
            </div>
        </div>
        <div class="p-2 sm:p-5">
            <div class="hidden md:block overflow-x-auto pb-2 desktop-table-view">
                <table class="w-full text-right border-collapse">
                    <thead>
                        <tr class="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                            <th class="p-3 border-b w-12 text-center">م</th>
                            <th class="p-3 border-b">الصنف</th>
                            <th class="p-3 border-b w-24 text-center">الكمية</th>
                            <th class="p-3 border-b w-32 text-center">السعر (جنية)</th>
                            <th class="p-3 border-b w-32 text-center">الإجمالي (جنية)</th>
                            <th class="p-3 border-b w-14 text-center no-print">إجراء</th>
                        </tr>
                    </thead>
                    <tbody id="${id}-tbody-desktop" class="text-sm divide-y divide-slate-100"></tbody>
                </table>
            </div>
            <div class="md:hidden space-y-3 mobile-card-view" id="${id}-tbody-mobile"></div>
            <div class="flex flex-col sm:flex-row justify-between items-center mt-3 pt-3 border-t border-slate-100 gap-2.5">
                <button onclick="addRow('${id}')" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm no-print">
                    + إضافة صنف لهذا القسم
                </button>
                <div class="text-xs sm:text-sm font-bold text-slate-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 w-full sm:w-auto text-left">
                    إجمالي القسم: <span id="${id}-total" class="text-blue-900 font-black text-xs sm:text-base">0</span> جنية
                </div>
            </div>
        </div>
    `;
    container.appendChild(div);
}

function deleteSection(id) {
    if (sectionsList.length <= 1) { alert('لا يمكن حذف القسم الأخير!'); return; }
    if (confirm('هل أنت متأكد من حذف هذا القسم بالكامل؟')) {
        sectionsList = sectionsList.filter(s => s.id !== id);
        saveCatalogToLocalStorage();
        refreshCategorySelect();
        const wrapper = document.querySelector(`[data-section-id="${id}"]`);
        if (wrapper) wrapper.remove();
        calculateTotals();
    }
}

function addNewItemToCatalog() {
    const nameInput = document.getElementById('new-item-name');
    const priceInput = document.getElementById('new-item-price');
    const qtyInput = document.getElementById('new-item-qty');
    const categoryInput = document.getElementById('new-item-category');

    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || 0;
    const qty = qtyInput.value.trim() || "1";
    const category = categoryInput.value;

    if (!name) { alert('برجاء كتابة اسم الصنف أولاً'); return; }

    const existingIndex = itemsDatabase.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    if (existingIndex !== -1) {
        itemsDatabase[existingIndex].defaultPrice = price;
        itemsDatabase[existingIndex].defaultQty = qty;
        itemsDatabase[existingIndex].category = category;
    } else {
        itemsDatabase.push({ name, defaultPrice: price, defaultQty: qty, category });
    }

    saveCatalogToLocalStorage();
    refreshDatalist();
    addRow(category, name, qty, price);

    nameInput.value = '';
    priceInput.value = '';
    qtyInput.value = '1';
    alert('تم حفظ الصنف في الكتالوج الثابت بنجاح!');
}

function openCatalogModal() {
    const tbody = document.getElementById('catalog-modal-tbody');
    tbody.innerHTML = '';
    itemsDatabase.forEach((item, index) => {
        let optionsHtml = '';
        sectionsList.forEach(sec => {
            optionsHtml += `<option value="${sec.id}" ${item.category === sec.id ? 'selected' : ''}>${sec.title.substring(0, 20)}</option>`;
        });
        const tr = document.createElement('tr');
        tr.className = "border-b";
        tr.innerHTML = `
            <td class="p-2 border"><input type="text" value="${item.name}" class="w-full bg-transparent outline-none catalog-item-name" data-index="${index}"></td>
            <td class="p-2 border text-center"><input type="number" value="${item.defaultPrice}" class="w-full text-center bg-transparent outline-none catalog-item-price" data-index="${index}"></td>
            <td class="p-2 border text-center"><input type="text" value="${item.defaultQty}" class="w-full text-center bg-transparent outline-none catalog-item-qty" data-index="${index}"></td>
            <td class="p-2 border text-center"><select class="bg-transparent outline-none catalog-item-cat w-full text-[11px]" data-index="${index}">${optionsHtml}</select></td>
            <td class="p-2 border text-center"><button onclick="deleteCatalogItem(${index})" class="text-rose-500 font-bold px-2 py-1 hover:bg-rose-50 rounded">حذف</button></td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById('catalog-modal').classList.remove('hidden');
}

function closeCatalogModal() { document.getElementById('catalog-modal').classList.add('hidden'); }

function saveCatalogModalChanges() {
    const names = document.querySelectorAll('.catalog-item-name');
    const prices = document.querySelectorAll('.catalog-item-price');
    const qtys = document.querySelectorAll('.catalog-item-qty');
    const cats = document.querySelectorAll('.catalog-item-cat');
    let newDb = [];
    for (let i = 0; i < names.length; i++) {
        const name = names[i].value.trim();
        if (name) {
            newDb.push({
                name: name,
                defaultPrice: parseFloat(prices[i].value) || 0,
                defaultQty: qtys[i].value.trim() || "1",
                category: cats[i].value
            });
        }
    }
    itemsDatabase = newDb;
    saveCatalogToLocalStorage();
    refreshDatalist();
    closeCatalogModal();
    alert('تم تحديث الكتالوج الثابت بنجاح!');
}

function deleteCatalogItem(index) {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
        itemsDatabase.splice(index, 1);
        openCatalogModal();
    }
}

function exportCatalog() {
    const catalogData = { sections: sectionsList, items: itemsDatabase };
    const blob = new Blob([JSON.stringify(catalogData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ملف_الاصناف_والكتالوج.json';
    a.click();
}

function importCatalog(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.items && Array.isArray(imported.items)) {
                itemsDatabase = imported.items;
                if (imported.sections && Array.isArray(imported.sections)) sectionsList = imported.sections;
                saveCatalogToLocalStorage();
                refreshCategorySelect();
                refreshDatalist();
                renderAllSections();
                alert('تم استيراد الكتالوج بنجاح!');
            } else if (Array.isArray(imported)) {
                itemsDatabase = imported;
                saveCatalogToLocalStorage();
                refreshDatalist();
                alert('تم استيراد الأصناف بنجاح!');
            } else { alert('الملف غير صالح.'); }
        } catch (err) { alert('خطأ في قراءة ملف الكتالوج!'); }
    };
    reader.readAsText(file);
}

function addRow(sectionId, name = '', qty = '1', price = 0) {
    const desktopTbody = document.getElementById(`${sectionId}-tbody-desktop`);
    if (!desktopTbody) return;
    const dRowIndex = desktopTbody.rows.length + 1;
    const dTr = document.createElement('tr');
    dTr.className = "hover:bg-slate-50/80 transition desktop-row";
    dTr.innerHTML = `
        <td class="p-3 border-b text-center row-index font-semibold text-slate-500">${dRowIndex}</td>
        <td class="p-3 border-b relative">
            <div class="flex items-center gap-1 relative">
                <input type="text" list="items-list" value="${name}" class="w-full bg-transparent outline-none item-name text-sm font-medium text-slate-800 focus:bg-slate-100/60 px-1 rounded pl-6" placeholder="اختر أو اكتب الصنف..." onchange="onItemSelect(this)">
                <button type="button" onclick="clearItemInput(this)" class="absolute left-1 text-rose-400 hover:text-rose-600 font-bold text-xs bg-rose-50 hover:bg-rose-100 rounded-full w-4 h-4 flex items-center justify-center transition clear-input-btn">×</button>
            </div>
        </td>
        <td class="p-3 border-b text-center"><input type="text" value="${qty}" class="w-full text-center bg-transparent outline-none item-qty text-sm focus:bg-slate-100/60 px-1 rounded" oninput="syncRowData(this, 'qty')"></td>
        <td class="p-3 border-b text-center"><input type="number" value="${price}" class="w-full text-center bg-transparent outline-none item-price text-sm font-medium focus:bg-slate-100/60 px-1 rounded" oninput="syncRowData(this, 'price')"></td>
        <td class="p-3 border-b text-center font-bold text-indigo-900 item-total text-sm">0</td>
        <td class="p-3 border-b text-center no-print"><button onclick="deleteRowPair(this)" class="text-rose-500 hover:text-rose-700 font-bold p-1 rounded hover:bg-rose-50 transition">✕</button></td>
    `;
    desktopTbody.appendChild(dTr);

    const mobileContainer = document.getElementById(`${sectionId}-tbody-mobile`);
    const mCard = document.createElement('div');
    mCard.className = "bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-sm mobile-card";
    mCard.innerHTML = `
        <div class="flex justify-between items-center border-b border-slate-200 pb-2">
            <span class="text-xs font-bold text-indigo-900 card-index">البند #${dRowIndex}</span>
            <button onclick="deleteRowPair(this)" class="text-rose-600 font-bold text-xs px-2 py-1 bg-rose-50 rounded-lg no-print">حذف الصنف ✕</button>
        </div>
        <div>
            <label class="text-[11px] font-bold text-slate-600 block mb-1">اسم الصنف:</label>
            <div class="flex items-center gap-1 relative">
                <input type="text" list="items-list" value="${name}" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 item-name outline-none focus:ring-2 focus:ring-indigo-500 pl-6" placeholder="اختر أو اكتب الصنف..." onchange="onItemSelect(this)">
                <button type="button" onclick="clearItemInput(this)" class="absolute left-2 text-rose-400 hover:text-rose-600 font-bold text-xs bg-rose-50 hover:bg-rose-100 rounded-full w-4 h-4 flex items-center justify-center transition clear-input-btn">×</button>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">الكمية:</label>
                <input type="text" value="${qty}" class="w-full text-center bg-white border border-slate-300 rounded-lg px-2 py-2 text-xs font-medium item-qty outline-none focus:ring-2 focus:ring-indigo-500" oninput="syncRowData(this, 'qty')">
            </div>
            <div>
                <label class="text-[11px] font-bold text-slate-600 block mb-1">السعر (جنية):</label>
                <input type="number" value="${price}" class="w-full text-center bg-white border border-slate-300 rounded-lg px-2 py-2 text-xs font-medium item-price outline-none focus:ring-2 focus:ring-indigo-500" oninput="syncRowData(this, 'price')">
            </div>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs">
            <span class="text-slate-500 font-semibold">إجمالي الصنف:</span>
            <span class="font-black text-indigo-900 item-total text-sm">0 جنية</span>
        </div>
    `;
    mobileContainer.appendChild(mCard);
    updateIndices(sectionId);
    calculateTotals();
}

function clearItemInput(btn) {
    const container = btn.closest('.mobile-card') || btn.closest('.desktop-row');
    const sectionId = container.closest('.section-wrapper').dataset.sectionId;
    const desktopRows = document.querySelectorAll(`#${sectionId}-tbody-desktop .desktop-row`);
    const mobileCards = document.querySelectorAll(`#${sectionId}-tbody-mobile .mobile-card`);
    let index = -1;
    const isMobile = btn.closest('.mobile-card') !== null;
    if (isMobile) index = Array.from(mobileCards).indexOf(container);
    else index = Array.from(desktopRows).indexOf(container);

    if (index !== -1) {
        desktopRows[index].querySelector('.item-name').value = '';
        mobileCards[index].querySelector('.item-name').value = '';
        desktopRows[index].querySelector('.item-price').value = 0;
        mobileCards[index].querySelector('.item-price').value = 0;
        desktopRows[index].querySelector('.item-qty').value = '1';
        mobileCards[index].querySelector('.item-qty').value = '1';
    }
    calculateTotals();
}

function onItemSelect(input) {
    const selectedName = input.value.trim();
    const isMobile = input.closest('.mobile-card') !== null;
    const container = isMobile ? input.closest('.mobile-card') : input.closest('.desktop-row');
    const sectionId = container.closest('.section-wrapper').dataset.sectionId;
    const desktopRows = document.querySelectorAll(`#${sectionId}-tbody-desktop .desktop-row`);
    const mobileCards = document.querySelectorAll(`#${sectionId}-tbody-mobile .mobile-card`);
    let index = -1;
    if (isMobile) index = Array.from(mobileCards).indexOf(container);
    else index = Array.from(desktopRows).indexOf(container);

    if (index !== -1) {
        desktopRows[index].querySelector('.item-name').value = selectedName;
        mobileCards[index].querySelector('.item-name').value = selectedName;
        const found = itemsDatabase.find(i => i.name.trim().toLowerCase() === selectedName.toLowerCase());
        if (found) {
            desktopRows[index].querySelector('.item-price').value = found.defaultPrice;
            mobileCards[index].querySelector('.item-price').value = found.defaultPrice;
            desktopRows[index].querySelector('.item-qty').value = found.defaultQty;
            mobileCards[index].querySelector('.item-qty').value = found.defaultQty;
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
    let index = -1;
    if (isMobile) index = Array.from(mobileCards).indexOf(container);
    else index = Array.from(desktopRows).indexOf(container);

    if (index !== -1) {
        const val = input.value;
        if (field === 'qty') {
            desktopRows[index].querySelector('.item-qty').value = val;
            mobileCards[index].querySelector('.item-qty').value = val;
        } else if (field === 'price') {
            desktopRows[index].querySelector('.item-price').value = val;
            mobileCards[index].querySelector('.item-price').value = val;
        }
    }
    calculateTotals();
}

function deleteRowPair(btn) {
    const isMobile = btn.closest('.mobile-card') !== null;
    const container = isMobile ? btn.closest('.mobile-card') : btn.closest('.desktop-row');
    const sectionId = container.closest('.section-wrapper').dataset.sectionId;
    const desktopRows = document.querySelectorAll(`#${sectionId}-tbody-desktop .desktop-row`);
    const mobileCards = document.querySelectorAll(`#${sectionId}-tbody-mobile .mobile-card`);
    let index = -1;
    if (isMobile) index = Array.from(mobileCards).indexOf(container);
    else index = Array.from(desktopRows).indexOf(container);

    if (index !== -1) {
        desktopRows[index].remove();
        mobileCards[index].remove();
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
    sectionsList.forEach(sec => {
        const desktopRows = document.querySelectorAll(`#${sec.id}-tbody-desktop .desktop-row`);
        const mobileCards = document.querySelectorAll(`#${sec.id}-tbody-mobile .mobile-card`);
        let sectionSum = 0;
        desktopRows.forEach((dRow, index) => {
            const mCard = mobileCards[index];
            const qtyStr = dRow.querySelector('.item-qty').value;
            const qty = parseFloat(qtyStr) || 1;
            const price = parseFloat(dRow.querySelector('.item-price').value) || 0;
            const itemName = dRow.querySelector('.item-name').value;
            const total = itemName.includes('جينكو') && price > 0 ? price : (qtyStr.includes('ك') && price > 0 ? price : qty * price);
            dRow.querySelector('.item-total').innerText = total.toLocaleString();
            if (mCard) mCard.querySelector('.item-total').innerText = total.toLocaleString() + " جنية";
            sectionSum += total;
        });
        const totalSpan = document.getElementById(`${sec.id}-total`);
        if (totalSpan) totalSpan.innerText = sectionSum.toLocaleString();
        grandTotal += sectionSum;
    });
    document.getElementById('grand-total').innerText = grandTotal.toLocaleString() + " جنية";
    const wordsArInput = document.getElementById('grand-total-words-ar');
    const wordsEnInput = document.getElementById('grand-total-words-en');
    if (wordsArInput && !wordsArInput.dataset.manualEdited) wordsArInput.value = tafqeetArabic(grandTotal);
    if (wordsEnInput && !wordsEnInput.dataset.manualEdited) wordsEnInput.value = numberToWordsEnglish(grandTotal);
}

document.addEventListener('DOMContentLoaded', () => {
    const wordsArInput = document.getElementById('grand-total-words-ar');
    const wordsEnInput = document.getElementById('grand-total-words-en');
    if (wordsArInput) wordsArInput.addEventListener('input', () => wordsArInput.dataset.manualEdited = "true");
    if (wordsEnInput) wordsEnInput.addEventListener('input', () => wordsEnInput.dataset.manualEdited = "true");
});

function exportInvoiceData() {
    let sectionsData = [];
    sectionsList.forEach(sec => {
        const wrapper = document.querySelector(`[data-section-id="${sec.id}"]`);
        const title = wrapper ? wrapper.querySelector('.section-title-input').value : sec.title;
        const badge = wrapper ? wrapper.querySelector('.section-badge-input').value : sec.badge;
        sectionsData.push({ id: sec.id, title: title, badge: badge, items: getTableData(sec.id) });
    });
    const data = {
        clientName: document.getElementById('client-name').value,
        date: document.getElementById('quote-date').value,
        durationText: document.getElementById('duration-text').value,
        paymentTermsText: document.getElementById('payment-terms-text').value,
        notesText: document.getElementById('notes-text').value,
        managerName: document.getElementById('manager-name').value,
        wordsAr: document.getElementById('grand-total-words-ar').value,
        wordsEn: document.getElementById('grand-total-words-en').value,
        sections: sectionsData
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `فاتورة_${data.clientName || 'عميل'}.json`;
    a.click();
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

function importInvoiceData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            document.getElementById('client-name').value = data.clientName || '';
            document.getElementById('quote-date').value = data.date || '';
            if(data.durationText) document.getElementById('duration-text').value = data.durationText;
            if(data.paymentTermsText) document.getElementById('payment-terms-text').value = data.paymentTermsText;
            if(data.notesText) document.getElementById('notes-text').value = data.notesText;
            if(data.managerName) document.getElementById('manager-name').value = data.managerName;
            if(data.wordsAr) document.getElementById('grand-total-words-ar').value = data.wordsAr;
            if(data.wordsEn) document.getElementById('grand-total-words-en').value = data.wordsEn;

            if (data.sections && Array.isArray(data.sections)) {
                sectionsList = data.sections.map(s => ({ id: s.id, title: s.title, badge: s.badge }));
                document.getElementById('sections-container').innerHTML = '';
                sectionsList.forEach(sec => {
                    renderSectionDOM(sec.id, sec.title, sec.badge);
                    const matchingSec = data.sections.find(s => s.id === sec.id);
                    if (matchingSec && matchingSec.items) {
                        matchingSec.items.forEach(i => addRow(sec.id, i.name, i.qty, i.price));
                    }
                });
                refreshCategorySelect();
            }
            calculateTotals();
            alert('تم استيراد الفاتورة بنجاح!');
        } catch (err) { alert('خطأ في قراءة ملف الفاتورة!'); }
    };
    reader.readAsText(file);
}