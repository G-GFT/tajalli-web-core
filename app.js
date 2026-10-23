// === app.js : محرك التطبيق ===

let currentLang = localStorage.getItem('tajalli_lang');

/* ---------- جلب ملف الترجمة ---------- */
async function loadAndApplyLanguage(langCode) {
    try {
        const response = await fetch(`locales/${langCode}.json`);
        if (!response.ok) throw new Error(`Could not load ${langCode}.json`);
        
        const translations = await response.json();
        applyTranslations(langCode, translations);
    } catch (error) {
        console.error("Translation Error:", error);
        if (langCode !== 'ar') loadAndApplyLanguage('ar');
    }
}

/* ---------- تطبيق الترجمة ---------- */
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
    const muteBtn = document.getElementById('muteBtn');
    const audio = document.getElementById('welcomeSound');

    // 1. قائمة اللغات
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

    // 2. زر كتم الصوت
    if (muteBtn && audio) {
        muteBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                muteBtn.innerText = "🔊";
            } else {
                audio.pause();
                muteBtn.innerText = "🔇";
            }
        });
    }

    // 3. لغة المتصفح
    if (!currentLang) {
        const browserLang = (navigator.language || navigator.userLanguage).split('-')[0];
        const supportedLangs = ['ar', 'en', 'tr', 'fr', 'de', 'ru', 'hi'];
        currentLang = supportedLangs.includes(browserLang) ? browserLang : 'ar';
    }

    loadAndApplyLanguage(currentLang);
});

/* ---------- شاشة البداية + تشغيل الصوت ---------- */
window.addEventListener('load', () => {
    const splash = document.getElementById('splashScreen');
    const audio = document.getElementById('welcomeSound');
    let audioPlayed = false;

    const playAudio = () => {
        if (audio && !audioPlayed) {
            audio.play().then(() => {
                audioPlayed = true;
            }).catch(err => console.log("Audio play blocked:", err));
        }
    };

    // محاولة تشغيل الصوت
    playAudio();

    // إذا منع المتصفح التشغيل التلقائي، نفعله عند أول نقرة
    document.body.addEventListener('click', playAudio, { once: true });
    document.body.addEventListener('touchstart', playAudio, { once: true });

    // إخفاء شاشة البداية
    if (splash) {
        setTimeout(() => {
            splash.classList.add('splash-hide');
            setTimeout(() => splash.remove(), 800);
        }, 2200);
    }
});