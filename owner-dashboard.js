
// ============================================================
// A1 CAR DETAILING FACTORY
// OWNER DASHBOARD
// GOOGLE SHEETS CONNECTED VERSION
// ============================================================

// ============================================================
// GOOGLE APPS SCRIPT URL
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwoKohiflL0GrN8fqjZyzo-z16EA3m4Q8hqWavbc8oH1iL7W3rOQ6K1M-WLH6UiUFU8/exec";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("A1 Owner Dashboard Loaded");

    if (!checkOwnerLogin()) {
        return;
    }

    setupNavigation();
    loadDashboard();

});


// ============================================================
// OWNER LOGIN CHECK
// ============================================================

function checkOwnerLogin() {

    const loggedIn =
        sessionStorage.getItem("a1LoggedIn");

    const role =
        sessionStorage.getItem("a1Role") ||
        sessionStorage.getItem("a1UserRole") ||
        localStorage.getItem("a1Role") ||
        localStorage.getItem("a1UserRole");

    console.log("LOGIN STATUS:", loggedIn);
    console.log("OWNER ROLE:", role);


    // --------------------------------------------------------
    // NOT LOGGED IN
    // --------------------------------------------------------

    if (loggedIn !== "true") {

        window.location.replace("owner-login.html");

        return false;
    }


    // --------------------------------------------------------
    // OWNER ROLE CHECK
    // --------------------------------------------------------

    if (
        String(role || "").toLowerCase() !== "owner"
    ) {

        alert(
            "Only the owner can access this dashboard."
        );

        sessionStorage.clear();

        localStorage.removeItem("a1Role");
        localStorage.removeItem("a1UserRole");
        localStorage.removeItem("a1RememberMe");

        window.location.replace("owner-login.html");

        return false;
    }


    return true;
}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const activeCard =
        document.getElementById("activeVehiclesCard");

    const completedCard =
        document.getElementById("completedVehiclesCard");

    const staffLink =
        document.getElementById("staffManagementLink");

    const logoutBtn =
        document.getElementById("logoutBtn");


    // --------------------------------------------------------
    // ACTIVE VEHICLES
    // --------------------------------------------------------

    if (activeCard) {

        activeCard.addEventListener("click", function () {

            window.location.href =
                "active-vehicles.html";

        });


        activeCard.addEventListener("keydown", function (event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                window.location.href =
                    "active-vehicles.html";
            }

        });

    }


    // --------------------------------------------------------
    // COMPLETED VEHICLES
    // --------------------------------------------------------

    if (completedCard) {

        completedCard.addEventListener("click", function () {

            window.location.href =
                "completed-vehicles.html";

        });


        completedCard.addEventListener("keydown", function (event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                window.location.href =
                    "completed-vehicles.html";
            }

        });

    }


    // --------------------------------------------------------
    // STAFF MANAGEMENT
    // --------------------------------------------------------

    if (staffLink) {

        staffLink.addEventListener("click", function (event) {

            event.preventDefault();

            window.location.href =
                "staff-management.html";

        });

    }


    // --------------------------------------------------------
    // LOGOUT
    // --------------------------------------------------------

    if (logoutBtn) {

        logoutBtn.addEventListener("click", function (event) {

            event.preventDefault();

            logout();

        });

    }

}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    try {

        showLoading();


        const url =
            API_URL +
            "?action=getVehicles&t=" +
            Date.now();


        console.log("GET VEHICLES:", url);


        const response =
            await fetch(url, {
                method: "GET",
                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                "HTTP Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "GOOGLE SHEETS RESPONSE:",
            data
        );


        if (!data) {

            throw new Error(
                "No response received from Google Apps Script."
            );

        }


        // ----------------------------------------------------
        // ACCEPT DIFFERENT RESPONSE FORMATS
        // ----------------------------------------------------

        let vehicles = [];


        if (Array.isArray(data.vehicles)) {

            vehicles = data.vehicles;

        }
        else if (Array.isArray(data.records)) {

            vehicles = data.records;

        }
        else if (Array.isArray(data.data)) {

            vehicles = data.data;

        }
        else if (Array.isArray(data.rows)) {

            vehicles = data.rows;

        }
        else if (Array.isArray(data)) {

            vehicles = data;

        }


        console.log(
            "VEHICLES RECEIVED:",
            vehicles
        );


        // ----------------------------------------------------
        // UPDATE DASHBOARD
        // ----------------------------------------------------

        updateStatistics(vehicles);

        displayActiveVehicles(vehicles);

        displayCompletedVehicles(vehicles);

    }
    catch (error) {

        console.error(
            "DASHBOARD ERROR:",
            error
        );

        showDashboardError(
            error.message
        );

    }

}


