var pinned_websites = [ "https://facebook.com", "https://github.com", "https://twitter.com" ];
var selection = null;

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
                renderTable(selection.id);
            }
            else {
                pinned_websites.splice(index, 1);
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
                    renderTable(pinned_websites.length - 1);
                }
                else {
                    pinned_websites.splice(parseInt(selection.id) + 1, 0,
                        editField.value);
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

function init() {
    renderTable();
    document.getElementById("btn-grab").addEventListener("click", grab);
    document.getElementById("btn-add").addEventListener("click", add);
    document.getElementById("btn-edit").addEventListener("click", edit);
    document.getElementById("btn-up").addEventListener("click", up);
    document.getElementById("btn-down").addEventListener("click", down);
    document.getElementById("btn-delete").addEventListener("click", _delete);
}

document.addEventListener("DOMContentLoaded", init());
