document.getElementById('inspect').addEventListener('click', async () => {
  const output = document.getElementById('result');
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const url = new URL(tab.url);
    if (url.protocol !== 'https:' || !(url.hostname === 'dhl.de' || url.hostname.endsWith('.dhl.de'))) throw new Error('Bitte eine HTTPS-Seite auf dhl.de öffnen.');
    const [response] = await chrome.scripting.executeScript({target: {tabId: tab.id}, func: () => globalThis.DHLFormDetector ? {formRecognized: !!DHLFormDetector.detect(), fields: DHLFormDetector.diagnose()} : {error: 'Erweiterung neu laden und die DHL-Seite aktualisieren.'}});
    output.textContent = JSON.stringify(response.result, null, 2);
  } catch (error) { output.textContent = error.message; }
});
