/* ==========================================================================
   TLANGELANI D. TEMBE PORTFOLIO — behaviour
   Sections: 1) typing effect  2) scroll reveal (slide from sides)
   3) nav active-state + mobile toggle  4) media stacks  5) CV viewer
   6) gallery lightbox
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
    { text: "Tlangelani D. Tembe", cls: "type-name" },
    { text: "$ role --current", cls: "prompt" },
    { text: "Electrical & Computer Engineering student", cls: "" },
    { text: "$ status", cls: "prompt" },
    { text: "Former IEEE UCT Treasurer & Vice Chairperson_", cls: "" }
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
   4) MEDIA STACKS — cycle through multiple photos/videos per
   project. Each .media-stack holds several .stack-item elements;
   clicking the arrows rotates which one sits on top with a
   cinematic shuffle transition. Videos autoplay (muted) once
   they reach the front. See README.md for how to add items.
------------------------------------------------------------- */
(function mediaStacks() {
  document.querySelectorAll('.media-stack').forEach(stack => {
    const items = Array.from(stack.querySelectorAll('.stack-item'));
    const dots = Array.from(stack.querySelectorAll('.stack-dots span'));
    const nextBtn = stack.querySelector('.stack-arrow.next');
    const prevBtn = stack.querySelector('.stack-arrow.prev');
    const captionEl = stack.querySelector('.stack-caption');
    if (items.length < 2) return; // nothing to cycle

    // "order" holds the items' indices from front-to-back of the deck
    let order = items.map((_, i) => i);

    function render(transitioning) {
      items.forEach((el, idx) => {
        const pos = order.indexOf(idx);
        el.dataset.pos = pos <= 3 ? String(pos) : 'hidden';
        el.classList.toggle('is-transitioning', !!transitioning);

        const vid = el.querySelector('video');
        if (vid) {
          if (pos === 0) {
            const p = vid.play();
            if (p && p.catch) p.catch(() => {}); // ignore autoplay rejection
          } else if (!vid.paused) {
            vid.pause();
          }
        }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === order[0]));
      if (captionEl) {
        const frontEl = items[order[0]];
        captionEl.textContent = frontEl.dataset.caption || '';
        captionEl.style.display = frontEl.dataset.caption ? '' : 'none';
      }
    }

    function goNext() {
      order.push(order.shift()); // front item moves to the back of the deck
      render(true);
      setTimeout(() => render(false), 40);
    }
    function goPrev() {
      order.unshift(order.pop()); // back item moves to the front of the deck
      render(true);
      setTimeout(() => render(false), 40);
    }

    nextBtn && nextBtn.addEventListener('click', goNext);
    prevBtn && prevBtn.addEventListener('click', goPrev);

    dots.forEach((d, i) => {
      d.addEventListener('click', () => {
        while (order[0] !== i) order.push(order.shift());
        render(true);
        setTimeout(() => render(false), 40);
      });
    });

    render(false);
  });
})();

/* -------------------------------------------------------------
   5) CV VIEWER — "View CV" buttons open the CV in an in-page
   modal (with its own Download button inside), rather than
   downloading immediately.
------------------------------------------------------------- */
(function cvViewer() {
  const modal = document.getElementById('cvModal');
  const frame = document.getElementById('cvFrame');
  const closeBtn = document.getElementById('cvModalClose');
  if (!modal || !frame) return;

  const CV_PATH = 'assets/documents/CV.pdf';

  function open(e) {
    if (e) e.preventDefault();
    frame.src = CV_PATH;
    modal.classList.add('open');
  }
  function close() {
    modal.classList.remove('open');
    frame.src = ''; // stop loading/playing once closed
  }

  document.querySelectorAll('.view-cv-trigger').forEach(btn => {
    btn.addEventListener('click', open);
  });
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

/* -------------------------------------------------------------
   6) GALLERY LIGHTBOX — click a tile to view it larger
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
