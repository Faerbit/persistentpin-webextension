import {setupMenuItems} from "./contextmenu.js";
import {storage} from "./prefs.js";
import {onError} from "./common.js";

// global variables

let pinned_websites = null;
let selection = null;

function select(event) {
    Array.from(document.getElementsByClassName("selected"))
        .forEach(function(element) {
            element.className = "";
        });

    // currentTarget makes sure to target the element the listener has been defined to. Here, you're sure to target the TR element
    const targetEle = event.currentTarget;

    // So your selection is the TD inside the TR
    selection = targetEle.querySelector('td');
    targetEle.className = "selected";
}

function renderTable(newSelection) {
    if (newSelection != null) {
        selection = null;
    }
    const new_tbody = document.createElement("tbody");
    new_tbody.id = "tbl-websites";
    const old_tbody = document.getElementById("tbl-websites");
    for (let i = 0; i<pinned_websites.length; i++) {
        const tr = document.createElement("tr");
        tr.addEventListener("click", select);
        const td = document.createElement("td");
        tr.appendChild(td);
        td.innerText = pinned_websites[i];
        td.id = `${i}`;
        if (newSelection != null && newSelection === i
            || selection != null && parseInt(selection.id) === i) {
            selection = td;
            tr.className = "selected";
        }
        new_tbody.appendChild(tr);
    }
    if (pinned_websites.length === 0) {
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        tr.appendChild(td);
        td.innerText = browser.i18n.getMessage("emptyRow");
        td.className = "empty";
        new_tbody.appendChild(tr);
    }
    old_tbody.parentNode.replaceChild(new_tbody, old_tbody);
}

function up(_event) {
    if (selection == null) {
        return;
    }
    const index = parseInt(selection.id);
    if (index === 0) {
        return;
    }
    else {
        const tmp = pinned_websites[index - 1];
        pinned_websites[index - 1] = pinned_websites[index];
        pinned_websites[index] = tmp;
        storage.set_pinned_websites(pinned_websites).then(null, onError);
        selection.id = parseInt(selection.id) - 1;
    }
    renderTable();
}

function down(_event) {
    if (selection == null) {
        return;
    }
    const index = parseInt(selection.id);
    if (index === pinned_websites.length - 1) {
        return;
    }
    else {
        const tmp = pinned_websites[index + 1];
        pinned_websites[index + 1] = pinned_websites[index];
        pinned_websites[index] = tmp;
        storage.set_pinned_websites(pinned_websites).then(null, onError);
        selection.id = parseInt(selection.id) + 1;
    }
    renderTable();
}

function delete_(_event) {
    if (selection == null) {
        return;
    }
    const index = parseInt(selection.id);
    pinned_websites.splice(index, 1);
    storage.set_pinned_websites(pinned_websites).then(null, onError);
    selection = null;
    renderTable();
}

function grab(_event) {
    const pinned_tabs = browser.tabs.query({
        pinned: true
    });
    pinned_tabs.then(function(tabs) {
        pinned_websites = [];
        tabs.forEach(function(element) {
            pinned_websites.push(element.url);
        });
        storage.set_pinned_websites(pinned_websites).then(null, onError);
        selection = null;
        renderTable();
    });
}

function edit(_event) {
    if (selection == null) {
        return;
    }
    const oldContent = selection.textContent;
    const editField = document.createElement("input");
    editField.className = "edit";
    editField.type = "text";
    editField.value = oldContent;
    editField.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            const index = parseInt(selection.id);
            if (editField.value !== "") {
                pinned_websites[index] = editField.value;
                storage.set_pinned_websites(pinned_websites).then(null, onError);
                renderTable(selection.id);
            }
            else {
                pinned_websites.splice(index, 1);
                storage.set_pinned_websites(pinned_websites).then(null, onError);
                selection = null;
                renderTable();
            }
        }
        if (event.key === "Escape") {
            renderTable(selection?.id );
        }
    });
    selection.textContent = "";
    selection.appendChild(editField);
    editField.focus();
}

function add(_event) {
    Array.from(document.getElementsByClassName("selected"))
        .forEach(function(element) {
            element.className = "";
        });
    const tbody = document.getElementById("tbl-websites");
    const tr = document.createElement("tr");
    let targetIndex = null;
    if (selection == null) {
        if (pinned_websites.length === 0) {
            tbody.removeChild(tbody.firstChild);
        }
        tbody.appendChild(tr);
    }
    else {
        selection.parentNode.parentNode.insertBefore(tr,
            selection.parentNode.nextSibling);
        targetIndex = parseInt(selection.id) + 1
    }
    tr.addEventListener("click", select);
    tr.className = "selected";
    const td = document.createElement("td");
    tr.appendChild(td);
    const editField = document.createElement("input");
    editField.className = "edit";
    editField.type = "text";
    editField.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            if (editField.value !== "") {
                if (selection == null) {
                    pinned_websites.push(editField.value);
                    storage.set_pinned_websites(pinned_websites).then(null, onError);
                    renderTable(pinned_websites.length - 1);
                }
                else {
                    pinned_websites.splice(targetIndex, 0,
                        editField.value);
                    storage.set_pinned_websites(pinned_websites).then(null, onError);
                    renderTable(targetIndex);
                }
            }
            else {
                renderTable(selection.id);
            }
        }
        if (event.key === "Escape") {
            renderTable();
        }
    });
    td.appendChild(editField);
    editField.focus();
}

async function grabContextMenuSlider(_event) {
    await storage.set_grab_context_menu_item(!!this.checked)
    await setupMenuItems();
}

async function reopenContextMenuSlider(_event) {
    await storage.set_reopen_context_menu_item(!!this.checked);
    await setupMenuItems();
}

async function syncSlider(_event) {
    await storage.set_syncing(!!this.checked);
}

async function pinInAllWindowsSlider() {
    await storage.set_pin_in_all_windows(!!this.checked);
}

async function load() {
    pinned_websites = await storage.get_pinned_websites();
    renderTable();

    document.getElementById("grabContextMenuSlider").checked = await storage.get_grab_context_menu_item()

    document.getElementById("reopenContextMenuSlider").checked = await storage.get_reopen_context_menu_item();

    document.getElementById("pinInAllWindowsSlider").checked = await storage.get_pin_in_all_windows();

    document.getElementById("syncSlider").checked = await storage.get_syncing();
}

function i18n() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const messageKey = element.getAttribute('data-i18n');
        const localizedString = browser.i18n.getMessage(messageKey);

        if (localizedString) {
            element.textContent = localizedString;
        }
        else {
            element.textContent = "!!! NO MESSAGE EXISTS !!!";
        }
    });
}

async function init() {
    document.getElementById("btn-grab").addEventListener("click", grab);
    document.getElementById("btn-add").addEventListener("click", add);
    document.getElementById("btn-edit").addEventListener("click", edit);
    document.getElementById("btn-up").addEventListener("click", up);
    document.getElementById("btn-down").addEventListener("click", down);
    document.getElementById("btn-delete").addEventListener("click", delete_);
    document.getElementById("grabContextMenuSlider").addEventListener("change", grabContextMenuSlider);
    document.getElementById("reopenContextMenuSlider").addEventListener("change", reopenContextMenuSlider);
    document.getElementById("syncSlider").addEventListener("change", syncSlider);
    document.getElementById("pinInAllWindowsSlider").addEventListener("change", pinInAllWindowsSlider);

    i18n();

    await load();

    browser.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
        if (message === "refresh") {
            load();
        }
    });
}

document.addEventListener("DOMContentLoaded", init);
