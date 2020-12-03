chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.body.newValue) {
    console.log(changes.body.newValue);
  }
  for (var key in changes) {
    // lists all changes in storage
    var storageChange = changes[key];
    console.log(
      'Storage key "%s" in namespace "%s" changed. ' +
        'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue
    );
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  //console.log(sender.tab ?
  //            "from a content script:" + sender.tab.url :
  //            "from the extension");
  console.log(
    "Received %o from %o, frame",
    request,
    sender.tab,
    sender.frameId
  );

  if (request.browseThroughCompanies == "start") {
    sendResponse({ farewell: "Browsing through companies started!" });
    chrome.tabs.create(
      { active: true, url: "https://www.ivyexec.com/employers/auth/login" },
      function(tab) {
        // never executes- opening new tab closes popup.html and its console*/
      }
    );
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
        url: "https://www.ivyexec.com/employers/auth/login"
      },
      function(tabs) {
        chrome.tabs.executeScript(tabs[0].id, {
          runAt: "document_idle",
          file: "/weeklyReportScript.js"
        });
      }
    );
  }
});
