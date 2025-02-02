chrome.cookies.onChanged.addListener((changeInfo) => {
    console.log("Cookie changed:", changeInfo);
    chrome.storage.local.set({ lastCookieChange: changeInfo });
});
