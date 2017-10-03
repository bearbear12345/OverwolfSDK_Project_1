/*
 * Object thingy to hold all the table related data and information
 */
const table = {
  // HTML code
  html: document.getElementById("viewTable").getElementsByTagName('tbody')[0],
  // Array of tracking IDs (array of strings)
  data: localStorage.hasOwnProperty("tableData") ? localStorage.tableData.split(",") : [],
  // Add tracking id to list
  insert(id) {
    id = id; // do some regex matching and also sanitize
    if (!this.find(id)) {
      this.data.push(id.toString());
      this.update();
    }
  },
  // Remove tracking id from list
  remove(id) {
    if (this.find(id)) {
      this.data = table.data.filter(item => item.toString() !== id.toString())
      this.update();
    }
  },
  // Save and update the HTML code
  update() {
    localStorage.tableData = this.data;
    this.html.innerHTML = "";
    this.data.forEach(id => {
      if (id.length) {
        (row = document.createElement("tr")).innerHTML = "<td>" + id + "</td><td></td><td onclick=d('" + escape(id) + "')></td>"
        this.html.appendChild(row);
      }
    })
  },
  // Helper to check if a tracking id already exists in the list
  find(id) {
    return (this.data.indexOf(id.toString()) > -1)
  },
};
/* 
 * Catch Enter presses, and adds tracking id to the list
 */
(input = document.getElementById('trackingIdInput')).onkeypress = function(e) {
  if (!e) e = window.event;
  var keyCode = e.keyCode || e.which;
  if (keyCode == '13') {
    table.insert(input.value);
    input.value = "";
    return;
  }
}
/* 
 * JSON GET
 */
function getJSON(url, success) {
  var ud = '_' + +new Date
  script = document.createElement('script')
  head = document.getElementsByTagName('head')[0] || document.documentElement;
  window[ud] = function(data) {
    head.removeChild(script);
    success && success(data);
  };
  script.src = "http://anyorigin.com/go?url=" + escape(url) + '&callback=' + ud;
  head.appendChild(script);
}

function identifyID(id) {
  try {
    services.forEach(service => {
      if (service.regex.test(id)) throw service
    })
  } catch (service) {
    return service
  }
}


function checkID(id, service) {
}
d = id => {
  table.remove(unescape(id))
}
table.update();