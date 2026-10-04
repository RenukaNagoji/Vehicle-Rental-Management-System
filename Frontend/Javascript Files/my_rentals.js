const rentalContainer =
    document.getElementById("rentalContainer");

// Get logged-in user
const currentUser =
    JSON.parse(localStorage.getItem("user"));


// Check login
if (!currentUser) {

    alert("Please login to view your rentals.");

    window.location.href = "login.html";

} else {

    fetch(
        `http://localhost:3000/api/bookings/user/${currentUser.user_id}`
    )

    .then(response => response.json())

    .then(rentals => {

        rentalContainer.innerHTML = "";

        if (rentals.length === 0) {

            rentalContainer.innerHTML =
                "<p>You have no rentals yet.</p>";

            return;
        }


        rentals.forEach(rental => {

            const card =
                document.createElement("div");

            card.className = "rental-card";


            card.innerHTML = `

                <h2>${rental.vehicle_name}</h2>

                <p>
                    <strong>Type:</strong>
                    ${rental.vehicle_type}
                </p>

                <p>
                    <strong>Pickup Date:</strong>
                    ${rental.pickup_date}
                </p>

                <p>
                    <strong>Return Date:</strong>
                    ${rental.return_date}
                </p>

                <p>
                    <strong>Pickup Location:</strong>
                    ${rental.pickup_location}
                </p>

                <p>
                    <strong>Total Amount:</strong>
                    ₹${rental.total_amount}
                </p>

<span class="rental-status ${rental.booking_status.toLowerCase()}">
    ${rental.booking_status}
</span>

            `;

            rentalContainer.appendChild(card);

        });

    })

    .catch(error => {

        console.log("Error:", error);

        rentalContainer.innerHTML =
            "<p>Failed to load rentals.</p>";

    });

}