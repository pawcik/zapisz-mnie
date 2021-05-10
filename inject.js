async function checkSlot(body, callback) {
    let res = await fetch(
      "https://pacjent.erejestracja.ezdrowie.gov.pl/api/calendarSlots/find", {
      method: "POST",
      body: JSON.stringify(body)
    });
    let prescriptionId = body.prescriptionId;
    let slots = await res.json();
    console.log('Checking avaiable slots, got:');
    console.log(slots);
    if (slots && slots.list && slots.list.length > 0) {
      let first = slots.list[0];
      let data = { prescriptionId: prescriptionId };
      res = await fetch(
        `https://pacjent.erejestracja.ezdrowie.gov.pl/api/calendarSlot/${first.id}/confirm`, {
        method: "POST",
        body: JSON.stringify(data)
      });
      let confirmRes = await res.json();
      callback(res, confirmRes)
    }
};

var checkSlotIntervalId = undefined;

function registerTab() {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs) => {
      let tabId = tabs[0].id;
      chrome.runtime.sendMessage(
        {
          type: 'register',
          tabId: tab.id
        },
        (response) => {
            if (response) {
              this.setState({
                traffic: Object.assign(this.state.traffic, response)
              });
            }
          });
    });
}

var readyStateCheckInterval = setInterval(() => {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
  }
}, 10);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "search") {
    const search = () => {
      checkSlot(request.body, (res, json) => {
        console.log("Fouund!");
        console.log(res);
        console.log(json);
        clearInterval(checkSlotIntervalId);
      });

    }
    checkSlotIntervalId = setInterval(search, 5000);
  }
});
