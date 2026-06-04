/* ================================================================
   NOVU INSURANCE — About page interactions (redesign layer)
   Accessible FAQ accordion with smooth height animation.
================================================================ */
(function () {
  'use strict';

  function initFaq() {
    var items = document.querySelectorAll('.ab-faq__item');
    if (!items.length) return;

    var buttons = [];

    function close(item) {
      var btn = item.querySelector('.ab-faq__q');
      var panel = item.querySelector('.ab-faq__a');
      if (!btn || !panel) return;
      btn.setAttribute('aria-expanded', 'false');
      item.classList.remove('is-open');
      panel.style.maxHeight = '';
    }

    function open(item) {
      var btn = item.querySelector('.ab-faq__q');
      var panel = item.querySelector('.ab-faq__a');
      if (!btn || !panel) return;
      btn.setAttribute('aria-expanded', 'true');
      item.classList.add('is-open');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }

    items.forEach(function (item) {
      var btn = item.querySelector('.ab-faq__q');
      var panel = item.querySelector('.ab-faq__a');
      if (!btn || !panel) return;
      buttons.push(btn);

      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        // Close all (single-open accordion)
        items.forEach(close);
        if (!isOpen) open(item);
      });
    });

    // Keep an open panel sized correctly on resize
    window.addEventListener('resize', function () {
      var openItem = document.querySelector('.ab-faq__item.is-open');
      if (openItem) {
        var panel = openItem.querySelector('.ab-faq__a');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });

    // Arrow-key navigation between questions (accessibility nicety)
    buttons.forEach(function (btn, i) {
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          var next = e.key === 'ArrowDown' ? i + 1 : i - 1;
          if (next < 0) next = buttons.length - 1;
          if (next >= buttons.length) next = 0;
          buttons[next].focus();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaq);
  } else {
    initFaq();
  }
})();
