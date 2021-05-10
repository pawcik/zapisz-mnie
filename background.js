var FIND_BODY = undefined;
chrome.runtime.onInstalled.addListener(() => {

  //cleaup session rules on install
  chrome.declarativeNetRequest.getSessionRules((rules) => {
    console.log('after install');
    console.log(rules);
    if (rules) {
      const toRemoveIds = rules.map((r) => r.id);
      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: toRemoveIds
      });
    }
  });

  chrome.webRequest.onBeforeSendHeaders.addListener(
    async (details) => {
      const headers = details.requestHeaders.reduce((map, obj) => {
        map[obj.name.toLowerCase()] = obj.value;
        return map;
      }, {});
      let xcsrftoken = headers['x-csrf-token'];
      const regex = /.*api\/auth\/logout$/;
      let isLogout = details.url.match(regex);
      if (xcsrftoken && !isLogout) {
        chrome.declarativeNetRequest.getSessionRules((count) => {
          if (count == 0) {
            chrome.declarativeNetRequest.updateSessionRules({
              addRules: [
                {
                  id: 1,
                  priority: 1,
                  action: {
                    type: 'modifyHeaders',
                    requestHeaders: [
                      {
                        header: 'x-csrf-token',
                        operation: 'set',
                        value: xcsrftoken
                      }
                    ]
                  },
                  condition: {
                    regexFilter: 'https://pacjent.erejestracja.ezdrowie.gov.pl/api/.*'
                  }
                }
              ]
            }, (result) => {
              console.log('created', result);
            });
          }
        });
      }
    },
    {urls: ["https://pacjent.erejestracja.ezdrowie.gov.pl/api/*"]},
    ["requestHeaders"]
  );


  chrome.webRequest.onBeforeRequest.addListener(
    async (details) => {
      let rawBody = details.requestBody.raw[0].bytes;
      let str = String.fromCharCode.apply(null, new Uint8Array(rawBody));
      let findBody = JSON.parse(str);
      FIND_BODY = findBody;
    },
    {urls: ["https://pacjent.erejestracja.ezdrowie.gov.pl/api/calendarSlots/find"]},
    ["requestBody"]
  );

  chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {
        type: "search",
        body: FIND_BODY
      }, (response) => {
        console.log(response);
      });
  });

});
