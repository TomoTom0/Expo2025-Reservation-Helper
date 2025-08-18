// Background script for API access
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchExpoData') {
    fetch('https://expo.ebii.net/api/data')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    // 非同期レスポンスを使用することを示す
    return true;
  }
});