function checkSlots() {
  console.log('test');
  //fetch("https://pacjent.erejestracja.ezdrowie.gov.pl/api/calendarSlots/find", {
    //method: "POST",
    //body: "{\"dayRange\":{\"from\":\"2021-05-07\",\"to\":\"2021-06-30\"},\"geoId\":\"1261011\",\"prescriptionId\":\"df063786-5209-4edc-a21e-260b77ff4df8\",\"voiId\":\"12\",\"vaccineTypes\":[\"cov19.pfizer\",\"cov19.moderna\",\"cov19.johnson_and_johnson\"]}",
    //mode: "cors",
    //credentials: 'include'
  //});
}

function findSlots(headers) {
  headers.origin = 'https://pacjent.erejestracja.ezdrowie.gov.pl';
  fetch("https://pacjent.erejestracja.ezdrowie.gov.pl/api/calendarSlots/find", {
    method: "POST",
    headers: headers,
    body: "{\"dayRange\":{\"from\":\"2021-05-07\",\"to\":\"2021-06-30\"},\"geoId\":\"1261011\",\"prescriptionId\":\"df063786-5209-4edc-a21e-260b77ff4df8\",\"voiId\":\"12\",\"vaccineTypes\":[\"cov19.pfizer\",\"cov19.moderna\",\"cov19.johnson_and_johnson\"]}"
  });
}

var done = false;
var xcsrftoken = undefined;

chrome.runtime.onInstalled.addListener(() => {
  // create alarm after extension is installed / upgraded
  //setInterval(checkSlots, 1000);

  chrome.cookies.get({
    url: "https://pacjent.erejestracja.ezdrowie.gov.pl",
    name: "patient_sid"
  }, (cookie) => {
    console.log(cookie);
  });

  chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      console.log(details.requestHeaders);
      const headers = details.requestHeaders.reduce((map, obj) => {
        map[obj.name.toLowerCase()] = obj.value;
        return map;
      }, {});
      if (!xcsrftoken) {
        chrome.declarativeNetRequest.updateDynamicRules({
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
                    value: headers['x-csrf-token']
                  }
                ]
              },
              condition: {
                regexFilter: 'https://pacjent.erejestracja.ezdrowie.gov.pl/.*'
              }
            }
          ]
        }, (result) => {
          console.log('created', result);
        });
        xcsrftoken = headers['x-csrf-token'];
      } else {
        details.requestHeaders.push({
          name: 'x-csrf-token',
          value: xcsrftoken
        });
      }
      return {requestHeaders: details.requestHeaders}
    },
    {urls: ["https://pacjent.erejestracja.ezdrowie.gov.pl/api/calendarSlots/find"]},
    ["requestHeaders"]
  );

  chrome.webRequest.onSendHeaders.addListener(
    (details) => {
      console.log(details.requestHeaders['x-csrf-token']);
    },
    {urls: ["https://pacjent.erejestracja.ezdrowie.gov.pl/api/calendarSlots/find"]},
    ["extraHeaders" ,"requestHeaders"]
  );
});
