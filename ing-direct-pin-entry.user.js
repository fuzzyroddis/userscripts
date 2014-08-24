// ==UserScript==
// @name       ING Textual Pin Entry (No more virtual keyboard)
// @namespace  com.stevenroddis.ingdirec.textping
// @version    0.5
// @description  ING Direct isn't friendly to password managers or screen readers. This script fixes that.
// @match      https://www.ingdirect.com.au/client/Login.aspx
// @author     Steven Roddis
// ==/UserScript==

/* Lookup table for the button images, the numbers are not text but an image */
buttonsCRC32 = new Array();
buttonsCRC32[1293410584] = 0;
buttonsCRC32[2662349448] = 1;
buttonsCRC32[2042185744] = 2;
buttonsCRC32[2633220988] = 3;
buttonsCRC32[3513427064] = 4;
buttonsCRC32[2634844513] = 5;
buttonsCRC32[1921084770] = 6;
buttonsCRC32[1967471996] = 7;
buttonsCRC32[474295568]  = 8;
buttonsCRC32[1161513571] = 9;
buttonsCRC32[1720769193] = 'Clear';
buttonsCRC32[3588112371] = 'Cancel';

//From https://stackoverflow.com/posts/18639999/revisions
var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
};

var crc32 = function(str) {
    var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};
////////
//From https://stackoverflow.com/a/2706236
function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}
////////

/* Fix up ING's crap */
//Virtual Keyboard
document.querySelector("#objKeypad").style.display = "none";
document.querySelector("#objKeyDisplay").style.display = "none";
document.querySelector(".panelRow:nth-child(2) .panelCol2").innerHTML = "Enter your PIN/Access Code<br /><span>using your keyboard</span>";

/* Create Password input for keyboard/password manager */
txtPassword = document.createElement('input');
txtPassword.type = "password";
txtPassword.id = "sr-txtPassword";
/* Handle the password entry and simulate clicks on button */
txtPassword.addEventListener('input', function (e) {
    var pin = e.target.value;
    //clear existing pin
    keypadDigits = "";
    for(i=0;i<pin.length;i++)
    {
        number = pin.charAt(i)*1;
        ele = document.querySelector("input[sr-button='"+number+"']");
        //eventFire(document.querySelector("input[sr-button='"+number+"']"), 'click');
        //KeyPadPressKey(ele.src.substr(-36));
        digit_key = ele.getAttribute("onclick").substr(-39, 36);
        KeyPadPressKey(digit_key);
    }
});
txtPassword.style.width = "188px";
txtPassword.setAttribute("maxlength", "6");
txtPassword.setAttribute("datatype", "number");
txtPassword.setAttribute("required", "true");
txtPassword.setAttribute("title","PIN/Access Code");
txtPassword.setAttribute("placeholder","PIN/Access Code");

//Few changes to the Client Number field
//document.getElementById("txtCIF").setAttribute("type", "number");
document.getElementById("txtCIF").setAttribute("placeholder", "Client Number");

document.querySelector(".panelRow:nth-child(2) .panelCol3").appendChild(txtPassword);

/* Figure out which button is which then mark them */
buttons = document.querySelectorAll("input[src^=keypad]");
for(i in buttons)
{
    (function (ele) {
        var xmlhttp;
        
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
                ele.setAttribute("sr-button", buttonsCRC32[crc32(xmlhttp.responseText)]);
            }
        }
        xmlhttp.open("GET", ele.src, true);
        xmlhttp.send();
    })(buttons[i]);
}

/* Overwrite button press handler to avoid some of the sillyness */
//KeyPadButtonKeyDown = KeyPadButtonMouseDown = KeyPadButtonClick = KeyPadPressKey;