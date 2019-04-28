'use strict';

console.log('SatNOGS: Content Script loading');

const KEYS = ['g', 'b', 'f']; // TODO: verify?

document.addEventListener('keypress', (e) => {
  const char = String.fromCharCode(e.which);
  console.log('SatNOGS: Content Script got char..', char);

  if (!KEYS.includes(char)) {
    return;
  }

  // TODO: wait for confirmation, and then wait for X ms
  console.log('SatNOGS: forwarding key', char);
  browser.runtime.sendMessage("SatNOGS_DONE")
    .catch((e) => console.error('SatNOGS error:', err));
})