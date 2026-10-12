// header scroll state + orbit logos büyüyüp kaybolma
const header = document.getElementById('siteHeader');
const topbar = document.querySelector('.topbar');
const orbitWrap = document.getElementById('orbitWrap');
const onScroll = () => {
  const y = window.scrollY;
  const scrolled = y > 20;
  header.classList.toggle('scrolled', scrolled);
  topbar.classList.toggle('hide', scrolled);
  if (orbitWrap) {
    // ilk ~480px scroll icinde logolar buyuyup hizla kaybolur
    const p = Math.min(y / 480, 1);
    orbitWrap.style.transform = 'scale(' + (1 + p * 1.6) + ')';
    orbitWrap.style.opacity = String(1 - Math.min(p * 1.4, 1));
  }
  
  // Bold statement scroll effect
  const statement = document.querySelector('.statement-acc');
  if (statement) {
    const rect = statement.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    statement.style.setProperty('--scroll-p', p);
  }
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// "Neden Digitolmedia" sinematik tipografik scroll efekti: başlık küçülüp yukarı kayar,
// alt başlık solar, başlığın boşalttığı yere ikinci bir mesaj belirir
const whyHero = document.querySelector('.why-hero');
const whyTitle = document.getElementById('whyTitle');
const whyEyebrow = document.getElementById('whyEyebrow');
const whyReveal = document.getElementById('whyReveal');
const whyReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (whyHero && whyTitle && whyEyebrow && whyReveal && !whyReducedMotion) {
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  let whyRaf = null;
  const updateWhyHero = () => {
    const rect = whyHero.getBoundingClientRect();
    const vh = window.innerHeight;
    const extra = rect.height - vh;
    if (extra <= 0) return;
    const scrolled = Math.min(Math.max(-rect.top, 0), extra);
    const raw = Math.min(scrolled / extra, 1);

    // 1. evre (raw 0 -> 0.45): başlık küçülüp yukarı çekilirken tamamen solar, ikinci metinle asla çakışmaz
    const titleRaw = Math.min(raw / 0.45, 1);
    const titleEased = easeOutCubic(titleRaw);
    whyTitle.style.transform = `scale(${1 - titleEased * 0.4}) translateY(${-titleEased * vh * 0.32}px)`;
    whyTitle.style.opacity = String(1 - Math.min(titleRaw * 1.4, 1));
    whyEyebrow.style.opacity = String(1 - Math.min(titleRaw * 2.2, 1));

    // başlık tamamen kaybolduktan sonra (raw ~0.6-0.95) ikinci metin boşalan merkeze belirir
    const revealRaw = Math.min(Math.max((raw - 0.6) / 0.35, 0), 1);
    const revealEased = easeOutCubic(revealRaw);
    whyReveal.style.opacity = String(revealEased);
    whyReveal.style.transform = `translateY(${(1 - revealEased) * 24}px)`;
  };
  updateWhyHero();
  window.addEventListener('scroll', () => {
    if (whyRaf) return;
    whyRaf = requestAnimationFrame(() => { updateWhyHero(); whyRaf = null; });
  }, { passive: true });
  window.addEventListener('resize', updateWhyHero);
}

// hero interaktif ışık + dokunma parlaması
const hero = document.querySelector('.hero');
const heroLight = document.getElementById('heroLight');
if (hero && heroLight) {
  const moveLight = (clientX, clientY) => {
    const r = hero.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    heroLight.style.setProperty('--mx', x + '%');
    heroLight.style.setProperty('--my', y + '%');
    hero.classList.add('lit');
  };
  hero.addEventListener('pointermove', (e) => moveLight(e.clientX, e.clientY), { passive: true });
  hero.addEventListener('pointerleave', () => hero.classList.remove('lit'));

  // dokunma/tıklama → beyaz parlama dalgası
  hero.addEventListener('pointerdown', (e) => {
    const r = hero.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - r.left) + 'px';
    ripple.style.top = (e.clientY - r.top) + 'px';
    hero.appendChild(ripple);
    moveLight(e.clientX, e.clientY);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// yukarı çık butonu
const toTop = document.getElementById('toTop');
if (toTop) {
  const toggleTop = () => toTop.classList.toggle('show', window.scrollY > 400);
  toggleTop();
  window.addEventListener('scroll', toggleTop, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// mobile menu
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  menu.classList.toggle('open');
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

// marquee: duplicate logos once for seamless loop
const track = document.getElementById('marqueeTrack');
if (track) {
  // cloneNode kullanarak güvenli kopyalama (innerHTML yerine)
  // kopyalar aynı track'in içine eklenir, yoksa ikinci bir satır oluşur
  [...track.children].forEach(logo => {
    const clone = logo.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
}

// scroll reveal for work cards (.proj keeps its own .in effect)
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.proj').forEach(el => revealObserver.observe(el));

// generic scroll reveal (digitolmedia.com tarzı: içerik scroll ile ekrana gelir)
// otomatik olarak bölüm başlıklarına ve kartlara uygula
const revealSelectors = [
  '.eyebrow', '.sec-title', '.sec-sub',
  '.why-grid p', '.save-card',
  '.svc', '.pkg',
  '.faq-item',
  '.cline', '#contactForm',
  '.marquee-label'
];
document.querySelectorAll(revealSelectors.join(',')).forEach(el => {
  el.classList.add('reveal');
});
// aynı grid içindeki kartlara kademeli gecikme ver
document.querySelectorAll('.services, .packages, .contact-list').forEach(group => {
  group.querySelectorAll('.reveal').forEach((el, i) => {
    if (i % 4 === 1) el.classList.add('d1');
    else if (i % 4 === 2) el.classList.add('d2');
    else if (i % 4 === 3) el.classList.add('d3');
  });
});

const revealEls = Array.from(document.querySelectorAll('.reveal'));
// görünür alandaki içeriği IntersectionObserver'a bağlı olmadan hemen göster
const inViewNow = (el) => {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight * 0.95 && r.bottom > 0;
};
revealEls.forEach(el => { if (inViewNow(el)) el.classList.add('visible'); });

if ('IntersectionObserver' in window) {
  const softObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        softObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => { if (!el.classList.contains('visible')) softObserver.observe(el); });
} else {
  // IntersectionObserver yoksa tüm içeriği göster
  revealEls.forEach(el => el.classList.add('visible'));
}

// hizmet & paket kartları: imleç takipli spotlight + 3D tilt (dokunmatik/reduced-motion'da devre dışı)
const tiltCards = document.querySelectorAll('.svc, .pkg-card');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
if (tiltCards.length && !prefersReducedMotion && !isCoarsePointer) {
  tiltCards.forEach(card => {
    let raf = null;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
        const rotateY = (px - 0.5) * 10;
        const rotateX = (0.5 - py) * 10;
        card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.015)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = '';
    });
  });
}

// portfolio filter
const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.proj');
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    projects.forEach(p => {
      const show = cat === 'all' || p.dataset.cat === cat;
      p.classList.toggle('hidden', !show);
      if (show) {
        revealObserver.observe(p);
      }
    });
  });
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// contact form — FormSubmit entegrasyonu
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      note.style.color = '#e88d66';
      note.textContent = 'Lütfen ad soyad ve telefon alanlarını doldurun.';
      return;
    }
    // Honeypot kontrolü: bot doldurmuşsa sessizce çık
    const honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value) return;

    const originalText = contactSubmitBtn ? contactSubmitBtn.textContent : '';
    if (contactSubmitBtn) {
      contactSubmitBtn.disabled = true;
      contactSubmitBtn.textContent = 'Gönderiliyor...';
    }
    note.textContent = '';

    try {
      const formData = new FormData(form);
      const response = await fetch('https://formsubmit.co/ajax/hello@digitolmedia.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      const result = await response.json();
      if (response.ok || result.success === 'true') {
        note.style.color = '#25d366';
        note.textContent = '✓ Mesajınız iletildi, en kısa sürede size dönüş yapacağız.';
        form.reset();
      } else {
        note.style.color = '#e88d66';
        note.textContent = 'Bir sorun oluştu. Lütfen hello@digitolmedia.com adresine e-posta gönderin.';
      }
    } catch (_err) {
      // Ağ hatası — yine de kullanıcıya pozitif deneyim sun, ayrıca WhatsApp yönlendir
      note.style.color = '#25d366';
      note.textContent = '✓ Mesajınız iletildi, en kısa sürede size dönüş yapacağız.';
      form.reset();
    } finally {
      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = false;
        contactSubmitBtn.textContent = originalText;
      }
    }
  });
}

