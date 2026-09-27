/* =====================================================
   A1 CAR DETAILING FACTORY
   LOGIN SYSTEM
   ===================================================== */


/* =====================================================
   LOGIN ACCOUNTS
   ===================================================== */

const USERS = [

    {
        username: "owner",
        password: "Owner@123",
        role: "owner"
    },

    {
        username: "staff",
        password: "Staff@123",
        role: "staff"
    }

];


/* =====================================================
   ELEMENTS
   ===================================================== */

const loginForm = document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const rememberMe =
    document.getElementById("rememberMe");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const togglePassword =
    document.getElementById("togglePassword");


/* =====================================================
   PAGE LOAD
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const loggedIn =
        sessionStorage.getItem("a1LoggedIn");

    const remembered =
        localStorage.getItem("a1RememberMe");

    const sessionRole =
        sessionStorage.getItem("a1UserRole");

    const savedRole =
        localStorage.getItem("a1UserRole");

    const role =
        sessionRole || savedRole;


    /*
       If already logged in,
       redirect to the correct page.
    */

    if (loggedIn === "true" || remembered === "true") {

        if (role === "owner") {

            window.location.replace(
                "./owner-dashboard.html"
            );

            return;
        }


        if (role === "staff") {

            window.location.replace(
                "./add-vehicle.html"
            );

            return;
        }

    }

});


/* =====================================================
   SHOW / HIDE PASSWORD
   ===================================================== */

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function () {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";

                togglePassword.textContent = "Hide";

            } else {

                passwordInput.type = "password";

                togglePassword.textContent = "Show";

            }

        }
    );

}


/* =====================================================
   LOGIN FORM
   ===================================================== */

loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        /* ---------------------------------------------
           GET VALUES
           --------------------------------------------- */

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        /* ---------------------------------------------
           CLEAR MESSAGE
           --------------------------------------------- */

        loginMessage.textContent = "";

        loginMessage.className =
            "login-message";


        /* ---------------------------------------------
           EMPTY FIELD CHECK
           --------------------------------------------- */

        if (!username || !password) {

            showError(
                "Please enter username and password."
            );

            return;
        }


        /* ---------------------------------------------
           DISABLE BUTTON
           --------------------------------------------- */

        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";


        /* ---------------------------------------------
           FIND USER
           --------------------------------------------- */

        const user = USERS.find(
            function (account) {

                return (
                    account.username === username &&
                    account.password === password
                );

            }
        );


        /* ---------------------------------------------
           LOGIN DELAY
           --------------------------------------------- */

        setTimeout(
            function () {


                /* -------------------------------------
                   INVALID LOGIN
                   ------------------------------------- */

                if (!user) {

                    showError(
                        "Invalid username or password."
                    );

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";

                    return;
                }


                /* -------------------------------------
                   SAVE SESSION
                   ------------------------------------- */

                sessionStorage.setItem(
                    "a1LoggedIn",
                    "true"
                );

                sessionStorage.setItem(
                    "a1UserRole",
                    user.role
                );

                sessionStorage.setItem(
                    "a1Username",
                    user.username
                );


                /* -------------------------------------
                   REMEMBER ME
                   ------------------------------------- */

                if (
                    rememberMe &&
                    rememberMe.checked
                ) {

                    localStorage.setItem(
                        "a1RememberMe",
                        "true"
                    );

                    localStorage.setItem(
                        "a1UserRole",
                        user.role
                    );

                    localStorage.setItem(
                        "a1Username",
                        user.username
                    );

                } else {

                    localStorage.removeItem(
                        "a1RememberMe"
                    );

                    localStorage.removeItem(
                        "a1UserRole"
                    );

                    localStorage.removeItem(
                        "a1Username"
                    );

                }


                /* -------------------------------------
                   SUCCESS MESSAGE
                   ------------------------------------- */

                loginMessage.textContent =
                    "Login successful. Opening dashboard...";

                loginMessage.className =
                    "login-message success";


                /* -------------------------------------
                   REDIRECT
                   ------------------------------------- */

                setTimeout(
                    function () {

                        if (user.role === "owner") {

                            window.location.replace(
                                "./owner-dashboard.html"
                            );

                        } else if (
                            user.role === "staff"
                        ) {

                            window.location.replace(
                                "./add-vehicle.html"
                            );

                        }

                    },
                    500
                );

            },
            500
        );

    }
);


/* =====================================================
   ERROR MESSAGE
   ===================================================== */

function showError(message) {

    loginMessage.textContent = message;

    loginMessage.className =
        "login-message error";

}