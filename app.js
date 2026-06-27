const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const form = document.querySelector("#lead-form");
const statusMessage = document.querySelector("#form-status");

document.querySelector("#year").textContent = new Date().getFullYear();

menuButton.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusMessage.className = "form-status";

  if (!form.checkValidity()) {
    form.reportValidity();
    statusMessage.textContent = "Please complete the required fields.";
    statusMessage.classList.add("error");
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  if (data.website) return;

  const endpoint = window.SITE_CONFIG?.googleScriptUrl?.trim();
  if (!endpoint) {
    statusMessage.textContent = "The inquiry form is ready, but the Google Sheet connection still needs its deployment URL.";
    statusMessage.classList.add("error");
    return;
  }

  const button = form.querySelector("button[type='submit']");
  const originalLabel = button.innerHTML;
  button.disabled = true;
  button.innerHTML = "<span>Sending...</span>";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...data, source: window.location.href })
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Submission failed");

    form.reset();
    statusMessage.textContent = "Thank you. Your inquiry has been sent successfully.";
    statusMessage.classList.add("success");
  } catch (error) {
    statusMessage.textContent = "Your inquiry could not be sent. Please call or email us instead.";
    statusMessage.classList.add("error");
  } finally {
    button.disabled = false;
    button.innerHTML = originalLabel;
  }
});
