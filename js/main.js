/* ============================================
   SUA Sub-Urban Anglers — Main JavaScript
   ============================================ */

/* ── Live Forecast Bar ────────────────────────
   Data sources:
   • Air temp & wind  → Open-Meteo (free, no key, CORS-safe)
   • Moon phase       → Calculated from known lunar epoch
   • Solunar times    → Derived from moon transit (~50 min/day shift)
   • Hot species      → Seasonal lookup for Montreal freshwater
   ──────────────────────────────────────────── */

const MONTREAL = { lat: 45.5017, lon: -73.5673 };

// ── Fetch current weather from Open-Meteo ──
async function fetchWeather() {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${MONTREAL.lat}&longitude=${MONTREAL.lon}` +
    `&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code` +
    `&wind_speed_unit=kmh&timezone=America%2FToronto`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.current;
  } catch (e) {
    console.warn('Weather fetch failed:', e);
    return null;
  }
}

// ── Wind degrees → compass label ──
function windDir(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// ── WMO weather code → emoji ──
function weatherEmoji(code) {
  if (code === 0)            return '☀️';
  if (code <= 2)             return '🌤';
  if (code === 3)            return '☁️';
  if (code <= 48)            return '🌫';
  if (code <= 57)            return '🌦';
  if (code <= 67)            return '🌧';
  if (code <= 77)            return '❄️';
  if (code <= 82)            return '🌦';
  return '⛈';
}

// ── Moon phase from known epoch ──
function getMoonPhase() {
  const phases = [
    { name: 'New Moon',        icon: '🌑' },
    { name: 'Waxing Crescent', icon: '🌒' },
    { name: 'First Quarter',   icon: '🌓' },
    { name: 'Waxing Gibbous',  icon: '🌔' },
    { name: 'Full Moon',       icon: '🌕' },
    { name: 'Waning Gibbous',  icon: '🌖' },
    { name: 'Last Quarter',    icon: '🌗' },
    { name: 'Waning Crescent', icon: '🌘' },
  ];
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const cycle = 29.53058867; // days
  const age = (((Date.now() - knownNewMoon) / 86400000) % cycle + cycle) % cycle;
  const idx = Math.round((age / cycle) * 8) % 8;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * age / cycle)) / 2 * 100);
  return { ...phases[idx], age, illumination };
}

// ── Solunar peak times (major feeding periods) ──
// Moon transits roughly at noon on new moon, advancing ~50 min/day.
// Major periods: moon directly overhead (transit) & underfoot (opposition).
function getSolunarTimes() {
  const { age } = getMoonPhase();
  const transitMin = ((12 * 60) + age * 50) % 1440;
  const oppositeMin = (transitMin + 720) % 1440;
  const fmt = m => {
    const h = Math.floor(m / 60) % 24;
    const min = Math.floor(m % 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(min).padStart(2, '0')} ${ampm}`;
  };
  // Return the earlier time first
  const [a, b] = [transitMin, oppositeMin].sort((x, y) => x - y);
  return `${fmt(a)} & ${fmt(b)}`;
}

// ── Hot species by season (Montreal freshwater) ──
function getHotSpecies() {
  const m = new Date().getMonth(); // 0 = Jan
  if (m >= 2  && m <= 4) return 'Pike & Walleye';  // Mar–May
  if (m >= 5  && m <= 7) return 'Bass & Pike';      // Jun–Aug
  if (m >= 8  && m <= 10) return 'Walleye & Bass';  // Sep–Nov
  return 'Perch & Catfish';                          // Dec–Feb
}

// ── Main update function ──
async function updateForecastBar() {
  const weather = await fetchWeather();
  const moon    = getMoonPhase();

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  if (weather) {
    set('fc-temp',      `${Math.round(weather.temperature_2m)}°C`);
    set('fc-temp-icon', weatherEmoji(weather.weather_code));
    set('fc-wind',      `${windDir(weather.wind_direction_10m)} ${Math.round(weather.wind_speed_10m)} km/h`);
  }

  set('fc-moon-icon', moon.icon);
  set('fc-moon',      `${moon.name} ${moon.illumination}%`);
  set('fc-times',     getSolunarTimes());
  set('fc-species',   getHotSpecies());
}

// Run on page load, then refresh every 30 minutes
updateForecastBar();
setInterval(updateForecastBar, 30 * 60 * 1000);

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
