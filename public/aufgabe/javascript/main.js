'use strict'
window.onload = start;

async function start() {
    let user = showUser();
    let sales = showSales();
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
    document.getElementById("userName").innerHTML = "Username: " + user;
    document.getElementById("balance").innerHTML = "Balance: " + balance;
}
async function getSales() {
    const response = await fetch('/data/aktien');
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    return jsonResponse;
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