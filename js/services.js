/*
 * DeliveryTrack
 * Copyright 2017 Andrew Wong <featherbear@navhaxs.au.eu.org>
 *
 * The following code is licensed under the MIT License
 */
var services = [
{name: "Australia Post",
regex: /.*/,
request: "https://prod_trackapi:Welcome%40123@digitalapi.auspost.com.au/track/v3/search?q=",
callback: f=>f.contents.QueryTrackEventsResponse.TrackingResults[0].ReturnMessage.Description},
{
name: "WINIT",
regex: /.*/,
request: ""
callback: function(){}
}
]
/*
Auspost
60725513154096
00393278064040641625
60625583664092




Winit
ID18051539512207CN

??
89809375563

https://track24.net/
*/