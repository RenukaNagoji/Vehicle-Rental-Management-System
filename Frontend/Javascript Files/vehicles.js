const vehicleContainer =
    document.getElementById("vehicleContainer");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const typeFilter =
    document.getElementById("typeFilter");

let allVehicles = [];


// =========================================
// LOAD VEHICLES
// =========================================

fetch("http://localhost:3000/api/vehicles")
    .then(response => response.json())
    .then(vehicles => {

        allVehicles = vehicles;

        displayVehicles(allVehicles);

    })
    .catch(error => {

        console.log(
            "Error fetching vehicles:",
            error
        );

    });


// =========================================
// DISPLAY VEHICLES
// =========================================

function displayVehicles(vehicles) {

    vehicleContainer.innerHTML = "";

    if (vehicles.length === 0) {

        vehicleContainer.innerHTML =
            "<p>No vehicles found.</p>";

        return;
    }


    vehicles.forEach(vehicle => {

        let icon = "🚗";

        if (vehicle.vehicle_type === "Bike") {
            icon = "🏍️";
        }

        else if (vehicle.vehicle_type === "Scooter") {
            icon = "🛵";
        }

        else if (vehicle.vehicle_type === "SUV") {
            icon = "🚙";
        }


        const card =
            document.createElement("div");

        card.className = "vehicle-card";


        card.innerHTML = `

            <div class="vehicle-image">
                ${icon}
            </div>

            <div class="vehicle-info">

                <h3>
                    ${vehicle.vehicle_name}
                </h3>

                <p>
                    ${vehicle.vehicle_type}
                    |
                    ${vehicle.seats} Seater
                </p>

                <h4>
                    ₹${vehicle.price_per_day} / day
                </h4>

                <span class="available">
                    ${vehicle.status}
                </span>

                <br><br>

                <a
                    href="vehicle_details.html?id=${vehicle.vehicle_id}"
                    class="btn">
                    View Details
                </a>

            </div>
        `;


        vehicleContainer.appendChild(card);

    });

}


// =========================================
// SEARCH VEHICLES
// =========================================

function searchVehicles() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedType =
        typeFilter.value;

    const filteredVehicles =
        allVehicles.filter(vehicle => {

            const matchesSearch =
                vehicle.vehicle_name
                    .toLowerCase()
                    .includes(searchText)

                ||

                vehicle.vehicle_type
                    .toLowerCase()
                    .includes(searchText);


            const matchesType =
                selectedType === "All"
                ||
                vehicle.vehicle_type === selectedType;


            return matchesSearch && matchesType;

        });


    displayVehicles(filteredVehicles);
}


// =========================================
// SEARCH BUTTON
// =========================================

searchButton.addEventListener(
    "click",
    searchVehicles
);


// =========================================
// SEARCH WHILE TYPING
// =========================================

searchInput.addEventListener(
    "input",
    searchVehicles
);

typeFilter.addEventListener(
    "change",
    searchVehicles
);