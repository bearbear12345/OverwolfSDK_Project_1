/*
 * DeliveryTrack
 * Copyright 2017 Andrew Wong <featherbear@navhaxs.au.eu.org>
 *
 * The following code is licensed under the MIT License
 */
 
 if (window.location.protocol == "https:") window.location.protocol = "http:";
 
(d = s => (l = s => s ? console.log("[DeliveryTrack] " + s) : null)((s && typeof _debug !== "undefined") ? "DEBUG - " + s : null))();
var serviceMap = {}
/*
 * Object thingy to hold all the related data and information
 */
const deliverytrack = {
  // HTML code
  html: document.getElementById("viewTable").getElementsByTagName('tbody')[0],
  // Array of tracking IDs (array of strings)
  data: localStorage.tableData ? JSON.parse(localStorage.tableData) : (localStorage.updated = 0) || {},
  // Add tracking id to list
  insert(id, peerTS) {
    if (!(id in this.data)) {
      if (service = serviceUtil.identify(id)) {
        serviceMap[id] = service;
        this.data[id] = {};
        this.data[id].status = "";
        this.html.appendChild(this.newRow(id));
        this.save(peerTS);
        l("Added ID: " + id);
        if (!peerTS) ws(3, id)
        this.requestUpdate(id);
      }
    }
  },
  // Remove tracking id from list
  remove(id, peerTS) {
    if (id in this.data) {
      delete this.data[id]
      this.html.removeChild(this.getRowHTML(id));
      this.save(peerTS);
      l("Removed ID: " + id);
      if (!peerTS) ws(4, id)
    }
  },
  requestUpdate(id) {
    ids = id ? [id] : Object.keys(deliverytrack.data);
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
  save(peerTS) {
    localStorage.tableData = JSON.stringify(this.data);
    localStorage.updated = (peerTS && localStorage.updated < parseInt(peerTS)) ? peerTS : +new Date
    d("Saved data to local storage");
  },
  // Create HTML for a new row
  newRow(id, status, friendly) {
    // niu rou = beef
    (row = document.createElement("tr")).innerHTML = "<td>" + id + "</td><td>" + (friendly ? friendly : "") + "</td><td>querying...</td><td></td>";
    row.childNodes[1].onclick = _ => deliverytrack.wantToEdit(id);
    row.childNodes[3].onclick = _ => deliverytrack.remove(id);
    return row;
  },
  // Find the element matching the tracking id
  getRowHTML(id) {
    return Array.from(this.html.getElementsByTagName("tr")).find(row => {
      return row.childNodes[0].innerHTML == id;
    });
  },
  friendly(id, val, peerTS) {
    this.data[id].friendly = val;
    this.save(peerTS);
    d("Friendly name for ID `" + id + "` set to `" + val + "`");
    if (!peerTS) ws(5, id, val);
    else if (this.lastContent[0] == id)
      this.lastContent[1] = val;
    else this.getRowHTML(id).childNodes[1].innerText = val;
  },
  resetEdit() {
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
        var newFriendly = inputNode.value.trim()
        var changed = this.lastContent[1] != newFriendly
        inputNode.parentNode.innerText = changed ? newFriendly : this.lastContent[1]
        if (changed) this.friendly(this.lastContent[0], newFriendly);
        this.lastContent = [];
      }, inputNode => {
        inputNode.parentNode.innerText = this.lastContent[1];
        this.lastContent = [];
      })
      this.lastContent[0] = id;
      this.lastContent[1] = oldText;
    }
  },
  lastContent: [],
  init() {
    // Initial table population
    deliverytrack.html.innerHTML = "";
    if (Object.keys(deliverytrack.data).length > 0) {
      l("Inserting saved ids");
      for (var id in deliverytrack.data) {
        if (id.length) {
          deliverytrack.html.appendChild(deliverytrack.newRow(id, deliverytrack.data[id].status, deliverytrack.data[id].friendly));
          serviceMap[id] = serviceUtil.identify(id);
        }
      }
      this.requestUpdate();
    }
  }
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
  input.value.split(" ").filter(s => s.length).forEach(v => deliverytrack.insert(v));
  input.value = "";
})
/* 
 * JSON GET
 */
var HTMLhead = document.getElementsByTagName('head')[0] || document.documentElement;
// AnyOrigin has CoinHive injection :(
// That's alright, we just need to lock the variables `__m` and `CoinHive`
const CoinHive = null;
const __m = null;
l("CoinHive blocked! :)")

function getJSON(url, callback, id) {
  var ud = "_" + (id ? id : + +new Date);
  window[ud] = callback;
  script = document.createElement('script');
  script.src = window.location.protocol + "//whateverorigin.org/get?url=" + escape(url).replace("/","%2F") + '&callback=' + ud;
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
      try {
        deliverytrack.data[id].status = service.callback(resp).toString();
        deliverytrack.update(id);
      } finally {
        return;
      }
    }, id);
  }
}
if (location.hash) {
  localStorage.syncToken = location.hash.substr(1)
  l("Sync token stored!")
}
deliverytrack.init();
ws = peerInit();