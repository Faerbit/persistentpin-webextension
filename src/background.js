import { addMenuItem } from "./contextmenu.js";
import { storage } from "./prefs.js";

// only open on the inital startup
var opened_tabs = false;

function onError(error) {
    console.log(`Error: ${error}`);
}

function openTabs(item) {
    let getExistingPinnedTabs = browser.tabs.query({ "pinned": true });
    getExistingPinnedTabs.then(
        (existingPinnedTabs) => {
            let pinIds = existingPinnedTabs.map( tab => tab.id );
            return browser.tabs.remove(pinIds);
        }
    ).then(() => {
        let pinned_websites = item.pinned_websites;
        pinned_websites.forEach(function(website) {
            browser.tabs.create({url: website, "pinned": true,
                "active": false});
        });
        opened_tabs = true;
    });
}

function setupMenuItem(item) {
    if (item.context_menu_item != null && item.context_menu_item) {
        addMenuItem();
    }
}


if (opened_tabs == false) {
    let getWebsites = storage.get_pinned_websites();
    getWebsites.then(openTabs, onError);
    let gettingContextMenu = storage.get_context_menu_item();
    gettingContextMenu.then(setupMenuItem, onError);
}
