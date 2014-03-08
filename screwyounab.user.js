// ==UserScript==
// @name       Screw You NAB: I Don't Want a New Window Edition
// @author     Steven Roddis
// @namespace  stevenroddis.com
// @version    0.1
// @match      https://www.nab.com.au/*
// @match      https://ib.nab.com.au/*
// ==/UserScript==

if(location.hostname == "www.nab.com.au")
{
    //Oh wow, don't just dump me on a crappy logout interstitial.
    if(location.pathname == "/personal/internet-banking/ib-logout")
        location.href = "/#hasloggedout";
    
    //open a link like a sane person.
    openIBWindow = function (path,target) {location.href = path + "?browser=correct";}
    window.target = "something"; //it'll take anything
}
else if(location.hostname == "ib.nab.com.au")
{
    window.target = "ib"; //Tricks NAB into thinking we opened a new window
    logo = document.querySelector('#header .column-1');
    logo.innerHTML = "<a href=\"https://www.nab.com.au\">" + logo.innerHTML + "</a>"; //wrap in a link
}