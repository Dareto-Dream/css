/* The preview never changes the shared stylesheet or submits data. */
const themeButtons = [...document.querySelectorAll('[data-set-theme]')];
const themeNames = { teal: 'Teal', paper: 'Paper', ember: 'Ember', cobalt: 'Cobalt', lcd: 'LCD', void: 'Void' };
const semanticTokens = ['primary', 'secondary', 'accent', 'background', 'text', 'sheet', 'elevated', 'sunken', 'border', 'muted'];
const supportingTokens = ['darker', 'dark', 'darkless', 'black', 'steel', 'slate', 'smoke', 'snow', 'white', 'border-strong', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

function createSwatches(containerId, tokens) {
  const container = document.getElementById(containerId);
  for (const token of tokens) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'color-swatch';
    button.dataset.token = token;
    button.setAttribute('aria-label', `Copy var(--${token})`);
    const paint = document.createElement('span');
    paint.className = 'swatch-paint';
    paint.style.setProperty('--swatch', `var(--${token})`);
    paint.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span');
    name.className = 'swatch-name';
    name.textContent = `--${token}`;
    const value = document.createElement('span');
    value.className = 'swatch-value';
    button.append(paint, name, value);
    button.addEventListener('click', () => copyText(`var(--${token})`, document.getElementById('color-status')));
    container.append(button);
  }
}

function refreshSwatches() {
  // Computed backgrounds resolve aliases such as --sheet: var(--darkless).
  for (const swatch of document.querySelectorAll('.color-swatch')) {
    const rgb = getComputedStyle(swatch.querySelector('.swatch-paint')).backgroundColor;
    const channels = rgb.match(/[\d.]+/g);
    swatch.querySelector('.swatch-value').textContent = channels && channels.length >= 3
      ? '#' + channels.slice(0, 3).map(n => Math.round(Number(n)).toString(16).padStart(2, '0')).join('')
      : rgb;
  }
}

function setTheme(name) {
  if (!Object.hasOwn(themeNames, name)) return;
  document.documentElement.dataset.theme = name;
  for (const button of themeButtons) button.setAttribute('aria-pressed', String(button.dataset.setTheme === name));
  document.getElementById('theme-name').textContent = `${themeNames[name]} / selected`;
  document.getElementById('theme-attribute').textContent = `data-theme="${name}"`;
  document.getElementById('install-theme').textContent = `data-theme="${name}"`;
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.body).backgroundColor;
  refreshSwatches();
  try { localStorage.setItem('deltav-styles-theme', name); } catch { /* Storage is optional. */ }
}

async function copyText(value, status) {
  try {
    await navigator.clipboard.writeText(value);
    status.textContent = value.includes('\n') ? 'Stylesheet links copied.' : `${value} copied.`;
  } catch {
    status.textContent = 'Clipboard unavailable. Select and copy the text manually.';
  }
}

createSwatches('semantic-colors', semanticTokens);
createSwatches('supporting-colors', supportingTokens);
for (const button of themeButtons) button.addEventListener('click', () => setTheme(button.dataset.setTheme));
let savedTheme = 'teal';
try { savedTheme = localStorage.getItem('deltav-styles-theme') || 'teal'; } catch { /* Storage is optional. */ }
setTheme(Object.hasOwn(themeNames, savedTheme) ? savedTheme : 'teal');

for (const button of document.querySelectorAll('[data-demo-action]')) {
  button.addEventListener('click', () => { document.getElementById('button-status').textContent = button.dataset.demoAction; });
}
document.getElementById('demo-form').addEventListener('submit', event => {
  event.preventDefault();
  document.getElementById('form-status').textContent = 'Preview complete. Your form is valid; nothing was sent or saved.';
});
document.getElementById('copy-install').addEventListener('click', () => copyText(document.getElementById('install-code').textContent, document.getElementById('copy-status')));

const navigationLinks = [...document.querySelectorAll('.sidebar nav a')];
function updateNavigation() {
  let current = navigationLinks[0];
  for (const link of navigationLinks) {
    if (document.querySelector(link.hash).getBoundingClientRect().top <= 160) current = link;
  }
  for (const link of navigationLinks) {
    if (link === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
let navigationPending = false;
window.addEventListener('scroll', () => {
  if (navigationPending) return;
  navigationPending = true;
  requestAnimationFrame(() => { updateNavigation(); navigationPending = false; });
}, { passive: true });
updateNavigation();