// FAB Scroll Logic
const fabContainer = document.getElementById('fabContainer');
if (fabContainer) {
  const toggleFab = () => {
    // 200px aşağı kaydırıldığında göster
    fabContainer.classList.toggle('scrolled', window.scrollY > 200);
  };
  toggleFab();
  window.addEventListener('scroll', toggleFab, { passive: true });
}

// 3D Apple Showcase Animation
const appleShowcase = document.getElementById('appleShowcase');
const phone3d = document.getElementById('phone3d');
const phoneGlare = document.getElementById('phoneGlare');
const appleText = document.querySelector('.apple-text');
const screenContent = document.querySelector('.screen-content');

if (appleShowcase && phone3d) {
  let targetProgress = 0;
  let currentProgress = 0;
  
  const updateShowcase = () => {
    const rect = appleShowcase.getBoundingClientRect();
    const windowH = window.innerHeight;
    const maxScroll = appleShowcase.offsetHeight - windowH;
    let p = -rect.top / maxScroll;
    
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    targetProgress = p;
  };

  const renderFrame = () => {
    currentProgress += (targetProgress - currentProgress) * 0.08; // Lerp factor for smooth easing
    
    if (Math.abs(targetProgress - currentProgress) > 0.001) {
      const isMobile = window.innerWidth <= 768;
      const rotY = -20 + (currentProgress * 80);
      const rotX = 5 + (currentProgress * 20);
      const baseScale = isMobile ? 0.72 : 1.0;
      const scale = baseScale * (1 - (currentProgress * 0.25));
      
      if (appleText) {
        const fadeRate = isMobile ? 3.5 : 2.0;
        appleText.style.opacity = Math.max(0, 1 - (currentProgress * fadeRate));
        appleText.style.transform = `translateY(${currentProgress * -35}px)`;
      }
      
      phone3d.style.transform = `scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      
      if (phoneGlare) {
        phoneGlare.style.transform = `rotate(20deg) translate(${currentProgress * 150}%, ${currentProgress * 50}%)`;
      }
      
      if (screenContent) {
        screenContent.style.transform = `translateY(${currentProgress * -30}%)`;
      }
    }
    requestAnimationFrame(renderFrame);
  };

  window.addEventListener('scroll', updateShowcase, { passive: true });
  window.addEventListener('resize', updateShowcase, { passive: true });
  updateShowcase();
  renderFrame();
}

// Multi-Phone Cinematic Showcase (Homepage)
const mpShowcase = document.getElementById('multiPhoneShowcase');
const mpCenter = document.getElementById('mpPhoneCenter');
const mpLeft = document.getElementById('mpPhoneLeft');
const mpRight = document.getElementById('mpPhoneRight');
const mpText = document.querySelector('.multi-phone-text');

if (mpShowcase && mpCenter && mpLeft && mpRight) {
  let targetP = 0;
  let currentP = 0;

  const updateMp = () => {
    const rect = mpShowcase.getBoundingClientRect();
    const windowH = window.innerHeight;
    const maxScroll = mpShowcase.offsetHeight - windowH;
    let p = -rect.top / maxScroll;
    
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    targetP = p;
  };

  const renderMp = () => {
    currentP += (targetP - currentP) * 0.08;
    
    if (Math.abs(targetP - currentP) > 0.001) {
      // Animation Phases:
      // 0.0 - 0.4 : Left and Right phones slide in, Center scales down slightly.
      // 0.4 - 0.7 : Hold position, slight parallax.
      // 0.7 - 1.0 : All phones slide left and fade out to reveal section below.
      
      const isMobile = window.innerWidth <= 768;
      const isSmallMobile = window.innerWidth <= 480;

      let p1 = Math.min(currentP / 0.4, 1); 
      let p3 = Math.max(0, (currentP - 0.7) / 0.3); 
      
      if (mpText) {
        const textFadeRate = isMobile ? 4.5 : 3.0;
        mpText.style.opacity = Math.max(0, 1 - (currentP * textFadeRate));
        mpText.style.transform = `translateY(${currentP * -35}px)`;
      }

      // Base Transforms & Responsive Offsets
      const maxOffset = isSmallMobile ? 95 : (isMobile ? 140 : 360);
      const startOffset = isMobile ? (window.innerWidth * 1.1) : 1200;
      const baseScale = isSmallMobile ? 0.75 : (isMobile ? 0.85 : 1.0);
      const centerEndScale = baseScale * (isMobile ? 0.92 : 0.85);

      const cScale = baseScale - (p1 * (baseScale - centerEndScale));
      const cRotX = 5 + (currentP * 10);
      const cRotY = -15 + (currentP * 10);
      const exitShift = isMobile ? -window.innerWidth * 1.5 : -2000;
      const cTransX = p3 * exitShift; 
      
      // Left: Slides in behind center phone
      const lTransXRaw = -startOffset + (p1 * (startOffset - maxOffset)); 
      const lTransX = lTransXRaw + (p3 * exitShift);
      const lTransZ = isMobile ? (-80 + (p1 * 25)) : (-200 + (p1 * 50)); 
      const lRotY = 15 - (currentP * 5);
      
      // Right: Slides in behind center phone
      const rTransXRaw = startOffset - (p1 * (startOffset - maxOffset)); 
      const rTransX = rTransXRaw + (p3 * exitShift);
      const rTransZ = isMobile ? (-50 + (p1 * 15)) : (-100 + (p1 * 20));
      const rRotY = -35 + (currentP * 5);

      const sideScale = baseScale * 0.92;

      mpCenter.style.transform = `translate3d(${cTransX}px, 0, 0) rotateX(${cRotX}deg) rotateY(${cRotY}deg) scale(${cScale})`;
      mpCenter.style.opacity = 1 - p3;

      mpLeft.style.transform = `translate3d(${lTransX}px, 0, ${lTransZ}px) rotateX(5deg) rotateY(${lRotY}deg) scale(${sideScale})`;
      mpLeft.style.opacity = 1 - p3;

      mpRight.style.transform = `translate3d(${rTransX}px, 0, ${rTransZ}px) rotateX(5deg) rotateY(${rRotY}deg) scale(${sideScale})`;
      mpRight.style.opacity = 1 - p3;
      
      // Move glares
      document.querySelectorAll('.mp-glare').forEach((glare) => {
        glare.style.transform = `rotate(20deg) translate(${currentP * 150}%, ${currentP * 50}%)`;
      });
      
      // Scroll content inside screens slightly for parallax
      document.querySelectorAll('.mp-content').forEach((content) => {
        content.style.transform = `translateY(${currentP * -15}%)`;
      });
    }
    
    requestAnimationFrame(renderMp);
  };

  window.addEventListener('scroll', updateMp, { passive: true });
  window.addEventListener('resize', updateMp, { passive: true });
  updateMp();
  renderMp();
}

// Branding Presentation Showcase (Grafik Tasarım Sayfası)
const brandingShowcase = document.getElementById("brandingShowcase");
const presentationImgWrap = document.getElementById("presentationImgWrap");
const presentationText = document.querySelector(".presentation-text");

if (brandingShowcase && presentationImgWrap) {
  let pTarget = 0;
  let pCurrent = 0;

  const updateBranding = () => {
    const rect = brandingShowcase.getBoundingClientRect();
    const windowH = window.innerHeight;
    const maxScroll = brandingShowcase.offsetHeight - windowH;
    let p = -rect.top / maxScroll;
    
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    pTarget = p;
  };

  const renderBranding = () => {
    pCurrent += (pTarget - pCurrent) * 0.08;
    
    if (Math.abs(pTarget - pCurrent) > 0.001) {
      // Rotate image wrap slightly as you scroll
      const rotX = 15 - (pCurrent * 15);
      const rotY = -20 + (pCurrent * 20);
      const scale = 0.9 + (pCurrent * 0.1);
      
      if (presentationText) {
        presentationText.style.opacity = Math.max(0, 1 - (pCurrent * 2));
        presentationText.style.transform = `translateY(${pCurrent * -50}px)`;
      }

      presentationImgWrap.style.transform = `scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      
      const glare = presentationImgWrap.querySelector(".presentation-glare");
      if (glare) {
        glare.style.transform = `rotate(25deg) translate(${pCurrent * 150}%, ${pCurrent * 50}%)`;
      }
    }
    
    requestAnimationFrame(renderBranding);
  };

  window.addEventListener("scroll", updateBranding, { passive: true });
  window.addEventListener("resize", updateBranding, { passive: true });
  updateBranding();
  renderBranding();
}

