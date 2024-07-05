async function login(e) {
    e.preventDefault();

    const signUpButton = document.getElementById("register-container");
    const mainContainer = document.getElementById("login-container");
    const userInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const data = {
        email: document.getElementById("username").value,
        password: document.getElementById("password").value,
    };

    try {
        const res = await fetch("http://localhost:5001/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(res.status);
        const converted = await res.json();
        console.log(converted);
        sessionStorage.setItem("token", JSON.stringify(converted.token));
        sessionStorage.setItem(
            "myId",
            JSON.stringify(converted.id.replace(/"/, ""))
        );
        sessionStorage.setItem("myFirstName", JSON.stringify(converted.firstName));
        sessionStorage.setItem("myLastName", JSON.stringify(converted.lastName));
        sessionStorage.setItem("myEmail", JSON.stringify(converted.email));
        mainContainer.style.transform = "scale(55)";
        mainContainer.style.opacity = "0";
        signUpButton.style.opacity = "0";
        setTimeout(() => {
            location.replace("../chat/chat.html");
        }, 1600);
    } catch (err) {
        function clearAnimation() {
            mainContainer.style.removeProperty("animation");
        }

        mainContainer.style.animation = "jump-shaking 1.4s";
        userInput.style.border = "4px solid red";
        userInput.style.transition = "border-color 0.7s, border-width 0.7s";
        passwordInput.style.border = "4px solid red";
        passwordInput.style.transition = "border-color 0.7s, border-width 0.7s";
        setTimeout(clearAnimation, 2000);
    }
}

function loadLogIn() {
    const signUpButton = document.getElementById("register-container");
    const mainContainer = document.getElementById("login-container");
    mainContainer.style.transform = "scale(1)";
    mainContainer.style.opacity = "1";
    signUpButton.style.opacity = "1";
}

function loadRegisterPage() {
    const signUpButton = document.getElementById("register-container");
    const mainContainer = document.getElementById("login-container");
    mainContainer.style.transform = "scale(0.001)";
    mainContainer.style.opacity = "0";
    signUpButton.style.opacity = "0";

    setTimeout(() => {
        location.replace("../register/register.html");
    }, 1200);
}