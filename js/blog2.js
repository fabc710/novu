/**
 * ================================================================
 * NOVU INSURANCE AGENCY — Blog Post Page JavaScript
 * File: js/blog-post.js
 *
 * TABLE OF CONTENTS
 * 1.  Init
 * 2.  Reading Progress Bar
 * 3.  Copy Link Button
 * 4.  Active TOC Highlight (IntersectionObserver)
 * 5.  Credit Bar Entrance Animation
 * 6.  Smooth Scroll for TOC links
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initReadingProgress();
  initCopyLink();
  initTOCHighlight();
  initCreditBars();
  initSmoothScroll();
});


/* ================================================================
   2. READING PROGRESS BAR
================================================================ */
function initReadingProgress() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const bar = document.createElement('div');
  bar.id = 'post-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Page reading progress');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');
  bar.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'height:3px',
    'width:0%',
    'background:linear-gradient(90deg,#a58533,#c5ab62,#ffdd88)',
    'z-index:99999',
    'transition:width 0.12s linear',
    'border-radius:0 2px 2px 0',
    'pointer-events:none',
  ].join(';');

  document.body.prepend(bar);

  let raf = false;

  window.addEventListener('scroll', () => {
    if (!raf) {
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
        bar.style.width = `${progress}%`;
        bar.setAttribute('aria-valuenow', String(progress));
        raf = false;
      });
      raf = true;
    }
  }, { passive: true });
}


/* ================================================================
   3. COPY LINK BUTTON
================================================================ */
function initCopyLink() {
  const btn = document.getElementById('copy-link-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const label = btn.querySelector('.copy-label');
      if (label) label.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        if (label) label.textContent = 'Copy Link';
        btn.classList.remove('copied');
      }, 2500);
    } catch {
      // Fallback for browsers without clipboard API
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  });
}


/* ================================================================
   4. ACTIVE TOC HIGHLIGHT
   Highlights the current section in the sidebar TOC as user scrolls
================================================================ */
function initTOCHighlight() {
  const tocLinks = document.querySelectorAll('.sidebar-toc__list a');
  if (!tocLinks.length || !('IntersectionObserver' in window)) return;

  const sectionIds = Array.from(tocLinks).map(link => {
    const href = link.getAttribute('href');
    return href ? href.replace('#', '') : null;
  }).filter(Boolean);

  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.sidebar-toc__list a[href="#${id}"]`);
        if (!link) return;

        if (entry.isIntersecting) {
          // Remove active from all
          tocLinks.forEach(l => {
            l.style.color = '';
            l.style.fontWeight = '';
          });
          // Highlight current
          link.style.color = 'var(--color-navy-darkest)';
          link.style.fontWeight = '700';
        }
      });
    },
    {
      rootMargin: '-15% 0px -70% 0px',
      threshold: 0,
    }
  );

  sections.forEach(section => observer.observe(section));
}


/* ================================================================
   5. CREDIT BAR ENTRANCE ANIMATION
   Animates the credit score bars in on scroll
================================================================ */
function initCreditBars() {
  const fills = document.querySelectorAll('.post-credit__fill');
  if (!fills.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Store the target widths and reset to 0
  const targets = Array.from(fills).map(fill => {
    const target = fill.style.width;
    fill.style.width = '0%';
    return { fill, target };
  });

  const container = document.querySelector('.post-credit-tiers');
  if (!container) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      // Stagger the animation
      targets.forEach(({ fill, target }, i) => {
        setTimeout(() => {
          fill.style.width = target;
        }, i * 120);
      });
      observer.disconnect();
    },
    { threshold: 0.25 }
  );

  observer.observe(container);
}


/* ================================================================
   6. SMOOTH SCROLL for TOC and in-page anchor links
================================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('header')?.offsetHeight ?? 90;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    });
  });
}