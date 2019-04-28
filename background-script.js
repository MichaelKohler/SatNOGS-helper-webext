'use strict';

console.log('SatNOGS: Background Script loaded..');

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message) {
  console.log(`SatNOGS: received message from content script.. ${message}`);
  browser.tabs.query({ active: true, windowId: window.WINDOW_ID_CURRENT })
      .then(([activeTab]) => {
        console.log(`SatNOGS: removing active tab ${activeTab.id}`);
        browser.tabs.remove(activeTab.id);
      })
      .catch((err) => console.error('SatNOGS: Error closing active tab', err));
}