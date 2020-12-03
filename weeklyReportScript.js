let form = document.querySelector("body > article > section.employers-pages-main-content.register > div > div > div > div > div > div.span8.form-left-block > div > div > form"); 

// let login = document.querySelector("body > article > section.employers-pages-main-content.register > div > div > div > div > div > div.span8.form-left-block > div > div > form > fieldset > div:nth-child(3) > div > input").value;
// let pass = document.querySelector("body > article > section.employers-pages-main-content.register > div > div > div > div > div > div.span8.form-left-block > div > div > form > fieldset > div:nth-child(4) > div > input").value;

let resultsArr = [];
let lowerDate;
let upperDate;

let signInButton = document.querySelector("body > article > section.employers-pages-main-content.register > div > div > div > div > div > div.span8.form-left-block > div > div > form > div > div > button");
let myProgress = document.createElement('div');
let myBar = document.createElement('div');
let myBarWidth = 0;
let numberOfCompaniesToProcess;

function createProgressBar() {
  
  myProgress.appendChild(myBar);  
  document.querySelector("body > article > section.employers-pages-main-content.register > div > div > div > div > div > div.span8.form-left-block > div > div > form > fieldset > div:nth-child(4)").appendChild(myProgress);
  
  myProgress.style.width = "47%";
  myProgress.style.backgroundColor = "#ddd";
  myProgress.style.marginLeft = "auto";
  myProgress.style.marginRight = "auto";
  myProgress.style.marginTop = "20px";
  
  myBar.style.width = "0%";
  myBar.style.height = "30px";
  myBar.style.backgroundColor = "#7DB93D";
  myBar.style.textAlign = "center";
  myBar.innerText = "0%";
  myBar.style.lineHeight = "30px"
  myBar.style.color = "white"
};

function animateProgressBar() {
  if (myBarWidth + Math.round(100/numberOfCompaniesToProcess) < 100) {
    myBarWidth+= Math.round(100/numberOfCompaniesToProcess); 
    myBar.style.width = myBarWidth + '%'; 
    myBar.innerHTML = myBarWidth + '%';
  }
};

storageGet(); // starts main function immediately, since in background.js it is set that the script executes after page loads (runAt: "document_idle",)


function storageGet() {
    
  signInButton.type = "button";
  signInButton.style.backgroundColor = "#fa8f00";
  signInButton.innerText = "Generating report... Please wait.";

  createProgressBar();

  myProgress.style.display = "block";
   
  chrome.storage.local.get(["body"], function(ivy) {
    if (ivy.body.companiesToProcessArr) {
      // console.log(ivy.body.companiesToProcessArr);
      // console.log(ivy.body.fromDate);
      lowerDate = new Date(new Date(ivy.body.fromDate).getTime() + new Date(ivy.body.fromDate).getTimezoneOffset() * 60000); // date correction to include time-zone since its made from "YYYY-MM-DD" type of string
      // console.log(ivy.body.toDate);
      upperDate = new Date(new Date(ivy.body.toDate).getTime() + new Date(ivy.body.toDate).getTimezoneOffset() * 60000);
      main(ivy.body.companiesToProcessArr);
    }
  })
}


