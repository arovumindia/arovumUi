document.documentElement.classList.add('js');

const button = document.querySelector('[data-menu]');
const nav = document.querySelector('[data-nav]');
button?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  button.setAttribute('aria-expanded', String(open));
  button.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open'); button?.setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('.site-footer .footer-links a[href="#about"]').forEach((link) => {
  link.setAttribute('href', 'about.html');
});
document.querySelector('[data-year]').textContent = new Date().getFullYear();

const carousel = document.querySelector('[data-product-carousel]');
const carouselTrack = carousel?.querySelector('.carousel-track');
const carouselNavigation = carousel?.querySelector('.carousel-navigation');

if (carouselTrack) {
  const cards = [...carouselTrack.querySelectorAll('.product-card')];
  const dots = cards.map((card, index) => {
    const title = card.querySelector('h3')?.textContent.trim() || `item ${index + 1}`;
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Show ${title}`);
    dot.setAttribute('aria-pressed', String(index === 0));
    dot.addEventListener('click', () => {
      const trackRect = carouselTrack.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      carouselTrack.scrollTo({
        left: carouselTrack.scrollLeft + cardRect.left - trackRect.left - (trackRect.width - cardRect.width) / 2,
        behavior: 'smooth'
      });
    });
    carouselNavigation?.append(dot);
    return dot;
  });

  let scrollFrame = 0;
  const updateActiveDot = () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const trackCenter = carouselTrack.getBoundingClientRect().left + carouselTrack.clientWidth / 2;
      let activeIndex = 0;
      let nearestDistance = Infinity;

      cards.forEach((card, index) => {
        const cardCenter = card.getBoundingClientRect().left + card.getBoundingClientRect().width / 2;
        const distance = Math.abs(trackCenter - cardCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          activeIndex = index;
        }
      });

      dots.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === activeIndex)));
    });
  };

  carouselTrack.addEventListener('scroll', updateActiveDot, { passive: true });
  carouselTrack.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      carouselTrack.scrollLeft += event.deltaY;
    }
  }, { passive: false });

  updateActiveDot();
}

const productCards = document.querySelectorAll('.product-card');
productCards.forEach((card) => {
  card.addEventListener('click', () => {
    if (window.matchMedia('(hover: none)').matches) {
      card.classList.toggle('is-flipped');
    }
  });

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      card.classList.toggle('is-flipped');
    }
  });
});

const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Enquiry form submission handler (email delivery via Web3Forms; mailto link as fallback — never WhatsApp)
const enquiryForm = document.getElementById('enquiry-form');
if (enquiryForm) {
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  const setStatus = (message, type, isHtml = false) => {
    if (!formStatus) return;
    if (isHtml) {
      formStatus.innerHTML = message;
    } else {
      formStatus.textContent = message;
    }
    formStatus.className = `form-status is-visible is-${type}`;
  };

  const clearStatus = () => {
    if (!formStatus) return;
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  };

  const buildMailto = (name, phone, email, product, message) => {
    const subject = encodeURIComponent(`New Enquiry from ${name} (${product})`);
    const body = encodeURIComponent(
      `Hello Arovum,\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nEnquiry: ${product}\nMessage: ${message || 'No additional note'}\n\nSubmitted: ${new Date().toISOString()}`
    );
    return `mailto:arovumagro@gmail.com?subject=${subject}&body=${body}`;
  };

  enquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatus();

    const honey = enquiryForm.querySelector('input[name="_honey"]')?.value;
    const botcheck = enquiryForm.querySelector('input[name="botcheck"]');
    if (honey || (botcheck && botcheck.checked)) return; // bot trapped

    const name = enquiryForm.querySelector('#field-name')?.value.trim();
    const phone = enquiryForm.querySelector('#field-phone')?.value.trim().replace(/\D/g, '');
    const email = enquiryForm.querySelector('#field-email')?.value.trim();
    const product = enquiryForm.querySelector('#field-product')?.value;
    const message = enquiryForm.querySelector('#field-message')?.value.trim();

    if (!name) {
      setStatus('Please enter your full name.', 'error');
      enquiryForm.querySelector('#field-name')?.focus();
      return;
    }

    if (!phone || phone.length < 10) {
      setStatus('Please enter a valid 10-digit mobile number.', 'error');
      enquiryForm.querySelector('#field-phone')?.focus();
      return;
    }

    if (!email) {
      setStatus('Please enter your email address.', 'error');
      enquiryForm.querySelector('#field-email')?.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Please enter a valid email address.', 'error');
      enquiryForm.querySelector('#field-email')?.focus();
      return;
    }

    if (!product) {
      setStatus('Please select a product or enquiry category.', 'error');
      enquiryForm.querySelector('#field-product')?.focus();
      return;
    }

    const originalBtnText = submitBtn ? submitBtn.textContent : 'Send enquiry';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending enquiry...';
    }

    const mailtoHref = buildMailto(name, phone, email, product, message);

    try {
      const accessKeyInput = enquiryForm.querySelector('input[name="access_key"]');
      const accessKey = accessKeyInput?.value?.trim() || enquiryForm.dataset.accessKey;
      const hasValidKey = accessKey && accessKey !== 'YOUR_ACCESS_KEY_HERE' && accessKey.length > 10;

      let sent = false;

      if (hasValidKey) {
        // Web3Forms (preferred when an access key is configured)
        const payload = {
          access_key: accessKey,
          from_name: 'Arovum Website Enquiry',
          subject: `New Enquiry from ${name} (${product})`,
          name,
          phone,
          email,
          product,
          message: message || 'No additional note',
          submittedAt: new Date().toISOString()
        };

        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        let data = null;
        let parsed = false;
        try {
          data = await res.json();
          parsed = true;
        } catch (e) {
          data = null;
        }
        if (res.ok && parsed && data && data.success === true) {
          sent = true;
        }
      }
      // Without a valid access key we fall through to the mailto fallback below.

      if (sent) {
        setStatus('Thank you! Your enquiry has been sent by email. Our team will contact you shortly.', 'success');
        enquiryForm.reset();
      } else {
        // No valid access key configured (or service unavailable): open the visitor's
        // email client pre-filled so the enquiry is still delivered by mail.
        setStatus(`Opening your email app to send the enquiry to Arovum...`, 'success');
        setTimeout(() => {
          window.location.href = mailtoHref;
        }, 600);
        enquiryForm.reset();
      }
    } catch (err) {
      console.error(err);
      setStatus(`Opening your email app to send the enquiry to Arovum...`, 'success');
      setTimeout(() => {
        window.location.href = mailtoHref;
      }, 600);
      enquiryForm.reset();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
}
