const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

const closeMenu = () => {
  document.body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'メニューを開く');
};

menuButton?.addEventListener('click', () => {
  const willOpen = !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', willOpen);
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menuButton.setAttribute('aria-label', willOpen ? 'メニューを閉じる' : 'メニューを開く');
});

menu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeMenu();
});

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 16);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

  revealItems.forEach((item) => observer.observe(item));
}

const inquiryForm = document.querySelector('[data-formspree]');

inquiryForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!inquiryForm.reportValidity()) return;

  const submitButton = inquiryForm.querySelector('button[type="submit"]');
  const status = inquiryForm.querySelector('.form-status');
  const originalButtonContent = submitButton?.innerHTML;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = '送信中...';
  }

  if (status) {
    status.textContent = '';
    status.removeAttribute('data-state');
  }

  try {
    const response = await fetch(inquiryForm.action, {
      method: 'POST',
      body: new FormData(inquiryForm),
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error('Form submission failed');

    inquiryForm.reset();
    if (status) {
      status.textContent = 'お問い合わせを送信しました。';
      status.dataset.state = 'success';
    }
  } catch (error) {
    if (status) {
      status.textContent = '送信できませんでした。時間をおいて再度お試しください。';
      status.dataset.state = 'error';
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonContent;
    }
  }
});
