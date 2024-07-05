const socket = io("http://localhost:5001");

socket.on("sending-message", (data) => {
    if (data.email === sessionStorage.getItem("myEmail").replace(/"/g, "")) {
        getMessages();
    }
});

async function getMessages() {
    var chatBox = document.getElementById("chatBox");

    const data = {
        myId: sessionStorage.getItem("myId").replace(/"/g, ""),
        email: sessionStorage.getItem("Send To"),
        token: sessionStorage.getItem("token").replace(/"/g, ""),
    };

    try {
        const res = await fetch(`http://localhost:5001/getMessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        chatBox.innerHTML = "";
        if (!res.ok) {
            throw new Error(res.status);
        } else {
            var { messages } = await res.json();
            for (var i = messages.length - 1; i >= 0; i--) {
                let sending =
                    messages[i].sender.firstName ===
                    sessionStorage.myFirstName.replace(/"/g, "") ?
                    "sender" :
                    "receiver";
                if (messages[i].message === "") continue;
                var msg = document.createElement("li");
                msg.setAttribute("class", "message");
                let date = new Date(messages[i].createdAt);
                let dateOutput = date.toLocaleString("he-IL", {
                    timeZone: "Asia/Jerusalem",
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                });
                msg.innerHTML = `<span class= "${sending}">${messages[i].sender.firstName} 
                    </span> <span class = "timestamp"> ${dateOutput} </span>
                    <div class = "message-content" > ${messages[i].message} </div>`;
                chatBox.appendChild(msg);
            }
            // const paginationScript = document.getElementById("pagination-script");
            // paginationScript.setAttribute("src", "./pagination.js");
        }
    } catch (err) {
        console.log(err);
    }
}

async function sendMessage() {
    if (!(sessionStorage.getItem("Send To") === "null")) {
        const data = {
            myId: sessionStorage.getItem("myId").replace(/"/g, ""),
            email: sessionStorage.getItem("Send To"),
            message: document.getElementById("messageInput").value,
        };
        try {
            const res = await fetch(`http://localhost:5001/sendMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(res.status);
            socket.emit("sending-message", data);
            getMessages();
        } catch (err) {
            console.log(err);
        }
        document.getElementById("messageInput").value = "";
        checkInput("messageInput", "send-button");
        handleActiveContact();
    } else {
        alert("You must select a recipient to send a message!");
    }
}

function handleActiveContact() {
    let activeContact = sessionStorage.getItem("active-contact");
    document.querySelectorAll("button.list-group-item").forEach((button) => {
        button.classList.remove("active");
        const activateContact = Number(button.getAttribute("contact-index"));
        if (activeContact == activateContact) {
            button.classList.add("active");
        }
    });
}

async function getRecipientsList() {
    const url = `http://localhost:5001/contacts`;
    const data = { id: sessionStorage.getItem("myId").replace(/"/g, "") };
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        const recipientsList = await res.json();
        sessionStorage.setItem("Send To", null);
        sessionStorage.setItem("active-contact", "");
        var list = document.getElementById("users-list");

        for (var i = 0; i < recipientsList.length; i++) {
            let fullName = `${recipientsList[i].firstName} ${recipientsList[i].lastName}`;
            sessionStorage.setItem(fullName, recipientsList[i].email);
            sessionStorage.setItem(recipientsList[i].email, fullName);

            var item = document.createElement("button");
            item.setAttribute("type", "button");
            item.setAttribute("contact-index", i + 1);
            item.setAttribute("id", "list-group-member");
            item.setAttribute("class", "list-group-item list-group-item-action btn");
            const contact = recipientsList[i];

            item.addEventListener("click", () => {
                if (sessionStorage.getItem("Send To") === `${contact.email}`) {
                    sessionStorage.setItem("Send To", null);
                } else {
                    sessionStorage.setItem("Send To", `${contact.email}`);
                }
            });

            item.innerHTML = `<b>${fullName}</b>`;
            list.appendChild(item);
        }
        document.querySelectorAll("button.list-group-item").forEach((button) => {
            const activeContactInex = button.getAttribute("contact-index");
            if (activeContactInex) {
                button.addEventListener("click", () => {
                    if (activeContactInex === sessionStorage.getItem("active-contact")) {
                        sessionStorage.setItem("active-contact", "");
                    } else {
                        sessionStorage.setItem("active-contact", activeContactInex);
                        getMessages();
                    }
                    handleActiveContact();
                });
            }
        });
        if (!res.ok) throw new Error(res.status);
    } catch (err) {
        console.log(err);
    }
}

function checkInput(id, button) {
    let sendButton = document.getElementById(button);
    if (document.getElementById(id).value === "") {
        sendButton.disabled = true;
    } else {
        sendButton.disabled = false;
    }
}

async function addRequest() {
    const data = {
        email: document.getElementById("email-input").value,
        myId: sessionStorage.getItem("myId").replace(/"/g, ""),
    };
    console.log(data);
    try {
        const res = await fetch(`http://localhost:5001/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(res.status);
        console.log(res, "Success");
    } catch (err) {
        console.log(err);
    }
}

function zoomInView() {
    const view = document.getElementById("container");
    view.style.opacity = "1";
    view.style.transform = "scale(1)";
}

function logout() {
    const view = document.getElementById("container");
    view.style.opacity = "0";
    view.style.transform = "scale(0.05)";
    console.log(location.pathname);
    sessionStorage.clear();
    setTimeout(() => {
        location.replace("../login/login.html");
    }, 1500);
}