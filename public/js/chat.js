const username = localStorage.getItem('name');

if (!username) {
  throw new Error('Username is required');
}

const labelStatusOnline = document.querySelector('#status-online');
const labelStatusOffline = document.querySelector('#status-offline');

const clientsConnectedElement = document.querySelector('ul');

const form = document.querySelector('form');
const input = document.querySelector('input');
const chatElement = document.querySelector('#chat');
const userConnectedNameElement = document.querySelector('#user-connected-name');
const lastConnectionElement = document.querySelector('#last-connetion');

const renderClients = (users) => {
  clientsConnectedElement.innerHTML = '';
  users.forEach((user) => {
    const liElement = document.createElement('li');
    liElement.innerText = user.name;
    clientsConnectedElement.appendChild(liElement);
  });
};

const renderMessage = (payload) => {
  const { userId, message, name } = payload;

  const divElement = document.createElement('div');

  divElement.classList.add('message');
  if (userId !== socket.id) {
    divElement.classList.add('incoming');
  }

  divElement.innerHTML = `
    <small> ${name} </small>
    <p>${message}</p>
  `;
  chatElement.appendChild(divElement);

  chatElement.scrollTop = chatElement.scrollHeight;
};
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const message = input.value;
  input.value = '';

  socket.emit('send-message', message);
});

const socket = io({
  auth: {
    token: 'Chanchito-Feliz',
    name: username,
  },
});

socket.on('connect', () => {
  labelStatusOnline.classList.remove('hidden');
  labelStatusOffline.classList.add('hidden');
  userConnectedNameElement.innerHTML = username;
  const hourConnection = `${new Date().getHours()}:${new Date().getMinutes()}`;
  lastConnectionElement.innerHTML = `Hoy a las ${hourConnection}`;
  console.log('conectado');
});

socket.on('disconnect', () => {
  labelStatusOnline.classList.add('hidden');
  labelStatusOffline.classList.remove('hidden');
  console.log('disconnect');
});

socket.on('on-clients-changed', renderClients);

socket.on('on-message', renderMessage);
