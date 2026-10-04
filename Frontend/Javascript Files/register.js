const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const userData = {
        name: name,
        email: email,
        phone: phone,
        password: password
    };

    fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {

        if (data.user_id) {

            alert("Registration successful!");

            window.location.href = "login.html";

        } else {

            alert(data.error || "Registration failed.");

        }

    })
    .catch(error => {

        console.log("Error:", error);

        alert("Something went wrong.");

    });

});

function togglePassword(inputId, icon) {
    const passwordInput = document.getElementById(inputId);

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.textContent = "🙈";
    } else {
        passwordInput.type = "password";
        icon.textContent = "👁";
    }
}