/**
 * Overmax Landing Page Scripts
 */

const REPO_OWNER = 'orphera';
const REPO_NAME = 'overmax';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const FALLBACK_VERSION = 'v0.9.x';

document.addEventListener('DOMContentLoaded', () => {
  initReleaseInfo();
  initImagePlaceholders();
});

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

    versionBadges.forEach(el => {
      el.textContent = tagName;
    });

    if (releaseDateEl) {
      releaseDateEl.textContent = publishedAt;
    }

    if (Array.isArray(data.assets)) {
      const winAsset = data.assets.find(a => a.name.endsWith('.zip') || a.name.includes('windows'));
      const linuxAsset = data.assets.find(a => a.name.endsWith('.tar.gz') || a.name.includes('linux'));

      if (winAsset && winDlBtn) winDlBtn.href = winAsset.browser_download_url;
      if (linuxAsset && linuxDlBtn) linuxDlBtn.href = linuxAsset.browser_download_url;
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
