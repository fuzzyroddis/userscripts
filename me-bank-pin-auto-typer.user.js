// ==UserScript==
// @name       Me Bank PIN Auto-Typer
// @author     Steven Roddis
// @namespace  com.stevenroddis.com.mebank.pinautotyper
// @version    0.2.1
// @description  When a password manager autofills the password field this script types it out on the stupid PIN pad.
// @match      https://ib.mebank.com.au/*
// ==/UserScript==

if($("#numericScramblePad").length) //are we on the right page?
{
    $("#txtPassword").change(function () {
        access_code = $("#txtPassword").val();
        if($("#txtPassword").val().match(/^[0-9]{7,}$/)) //passwords can only be 7 or more digits
        {
            $("#txtPassword").val(""); //empty it
            for(i=0;i<access_code.length;i++)
            {
                number = access_code.charAt(i)*1;
                $("#numericScramblePad input[value="+number+"]").click();
            }
            console.log("Auto-typed PIN pad entry! (To help with Password Managers)");
        }
    });
}