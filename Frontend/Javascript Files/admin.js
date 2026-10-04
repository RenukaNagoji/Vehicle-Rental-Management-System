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
// LOAD VEHICLES
// =========================================

const vehicleTableBody =
    document.getElementById("vehicleTableBody");

fetch(
    "http://localhost:3000/api/admin/vehicles",
    {
        headers: {
            "admin-email": loggedInAdmin.email
        }
    }
)
    .then(response => response.json())
    .then(vehicles => {

        vehicleTableBody.innerHTML = "";

        vehicles.forEach(vehicle => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${vehicle.vehicle_id}</td>

                <td>${vehicle.vehicle_name}</td>

                <td>${vehicle.vehicle_type}</td>

                <td>₹${vehicle.price_per_day}</td>

                <td>${vehicle.status}</td>

                <td>
                    <button
                        class="admin-btn"
                        onclick="editVehicle(${vehicle.vehicle_id})">
                        Edit
                    </button>

                    <button
                        class="admin-btn delete-btn"
                        onclick="deleteVehicle(${vehicle.vehicle_id})">
                        Delete
                    </button>
                </td>
            `;

            vehicleTableBody.appendChild(row);

        });

    })
    .catch(error => {
        console.log("Vehicle loading error:", error);
    });



// =========================================
// EDIT VEHICLE
// =========================================

function editVehicle(vehicleId) {

    window.location.href =
        "edit_vehicle.html?id=" + vehicleId;

}



// =========================================
// DELETE VEHICLE
// =========================================

function deleteVehicle(vehicleId) {

    const confirmDelete =
        confirm("Are you sure you want to remove this vehicle?");

    if (!confirmDelete) {
        return;
    }

    fetch(
        `http://localhost:3000/api/admin/vehicles/${vehicleId}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "admin-email": loggedInAdmin.email
            }
        }
    )
    .then(response => response.json())
    .then(data => {

        if (data.message) {

            alert(data.message);

            location.reload();

        } else {

            alert(data.error || "Delete failed.");

        }

    })
    .catch(error => {

        console.log("Delete error:", error);

    });

}



// =========================================
// ADMIN STATISTICS
// =========================================

fetch(
    "http://localhost:3000/api/admin/stats",
    {
        headers: {
            "admin-email": loggedInAdmin.email
        }
    }
)

    .then(response => response.json())

    .then(stats => {

        console.log("Statistics:", stats);

        document.getElementById("totalVehicles").textContent =
            stats.totalVehicles;

        document.getElementById("availableVehicles").textContent =
            stats.availableVehicles;

        document.getElementById("rentedVehicles").textContent =
            stats.rentedVehicles;

        document.getElementById("totalCustomers").textContent =
            stats.totalCustomers;

    })

    .catch(error => {

        console.log("Statistics error:", error);

    });



// =========================================
// LOAD CUSTOMER BOOKINGS
// =========================================

const bookingTableBody =
    document.getElementById("bookingTableBody");

fetch(
    "http://localhost:3000/api/admin/bookings",
    {
        headers: {
            "admin-email": loggedInAdmin.email
        }
    }
)

    .then(response => response.json())

    .then(bookings => {

        bookingTableBody.innerHTML = "";

        bookings.forEach(booking => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${booking.booking_id}</td>

                <td>${booking.customer_name}</td>

                <td>${booking.vehicle_name}</td>

                <td>${booking.pickup_date}</td>

                <td>${booking.return_date}</td>

                <td>${booking.pickup_location}</td>

                <td>₹${booking.total_amount}</td>

                <td>
                    <select
                        class="booking-status"
                        onchange="updateBookingStatus(
                            ${booking.booking_id},
                            this.value
                        )">

                        <option value="Active"
                            ${booking.booking_status === "Active"
                                ? "selected"
                                : ""}>
                            Active
                        </option>

                        <option value="Completed"
                            ${booking.booking_status === "Completed"
                                ? "selected"
                                : ""}>
                            Completed
                        </option>

                        <option value="Cancelled"
                            ${booking.booking_status === "Cancelled"
                                ? "selected"
                                : ""}>
                            Cancelled
                        </option>

                    </select>
                </td>
            `;

            bookingTableBody.appendChild(row);

        });

    })

    .catch(error => {

        console.log("Booking loading error:", error);

    });



// =========================================
// UPDATE BOOKING STATUS
// =========================================

function updateBookingStatus(bookingId, status) {

    fetch(
        `http://localhost:3000/api/admin/bookings/${bookingId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "admin-email": loggedInAdmin.email
            },

            body: JSON.stringify({
                booking_status: status
            })
        }
    )
    .then(response => response.json())
    .then(data => {

        if (data.message) {

            alert("Booking status updated successfully!");

        } else {

            alert(
                data.error ||
                "Failed to update status."
            );

        }

    })
    .catch(error => {

        console.log("Status update error:", error);

        alert("Something went wrong.");

    });

}



// =========================================
// LOAD PAYMENT DETAILS
// =========================================

const paymentTableBody =
    document.getElementById("paymentTableBody");

fetch(
    "http://localhost:3000/api/admin/payments",
    {
        headers: {
            "admin-email": loggedInAdmin.email
        }
    }
)

    .then(response => response.json())

    .then(payments => {

        paymentTableBody.innerHTML = "";

        payments.forEach(payment => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${payment.payment_id}</td>

                <td>${payment.booking_id}</td>

                <td>${payment.customer_name}</td>

                <td>${payment.vehicle_name}</td>

                <td>₹${payment.amount}</td>

                <td>${payment.payment_date}</td>

                <td>${payment.payment_status}</td>
            `;

            paymentTableBody.appendChild(row);

        });

    })

    .catch(error => {

        console.log("Payment loading error:", error);

    });

// =========================================
// LOAD CUSTOMER DETAILS
// =========================================

const customerTableBody =
    document.getElementById("customerTableBody");

fetch(
    "http://localhost:3000/api/admin/customers",
    {
        headers: {
            "admin-email": loggedInAdmin.email
        }
    }
)

    .then(response => response.json())

    .then(customers => {

        customerTableBody.innerHTML = "";

        customers.forEach(customer => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${customer.user_id}</td>

                <td>${customer.name}</td>

                <td>${customer.email}</td>

                <td>${customer.phone || "Not provided"}</td>
            `;

            customerTableBody.appendChild(row);

        });

    })

    .catch(error => {

        console.log(
            "Customer loading error:",
            error
        );

    });

// =========================================
// LOGOUT
// =========================================

function logout() {

    localStorage.removeItem("user");

    alert("Logged out successfully!");

    window.location.href = "login.html";
}

// =========================================
// ADMIN LOGOUT
// =========================================

function adminLogout() {

    localStorage.removeItem("admin");

    window.location.href = "admin_login.html";
}