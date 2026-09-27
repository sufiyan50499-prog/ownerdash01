
// =====================================================
// A1 CAR DETAILING FACTORY
// GOOGLE SHEETS API
// =====================================================

// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE

const API_URL =
    "https://script.google.com/macros/s/AKfycbwoKohiflL0GrN8fqjZyzo-z16EA3m4Q8hqWavbc8oH1iL7W3rOQ6K1M-WLH6UiUFU8/exec";


// =====================================================
// API REQUEST
// =====================================================

async function apiRequest(data) {

    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },

                body: JSON.stringify(data)

            });


        const result =
            await response.json();


        return result;


    } catch (error) {

        console.error(
            "API ERROR:",
            error
        );


        return {

            success: false,

            message:
                "Cannot connect to Google Sheets backend."

        };

    }

}

