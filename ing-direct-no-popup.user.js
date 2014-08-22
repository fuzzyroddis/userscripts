// ==UserScript==
// @name       ING Direct No Popup
// @namespace  com.stevenroddis.ingdirect.nopopup
// @version    0.1
// @description  Makes internet banking open in the same tab, not a silly popup.
// @match      https://www.ingdirect.com.au/*
// ==/UserScript==
OpenClient = function () {
    window.location = "/client/index.aspx";
};
