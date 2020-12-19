"use strict";

window.onload = start;

async function start() {
    printDate();
    window.setInterval(printDate, 1000);
    await getUser();
    await handleShares();
}

/**
 * prints the current Date
 */
function printDate() {
    document.getElementById("date").innerHTML = new Date().toDateString();
}

/**
 * Prints the data of the current user
 * @returns {Promise<void>}
 */
async function getUser() {
    let user = await getName();
    let balance = await getBalance();
    document.getElementById("userName").innerText = "Benutzername: " + user;
    document.getElementById("balance").innerText = "Kontostand: " + balance + " $";

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
}

/**
 * prints the current share prices and handles the buy and sell functions
 * @returns {Promise<void>}
 */
async function handleShares() {
    const container = document.getElementById("share");
    const shareList = document.querySelector(".shares-list");
    const buy = document.querySelector('.buy');
    const sell = document.querySelector('.sell')
    // state with the current share that the user has chosen to buy / sell
    // starts with initial value: null
    let state = {
        'target': null
    };


    // Event Listeners
    buy.addEventListener("click", buyAction);
    sell.addEventListener("click", sellAction);

    // prints the current sales of the user in a table
    await appendData();
    // prints the current share prices in a chart
    await showSharePrice();
    //prints the currently available shares for buying / selling
    await showShares();
    await displayRanking();


    async function appendData() {
        const umsatz = await fetchUmsatz();
        console.log(umsatz);

        umsatz.forEach(function (e) {
            let tr = document.createElement("tr");
            let name = tr.insertCell();
            let price = tr.insertCell();
            let quantity = tr.insertCell()
            name.innerHTML = e.aktie.name;
            price.innerHTML = e.aktie.preis + "$";
            quantity.innerHTML = e.anzahl;
            container.appendChild(tr)
        });
    }

    /** Outputs the share price in the 'myChart' canvas **/
    async function showSharePrice() {
        let context = document.getElementById("myChart").getContext('2d');
        /** Gets all the names of the stocks **/
        let sales = await fetchShares();
        let labels = sales.map(function (e) {
            return e.name;
        });
        /** Gets all the prices of the stocks **/
        let data = sales.map(function (e) {
            return e.preis;
        });
        /** Configures stock price display **/
        let config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Graph line',
                    data: data,
                    borderColor: 'rgb(73,153,202)',
                    backgroundColor: 'rgba(236, 241,241, 0)',
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
        console.log(chart.data.datasets[0].data)

        async function updateDate() {
            sales = await fetchShares();
            chart.data.datasets[0].data = sales.map(function (e) {
                return e.preis;
            });
            //console.log(chart.data.datasets[0].data);
            chart.update()
        }

        window.setInterval(updateDate, 1000);
    }

    async function showShares() {
        let shares = await fetchShares();
        console.log(shares);
        shares.forEach(function (share) {
            const shareDiv = document.createElement("div");
            shareDiv.classList.add("share");
            const newShare = document.createElement("button");
            newShare.innerText = share.name;
            const newShareNum = document.createElement("input");
            newShareNum.type = "number";
            newShareNum.min = "1";
            newShareNum.max = share.anzahlVerfuegbar;
            newShareNum.value = "1";
            shareDiv.appendChild(newShare);
            shareDiv.appendChild(newShareNum);
            shareList.appendChild(shareDiv);
        });
        shareList.addEventListener("click", toggleButton);
        //console.log(shares);
    }

    async function displayRanking() {
        let rangListContainer = document.getElementById("rate");
        let ranking = await fetchRanking();
        let rankArray = await ranking.positionen;
        /** sort the rankArray ascending **/
        let sortedRankArray = rankArray.sort(compare);
        /** Display ranking list with the table **/
        sortedRankArray.forEach(function (rank) {
            let tr = document.createElement("tr");
            let name = tr.insertCell();
            let price = tr.insertCell();
            name.innerHTML = rank.aktie.name;
            price.innerHTML = rank.aktie.preis;
            rangListContainer.appendChild(tr);
        })

        function compare(a, b) {
            if (a.aktie.preis < b.aktie.preis) {
                return 1;
            }
            if (a.aktie.preis > b.aktie.preis) {
                return -1;
            }
            return 0;
        }
    }

    async function toggleButton(e) {
        const button = e.target;
        console.log(button.type)
        if (button.type === "submit") {
            if (state.target !== null) {
                state.target.parentElement.classList.toggle("chosenShare");
            }
            state.target = button;
            button.parentElement.classList.toggle("chosenShare");
        } else if (button.type === "number") {
            if (state.target !== null) {
                state.target.parentElement.classList.toggle("chosenShare");
            }
            state.target = button.previousSibling;
            button.parentElement.classList.toggle("chosenShare");
        }
    }

    async function buyAction() {
        const share = state.target;
        if (share !== null) {
            let name = share.innerText;
            let quantity = share.nextSibling.value;
            let action = {
                "aktie": {
                    "name": name
                },
                "anzahl": quantity
            };
            await fetch("/data/umsaetze", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(action)
            });
            container.innerHTML = "";
            state.target.parentElement.classList.toggle("chosenShare");
            state.target.nextSibling.value = "1";
            state.target = null;
            await appendData();
        }

    }

    async function sellAction() {
        const share = state.target;
        if (share !== null) {
            let name = share.innerText;
            let quantity = share.nextSibling.value;
            let action = {
                "aktie": {
                    "name": name
                },
                "anzahl": -quantity
            }
            await fetch("/data/umsaetze", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(action)
            });
            container.innerHTML = "";
            state.target.parentElement.classList.toggle("chosenShare");
            state.target = null;
            await appendData();
        }
    }
}

async function fetchUmsatz() {
    const response = await fetch("/data/umsaetze");
    return await response.json();
}

async function fetchShares() {
    const response = await fetch('/data/aktien');
    return await response.json();
}

/** Get the ranking list **/
async function fetchRanking() {
    const response = await fetch('/data/depot');
    return await response.json();
}
