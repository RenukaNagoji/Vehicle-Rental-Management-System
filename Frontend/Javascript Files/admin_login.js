const adminLoginForm =
    document.getElementById("adminLoginForm");


adminLoginForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const email =
            document.getElementById("adminEmail").value;

        const password =
            document.getElementById("adminPassword").value;


        const adminData = {

            email: email,

            password: password

        };


        fetch(
            "http://localhost:3000/api/admin/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body:
                    JSON.stringify(adminData)
            }
        )

        .then(response => response.json())

        .then(data => {

            if (data.admin) {

                localStorage.setItem(
                    "admin",
                    JSON.stringify(data.admin)
                );


                alert(
                    "Admin login successful!"
                );


                window.location.href =
                    "admin.html";

            }

            else {

                alert(
                    data.error ||
                    "Admin login failed."
                );

            }

        })

        .catch(error => {

            console.log(
                "Admin login error:",
                error
            );

            alert(
                "Something went wrong."
            );

        });

    }
);


// =========================================
// SHOW / HIDE PASSWORD
// =========================================

function toggleAdminPassword() {

    const passwordInput =
        document.getElementById(
            "adminPassword"
        );

    const icon =
        document.querySelector(
            ".toggle-password"
        );


    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        icon.textContent = "🙈";

    }

    else {

        passwordInput.type = "password";

        icon.textContent = "👁";

    }

}