import { addMenuItem } from "./contextmenu.js";
import { storage } from "./prefs.js";

// Flag to mark whether the initialization had run
var initialized = false;

function onError(error) {
    console.log(`Error: ${error}`);
}

function openTabs(item, openInAll, newWindow) {
    // Set the flag in the beginning, we don't want to wait for promises to resolve for initialization
    initialized = true;
    let getExistingPinnedTabs = browser.tabs.query({ "pinned": true });

    getExistingPinnedTabs.then(
        (existingPinnedTabs) => {
            let tabs = existingPinnedTabs;
            if (newWindow && newWindow.id) {
                // Filter out tabs only from the current window
                tabs = tabs.filter(tab => tab.windowId === newWindow.id);
            }
            let pinIds = tabs.map( tab => tab.id );
            return browser.tabs.remove(pinIds);
        }
    ).then(() => {
        let pinned_websites = item.pinned_websites;

        // Resolve windowIds that will be targeted by new pins
        new Promise((resolve) => {
            if (typeof newWindow !== 'undefined') {
                // We only want to pin tabs in the new window
                resolve([newWindow.id]);
                return;
            }

            if (openInAll) {
                browser.windows.getAll().then(allWindows => {
                    resolve(allWindows.map(currentWindow => currentWindow.id));
                })
                return;
            } else {
                // Resolve undefined to open it only in the current window
                resolve([undefined]);
                return;
            }
        }).then(windowIds => {
            windowIds.forEach(windowId => {
                pinned_websites.forEach(function(website) {
                    browser.tabs.create({
                        active: false,
                        pinned: false,
                        url: website,
                        windowId,
                    }).then((tab) => {
                        browser.tabs.update(tab.id, { pinned: true });
                    });
                })
            })
        });
    });

}

function setupMenuItem(item) {
    if (item.context_menu_item != null && item.context_menu_item) {
        addMenuItem();
    }
}

function executeTabOpening(newWindow) {
    let getWebsites = storage.get_pinned_websites();
    let inAllWindows = storage.get_pin_in_all_windows().then(item => !!item.pin_in_all_windows);
    getWebsites.then((item) => {
        inAllWindows.then((openInAll) => {
            if (!newWindow || openInAll === true) {
                openTabs(item, openInAll, newWindow)
            }
        });
    }, onError);
    let gettingContextMenu = storage.get_context_menu_item();
    gettingContextMenu.then(setupMenuItem, onError);
}

if (initialized == false) {
    executeTabOpening();

    browser.windows.onCreated.addListener((newWindow) => {
        executeTabOpening(newWindow);
    })
}
