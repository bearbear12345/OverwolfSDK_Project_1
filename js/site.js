/*
 * DeliveryTrack
 * Copyright 2017 Andrew Wong <featherbear@navhaxs.au.eu.org>
 *
 * The following code is licensed under the MIT License
 */
(d=s=>(l=s=>s?console.log("[DeliveryTrack] "+s):null)((s&&typeof _debug !== "undefined")?"DEBUG - "+s:null))();

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
    id = this.prepareID(id);
    if (!(id in this.data)) {
      if (service = serviceUtil.identify(id)) {
        serviceMap[id] = service;
        this.data[id] = "";
        this.html.appendChild(this.newRow(id, "querying..."));
        this.save();
        l("Added ID: " + id);
        this.requestUpdate(id);
      }
    }
  },
  // Remove tracking id from list
  remove(id) {
    id = this.prepareID(id);
    if (id in this.data) {
      delete this.data[id]
      this.html.removeChild(this.getRowHTML(id));
      this.save();
      l("Removed ID: " + id);
    }
  },
  requestUpdate(id) {
    ids = id ? [this.prepareID(id)] : Object.keys(this.data);
    d("Updated requested for the ID(s): " + ids.join(", "))
    ids.forEach(id => serviceUtil.check(id));
  },
  update(id) {
    // Update tracking status of id
    ids = id ? [this.prepareID(id)] : Object.keys(this.data);
    ids.forEach(id => {
      this.getRowHTML(id).getElementsByTagName("td")[1].innerText = this.data[id];
      d("Status for ID `"+id+"`: " + this.data[id]);
    })
  },
  // Sanitize ID strings
  prepareID(id) {
    return id.toUpperCase().replace(/[^A-Z0-9]/g, "");
  },
  // Save data to localstorage
  save() {
    localStorage.tableData = JSON.stringify(this.data);
    d("Saved data to local storage");
  },
  // Create HTML for a new row
  newRow(id, status) {
    // niu rou = beef
    id = this.prepareID(id);
    (row = document.createElement("tr")).innerHTML = "<td>" + id + "</td><td>" + (status ? "<i>" + status + "</i>" : "") + "</td><td></td>";
    row.lastElementChild.onclick = _ => table.remove(id);
    return row;
  },
  // Find the element matching the tracking id
  getRowHTML(id) {
    id = this.prepareID(id);
    return Array.from(this.html.getElementsByTagName("tr")).find(row => {
      return row.firstElementChild.innerHTML == id;
    });
  }
};

/* 
 * Catch Enter presses, and adds tracking id to the list
 */
(input = document.getElementById('trackingIdInput')).onkeypress = function(e) {
  if (!e) e = window.event;
  var keyCode = e.keyCode || e.which;
  if (keyCode == '13') {
    input.value.split(" ").filter(s => s.length).forEach(v => table.insert(v));
    input.value = "";
    return true;
  }
}

/* 
 * JSON GET
 */
var HTMLhead = document.getElementsByTagName('head')[0] || document.documentElement;
function getJSON(url, callback, id) {
  var ud = "_" + (id ? id : + +new Date);
  window[ud] = callback;
  script = document.createElement('script');
  script.src = "http://anyorigin.com/go?url=" + escape(url) + '&callback=' + ud;
  script.onload = function() {
    HTMLhead.removeChild(this);
  }
  HTMLhead.appendChild(script);
}

const serviceUtil = {
  // Get service data through regex match
  identify(id) {
    id = table.prepareID(id);
    var result = services.find(service => {
      return service.regex.test(id);
    });
    if (result) d("ID `"+ id + "` identified as a tracking id from " + result.name);
    return result;
  },
  // Get delivery status
  check(id) {
    id = table.prepareID(id);
    service = serviceMap[id] ? serviceMap[id] : this.identify(id);
    if (service) getJSON(service.request + id, resp => {
      table.data[id] = service.callback(resp).toString();
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
    table.html.appendChild(table.newRow(id, table.data[id]));
    serviceMap[id] = serviceUtil.identify(id);
  }
}
table.requestUpdate();