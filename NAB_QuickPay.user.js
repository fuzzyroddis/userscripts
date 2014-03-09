// ==UserScript==
// @name       NAB QuickPay
// @namespace  https://nabquickpay.stevenroddis.com
// @version    0.1
// @description  A work in progress! Creates a new way to pay, just copy and paste payment information into the textarea and it'll auto fill account/bpay info and amount.
// @match      https://ib.nab.com.au/*
// @author     Steven Roddis
// ==/UserScript==

//Hacky Constants
var UNKNOWN_TYPE = -1;
var DEPOSIT_TYPE = 0;
var BPAY_TYPE = 1;

//Takes free form text and returns array of ["type"] optional: ["bsb"],["account"],["billercode"],["reference"]
function parsePaymentString(str) {
    str_stripped = str.toLowerCase().replace(/[ -]/g, "");
    
	//Direct Deposit    
    var bsbRegex = /(?:^|[^$])([0-9]{6})(?:[^0-9]|$)/;
    var accountRegex = /(?:^|[^$])([0-9]{8,9})(?:[^0-9]|$)/; //I've seen plenty of 8 digit account numbers.
    
    //BPAY
    var billerCodeRegex = /(?:bpay|biller|code).+?[^$]([0-9]{4,6})/i;
    var referenceNumRegex = /(?:reference|number).+?[^$]([0-9]{1,16})/i;
    var referenceNumBasicRegex = /[^$]([0-9]{1,16})/i; //I don't think there is a limit, using 16 (cc length) for sanity
    
    /*http://bpaybiller.nab.com.au/files/NAB_BPAY_Biller_checklist.pdf
    Amount must be between 1.00 and 999,999.99
    Checksum method can differ, Lumn (mod10v1) mod10v5 (Westpac) or custom.
    */  
    var amountRegex = /\$([0-9]+(?:\.[0-9]{1,3})?)(?:[^0-9]|$)/; //I've seen 3 decimals used
    
    //Set Default:
    var paymentType = UNKNOWN_TYPE;
    
    var bsb = bsbRegex.exec(str_stripped);
    if (bsb != null) {
        paymentType = DEPOSIT_TYPE;
        bsb = bsb[1];
    }
    
    var account = accountRegex.exec(str_stripped);
    if (account != null) {
        account = account[1];
    }
    
    var amount = amountRegex.exec(str_stripped);
    if (amount != null) {
        amount = amount[1];
    }
      
    var billerCode = billerCodeRegex.exec(str_stripped);
    var referenceNum = null;
    
    if (billerCode != null) {
        paymentType = BPAY_TYPE;
        
        //Reference Number
        var referenceNum = referenceNumRegex.exec(str_stripped.replace(billerCode[0], "")); //remove billerCode
        if (referenceNum != null) {
            referenceNum = referenceNum[1];
        }
        
        billerCode = billerCode[1];
    }
                
    switch(paymentType)
    {
        case DEPOSIT_TYPE:
        	return [paymentType, amount, bsb, account];
        break;
                        
        case BPAY_TYPE:
        	return [paymentType, amount, billerCode, referenceNum];
        break;
        
        default:
    	case UNKNOWN_TYPE:
        	if(amount)
            	return [UNKNOWN_TYPE, amount];
        	else
        		return [UNKNOWN_TYPE];
        break;
    }           
}

//input
ele = '<textarea id="stevenroddis-quickpay"></textarea>';

//Add input to document
$("#payeeAcctId + p").html(ele);

//Bind on change
$("#stevenroddis-quickpay").bind('input propertychange', function() {
p = parsePaymentString(this.value);

$("#payeeBsb").val(p[2]);
$("#payeeAcctId").val(p[3]);
$("#amount").val(p[1]);
});

//Style
$("#stevenroddis-quickpay").css("width", "308px");
$("#stevenroddis-quickpay").css("height", "98px");
$("#stevenroddis-quickpay").css("clear", "both");
