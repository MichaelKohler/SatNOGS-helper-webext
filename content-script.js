'use strict';

console.log('SatNOGS: Content Script loaded');

const KEYS = ['g', 'b', 'f'];
const ALERT_CHECK_INTERVAL_MS = 25;
const DEFAULT_WAIT_TIME_MS = 500;
let currentConfig = {
  waitTime: DEFAULT_WAIT_TIME_MS,
  currentRunConfiguration: [],
};

browser.runtime.onMessage.addListener(handleMessage);

getConfig()
  .then((config) => {
    currentConfig = config;
    setupValidationClose();

    // If we have a current run configuration that is not empty, we need to continue that run
    if (currentConfig.currentRunConfiguration && currentConfig.currentRunConfiguration.length > 0) {
      runAutomaticObservations();
    }
  })

function getConfig() {
  return browser.storage.local.get()
    .then((config) => {
      console.log('SatNOGS: got config...', config);
      return config;
    })
    .catch((error) => {
      console.log('SatNOGS Config Error:', error);
      return currentConfig;
  })
}

function handleMessage(message) {
  if (message.type === 'SatNOGS_CLICKED_BROWSER_ACTION') {
    runAutomaticObservations();
  }
}

function setupValidationClose() {
  if (!currentConfig.tabCloseEnabled) {
    return;
  }

  document.addEventListener('keypress', async (e) => {
    const char = String.fromCharCode(e.which);
    console.log(`SatNOGS: Content Script got char ${char}`);

    if (!KEYS.includes(char)) {
      return;
    }

    console.log('SatNOGS: waiting for notification..');
    await waitForElement('#alert-messages .alert', ALERT_CHECK_INTERVAL_MS);
    close(currentConfig.waitTime);
  });
}

function close(waitTime) {
  console.log(`SatNOGS: got ${waitTime}ms wait time from settings`);
  setTimeout(() => {
    console.log('SatNOGS: wait time over, continuing..');
    browser.runtime.sendMessage({ type: 'SatNOGS_WAIT_FOR_CLOSE_DONE' })
      .catch((error) => console.error('SatNOGS error:', error));
  }, waitTime);
}

async function runAutomaticObservations() {
  if (!currentConfig.currentRunConfiguration || currentConfig.currentRunConfiguration.length === 0) {
    console.log('SatNOGS: no current run configuration found, creating one...')
    const runConfiguration = [];

    // Set up combinations to run, we need to do this as the site reloads...
    for (const satellite of currentConfig.satellites) {
      runConfiguration.push(satellite);
    }

    await browser.storage.local.set({
      currentRunConfiguration: runConfiguration,
    });
    currentConfig.currentRunConfiguration = runConfiguration;
    console.log('SatNOGS: saved run configuration', runConfiguration);
  }

  // Make sure we are on the new observation page
  if (!window.location.href.includes('/observations/new/')) {
    console.log('SatNOGS: Going to new observation page..');
    window.location.href = '/observations/new/';
    return;
  }

  // Remove first satellite for next run...
  const nextRunSatellite = currentConfig.currentRunConfiguration.shift();
  console.log('SatNOGS: got next satellite to run..', nextRunSatellite);
  await browser.storage.local.set({
    currentRunConfiguration: currentConfig.currentRunConfiguration,
  });
  await runObservation(nextRunSatellite);
}

async function runObservation(satellite) {
  console.log('SatNOGS: starting observation for satellite', satellite);
  const isExpanded = document.querySelector('button[data-id="satellite-selection"]').getAttribute('aria-expanded');
  if (isExpanded === 'false') {
    document.querySelector('#satellite-selection ~ button').click()
  }
  await waitFor(200);
  const dropdownOptions = Array.from(document.querySelectorAll('#satellite-selection ~ .dropdown-menu ul.dropdown-menu li'));
  console.log('SatNOGS: dropdown entries...', dropdownOptions);
  const dropdownEntry = dropdownOptions.find((item) => item.innerText.trim().startsWith(satellite));
  dropdownEntry.querySelector('a').click();

  const startTimeInput = document.querySelector('#datetimepicker-start input');
  startTimeInput.value = currentConfig.startTime;
  const durationInMs = currentConfig.duration * 60 * 60 * 1000;
  const endTime = new Date(new Date(currentConfig.startTime).getTime() + durationInMs)
  const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(endTime);
  const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(endTime);
  const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(endTime);
  const hour = new Intl.DateTimeFormat('en', { hour: 'numeric', hourCycle: 'h24' }).format(endTime);
  const minute = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(endTime);
  const formattedEndTime = `${year}-${month}-${day} ${hour}:${minute}`;
  const endTimeInput = document.querySelector('#datetimepicker-end input');
  endTimeInput.value = formattedEndTime;
  console.log('SatNOGS: set end time to', endTimeInput.value);

  await waitFor(1500);

  const calculateButton = document.querySelector('#calculate-observation');
  calculateButton.click();

  await waitFor(1500);

  if (currentConfig.elevationEnabled) {
    console.log('SatNOGS: Elevation enabled, clicking around...');
    const slider = document.querySelector('div#scheduling-elevation-filter.slider.slider-horizontal');
    const sliderWidth = slider.clientWidth;
    const boundingRect = slider.getBoundingClientRect();
    const minimumToTheRightPixels = (sliderWidth / 90) * currentConfig.minElevation;
    const maximumToTheRightPixels = (sliderWidth / 90) * currentConfig.maxElevation;

    const firstClickOptions = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX: boundingRect.x + minimumToTheRightPixels,
      clientY: boundingRect.y + boundingRect.height / 2,
    };
    slider.dispatchEvent(new MouseEvent('mousedown', firstClickOptions));
    slider.dispatchEvent(new MouseEvent('mouseup', firstClickOptions));

    const secondClickOptions = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX: boundingRect.x + maximumToTheRightPixels,
      clientY: boundingRect.y + boundingRect.height / 2,
    };
    slider.dispatchEvent(new MouseEvent('mousedown', secondClickOptions));
    slider.dispatchEvent(new MouseEvent('mouseup', secondClickOptions));
  }

  await waitForElement('#schedule-observation', 500);

  if (currentConfig.stations && currentConfig.stations.length > 0) {
    const noneButton = document.querySelector('#select-none-observations');
    noneButton.click();

    // Select stations by clicking on them
    const stations = document.querySelectorAll('#timeline text.timeline-label');
    stations.forEach((stationNode) => {
      const configuredStation = currentConfig.stations.find((stationId) => stationNode.textContent.startsWith(stationId));
      if (configuredStation) {
        console.log('SatNOGS: dispatching mouse event on', configuredStation);
        stationNode.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      }
    });
  }

  const scheduleButton = document.querySelector('#schedule-observation');
  scheduleButton.click();
}

function waitFor(timeInMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs);
  });
}

async function waitForElement(selector, interval) {
  return new Promise((resolve) => {
    let checkerInterval = setInterval(() => {
      const element = document.querySelector(selector);
      console.log('SatNOGS: checking for element..', element);
      if (element && !element.disabled) {
        console.log('SatNOGS: got non-disabled element, continuing..');
        clearInterval(checkerInterval);
        resolve();
      }
    }, interval);
  });
}
