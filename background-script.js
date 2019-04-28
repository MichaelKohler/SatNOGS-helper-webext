'use strict';

console.log('SatNOGS: Background Script loaded..');

let started = false;
console.log('SATNOGS: not activated yet..');

browser.browserAction.onClicked.addListener(handleStartStop);
browser.runtime.onMessage.addListener(handleMessage);

function handleStartStop() {
  console.log('SatNOGS: user clicked on browser action button');
  console.log(`SatNOGS: current activation status is ${started}`);
  started = !started;
  console.log(`SatNOGS: set activation to ${started}`);
}

function handleMessage(message) {
  console.log(`SatNOGS: received message from content script.. ${message}`);

  if (!started) {
    console.log('SatNOGS: not started, not closing tab..');
    return;
  }

  browser.tabs.query({ active: true, windowId: window.WINDOW_ID_CURRENT })
      .then(([activeTab]) => {
        console.log(`SatNOGS: removing active tab ${activeTab.id}`);
        browser.tabs.remove(activeTab.id);
      })
      .catch((err) => console.error('SatNOGS: Error closing active tab', err));
}