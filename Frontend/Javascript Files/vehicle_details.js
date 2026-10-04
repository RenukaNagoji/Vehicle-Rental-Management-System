// =========================================
// GET VEHICLE ID FROM URL
// =========================================

const params =
    new URLSearchParams(window.location.search);

const vehicleId =
    params.get("id");


// =========================================
// CHECK VEHICLE ID
// =========================================

if (!vehicleId) {

    alert("Vehicle ID is missing.");

}
else {

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

        // Vehicle name
        document.getElementById(
            "vehicleName"
        ).textContent =
            vehicle.vehicle_name;


        // Vehicle type
        document.getElementById(
            "vehicleType"
        ).textContent =
            vehicle.vehicle_type;


        // Price
        document.getElementById(
            "vehiclePrice"
        ).textContent =
            "₹" +
            vehicle.price_per_day +
            " / day";


        // Fuel
        document.getElementById(
            "fuelType"
        ).textContent =
            vehicle.fuel_type;


        // Transmission
        document.getElementById(
            "transmission"
        ).textContent =
            vehicle.transmission;


        // Seats
        document.getElementById(
            "seats"
        ).textContent =
            vehicle.seats;


        // Status
        document.getElementById(
            "status"
        ).textContent =
            vehicle.status;


        // Rent button
        document.getElementById(
            "rentButton"
        ).href =
            `booking.html?id=${vehicleId}`;

    })

    .catch(error => {

        console.log(
            "Vehicle details error:",
            error
        );

        alert(
            "Unable to load vehicle details."
        );

    });

}