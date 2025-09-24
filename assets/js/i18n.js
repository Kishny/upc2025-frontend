/* =========================
   I18N.JS — Translation Module
========================= */
const I18N_ENABLED = true; // ✅ activer la traduction

const I18N = (function () {
  let currentLang = localStorage.getItem("lang") || "fr";
  let translations = {};

  // Charger le fichier JSON de traduction
  async function load(lang) {
    if (!I18N_ENABLED) return;
    try {
      const res = await fetch(`assets/i18n/${lang}.json`);
      if (!res.ok) throw new Error("JSON introuvable");
      translations = await res.json();
      currentLang = lang;
      localStorage.setItem("lang", lang);
      applyTranslations();
      updateToggleBtn();
      updatePageTitle();
      updateMetaTags();
    } catch (err) {
      console.error("❌ Erreur chargement traductions :", err);
    }
  }

  // Appliquer les traductions
  function applyTranslations() {
    if (!I18N_ENABLED) return;

    // Texte normal
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = get(key);
      if (text !== undefined) {
        // Pour <option>, on doit écraser textContent
        if (el.tagName.toLowerCase() === "option") {
          el.textContent = text;
        } else {
          el.textContent = text;
        }
      }
    });

    // Placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const text = get(key);
      if (text !== undefined) el.setAttribute("placeholder", text);
    });

    // Alt images
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      const text = get(key);
      if (text !== undefined) el.setAttribute("alt", text);
    });
  }

  // Traduire le <title>
  function updatePageTitle() {
    const titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) {
      const key = titleEl.getAttribute("data-i18n");
      const text = get(key);
      if (text !== undefined) titleEl.textContent = text;
    }
  }

  // Traduire les <meta>
  function updateMetaTags() {
    document.querySelectorAll("meta[data-i18n-meta]").forEach((meta) => {
      const key = meta.getAttribute("data-i18n-meta");
      const text = get(key);
      if (text !== undefined) {
        meta.setAttribute("content", text);
      }
    });
  }

  // Récupérer une traduction
  function get(key) {
    return translations[key] ?? key;
  }

  // Basculer de langue (FR <-> EN uniquement)
  function toggle() {
    const langs = ["fr", "en"];
    let idx = langs.indexOf(currentLang);
    if (idx === -1) idx = 0;
    const newLang = langs[(idx + 1) % langs.length];
    load(newLang);
  }

  // Afficher FR/EN avec code couleur
  function updateToggleBtn() {
    const langToggleBtn = document.getElementById("langToggle");
    if (langToggleBtn) {
      if (currentLang === "fr") {
        langToggleBtn.innerHTML = `<span class="lang-active show">FR</span> / <span class="lang-inactive show">EN</span>`;
      } else {
        langToggleBtn.innerHTML = `<span class="lang-inactive show">FR</span> / <span class="lang-active show">EN</span>`;
      }
    }
  }
  return {
    currentLang,
    load,
    get,
    toggle,
  };
})();

/* =========================
   INITIALISATION
========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (I18N_ENABLED) {
    I18N.load(I18N.currentLang);

    const langToggleBtn = document.getElementById("langToggle");
    if (langToggleBtn) {
      langToggleBtn.addEventListener("click", () => {
        console.log("🌍 Langue avant toggle :", I18N.currentLang);
        I18N.toggle();
      });
    }
  } else {
    console.log("⚠️ I18N désactivé — texte original affiché.");
  }
});
