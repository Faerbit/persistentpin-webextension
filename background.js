browser.windows.onCreated.addListener(function() {
    browser.tabs.create({url: "https://github.com", "pinned": true,
        "active": false});
});
