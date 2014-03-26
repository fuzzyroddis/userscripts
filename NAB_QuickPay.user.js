// ==UserScript==
// @name       NAB QuickPay
// @namespace  https://nabquickpay.stevenroddis.com
// @version    0.4.1
// @description  A work in progress! Creates a new way to pay, just copy and paste payment information into the textarea and it'll auto fill account/bpay info and amount.
// @match      https://ib.nab.com.au/*
// @author     Steven Roddis
// ==/UserScript==

//Config (Move this to GM_Value)
var REMITTER_NAME = "Steven Roddis";
var ALWAYS_AUTOFULL_REMITTER = true; //autofill the form even if we didn't use QuickPay

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
    var nameRegex = /\bname\:\s*(.+)/i;
    
    //BPAY
    var billerCodeRegex = /(?:bpay|biller|code)[^0-9$]+?([0-9]{4,6})/i;
    var referenceNumRegex = /(?:ref(?:erence)?|number)[^0-9\$]+?([0-9]{1,16})/i;
    //var referenceNumBasicRegex = /[^$]([0-9]{1,16})/i; //I don't think there is a limit, using 16 (cc length) for sanity
    
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
    
    var name = nameRegex.exec(str);
    if (name != null) {
        name = name[1];
    }
      
    var billerCode = billerCodeRegex.exec(str_stripped);
    var referenceNum = null;
    
    if (billerCode != null) {
        paymentType = BPAY_TYPE;
        
        //Reference Number
        var referenceNum = referenceNumRegex.exec(str_stripped.replace(billerCode[0], "")); //remove billerCode (billerCode[0] is the entire match not just the code (which is good))
        if (referenceNum != null) {
            referenceNum = referenceNum[1];
        }
        
        billerCode = billerCode[1];
    }
                
    switch(paymentType)
    {
        case DEPOSIT_TYPE:
        	return [paymentType, amount, bsb, account, name, REMITTER_NAME];
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

function fillForms(p) {
    if(isBPAY)
    {
        if($("input[name=billerCode]").length)
        {
            //first step
            $("input:radio[name=searchType]")[1].checked = true;
            $("input[name=billerCode]").val(p[2]);
            //Magic Below
            //I also had the idea of passing via target or window name
            data = "";
            for(var i = 0; i < p.length; i++)
            {
				if(i > 0)
                {
                    data += ",";
                }
                
                if(p[i] || p[i] === 0) //contains something? (trying to avoid nulls)
                {
                    data += encodeURIComponent(p[i]);
                }
            }
            
            action = $("form[name=editBillPaymentForm]").attr("action");
            action = action.replace(/#SRQP!.+$/, ''); //remove old data
            $("form[name=editBillPaymentForm]").attr("action", action + "#SRQP!"+data); //add new data
        }
        //second step
        else
        {
            $("input[name=custRefNumber]").val(p[3]);
            $("input[name=paymentAmount]").val(p[1]);
        }
    }
    else
    {
        $("#payeeBsb").val(p[2]);
        $("#payeeAcctId").val(p[3]);
        $("#amount").val(p[1]);
        $("#payeeAcctName").val(p[4]);
        $("#remitterName").val(p[5]);
    }
}

//input
var ele = '<textarea id="stevenroddis-quickpay"></textarea>';
var isBPAY		= false;
var isTransfer	= false;
var displayForm = false;

if(location.pathname.indexOf("/billPayment_selectBiller.ctl") > -1)
{
    isBPAY = true;
	displayForm = true;
}
else if(location.pathname.indexOf("/billPayment_search.ctl") > -1)
{
    isBPAY = true;
    displayForm = false;
}
else
    isBPAY = false;

if(location.pathname.indexOf("/payments_transferNew.ctl") > -1 && $("#payeeBsb").length)
{
    isTransfer = true;
	displayForm = true;
}
else
    isTransfer = false;

if(location.hash.substring(0,6) == "#SRQP!") //have we passed details from last page?
{
    p = location.hash.substring(6).split(',');
	for(var i = 0; i < p.length; i++)
        p[i] = decodeURIComponent(p[i]); //unescape
    fillForms(p);
}
else if(displayForm)
{
    $("table.tlIB tr td:nth-child(3) table.mainContent").first().before('<a name="content" class="pageTitle" id="stevenroddis-title">SR QuickPay</a>');
    $("#stevenroddis-title").after(ele);
    //Style
    $("#stevenroddis-title").css("padding", "16px 1 1 3px");
    $("#stevenroddis-quickpay").css("width", "308px");
    $("#stevenroddis-quickpay").css("height", "98px");
    $("#stevenroddis-quickpay").css("clear", "both");
    $("#stevenroddis-quickpay").css("margin", "25px 0 0 20px");
    $("#stevenroddis-quickpay").css("padding", "0 0 5px 0");
    $("#stevenroddis-title").css("display", "block");
}

//Bind on change
$("#stevenroddis-quickpay").bind('input propertychange', function() {
    p = parsePaymentString(this.value);
    fillForms(p); //fill in values
});

if(ALWAYS_AUTOFULL_REMITTER)
{
    $("#remitterName").val(REMITTER_NAME);
}