import {storage} from "./prefs.js";
import {executeTabOpening} from "./background.js";
import {onError} from "./common.js ";

const grabMenuItemParams = {
    id: "grab_current",
    title: browser.i18n.getMessage("grabButton"),
    contexts: ["tab"]
}

const reopenMenuItemParams = {
    id: "reopen",
    title: browser.i18n.getMessage("reopenButton"),
    contexts: ["tab"]
}
function grabPins() {
    const pinned_tabs = browser.tabs.query({
        pinned: true
    });
    pinned_tabs.then((tabs) => {
        let pinned_websites = [];
        tabs.forEach((element) => {
            pinned_websites.push(element.url);
        });
        let settingWebsites = storage.set_pinned_websites(pinned_websites);
        settingWebsites.then(null, onError);
        let sending = browser.runtime.sendMessage("refresh");
        sending.then(null, onError);
    });
}

export function setupMenuItems() {
    browser.contextMenus.removeAll().then(() => {
    storage.get_grab_context_menu_item().then((grab_menu_item,) => {
    storage.get_reopen_context_menu_item().then((reopen_menu_item) => {
        console.log(`grab_menu_item: ${grab_menu_item}`);
        console.log(`reopen_menu_item: ${reopen_menu_item}`);
        if (grab_menu_item) {
            browser.contextMenus.create(grabMenuItemParams, () => {
                if (browser.runtime.lastError) {
                    console.log(`Error creating grab menu item: ${browser.runtime.lastError}`);
                } else {
                    console.log("added grab menu item");
                }
            });
        }
        if (reopen_menu_item) {
            browser.contextMenus.create(reopenMenuItemParams, () => {
                if (browser.runtime.lastError) {
                    console.log(`Error creating reopen menu item: ${browser.runtime.lastError}`);
                } else {
                    console.log("added reopen menu item");
                }
            });
        }

        if (! (grab_menu_item || reopen_menu_item)) {
            return;
        }
        browser.contextMenus.onClicked.addListener((info, _tab) => {
            if (info.menuItemId === "grab_current") {
                grabPins()
            }
            else if (info.menuItemId === "reopen") {
                executeTabOpening()
            }
        });
    });
    });
    });
}

export function removeMenuItems() {
    storage.get_grab_context_menu_item().then((grab_menu_item,) => {
        storage.get_reopen_context_menu_item().then((reopen_menu_item) => {
            if (!grab_menu_item) {
                browser.contextMenus.remove("grab_current").then(null, onError);
            }
            if (!reopen_menu_item) {
                browser.contextMenus.remove("reopen").then(null, onError);
            }
        })
    })
}
