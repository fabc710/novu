/* ================================================================
   NOVU INSURANCE — Services page: Specialty accordion
   Accessible single-open accordion with smooth height animation.
================================================================ */
(function () {
  'use strict';

  function init() {
    var items = document.querySelectorAll('.svc-acc__item');
    if (!items.length) return;

    function setOpen(item, open) {
      var btn = item.querySelector('.svc-acc__head');
      var panel = item.querySelector('.svc-acc__panel');
      if (!btn || !panel) return;
      if (open) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = '';
      }
    }

    items.forEach(function (item) {
      var btn = item.querySelector('.svc-acc__head');
      if (!btn) return;

      // Initialize: open the items flagged is-open
      if (item.classList.contains('is-open')) {
        requestAnimationFrame(function () { setOpen(item, true); });
      }

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        items.forEach(function (it) { setOpen(it, false); });
        if (!isOpen) setOpen(item, true);
      });
    });

    // Keep an open panel correctly sized on resize
    window.addEventListener('resize', function () {
      var open = document.querySelector('.svc-acc__item.is-open .svc-acc__panel');
      if (open) open.style.maxHeight = open.scrollHeight + 'px';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
