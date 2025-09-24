/* =========================
   CONFIGURATION BASE_URL
========================= */
let BASE_URL = "";

const hostname = location.hostname;
console.log("🌍 Host détecté :", hostname);

// Vérifier s'il y a une meta backend-url dans l'HTML
const backendMeta = document.querySelector('meta[name="backend-url"]');
if (backendMeta) {
  BASE_URL = backendMeta.content;
  console.log("⚡ BASE_URL défini depuis <meta> :", BASE_URL);
} else if (["127.0.0.1", "localhost"].includes(hostname)) {
  BASE_URL = "http://127.0.0.1:4000";
  console.log("💻 Mode LOCALHOST →", BASE_URL);
} else if (/^192\.168\./.test(hostname)) {
  BASE_URL = `http://${hostname}:4000`;
  console.log("📡 Mode LAN →", BASE_URL);
} else {
  BASE_URL = "https://upc2025-backend-fa27ebdd4f06.herokuapp.com";
  console.log("🚀 Mode PRODUCTION →", BASE_URL);
}

console.log("✅ BASE_URL final :", BASE_URL);

/* =========================
   NOTIFICATION
========================= */
function showNotification(message, type = "success") {
  const oldNotif = document.getElementById("custom-alert");
  if (oldNotif) oldNotif.remove();

  const notif = document.createElement("div");
  notif.id = "custom-alert";
  notif.textContent = message;
  notif.style.position = "fixed";
  notif.style.top = "20px";
  notif.style.right = "-400px";
  notif.style.zIndex = "9999";
  notif.style.padding = "15px 20px";
  notif.style.borderRadius = "6px";
  notif.style.fontFamily = "Arial, sans-serif";
  notif.style.color = "#fff";
  notif.style.fontSize = "15px";
  notif.style.boxShadow = "0 3px 6px rgba(0,0,0,0.2)";
  notif.style.opacity = "0";
  notif.style.transition = "all 0.6s ease";
  notif.style.backgroundColor =
    type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#6c757d";

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.right = "20px";
    notif.style.opacity = "1";
  }, 50);

  setTimeout(() => {
    notif.style.right = "-400px";
    notif.style.opacity = "0";
    setTimeout(() => notif.remove(), 600);
  }, 4000);
}

