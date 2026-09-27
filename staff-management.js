
// =====================================================
// A1 CAR DETAILING FACTORY
// STAFF MANAGEMENT
// =====================================================


// =====================================================
// GOOGLE APPS SCRIPT API
// =====================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwoKohiflL0GrN8fqjZyzo-z16EA3m4Q8hqWavbc8oH1iL7W3rOQ6K1M-WLH6UiUFU8/exec";


// =====================================================
// ELEMENTS
// =====================================================

const staffForm =
    document.getElementById("staffForm");

const nameInput =
    document.getElementById("staffName");

const usernameInput =
    document.getElementById("staffUsername");

const passwordInput =
    document.getElementById("staffPassword");

const phoneInput =
    document.getElementById("staffPhone");

const addVehicleInput =
    document.getElementById("addVehiclePermission") ||
    document.getElementById("addVehicle");

const staffTableBody =
    document.getElementById("staffTableBody") ||
    document.querySelector("#staffTable tbody");


// =====================================================
// OWNER LOGIN CHECK
// =====================================================

function checkOwnerLogin() {

    const ownerLoggedIn =
        sessionStorage.getItem("a1LoggedIn") === "true" ||
        localStorage.getItem("a1RememberMe") === "true";

    const role =
        sessionStorage.getItem("a1Role");


    if (!ownerLoggedIn) {

        window.location.href = "login.html";

        return false;
    }


    if (role && role !== "owner") {

        window.location.href = "login.html";

        return false;
    }


    return true;
}


if (!checkOwnerLogin()) {

    throw new Error("Owner login required.");

}


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(message, type = "success") {

    let box =
        document.getElementById("staffMessage");


    if (!box) {

        box =
            document.createElement("div");

        box.id =
            "staffMessage";

        document.body.prepend(box);

    }


    box.textContent =
        message;

    box.className =
        type;


    setTimeout(function () {

        if (box) {

            box.textContent = "";

        }

    }, 4000);

}


// =====================================================
// CONVERT VALUE TO TRUE / FALSE
// =====================================================

