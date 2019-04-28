const DEFAULT_WAIT_TIME = 500;

const saveOptions = (e) => {
  e.preventDefault();

  const configValue = document.querySelector("#waitTime").value;
  browser.storage.local.set({
    waitTime: configValue
  });
}

const restoreOptions = () => {
  browser.storage.local.get({
    "waitTime": DEFAULT_WAIT_TIME
  })
    .then(({ waitTime: restoredValue }) => {
      document.querySelector("#waitTime").value = restoredValue;
    }, (err) => {
      console.log(`SatNOGS Options Error: ${error}`);
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("change", saveOptions);
