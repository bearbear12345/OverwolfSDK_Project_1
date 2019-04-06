/*
 * DeliveryTrack
 * Copyright 2017 Andrew Wong <featherbear@navhaxs.au.eu.org>
 *
 * The following code is licensed under the MIT License
 */
var services = [
  {
    name: "Australia Post",
    regex: /.*/,
    request: "https://prod_trackapi:Welcome%40123@digitalapi.auspost.com.au/track/v3/search?q=",
    // `https://digitalapi.auspost.com.au/shipmentsgatewayapi/watchlist/shipments?trackingIds=${id}`
    // Headers: "api-key: d11f9456-11c3-456d-9f6d-f7449cb9af8e"
    callback: r => r.contents.QueryTrackEventsResponse.TrackingResults[0].Consignment.Articles[0].Events[0].EventDescription
  },
  {
    name: "WINIT",
    regex: /ID.*/,
    request: "http://track.winit.com.cn/tracking/Index/result/trackingNoString/",
    callback: r =>
      new DOMParser().parseFromString(r.contents, "text/html").getElementsByTagName("a")[2].innerHTML.replace(/â€™/, "'").split("&nbsp;", 1)[0]
  }, {
    // Issue with StarTrack's API is that we can't pass the X-ApiKey header (value: Fabric). Might need to go back to use XMLHttpRequest again. jQuery might be better here??? Or another library
    //https://github.com/axios/axios
    //https://github.com/mjackson/mach
    name: "StarTrack",
    regex: /ST:.*/,
    request: "https://api.startrack.com.au/shipping/v1/consignments?ids=",
    callback: r => undefined,
  }, {
    name: "DHL",
    regex: /DH:.*/,
    request: "http://www.dhl.com.au/shipmentTracking?AWB=",
    callback: r => null
  }
];