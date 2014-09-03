// ==UserScript==
// @name       Screw You NAB: I Don't Want a New Window Edition
// @author     Steven Roddis
// @namespace  stevenroddis.com
// @version    0.2.0
// @description Fools NAB's internet banking into thinking we loaded their site in a new window.
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
    
    logoff = function () {
        removeNabibApiSessionTokenCookie();
		logoffFMT();
    };
    
    //I hate being asked if I want to logout
    //This way looks hacky (and it is) but it lets NAB modify logoff() as they see fit
    /*window._oldconfirm = window.confirm;
    window.confirm = function (text, callback) {
        if(text.indexOf(" logout?"))
        {
            //just do it
            callback(true);
        }
        else
        {
            var yesno = window._oldconfirm(text);
            callback(yesno);
        }
    };*/
}