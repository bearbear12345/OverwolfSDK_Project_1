/*
 * DeliveryTrack
 * Copyright 2017 Andrew Wong <featherbear@navhaxs.au.eu.org>
 *
 * The following code is licensed under the MIT License
 */

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
    id = id.toString();
    if (!(id in this.data)) {
      var service = serviceUtil.identify(id);
      if (service) {
        serviceMap[id] = service;
        id = id; // do some regex matching and also sanitize
        this.data[id] = "";
        this.html.appendChild(this.newRow(id));
        this.save();
      }
    }
  },
  // Remove tracking id from list
  remove(id) {
    id = id.toString();
    if (id in this.data) {
      delete this.data[id]
      this.html.removeChild(this.getRowHTML(id));
      this.save();
    }
  },
  requestUpdate(id) {
    ids = id ? [id.toString()] : Object.keys(this.data);
    ids.forEach(id => serviceUtil.check(id));
  },
  update(id) {
    // Update tracking status of id
    ids = id ? [id.toString()] : Object.keys(this.data);
    ids.forEach(id => {
      this.getRowHTML(id).getElementsByTagName("td")[1].innerText = this.data[id];
    })
  },
  // Save data to localstorage
  save() {
    localStorage.tableData = JSON.stringify(this.data);
  },
  // Create HTML for a new row
  newRow(id) {
    // niu rou = beef
    (row = document.createElement("tr")).innerHTML = "<td>" + id + "</td><td></td><td></td>";
    row.lastElementChild.onclick = _ => table.remove(id);
    return row;
  },
  // Find the element matching the tracking id
  getRowHTML(id) {
    return Array.from(this.html.getElementsByTagName("tr")).find(row => {
      return row.firstElementChild.innerHTML == id.toString();
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
  var ud = "_" + (id ? id : + +new Date)
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
    return services.find(service => {
      return service.regex.test(id);
    });
  },
  // Get delivery status
  check(id) {
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
for (var id in table.data) {
  if (id.length) {
    table.html.appendChild(table.newRow(id));
    serviceMap[id] = serviceUtil.identify(id);
  }
}