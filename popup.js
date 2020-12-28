let companiesToProcessArr = [];
let urlAddress;
let fromDate;
let toDate;
let fromDateString;
let toDateString;
let table = document.getElementById('table');
let generateReportBtn = document.getElementById("generateReportBtn");
let checkAll = document.getElementById("checkAll");

function correctDate(rawDate) {
  return new Date(new Date(rawDate).getTime() + new Date(rawDate).getTimezoneOffset() * 60000); // corrects time zone and returns a date with time set at exactly 00:00 
}

document.getElementById("sheetUrl").addEventListener("input", resizeInputAndSetUrlAddress); // bind the "resizeInputAndSetUrlAddress" callback on "input" event. The input event fires when the value of an <input>, <select>, or <textarea> element has been changed.
function resizeInputAndSetUrlAddress() {
  if (this.value.length > 25) this.style.width = this.value.length + "ch"; // changes the size of input element in frontend measured in "ch" which has character width of "0". It is presumed that the default input box width is 25ch, so box starts growing only if that size is exceeded
  urlAddress = this.value; // updates the value of urlAdress after each change in input
}

document.getElementById("fromDate").addEventListener("input", changeFromDate);
function changeFromDate() {
  fromDateString = this.value; // date retrieved as string from input type="date" element in "YYYY-MM-DD" default format can not be compared to date retrieved from string in "MM-DD-YYYY" format
  fromDate = correctDate(this.value); // that is why correction is performed to account for a time-zone
  // console.log(fromDate);
  // console.log(fromDateString);
}

document.getElementById("toDate").addEventListener("input", changeToDate);
function changeToDate() {
  toDateString = this.value;
  toDate = correctDate(this.value);  
  console.log(toDate);
  console.log(toDateString);
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("generateCompanyList").addEventListener("click", sheetSearch);
  
  let location = generateReportBtn.href;
  generateReportBtn.onclick = function() {
    //chrome.tabs.create({ active: true, url: location }, function(tab) {/* never executes since opening of new tab closes popup.html and its console*/} );
    chrome.runtime.sendMessage({ browseThroughCompanies: "start" }, function(response) {
      console.log(response.farewell);
    });
  };
});
// function urlInputChange() {
//   urlAddress = document.getElementById("sheetUrl").value;
// }

function createTh() {
  let thArray = ["Company", "Login", "Pass", "Last Posted"];
  for (i = 0; i < thArray.length; i++) {
    let th = document.createElement("th");
    th.innerHTML = thArray[i];
    table.append(th);
  }
}

function createTrTd(cellsArray) {
  let tr = document.createElement("tr");
  for (i = 0; i < cellsArray.length; i++) {
    let td = document.createElement("td");
    td.innerHTML = cellsArray[i];
    tr.append(td);
  }
  return tr;
}

function myCallback(error, options, response) {
  if (error) {
    console.log(error);
    //reject(error);  
  } else {
    // console.log(response.html);
    // console.log(response.rows);
    if (checkAll.checked == false) {
      response.rows.forEach(item => {      
        let momentaryDate = new Date(item.cellsArray[3]);
        //console.log(item.cellsArray[0] + "  :  " + momentaryDate);
        if (momentaryDate >= fromDate && momentaryDate <= toDate) {
          item.cellsArray[0] = item.cellsArray[0].replace(",", " ");
          //console.log("Hit:  " + item.cellsArray[0] + "  :  " + item.cellsArray[3] + "    ************************")
          companiesToProcessArr.push(item.cellsArray);
          table.append(createTrTd(item.cellsArray));
        }
      });
    } else { // does not compare entered date range to date of last company job posting in google sheet-u, but makes an array of all companies from the sheet
        for (i = 0; i < response.rows.length; i++) {
          if (response.rows[i].cellsArray[0] == "Company") {
            let companiesStart = i + 1;
            for (y = companiesStart; y < response.rows.length; y++  ) {
              //console.log(response.rows[y].cellsArray[0]);            
              response.rows[y].cellsArray[0] = response.rows[y].cellsArray[0].replace(",", " "); // replaces comas in company name with an empty space, because comas interfere with csv file creation at the end
              //console.log(response.rows[y].cellsArray[0]);       
              companiesToProcessArr.push(response.rows[y].cellsArray);
              table.append(createTrTd(response.rows[y].cellsArray));
            };
          };
        };
    }
  
    table.style.display = "block";
    generateReportBtn.style.display = "inline";
    //console.log(companiesToProcessArr);
    storageSet(companiesToProcessArr);
    companiesToProcessArr.length = 0;
    document.getElementById("sheetUrl").value = document.getElementById("fromDate").value = document.getElementById("toDate").value = "";
  }
};

function storageSet(companiesToProcessArr) {
  chrome.storage.local.set(
    {
      body: {
        companiesToProcessArr: companiesToProcessArr,
        fromDate: fromDateString,
        toDate: toDateString      
      }
    },
    function() {
      if (chrome.runtime.lastError) {
        // logs error if any, log can be view on console on _generated_background_page.html (Details > Inspect views > background page)
        //console.log("greska: " + JSON.stringify(chrome.runtime.lastError));
      } else {
        //console.log("Uspesno sacuvano pomocu storageSet!");
        //companiesToProcessArr.length = 0;
      }
    }
  );
}

function sheetSearch() {
  table.innerHTML = "";
  createTh();
  //table.style.display = "none";
  if (urlAddress) {
    sheetrock({
      url: urlAddress,
      query: "select A,C,D,F", 
      callback: myCallback,
      reset: true
    });
  } else {
    alert("Google Sheet url is missing");
  }
}
