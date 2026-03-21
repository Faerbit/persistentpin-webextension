class Storage {
    async get_syncing() {
        let syncing = await browser.storage.local.get("sync");
        if (syncing.sync == null) {
            return false;
        } else {
            return syncing.sync;
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
        if (syncing) {
            return browser.storage.sync.get("pinned_websites");
        } else {
            return browser.storage.local.get("pinned_websites");
        }
    }

    async set_pinned_websites(pinned_websites) {
        let syncing = await this.get_syncing();
        if (syncing) {
            return browser.storage.sync.set({"pinned_websites": pinned_websites});
        } else {
            return browser.storage.local.set({"pinned_websites": pinned_websites});
        }
    }

    async get_pin_in_all_windows() {
        let syncing = await this.get_syncing();
        if (syncing) {
            return browser.storage.sync.get("pin_in_all_windows");
        } else {
            return browser.storage.local.get("pin_in_all_windows");
        }
    }

    async set_pin_in_all_windows(pin) {
        let syncing = await this.get_syncing();

        if (syncing) {
            return browser.storage.sync.set({"pin_in_all_windows": !!pin});
        } else {
            return browser.storage.local.set({"pin_in_all_windows": !!pin});
        }
    }

    async get_grab_context_menu_item() {
        let syncing = await this.get_syncing();
        if (syncing) {
            const o = await browser.storage.sync.get("context_menu_item");
            return o.context_menu_item;
        } else {
            const o = await browser.storage.local.get("context_menu_item");
            return o.context_menu_item;
        }
    }

    async set_grab_context_menu_item(value) {
        let syncing = await this.get_syncing();
        if (syncing) {
            return browser.storage.sync.set({"context_menu_item": value});
        } else {
            return browser.storage.local.set({"context_menu_item": value});
        }
    }

    async get_reopen_context_menu_item() {
        let syncing = await this.get_syncing();
        if (syncing) {
            const o = await browser.storage.sync.get("reopen_context_menu_item");
            return o.reopen_context_menu_item
        } else {
            const o = await browser.storage.local.get("reopen_context_menu_item");
            return o.reopen_context_menu_item
        }
    }

    async set_reopen_context_menu_item(value) {
        let syncing = await this.get_syncing();
        if (syncing) {
            return browser.storage.sync.set({"reopen_context_menu_item": value});
        } else {
            return browser.storage.local.set({"reopen_context_menu_item": value});
        }
    }
}

export var storage = new Storage();
