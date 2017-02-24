// global variables

var pinned_websites = null;
var selection = null;
var sync = null;

function save() {
    if (sync == true) {
        let settingWebsites =
            browser.storage.sync.set({"pinned_websites": pinned_websites});
        settingWebsites.then(null, onError);
    }
    else {
        let settingWebsites =
            browser.storage.local.set({"pinned_websites": pinned_websites});
        settingWebsites.then(null, onError);
    }
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
        td.innerText = "Empty";
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

function setSync(event) {
    let val = document.getElementById("ckb-sync").checked;
    let settingSync = browser.storage.local.set({"sync": val});
    settingSync.then(null, onError);
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function init() {
    let gettingSync = browser.storage.local.get("sync");
    gettingSync.then(startLoading, onError);

    document.getElementById("ckb-sync").addEventListener("click", setSync);

    document.getElementById("btn-grab").addEventListener("click", grab);
    document.getElementById("btn-add").addEventListener("click", add);
    document.getElementById("btn-edit").addEventListener("click", edit);
    document.getElementById("btn-up").addEventListener("click", up);
    document.getElementById("btn-down").addEventListener("click", down);
    document.getElementById("btn-delete").addEventListener("click", _delete);
}

function startLoading(item) {
    sync = item.sync;
    if (sync == null) {
        sync = true;
        setSync();
    }
    document.getElementById("ckb-sync").checked = sync;
    if (sync == true) {
        let gettingWebsites = browser.storage.sync.get("pinned_websites");
        gettingWebsites.then(finishLoading, onError);
    }
    else {
        let gettingWebsites = browser.storage.local.get("pinned_websites");
        gettingWebsites.then(finishLoading, onError);
    }
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

document.addEventListener("DOMContentLoaded", init());
