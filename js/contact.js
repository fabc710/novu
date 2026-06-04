/**
 * ================================================================
 * NOVU INSURANCE AGENCY — Contact Page JavaScript
 * File: js/contact.js
 * Version: 3.0 — FormSubmit compatible
 *
 * CHANGES IN THIS VERSION:
 * - initContactForm: eliminado fetch() a send_mail.php y el
 *   e.preventDefault() que bloqueaba el envío nativo del form.
 *   Ahora el formulario envía directamente a FormSubmit vía el
 *   atributo action del HTML. El JS solo valida y agrega el
 *   campo oculto sms_consent antes de que el browser envíe.
 * - Eliminadas funciones setLoadingState / showMessage (ya no
 *   aplican — FormSubmit redirige a thank-you.html al enviar).
 * - Todo lo demás (validación, phone formatter, animaciones)
 *   se mantiene igual que la v2.0.
 *
 * TABLE OF CONTENTS
 * 1.  DOMContentLoaded Init
 * 2.  Utility Helpers
 * 3.  Form Submission (FormSubmit — validación + sms_consent)
 * 4.  Real-time Field Validation
 * 5.  Phone Number Auto-Formatting
 * 6.  SMS Consent Checkbox Animation
 * 7.  Floating Buttons — Entrance Animation
 * 8.  Info Panel Items — Staggered Entrance
 * ================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initFieldValidation();
  initPhoneFormatter();
  initConsentAnimation();
  initFloatingButtons();
  initInfoPanelEntrance();
});


/* ================================================================
   2. UTILITY HELPERS
================================================================ */

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


/* ================================================================
   3. FORM SUBMISSION
   FormSubmit maneja el envío nativamente via action del HTML.
   Este bloque solo:
     a) Bloquea el submit si la validación falla.
     b) Inyecta sms_consent como campo hidden antes del envío.
   NO usa fetch(). NO llama a send_mail.php.
================================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {

    // Si la validación falla, bloquear el envío
    if (!validateAllFields()) {
      e.preventDefault();
      return;
    }

    // Capturar estado del checkbox SMS y pasarlo como campo hidden
    const smsCheckbox = document.getElementById('smsConsentCheckbox');
    if (smsCheckbox) {
      let hiddenInput = document.getElementById('sms_consent_hidden');

      if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'sms_consent';
        hiddenInput.id   = 'sms_consent_hidden';
        form.appendChild(hiddenInput);
      }

      hiddenInput.value = smsCheckbox.checked ? 'Yes' : 'No';
    }

    // Si todo OK, el browser envía a FormSubmit normalmente.
    // FormSubmit redirige a thank-you.html tras el envío.
  });
}


/* ================================================================
   4. REAL-TIME FIELD VALIDATION
================================================================ */
function initFieldValidation() {
  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');

  nameInput?.addEventListener('blur',    () => validateName(nameInput));
  emailInput?.addEventListener('blur',   () => validateEmail(emailInput));
  messageInput?.addEventListener('blur', () => validateMessage(messageInput));

  [nameInput, emailInput, messageInput].forEach((input) => {
    input?.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      if (input.value.trim()) clearError(input.id + '-error');
    });
  });
}

function validateAllFields() {
  const nameInput    = document.getElementById('name');
  const emailInput   = document.getElementById('email');
  const messageInput = document.getElementById('message');

  let isValid = true;
  if (!validateName(nameInput))       isValid = false;
  if (!validateEmail(emailInput))     isValid = false;
  if (!validateMessage(messageInput)) isValid = false;

  if (!isValid) {
    const firstError = document.querySelector('.cform__input.is-invalid');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstError?.focus();
  }

  return isValid;
}

function validateName(input) {
  if (!input) return true;
  const val = input.value.trim();
  if (!val || val.length < 2) {
    setFieldError(input, 'name-error', 'Please enter your full name (at least 2 characters).');
    return false;
  }
  setFieldValid(input, 'name-error');
  return true;
}

function validateEmail(input) {
  if (!input) return true;
  const val   = input.value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val || !regex.test(val)) {
    setFieldError(input, 'email-error', 'Please enter a valid email address.');
    return false;
  }
  setFieldValid(input, 'email-error');
  return true;
}

