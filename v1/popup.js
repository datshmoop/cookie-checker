document.getElementById("getCookies").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let url = tabs[0].url;

        chrome.cookies.getAll({ url: url }, (cookies) => {
            let tableBody = document.getElementById("cookieTableBody");
            tableBody.innerHTML = ""; // Clear previous entries

            cookies.forEach(cookie => {
                let row = document.createElement("tr");

                let nameCell = document.createElement("td");
                nameCell.textContent = cookie.name;

                let domainCell = document.createElement("td");
                domainCell.textContent = cookie.domain;

                let purposeCell = document.createElement("td");
                purposeCell.textContent = getCookiePurpose(cookie.name);

                let actionCell = document.createElement("td");
                let deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", () => deleteCookie(cookie));

                actionCell.appendChild(deleteButton);
                row.appendChild(nameCell);
                row.appendChild(domainCell);
                row.appendChild(purposeCell);
                row.appendChild(actionCell);
                tableBody.appendChild(row);
            });
        });
    });
});

// Function to determine the purpose of common cookies
function getCookiePurpose(name) {
    const purposeMap = {
        "_ga": "Google Analytics - Tracks users",
        "_gid": "Google Analytics - Session tracking",
        "_gat": "Google Analytics - Throttling requests",
        "session_id": "Authentication - Keeps users logged in",
        "csrftoken": "Security - Prevents CSRF attacks",
        "sid": "Authentication - Session management"
    };

    return purposeMap[name] || "Unknown / Needs review";
}

// Function to delete a cookie
function deleteCookie(cookie) {
    let url = (cookie.secure ? "https://" : "http://") + cookie.domain + cookie.path;

    chrome.cookies.remove({
        url: url,
        name: cookie.name
    }, (details) => {
        if (details) {
            console.log(`Deleted cookie: ${cookie.name}`);
            document.getElementById("getCookies").click(); // Refresh table
        } else {
            console.error("Failed to delete cookie:", cookie);
        }
    });
}
