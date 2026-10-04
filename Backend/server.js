const db = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// =========================================
// ADMIN ACCESS CHECK
// =========================================

function adminAccess(req, res, next) {

    const adminEmail =
        req.headers["admin-email"];

    if (!adminEmail) {

        return res.status(401).json({
            error: "Admin login required"
        });

    }

    const sql = `
        SELECT admin_id
        FROM admins
        WHERE email = ?
    `;

    db.query(
        sql,
        [adminEmail],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    error: "Admin verification failed"
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    error: "Invalid admin"
                });

            }

            next();
        }
    );
}


app.get("/", (req, res) => {
    res.send("DriveEase Backend is running!");
});

app.get("/api/vehicles", (req, res) => {
    const sql = "SELECT * FROM vehicles WHERE status = 'Available' ";

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                error: "Failed to fetch vehicles"
            });
        }

        res.json(results);
    });
});

app.get("/api/admin/stats",adminAccess, (req, res) => {

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM vehicles) AS totalVehicles,

            (SELECT COUNT(*)
             FROM vehicles
             WHERE status = 'Available') AS availableVehicles,

            (SELECT COUNT(*)
             FROM vehicles
             WHERE status = 'Rented') AS rentedVehicles,

            (SELECT COUNT(*) FROM users) AS totalCustomers
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: "Failed to fetch statistics"
            });
        }

        res.json(results[0]);
    });
});

