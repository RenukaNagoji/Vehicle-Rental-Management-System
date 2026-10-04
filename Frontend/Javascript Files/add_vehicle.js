// =========================================
// ADMIN LOGIN CHECK
// =========================================

const loggedInAdmin =
    JSON.parse(localStorage.getItem("admin"));

if (!loggedInAdmin) {

    alert("Please login as admin first.");

    window.location.href = "admin_login.html";

}


// =========================================
// ADD VEHICLE
// =========================================

const addVehicleForm =
    document.getElementById("addVehicleForm");


addVehicleForm.addEventListener(
    "submit",
    function(event) {

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
                document.getElementById("seats").value

        };


        fetch(
            "http://localhost:3000/api/admin/vehicles",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "admin-email": loggedInAdmin.email
                },

                body:
                    JSON.stringify(vehicleData)
            }
        )

        .then(response => response.json())

        .then(data => {

            if (data.vehicle_id) {

                alert(
                    "Vehicle added successfully!"
                );

                window.location.href =
                    "admin.html";

            }

            else {

                alert(
                    data.error ||
                    "Failed to add vehicle."
                );

            }

        })

        .catch(error => {

            console.log(
                "Error:",
                error
            );

            alert(
                "Something went wrong."
            );

        });

    }
);