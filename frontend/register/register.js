async function register(e) {
    e.preventDefault();

    const mainContainer = document.getElementById("register-container");
    const firstName = document.getElementById("first-name");
    const lastName = document.getElementById("last-name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    const data = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
    };

    try {
        const res = await fetch("http://localhost:5001/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            console.log(res);
            throw new Error(res.status);
        }
        mainContainer.style.transform = "scale(55)";
        mainContainer.style.opacity = "0";
        const nextPage = () => {
            location.replace("../login/login.html");
        };
        setTimeout(nextPage, 1600);
    } catch (err) {
        console.log(err);

        function clearAnimation() {
            mainContainer.style.removeProperty("animation");
        }

        mainContainer.style.animation = "horizontal-shaking 1.5s";
        // firstName.style.border = "1.5px solid red";
        // firstName.style.transition = "border-color 0.7s, border-width 0.7s";
        // lastName.style.border = "1.5px solid red";
        // lastName.style.transition = "border-color 0.7s, border-width 0.7s";
        // email.style.border = "1.5px solid red";
        // email.style.transition = "border-color 0.7s, border-width 0.7s";
        // password.style.border = "1.5px solid red";
        // password.style.transition = "border-color 0.7s, border-width 0.7s";
        setTimeout(clearAnimation, 2000);
    }
}

function loadRegister() {
    const signInButton = document.getElementById("login-container")
    const mainContainer = document.getElementById("register-container");
    mainContainer.style.transform = "scale(1)";
    mainContainer.style.opacity = "1";
    signInButton.style.opacity = "1";
}

function loadLoginPage() {
    const signInButton = document.getElementById("login-container")
    const mainContainer = document.getElementById("register-container");
    mainContainer.style.transform = "scale(50)";
    mainContainer.style.opacity = "0";
    signInButton.style.opacity = "0";


    setTimeout(() => {
        location.replace("../login/login.html");
    }, 1200);
}