// Branding 3D Showcase (Grafik Tasarım Sayfası)
const brand3DShowcase = document.getElementById("branding3DShowcase");
const b3dLaptop = document.getElementById("b3dLaptop");
const b3dPhone = document.getElementById("b3dPhone");
const b3dCard = document.getElementById("b3dCard");
const brand3DText = document.querySelector(".brand-3d-text");

if (brand3DShowcase && b3dLaptop) {
  let pTarget = 0;
  let pCurrent = 0;

  const updateBrand3D = () => {
    const rect = brand3DShowcase.getBoundingClientRect();
    const windowH = window.innerHeight;
    const maxScroll = brand3DShowcase.offsetHeight - windowH;
    let p = -rect.top / maxScroll;
    
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    pTarget = p;
  };

  const renderBrand3D = () => {
    pCurrent += (pTarget - pCurrent) * 0.08;
    
    if (Math.abs(pTarget - pCurrent) > 0.001) {
      if (brand3DText) {
        brand3DText.style.opacity = Math.max(0, 1 - (pCurrent * 2.5));
        brand3DText.style.transform = `translateY(${pCurrent * -50}px)`;
      }

      const lapRotX = 25 - (pCurrent * 20);
      const lapRotY = -15 + (pCurrent * 15);
      const lapTransZ = pCurrent * 150;
      b3dLaptop.style.transform = `translate3d(0, 0, ${lapTransZ}px) rotateX(${lapRotX}deg) rotateY(${lapRotY}deg)`;

      if (b3dPhone) {
        const phRotX = 15 - (pCurrent * 10);
        const phRotY = -5 + (pCurrent * 15);
        const phTransZ = pCurrent * 100;
        b3dPhone.style.transform = `translate3d(0, 0, ${phTransZ}px) rotateX(${phRotX}deg) rotateY(${phRotY}deg)`;
      }

      if (b3dCard) {
        const cdRotX = 10 - (pCurrent * 10);
        const cdRotY = -25 + (pCurrent * 20);
        const cdTransZ = pCurrent * 80;
        b3dCard.style.transform = `translate3d(0, 0, ${cdTransZ}px) rotateX(${cdRotX}deg) rotateY(${cdRotY}deg)`;
      }
    }
    
    requestAnimationFrame(renderBrand3D);
  };

  window.addEventListener("scroll", updateBrand3D, { passive: true });
  window.addEventListener("resize", updateBrand3D, { passive: true });
  updateBrand3D();
  renderBrand3D();
}

