const REPO = "Kava4/steam-suite";

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initHeaderScroll();
  initReveal();
  initFaq();
  initCopyButtons();
  loadLatestRelease();
  initSmoothAnchors();
});

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-panel");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    const open = panel.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      panel.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  items.forEach((el, i) => {
    el.style.setProperty("--delay", `${Math.min(i % 6, 5) * 70}ms`);
    observer.observe(el);
  });
}

function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((other) => {
        if (other !== item) other.classList.remove("open");
      });
      item.classList.toggle("open", !wasOpen);
      btn.setAttribute("aria-expanded", String(!wasOpen));
    });
  });
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const target = document.querySelector(btn.getAttribute("data-copy"));
      if (!target) return;
      const text = target.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        const label = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = label;
        }, 1600);
      } catch {
        btn.textContent = "Copy failed";
      }
    });
  });
}

async function loadLatestRelease() {
  const versionEl = document.getElementById("release-version");
  const dateEl = document.getElementById("release-date");
  const dlBtn = document.getElementById("download-btn");
  const heroBtn = document.getElementById("hero-download");

  const fallback = `https://github.com/${REPO}/releases/latest`;

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (!res.ok) throw new Error("no release");
    const data = await res.json();
    const tag = data.tag_name || "Latest";
    const date = data.published_at
      ? new Date(data.published_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

    if (versionEl) versionEl.textContent = tag;
    if (dateEl) dateEl.textContent = date ? `Published ${date}` : "";
    if (dlBtn) {
      dlBtn.href = data.html_url || fallback;
      dlBtn.removeAttribute("aria-disabled");
    }
    if (heroBtn) heroBtn.href = data.html_url || fallback;

    const asset =
      data.assets?.find((a) => /Steam-Suite/i.test(a.name) && /\.exe$/i.test(a.name)) ||
      data.assets?.find((a) => /\.exe$/i.test(a.name));
    if (asset && dlBtn) {
      dlBtn.href = asset.browser_download_url;
      const sizeMb = (asset.size / (1024 * 1024)).toFixed(1);
      const sizeEl = document.getElementById("release-size");
      if (sizeEl) sizeEl.textContent = `${sizeMb} MB portable`;
    }
  } catch {
    if (versionEl) versionEl.textContent = "Coming soon";
    if (dateEl) dateEl.textContent = "Publish a release on GitHub to enable direct download";
    if (dlBtn) dlBtn.href = fallback;
    if (heroBtn) heroBtn.href = fallback;
  }
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}
