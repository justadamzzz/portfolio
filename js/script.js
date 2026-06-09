const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const themeToggle = document.querySelector(".theme-toggle");
const toggleIcon = document.querySelector(".toggle-icon");
const visitorCount = document.querySelector("#visitor-count");
const typingText = document.querySelector("#typing-text");
const backToTop = document.querySelector(".back-to-top");
const downloadCv = document.querySelector("#download-cv");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const searchInput = document.querySelector("#project-search");
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll("[data-project-card]");
const projectEmpty = document.querySelector("#project-empty");
const jetLayer = document.querySelector("#jet-mini-game-layer");
const jetScore = document.querySelector("#jet-score");

const savedTheme = localStorage.getItem("portfolioTheme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
}

function updateThemeIcon() {
  if (!toggleIcon) return;
  toggleIcon.textContent = document.body.classList.contains("dark-mode") ? "LM" : "DM";
}

updateThemeIcon();

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll(".nav-menu a").forEach((link) => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("portfolioTheme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    updateThemeIcon();
  });
}

document.querySelectorAll(".profile-image").forEach((image) => {
  image.addEventListener("error", () => {
    const fallback = image.dataset.fallback;
    if (fallback && image.src.indexOf(fallback) === -1) {
      image.src = fallback;
    }
  });
});

document.querySelectorAll(".skill-card").forEach((card) => {
  const level = card.dataset.level || "80";
  const fill = card.querySelector(".skill-fill");
  const label = card.querySelector(".skill-header strong");
  const bar = card.querySelector(".skill-bar");

  if (label) {
    label.textContent = `${level}%`;
  }

  if (bar) {
    bar.setAttribute("aria-valuenow", level);
  }

  if (fill) {
    fill.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.width = `${level}%`;
      });
    });
  }
});

// Academic Journey animations for GPA counters and semester progress cards.
document.querySelectorAll(".gpa-counter").forEach((counter) => {
  const target = Number(counter.dataset.gpa || "0");
  const duration = 1100;
  const startTime = performance.now();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setCounter(value) {
    counter.textContent = value.toFixed(2);
  }

  if (reduceMotion) {
    setCounter(target);
    return;
  }

  function animateCounter(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setCounter(target * eased);

    if (progress < 1) {
      requestAnimationFrame(animateCounter);
    }
  }

  requestAnimationFrame(animateCounter);
});

document.querySelectorAll(".semester-card").forEach((card) => {
  const gpa = Number(card.dataset.gpa || "0");
  const fill = card.querySelector(".semester-fill");
  const percentage = Math.min((gpa / 4) * 100, 100);

  if (fill) {
    fill.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.width = `${percentage}%`;
      });
    });
  }
});

if (visitorCount) {
  const visits = Number(localStorage.getItem("portfolioVisits") || "0") + 1;
  localStorage.setItem("portfolioVisits", String(visits));
  visitorCount.textContent = String(visits);
}

