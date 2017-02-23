pinned_websites = [ "https://facebook.com", "https://github.com", "https://twitter.com" ];
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
    var new_tbody = document.createElement("tbody");
    new_tbody.id = "tbl-websites";
    var old_tbody = document.getElementById("tbl-websites");
    pinned_websites.forEach(function(element) {
        var tr = document.createElement("tr");
        tr.addEventListener("click", select);
        if (selection != null && selection.textContent == element) {
            tr.className = "selected";
        }
        if (newSelection != null && newSelection == element) {
            selection = tr;
            tr.className = "selected";
        }
        var td = document.createElement("td");
        tr.appendChild(td);
        td.innerText = element;
        new_tbody.appendChild(tr);
    });
    old_tbody.parentNode.replaceChild(new_tbody, old_tbody);
}

function up(event) {
    if (selection == null) {
        return;
    }
    var index = pinned_websites.indexOf(selection.textContent);
    if (index == 0) {
        return;
    }
    else {
        var tmp = pinned_websites[index - 1];
        pinned_websites[index - 1] = pinned_websites[index];
        pinned_websites[index] = tmp;
    }
    renderTable();
}

function down(event) {
    if (selection == null) {
        return;
    }
    var index = pinned_websites.indexOf(selection.textContent);
    if (index == pinned_websites.length - 1) {
        return;
    }
    else {
        var tmp = pinned_websites[index + 1];
        pinned_websites[index + 1] = pinned_websites[index];
        pinned_websites[index] = tmp;
    }
    renderTable();
}

function _delete(event) {
    if (selection == null) {
        return;
    }
    var index = pinned_websites.indexOf(selection.textContent);
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
    editField.type = "text";
    editField.value = oldContent;
    editField.addEventListener("keyup", function(event) {
        if (event.keyCode == 13) {
            var index = pinned_websites.indexOf(oldContent);
            pinned_websites[index] = editField.value;
            selection = null;
            renderTable(editField.value);
        }
    });
    selection.textContent = "";
    selection.appendChild(editField);
    editField.focus();
}

function init() {
    renderTable();
    document.getElementById("btn-grab").addEventListener("click", grab);
    document.getElementById("btn-edit").addEventListener("click", edit);
    document.getElementById("btn-up").addEventListener("click", up);
    document.getElementById("btn-down").addEventListener("click", down);
    document.getElementById("btn-delete").addEventListener("click", _delete);
}

document.addEventListener("DOMContentLoaded", init());