function isTrue(value) {

    if (value === true) {

        return true;

    }


    if (value === 1) {

        return true;

    }


    if (typeof value === "string") {

        const v =
            value.trim().toLowerCase();


        return (
            v === "true" ||
            v === "yes" ||
            v === "1" ||
            v === "on"
        );

    }


    return false;

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// ESCAPE JAVASCRIPT ATTRIBUTE
// =====================================================

function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


// =====================================================
// GET STAFF IDENTIFIER
// Supports username OR staffId
// =====================================================

function getStaffIdentifier(staff) {

    return (
        staff.username ||
        staff.staffId ||
        staff.id ||
        ""
    );

}


// =====================================================
// GET STAFF NAME
// =====================================================

function getStaffName(staff) {

    return (
        staff.name ||
        staff.staffName ||
        "-"
    );

}


// =====================================================
// GET ADD VEHICLE PERMISSION
// =====================================================

function getAddVehiclePermission(staff) {

    if (staff.addVehicle !== undefined) {

        return isTrue(
            staff.addVehicle
        );

    }


    if (staff.permissions) {

        return isTrue(
            staff.permissions.addVehicle
        );

    }


    return false;

}


// =====================================================
// GET STAFF ACTIVE STATUS
// =====================================================

function getStaffActiveStatus(staff) {

    if (staff.active !== undefined) {

        return isTrue(
            staff.active
        );

    }


    if (staff.status !== undefined) {

        const status =
            String(staff.status)
                .trim()
                .toLowerCase();


        return (
            status === "active" ||
            status === "enabled"
        );

    }


    return true;

}


// =====================================================
// CREATE STAFF
// =====================================================

if (staffForm) {

    staffForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            const username =
                usernameInput
                    ? usernameInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value.trim()
                    : "";


            const phone =
                phoneInput
                    ? phoneInput.value.trim()
                    : "";


            const canAddVehicle =
                addVehicleInput
                    ? Boolean(addVehicleInput.checked)
                    : false;


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (!name) {

                showMessage(
                    "Please enter staff name.",
                    "error"
                );

                return;

            }


            if (!username) {

                showMessage(
                    "Please enter Staff ID / username.",
                    "error"
                );

                return;

            }


            if (!password) {

                showMessage(
                    "Please enter password.",
                    "error"
                );

                return;

            }


            // -------------------------------------------------
            // BUTTON
            // -------------------------------------------------

            const submitButton =
                staffForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Creating...";

            }


            try {

                const staffData = {

                    action: "createStaff",

                    id:
                        "STAFF-" +
                        Date.now(),

                    staffId:
                        username,

                    username:
                        username,

                    name:
                        name,

                    password:
                        password,

                    phone:
                        phone,

                    role:
                        "staff",

                    active:
                        true,

                    status:
                        "Active",

                    addVehicle:
                        canAddVehicle,

                    permissions: {

                        addVehicle:
                            canAddVehicle

                    },

                    createdAt:
                        new Date().toISOString()

                };


                console.log(
                    "CREATING STAFF:",
                    staffData
                );


                // -------------------------------------------------
                // SEND TO GOOGLE APPS SCRIPT
                // -------------------------------------------------

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "text/plain;charset=utf-8"
                            },

                            body:
                                JSON.stringify(
                                    staffData
                                )
                        }
                    );


                const text =
                    await response.text();


                console.log(
                    "CREATE STAFF RESPONSE:",
                    text
                );


                if (!response.ok) {

                    throw new Error(
                        "HTTP error " +
                        response.status
                    );

                }


                if (!text.trim()) {

                    throw new Error(
                        "Google Apps Script returned an empty response."
                    );

                }


                let result;


                try {

                    result =
                        JSON.parse(text);

                }

                catch (jsonError) {

                    console.error(
                        "INVALID JSON:",
                        text
                    );

                    throw new Error(
                        "Invalid response from Google Apps Script."
                    );

                }


                if (result.success !== true) {

                    throw new Error(
                        result.message ||
                        "Could not create staff account."
                    );

                }


                // -------------------------------------------------
                // SUCCESS
                // -------------------------------------------------

                showMessage(
                    "Staff account created successfully.",
                    "success"
                );


                // -------------------------------------------------
                // CLEAR FORM
                // -------------------------------------------------

                if (nameInput) {

                    nameInput.value = "";

                }


                if (usernameInput) {

                    usernameInput.value = "";

                }


                if (passwordInput) {

                    passwordInput.value = "";

                }


                if (phoneInput) {

                    phoneInput.value = "";

                }


                if (addVehicleInput) {

                    addVehicleInput.checked =
                        false;

                }


                // -------------------------------------------------
                // RELOAD STAFF
                // -------------------------------------------------

                await loadStaff();


            }

            catch (error) {

                console.error(
                    "CREATE STAFF ERROR:",
                    error
                );


                showMessage(
                    "Error: " +
                    error.message,
                    "error"
                );

            }

            finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Create Staff Account";

                }

            }

        }
    );

}


// =====================================================
// LOAD STAFF
// =====================================================

