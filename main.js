/**
 * Overmax Landing Page Scripts
 * - GitHub Release API dynamic fetcher
 * - Image placeholder & asset auto-detector
 * - OS detection for primary download button
 */

const REPO_OWNER = 'orphera';
const REPO_NAME = 'overmax';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const FALLBACK_VERSION = 'v0.9.x';

document.addEventListener('DOMContentLoaded', () => {
  initReleaseInfo();
  initImagePlaceholders();
  initOSDetection();
});

/**
 * Fetch latest release metadata from GitHub API
 */
async function initReleaseInfo() {
  const versionBadges = document.querySelectorAll('.js-latest-version');
  const releaseDateEl = document.querySelector('.js-release-date');
  const winDlBtn = document.getElementById('dl-windows-btn');
  const linuxDlBtn = document.getElementById('dl-linux-btn');

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const tagName = data.tag_name || FALLBACK_VERSION;
    const publishedAt = data.published_at 
      ? new Date(data.published_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
      : '최신 빌드';

    // Update version texts
    versionBadges.forEach(el => {
      el.textContent = tagName;
    });

    if (releaseDateEl) {
      releaseDateEl.textContent = publishedAt;
    }

    // Find specific download assets if available
    if (Array.isArray(data.assets)) {
      const winAsset = data.assets.find(a => a.name.endsWith('.zip') || a.name.includes('windows'));
      const linuxAsset = data.assets.find(a => a.name.endsWith('.tar.gz') || a.name.includes('linux'));

      if (winAsset && winDlBtn) {
        winDlBtn.href = winAsset.browser_download_url;
        const winSizeEl = document.querySelector('.js-win-size');
        if (winSizeEl) {
          winSizeEl.textContent = `${(winAsset.size / (1024 * 1024)).toFixed(1)} MB`;
        }
      }

      if (linuxAsset && linuxDlBtn) {
        linuxDlBtn.href = linuxAsset.browser_download_url;
        const linuxSizeEl = document.querySelector('.js-linux-size');
        if (linuxSizeEl) {
          linuxSizeEl.textContent = `${(linuxAsset.size / (1024 * 1024)).toFixed(1)} MB`;
        }
      }
    }
  } catch (err) {
    console.warn('[Overmax] GitHub API fetch fallback:', err);
    // Keep fallback direct release links
  }
}

/**
 * Checks for user-provided screenshot images in assets/images/
 * If the image exists and loads, activates .has-image class
 */
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

    img.onerror = () => {
      // Keep default CSS placeholder mockup
    };
  });
}

/**
 * Detects user OS and subtly highlights matching OS download card
 */
function initOSDetection() {
  const isLinux = navigator.userAgent.toLowerCase().includes('linux');
  const winCard = document.getElementById('card-dl-win');
  const linuxCard = document.getElementById('card-dl-linux');

  if (isLinux && linuxCard && winCard) {
    winCard.classList.remove('highlight');
    linuxCard.classList.add('highlight');
  }
}
