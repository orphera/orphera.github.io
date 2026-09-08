/**
 * Overmax Landing Page Scripts
 */

const REPO_OWNER = 'orphera';
const REPO_NAME = 'overmax';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const FALLBACK_VERSION = 'v0.4.0';
const FALLBACK_RELEASE_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

function init() {
  initReleaseInfo();
  initImagePlaceholders();
  initCarousel();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function initReleaseInfo() {
  const versionBadges = document.querySelectorAll('.js-latest-version');
  const releaseDateEl = document.querySelector('.js-release-date');
  const winDlBtns = document.querySelectorAll('.js-dl-windows');
  const linuxDlBtns = document.querySelectorAll('.js-dl-linux');
  const releaseNotesLinks = document.querySelectorAll('.js-release-notes-link');

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const tagName = data.tag_name || FALLBACK_VERSION;
    const releaseUrl = data.html_url || FALLBACK_RELEASE_URL;
    const pageLang = document.documentElement.lang || 'ko';
    const dateLocales = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP' };
    const fallbackDateStr = { ko: '최신', en: 'Latest', ja: '最新' };
    const publishedAt = data.published_at 
      ? new Date(data.published_at).toLocaleDateString(dateLocales[pageLang] || 'ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
      : (fallbackDateStr[pageLang] || '최신');

    versionBadges.forEach(el => {
      el.textContent = tagName;
    });

    if (releaseDateEl) {
      releaseDateEl.textContent = publishedAt;
    }

    releaseNotesLinks.forEach(link => {
      link.href = releaseUrl;
    });

    if (Array.isArray(data.assets)) {
      const winAsset = data.assets.find(a => a.name.endsWith('.zip') || a.name.includes('windows'));
      const linuxAsset = data.assets.find(a => a.name.endsWith('.tar.gz') || a.name.includes('linux'));

      if (winAsset) {
        winDlBtns.forEach(btn => {
          btn.href = winAsset.browser_download_url;
        });
      }
      if (linuxAsset) {
        linuxDlBtns.forEach(btn => {
          btn.href = linuxAsset.browser_download_url;
        });
      }
    }
  } catch (err) {
    console.warn('[Overmax] GitHub API fetch fallback:', err);
  }
}

function initImagePlaceholders() {
  const placeholderBoxes = document.querySelectorAll('.placeholder-box[data-img]');

  placeholderBoxes.forEach(box => {
    const imgSrc = box.getAttribute('data-img');
    if (!imgSrc) return;

    const img = document.createElement('img');
    img.alt = box.getAttribute('data-alt') || 'Overmax Screenshot';
    img.src = imgSrc;

    img.onload = () => {
      box.appendChild(img);
      box.classList.add('has-image');
    };
  });
}

function initCarousel() {
  const track = document.querySelector('.js-carousel-track');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  if (!slides || slides.length === 0) return;

  const container = document.querySelector('.js-carousel');
  const prevBtn = document.querySelector('.js-carousel-prev');
  const nextBtn = document.querySelector('.js-carousel-next');
  const titleEl = document.querySelector('.js-preview-title');
  const tabBtns = document.querySelectorAll('.carousel-tab-btn');
  const dotEls = document.querySelectorAll('.carousel-dot');
  const slideTitleAttrs = Array.from(slides).map(s => s.getAttribute('data-title')).filter(Boolean);
  const fallbackTitles = {
    ko: ['기본 오버레이 HUD (스마트 추천 & 티어표)', '라이트 모드 (좌상단 스냅 고정)'],
    en: ['Standard Overlay HUD (Smart Recs & Tier List)', 'Lite Mode (Top-Left Snapped)'],
    ja: ['標準オーバーレイHUD (スマート推薦 & 難易度表)', 'ライトモード (左上スナップ固定)']
  };
  const pageLang = document.documentElement.lang || 'ko';
  const slideTitles = slideTitleAttrs.length === slides.length 
    ? slideTitleAttrs 
    : (fallbackTitles[pageLang] || fallbackTitles.ko);

  let currentIndex = 0;
  const slideCount = slides.length || 2;
  let autoPlayTimer = null;
  const AUTO_PLAY_INTERVAL = 5000;

  function goToSlide(index, restartTimer = true) {
    currentIndex = (index + slideCount) % slideCount;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update titles
    if (titleEl && slideTitles[currentIndex]) {
      titleEl.textContent = slideTitles[currentIndex];
    }

    // Update tabs
    tabBtns.forEach((btn, i) => {
      btn.classList.toggle('active', i === currentIndex);
    });

    // Update dots
    dotEls.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    if (restartTimer) {
      resetAutoPlay();
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1, false);
    }, AUTO_PLAY_INTERVAL);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const slideIdx = parseInt(btn.getAttribute('data-slide'), 10) || 0;
      goToSlide(slideIdx);
    });
  });

  dotEls.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIdx = parseInt(dot.getAttribute('data-slide'), 10) || 0;
      goToSlide(slideIdx);
    });
  });

  // Pause on hover
  if (container) {
    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);

    // Touch Swipe Support for Mobile
    let touchStartX = 0;
    let touchStartY = 0;

    container.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      stopAutoPlay();
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Check if horizontal swipe
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      } else {
        startAutoPlay();
      }
    }, { passive: true });
  }

  goToSlide(0, false);
  startAutoPlay();
}

