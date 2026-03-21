import {storage} from "./prefs.js";
import {executeTabOpening, onError} from "./common.js ";

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
        storage.set_pinned_websites(pinned_websites).then(null, onError);
        browser.runtime.sendMessage("refresh").then(null, onError);
    });
}

export async function setupMenuItems() {

    await browser.contextMenus.removeAll();
    const grab_menu_item = await storage.get_grab_context_menu_item();
    const reopen_menu_item = await storage.get_reopen_context_menu_item();

    if (grab_menu_item) {
        browser.contextMenus.create(grabMenuItemParams, () => {
            if (browser.runtime.lastError) {
                console.log(`Error creating grab menu item: ${browser.runtime.lastError}`);
            }
        });
    }

    if (reopen_menu_item) {
        browser.contextMenus.create(reopenMenuItemParams, () => {
            if (browser.runtime.lastError) {
                console.log(`Error creating reopen menu item: ${browser.runtime.lastError}`);
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
}
