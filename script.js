/* ==========================================================================
   DORIS N. PORTFOLIO — behaviour
   Sections: 1) typing effect  2) scroll reveal (slide from sides)
   3) nav active-state + mobile toggle  4) gallery lightbox
   ========================================================================== */

document.getElementById('year').textContent = new Date().getFullYear();

/* -------------------------------------------------------------
   1) TYPING EFFECT — serial-monitor style boot log with the name
   Edit the `lines` array to change what gets typed.
------------------------------------------------------------- */
(function typeEffect() {
  const target = document.getElementById('typeTarget');
  const cursorEl = document.getElementById('typeCursor');

  const lines = [
    { text: "$ whoami", cls: "prompt" },
    { text: "Doris N.", cls: "type-name" },
    { text: "$ role --current", cls: "prompt" },
    { text: "Electrical & Computer Engineering student, UCT", cls: "" },
    { text: "$ status", cls: "prompt" },
    { text: "Building RuView — WiFi CSI motion sensing mesh_", cls: "" }
  ];

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    target.innerHTML = lines.map(l => `<span class="${l.cls}">${l.text}</span>`).join('<br>');
    return;
  }

  target.innerHTML = '';
  let lineIndex = 0;
  let charIndex = 0;
  let current = document.createElement('span');
  target.appendChild(current);
  target.appendChild(cursorEl);

  function typeChar() {
    if (lineIndex >= lines.length) return;
    const line = lines[lineIndex];
    current.className = line.cls;

    if (charIndex < line.text.length) {
      current.textContent += line.text.charAt(charIndex);
      charIndex++;
      target.insertBefore(document.createTextNode(''), cursorEl);
      setTimeout(typeChar, 26 + Math.random() * 35);
    } else {
      lineIndex++;
      charIndex = 0;
      if (lineIndex < lines.length) {
        target.insertBefore(document.createElement('br'), cursorEl);
        current = document.createElement('span');
        target.insertBefore(current, cursorEl);
        setTimeout(typeChar, 380);
      }
    }
  }

  setTimeout(typeChar, 500);
})();

/* -------------------------------------------------------------
   2) SCROLL REVEAL — elements with class "reveal" slide in
   from-left / from-right / from-up when they enter the viewport
------------------------------------------------------------- */
(function scrollReveal() {
  const items = document.querySelectorAll('.reveal');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* -------------------------------------------------------------
   3) NAV — mobile toggle + active-section highlighting
------------------------------------------------------------- */
(function nav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });

    sections.forEach(sec => navObserver.observe(sec));
  }
})();

/* -------------------------------------------------------------
   4) GALLERY LIGHTBOX — click a tile to view it larger
   Works for both <img> and <video> (set data-type="video")
------------------------------------------------------------- */
(function lightbox() {
  const lb = document.getElementById('lightbox');
  const inner = document.getElementById('lightboxInner');
  const closeBtn = document.getElementById('lightboxClose');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.full;
      const type = item.dataset.type || 'image';
      inner.innerHTML = type === 'video'
        ? `<video src="${src}" controls autoplay></video>`
        : `<img src="${src}" alt="">`;
      lb.classList.add('open');
    });
  });

  function close() {
    lb.classList.remove('open');
    inner.innerHTML = '';
  }
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();
