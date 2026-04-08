// Professions Page JavaScript
let professionsData = [];
let currentProfession = null;

// Load professions data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProfessions();
    
    // Search input event listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProfessions, 300));
    }
    
    // Category filter event listener
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProfessions);
    }
});

// Load professions from JSON file
async function loadProfessions() {
    try {
        const response = await fetch('professions.json');
        const data = await response.json();
        professionsData = data;
        
        displayProfessions(professionsData);
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('professionsGrid').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading professions:', error);
        document.getElementById('loadingState').innerHTML = `
            <div class="text-center py-20">
                <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
                <h3 class="text-2xl font-bold text-navy mb-2">حدث خطأ في تحميل البيانات</h3>
                <p class="text-gray-600 mb-6">يرجى تحديث الصفحة أو المحاولة لاحقاً</p>
                <button onclick="location.reload()" class="px-6 py-3 bg-gold text-white rounded-lg font-bold hover:bg-gold-light transition-colors">
                    تحديث الصفحة
                </button>
            </div>
        `;
    }
}

// Display professions in grid
function displayProfessions(professions) {
    const grid = document.getElementById('professionsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    if (professions.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        resultsCount.textContent = '0';
        return;
    }
    
    grid.classList.remove('hidden');
    noResults.classList.add('hidden');
    resultsCount.textContent = professions.length;
    
    grid.innerHTML = professions.map(profession => createProfessionCard(profession)).join('');
}

