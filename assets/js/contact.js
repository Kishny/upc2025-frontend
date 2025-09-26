/* =========================
   FORMULAIRE CONTACT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-contact");
  if (!form) return; // ⛔️ stoppe si la page n'a pas ce formulaire

  const alertBox = form.querySelector(".form__alert");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("http://localhost:4000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok && json.ok) {
        alertBox.hidden = false;
        alertBox.className = "form__alert success";
        alertBox.innerHTML = `✅ ${
          json.message || "Message envoyé avec succès !"
        }`;
        setTimeout(() => {
          form.reset();
          alertBox.hidden = true;
        }, 2500);
      } else {
        alertBox.hidden = false;
        alertBox.className = "form__alert error";
        alertBox.innerHTML = `⚠️ Erreur : ${
          json.error || "Impossible d’envoyer le message."
        }`;
      }
    } catch (err) {
      alertBox.hidden = false;
      alertBox.className = "form__alert error";
      alertBox.innerHTML = `❌ Erreur réseau : ${err.message}`;
    }
  });
});
