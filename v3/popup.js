document.getElementById("getCookies").addEventListener("click", fetchCookies);
document.getElementById("deleteAllCookies").addEventListener("click", deleteAllCookies);

// Function to fetch and display cookies
function fetchCookies() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let url = tabs[0].url;

        chrome.cookies.getAll({ url: url }, (cookies) => {
            displayCookies(cookies);
        });
    });
}

// Function to display cookies in the table
function displayCookies(cookies) {
    let tableBody = document.getElementById("cookieTableBody");
    tableBody.innerHTML = "";

    cookies.forEach(cookie => {
        let row = document.createElement("tr");

        let nameCell = document.createElement("td");
        nameCell.textContent = cookie.name;

        let domainCell = document.createElement("td");
        domainCell.textContent = cookie.domain;

        let actionCell = document.createElement("td");

        // Create Search Info Button
        let infoButton = document.createElement("button");
        infoButton.textContent = "Search Info";
        infoButton.className = "info-btn";
        infoButton.addEventListener("click", () => {
            let searchUrl = `https://cookiesearch.org/cookies/?search-term=${encodeURIComponent(cookie.name)}`;
            window.open(searchUrl, "_blank");
        });

        // Create Delete Button
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => deleteCookie(cookie));

        actionCell.appendChild(infoButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(domainCell);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

// Function to delete a single cookie
function deleteCookie(cookie) {
    let url = (cookie.secure ? "https://" : "http://") + cookie.domain + cookie.path;

    chrome.cookies.remove({ url: url, name: cookie.name }, (details) => {
        if (details) {
            console.log(`Deleted cookie: ${cookie.name}`);
            fetchCookies(); // Refresh table
        } else {
            console.error("Failed to delete cookie:", cookie);
        }
    });
}

// Function to delete all cookies
function deleteAllCookies() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let url = tabs[0].url;

        chrome.cookies.getAll({ url: url }, (cookies) => {
            let deletePromises = cookies.map(cookie => {
                let cookieUrl = (cookie.secure ? "https://" : "http://") + cookie.domain + cookie.path;
                return chrome.cookies.remove({ url: cookieUrl, name: cookie.name });
            });

            Promise.all(deletePromises).then(() => {
                console.log("All cookies deleted.");
                fetchCookies(); // Refresh table
            });
        });
    });
}
