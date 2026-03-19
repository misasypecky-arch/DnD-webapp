const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

const dataFile = 'users.json';
let chatMessages = []; // Dočasné zprávy v paměti

function loadData() {
    if (!fs.existsSync(dataFile)) return { users: [] };
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Auth API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const data = loadData();
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) res.json({ success: true, user });
    else res.json({ success: false, message: 'Špatné jméno nebo heslo' });
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    let data = loadData();
    if (data.users.find(u => u.username === username)) return res.json({ success: false, message: 'Uživatel již existuje' });
    data.users.push({ username, password, characters: [] });
    saveData(data);
    res.json({ success: true });
});

// Character API
app.post('/api/save-character', (req, res) => {
    const { username, character } = req.body;
    let data = loadData();
    const user = data.users.find(u => u.username === username);
    if (user) {
        user.characters.push(character);
        saveData(data);
        res.json({ success: true, characters: user.characters });
    }
});

app.post('/api/delete-character', (req, res) => {
    const { username, charIndex } = req.body;
    let data = loadData();
    const user = data.users.find(u => u.username === username);
    if (user) {
        user.characters.splice(charIndex, 1);
        saveData(data);
        res.json({ success: true, characters: user.characters });
    }
});

// Chat API
app.post('/api/send-message', (req, res) => {
    const { room, sender, text, isRoll } = req.body;
    const newMessage = { id: Date.now(), room, sender, text, isRoll, time: new Date().toLocaleTimeString() };
    chatMessages.push(newMessage);
    if (chatMessages.length > 50) chatMessages.shift(); // Limit 50 zpráv
    res.json({ success: true });
});

app.get('/api/get-messages', (req, res) => {
    const { room } = req.query;
    res.json(chatMessages.filter(m => m.room === room));
});

app.get('/', (req, res) => res.redirect('/login.html'));

app.listen(3000, () => console.log('Server běží na http://localhost:3000'));