function validateMessage(input) {
  if (!input) return true;
  const val = input.value.trim();
  if (!val || val.length < 10) {
    setFieldError(input, 'message-error', 'Please enter a message (at least 10 characters).');
    return false;
  }
  setFieldValid(input, 'message-error');
  return true;
}

function setFieldError(input, errorId, message) {
  input.classList.add('is-invalid');
  input.classList.remove('is-valid');
  input.setAttribute('aria-invalid', 'true');
  const errorEl = document.getElementById(errorId);
  if (errorEl) { errorEl.textContent = message; errorEl.removeAttribute('hidden'); }
}

function setFieldValid(input, errorId) {
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  input.setAttribute('aria-invalid', 'false');
  clearError(errorId);
}

function clearError(errorId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) { errorEl.textContent = ''; errorEl.setAttribute('hidden', ''); }
}

function clearAllValidationStates() {
  document.querySelectorAll('.cform__input').forEach((input) => {
    input.classList.remove('is-valid', 'is-invalid');
    input.removeAttribute('aria-invalid');
  });
  document.querySelectorAll('.cform__error').forEach((el) => {
    el.textContent = '';
    el.setAttribute('hidden', '');
  });
}


/* ================================================================
   5. PHONE NUMBER AUTO-FORMATTING
================================================================ */
function initPhoneFormatter() {
  const phoneInput = document.getElementById('phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    let formatted = '';

    if (raw.length === 0) {
      formatted = '';
    } else if (raw.length <= 3) {
      formatted = `(${raw}`;
    } else if (raw.length <= 6) {
      formatted = `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
    } else {
      formatted = `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6, 10)}`;
    }

    e.target.value = formatted;
  });

  phoneInput.addEventListener('keydown', (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
    ];
    if (allowedKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  });
}


/* ================================================================
   6. SMS CONSENT CHECKBOX ANIMATION
   FIX: limpia inline transition después de la animación.
================================================================ */
function initConsentAnimation() {
  const checkbox = document.getElementById('smsConsentCheckbox');
  const custom   = document.querySelector('.cform__consent-custom');
  if (!checkbox || !custom) return;
  if (prefersReducedMotion()) return;

  checkbox.addEventListener('change', () => {
    custom.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease';
    custom.style.transform  = 'scale(1.25)';

    setTimeout(() => {
      custom.style.transform = 'scale(1)';

      setTimeout(() => {
        custom.style.transition = '';
        custom.style.transform  = '';
      }, 200);
    }, 200);
  });
}


/* ================================================================
   7. FLOATING BUTTONS — Entrance Animation
================================================================ */
function initFloatingButtons() {
  const buttons = document.querySelectorAll('.float-btn');
  if (!buttons.length) return;
  if (prefersReducedMotion()) return;

  // Guard — no duplicar si ya hay animación CSS activa en el contenedor
  const container = document.querySelector('.floating-buttons');
  if (container) {
    const computedAnim = getComputedStyle(container).animationName;
    if (computedAnim && computedAnim !== 'none') return;
  }

  buttons.forEach((btn, i) => {
    btn.classList.add('float-btn--hidden');
    btn.style.transitionDelay = `${1.2 + i * 0.15}s`;
  });

  // Doble rAF — garantiza que el estado inicial se pinte antes de la transición
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      buttons.forEach((btn) => btn.classList.remove('float-btn--hidden'));

      const maxDelay = (1.2 + (buttons.length - 1) * 0.15) * 1000 + 550;
      setTimeout(() => {
        buttons.forEach((btn) => { btn.style.transitionDelay = ''; });
      }, maxDelay);
    });
  });
}


/* ================================================================
   8. INFO PANEL ITEMS — Staggered Entrance
================================================================ */
function initInfoPanelEntrance() {
  const items = document.querySelectorAll('.cinfo-item');
  if (!items.length) return;
  if (prefersReducedMotion()) return;

  const card = document.querySelector('.cinfo-card');
  if (!card) return;

  items.forEach((item, i) => {
    item.classList.add('cinfo-item--hidden');
    item.style.transitionDelay = `${i * 0.07}s`;
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      items.forEach((item) => item.classList.remove('cinfo-item--hidden'));

      const maxDelay = (items.length - 1) * 70 + 450 + 50;
      setTimeout(() => {
        items.forEach((item) => { item.style.transitionDelay = ''; });
      }, maxDelay);

      observer.disconnect();
    },
    { threshold: 0.20 }
  );

  observer.observe(card);
}