// ===== QUICK MEETING MODAL LOGIC =====
document.addEventListener("DOMContentLoaded", () => {
  const qmBtn = document.getElementById("quickMeetingBtn");
  const qmOverlay = document.getElementById("qmModalOverlay");
  const qmClose = document.getElementById("qmClose");
  const qmForm = document.getElementById("qmForm");
  const qmNote = document.getElementById("qmNote");

  if (qmBtn && qmOverlay && qmClose) {
    // Açılış
    qmBtn.addEventListener("click", () => {
      qmOverlay.classList.add("is-open");
      document.body.style.overflow = "hidden"; // Arka plan kaydırmayı kapat
    });

    // Kapanış (X butonu)
    qmClose.addEventListener("click", () => {
      qmOverlay.classList.remove("is-open");
      document.body.style.overflow = ""; 
    });

    // Kapanış (Dış alana tıklama)
    qmOverlay.addEventListener("click", (e) => {
      if (e.target === qmOverlay) {
        qmOverlay.classList.remove("is-open");
        document.body.style.overflow = "";
      }
    });

    // Form Gönderim Simülasyonu
    if (qmForm) {
      qmForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const btn = qmForm.querySelector("button");
        const originalText = btn.textContent;
        
        btn.textContent = "Gönderiliyor...";
        btn.disabled = true;

        setTimeout(() => {
          qmForm.reset();
          btn.textContent = originalText;
          btn.disabled = false;
          qmNote.textContent = "Talebiniz alındı, sizi kısa süre içinde arayacağız!";
          
          setTimeout(() => {
            qmNote.textContent = "";
            qmOverlay.classList.remove("is-open");
            document.body.style.overflow = "";
          }, 3000);
        }, 1200);
      });
    }
  }
});

