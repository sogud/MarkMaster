function polling() {
  // setTimeout(polling, 2000);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    console.log('file: background.ts:7 > chrome.tabs.query > tab:', tab);

    if (tab) {
      // chrome.tabs.sendMessage(tab.id, 'ping');
    }
  });
}

polling();
