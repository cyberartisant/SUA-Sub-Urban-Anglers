/* ============================================
   SUA Sub-Urban Anglers — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile hamburger ── */
  const hamburger = document.querySelector('.hamburger');
  const mainNav   = document.getElementById('main-nav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mainNav.classList.toggle('open');
    });
  }

  /* ── Mobile dropdowns (tap to expand) ── */
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.nav-link[data-dropdown]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const parent = link.closest('.nav-item');
        parent.classList.toggle('open');
      });
    });
  }

  /* ── Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

  /* ── Filter tabs ── */
  document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabGroup.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        const container = tabGroup.closest('section, .blog-main, .shop-main')
          || tabGroup.parentElement.nextElementSibling;
        if (!container) return;
        container.querySelectorAll('[data-category]').forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  });

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Scroll reveal animation ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .impact-card, .forum-cat, .thread-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  document.addEventListener('animationFrame', () => {
    document.querySelectorAll('.revealed').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });

  // Trigger reveal for already-visible elements
  setTimeout(() => {
    document.querySelectorAll('.card, .impact-card, .forum-cat, .thread-item').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }, 100);

  document.querySelectorAll('.revealed').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });

  // Use MutationObserver to apply styles when intersection fires
  const styleObserver = new MutationObserver(() => {});
  const revealAll = () => {
    document.querySelectorAll('.card, .impact-card, .forum-cat, .thread-item').forEach(el => {
      if (el.classList.contains('revealed')) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  };
  setInterval(revealAll, 200);

  /* ── Sticky header shrink on scroll ── */
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header && header.classList.add('scrolled');
    } else {
      header && header.classList.remove('scrolled');
    }
  });

  /* ── Newsletter form ── */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input && input.value) {
        input.value = '';
        const btn = form.querySelector('button');
        if (btn) { btn.textContent = '✓'; setTimeout(() => btn.textContent = '→', 2000); }
      }
    });
  });

  /* ── Community post form ── */
  const postForm = document.getElementById('community-post-form');
  if (postForm) {
    postForm.addEventListener('submit', e => {
      e.preventDefault();
      postForm.innerHTML = `
        <div style="text-align:center;padding:2rem;">
          <div style="font-size:3rem;margin-bottom:1rem;">🎣</div>
          <h3 style="color:var(--orange)">Post Submitted!</h3>
          <p>Your post is awaiting moderation. Thanks for contributing to the SUA community!</p>
        </div>`;
    });
  }

  /* ── Back to top button ── */
  const backTop = document.createElement('button');
  backTop.innerHTML = '↑';
  backTop.setAttribute('aria-label', 'Back to top');
  backTop.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;
    width:44px;height:44px;border-radius:50%;
    background:var(--orange);color:white;
    border:none;font-size:1.2rem;cursor:pointer;
    box-shadow:0 4px 15px rgba(255,107,51,0.4);
    opacity:0;transition:opacity 0.3s;z-index:500;
    font-family:'Oswald',sans-serif;
  `;
  document.body.appendChild(backTop);
  window.addEventListener('scroll', () => {
    backTop.style.opacity = window.scrollY > 400 ? '1' : '0';
  });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

});
