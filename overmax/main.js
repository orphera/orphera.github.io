/**
 * Overmax Landing Page Scripts
 */

const REPO_OWNER = 'orphera';
const REPO_NAME = 'overmax';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const FALLBACK_VERSION = 'v0.3.3';
const FALLBACK_RELEASE_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

document.addEventListener('DOMContentLoaded', () => {
  initReleaseInfo();
  initImagePlaceholders();
});

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
    const publishedAt = data.published_at 
      ? new Date(data.published_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
      : '최신';

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
