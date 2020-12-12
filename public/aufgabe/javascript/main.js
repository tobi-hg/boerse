'use strict'
window.onload = start;

async function start() {
    printDate();
    window.setInterval('printDate()', 1000);
    await showUser();
    await appendData();
    await showSharePrice();
    let buy = document.querySelector('.buy');
    buy.addEventListener('click', await buyAction);
    let sell = document.querySelector('.sell')
    //sell.addEventListener('click', await sellAction)
}

function printDate() {
    document.getElementById("date").innerHTML = new Date().toDateString();
}

async function getName() {
    /** Ask the server information **/
    const response = await fetch('/data/benutzerdaten');
    /** Get the Json format of the object from Server**/
    const jsonResponse = await response.json();
    return jsonResponse.name;
}

async function getBalance() {
    /** Ask the server information **/
    const response = await fetch('/data/benutzerdaten');
    /** Get the Json format of the object from Server**/
    const jsonResponse = await response.json();
    return jsonResponse.kontostand.toFixed(2);

}

async function showUser() {
    let user = await getName();
    let balance = await getBalance();
    document.getElementById("userName").innerText = "Benutzername: " + user;
    document.getElementById("balance").innerText = "Kontostand: " + balance + " $";
}

async function getSales() {
    const response = await fetch('/data/aktien');
    const jsonResponse = await response.json();
    return jsonResponse;
}

// Gibt den Aktienkurs in dem Canvas 'myChart' aus
async function showSharePrice() {
    let context = document.getElementById("myChart");
    /** Adjust Size **/
    let contextValue = context.getContext("2d");
    contextValue.canvas.width = 1000;
    contextValue.canvas.height = 150;
    /** Alle Namen der Aktien holen **/
    let sales = await getSales();
    let labels = sales.map(function (e) {
        return e.name;
    });
    //Alle Preise der Aktien holen
    let data = sales.map(function (e) {
        return e.preis;
    })
    //Aktienkursdarstellung konfigurieren
    let config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Graph line',
                data: data,
                borderColor: 'rgb(73,153,202)',
                backgroundColor: 'rgba(236, 241,241, 0)'
            }],
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
    let chart = new Chart(context, config);
}

async function buyAction() {
    let name;
    let quantity;
    if (document.getElementById("microsoft").checked) {
        name = document.getElementById("microsoft").value;
        quantity = document.getElementById("microsoftNumber").value;
    }
    if (document.getElementById("apple").checked) {
        name = document.getElementById("apple").value;
        quantity = document.getElementById("appleNumber").value;
    }
    if (document.getElementById("niantic").checked) {
        name = document.getElementById("niantic").value;
        quantity = document.getElementById("nianticNumber").value;
    }
    if (document.getElementById("amd").checked) {
        name = document.getElementById("amd").value;
        quantity = document.getElementById("amdNumber").value;
    }
    if (document.getElementById("intel").checked) {
        name = document.getElementById("intel").value;
        quantity = document.getElementById("intelNumber").value;
    }
    if (document.getElementById("facebook").checked) {
        name = document.getElementById("facebook").value;
        quantity = document.getElementById("facebookNumber").value;
    }

    let action = {
        "aktie": {
            name: name
        },
        anzahl: quantity
    }
    let response = await fetch("/data/umsaetze/add", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(action)
    });
}
/*
async function sellAction() {

}*/

async function appendData() {
    const umsatz = await fetchUmsatz();
    console.log(umsatz);
    const container = document.getElementById("umsatz");
    umsatz.forEach(function (e) {
        console.log(e.aktie.name)
        const u = document.createElement('p');
        u.innerText = "Name: " + e.aktie.name + " Preis: " + e.aktie.preis + " $ Anzahl: " + e.anzahl;
        container.appendChild(u)
    });
}

async function fetchUmsatz() {
    const response = await fetch("/data/umsaetze");
    return await response.json();
}
