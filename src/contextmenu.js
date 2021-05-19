const menuItemParams = {
    id: "grab_current",
    title: browser.i18n.getMessage("grabButton"),
    contexts: ["tab"]
}

export function addMenuItem() {
    browser.contextMenus.create(menuItemParams, () => {
      if (browser.runtime.lastError) {
        console.log(`Error: ${browser.runtime.lastError}`);
      } else {
        console.log("Item created successfully");
      }
    });

    browser.contextMenus.onClicked.addListener((info, tab) => {
        var pinned_tabs = browser.tabs.query({
            pinned: true
        });
        pinned_tabs.then((tabs) => {
            pinned_websites = [];
            tabs.forEach(function(element) {
                pinned_websites.push(element.url);
            });
            let settingWebsites = browser.storage.local.set({"pinned_websites": pinned_websites});
            settingWebsites.then(null, onError);
        });
    });
}

export function removeMenuItem() {
    browser.contextMenus.remove("grab_current");
}
