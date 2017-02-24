// only open on the inital startup
var opened_tabs = false;

function onError(error) {
    console.log(`Error: ${error}`);
}

function openTabs(item) {
    var pinned_websites = item.pinned_websites;
    pinned_websites.forEach(function(website) {
        browser.tabs.create({url: website, "pinned": true,
            "active": false});
    });
    opened_tabs = true;
}

browser.windows.onCreated.addListener(function() {
    if (opened_tabs == false) {
        let getWebsites = browser.storage.local.get("pinned_websites");
        getWebsites.then(openTabs, onError);
    }
});