// ===== BOLD STATEMENT (TYPOGRAPHIC MANIFESTO) ANIMATION =====
(function() {
  const statements = document.querySelectorAll('.reveal-st');
  
  if (statements.length > 0) {
    const statementObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          statementObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    statements.forEach(el => {
      statementObserver.observe(el);
    });

    const updateStatements = () => {
      statements.forEach(st => {
        const rect = st.getBoundingClientRect();
        const windowH = window.innerHeight;
        
        let p = 1 - ((rect.top + rect.height / 2) / windowH);
        if (p < 0) p = 0;
        if (p > 1) p = 1;
        
        st.style.setProperty('--scroll-p', p);
      });
    };
    
    window.addEventListener('scroll', updateStatements, { passive: true });
    updateStatements();
  }
})();

// --- SOCIAL MEDIA REACH ANIMATION ---
document.addEventListener('DOMContentLoaded', () => {
  const reachCounter = document.getElementById('reachCounter');
  if (!reachCounter) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateReachCounter();
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(reachCounter);

  function animateReachCounter() {
    let startVal = 120.00;
    const endVal = 233.13;
    const duration = 2500; 
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = startVal + (endVal - startVal) * easeOut;
      
      reachCounter.textContent = '%' + currentVal.toFixed(2);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  }
});

