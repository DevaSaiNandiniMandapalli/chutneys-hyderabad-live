/* Chutneys — Hyderabad · interactions */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Preloader ---------- */
  var preloader = doc.getElementById('preloader');
  var preloaderLine = preloader ? preloader.querySelector('.preloader__line span') : null;
  if (preloaderLine) requestAnimationFrame(function () { preloaderLine.style.width = '100%'; });

  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add('is-done');
    doc.body.classList.remove('is-locked');
    setTimeout(function () { preloader.style.display = 'none'; }, 900);
  }
  window.addEventListener('load', function () {
    setTimeout(hidePreloader, reduceMotion ? 0 : 700);
    startHeroIntro();
  });
  setTimeout(function () { hidePreloader(); startHeroIntro(); }, 3200);

  /* ---------- Hero intro ---------- */
  var heroStarted = false;
  function startHeroIntro() {
    if (heroStarted) return;
    heroStarted = true;
    var lines = doc.querySelectorAll('[data-hero-line]');
    var bits = doc.querySelectorAll('[data-hero], .hero__actions, .hero__note, .hero__scroll, .hero__stamp');
    if (!hasGSAP || reduceMotion) {
      lines.forEach(function (l) { l.style.transform = 'none'; });
      return;
    }
    gsap.set(lines, { yPercent: 115 });
    var tl = gsap.timeline({ delay: 0.15 });
    tl.to(lines, { yPercent: 0, duration: 1.25, ease: 'power3.out', stagger: 0.12 })
      .from(bits, { y: 18, opacity: 0, duration: 0.9, ease: 'power2.out', stagger: 0.08 }, '-=0.85');
    if (doc.getElementById('heroCard')) {
      tl.from('#heroCard', { y: 30, opacity: 0, duration: 1, ease: 'power2.out' }, '-=0.9');
    }
  }

  /* ---------- Navigation ---------- */
  var nav = doc.getElementById('nav');
  var toggle = doc.getElementById('navToggle');
  var mobileMenu = doc.getElementById('mobileMenu');

  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeMenu() {
    if (!mobileMenu || !toggle) return;
    mobileMenu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    mobileMenu.setAttribute('aria-hidden', 'true');
    doc.body.classList.remove('is-locked');
  }
  function openMenu() {
    mobileMenu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    mobileMenu.setAttribute('aria-hidden', 'false');
    doc.body.classList.add('is-locked');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
      else openMenu();
    });
  }
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Marquee ---------- */
  var mTrack = doc.getElementById('marqueeTrack');
  if (mTrack) {
    var base = mTrack.innerHTML;
    var guard = 0;
    while (mTrack.scrollWidth < window.innerWidth * 2 && guard < 6) {
      mTrack.insertAdjacentHTML('beforeend', base);
      guard++;
    }
  }

  /* ---------- Reveals & parallax ---------- */
  if (hasGSAP && !reduceMotion) {
    var reveals = doc.querySelectorAll('[data-reveal]');
    reveals.forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
    doc.querySelectorAll('.dish').forEach(function (el, i) {
      gsap.set(el, { opacity: 0, y: 22 });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: (i % 3) * 0.06,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });
    doc.querySelectorAll('[data-parallax]').forEach(function (el) {
      var amt = parseFloat(el.getAttribute('data-parallax')) || 0.08;
      var img = el.querySelector('img') || el;
      gsap.fromTo(img, { yPercent: -amt * 60 }, {
        yPercent: amt * 60, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    gsap.to('.hero__media', {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  } else {
    doc.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ---------- Menu filters ---------- */
  var chips = doc.querySelectorAll('.chip');
  var dishes = Array.prototype.slice.call(doc.querySelectorAll('.dish'));
  var countEl = doc.getElementById('menuCount');

  function applyFilter(filter) {
    var shown = 0;
    dishes.forEach(function (dish) {
      var match = filter === 'all' || dish.getAttribute('data-cat') === filter;
      dish.classList.toggle('is-hidden', !match);
      if (match) {
        shown++;
        if (hasGSAP && !reduceMotion) {
          gsap.fromTo(dish, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
        }
      }
    });
    if (countEl) countEl.textContent = shown + (shown === 1 ? ' dish' : ' dishes');
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      applyFilter(chip.getAttribute('data-filter'));
    });
  });
  applyFilter('all');

  /* ---------- Modal helpers ---------- */
  var lastFocused = null;

  function openModal(modal) {
    if (!modal) return;
    lastFocused = doc.activeElement;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    doc.body.classList.add('is-locked');
    var focusable = modal.querySelector('.modal__close');
    if (focusable) setTimeout(function () { focusable.focus(); }, 60);
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    doc.body.classList.remove('is-locked');
    setTimeout(function () { modal.hidden = true; }, 380);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  doc.querySelectorAll('.modal').forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeModal(modal);
    });
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var items = modal.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      doc.querySelectorAll('.modal.is-open').forEach(closeModal);
      closeMenu();
    }
  });

  /* ---------- Dish dialog ---------- */
  var dishModal = doc.getElementById('dishModal');
  var dishImg = doc.getElementById('dishImg');
  var dishTitle = doc.getElementById('dishTitle');
  var dishDesc = doc.getElementById('dishDesc');
  var dishTags = doc.getElementById('dishTags');

  doc.querySelectorAll('[data-dish]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      dishTitle.textContent = btn.getAttribute('data-name');
      dishDesc.textContent = btn.getAttribute('data-desc');
      dishTags.textContent = btn.getAttribute('data-tags');
      var src = btn.getAttribute('data-img');
      dishImg.src = src;
      dishImg.alt = btn.getAttribute('data-name');
      openModal(dishModal);
    });
  });

  /* ---------- Reservation ---------- */
  var form = doc.getElementById('reserveForm');
  var confirmModal = doc.getElementById('confirmModal');
  var confirmName = doc.getElementById('confirmName');
  var confirmSummary = doc.getElementById('confirmSummary');

  function setError(input, message) {
    var field = input.closest('.field');
    var err = field.querySelector('.field__err');
    if (message) {
      field.classList.add('has-error');
      err.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    } else {
      field.classList.remove('has-error');
      err.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  }
  function validate() {
    var ok = true;
    var name = doc.getElementById('rName');
    var phone = doc.getElementById('rPhone');
    var guests = doc.getElementById('rGuests');
    var date = doc.getElementById('rDate');
    var time = doc.getElementById('rTime');

    if (name.value.trim().length < 2) { setError(name, 'Please enter your name.'); ok = false; }
    else setError(name, '');

    var digits = phone.value.replace(/[^0-9]/g, '');
    if (digits.length < 7 || phone.value.trim() === '') { setError(phone, 'Please enter a valid phone number.'); ok = false; }
    else setError(phone, '');

    if (!guests.value) { setError(guests, 'Select the number of guests.'); ok = false; }
    else setError(guests, '');

    if (!date.value) { setError(date, 'Choose a date.'); ok = false; }
    else setError(date, '');

    if (!time.value) { setError(time, 'Choose a time.'); ok = false; }
    else setError(time, '');

    return ok;
  }
  if (form) {
    var dateInput = doc.getElementById('rDate');
    var today = new Date();
    var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    dateInput.min = iso;

    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('has-error')) validate();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        var firstErr = form.querySelector('.has-error input, .has-error select');
        if (firstErr) firstErr.focus();
        return;
      }
      var name = doc.getElementById('rName').value.trim();
      var guests = doc.getElementById('rGuests').value;
      var date = doc.getElementById('rDate').value;
      var time = doc.getElementById('rTime').value;
      var readableDate = date;
      try {
        readableDate = new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      } catch (err) { /* keep raw date */ }
      confirmName.textContent = name.split(' ')[0];
      confirmSummary.textContent = 'Requested for ' + guests + ' on ' + readableDate + ' at ' + time + '.';
      openModal(confirmModal);
    });
  }

  /* ---------- Credits ---------- */
  var creditsBtn = doc.getElementById('creditsBtn');
  var creditsModal = doc.getElementById('creditsModal');
  if (creditsBtn) creditsBtn.addEventListener('click', function () { openModal(creditsModal); });

  /* ---------- Newsletter + toast ---------- */
  var toast = doc.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 4200);
  }
  var newsForm = doc.getElementById('newsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = doc.getElementById('newsEmail');
      if (!email.value || email.value.indexOf('@') < 1) {
        showToast('Please enter a valid email address.');
        email.focus();
        return;
      }
      showToast('Thank you — this demo does not store your email.');
      newsForm.reset();
    });
  }

  /* ---------- Carousel ---------- */
  var carousel = doc.getElementById('carousel');
  var track = doc.getElementById('carTrack');
  if (carousel && track) {
    var slides = track.querySelectorAll('.slide');
    var index = 0;
    var offset = 0;
    var dragging = false;
    var startX = 0;
    var startOffset = 0;
    var raf = null;

    function metrics() {
      var slideW = slides[0] ? slides[0].getBoundingClientRect().width : 300;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
      var viewport = carousel.getBoundingClientRect().width;
      var max = Math.max(0, track.scrollWidth - viewport);
      return { step: slideW + gap, max: max, viewport: viewport };
    }
    function apply() {
      track.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';
    }
    function clamp(v) {
      var m = metrics();
      return Math.max(0, Math.min(v, m.max));
    }
    function goTo(i) {
      var m = metrics();
      index = Math.max(0, Math.min(i, slides.length - 1));
      offset = clamp(index * m.step);
      apply();
    }
    function next() {
      var m = metrics();
      if (offset >= m.max - 2) goTo(0);
      else goTo(index + 1);
    }
    function prev() {
      if (offset <= 2) {
        var m = metrics();
        index = Math.max(0, slides.length - 1);
        offset = m.max;
        apply();
      } else goTo(index - 1);
    }
    var nextBtn = doc.getElementById('carNext');
    var prevBtn = doc.getElementById('carPrev');
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    carousel.addEventListener('pointerdown', function (e) {
      dragging = true;
      startX = e.clientX;
      startOffset = offset;
      carousel.classList.add('is-dragging');
      carousel.setPointerCapture(e.pointerId);
    });
    carousel.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var delta = e.clientX - startX;
      offset = clamp(startOffset - delta);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      carousel.classList.remove('is-dragging');
      try { carousel.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
      var m = metrics();
      index = Math.round(offset / m.step);
      offset = clamp(index * m.step);
      apply();
    }
    carousel.addEventListener('pointerup', endDrag);
    carousel.addEventListener('pointercancel', endDrag);
    carousel.addEventListener('dragstart', function (e) { e.preventDefault(); });

    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    window.addEventListener('resize', function () { goTo(index); });
    goTo(0);
  }

  /* ---------- Year ---------- */
  var year = doc.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
