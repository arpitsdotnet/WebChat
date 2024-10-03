// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
"use strict";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chathub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

const startChat = async () => {
    try {
        await connection.start();
        console.log("SignalR Connected.");
    } catch (err) {
        console.log(err);
        setTimeout(startChat, 5000);
    }
}

const joinChatUser = async () => {
    const name = window.prompt('Enter your name: ');

    if (name) {
        sessionStorage.setItem('chatUser', name);
        await joinChat(name);
    }
}

const joinChat = async (user) => {
    if (!user)
        return;

    const message = `${user} has joined.`;
    await connection.invoke("JoinChat", user, message, new Date())
        .then(() => {
            console.log("User joined the chat.");
        })
        .catch(error =>
            console.log(error));

    //try {
    //    await connection.invoke("JoinChat", user, message);
    //} catch (err) {
    //    console.log(err);
    //}
}

const getChatUser = () => sessionStorage.getItem('chatUser');


const leftChatCard = (name, sentAt, message) => {
    var nameWithPlus = name.replace(' ', '+');
    return `<li class="d-flex justify-content-between mb-4">
                <img src="https://ui-avatars.com/api/?name=${nameWithPlus}&background=random&rounded=true" alt="avatar"
                        class="rounded-circle d-flex align-self-start me-3 shadow-1-strong" width="60">
                <div class="card">
                    <div class="card-header d-flex justify-content-between p-3">
                        <p class="fw-bold mb-0">${name}</p>
                        <p class="text-muted small mb-0"><i class="far fa-clock"></i> ${sentAt}</p>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">${message}</p>
                    </div>
                </div>
            </li>`
};

const rightChatCard = (name, sentAt, message) => {
    var nameWithPlus = name.replace(' ', '+');
    return `<li class="d-flex justify-content-between mb-4">
                <div class="card w-100">
                    <div class="card-header d-flex justify-content-between p-3">
                        <p class="fw-bold mb-0">${name}</p>
                        <p class="text-muted small mb-0"><i class="far fa-clock"></i> ${sentAt}</p>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">${message}</p>
                    </div>
                </div>
                <img src="https://ui-avatars.com/api/?name=${nameWithPlus}&background=random&rounded=true" alt="avatar"
                        class="rounded-circle d-flex align-self-start ms-3 shadow-1-strong" width="60">
            </li>`
};

const receiveChatMessage = async () => {
    try {
        await connection.on("ReceiveChatMessage", (user, message, sentAt) => {
            const list = document.getElementById("idChatMessageList");

            const date = new Date(sentAt);
            var readableDate = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })

            var card = "";
            if (user == getChatUser()) {
                card = rightChatCard(user, readableDate, message);
            }
            else {
                card = leftChatCard(user, readableDate, message);
            }

            list.innerHTML += card;
            console.log(message);
        });
    } catch (error) {
        console.log(error)
    }
}

const sendChatMessage = async (message) => {
    try {
        const user = getChatUser();
        if (!user)
            return;

        await connection.invoke("SendMessage", user, message, new Date());
    } catch (error) {
        console.error(err);
    }
}


const startChatApp = async () => {
    await startChat();
    await joinChatUser();
    await receiveChatMessage();
}

connection.onclose(async () => {
    await startChat();
});

// Start the connection.
startChatApp();

$(function () {

    document.getElementById("btnChatSend").addEventListener("click", (e) => {
        e.preventDefault();

        const txtMessage = document.getElementById("txtChatMessage");
        const message = txtMessage.value;
        if (!message)
            return;

        txtMessage.value = "";
        sendChatMessage(message);

    });
});