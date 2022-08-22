const DEFAULT_WAIT_TIME = 500;

const saveOptions = (e) => {
  e.preventDefault();

  const tabCloseEnabled = document.querySelector("#tabCloseEnabled").checked;
  const waitTime = document.querySelector("#waitTime").value;
  const satellites = document.querySelector("#satellites").value;
  const stations = document.querySelector("#stations").value;
  const elevationEnabled = document.querySelector("#elevationEnabled").checked;
  const minElevation = document.querySelector("#minElevation").value;
  const maxElevation = document.querySelector("#maxElevation").value;
  const startTime = document.querySelector("#startTime").value;
  const duration = document.querySelector("#duration").value;

  browser.storage.local.set({
    tabCloseEnabled,
    waitTime: parseInt(waitTime, 10),
    satellites: satellites.split('\n') || [],
    stations: stations.split('\n') || [],
    startTime,
    duration: parseInt(duration, 10),
    elevationEnabled,
    minElevation: parseInt(minElevation, 10),
    maxElevation: parseInt(maxElevation || 90, 10),
  });
}

const restoreOptions = () => {
  browser.storage.local.get()
    .then((restoredValues) => {
      document.querySelector("#tabCloseEnabled").checked = restoredValues.tabCloseEnabled;
      document.querySelector("#waitTime").value = restoredValues.waitTime || DEFAULT_WAIT_TIME;
      document.querySelector("#satellites").value = restoredValues.satellites.join('\n') || '';
      document.querySelector("#stations").value = restoredValues.stations.join('\n') || '';
      document.querySelector("#elevationEnabled").checked = restoredValues.elevationEnabled;
      document.querySelector("#minElevation").value = restoredValues.minElevation;
      document.querySelector("#maxElevation").value = restoredValues.maxElevation || 90;
      document.querySelector("#startTime").value = restoredValues.startTime;
      document.querySelector("#duration").value = restoredValues.duration;
    }, (error) => {
      console.log(`SatNOGS Options Restore Error: ${error}`);
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("change", saveOptions);
