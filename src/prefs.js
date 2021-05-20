function onError(error) {
    console.log(`Error: ${error}`);
}

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
            let getPW = await browser.storage.local.get("pinned_websites");
            browser.storage.sync.set({"pinned_websites": getPW.pinned_websites});
            let getCMI = await browser.storage.local.get("context_menu_item");
            browser.storage.sync.set({"context_menu_item": getCMI.context_menu_item});
        } else {
            let getPW = await browser.storage.sync.get("pinned_websites");
            browser.storage.local.set({"pinned_websites": getPW.pinned_websites});
            let getCMI = await browser.storage.sync.get("context_menu_item");
            browser.storage.local.set({"context_menu_item": getCMI.context_menu_item});
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

    async get_context_menu_item() {
        let syncing = await this.get_syncing();
        if (syncing) {
            return browser.storage.sync.get("context_menu_item");
        } else {
            return browser.storage.local.get("context_menu_item");
        }
    }

    async set_context_menu_item(context_menu_item) {
        let syncing = await this.get_syncing();
        if (syncing) {
            return browser.storage.sync.set({"context_menu_item": context_menu_item});
        } else {
            return browser.storage.local.set({"context_menu_item": context_menu_item});
        }
    }
}

export var storage = new Storage();