// Create profession card HTML
function createProfessionCard(profession) {
    const professionName = profession.profession_name_ar || profession.name || profession.professionName || 'غير محدد';
    const professionCode = profession.profession_code || profession.code || profession.professionCode || 'N/A';
    const category = profession.category || profession.classification || 'أخرى';
    
    return `
        <div class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gold/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer group"
             onclick='showProfessionDetails(${JSON.stringify(profession).replace(/'/g, "&apos;")})' 
             data-testid="profession-card-${professionCode}">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-navy mb-2 group-hover:text-gold transition-colors line-clamp-2">
                        ${professionName}
                    </h3>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <span class="px-3 py-1 bg-gold/10 text-gold rounded-full font-semibold">
                            ${professionCode}
                        </span>
                        <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                            ${category}
                        </span>
                    </div>
                </div>
                <div class="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors">
                    <i class="fas fa-briefcase text-gold group-hover:text-white text-xl transition-colors"></i>
                </div>
            </div>
            
            <div class="pt-4 border-t border-gray-100">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">
                        <i class="fas fa-file-alt text-gold ml-1"></i>
                        الأوراق المطلوبة
                    </span>
                    <span class="text-gold font-semibold group-hover:gap-3 flex items-center gap-2 transition-all">
                        عرض التفاصيل
                        <i class="fas fa-arrow-left"></i>
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Filter professions based on search and category
function filterProfessions() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    let filtered = professionsData;
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(profession => {
            const name = (profession.profession_name_ar || profession.name || profession.professionName || '').toLowerCase();
            const code = (profession.profession_code || profession.code || profession.professionCode || '').toLowerCase();
            return name.includes(searchTerm) || code.includes(searchTerm);
        });
    }
    
    // Filter by category
    if (selectedCategory) {
        filtered = filtered.filter(profession => {
            const category = profession.category || profession.classification || 'أخرى';
            return category === selectedCategory;
        });
    }
    
    displayProfessions(filtered);
}

// Show profession details in modal
function showProfessionDetails(profession) {
    currentProfession = profession;
    
    const professionName = profession.profession_name_ar || profession.name || profession.professionName || 'غير محدد';
    const professionCode = profession.profession_code || profession.code || profession.professionCode || 'N/A';
    const requirements = profession.requirements || profession.required_documents || getDefaultRequirements();
    
    document.getElementById('modalProfessionName').textContent = professionName;
    document.getElementById('modalProfessionCode').textContent = professionCode;
    
    const requirementsList = document.getElementById('modalRequirementsList');
    requirementsList.innerHTML = requirements.map(req => `<li class="py-2 border-b border-gray-100 last:border-0">${req}</li>`).join('');
    
    document.getElementById('professionModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close profession details modal
function closeProfessionModal() {
    document.getElementById('professionModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Print profession details
function printProfessionDetails() {
    if (!currentProfession) return;
    
    const professionName = currentProfession.profession_name_ar || currentProfession.name || currentProfession.professionName || 'غير محدد';
    const professionCode = currentProfession.profession_code || currentProfession.code || currentProfession.professionCode || 'N/A';
    const requirements = currentProfession.requirements || currentProfession.required_documents || getDefaultRequirements();
    
    printProfessionDocument(professionCode, professionName, requirements);
}

// Download profession details as PDF
function downloadProfessionPDF() {
    // For now, this will use the print function
    // In future, can integrate jsPDF library
    printProfessionDetails();
    showToast('جاري تحضير ملف PDF للطباعة...');
}

// Get default requirements if none provided
function getDefaultRequirements() {
    return [
        'جواز سفر ساري المفعول (صلاحية 6 أشهر على الأقل)',
        'صور شخصية حديثة (مقاس 4×6، خلفية بيضاء)',
        'الفحص الطبي المعتمد من المراكز المعتمدة',
        'الشهادات الأكاديمية (البكالوريوس أو الدبلوم حسب المهنة)',
        'شهادات الخبرة العملية (إن وجدت)',
        'تصديق الشهادات من وزارة التعليم العالي الأردنية',
        'تصديق الشهادات من وزارة الخارجية الأردنية',
        'تصديق الشهادات من السفارة السعودية',
        'تفويض إلكتروني (إنجاز) من الكفيل في السعودية',
        'عقد العمل موثق ومصدق'
    ];
}

// Enhanced print function with luxurious header
function printProfessionDocument(professionCode, professionName, requirements) {
    const printWindow = window.open('', '_blank');
    
    const printContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>الأوراق المطلوبة - ${professionName}</title>
            <style>
                @page {
                    size: A4;
                    margin: 15mm;
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Arial', 'Tahoma', sans-serif;
                    direction: rtl;
                    text-align: right;
                    line-height: 1.8;
                    color: #1B2A41;
                    background: white;
                }
                .print-header {
                    background: linear-gradient(135deg, #1B2A41 0%, #2a3f5f 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .print-header h1 {
                    font-size: 32px;
                    margin-bottom: 8px;
                    font-weight: bold;
                }
                .print-header .subtitle {
                    color: #D4AF37;
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    letter-spacing: 1px;
                }
                .office-info {
                    background: rgba(255,255,255,0.1);
                    padding: 15px;
                    border-radius: 8px;
                    font-size: 14px;
                    line-height: 1.8;
                }
                .office-info div {
                    margin: 5px 0;
                }
                .document-title {
                    background: #D4AF37;
                    color: white;
                    padding: 20px;
                    margin: 30px 0 20px;
                    border-radius: 10px;
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
                }
                .profession-info {
                    background: #f8f9fa;
                    padding: 20px;
                    margin: 20px 0;
                    border-right: 5px solid #D4AF37;
                    border-radius: 8px;
                }
                .profession-info strong {
                    color: #1B2A41;
                    font-weight: bold;
                }
                .section-title {
                    color: #1B2A41;
                    font-size: 22px;
                    font-weight: bold;
                    margin: 30px 0 15px;
                    padding-bottom: 10px;
                    border-bottom: 3px solid #D4AF37;
                }
                .requirements-list {
                    margin: 20px 0;
                    padding: 0;
                    counter-reset: item;
                }
                .requirements-list li {
                    padding: 15px;
                    margin: 10px 0;
                    border-bottom: 1px solid #e5e7eb;
                    list-style: none;
                    position: relative;
                    padding-right: 40px;
                }
                .requirements-list li:before {
                    content: counter(item);
                    counter-increment: item;
                    position: absolute;
                    right: 0;
                    top: 12px;
                    background: #D4AF37;
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                }
                .note-box {
                    background: #fff3cd;
                    border: 2px solid #ffc107;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 30px 0;
                }
                .note-box strong {
                    color: #856404;
                    display: block;
                    margin-bottom: 10px;
                    font-size: 18px;
                }
                .note-box p {
                    color: #856404;
                    line-height: 1.8;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 3px solid #D4AF37;
                    text-align: center;
                    color: #64748b;
                    font-size: 13px;
                }
                .footer p {
                    margin: 8px 0;
                }
                .certified-seal {
                    display: inline-block;
                    padding: 10px 20px;
                    background: #D4AF37;
                    color: white;
                    border-radius: 50px;
                    font-weight: bold;
                    margin: 20px 0;
                    font-size: 14px;
                }
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>مكتب تأشيرات السعودية في الأردن</h1>
                <div class="subtitle">Saudia-visa.com | المكتب المعتمد من السفارة السعودية</div>
                <div class="office-info">
                    <div>📍 العنوان: الدوار الأول - جبل عمان، عمان، الأردن</div>
                    <div>📞 الهاتف / واتساب: 0789881009</div>
                    <div>✉️ البريد الإلكتروني: Visa@saudia-visa.com</div>
                    <div>🌐 الموقع الإلكتروني: www.saudia-visa.com</div>
                </div>
            </div>
            
            <div class="certified-seal">✓ مكتب مرخص ومعتمد رسمياً</div>
            
            <div class="document-title">
                الأوراق والمستندات المطلوبة لتأشيرة العمل السعودية
            </div>
            
            <div class="profession-info">
                <div style="margin-bottom: 10px;"><strong>المهنة:</strong> ${professionName}</div>
                <div style="margin-bottom: 10px;"><strong>رمز المهنة:</strong> ${professionCode}</div>
                <div><strong>تاريخ الطباعة:</strong> ${new Date().toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                })}</div>
            </div>
            
            <h2 class="section-title">📋 قائمة الأوراق والمستندات المطلوبة:</h2>
            <ul class="requirements-list">
                ${requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
            
            <div class="note-box">
                <strong>⚠️ ملاحظات مهمة:</strong>
                <p>
                    • قد تختلف بعض المتطلبات حسب السفارة والحالة الفردية للمتقدم.<br>
                    • جميع الشهادات والوثائق يجب أن تكون مصدقة من الجهات الرسمية الأردنية أولاً.<br>
                    • يُنصح بالتواصل مع مكتبنا المعتمد للحصول على استشارة مجانية ومعلومات محدثة.<br>
                    • نحن نضمن تجهيز ملفك بدقة 100% لضمان القبول من المرة الأولى.
                </p>
            </div>
            
            <div class="footer">
                <p><strong>مكتب تأشيرات السعودية في الأردن - المكتب المعتمد والمرخص من السفارة السعودية</strong></p>
                <p>نخدمكم منذ أكثر من 10 سنوات بأعلى معايير الدقة والاحترافية</p>
                <p style="margin-top: 15px; font-size: 12px;">© ${new Date().getFullYear()} جميع الحقوق محفوظة - Saudia-visa.com</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