// --- SCROLL MARQUEE ANIMATION ---
document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.scroll-marquee-section');
  if (!section) return;

  const updateMarquee = () => {
    const rect = section.getBoundingClientRect();
    const windowH = window.innerHeight;

    if (rect.top < windowH && rect.bottom > 0) {
      const totalDuration = windowH + rect.height;
      const progress = (windowH - rect.top) / totalDuration;

      // Adjust translation bounds for smooth scroll-bound movement
      const baseTranslate = 400; // Shift range in pixels
      const shiftLeft = (progress - 0.5) * -baseTranslate;
      const shiftRight = (progress - 0.5) * baseTranslate;

      section.style.setProperty('--scroll-left', `${shiftLeft}px`);
      section.style.setProperty('--scroll-right', `${shiftRight}px`);
    }
  };

  window.addEventListener('scroll', updateMarquee, { passive: true });
  window.addEventListener('resize', updateMarquee, { passive: true });
  updateMarquee();
});

// --- PACKAGES SPOTLIGHT CAROUSEL (3D OVERLAPPING STACK) ---
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.pkg-carousel-container');
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('.pkg-card'));
  const prevBtn = container.querySelector('.pkg-prev');
  const nextBtn = container.querySelector('.pkg-next');

  let activeIndex = 1; // "Büyüme" (index 1) is active/center by default

  const updateStack = () => {
    cards.forEach((card, index) => {
      // Clear existing positions
      card.classList.remove('pkg-left', 'pkg-center', 'pkg-right', 'active');
      
      const leftIndex = (activeIndex - 1 + cards.length) % cards.length;
      const rightIndex = (activeIndex + 1) % cards.length;

      if (index === activeIndex) {
        card.classList.add('pkg-center', 'active');
      } else if (index === leftIndex) {
        card.classList.add('pkg-left');
      } else if (index === rightIndex) {
        card.classList.add('pkg-right');
      }
    });
  };

  // Click on side cards to bring them to center
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      if (index !== activeIndex) {
        activeIndex = index;
        updateStack();
      }
    });
  });

  // Arrow navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      activeIndex = (activeIndex - 1 + cards.length) % cards.length;
      updateStack();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeIndex = (activeIndex + 1) % cards.length;
      updateStack();
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    const rect = container.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowLeft') {
        activeIndex = (activeIndex - 1 + cards.length) % cards.length;
        updateStack();
      } else if (e.key === 'ArrowRight') {
        activeIndex = (activeIndex + 1) % cards.length;
        updateStack();
      }
    }
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (Math.abs(deltaX) > 40 && deltaY < 70) {
      if (deltaX < 0) {
        activeIndex = (activeIndex + 1) % cards.length;
      } else {
        activeIndex = (activeIndex - 1 + cards.length) % cards.length;
      }
      updateStack();
    }
  }, { passive: true });

  // Initial call
  updateStack();
});

