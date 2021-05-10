async function checkSlot() {
    let res = await fetch(
      "https://pacjent.erejestracja.ezdrowie.gov.pl/api/calendarSlots/find", {
      method: "POST",
      body: `
        {
          "dayRange": {
            "from": "2021-05-07",
            "to": "2021-05-15"
          },
          "geoId": "1261011",
          "prescriptionId": "df063786-5209-4edc-a21e-260b77ff4df8",
          "voiId": "12",
          "vaccineTypes": [
            "cov19.pfizer",
            "cov19.moderna",
            "cov19.johnson_and_johnson"
          ]
        }`
    });
    let slots = await res.json();
    console.log('Checking avaiable slots, got:');
    console.log(slots);
    if (slots && slots.list && slots.list.length > 0) {
      let first = slots.list[0];
      res = await fetch(
        `https://pacjent.erejestracja.ezdrowie.gov.pl/api/calendarSlot/${first.id}/confirm`, {
        method: "POST",
        body: `
          {
            "prescriptionId": "df063786-5209-4edc-a21e-260b77ff4df8"
          }`
      });
      let confirmRes = await res.json();
      console.log(confirmRes);
		  clearInterval(checkSlotIntervalId);
    }
};

var checkSlotIntervalId = undefined;

var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);
    checkSlotIntervalId = setInterval(checkSlot, 5000);
  }
}, 10);

