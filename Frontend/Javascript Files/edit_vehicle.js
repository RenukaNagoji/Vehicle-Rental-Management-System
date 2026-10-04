// =========================================
// ADMIN LOGIN CHECK
// =========================================

const loggedInAdmin =
    JSON.parse(localStorage.getItem("admin"));

if (!loggedInAdmin) {

    alert("Please login as admin first.");

    window.location.href =
        "admin_login.html";

}

const params =
    new URLSearchParams(window.location.search);

const vehicleId = params.get("id");


// Get vehicle details
fetch(`http://localhost:3000/api/vehicles/${vehicleId}`)

    .then(response => response.json())

    .then(vehicle => {

        document.getElementById("vehicleName").value =
            vehicle.vehicle_name;

        document.getElementById("vehicleType").value =
            vehicle.vehicle_type;

        document.getElementById("price").value =
            vehicle.price_per_day;

        document.getElementById("fuel").value =
            vehicle.fuel_type;

        document.getElementById("transmission").value =
            vehicle.transmission;

        document.getElementById("seats").value =
            vehicle.seats;

        document.getElementById("status").value =
            vehicle.status;

    })

    .catch(error => {
        console.log("Error loading vehicle:", error);
    });


// Update vehicle
const editForm =
    document.getElementById("editVehicleForm");


editForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const vehicleData = {

        vehicle_name:
            document.getElementById("vehicleName").value,

        vehicle_type:
            document.getElementById("vehicleType").value,

        price_per_day:
            document.getElementById("price").value,

        fuel_type:
            document.getElementById("fuel").value,

        transmission:
            document.getElementById("transmission").value,

        seats:
            document.getElementById("seats").value,

        status:
            document.getElementById("status").value
    };


    fetch(
        `http://localhost:3000/api/admin/vehicles/${vehicleId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "admin-email": loggedInAdmin.email
            },

            body: JSON.stringify(vehicleData)
        }
    )

    .then(response => response.json())

    .then(data => {

        if (data.message) {

            alert("Vehicle updated successfully!");

            window.location.href = "admin.html";

        } else {

            alert(data.error || "Update failed.");

        }

    })

    .catch(error => {

        console.log("Error:", error);

        alert("Something went wrong.");

    });

});