function main(companiesToProcessArr) {
  let docum;
  let statusList;

  let pageObj = {
    pageNo: 0,
    get getPageNumber() {
      return this.pageNo;
    },
    set setPageNumber(value) {
      this.pageNo = value;
    }
  };

  let companyBrowsingFinalResult = {
    active: 0,
    pending: 0, 
    expired: 0,
    disapproved: 0,
    disabledDeadLinks: 0,
    total: 0,
  
    get activeGet() {
      return this.active;
    },
    set activeSet(value) {
      this.active = value;
    },
    get pendingGet() {
      return this.pending;
    },
    set pendingSet(value) {
      this.pending = value;
    },
    get expiredGet() {
      return this.expired;
    },
    set expiredSet(value) {
      this.expired = value;
    },
    get disapprovedGet() {
      return this.disapproved;
    },
    set disapprovedSet(value) {
      this.disapproved = value;
    },
    get disabledDeadLinksGet() {
      return this.disabledDeadLinks;
    },
    set disabledDeadLinksSet(value) {
      this.disabledDeadLinks = value;
    },
    get getTotal() {
      return this.total;
    },
    set setTotal(value) {
      this.total = value;
    }    
  };

  function calcTotalNumber() {
    let totalN = 0;
    for (i=0; i < 5; i++){
      totalN+= Object.values(companyBrowsingFinalResult)[i];
    }
    return totalN;
  }

  async function loggingIn (item) {
    document.querySelector("body > article > section.employers-pages-main-content.register > div > div > div > div > div > div.span8.form-left-block > div > div > form > fieldset > div:nth-child(3) > div > input").value = item[1];
    document.querySelector("body > article > section.employers-pages-main-content.register > div > div > div > div > div > div.span8.form-left-block > div > div > form > fieldset > div:nth-child(4) > div > input").value = item[2];
  
    let dashboardPage = await fetch(form.action, {
        method: form.method,
        body: new FormData(form)
      });
    return dashboardPage;
  }

  async function fetchNextPage(numberOfPage) {
    let nextPage = await fetch(`https://www.ivyexec.com/employers/dashboard?page=${numberOfPage}`, {method: "GET"});
    return nextPage;
  }

  async function loggingOut() {
    let logOut = await fetch("https://www.ivyexec.com/employers/auth/logout", {method: "GET"});
    return logOut;
  }

  function resultsAddition(browsingThroughJobsResult) {
    companyBrowsingFinalResult.activeSet = companyBrowsingFinalResult.activeGet + browsingThroughJobsResult.active;
    companyBrowsingFinalResult.pendingSet = companyBrowsingFinalResult.pendingGet + browsingThroughJobsResult.pending;
    companyBrowsingFinalResult.expiredSet = companyBrowsingFinalResult.expiredGet + browsingThroughJobsResult.expired;
    companyBrowsingFinalResult.disapprovedSet = companyBrowsingFinalResult.disapprovedGet + browsingThroughJobsResult.disapproved;
    companyBrowsingFinalResult.disabledDeadLinksSet = companyBrowsingFinalResult.disabledDeadLinksGet + browsingThroughJobsResult.disabledDeadLinks;
    companyBrowsingFinalResult.setTotal = calcTotalNumber(); 
  }

  function resetResults() {
    companyBrowsingFinalResult.activeSet = companyBrowsingFinalResult.pendingSet = companyBrowsingFinalResult.expiredSet = companyBrowsingFinalResult.disapprovedSet = companyBrowsingFinalResult.disabledDeadLinksSet = 0; 
  }

  function contains(selector, text) {
    let elements = docum.querySelectorAll(selector);
    return Array.prototype.filter.call(elements, function(element){
      return RegExp(text).test(element.id);
    });
  }

  function jobsChecking(doc) {
    docum = doc;
    // console.log(doc);
    statusList = contains('td', /^status/);
    return listing(statusList);
  }

  function listing(statusList) {

    let jobsCounter = {
      active: 0,
      pending: 0, 
      expired: 0,
      disapproved: 0,
      disabledDeadLinks: 0,
    }

    let jobDate;
    if (statusList.length > 0) {
      statusList.forEach(item => {
      // console.log(item.firstElementChild.innerText);
      jobDate = new Date(item.nextElementSibling.innerText);
      // console.log(lowerDate);
      // console.log(upperDate);
      if (jobDate >= lowerDate && jobDate <= upperDate) {
      
        switch (item.firstElementChild.innerText) {
          case "Pending":
            jobsCounter.pending++;
            break;
          case "Active":
            jobsCounter.active++;
            break;
          case "Expired":
            jobsCounter.expired++;
            break;
          case "Disabled DeadLinks":
            jobsCounter.disabledDeadLinks++;
            break;
          case "Disapproved":
            jobsCounter.disapproved++;
            break;
          default:
        }
      } else {
        throw {
        result: jobsCounter,
        error: new Error("Error: date is exceed")
        }
      }
      })
    } else {
      throw {
        result: jobsCounter,
        error: new Error("Error: There are no date data")
      }
    }
    // console.log(pageObj.getPageNumber);
    pageObj.setPageNumber = pageObj.getPageNumber + 1;
    // console.log(pageObj.getPageNumber);
    return jobsCounter;
  }

  async function processPage (page, item) { 
    let pageText = await page.text();
    let pageHTML = await new DOMParser().parseFromString(pageText, 'text/html');
    try {
      let jobsBrowsingResult = jobsChecking(pageHTML);
      // console.log(jobsBrowsingResult);
      resultsAddition(jobsBrowsingResult);
      let nextPage = await fetchNextPage(pageObj.getPageNumber + 1);
      let processPageResult = await processPage(nextPage, item);
    } catch (err) {
        // console.log(err.result);
        resultsAddition(err.result);
        // console.log(err.error);
        if (err.error) {
          let logOutFinished = await loggingOut();
          return new Promise(function(resolve, reject) {
            // console.log(logOutFinished);
            // console.log("active: " + companyBrowsingFinalResult.activeGet);
            // console.log("pending: " + companyBrowsingFinalResult.pendingGet);
            // console.log("expired: " + companyBrowsingFinalResult.expiredGet);
            // console.log("disapproved: " + companyBrowsingFinalResult.disapprovedGet);
            // console.log("disabledDeadLinks: " + companyBrowsingFinalResult.disabledDeadLinksGet);
            // console.log("total: " + companyBrowsingFinalResult.getTotal);
            // console.log("Logged-out on page number: " + (pageObj.getPageNumber + 1));
            animateProgressBar();
            if (companyBrowsingFinalResult.getTotal > 0) { 
              resultsArr.push( {
                companyName: item[0], 
                active: companyBrowsingFinalResult.activeGet,
                pending: companyBrowsingFinalResult.pendingGet,
                expired: companyBrowsingFinalResult.expiredGet,
                disapproved: companyBrowsingFinalResult.disapprovedGet,
                disabledDeadLinks: companyBrowsingFinalResult.disabledDeadLinksGet,
                total: companyBrowsingFinalResult.getTotal,	
              });
            }
          resetResults();
          resolve("One company done!");
          })	
        }
    }
  }

  async function processSingleCompany(item) {
    pageObj.setPageNumber = 0;
    let dashboardPage = await loggingIn(item);
    let processPageResult = await processPage(dashboardPage, item);
  };

  async function browseThroughCompanies(array) {

    numberOfCompaniesToProcess = array.length;

    for (const item of array) {
      // console.log("Company to be processed next: " + item[0]);
      await processSingleCompany(item);
    }
    // console.log('Done!');
    // console.log(resultsArr);
    // resultsArr.forEach(elem => console.log(elem));

    let finalArr = [];

    finalArr = resultsArr.map(function (obj) {
      let temporaryArr = [];

      Object.keys(obj).forEach(function (key) {
        temporaryArr.push(obj[key]);	
      });
      return temporaryArr;
    });

    finalArr.unshift(["Company", "Active", "Pending", "Expired", "Disapproved", "DisabledDeadLinks", "Total"]);

    // console.log(finalArr);

    signInButton.type = "submit";
    signInButton.style.backgroundColor = "#7db93d";
    signInButton.innerText = "Sign In";

    myProgress.style.display = "none";

    // Creates .csv document

    let csvContent = "data:text/csv;charset=utf-8,";

    finalArr.forEach(function(rowArray) {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Ivy Weekly Report.csv");
    document.body.appendChild(link); // Required for FF

    link.click(); // triggers (simulates) mouse click event

    // End of creating .csv document
  }	

  // console.log(companiesToProcessArr.length);
  // console.log(companiesToProcessArr);

  browseThroughCompanies(companiesToProcessArr);	

}
