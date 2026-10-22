// === app.js : محرك التطبيق (نظام الترجمات المنفصلة JSON) ===

let currentLang = localStorage.getItem('tajalli_lang') || 'ar';
let currentTranslations = {}; // لحفظ الترجمة الحالية في الذاكرة

/* ---------- جلب ملف الترجمة من مجلد locales ---------- */
async function loadAndApplyLanguage(langCode) {
    try {
        // جلب الملف (مثلاً: locales/ar.json)
        const response = await fetch(`locales/${langCode}.json`);
        
        if (!response.ok) throw new Error(`Could not load ${langCode}.json`);
        
        currentTranslations = await response.json();
        applyTranslations(langCode, currentTranslations);
        
    } catch (error) {
        console.error("Translation Error:", error);
        // في حال فشل التحميل (مثلاً لأنك فتحت الملف بدون سيرفر)، استخدم الترجمة الافتراضية
        if (langCode !== 'ar') {
            console.warn("Falling back to Arabic due to load error.");
            loadAndApplyLanguage('ar');
        }
    }
}

/* ---------- تطبيق الترجمة على الصفحة ---------- */
function applyTranslations(langCode, t) {
    const meta = t._meta || { dir: 'ltr', code: langCode.toUpperCase() };

    currentLang = langCode;
    localStorage.setItem('tajalli_lang', langCode);

    // تحديث اتجاه الصفحة واللغة
    document.documentElement.dir  = meta.dir;
    document.documentElement.lang = langCode;
    
    const langCodeEl = document.getElementById('currentLangCode');
    if (langCodeEl) langCodeEl.innerText = meta.code;

    // تحديث النصوص في الصفحة
    document.querySelectorAll('.translatable').forEach(el => {
        const key = el.getAttribute('data-key');
        if (key && t[key] !== undefined) {
            el.innerText = t[key];
        }
    });

    // تمييز اللغة النشطة في القائمة
    document.querySelectorAll('#langDropdown a').forEach(a => {
        a.classList.toggle('active', a.dataset.lang === langCode);
    });

    // تحديث عنوان الصفحة
    if (t.hero_title) {
        document.title = `${t.hero_title} | Tajalli Plus`;
    }
}

/* ---------- ربط الأحداث برمجياً (بدون onclick) ---------- */
document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('langToggleBtn');
    const langDropdown = document.getElementById('langDropdown');

    // 1. زر فتح القائمة
    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('hidden');
        });
    }

    // 2. روابط اللغات
    document.querySelectorAll('#langDropdown a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = link.getAttribute('data-lang');
            loadAndApplyLanguage(lang);
            langDropdown.classList.add('hidden');
        });
    });

    // 3. إغلاق القائمة عند الضغط خارجها
    window.addEventListener('click', (e) => {
        if (langDropdown && langBtn && !langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
            langDropdown.classList.add('hidden');
        }
    });

    // 4. تحميل اللغة المحفوظة عند بدء التشغيل
    loadAndApplyLanguage(currentLang);
});

/* ---------- شاشة البداية (Splash) ---------- */
window.addEventListener('load', () => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('splash-hide');
            setTimeout(() => splash.remove(), 800);
        }, 2200);
    }
});