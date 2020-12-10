'use strict'
window.onload = start;

async function start() {
    await printDate();
    window.setInterval('await printDate()', 1000);
    await showUser();
    await showSales();
    await showSharePrice()
}

async function printDate() {
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
    return jsonResponse.kontostand;

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
    console.log(jsonResponse);
    return jsonResponse;
}

// Gibt den Aktienkurs in dem Canvas 'myChart' aus
async function showSharePrice() {
    let context = document.getElementById("myChart");
    let sales = await getSales();
    //Alle Namen der Aktien holen
    let labels = sales.map(function(e){
        return e.name;
    });
    //Alle Preise der Akien holen
    let data = sales.map(function (e) {
        return e.preis;
    })
    //Aktienkursdarstellung konfigurieren
    let config = {
        type: 'line',
        data : {
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

async function showSales() {
    let salesInJson = await getSales();
    let sales1 = document.getElementById("sales1").innerHTML="Name: " +
        salesInJson[0].name + "<br \>" + "preis: " + salesInJson[0].preis + "<br \>"
        + "AnzahlVerfuegbar: " + salesInJson[0].anzahlVerfuegbar;
    let sales2 = document.getElementById("sales2").innerHTML="Name: " +
        salesInJson[1].name + "<br \>" + "preis: " + salesInJson[1].preis + "<br \>"
        + "AnzahlVerfuegbar: " + salesInJson[1].anzahlVerfuegbar;

}