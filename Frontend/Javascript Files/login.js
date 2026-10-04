const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const loginData = {
        email: email,
        password: password
    };

    fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {

        if (data.user) {

            // Store logged-in user's information
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            alert("Login successful!");

            window.location.href = "index.html";

        } else {

            alert(data.error || "Login failed.");

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