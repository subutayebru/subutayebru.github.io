// main.js
const btn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

if (btn && nav) {
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  });
}
