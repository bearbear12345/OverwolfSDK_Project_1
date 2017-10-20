/*
 * DeliveryTrack
 * Copyright 2017 Andrew Wong <featherbear@navhaxs.au.eu.org>
 *
 * The following code is licensed under the MIT License
 */
// SOO BREAK IT DOWN, HOW'S THIS GONNA WORK?
// Existing peers won't be actively searching for fresher peers. They will only be notified of new peers from reverse peer discovery or announcements
// PEER BLASTER! TRIPLE SHOT. okay 
l = typeof l != "undefined" ? l : () => {};
d = typeof d != "undefined" ? d : () => {}
var peerInit = function () {
  if (!localStorage.syncToken) return () => {}
  const dataFormat = {
    VER: -1,
    HELLO: 0,
    PEERS: 99,
    PULL: 1,
    PUSH: 2,
    ADD: 3,
    REMOVE: 4,
    FRIENDLY: 5
  }
  const peerJS = {
    instance: null,
    peers: {},
    id_prefix: "DT",
    id: "",
    connect(id) {
      d("Trying for ID: " + this.id_prefix + id);
      this.instance = new Peer(this.id_prefix + id, {
        key: localStorage.syncToken
      });
      this.instance.on('error', err => {
        if (err.type == "unavailable-id") {
          d("ID `" + this.id_prefix + id + "` unavailable")
          this.peers[this.id_prefix + id] = undefined;
          this.connect(id + 1);
        }
      });
      this.instance.on('open', id => {
        this.id = id,
          l("Connected to peer network as " + id)
        d("Claimed ID: " + id);
        d(Object.keys(this.peers).length > 0 ? "Other peers (logically deduced): " + Object.keys(this.peers).join(", ") : "No other peers available");
        var newPeer = id => {
          this.peers[id] = this.instance.connect(id, {
            metadata: "deliverytrack"
          })
          this.peers[id].on('open', function () {
            this.on("data", data => receiveHandler(data, this))
            d("Greeting " + this.peer)
            this.send([dataFormat.HELLO, localStorage.updated])
          })
        }
        var receiveHandler = (data, conn) => {
          switch (data[0]) {
          case dataFormat.HELLO:
            l("New peer: " + conn.peer)
            this.peers[conn.peer] = conn;
            conn.send([dataFormat.PEERS, Object.keys(this.peers)])
            if (parseInt(data[1]) < parseInt(localStorage.updated)) {
              l("Notifying peer " + conn.peer + " of newer version")
              conn.send([dataFormat.VER, localStorage.updated]);
              break;
            }
          case dataFormat.VER:
            if (parseInt(data[1]) > parseInt(localStorage.updated)) {
              l("Peer " + conn.peer + " has newer version")
              conn.send([dataFormat.PULL])
            }
            break;
          case dataFormat.PEERS:
            var ignore = Object.keys(this.peers)
            ignore.push(this.id)
            var reversePeers = data[1].filter(id => ignore.indexOf(id) < 0)
            if (reversePeers.length > 0) {
              l("Discovered new peers: " + reversePeers.join(", "))
              reversePeers.forEach(id => newPeer(id))
            }
            break;
          case dataFormat.PULL:
            d(conn.peer + " is requesting data")
            conn.send([dataFormat.PUSH, localStorage.tableData, localStorage.updated])
            break;
          case dataFormat.PUSH:
            d("Received data from peer. Updating local content")
            deliverytrack.data = JSON.parse(localStorage.tableData = data[1]);
            localStorage.updated = data[2];
            deliverytrack.init();
            break;
          case dataFormat.ADD:
            d("A peer added a tracking id. Updating local content")
            deliverytrack.insert(data[2], data[1])
            break;
          case dataFormat.REMOVE:
            d("A peer removed a tracking id. Updating local content")
            deliverytrack.remove(data[2], data[1])
            break;
          case dataFormat.FRIENDLY:
            d("A peer changed the friendly name of a tracking id. Updating local content")
            deliverytrack.friendly(data[2], data[3], data[1])
            break;
          }
        }
        for (var id in this.peers) {
          newPeer(id)
        }
        this.instance.on('connection', conn => {
          if (conn.metadata == "deliverytrack") {
            this.peers[conn.peer] = conn
            conn.on("data", data => receiveHandler(data, conn));
          }
        })
      })
    }
  }
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = "http://cdn.peerjs.com/0.3.14/peer.min.js";
  script.onload = script.onreadystatechange = _ => peerJS.connect(1);
  document.getElementsByTagName('head')[0].appendChild(script);
  return (type, data, data2) => {
    for (var id in peerJS.peers) {
      peerJS.peers[id].send([type, localStorage.updated, data, data2])
    }
  }
}