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

const resetMenuItemParams = {
    id: "reset_tab",
    title: browser.i18n.getMessage("resetButton"),
    contexts: ["tab"],
    visible: false
}

let resetMenuItemExists = false;
let resetShowToken = 0;

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

async function isResetEligible(tab) {
    if (!tab || !tab.pinned) {
        return false;
    }
    const pinned_websites = await storage.get_pinned_websites();
    return pinned_websites.includes(tab.url);
}

function resetTab(tab) {
    storage.get_pinned_websites().then((pinned_websites) => {
        const matchedUrl = pinned_websites.find((website) => website === tab.url);
        if (!matchedUrl) {
            return;
        }
        browser.tabs.update(tab.id, {url: matchedUrl, loadReplace: true}).then(null, onError);
    });
}

export async function setupMenuItems() {

    await browser.contextMenus.removeAll();
    const grab_menu_item = await storage.get_grab_context_menu_item();
    const reopen_menu_item = await storage.get_reopen_context_menu_item();
    const reset_menu_item = await storage.get_reset_context_menu_item();

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

    resetMenuItemExists = false;
    if (reset_menu_item) {
        browser.contextMenus.create(resetMenuItemParams, () => {
            if (browser.runtime.lastError) {
                console.log(`Error creating reset menu item: ${browser.runtime.lastError}`);
            } else {
                resetMenuItemExists = true;
            }
        });
    }
}

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "grab_current") {
        grabPins()
    }
    else if (info.menuItemId === "reopen") {
        executeTabOpening()
    }
    else if (info.menuItemId === "reset_tab") {
        resetTab(tab)
    }
});

browser.contextMenus.onShown.addListener((info, tab) => {
    if (!resetMenuItemExists) {
        return;
    }
    const token = ++resetShowToken;
    isResetEligible(tab).then((eligible) => {
        if (token !== resetShowToken) {
            // A newer onShown fired while this lookup was in flight (e.g. the user
            // right-clicked a different tab before this one resolved) — discard
            // this stale result so it can't overwrite the currently-open menu.
            return;
        }
        browser.contextMenus.update("reset_tab", {visible: eligible}).then(() => {
            browser.contextMenus.refresh();
        }, onError);
    });
});