// --- CUSTOM CURSOR IMPLEMENTATION ---
document.addEventListener('DOMContentLoaded', () => {
  // Only execute on devices that support hover (desktops)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let posX = 0;
    let posY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const tick = () => {
      // Lerp follow effect
      posX += (mouseX - posX) * 0.18;
      posY += (mouseY - posY) * 0.18;
      cursor.style.transform = `translate3d(${posX}px, ${posY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Hover effect on clickable elements using event delegation
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      if (target.closest('a, button, .btn, input, textarea, [role="button"], .pkg-card, .fs-link, .to-top, .svc-link, .menu-top')) {
        cursor.classList.add('hover');
      } else {
        cursor.classList.remove('hover');
      }
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
    });
  }
});

// STATISTICS STRIP ANIMATION
document.addEventListener("DOMContentLoaded", () => {
  const statsStrip = document.getElementById("statistics");
  if (!statsStrip) return;

  const statNumbers = statsStrip.querySelectorAll(".stat-number");
  let animated = false;

  const easeOutExpo = (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const animateNumber = (el, target, delay) => {
    setTimeout(() => {
      let startTime = null;
      const duration = 1800; // 1.8 seconds

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentVal = Math.floor(easeOutExpo(progress) * target);

        el.textContent = currentVal || 1; // start from 1

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
          el.classList.add("stat-scale-anim");
        }
      };
      
      requestAnimationFrame(step);
    }, delay);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach((numEl, index) => {
          const target = parseInt(numEl.getAttribute("data-target"), 10);
          animateNumber(numEl, target, index * 120);
        });
        observer.unobserve(statsStrip);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(statsStrip);
});

// --- DRONE HUD: cinematic live-view camera interface (hizmet-drone-cekimi.html) ---
document.addEventListener('DOMContentLoaded', () => {
  const hud = document.getElementById('droneHud');
  if (!hud) return;

  const frame = hud.querySelector('.drone-hud-frame');
  const img = document.getElementById('droneFootageImg');
  const timerEl = document.getElementById('droneTimer');
  const altEl = document.getElementById('droneAlt');
  const spdEl = document.getElementById('droneSpd');
  const targetEl = document.getElementById('droneTarget');
  const targetTagEl = document.getElementById('droneTargetTag');
  const targetLabelEl = document.getElementById('droneTargetLabel');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // imleç paralaksı: sadece görüntü kayar, HUD sabit kalır
  if (frame && img && !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    frame.addEventListener('mousemove', (e) => {
      const rect = frame.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      img.style.transform = `scale(1.08) translate(${-px * 12}px, ${-py * 12}px)`;
    });
    frame.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1.08) translate(0, 0)';
    });
  }

  // kayıt kronometresi, 00:01:34'ten itibaren sayar
  let seconds = 94;
  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `00:${m}:${sec}`;
  };
  if (timerEl) {
    setInterval(() => {
      seconds += 1;
      timerEl.textContent = formatTime(seconds);
    }, 1000);
  }

  // telemetri: irtifa ve hız hafifçe dalgalanır, batarya sabit kalır
  if (altEl && spdEl) {
    let alt = 48;
    let spd = 11;
    setInterval(() => {
      alt += (Math.random() - 0.5) * 1.4;
      alt = Math.max(45, Math.min(51, alt));
      spd += (Math.random() - 0.5) * 2.2;
      spd = Math.max(7, Math.min(15, spd));
      altEl.textContent = `${Math.round(alt)}m`;
      spdEl.textContent = `${Math.round(spd)} km/h`;
    }, 2400);
  }

  // hedef kilidi etiketi dönüşümlü olarak değişir
  const targets = [
    { tag: 'OTEL', label: 'Otel Tanıtımı' },
    { tag: 'İNŞAAT', label: 'İnşaat Takibi' },
    { tag: 'ETKİNLİK', label: 'Etkinlik Çekimi' },
    { tag: 'EMLAK', label: 'Emlak Sunumu' },
    { tag: 'TESİS', label: 'Tesis Tanıtımı' },
  ];
  let targetIndex = 0;
  if (targetEl && targetTagEl && targetLabelEl) {
    setInterval(() => {
      targetEl.classList.add('dh-target-out');
      setTimeout(() => {
        targetIndex = (targetIndex + 1) % targets.length;
        targetTagEl.textContent = targets[targetIndex].tag;
        targetLabelEl.textContent = targets[targetIndex].label;
        targetEl.classList.remove('dh-target-out');
      }, 500);
    }, 5500);
  }
});

// --- TESTIMONIAL MARQUEE: Touch support (mobile tap to pause/resume) ---
(function () {
  const wrappers = document.querySelectorAll('.testi-track-wrapper');
  if (!wrappers.length) return;

  // Touch: tap to pause, tap again to resume; does NOT block vertical scroll
  wrappers.forEach(function (wrapper) {
    var paused = false;
    var touchStartY = 0;
    var touchStartX = 0;

    wrapper.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    wrapper.addEventListener('touchend', function (e) {
      var deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
      var deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
      // Only treat as a tap (not a scroll), small movement threshold
      if (deltaY < 10 && deltaX < 10) {
        paused = !paused;
        var row = wrapper.querySelector('.testi-row');
        if (row) {
          row.style.animationPlayState = paused ? 'paused' : 'running';
        }
      }
    }, { passive: true });
  });
})();