/* =========================
   FETCH SÛR
========================= */
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status} → ${text}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Erreur fetch ${url}:`, error);
    throw error;
  }
}

/* =========================
   TEST BACKEND
========================= */
async function testBackend() {
  try {
    console.log("🔍 Test connexion →", `${BASE_URL}/api/test-cors`);

    const testRes = await fetch(`${BASE_URL}/api/test-cors`);
    if (!testRes.ok) throw new Error(`HTTP ${testRes.status} - Test CORS`);
    const testData = await testRes.json();
    console.log("✅ Test CORS OK :", testData);

    const membersRes = await fetch(`${BASE_URL}/api/members`);
    if (!membersRes.ok) throw new Error(`HTTP ${membersRes.status} - Members`);
    const membersData = await membersRes.json();
    console.log("✅ Backend OK, membres :", membersData.members.length);

    showNotification("✅ Connexion au serveur établie", "success");
  } catch (err) {
    console.error("❌ Backend inaccessible :", err.message);

    let errorMsg = "Impossible de joindre le serveur";
    if (err.message.includes("CORS")) {
      errorMsg = "⚠️ Erreur CORS → vérifier whitelist backend";
    } else if (err.message.includes("Failed to fetch")) {
      errorMsg = "⚠️ Serveur indisponible ou mauvais BASE_URL";
    }

    showNotification(errorMsg, "error");
  }
}

/* =========================
   INIT DOM
========================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM chargé → app.js lancé");
  testBackend();

  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("open");
      burger.classList.toggle("burger--active");
    });
  }

  /* =========================
   FORMULAIRE D'ADHÉSION AMÉLIORÉ
  ========================= */
  const form = document.getElementById("form-adhesion");
  const orgFields = document.querySelector(".org-only");
  const downloadBtn = document.getElementById("download-form");
  const shareButtons = document.getElementById("share-buttons");

  if (form) {
    console.log("📝 Formulaire d'adhésion trouvé");

    const submitBtn = form.querySelector('button[type="submit"]');
    const memberTypeRadios = document.querySelectorAll(
      'input[name="member_type"]'
    );
    const modeRadios = document.querySelectorAll(
      'input[name="inscription_mode"]'
    );

    function updateFormDisplay() {
      const memberType = document.querySelector(
        'input[name="member_type"]:checked'
      )?.value;
      console.log("🔄 Type de membre sélectionné :", memberType);

      if (memberType === "organization") {
        orgFields.style.display = "flex";
        const orgNameField = document.querySelector('input[name="org_name"]');
        if (orgNameField) orgNameField.required = true;
      } else {
        orgFields.style.display = "none";
        const orgNameField = document.querySelector('input[name="org_name"]');
        if (orgNameField) orgNameField.required = false;
      }

      if (downloadBtn) downloadBtn.style.display = "none";
      if (shareButtons) shareButtons.style.display = "none";
    }

    memberTypeRadios.forEach((r) =>
      r.addEventListener("change", updateFormDisplay)
    );
    modeRadios.forEach((r) => r.addEventListener("change", updateFormDisplay));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("🚀 Formulaire soumis !");

      let isValid = true;
      form.querySelectorAll("input, select").forEach((inp) => {
        if (inp.required && !inp.value.trim()) {
          inp.style.borderColor = "red";
          console.warn("⚠️ Champ manquant :", inp.name);
          isValid = false;
        } else inp.style.borderColor = "";
      });

      if (!isValid) {
        showNotification(
          "⚠️ Merci de remplir tous les champs obligatoires.",
          "error"
        );
        return;
      }

      const formData = Object.fromEntries(new FormData(form));
      formData.inscription_mode = document.querySelector(
        'input[name="inscription_mode"]:checked'
      )?.value;
      formData.member_type = document.querySelector(
        'input[name="member_type"]:checked'
      )?.value;

      console.log("📦 Données envoyées au backend :", formData);

      const mode = formData.inscription_mode;
      console.log("📝 Mode sélectionné :", mode);

      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi…";

      try {
        const result = await safeFetch(`${BASE_URL}/api/join`, {
          method: "POST",
          body: JSON.stringify(formData),
        });

        console.log("✅ Réponse backend :", result);

        // Vérifie que le backend a renvoyé ok:true
        if (!result.ok) {
          throw new Error(result.error || "Erreur serveur");
        }

        // Mode online avec certificat
        if (mode === "online" && result.certificate_url) {
          let fullUrl = result.certificate_url;
          if (!/^http/.test(fullUrl)) {
            fullUrl = `${BASE_URL}${result.certificate_url}`;
          }
          downloadBtn.textContent = "Télécharger mon certificat";
          downloadBtn.href = fullUrl;
          downloadBtn.download = `certificat_${formData.name}.pdf`;
          downloadBtn.style.display = "inline-block";

          const message = `Je viens d'adhérer à l'UPC 2025 🇨🇲 ! Rejoins-moi : https://www.unionpourlechangement.org/adhesion`;
          shareButtons.innerHTML = `
            <p>🎉 Merci pour ton adhésion ! Partage maintenant :</p>
            <a class="btn btn--whatsapp" target="_blank" href="https://wa.me/?text=${encodeURIComponent(
              message
            )}">WhatsApp</a>
            <a class="btn btn--facebook" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              "https://www.unionpourlechangement.org/adhesion"
            )}">Facebook</a>
          `;
          shareButtons.style.display = "block";

          showNotification(
            "✅ Adhésion enregistrée. Certificat envoyé par mail.",
            "success"
          );
        }

        // Mode papier → loader + redirection
        if (mode === "paper" && result.redirect) {
          const overlay = document.createElement("div");
          overlay.style.cssText =
            "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;font-family:Arial,sans-serif;";
          overlay.innerHTML = `
            <div style="border:6px solid #f3f3f3;border-top:6px solid #007A5E;border-radius:50%;width:60px;height:60px;animation:spin 1s linear infinite;"></div>
            <p style="margin-top:20px;font-size:18px;color:#333;">
              Merci pour votre adhésion 🙏<br>Vous allez être redirigé vers le formulaire papier...
            </p>
          `;
          const style = document.createElement("style");
          style.innerHTML = `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(style);
          document.body.appendChild(overlay);

          setTimeout(() => {
            window.location.href = result.redirect;
          }, 3000);
        }
      } catch (err) {
        console.error("❌ Erreur durant l'adhésion :", err);
        let errorMessage = "Erreur lors de l'adhésion";
        if (err.message.includes("CORS") || err.message.includes("Failed")) {
          errorMessage = "⚠️ Problème de connexion au serveur.";
        }
        showNotification(errorMessage, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Envoyer";
      }
    });

    updateFormDisplay();
  }

  /* =========================
     FORMULAIRE CONTACT
  ========================= */
  const contactForm = document.getElementById("form-contact");
  if (contactForm) {
    const alertBox = contactForm.querySelector(".form__alert");
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      let isValid = true;
      contactForm.querySelectorAll("input, textarea").forEach((input) => {
        if (input.required && !input.value.trim()) {
          input.style.borderColor = "red";
          isValid = false;
        } else input.style.borderColor = "";
      });

      if (!isValid) {
        alertBox.hidden = false;
        alertBox.textContent = "Merci de remplir tous les champs obligatoires.";
        alertBox.style.borderColor = "#CE1126";
        return;
      }

      try {
        const data = Object.fromEntries(new FormData(contactForm));
        const result = await safeFetch(`${BASE_URL}/api/contact`, {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (result.ok) {
          alertBox.hidden = false;
          alertBox.textContent = "Merci ! Votre message a été envoyé.";
          alertBox.style.borderColor = "#007A5E";
          contactForm.reset();
        } else {
          alertBox.hidden = false;
          alertBox.textContent = `Erreur : ${result.error || "Serveur"}`;
          alertBox.style.borderColor = "#CE1126";
        }
      } catch (err) {
        console.error("❌ Erreur contact :", err);
        alertBox.hidden = false;
        alertBox.textContent =
          "⚠️ Impossible de contacter le serveur (route /api/contact manquante ?)";
        alertBox.style.borderColor = "#CE1126";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Envoyer";
      }
    });
  }

  /* =========================
     COOKIES SITE
  ========================= */
  if (!localStorage.getItem("cookiesAccepted")) {
    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.style.cssText =
      "position:fixed;bottom:0;left:0;width:100%;background:#f8f9fa;border-top:1px solid #dee2e6;padding:1rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;z-index:9999;box-shadow:0 -2px 10px rgba(0,0,0,0.1)";
    banner.innerHTML = `
      <span style="flex:1;margin-right:1rem;">
        Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre <a href='#' style='color:#007bff;'>politique de cookies</a>.
      </span>
      <div style="display:flex;gap:0.5rem;">
        <button class="btn btn-primary" style="padding:0.5rem 1rem;">Accepter</button>
        <button class="btn btn-secondary" style="padding:0.5rem 1rem;">Refuser</button>
      </div>
    `;
    const [acceptBtn, refuseBtn] = banner.querySelectorAll("button");
    acceptBtn.onclick = () => {
      localStorage.setItem("cookiesAccepted", "true");
      banner.remove();
    };
    refuseBtn.onclick = () => {
      localStorage.setItem("cookiesAccepted", "false");
      banner.remove();
    };
    document.body.appendChild(banner);
  }
});