app.get("/api/admin/bookings",adminAccess, (req, res) => {

    const sql = `
        SELECT
            bookings.booking_id,
            users.name AS customer_name,
            vehicles.vehicle_name,
            bookings.pickup_date,
            bookings.return_date,
            bookings.pickup_location,
            bookings.total_amount,
            bookings.booking_status
        FROM bookings
        JOIN users
            ON bookings.user_id = users.user_id
        JOIN vehicles
            ON bookings.vehicle_id = vehicles.vehicle_id
        ORDER BY bookings.booking_id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: "Failed to fetch bookings"
            });
        }

        res.json(results);
    });
});

// ===============================
// UPDATE BOOKING STATUS
// ===============================

// =========================================
// UPDATE BOOKING STATUS
// =========================================

app.put("/api/admin/bookings/:id",adminAccess, (req, res) => {

    const bookingId = req.params.id;
    const { booking_status } = req.body;


    // 1. Get the vehicle connected to this booking
    const getBookingSql = `
        SELECT vehicle_id
        FROM bookings
        WHERE booking_id = ?
    `;

    db.query(
        getBookingSql,
        [bookingId],
        (err, results) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: "Failed to find booking"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    error: "Booking not found"
                });
            }


            const vehicleId = results[0].vehicle_id;


            // 2. Update booking status
            const updateBookingSql = `
                UPDATE bookings
                SET booking_status = ?
                WHERE booking_id = ?
            `;

            db.query(
                updateBookingSql,
                [booking_status, bookingId],
                (updateErr) => {

                    if (updateErr) {
                        console.log(updateErr);

                        return res.status(500).json({
                            error: "Failed to update booking status"
                        });
                    }


                    // 3. Update vehicle status
                    let vehicleStatus = "Rented";

                    if (
                        booking_status === "Completed" ||
                        booking_status === "Cancelled"
                    ) {
                        vehicleStatus = "Available";
                    }


                    const vehicleSql = `
                        UPDATE vehicles
                        SET status = ?
                        WHERE vehicle_id = ?
                    `;

                    db.query(
                        vehicleSql,
                        [vehicleStatus, vehicleId],
                        (vehicleErr) => {

                            if (vehicleErr) {
                                console.log(vehicleErr);

                                return res.status(500).json({
                                    error: "Booking updated but vehicle status failed"
                                });
                            }


                            res.json({
                                message:
                                    "Booking and vehicle status updated successfully"
                            });

                        }
                    );

                }
            );

        }
    );

});

app.get("/api/vehicles/:id", (req, res) => {

    const vehicleId = req.params.id;

    const sql = "SELECT * FROM vehicles WHERE vehicle_id = ?";

    db.query(sql, [vehicleId], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: "Failed to fetch vehicle"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: "Vehicle not found"
            });
        }

        res.json(results[0]);
    });
});

// =========================================
// CREATE BOOKING
// =========================================

app.post("/api/bookings", (req, res) => {

    const {
        user_id,
        vehicle_id,
        pickup_date,
        return_date,
        pickup_location,
        total_amount
    } = req.body;

    if (return_date <= pickup_date) {
        return res.status(400).json({
           error: "Return date must be after pickup date"
        });
    }

    // Check whether vehicle is available
const checkVehicleSql = `
    SELECT status
    FROM vehicles
    WHERE vehicle_id = ?
`;

db.query(
    checkVehicleSql,
    [vehicle_id],
    (vehicleErr, vehicleResults) => {

        if (vehicleErr) {
            console.log(vehicleErr);

            return res.status(500).json({
                error: "Failed to check vehicle availability"
            });
        }

        if (vehicleResults.length === 0) {
            return res.status(404).json({
                error: "Vehicle not found"
            });
        }

        if (vehicleResults[0].status !== "Available") {
            return res.status(400).json({
                error: "This vehicle is currently unavailable"
            });
        }

        // Continue with your existing booking code here
    }
);


    // 1. Create booking
    const bookingSql = `
        INSERT INTO bookings
        (
            user_id,
            vehicle_id,
            pickup_date,
            return_date,
            pickup_location,
            total_amount
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        bookingSql,
        [
            user_id,
            vehicle_id,
            pickup_date,
            return_date,
            pickup_location,
            total_amount
        ],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: "Failed to create booking"
                });
            }


            const bookingId = result.insertId;


            // 2. Mark vehicle as Rented
            const vehicleSql = `
                UPDATE vehicles
                SET status = 'Rented'
                WHERE vehicle_id = ?
            `;

            db.query(
                vehicleSql,
                [vehicle_id],
                (vehicleErr) => {

                    if (vehicleErr) {
                        console.log(vehicleErr);

                        return res.status(500).json({
                            error: "Booking created but vehicle status update failed"
                        });
                    }


                    // 3. Create payment record
                    const paymentSql = `
                        INSERT INTO payments
                        (
                            booking_id,
                            amount,
                            payment_date,
                            payment_status
                        )
                        VALUES (?, ?, CURDATE(), ?)
                    `;

                    db.query(
                        paymentSql,
                        [
                            bookingId,
                            total_amount,
                            "Paid"
                        ],
                        (paymentErr, paymentResult) => {

                            if (paymentErr) {
                                console.log(paymentErr);

                                return res.status(500).json({
                                    error: "Booking and vehicle update completed but payment failed"
                                });
                            }


                            // 4. Send response
                            res.json({

                                message:
                                    "Booking, payment and vehicle status updated successfully",

                                booking_id:
                                    bookingId,

                                payment_id:
                                    paymentResult.insertId

                            });

                        }
                    );

                }
            );

        }
    );

});

app.get("/api/bookings/user/:userId", (req, res) => {

    const userId = req.params.userId;

    const sql = `
        SELECT 
            bookings.booking_id,
            bookings.pickup_date,
            bookings.return_date,
            bookings.pickup_location,
            bookings.total_amount,
            bookings.booking_status,
            vehicles.vehicle_name,
            vehicles.vehicle_type
        FROM bookings
        JOIN vehicles
        ON bookings.vehicle_id = vehicles.vehicle_id
        WHERE bookings.user_id = ?
        ORDER BY bookings.booking_id DESC
    `;

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: "Failed to fetch rentals"
            });
        }

        res.json(results);
    });
});


