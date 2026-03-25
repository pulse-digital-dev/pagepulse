// PagePulse - Background Service Worker
// Manifest V3 requires a service worker instead of background.js

// ---- ExtensionPay Integration ----
// IMPORTANT: Replace 'PagePulse' with your actual ExtensionPay extension ID
// if it differs from the registered name
importScripts('ExtPay.js');
var extpay = ExtPay('biihgmkmmdihocjmdfedmhmkdmepfcoc');
extpay.startBackground();

// ---- Message Handler ----
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYSIS_COMPLETE') {
    console.log('PagePulse: Analysis complete', message.data);
  }

  // Handle payment status check from popup
  if (message.type === 'CHECK_PAYMENT_STATUS') {
    extpay.getUser().then(user => {
      sendResponse({
        paid: user.paid,
        paidAt: user.paidAt,
        trialStartedAt: user.trialStartedAt,
        installedAt: user.installedAt
      });
    }).catch(err => {
      console.error('ExtPay error:', err);
      sendResponse({ paid: false, error: err.message });
    });
    return true; // Keep message channel open for async response
  }

  // Handle open payment page request
  if (message.type === 'OPEN_PAYMENT_PAGE') {
    extpay.openPaymentPage();
    sendResponse({ ok: true });
  }

  return true;
});

// ---- Payment Status Change Listener ----
extpay.onPaid.addListener(user => {
  console.log('PagePulse: User upgraded to Pro!', user);
  // Notify all open popups about the upgrade
  chrome.runtime.sendMessage({ type: 'PAYMENT_STATUS_CHANGED', paid: true });
});
