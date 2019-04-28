'use strict';

console.log('SatNOGS: Content Script loaded');

const KEYS = ['g', 'b', 'f']; // TODO: verify?
const ALERT_CHECK_INTERVAL_MS = 25;
const DEFAULT_WAIT_TIME_MS = 500;
let waitTime = DEFAULT_WAIT_TIME_MS;

document.addEventListener('keypress', (e) => {
  const char = String.fromCharCode(e.which);
  console.log(`SatNOGS: Content Script got char ${char}`);

  if (!KEYS.includes(char)) {
    return;
  }

  console.log('SatNOGS: forwarding key', char);
  browser.storage.local.get({ waitTime })
    .then((config) => waitTime = config.waitTime, (error) => {
      console.log('SatNOGS Storage Error:', error);
      waitTime = DEFAULT_WAIT_TIME_MS;
    })
    .then(() => {
      console.log('SatNOGS: waiting for notification..');
      let checkerInterval = setInterval(() => {
        const alert = document.querySelector('#alert-messages .alert');
        console.log('checking alert..', alert);
        if (alert) {
          console.log('SatNOGS: got notification, continuing..');
          clearInterval(checkerInterval);
          close();
        }
      }, ALERT_CHECK_INTERVAL_MS);
    });
});

function close() {
  console.log(`SatNOGS: got ${waitTime}ms wait time from settings`);
  setTimeout(() => {
    console.log('SatNOGS: wait time over, continuing..');
    browser.runtime.sendMessage("SatNOGS_DONE")
      .catch((error) => console.error('SatNOGS error:', error));
  }, waitTime);
}