// PagePulse - Background Service Worker
// Manifest V3 requires a service worker instead of background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYSIS_COMPLETE') {
    // Future: store results, send notifications, etc.
    console.log('PagePulse: Analysis complete', message.data);
  }
  return true;
});
