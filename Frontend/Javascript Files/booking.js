// =========================================
// GET VEHICLE ID
// =========================================

const params =
    new URLSearchParams(window.location.search);

const vehicleId =
    params.get("id");


// =========================================
// CHECK LOGIN
// =========================================

const currentUser =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!currentUser) {

    alert(
        "Please login before booking a vehicle."
    );

    window.location.href =
        "login.html";

}


// =========================================
// VARIABLES
// =========================================

let pricePerDay = 0;


// =========================================
// GET VEHICLE DETAILS
// =========================================

fetch(
    `http://localhost:3000/api/vehicles/${vehicleId}`
)

.then(response => {

    if (!response.ok) {
        throw new Error("Vehicle not found");
    }

    return response.json();

})

.then(vehicle => {

    console.log(
        "Vehicle:",
        vehicle
    );


    // Vehicle name
    document.getElementById(
        "vehicleName"
    ).textContent =
        vehicle.vehicle_name;


    // Vehicle type
    document.getElementById(
        "vehicleType"
    ).textContent =
        vehicle.vehicle_type +
        " | " +
        vehicle.seats +
        " Seater";


    // Price
    pricePerDay =
        Number(vehicle.price_per_day);


    document.getElementById(
        "vehiclePrice"
    ).textContent =
        "₹" +
        pricePerDay +
        " / day";


})

.catch(error => {

    console.log(
        "Vehicle loading error:",
        error
    );

    alert(
        "Unable to load vehicle details."
    );

});


// =========================================
// GET HTML ELEMENTS
// =========================================

const pickupDate =
    document.getElementById("pickup");

const returnDate =
    document.getElementById("return");

const daysElement =
    document.getElementById("days");

const totalElement =
    document.getElementById("total");


// =========================================
// SET TODAY AS MINIMUM DATE
// =========================================

const today =
    new Date();

const year =
    today.getFullYear();

const month =
    String(
        today.getMonth() + 1
    ).padStart(2, "0");

const day =
    String(
        today.getDate()
    ).padStart(2, "0");

const todayString =
    `${year}-${month}-${day}`;

pickupDate.min =
    todayString;

returnDate.min =
    todayString;


// =========================================
// PICKUP DATE
// =========================================

pickupDate.addEventListener(
    "change",
    function() {

        returnDate.min =
            pickupDate.value;

        calculateRental();

    }
);


// =========================================
// RETURN DATE
// =========================================

returnDate.addEventListener(
    "change",
    function() {

        calculateRental();

    }
);


// =========================================
// CALCULATE RENTAL
// =========================================

function calculateRental() {

    if (
        !pickupDate.value ||
        !returnDate.value
    ) {

        daysElement.textContent =
            "0";

        totalElement.textContent =
            "₹0";

        return;

    }


    const pickup =
        new Date(
            pickupDate.value +
            "T00:00:00"
        );


    const returnDateValue =
        new Date(
            returnDate.value +
            "T00:00:00"
        );


    const difference =
        returnDateValue.getTime() -
        pickup.getTime();


    const days =
        difference /
        (1000 * 60 * 60 * 24);


    if (days <= 0) {

        daysElement.textContent =
            "0";

        totalElement.textContent =
            "₹0";

        return;

    }


    const total =
        days * pricePerDay;


    daysElement.textContent =
        days;


    totalElement.textContent =
        "₹" + total;

}


// =========================================
// CONFIRM BOOKING
// =========================================

const confirmBooking =
    document.getElementById(
        "confirmBooking"
    );


confirmBooking.addEventListener(
    "click",
    function() {

        const pickup =
            pickupDate.value;

        const returnDateValue =
            returnDate.value;

        const location =
            document.getElementById(
                "location"
            ).value;


        const days =
            Number(
                daysElement.textContent
            );


        const total =
            days * pricePerDay;


        // Check login again
        const user =
            JSON.parse(
                localStorage.getItem("user")
            );


        if (!user) {

            alert(
                "Please login before booking."
            );

            window.location.href =
                "login.html";

            return;

        }


        // Check fields
        if (
            !pickup ||
            !returnDateValue ||
            !location
        ) {

            alert(
                "Please fill all the booking details."
            );

            return;

        }


        // Check dates
        if (
            returnDateValue <= pickup
        ) {

            alert(
                "Return date must be after pickup date."
            );

            return;

        }


        if (days <= 0) {

            alert(
                "Please select valid dates."
            );

            return;

        }


        // Booking data
        const bookingData = {

            user_id:
                user.user_id,

            vehicle_id:
                vehicleId,

            pickup_date:
                pickup,

            return_date:
                returnDateValue,

            pickup_location:
                location,

            total_amount:
                total

        };


        console.log(
            "Booking Data:",
            bookingData
        );


        // =========================================
        // SEND BOOKING TO BACKEND
        // =========================================

        fetch(
            "http://localhost:3000/api/bookings",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        bookingData
                    )

            }
        )

        .then(response =>
            response.json()
        )

        .then(data => {

            console.log(
                "Booking Response:",
                data
            );


            if (data.booking_id) {

                alert(
                    "Booking confirmed successfully!\n\n" +

                    "Booking ID: " +
                    data.booking_id +

                    "\nVehicle: " +
                    document.getElementById(
                        "vehicleName"
                    ).textContent +

                    "\nPickup Date: " +
                    pickup +

                    "\nReturn Date: " +
                    returnDateValue +

                    "\nTotal Amount: ₹" +
                    total
                );


                window.location.href =
                    "my_rentals.html";

            }

            else {

                alert(
                    data.error ||
                    "Booking failed."
                );

            }

        })

        .catch(error => {

            console.log(
                "Booking error:",
                error
            );

            alert(
                "Something went wrong."
            );

        });

    }
);