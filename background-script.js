'use strict';

console.log('SatNOGS: Background Script loaded..');

browser.browserAction.onClicked.addListener(handleToolbarClick);
browser.runtime.onMessage.addListener(handleMessage);

function handleToolbarClick() {
  console.log('SatNOGS: user clicked on browser action button');
  browser.tabs.query({ active: true, windowId: window.WINDOW_ID_CURRENT })
    .then(([activeTab]) => {
      console.log(`SatNOGS: sending toolbar click to active tab ${activeTab.id}`);
      browser.tabs.sendMessage(activeTab.id, { type: 'SatNOGS_CLICKED_BROWSER_ACTION' });
    })
    .catch((err) => console.error('SatNOGS: Error sending toolbar click to active tab', err));
}

function handleMessage(message) {
  console.log(`SatNOGS: received message from content script.. ${message}`);

  if (message.type === 'SatNOGS_WAIT_FOR_CLOSE_DONE') {
    browser.tabs.query({ active: true, windowId: window.WINDOW_ID_CURRENT })
      .then(([activeTab]) => {
        console.log(`SatNOGS: removing active tab ${activeTab.id}`);
        browser.tabs.remove(activeTab.id);
      })
      .catch((err) => console.error('SatNOGS: Error closing active tab', err));
  }
}
