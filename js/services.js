/*
 * DeliveryTrack
 * Copyright 2017 Andrew Wong <featherbear@navhaxs.au.eu.org>
 *
 * The following code is licensed under the MIT License
 */
var services = [{
    name: "Australia Post",
    regex: /.*/,
    request: "https://prod_trackapi:Welcome%40123@digitalapi.auspost.com.au/track/v3/search?q=",
    callback: r => r.contents.QueryTrackEventsResponse.TrackingResults[0].Consignment.Articles[0].Status
  },
  {
    name: "WINIT",
    regex: /ID:.*/,
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
//>6 characters
/*
function fnDHL(form)
{
    //var finalPieceStr  = "";
    var trimmedPid     = "";
    var upperCasePid   = "";
    errors="";
    var isAwbFound = false;
    var isPieceFound = false;
    var invalidEntryFound = false;
    var errorMessage = "";
    var newline = "<br>";
    var space   = " ";

    if ( (awbsLength > 10) || ((flagSpaceEnter) && (awbsLength==10)) )
    {
        updateUI( toomanyNumber, lessthanTenNumber + " " );
        return false;
    }
    finalPieceStr =" ";
    for (i=0;i<awbsLength;i++)
    {
    
        awbs[i] = awbs[i].replace(/\s+/g,'');
        //alert("AWB inside fndhl replace all the special char"+)
        if( awbs[i].length !=0)
        {

            if (!isValidDHLAWB(awbs[i]))
            {
                if(!validatePieceid(awbs[i]))
                {
                    var pieceIdLen = awbs[i];
                    if(pieceIdLen.length != 0)
                    {
                        var notAwb = notAwb1;
                        var notPieceId = notPieceId1;
                        
                        invalidEntryFound = true;
                        errorMessage = errorMessage + entry + space + (i+1) + space + notAwb + space + notPieceId + newline;
      
                        if( errors == "" ) errors=""+(i+1);
                        else errors+=(  ", " + (i+1) );
                    }
                }
                else
                {
                    
                    errorMessage = errorMessage + 
                    entry + space +(i+1) + space + isPieceId +newline;
                    
                    isPieceFound = true;
                }
     
            }
            else
            {
                
                errorMessage = errorMessage + 
                entry + space+ (i+1) + space+ isAwb +newline;
                
                isAwbFound = true;
            }
        }

        trimmedPid = awbs[i].replace(/[^a-zA-Z0-9]+/g,'');
        
        upperCasePid =  trimmedPid.toUpperCase();
        
        finalPieceStr = finalPieceStr + upperCasePid + "\n";
        finalPieceStr = fnTrim(finalPieceStr,2);
        //alert(" final piece string ="+finalPieceStr);
    

        if( i == awbsLength - 1 )
        {   
            
           //document.getElementById("AWB").value = finalPieceStr;
            
        } 
    }

    if( errorMessage != "" )
    {     
        if( isAwbFound && isPieceFound )
        {
            
            updateUI(combinationNotAllowed, errorMessage + " " +"<br>"+ errorMixed );
            return false;
        }
    }

    if( errors != "" )
    {
    
        numbad=errors.split( ", " );
        if( numbad.length == 1 )
          updateUI( invalidEntry, entry + " " + numbad[0] + " " + isNotValidAWBorPiece );
        else
          updateUI( invalidEntry, entries + " " + errors + " " + areNotValidAWBorPiece +"<br>"+ correctAWB);
          
        return false;
    }
    if (isZeroValue())
    {
        
        updateUI(invalidValues,errorZero+"<br>"+correctRemove);
        return false;
    }
    
    if (isDuplicate())
    {
        //alert("Duplicate Number::");
        
        updateUI(duplicatevalue,errorDuplicateNumber+"<br>"+correctRemove);
        return false;
    }

  return true;
}
*/
// Overly complicated.. how about we just send the request and get an error..
//]
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