app.post("/api/register", (req, res) => {

    const { name, email, phone, password } = req.body;

    const sql = `
        INSERT INTO users (name, email, phone, password)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, phone, password],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: "Registration failed"
                });
            }

            res.json({
                message: "Registration successful",
                user_id: result.insertId
            });
        }
    );
});
app.get("/api/admin/vehicles", (req, res) => {

    const sql = "SELECT * FROM vehicles ORDER BY vehicle_id DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: "Failed to fetch vehicles"
            });
        }

        res.json(results);
    });
});

app.post("/api/admin/vehicles",adminAccess, (req, res) => {

    const {
        vehicle_name,
        vehicle_type,
        price_per_day,
        fuel_type,
        transmission,
        seats
    } = req.body;

    const sql = `
        INSERT INTO vehicles
        (vehicle_name, vehicle_type, price_per_day,
         fuel_type, transmission, seats)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            vehicle_name,
            vehicle_type,
            price_per_day,
            fuel_type,
            transmission,
            seats
        ],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: "Failed to add vehicle"
                });
            }

            res.json({
                message: "Vehicle added successfully",
                vehicle_id: result.insertId
            });
        }
    );
});

app.put("/api/admin/vehicles/:id", (req, res) => {

    const vehicleId = req.params.id;

    const {
        vehicle_name,
        vehicle_type,
        price_per_day,
        fuel_type,
        transmission,
        seats,
        status
    } = req.body;

    const sql = `
        UPDATE vehicles
        SET
            vehicle_name = ?,
            vehicle_type = ?,
            price_per_day = ?,
            fuel_type = ?,
            transmission = ?,
            seats = ?,
            status = ?
        WHERE vehicle_id = ?
    `;

    db.query(
        sql,
        [
            vehicle_name,
            vehicle_type,
            price_per_day,
            fuel_type,
            transmission,
            seats,
            status,
            vehicleId
        ],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: "Failed to update vehicle"
                });
            }

            res.json({
                message: "Vehicle updated successfully"
            });
        }
    );
});

app.delete("/api/admin/vehicles/:id",adminAccess, (req, res) => {

    const vehicleId = req.params.id;

    const sql = `
        UPDATE vehicles
        SET status = 'Unavailable'
        WHERE vehicle_id = ?
    `;

    db.query(sql, [vehicleId], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: "Failed to remove vehicle"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Vehicle not found"
            });
        }

        res.json({
            message: "Vehicle marked as unavailable"
        });
    });
});


app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    const sql = `
        SELECT user_id, name, email
        FROM users
        WHERE email = ? AND password = ?
    `;

    db.query(sql, [email, password], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: "Login failed"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user: results[0]
        });
    });
});

// =========================================
// ADMIN LOGIN
// =========================================

app.post("/api/admin/login", (req, res) => {

    const { email, password } = req.body;

    const sql = `
        SELECT admin_id, name, email
        FROM admins
        WHERE email = ? AND password = ?
    `;

    db.query(
        sql,
        [email, password],
        (err, results) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    error: "Admin login failed"
                });
            }

            if (results.length === 0) {

                return res.status(401).json({
                    error: "Invalid admin email or password"
                });

            }

            res.json({
                message: "Admin login successful",
                admin: results[0]
            });

        }
    );

});

// ===============================
// ADMIN PAYMENT DETAILS
// ===============================

app.get("/api/admin/payments",adminAccess, (req, res) => {

    const sql = `
        SELECT
            payments.payment_id,
            payments.booking_id,
            users.name AS customer_name,
            vehicles.vehicle_name,
            payments.amount,
            payments.payment_date,
            payments.payment_status
        FROM payments

        JOIN bookings
            ON payments.booking_id = bookings.booking_id

        JOIN users
            ON bookings.user_id = users.user_id

        JOIN vehicles
            ON bookings.vehicle_id = vehicles.vehicle_id

        ORDER BY payments.payment_id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: "Failed to fetch payments"
            });
        }

        res.json(results);

    });

});

// ===============================
// ADMIN CUSTOMER DETAILS
// ===============================

app.get("/api/admin/customers",adminAccess, (req, res) => {

    const sql = `
        SELECT
            user_id,
            name,
            email,
            phone
        FROM users
        ORDER BY user_id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: "Failed to fetch customers"
            });
        }

        res.json(results);

    });

});

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`DriveEase server running on port ${PORT}`);
});

