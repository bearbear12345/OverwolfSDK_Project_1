/*
 * DeliveryTrack
 * Copyright 2017 Andrew Wong <featherbear@navhaxs.au.eu.org>
 *
 * The following code is licensed under the MIT License
 */
(d = s => (l = s => s ? console.log("[DeliveryTrack] " + s) : null)((s && typeof _debug !== "undefined") ? "DEBUG - " + s : null))();
var serviceMap = {}
/*
 * Object thingy to hold all the table related data and information
 */
const table = {
  // HTML code
  html: document.getElementById("viewTable").getElementsByTagName('tbody')[0],
  // Array of tracking IDs (array of strings)
  data: localStorage.hasOwnProperty("tableData") ? JSON.parse(localStorage.tableData) : {},
  // Add tracking id to list
  insert(id) {
    if (!(id in this.data)) {
      if (service = serviceUtil.identify(id)) {
        serviceMap[id] = service;
        this.data[id] = {};
        this.data[id].status = "";
        this.html.appendChild(this.newRow(id, "querying..."));
        this.save();
        l("Added ID: " + id);
        this.requestUpdate(id);
      }
    }
  },
  // Remove tracking id from list
  remove(id) {
    if (id in this.data) {
      delete this.data[id]
      this.html.removeChild(this.getRowHTML(id));
      this.save();
      l("Removed ID: " + id);
    }
  },
  requestUpdate(id) {
    ids = id ? [id] : Object.keys(this.data);
    d("Updated requested for the ID(s): " + ids.join(", "))
    ids.forEach(id => serviceUtil.check(id));
  },
  update(id) {
    // Update tracking status of id
    ids = id ? [id] : Object.keys(this.data);
    ids.forEach(id => {
      this.getRowHTML(id).getElementsByTagName("td")[2].innerText = this.data[id].status;
      d("Status for ID `" + id + "`: " + this.data[id].status);
    })
  },
  // Save data to localstorage
  save() {
    localStorage.tableData = JSON.stringify(this.data);
    d("Saved data to local storage");
  },
  // Create HTML for a new row
  newRow(id, status, friendly) {
    // niu rou = beef
    (row = document.createElement("tr")).innerHTML = "<td>" + id + "</td><td>" + (friendly ? friendly : "") + "</td><td>" + (status ? "<i>" + status + "</i>" : "") + "</td><td></td>";
    row.childNodes[1].onclick = _ => table.wantToEdit(id);
    row.childNodes[3].onclick = _ => table.remove(id);
    return row;
  },
  // Find the element matching the tracking id
  getRowHTML(id) {
    return Array.from(this.html.getElementsByTagName("tr")).find(row => {
      return row.childNodes[0].innerHTML == id;
    });
  },
  resetEdit(direct) {
    if (this.lastContent.length > 0) {
      try {
        (this.getRowHTML(this.lastContent[0]).childNodes[1].innerText = this.lastContent[1]);
        d("Restoring friendly name for ID: " + this.lastContent[0])
      } finally {
        this.lastContent = [];
      }
    }
  },
  wantToEdit(id) {
    // Want to fix that input box spacing too
    if (this.lastContent[0] != id) {
      this.resetEdit();
      var node = this.getRowHTML(id).childNodes[1];
      var oldText = node.innerText;
      node.innerHTML = "<input type='text'>";
      node.childNodes[0].value = oldText;
      node.childNodes[0].focus();
      registerKeyboardHandler(node.childNodes[0], inputNode => {
        inputNode.parentNode.innerText = inputNode.value;
        this.data[this.lastContent[0]].friendly = inputNode.value;
        d("Friendly name for ID `" + +"` set to `" + inputNode.value + "`");
        this.save();
        this.lastContent = [];
      }, inputNode => {
        inputNode.parentNode.innerText = inputNode.value;
        this.lastContent = [];
      })
      this.lastContent[0] = id;
      this.lastContent[1] = oldText;
    }
  },
  lastContent: []
};
var registerKeyboardHandler = function (elem, enterFunc, escFunc) {
  elem.onkeydown = function (e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13') {
      enterFunc(elem);
      return true;
    } else if (keyCode == '27') {
      escFunc(elem);
      return false;
    }
  }
}
/* 
 * Catch Enter presses, and adds tracking id to the list
 */
registerKeyboardHandler((input = document.getElementById('trackingIdInput')), input => {
  input.value.split(" ").filter(s => s.length).forEach(v => table.insert(v));
  input.value = "";
})
/* 
 * JSON GET
 */
var HTMLhead = document.getElementsByTagName('head')[0] || document.documentElement;

function getJSON(url, callback, id) {
  var ud = "_" + (id ? id : + +new Date);
  window[ud] = callback;
  script = document.createElement('script');
  script.src = "http://anyorigin.com/go?url=" + escape(url) + '&callback=' + ud; // FIX HTTP HTTPS COMPAT
  script.onload = function () {
    HTMLhead.removeChild(this);
  }
  HTMLhead.appendChild(script);
}
const serviceUtil = {
  // Sanitize ID strings
  prepareID(id) {
    return id.toUpperCase().replace(/[^A-Z0-9]/g, "");
  },
  // Get service data through regex match
  identify(id) {
    id = this.prepareID(id);
    var result = services.find(service => {
      return service.regex.test(id);
    });
    if (result) d("ID `" + id + "` identified as a tracking id from " + result.name);
    return result;
  },
  // Get delivery status
  check(id) {
    service = serviceMap[id] ? serviceMap[id] : this.identify(id);
    if (service) getJSON(service.request + id, resp => {
      table.data[id].status = service.callback(resp).toString();
      table.update(id);
      table.save();
    }, id);
  }
}
// Initial table population
table.html.innerHTML = "";
if (table.data.length > 0) l("Inserting saved ids");
for (var id in table.data) {
  if (id.length) {
    table.html.appendChild(table.newRow(id, table.data[id].status, table.data[id].friendly));
    serviceMap[id] = serviceUtil.identify(id);
  }
}
table.requestUpdate();