const socket = io();

//Elements

const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $location = document.querySelector('#loc');
const $messages = document.querySelector('#messages');

// templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#url-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const autoScroll = () => {
    // New Message elemnet
    const $newMessage = $messages.lastElementChild;

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visibile Hight
    const visibleHeight = $messages.offsetHeight;

    //Height of message container

    const containerHeight = $messages.scrollHeight;

    //how far have I scrolled

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
    
}


socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('HH:mm')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('locationMessage', (url) => {
    const html = Mustache.render(urlTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled','disabled');

    const message = e.target.elements.message.value;
    
    socket.emit('sendMessage',message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error) {
            return console.log(error);
        }
        console.log('All good');
        
        
    });
    
})

$location.addEventListener('click', () => {
    if(!navigator.geolocation) return alert('Not availble');
    $location.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords;
        socket.emit('sendLocation',{
            latitude, 
            longitude
        }, success => {
            $location.removeAttribute('disabled');
            console.log(success);
            
        })
    })
})

socket.emit('join', { username, room }, error => {
    if(error) {
        alert(error);
        location.href = '/';
    }
})