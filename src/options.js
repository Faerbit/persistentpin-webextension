import { addMenuItem, removeMenuItem } from "./contextmenu.js";
import { storage } from "./prefs.js";

// global variables

var pinned_websites = null;
var selection = null;

function save() {
    let settingWebsites = storage.set_pinned_websites(pinned_websites);
    settingWebsites.then(null, onError);
}

function select(event) {
    Array.from(document.getElementsByClassName("selected"))
        .forEach(function(element) {
            element.className = "";
        });
    var targetEle = event.target;
    selection = targetEle;
    targetEle.parentNode.className = "selected";
}

function renderTable(newSelection) {
    if (newSelection != null) {
        selection = null;
    }
    var new_tbody = document.createElement("tbody");
    new_tbody.id = "tbl-websites";
    var old_tbody = document.getElementById("tbl-websites");
    for (var i = 0; i<pinned_websites.length; i++) {
        var tr = document.createElement("tr");
        tr.addEventListener("click", select);
        var td = document.createElement("td");
        tr.appendChild(td);
        td.innerText = pinned_websites[i];
        td.id = i;
        if (newSelection != null && newSelection == i
            || selection != null && parseInt(selection.id) == i) {
            selection = td;
            tr.className = "selected";
        }
        new_tbody.appendChild(tr);
    }
    if (pinned_websites.length == 0) {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        tr.appendChild(td);
        td.innerText = browser.i18n.getMessage("emptyRow");
        td.className = "empty";
        new_tbody.appendChild(tr);
    }
    old_tbody.parentNode.replaceChild(new_tbody, old_tbody);
}

function up(event) {
    if (selection == null) {
        return;
    }
    var index = parseInt(selection.id);
    if (index == 0) {
        return;
    }
    else {
        var tmp = pinned_websites[index - 1];
        pinned_websites[index - 1] = pinned_websites[index];
        pinned_websites[index] = tmp;
        save();
        selection.id = parseInt(selection.id) - 1;
    }
    renderTable();
}

function down(event) {
    if (selection == null) {
        return;
    }
    var index = parseInt(selection.id);
    if (index == pinned_websites.length - 1) {
        return;
    }
    else {
        var tmp = pinned_websites[index + 1];
        pinned_websites[index + 1] = pinned_websites[index];
        pinned_websites[index] = tmp;
        save();
        selection.id = parseInt(selection.id) + 1;
    }
    renderTable();
}

function _delete(event) {
    if (selection == null) {
        return;
    }
    var index = parseInt(selection.id);
    pinned_websites.splice(index, 1);
    save();
    selection = null;
    renderTable();
}

function grab(event) {
    var pinned_tabs = browser.tabs.query({
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

function edit(event) {
    if (selection == null) {
        return;
    }
    var oldContent = selection.textContent;
    var editField = document.createElement("input");
    editField.className = "edit";
    editField.type = "text";
    editField.value = oldContent;
    editField.addEventListener("keyup", function(event) {
        // enter key
        if (event.keyCode == 13) {
            var index = parseInt(selection.id);
            if (editField.value != "") {
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
        // escape key
        if (event.keyCode == 27) {
            renderTable(selection.id);
        }
    });
    selection.textContent = "";
    selection.appendChild(editField);
    editField.focus();
}

function add(event) {
    Array.from(document.getElementsByClassName("selected"))
        .forEach(function(element) {
            element.className = "";
        });
    var tbody = document.getElementById("tbl-websites");
    var tr = document.createElement("tr");
    if (selection == null) {
        if (pinned_websites.length == 0) {
            tbody.removeChild(tbody.firstChild);
        }
        tbody.appendChild(tr);
    }
    else {
        selection.parentNode.parentNode.insertBefore(tr,
            selection.parentNode.nextSibling);
    }
    tr.addEventListener("click", select);
    tr.className = "selected";
    var td = document.createElement("td");
    tr.appendChild(td);
    var editField = document.createElement("input");
    editField.className = "edit";
    editField.type = "text";
    editField.addEventListener("keyup", function(event) {
        // enter key
        if (event.keyCode == 13) {
            if (editField.value != "") {
                if (selection == null) {
                    pinned_websites.push(editField.value);
                    save();
                    renderTable(pinned_websites.length - 1);
                }
                else {
                    pinned_websites.splice(parseInt(selection.id) + 1, 0,
                        editField.value);
                    save();
                    renderTable(parseInt(selection.id) + 1);
                }
            }
            else {
                renderTable(selection.id);
            }
        }
        // escape key
        if (event.keyCode == 27) {
            renderTable();
        }
    });
    td.appendChild(editField);
    editField.focus();
}

var context_menu_item = null;

function contextMenuSlider(event) {
    if (this.checked) {
        let settingContextMenu = storage.set_context_menu_item(true);
        settingContextMenu.then(null, onError);
        addMenuItem();
    }
    else {
        let settingContextMenu = storage.set_context_menu_item(false);
        settingContextMenu.then(null, onError);
        removeMenuItem();
    }
}

function syncSlider(event) {
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

function onError(error) {
    console.log(`Error: ${error}`);
}

function i18n(element, i18n_name) {
    element.innerHTML = element.innerHTML.replace(
        "__MSG_" + i18n_name + "__",
        browser.i18n.getMessage(i18n_name));
}

function load() {
    let gettingWebsites = storage.get_pinned_websites();
    gettingWebsites.then(finishLoading, onError);

    let gettingContextMenu = storage.get_context_menu_item();
    gettingContextMenu.then(finishLoading2, onError);

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
    document.getElementById("contextMenuSlider").addEventListener("change", contextMenuSlider);
    i18n(document.getElementById("contextMenuSliderLabel"), "contextMenuSlider");
    document.getElementById("syncSlider").addEventListener("change", syncSlider);
    i18n(document.getElementById("syncSliderLabel"), "syncSlider");
    document.getElementById("pinInAllWindowsSlider").addEventListener("change", pinInAllWindowsSlider);
    i18n(document.getElementById("pinInAllWindowsSliderLabel"), "pinInAllWindowsSlider");

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

function finishLoading2(item) {
    if (item.context_menu_item == null) {
        document.getElementById("contextMenuSlider").checked = false;
    }
    else {
        document.getElementById("contextMenuSlider").checked = item.context_menu_item;
    }
}

function finishLoading3(item) {
    document.getElementById("syncSlider").checked = item;
}

function finishLoading4(item) {
    document.getElementById("pinInAllWindowsSlider").checked = !!item.pin_in_all_windows;
}


document.addEventListener("DOMContentLoaded", init());
