let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let activeRoom = null;
let selectedCharacter = null;
let syncInterval = null;


async function login() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: u, password: p})
    });
    const data = await res.json();
    if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = 'app.html';
    } else {
        document.getElementById('msg').innerText = data.message;
    }
}

async function register() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: u, password: p})
    });
    const data = await res.json();
    alert(data.success ? "Účet vytvořen! Teď se přihlas." : data.message);
}


if (!currentUser && window.location.pathname.includes('app.html')) {
    window.location.href = 'login.html';
}

function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById('sec-' + id).style.display = 'block';
    if (id === 'chronicle') renderChronicle();
    if (id !== 'room') stopSync();
}

async function saveCharacter() {
    const char = {
        name: document.getElementById('charName').value,
        race: document.getElementById('charRace').value,
        subrace: document.getElementById('charSubrace').value,
        class: document.getElementById('charClass').value,
        background: document.getElementById('charBackground').value,
        alignment: document.getElementById('charAlignment').value,
        proficiency: document.getElementById('charProficiency').value,
        inventory: document.getElementById('charInventory').value,
        stats: { 
            str: document.getElementById('statStr').value, 
            dex: document.getElementById('statDex').value, 
            con: document.getElementById('statCon').value,
            int: document.getElementById('statInt').value,
            wis: document.getElementById('statWis').value,
            cha: document.getElementById('statCha').value
        }
    };

    if(!char.name) return alert("Hrdina musí mít jméno!");

    const res = await fetch('/api/save-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, character: char })
    });
    
    const data = await res.json();
    if (data.success) {
        currentUser.characters = data.characters;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showSection('main-room');
        
        document.getElementById('charName').value = "";
    }
}

function renderChronicle() {
    const list = document.getElementById('my-characters-list');
    list.innerHTML = '';
    currentUser.characters.forEach((c, i) => {
        list.innerHTML += `<div class="card">
            <strong>${c.name}</strong> (${c.class})<br><small>${c.race}</small>
            <div style="margin-top:10px;">
                <button onclick="deleteChar(${i})" style="background:#5c0f0f; width:auto; padding:5px 10px;">Smazat</button>
            </div>
        </div>`;
    });
}

async function deleteChar(idx) {
    if(!confirm("Smazat hrdinu?")) return;
    const res = await fetch('/api/delete-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, charIndex: idx })
    });
    const data = await res.json();
    currentUser.characters = data.characters;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    renderChronicle();
}

async function fetchRooms() {
    const res = await fetch('/api/get-rooms');
    const rooms = await res.json();
    const list = document.getElementById('room-list');
    list.innerHTML = '';
    
    if (rooms.length === 0) {
        list.innerHTML = '<p style="color: gray;">Zatím tu nejsou žádné aktivní výpravy.</p>';
        return;
    }
    
    rooms.forEach(r => {
        list.innerHTML += `
        <div class="card">
            <span><strong>${r.name}</strong> <br><small>DM: ${r.dm}</small></span>
            <button onclick="openJoinModal('${r.name}')" style="width: auto; float: right; margin-top: -15px;">Vstoupit</button>
        </div>`;
    });
}

async function createRoom() {
    const name = document.getElementById('new-room-name').value.trim();
    if (!name) return alert("Musíš zadat název výpravy!");
    
    const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: name, dm: currentUser.username })
    });
    const data = await res.json();
    
    if (data.success) {
        document.getElementById('new-room-name').value = '';
        fetchRooms(); 
    } else {
        alert(data.message);
    }
}

async function leaveRoom() {
    if (activeRoom) {
       
        await fetch('/api/leave-room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: activeRoom, username: currentUser.username })
        });
    }
    activeRoom = null;
    showSection('main-room');
}

function openJoinModal(room) {
    activeRoom = room;
    document.getElementById('join-modal').style.display = 'block';
    const list = document.getElementById('modal-char-list');
    list.innerHTML = '';
    currentUser.characters.forEach(c => {
        const b = document.createElement('button');
        b.innerText = c.name + " (" + c.class + ")";
        b.style.marginBottom = "10px";
        b.onclick = () => enterRoom(c);
        list.appendChild(b);
    });
}

function enterRoom(char) {
    selectedCharacter = char;
    closeModal();
    showSection('room');
    document.getElementById('active-room-title').innerText = activeRoom;
    sendLiveMessage("vstoupil do místnosti.");
    syncInterval = setInterval(fetchMessages, 1000); // Kontrola zpráv každou sekundu
}

async function fetchMessages() {
    const res = await fetch(`/api/get-messages?room=${activeRoom}`);
    const msgs = await res.json();
    const box = document.getElementById('chat-box');
    box.innerHTML = msgs.map(m => `
        <div class="chat-msg-item ${m.isRoll?'roll-msg':''}">
            <small>${m.time}</small> <b>${m.sender}:</b> ${m.text}
        </div>`).join('');
    box.scrollTop = box.scrollHeight;
}

async function sendLiveMessage(text, isRoll = false) {
    await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: activeRoom, sender: selectedCharacter.name, text, isRoll })
    });
}

function rollD20() {
    const r = Math.floor(Math.random() * 20) + 1;
    sendLiveMessage(`hází d20... Výsledek: ${r}`, true);
}

function sendChatMessage() {
    const inp = document.getElementById('chat-msg');
    if (inp.value.trim()) { sendLiveMessage(inp.value); inp.value = ''; }
}

function closeModal() { document.getElementById('join-modal').style.display = 'none'; }
function stopSync() { clearInterval(syncInterval); }
function logout() { localStorage.clear(); window.location.href = 'login.html'; }
