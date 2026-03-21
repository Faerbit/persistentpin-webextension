import {setupMenuItems, removeMenuItems} from "./contextmenu.js";
import {storage} from "./prefs.js";
import {onError} from "./common.js";

// global variables

let pinned_websites = null;
let selection = null;

function save() {
    let settingWebsites = storage.set_pinned_websites(pinned_websites);
    settingWebsites.then(null, onError);
}

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
        save();
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
        save();
        selection.id = parseInt(selection.id) + 1;
    }
    renderTable();
}

function _delete(_event) {
    if (selection == null) {
        return;
    }
    const index = parseInt(selection.id);
    pinned_websites.splice(index, 1);
    save();
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
        save();
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
                save();
                renderTable(selection.id);
            }
            else {
                pinned_websites.splice(index, 1);
                save();
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
                    save();
                    renderTable(pinned_websites.length - 1);
                }
                else {
                    pinned_websites.splice(targetIndex, 0,
                        editField.value);
                    save();
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

function grabContextMenuSlider(_event) {
    if (this.checked) {
        let settingContextMenu = storage.set_grab_context_menu_item(true);
        settingContextMenu.then(null, onError);
        setupMenuItems();
    }
    else {
        let settingContextMenu = storage.set_grab_context_menu_item(false);
        settingContextMenu.then(null, onError);
        removeMenuItems();
    }
}

function reopenContextMenuSlider(_event) {
    if (this.checked) {
        let settingContextMenu = storage.set_reopen_context_menu_item(true);
        settingContextMenu.then(null, onError);
        setupMenuItems();
    }
    else {
        let settingContextMenu = storage.set_reopen_context_menu_item(false);
        settingContextMenu.then(null, onError);
        removeMenuItems();
    }
}

function syncSlider(_event) {
    if (this.checked) {
        let settingSync = storage.set_syncing(true);
        settingSync.then(load, onError);
    }
    else {
        let settingSync = storage.set_syncing(false);
        settingSync.then(load, onError);
    }
}

function pinInAllWindowsSlider() {
    let settingPinInAllWindowsSlider = storage.set_pin_in_all_windows(!!this.checked);
    settingPinInAllWindowsSlider.then(null, onError);
}

function i18n(element, i18n_name) {
    element.innerHTML = element.innerHTML.replace(
        "__MSG_" + i18n_name + "__",
        browser.i18n.getMessage(i18n_name));
}

function load() {
    let gettingWebsites = storage.get_pinned_websites();
    gettingWebsites.then(finishLoading, onError);

    const grab_context_menu = storage.get_grab_context_menu_item()
    if (grab_context_menu == null) {
        document.getElementById("grabContextMenuSlider").checked = false;
    }
    else {
        document.getElementById("grabContextMenuSlider").checked = grab_context_menu;
    }

    const reopen_context_menu = storage.get_reopen_context_menu_item();
    if (reopen_context_menu == null) {
        document.getElementById("reopenContextMenuSlider").checked = false;
    }
    else {
        document.getElementById("reopenContextMenuSlider").checked = reopen_context_menu;
    }

    let gettingPinInAllWindows = storage.get_pin_in_all_windows();
    gettingPinInAllWindows.then(finishLoading4, onError);
}

function init() {
    load();

    let gettingSyncing = storage.get_syncing();
    gettingSyncing.then(finishLoading3, onError);

    document.getElementById("btn-grab").addEventListener("click", grab);
    i18n(document.getElementById("btn-grab"), "grabButton");
    document.getElementById("btn-add").addEventListener("click", add);
    i18n(document.getElementById("btn-add"), "addButton");
    document.getElementById("btn-edit").addEventListener("click", edit);
    i18n(document.getElementById("btn-edit"), "editButton");
    document.getElementById("btn-up").addEventListener("click", up);
    i18n(document.getElementById("btn-up"), "upButton");
    document.getElementById("btn-down").addEventListener("click", down);
    i18n(document.getElementById("btn-down"), "downButton");
    document.getElementById("btn-delete").addEventListener("click", _delete);
    i18n(document.getElementById("btn-delete"), "deleteButton");
    i18n(document.getElementsByTagName("th")[0], "websitesTableHeader");
    document.getElementById("grabContextMenuSlider").addEventListener("change", grabContextMenuSlider);
    i18n(document.getElementById("grabContextMenuSliderLabel"), "grabContextMenuSlider");
    document.getElementById("reopenContextMenuSlider").addEventListener("change", reopenContextMenuSlider);
    i18n(document.getElementById("reopenContextMenuSliderLabel"), "reopenContextMenuSlider");
    document.getElementById("syncSlider").addEventListener("change", syncSlider);
    i18n(document.getElementById("syncSliderLabel"), "syncSlider");
    document.getElementById("pinInAllWindowsSlider").addEventListener("change", pinInAllWindowsSlider);
    i18n(document.getElementById("pinInAllWindowsSliderLabel"), "pinInAllWindowsSlider");

    browser.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
        if (message === "refresh") {
            load();
        }
    });
}

function finishLoading(item) {
    if (item.pinned_websites == null) {
        pinned_websites = []
    }
    else {
        pinned_websites = item.pinned_websites
    }
    renderTable();
}

function finishLoading3(item) {
    document.getElementById("syncSlider").checked = item;
}

function finishLoading4(item) {
    document.getElementById("pinInAllWindowsSlider").checked = !!item.pin_in_all_windows;
}


document.addEventListener("DOMContentLoaded", init);
