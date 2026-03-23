import {onError} from "./common.js";

class Storage {
    async get_syncing() {
        let p = await browser.storage.local.get("sync");
        if (!("sync" in p)) {
            return false;
        } else {
            return p.sync;
        }
    }

    async set_syncing(syncing) {
        if (syncing) {
            let getSynced = await browser.storage.sync.get("synced");
            if (getSynced.synced == null || !getSynced.synced) {
                let getPW = await browser.storage.local.get("pinned_websites");
                await browser.storage.sync.set({"pinned_websites": getPW.pinned_websites});
                let getCMI = await browser.storage.local.get("context_menu_item");
                await browser.storage.sync.set({"context_menu_item": getCMI.context_menu_item});
                await browser.storage.sync.set({"synced": true});
            }
        } else {
            let getPW = await browser.storage.sync.get("pinned_websites");
            await browser.storage.local.set({"pinned_websites": getPW.pinned_websites});
            let getCMI = await browser.storage.sync.get("context_menu_item");
            await browser.storage.local.set({"context_menu_item": getCMI.context_menu_item});
        }
        return browser.storage.local.set({"sync": syncing});
    }

    async get_pinned_websites() {
        let syncing = await this.get_syncing();
        let p;
        if (syncing) {
            p = await browser.storage.sync.get("pinned_websites");
        } else {
            p = await browser.storage.local.get("pinned_websites");
        }
        if (!("pinned_websites" in p)) {
            return [];
        } else {
            return p.pinned_websites;
        }
    }

    async set_pinned_websites(pinned_websites) {
        let syncing = await this.get_syncing();
        if (syncing) {
            browser.storage.sync.set({"pinned_websites": pinned_websites}).then(null, onError);
        } else {
            browser.storage.local.set({"pinned_websites": pinned_websites}).then(null, onError);
        }
    }

    async get_pin_in_all_windows() {
        let syncing = await this.get_syncing();
        let p;
        if (syncing) {
            p = await browser.storage.sync.get("pin_in_all_windows");
        } else {
            p = await browser.storage.local.get("pin_in_all_windows");
        }
        if (!("pin_in_all_windows" in p)) {
            return false;
        } else {
            return p.pin_in_all_windows;
        }
    }

    async set_pin_in_all_windows(pin) {
        let syncing = await this.get_syncing();

        if (syncing) {
            browser.storage.sync.set({"pin_in_all_windows": !!pin}).then(null, onError);
        } else {
            browser.storage.local.set({"pin_in_all_windows": !!pin}).then(null, onError);
        }
    }

    async get_grab_context_menu_item() {
        let syncing = await this.get_syncing();
        let p;
        if (syncing) {
            p = await browser.storage.sync.get("context_menu_item");
        } else {
            p = await browser.storage.local.get("context_menu_item");
        }
        if (!("context_menu_item" in p)) {
            return false;
        } else {
            return p.context_menu_item;
        }
    }

    async set_grab_context_menu_item(value) {
        let syncing = await this.get_syncing();
        if (syncing) {
            browser.storage.sync.set({"context_menu_item": value}).then(null, onError);
        } else {
            browser.storage.local.set({"context_menu_item": value}).then(null, onError);
        }
    }

    async get_reopen_context_menu_item() {
        let syncing = await this.get_syncing();
        let p;
        if (syncing) {
            p = await browser.storage.sync.get("reopen_context_menu_item");
        } else {
            p = await browser.storage.local.get("reopen_context_menu_item");
        }
        if (!("reopen_context_menu_item" in p)) {
            return false;
        } else {
            return p.reopen_context_menu_item;
        }
    }

    async set_reopen_context_menu_item(value) {
        let syncing = await this.get_syncing();
        if (syncing) {
            browser.storage.sync.set({"reopen_context_menu_item": value}).then(null, onError);
        } else {
            browser.storage.local.set({"reopen_context_menu_item": value}).then(null, onError);
        }
    }
}

export var storage = new Storage();
