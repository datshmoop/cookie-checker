document.getElementById("getCookies").addEventListener("click", fetchCookies);
document.getElementById("deleteAllCookies").addEventListener("click", deleteAllCookies);
document.getElementById("filterCookies").addEventListener("change", fetchCookies);

// Function to fetch and display cookies
function fetchCookies() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let url = tabs[0].url;

        chrome.cookies.getAll({ url: url }, (cookies) => {
            chrome.storage.local.get("cookieClassifications", (data) => {
                let classifications = data.cookieClassifications || {};
                displayCookies(cookies, classifications);
            });
        });
    });
}

// Function to display cookies in the table
function displayCookies(cookies, classifications) {
    let tableBody = document.getElementById("cookieTableBody");
    tableBody.innerHTML = "";
    let filter = document.getElementById("filterCookies").value;

    cookies.forEach(cookie => {
        let purpose = classifications[cookie.name] || getCookiePurpose(cookie.name);

        if (filter !== "all" && purpose.toLowerCase() !== filter) {
            return;
        }

        let row = document.createElement("tr");

        let nameCell = document.createElement("td");
        nameCell.textContent = cookie.name;

        let domainCell = document.createElement("td");
        domainCell.textContent = cookie.domain;

        let purposeCell = document.createElement("td");
        let purposeSelect = createPurposeDropdown(cookie.name, purpose, classifications);
        purposeCell.appendChild(purposeSelect);

        let actionCell = document.createElement("td");
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => deleteCookie(cookie));

        actionCell.appendChild(deleteButton);
        row.appendChild(nameCell);
        row.appendChild(domainCell);
        row.appendChild(purposeCell);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

// Function to determine the purpose of common cookies
function getCookiePurpose(name) {
    const purposeMap = {
        "_ga": "tracking",
        "_gid": "tracking",
        "_gat": "tracking",
        "session_id": "authentication",
        "csrftoken": "security",
        "sid": "authentication"
    };
    return purposeMap[name] || "unknown";
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

// Function to create a dropdown for purpose selection
function createPurposeDropdown(cookieName, currentPurpose, classifications) {
    let select = document.createElement("select");
    ["tracking", "authentication", "security", "unknown"].forEach(category => {
        let option = document.createElement("option");
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        if (category === currentPurpose) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    select.addEventListener("change", () => {
        classifications[cookieName] = select.value;
        chrome.storage.local.set({ cookieClassifications: classifications });
    });

    return select;
}
