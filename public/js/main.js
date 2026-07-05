const socket = io();

const alertsList = document.getElementById('alerts');

socket.on('sos-notification', (data) => {

    const li = document.createElement('li');

    li.innerText =
        `${data.name} | ${data.latitude}, ${data.longitude}`;

    alertsList.prepend(li);
});

document.getElementById('sosBtn')
.addEventListener('click', async () => {

    await fetch('/api/sos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Demo User',
            latitude: 27.7172,
            longitude: 85.3240
        })
    });

});