// ============================================================
// UPDATE STATISTICS
// ============================================================

function updateStatistics(vehicles) {

    const total =
        vehicles.length;


    const active =
        vehicles.filter(function (vehicle) {

            return isActiveVehicle(
                getStatus(vehicle)
            );

        }).length;


    const completed =
        vehicles.filter(function (vehicle) {

            return isCompletedVehicle(
                getStatus(vehicle)
            );

        }).length;


    const revenue =
        calculateTodayRevenue(vehicles);


    setText(
        "totalVehicles",
        total
    );


    setText(
        "activeVehicles",
        active
    );


    setText(
        "completedVehicles",
        completed
    );


    setText(
        "todayRevenue",
        formatMoney(revenue)
    );

}


// ============================================================
// DISPLAY ACTIVE VEHICLES
// ============================================================

function displayActiveVehicles(vehicles) {

    const tbody =
        document.getElementById(
            "activeVehicleTable"
        );


    if (!tbody) {
        return;
    }


    const active =
        vehicles
            .filter(function (vehicle) {

                return isActiveVehicle(
                    getStatus(vehicle)
                );

            })
            .sort(function (a, b) {

                return (
                    getDateValue(
                        getEntryTime(a)
                    ) -
                    getDateValue(
                        getEntryTime(b)
                    )
                );

            });


    if (active.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-message">
                    🚗 No vehicles are currently inside the showroom.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        active.map(function (vehicle, index) {

            return `
                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                getVehicleNumber(vehicle) || "-"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            getOwnerName(vehicle) || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getPhone(vehicle) || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getVehicleName(vehicle) || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getService(vehicle) || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getEntryTime(vehicle) || "-"
                        )}
                    </td>

                    <td class="amount">
                        ${formatMoney(
                            getAmount(vehicle)
                        )}
                    </td>

                    <td class="balance">
                        ${formatMoney(
                            getBalance(vehicle)
                        )}
                    </td>

                    <td>
                        <span class="status-inside">
                            🟢 Inside
                        </span>
                    </td>

                </tr>
            `;

        }).join("");

}


// ============================================================
// DISPLAY COMPLETED VEHICLES
// ============================================================

function displayCompletedVehicles(vehicles) {

    const tbody =
        document.getElementById(
            "completedVehicleTable"
        );


    if (!tbody) {
        return;
    }


    const completed =
        vehicles
            .filter(function (vehicle) {

                return isCompletedVehicle(
                    getStatus(vehicle)
                );

            })
            .sort(function (a, b) {

                return (
                    getDateValue(
                        getExitTime(b)
                    ) -
                    getDateValue(
                        getExitTime(a)
                    )
                );

            })
            .slice(0, 20);


    if (completed.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="12" class="empty-message">
                    ✅ No completed vehicles found.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        completed.map(function (vehicle, index) {

            return `
                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                getVehicleNumber(vehicle) || "-"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            getOwnerName(vehicle) || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getPhone(vehicle) || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getVehicleName(vehicle) || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getService(vehicle) || "-"
                        )}
                    </td>

                    <td class="amount">
                        ${formatMoney(
                            getAmount(vehicle)
                        )}
                    </td>

                    <td class="paid">
                        ${formatMoney(
                            getPaidAmount(vehicle)
                        )}
                    </td>

                    <td class="balance">
                        ${formatMoney(
                            getBalance(vehicle)
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getPaymentMethod(vehicle) || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            getExitTime(vehicle) || "-"
                        )}
                    </td>

                    <td>
                        <span class="status-completed">
                            ✅ Completed
                        </span>
                    </td>

                </tr>
            `;

        }).join("");

}


// ============================================================
// GET STATUS
// ============================================================

function getStatus(vehicle) {

    return String(
        vehicle.status ||
        vehicle.Status ||
        ""
    ).trim();

}


// ============================================================
// ACTIVE VEHICLE CHECK
// ============================================================

function isActiveVehicle(status) {

    const value =
        String(status || "")
            .trim()
            .toLowerCase();


    return (
        value === "inside" ||
        value === "inside showroom" ||
        value === "washing" ||
        value === "active"
    );

}


// ============================================================
// COMPLETED VEHICLE CHECK
// ============================================================

function isCompletedVehicle(status) {

    const value =
        String(status || "")
            .trim()
            .toLowerCase();


    return (
        value === "completed" ||
        value === "complete" ||
        value === "exited"
    );

}


// ============================================================
// VEHICLE NUMBER
// ============================================================

function getVehicleNumber(vehicle) {

    return String(
        vehicle.vehicleNumber ||
        vehicle.vehicle_number ||
        vehicle.number ||
        vehicle.registrationNumber ||
        vehicle.registration_number ||
        ""
    );

}


// ============================================================
// OWNER NAME
// ============================================================

function getOwnerName(vehicle) {

    return String(
        vehicle.ownerName ||
        vehicle.owner_name ||
        vehicle.owner ||
        ""
    );

}


// ============================================================
// PHONE
// ============================================================

function getPhone(vehicle) {

    return String(
        vehicle.phone ||
        vehicle.phoneNumber ||
        vehicle.phone_number ||
        vehicle.mobile ||
        ""
    );

}


// ============================================================
// VEHICLE NAME
// ============================================================

function getVehicleName(vehicle) {

    return String(
        vehicle.vehicleName ||
        vehicle.vehicle_name ||
        vehicle.vehicleType ||
        vehicle.vehicle_type ||
        ""
    );

}


// ============================================================
// SERVICE
// ============================================================

function getService(vehicle) {

    const service =
        String(
            vehicle.serviceType ||
            vehicle.service_type ||
            vehicle.service ||
            ""
        ).trim();


    const lower =
        service.toLowerCase();


    if (lower === "full wash") {
        return "Full Wash";
    }


    if (lower === "body wash") {
        return "Body Wash";
    }


    if (lower === "ceramic coating") {
        return "Ceramic Coating";
    }


    return service;

}


// ============================================================
// ENTRY TIME
// ============================================================

function getEntryTime(vehicle) {

    return String(
        vehicle.entryTime ||
        vehicle.entry_time ||
        vehicle.entry ||
        ""
    );

}


// ============================================================
// EXIT TIME
// ============================================================

function getExitTime(vehicle) {

    return String(
        vehicle.exitTime ||
        vehicle.exit_time ||
        vehicle.exit ||
        ""
    );

}


// ============================================================
// TOTAL AMOUNT
// ============================================================

function getAmount(vehicle) {

    return Number(
        vehicle.amount ??
        vehicle.totalAmount ??
        vehicle.total_amount ??
        vehicle.serviceAmount ??
        vehicle.service_amount ??
        0
    ) || 0;

}


// ============================================================
// PAID AMOUNT
// ============================================================

function getPaidAmount(vehicle) {

    return Number(
        vehicle.paidAmount ??
        vehicle.paid_amount ??
        vehicle.amountReceived ??
        vehicle.amount_received ??
        vehicle.paid ??
        vehicle.receivedAmount ??
        vehicle.received_amount ??
        0
    ) || 0;

}


// ============================================================
// BALANCE
// ============================================================

function getBalance(vehicle) {

    if (
        vehicle.balance !== undefined &&
        vehicle.balance !== null &&
        vehicle.balance !== ""
    ) {

        const balance =
            Number(vehicle.balance);


        if (!isNaN(balance)) {

            return Math.max(
                0,
                balance
            );

        }

    }


    return Math.max(
        0,
        getAmount(vehicle) -
        getPaidAmount(vehicle)
    );

}


// ============================================================
// PAYMENT METHOD
// ============================================================

function getPaymentMethod(vehicle) {

    return String(
        vehicle.paymentMethod ||
        vehicle.payment_method ||
        vehicle.payment ||
        ""
    );

}


// ============================================================
// TODAY REVENUE
// ============================================================

function calculateTodayRevenue(vehicles) {

    const today =
        getTodayString();


    return vehicles.reduce(
        function (total, vehicle) {

            if (
                !isCompletedVehicle(
                    getStatus(vehicle)
                )
            ) {

                return total;
            }


            const exitDate =
                parseSheetDate(
                    getExitTime(vehicle)
                );


            if (!exitDate) {
                return total;
            }


            if (
                getDateString(exitDate) !==
                today
            ) {

                return total;
            }


            return (
                total +
                getPaidAmount(vehicle)
            );

        },
        0
    );

}


// ============================================================
// TODAY STRING
// ============================================================

function getTodayString() {

    return getDateString(
        new Date()
    );

}


// ============================================================
// DATE STRING
// ============================================================

function getDateString(date) {

    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")
    );

}


// ============================================================
// DATE PARSER
// ============================================================

function parseSheetDate(value) {

    if (!value) {
        return null;
    }


    if (value instanceof Date) {
        return value;
    }


    const text =
        String(value).trim();


    if (!text) {
        return null;
    }


    // DD/MM/YYYY HH:MM:SS AM/PM

    let match =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i
        );


    if (match) {

        let hour =
            Number(match[4] || 0);


        const minute =
            Number(match[5] || 0);


        const second =
            Number(match[6] || 0);


        const ampm =
            String(
                match[7] || ""
            ).toUpperCase();


        if (
            ampm === "PM" &&
            hour < 12
        ) {

            hour += 12;
        }


        if (
            ampm === "AM" &&
            hour === 12
        ) {

            hour = 0;
        }


        return new Date(
            Number(match[3]),
            Number(match[2]) - 1,
            Number(match[1]),
            hour,
            minute,
            second
        );

    }


    // YYYY-MM-DD HH:MM:SS

    match =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
        );


    if (match) {

        return new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3]),
            Number(match[4] || 0),
            Number(match[5] || 0),
            Number(match[6] || 0)
        );

    }


    // Normal JavaScript date

    const parsed =
        new Date(text);


    return isNaN(
        parsed.getTime()
    )
        ? null
        : parsed;

}


