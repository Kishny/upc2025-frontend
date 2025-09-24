function createCookieBanner() {
  if (localStorage.getItem("cookiesAccepted") !== null) return;

  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.style.position = "fixed";
  banner.style.bottom = "0";
  banner.style.left = "0";
  banner.style.width = "100%";
  banner.style.backgroundColor = "#f8f9fa";
  banner.style.borderTop = "1px solid #dee2e6";
  banner.style.padding = "1rem";
  banner.style.display = "flex";
  banner.style.flexWrap = "wrap";
  banner.style.justifyContent = "space-between";
  banner.style.alignItems = "center";
  banner.style.zIndex = "9999";
  banner.style.boxShadow = "0 -2px 10px rgba(0,0,0,0.1)";

  const text = document.createElement("span");
  text.innerHTML =
    "Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre <a href='#' style='color: #007bff;'>politique de cookies</a>.";
  text.style.marginRight = "1rem";
  text.style.flex = "1";
  banner.appendChild(text);

  const buttons = document.createElement("div");
  buttons.style.display = "flex";
  buttons.style.gap = "0.5rem";

  const acceptBtn = document.createElement("button");
  acceptBtn.textContent = "Accepter";
  acceptBtn.className = "btn btn-primary";
  acceptBtn.style.padding = "0.5rem 1rem";

  const refuseBtn = document.createElement("button");
  refuseBtn.textContent = "Refuser";
  refuseBtn.className = "btn btn-secondary";
  refuseBtn.style.padding = "0.5rem 1rem";

  acceptBtn.onclick = () => {
    localStorage.setItem("cookiesAccepted", "true");
    banner.remove();
  };

  refuseBtn.onclick = () => {
    localStorage.setItem("cookiesAccepted", "false");
    banner.remove();
  };

  buttons.appendChild(acceptBtn);
  buttons.appendChild(refuseBtn);
  banner.appendChild(buttons);

  document.body.appendChild(banner);
}

document.addEventListener("DOMContentLoaded", createCookieBanner);
