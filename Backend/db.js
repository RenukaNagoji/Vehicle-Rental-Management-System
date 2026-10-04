const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Renuka@1512",
    database: "driveease"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed!");
        console.log(err.message);
        return;
    }

    console.log("Connected to DriveEase MySQL database!");
});

module.exports = db;