// ============================================================
// DATE VALUE
// ============================================================

function getDateValue(value) {

    const date =
        parseSheetDate(value);


    return date
        ? date.getTime()
        : 0;

}


// ============================================================
// FORMAT MONEY
// ============================================================

function formatMoney(value) {

    return (
        "₹" +
        Number(value || 0)
            .toLocaleString("en-IN")
    );

}


// ============================================================
// SET TEXT
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ============================================================
// LOADING
// ============================================================

function showLoading() {

    const active =
        document.getElementById(
            "activeVehicleTable"
        );


    const completed =
        document.getElementById(
            "completedVehicleTable"
        );


    if (active) {

        active.innerHTML = `
            <tr>
                <td colspan="10" class="loading">
                    Loading vehicles from Google Sheets...
                </td>
            </tr>
        `;

    }


    if (completed) {

        completed.innerHTML = `
            <tr>
                <td colspan="12" class="loading">
                    Loading completed vehicles...
                </td>
            </tr>
        `;

    }

}


// ============================================================
// ERROR
// ============================================================

function showDashboardError(message) {

    const active =
        document.getElementById(
            "activeVehicleTable"
        );


    const completed =
        document.getElementById(
            "completedVehicleTable"
        );


    if (active) {

        active.innerHTML = `
            <tr>
                <td colspan="10" class="error-message">

                    <strong>
                        Cannot connect to Google Sheets.
                    </strong>

                    <br>
                    <br>

                    ${escapeHtml(
                        message ||
                        "Unknown error."
                    )}

                </td>
            </tr>
        `;

    }


    if (completed) {

        completed.innerHTML = `
            <tr>
                <td colspan="12" class="error-message">

                    Google Sheets connection failed.

                    <br>
                    <br>

                    Please check your Apps Script deployment.

                </td>
            </tr>
        `;

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(
        value == null
            ? ""
            : value
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

    console.log("OWNER LOGOUT");


    // Clear session

    sessionStorage.removeItem(
        "a1LoggedIn"
    );

    sessionStorage.removeItem(
        "a1Role"
    );

    sessionStorage.removeItem(
        "a1UserRole"
    );

    sessionStorage.removeItem(
        "a1User"
    );

    sessionStorage.removeItem(
        "a1Token"
    );

    sessionStorage.removeItem(
        "a1StaffName"
    );

    sessionStorage.removeItem(
        "a1StaffId"
    );


    // Clear remember login

    localStorage.removeItem(
        "a1RememberMe"
    );

    localStorage.removeItem(
        "a1Role"
    );

    localStorage.removeItem(
        "a1UserRole"
    );


    // Go to owner login

    window.location.replace(
        "owner-login.html"
    );

}


