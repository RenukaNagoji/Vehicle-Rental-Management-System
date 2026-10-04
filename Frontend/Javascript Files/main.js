const loginLink = document.getElementById("loginLink");

const currentUser = JSON.parse(localStorage.getItem("user"));

if (currentUser) {

    loginLink.textContent = "Logout";

    loginLink.href = "#";

    loginLink.onclick = function() {

        localStorage.removeItem("user");

        alert("Logged out successfully!");

        window.location.href = "login.html";
    };
}