let state_guard = 0;

chrome.storage.sync.get(['status'], function (result) {
  if (result.status === undefined) {
    chrome.storage.sync.set({ status: 0 });
  } else {
    state_guard = Number(result.status);
  }
});
chrome.storage.sync.get(['pass'], function (result) {
  if (result.pass === undefined) {
    chrome.storage.sync.set({ pass: '0000' });
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
  if (tab.url === 'chrome://history/' && state_guard === 1) {
    chrome.tabs.update(tabId, { url: chrome.extension.getURL('lock.html') });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.operation === 'get_pass') {
    getPass().then((pass) => {
      chrome.runtime.sendMessage({ operation: 'received_pass', pass: pass });
    });
    sendResponse({ status: 'good' });
  } else if (request.operation === 'set_pass') {
    sendResponse({ status: setPass(request.password) });
  } else if (request.operation === 'set_state_guard') {
    state_guard = request.value;
    chrome.storage.sync.set({ status: state_guard });
  } else if (request.operation === 'get_state_guard') {
    getState().then((status) => {
      chrome.runtime.sendMessage({ operation: 'received_state', status: status });
    });
  }
});

async function getPass() {
  let key = await waitPass();

  function waitPass() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['pass'], function (result) {
        resolve(result.pass);
      });
    });
  }

  if (key === undefined) {
    key = 0;
  }
  return key;
}

async function getState() {
  let status = await waitState();

  function waitState() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['status'], function (result) {
        resolve(Number(result.status));
      });
    });
  }

  if (status === undefined) {
    status = 0;
  }
  return status;
}

function setPass(password) {
  chrome.storage.sync.set({ pass: password });
}
