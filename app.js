// === app.js : محرك التطبيق ===

let currentLang = localStorage.getItem('tajalli_lang');

/* ---------- جلب ملف الترجمة من مجلد locales ---------- */
async function loadAndApplyLanguage(langCode) {
    try {
        const response = await fetch(`locales/${langCode}.json`);
        if (!response.ok) throw new Error(`Could not load ${langCode}.json`);
        
        const translations = await response.json();
        applyTranslations(langCode, translations);
        
    } catch (error) {
        console.error("Translation Error:", error);
        if (langCode !== 'ar') {
            loadAndApplyLanguage('ar'); // العودة للعربية عند الخطأ
        }
    }
}

/* ---------- تطبيق الترجمة على الصفحة ---------- */
function applyTranslations(langCode, t) {
    const meta = t._meta || { dir: 'ltr', code: langCode.toUpperCase() };

    currentLang = langCode;
    localStorage.setItem('tajalli_lang', langCode);

    document.documentElement.dir  = meta.dir;
    document.documentElement.lang = langCode;
    
    const langCodeEl = document.getElementById('currentLangCode');
    if (langCodeEl) langCodeEl.innerText = meta.code;

    document.querySelectorAll('.translatable').forEach(el => {
        const key = el.getAttribute('data-key');
        if (key && t[key] !== undefined) {
            el.innerText = t[key];
        }
    });

    document.querySelectorAll('#langDropdown a').forEach(a => {
        a.classList.toggle('active', a.dataset.lang === langCode);
    });

    if (t.hero_title) {
        document.title = `${t.hero_title} | Tajalli Plus`;
    }
}

/* ---------- ربط الأحداث برمجياً ---------- */
document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('langToggleBtn');
    const langDropdown = document.getElementById('langDropdown');

    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('hidden');
        });
    }

    document.querySelectorAll('#langDropdown a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = link.getAttribute('data-lang');
            loadAndApplyLanguage(lang);
            langDropdown.classList.add('hidden');
        });
    });

    window.addEventListener('click', (e) => {
        if (langDropdown && langBtn && !langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
            langDropdown.classList.add('hidden');
        }
    });

    // === التقاط لغة المتصفح تلقائياً ===
    if (!currentLang) {
        const browserLang = navigator.language || navigator.userLanguage; // مثل: ar-EG, en-US
        const primaryLang = browserLang.split('-')[0]; // استخراج 'ar' أو 'en'
        
        // اللغات المدعومة في موقعك
        const supportedLangs = ['ar', 'en', 'tr', 'fr', 'de', 'ru', 'hi'];
        
        if (supportedLangs.includes(primaryLang)) {
            currentLang = primaryLang; // إذا كانت لغة المتصفح مدعومة، استخدمها
        } else {
            currentLang = 'ar'; // وإلا استخدم العربية
        }
    }

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