async function loadStaff() {

    if (!staffTableBody) {

        console.warn(
            "Staff table body not found."
        );

        return;

    }


    try {

        console.log(
            "Loading staff..."
        );


        const response =
            await fetch(
                API_URL +
                "?action=getStaff&t=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        const text =
            await response.text();


        console.log(
            "GET STAFF RESPONSE:",
            text
        );


        if (!response.ok) {

            throw new Error(
                "HTTP error " +
                response.status
            );

        }


        if (!text.trim()) {

            throw new Error(
                "Google Apps Script returned an empty response."
            );

        }


        let result;


        try {

            result =
                JSON.parse(text);

        }

        catch (jsonError) {

            console.error(
                "INVALID JSON:",
                text
            );

            throw new Error(
                "Invalid response from Google Apps Script."
            );

        }


        if (result.success !== true) {

            throw new Error(
                result.message ||
                "Could not load staff."
            );

        }


        const staffList =
            result.staff ||
            result.data ||
            result.records ||
            [];


        displayStaff(
            staffList
        );


    }

    catch (error) {

        console.error(
            "LOAD STAFF ERROR:",
            error
        );


        staffTableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    Failed to load staff.
                </td>
            </tr>
        `;


        showMessage(
            "Failed to load staff: " +
            error.message,
            "error"
        );

    }

}


// =====================================================
// DISPLAY STAFF
// =====================================================

function displayStaff(staffList) {

    if (!staffTableBody) {

        return;

    }


    staffTableBody.innerHTML = "";


    if (
        !Array.isArray(staffList) ||
        staffList.length === 0
    ) {

        staffTableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    No staff accounts found.
                </td>
            </tr>
        `;

        return;

    }


    staffList.forEach(
        function (staff, index) {


            const identifier =
                getStaffIdentifier(
                    staff
                );


            const name =
                getStaffName(
                    staff
                );


            const phone =
                staff.phone ||
                "-";


            const addVehicle =
                getAddVehiclePermission(
                    staff
                );


            const active =
                getStaffActiveStatus(
                    staff
                );


            const safeIdentifier =
                escapeAttribute(
                    identifier
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHTML(name)}
                </td>

                <td>
                    ${escapeHTML(identifier || "-")}
                </td>

                <td>
                    ${escapeHTML(phone)}
                </td>

                <td>
                    ${
                        active
                            ? "🟢 Active"
                            : "🔴 Disabled"
                    }
                </td>

                <td>
                    ${
                        addVehicle
                            ? "✅ YES"
                            : "❌ NO"
                    }
                </td>

                <td>

                    <button
                        type="button"
                        class="staff-action-btn"
                        onclick="toggleVehicleAccess('${safeIdentifier}')"
                    >
                        ${
                            addVehicle
                                ? "Disable Add Vehicle"
                                : "Enable Add Vehicle"
                        }
                    </button>

                </td>

                <td>

                    <button
                        type="button"
                        class="staff-action-btn"
                        onclick="toggleStaff('${safeIdentifier}')"
                    >
                        ${
                            active
                                ? "Disable Staff"
                                : "Enable Staff"
                        }
                    </button>

                </td>

                <td>

                    <button
                        type="button"
                        class="staff-delete-btn"
                        onclick="deleteStaff('${safeIdentifier}')"
                    >
                        Delete
                    </button>

                </td>

            `;


            staffTableBody.appendChild(
                row
            );

        }
    );

}


// =====================================================
// FIND STAFF
// =====================================================

async function findStaff(identifier) {

    const response =
        await fetch(
            API_URL +
            "?action=getStaff&t=" +
            Date.now(),
            {
                method: "GET",
                cache: "no-store"
            }
        );


    const text =
        await response.text();


    if (!response.ok) {

        throw new Error(
            "HTTP error " +
            response.status
        );

    }


    if (!text.trim()) {

        throw new Error(
            "Empty response from Google Apps Script."
        );

    }


    let result;


    try {

        result =
            JSON.parse(text);

    }

    catch (error) {

        console.error(
            "INVALID STAFF JSON:",
            text
        );

        throw new Error(
            "Invalid response from Google Apps Script."
        );

    }


    if (result.success !== true) {

        throw new Error(
            result.message ||
            "Could not load staff."
        );

    }


    const staffList =
        result.staff ||
        result.data ||
        result.records ||
        [];


    const search =
        String(identifier)
            .trim()
            .toLowerCase();


    const staff =
        staffList.find(
            function (item) {

                const itemId =
                    getStaffIdentifier(
                        item
                    );


                return (
                    String(itemId)
                        .trim()
                        .toLowerCase() ===
                    search
                );

            }
        );


    if (!staff) {

        throw new Error(
            "Staff account not found."
        );

    }


    return staff;

}


// =====================================================
// ENABLE / DISABLE ADD VEHICLE
// =====================================================

async function toggleVehicleAccess(identifier) {

    try {

        const staff =
            await findStaff(
                identifier
            );


        const currentPermission =
            getAddVehiclePermission(
                staff
            );


        const newPermission =
            !currentPermission;


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "toggleVehicleAccess",

                            username:
                                identifier,

                            staffId:
                                identifier,

                            addVehicle:
                                newPermission,

                            enabled:
                                newPermission

                        })
                }
            );


        const text =
            await response.text();


        console.log(
            "TOGGLE VEHICLE RESPONSE:",
            text
        );


        if (!response.ok) {

            throw new Error(
                "HTTP error " +
                response.status
            );

        }


        if (!text.trim()) {

            throw new Error(
                "Empty response from Google Apps Script."
            );

        }


        const result =
            JSON.parse(text);


        if (result.success !== true) {

            throw new Error(
                result.message ||
                "Permission update failed."
            );

        }


        showMessage(
            newPermission
                ? "Add Vehicle permission enabled."
                : "Add Vehicle permission disabled.",
            "success"
        );


        await loadStaff();


    }

    catch (error) {

        console.error(
            "TOGGLE VEHICLE ERROR:",
            error
        );


        showMessage(
            "Error: " +
            error.message,
            "error"
        );

    }

}


// =====================================================
// ENABLE / DISABLE STAFF
// =====================================================

async function toggleStaff(identifier) {

    try {

        const staff =
            await findStaff(
                identifier
            );


        const currentStatus =
            getStaffActiveStatus(
                staff
            );


        const newStatus =
            !currentStatus;


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "toggleStaff",

                            username:
                                identifier,

                            staffId:
                                identifier,

                            active:
                                newStatus,

                            status:
                                newStatus
                                    ? "Active"
                                    : "Disabled"

                        })
                }
            );


        const text =
            await response.text();


        console.log(
            "TOGGLE STAFF RESPONSE:",
            text
        );


        if (!response.ok) {

            throw new Error(
                "HTTP error " +
                response.status
            );

        }


        if (!text.trim()) {

            throw new Error(
                "Empty response from Google Apps Script."
            );

        }


        const result =
            JSON.parse(text);


        if (result.success !== true) {

            throw new Error(
                result.message ||
                "Could not update staff."
            );

        }


        showMessage(
            newStatus
                ? "Staff account enabled."
                : "Staff account disabled.",
            "success"
        );


        await loadStaff();


    }

    catch (error) {

        console.error(
            "TOGGLE STAFF ERROR:",
            error
        );


        showMessage(
            "Error: " +
            error.message,
            "error"
        );

    }

}


// =====================================================
// DELETE STAFF
// =====================================================

async function deleteStaff(identifier) {

    const confirmed =
        confirm(
            "Are you sure you want to delete staff account '" +
            identifier +
            "'?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "deleteStaff",

                            username:
                                identifier,

                            staffId:
                                identifier

                        })
                }
            );


        const text =
            await response.text();


        console.log(
            "DELETE STAFF RESPONSE:",
            text
        );


        if (!response.ok) {

            throw new Error(
                "HTTP error " +
                response.status
            );

        }


        if (!text.trim()) {

            throw new Error(
                "Empty response from Google Apps Script."
            );

        }


        const result =
            JSON.parse(text);


        if (result.success !== true) {

            throw new Error(
                result.message ||
                "Could not delete staff."
            );

        }


        showMessage(
            "Staff account deleted successfully.",
            "success"
        );


        await loadStaff();


    }

    catch (error) {

        console.error(
            "DELETE STAFF ERROR:",
            error
        );


        showMessage(
            "Error: " +
            error.message,
            "error"
        );

    }

}


// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.toggleVehicleAccess =
    toggleVehicleAccess;

window.toggleStaff =
    toggleStaff;

window.deleteStaff =
    deleteStaff;


// =====================================================
// START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadStaff();

    }
);

