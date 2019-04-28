'use strict';

console.log('SatNOGS: Content Script loading');

const KEYS = ['g', 'b', 'f']; // TODO: verify?
const DEFAULT_WAIT_TIME_MS = 500;
let waitTime = DEFAULT_WAIT_TIME_MS;

document.addEventListener('keypress', (e) => {
  const char = String.fromCharCode(e.which);
  console.log('SatNOGS: Content Script got char..', char);

  if (!KEYS.includes(char)) {
    return;
  }

  console.log('SatNOGS: forwarding key', char);
  browser.storage.local.get({ waitTime })
    .then((config) => waitTime = config.waitTime, (err) => {
      console.log(`SatNOGS Storage Error: ${error}`);
      waitTime = DEFAULT_WAIT_TIME_MS;
    })
    .then(() => {
      // TODO: wait for confirmation
      return Promise.resolve();
    })
    .then(() => {
      console.log('SatNOGS: wait time from settings', waitTime);
      setTimeout(() => {
        console.log('SatNOGS: wait time over, continuing..');
        browser.runtime.sendMessage("SatNOGS_DONE")
          .catch((e) => console.error('SatNOGS error:', err));
      }, waitTime);
    });
})