// Flying Jet Mini Game Background: lightweight animated target with a saved local score.
function initJetMiniGame() {
  if (!jetLayer || !jetScore) return;

  const scoreKey = "jetsHitScore";
  const jetWidth = 58;
  const jetHeight = 44;
  let score = Number(localStorage.getItem(scoreKey) || "0");
  let jet = null;
  let frameId = null;
  let spawnTimer = null;
  let lastFrameTime = 0;
  let speed = 130;
  let position = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };

  function updateMiniGameUi() {
    jetScore.textContent = `Jets: ${score}`;
  }

  function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomPosition() {
    const margin = 20;
    const maxX = Math.max(margin, window.innerWidth - jetWidth - margin);
    const maxY = Math.max(110, window.innerHeight - jetHeight - 88);

    return {
      x: randomNumber(margin, maxX),
      y: randomNumber(96, maxY)
    };
  }

  function setNewTarget() {
    target = randomPosition();
    speed = randomNumber(90, 175);
  }

  function buildJet() {
    const jetButton = document.createElement("button");
    jetButton.className = "pixel-jet";
    jetButton.type = "button";
    jetButton.setAttribute("tabindex", "-1");
    jetButton.setAttribute("aria-label", "Flying jet target");
    jetButton.innerHTML = `
      <svg viewBox="0 0 58 44" aria-hidden="true" focusable="false">
        <rect x="8" y="18" width="34" height="8" fill="#35d9ff"/>
        <rect x="28" y="10" width="10" height="24" fill="#00aeea"/>
        <rect x="40" y="14" width="10" height="16" fill="#8beaff"/>
        <rect x="4" y="20" width="8" height="4" fill="#007ca8"/>
        <rect x="16" y="8" width="10" height="8" fill="#35d9ff"/>
        <rect x="16" y="28" width="10" height="8" fill="#35d9ff"/>
        <rect x="50" y="19" width="6" height="6" fill="#ffffff"/>
      </svg>
    `;
    return jetButton;
  }

  function renderJet(angle) {
    if (!jet) return;
    jet.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) rotate(${angle}rad)`;
  }

  function animateJet(time) {
    if (!jet) return;

    if (!lastFrameTime) lastFrameTime = time;
    const delta = Math.min((time - lastFrameTime) / 1000, 0.05);
    lastFrameTime = time;

    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 10) {
      setNewTarget();
    } else {
      const step = Math.min(distance, speed * delta);
      position.x += (dx / distance) * step;
      position.y += (dy / distance) * step;
      renderJet(Math.atan2(dy, dx));
    }

    frameId = requestAnimationFrame(animateJet);
  }

  function clearJet() {
    if (frameId) cancelAnimationFrame(frameId);
    if (spawnTimer) clearTimeout(spawnTimer);
    frameId = null;
    spawnTimer = null;
    lastFrameTime = 0;

    if (jet) {
      jet.remove();
      jet = null;
    }
  }

  function spawnJet() {
    if (jet) return;

    position = randomPosition();
    setNewTarget();
    jet = buildJet();
    jetLayer.appendChild(jet);
    renderJet(0);
    frameId = requestAnimationFrame(animateJet);
  }

  function createExplosion(x, y) {
    const ring = document.createElement("span");
    ring.className = "jet-blast-ring";
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.style.animation = "jet-ring-burst 560ms ease-out forwards";
    jetLayer.appendChild(ring);

    for (let index = 0; index < 16; index += 1) {
      const particle = document.createElement("span");
      const angle = (Math.PI * 2 * index) / 16;
      const distance = randomNumber(22, 70);
      particle.className = "jet-particle";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty("--particle-x", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--particle-y", `${Math.sin(angle) * distance}px`);
      particle.style.animation = `jet-particle-burst ${randomNumber(420, 720)}ms ease-out forwards`;
      jetLayer.appendChild(particle);
      setTimeout(() => particle.remove(), 760);
    }

    setTimeout(() => ring.remove(), 620);
  }

  function hitJet() {
    if (!jet) return;

    const explosionX = position.x + jetWidth / 2;
    const explosionY = position.y + jetHeight / 2;
    clearJet();
    createExplosion(explosionX, explosionY);

    score += 1;
    localStorage.setItem(scoreKey, String(score));
    updateMiniGameUi();

    spawnTimer = setTimeout(spawnJet, randomNumber(1000, 2000));
  }

  function isInteractiveTarget(targetElement) {
    if (!(targetElement instanceof Element)) return false;
    return Boolean(targetElement.closest(".mini-game-panel, a, button, input, textarea, select, label"));
  }

  // The jet sits visually behind content, so clicks are detected by screen coordinates.
  function handlePointerHit(event) {
    if (!jet || isInteractiveTarget(event.target)) return;

    const withinX = event.clientX >= position.x && event.clientX <= position.x + jetWidth;
    const withinY = event.clientY >= position.y && event.clientY <= position.y + jetHeight;

    if (withinX && withinY) {
      hitJet();
    }
  }

  window.addEventListener("resize", () => {
    if (!jet) return;
    position.x = Math.max(20, Math.min(position.x, window.innerWidth - jetWidth - 20));
    position.y = Math.max(96, Math.min(position.y, window.innerHeight - jetHeight - 20));
    setNewTarget();
  });

  document.addEventListener("pointerdown", handlePointerHit);

  updateMiniGameUi();
  spawnJet();
}

initJetMiniGame();

if (typingText) {
  const words = ["Computer Science Student", "Software Developer", "Future AI Engineer"];
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeLoop() {
    const word = words[wordIndex];
    typingText.textContent = deleting ? word.slice(0, charIndex - 1) : word.slice(0, charIndex + 1);
    charIndex += deleting ? -1 : 1;

    if (!deleting && charIndex === word.length) {
      deleting = true;
      setTimeout(typeLoop, 1100);
      return;
    }

    if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
    }

    setTimeout(typeLoop, deleting ? 45 : 85);
  }

  typeLoop();
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (downloadCv) {
  downloadCv.addEventListener("click", (event) => {
    event.preventDefault();
    alert("CV download placeholder. Add your PDF later and update this link.");
  });
}

document.querySelectorAll(".placeholder-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    alert("Placeholder link. Replace this with your real GitHub or demo URL.");
  });
});

document.querySelectorAll(".read-more").forEach((button) => {
  button.addEventListener("click", () => {
    const post = button.closest(".post-card");
    const extra = post ? post.querySelector(".post-extra") : null;
    if (!extra) return;

    const isHidden = extra.hasAttribute("hidden");
    if (isHidden) {
      extra.removeAttribute("hidden");
      button.textContent = "Show less";
    } else {
      extra.setAttribute("hidden", "");
      button.textContent = "Read more";
    }
  });
});

let activeFilter = "all";

function filterProjects() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const category = card.dataset.category || "";
    const keywords = `${card.textContent} ${card.dataset.keywords || ""}`.toLowerCase();
    const matchesFilter = activeFilter === "all" || category === activeFilter;
    const matchesSearch = !query || keywords.includes(query);
    const shouldShow = matchesFilter && matchesSearch;

    card.hidden = !shouldShow;
    if (shouldShow) visibleCount += 1;
  });

  if (projectEmpty) {
    projectEmpty.hidden = visibleCount !== 0;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter || "all";
    filterProjects();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", filterProjects);
}

function setFieldError(input, message) {
  const group = input.closest(".field-group");
  const error = group ? group.querySelector(".field-error") : null;
  if (error) error.textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = contactForm.elements.name;
    const email = contactForm.elements.email;
    const subject = contactForm.elements.subject;
    const message = contactForm.elements.message;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    [name, email, subject, message].forEach((input) => setFieldError(input, ""));

    if (name.value.trim().length < 2) {
      setFieldError(name, "Please enter your name.");
      isValid = false;
    }

    if (!emailPattern.test(email.value.trim())) {
      setFieldError(email, "Please enter a valid email address.");
      isValid = false;
    }

    if (subject.value.trim().length < 3) {
      setFieldError(subject, "Please enter a subject.");
      isValid = false;
    }

    if (message.value.trim().length < 10) {
      setFieldError(message, "Please write a message with at least 10 characters.");
      isValid = false;
    }

    if (!isValid) {
      formStatus.textContent = "Please fix the highlighted fields.";
      return;
    }

    formStatus.textContent = "Message validated successfully. This frontend-only demo does not send email yet.";
    contactForm.reset();
  });
}
