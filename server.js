// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Dossier pour stocker les fichiers JSON
const DATA_DIR = path.join(__dirname, "data");

// Création du dossier s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Initialiser les fichiers si inexistants
const files = ["ciment.json", "transport.json", "versement.json", "trash.json"];
files.forEach(file => {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
});

// Fonctions utilitaires
function readJSON(file) {
    const filePath = path.join(DATA_DIR, file);
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function writeJSON(file, data) {
    const filePath = path.join(DATA_DIR, file);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Routes génériques pour CRUD
function createRoutes(name) {
    app.get(`/api/${name}`, (req, res) => res.json(readJSON(`${name}.json`)));
    app.post(`/api/${name}`, (req, res) => {
        const data = readJSON(`${name}.json`);
        data.push(req.body);
        writeJSON(`${name}.json`, data);
        res.json({ success: true });
    });
    app.put(`/api/${name}/:index`, (req, res) => {
        const data = readJSON(`${name}.json`);
        const i = parseInt(req.params.index);
        data[i] = req.body;
        writeJSON(`${name}.json`, data);
        res.json({ success: true });
    });
    app.delete(`/api/${name}/:index`, (req, res) => {
        const data = readJSON(`${name}.json`);
        const i = parseInt(req.params.index);
        const removed = data[i];
        const trash = readJSON("trash.json");
        trash.push({ ...removed, source: name });
        writeJSON("trash.json", trash);
        data.splice(i, 1);
        writeJSON(`${name}.json`, data);
        res.json({ success: true });
    });
}

// Création des routes
["ciment", "transport", "versement"].forEach(createRoutes);

// Corbeille
app.get("/api/trash", (req, res) => res.json(readJSON("trash.json")));
app.post("/api/trash/restore/:index", (req, res) => {
    const trash = readJSON("trash.json");
    const i = parseInt(req.params.index);
    const item = trash[i];
    const target = readJSON(`${item.source}.json`);
    target.push(item);
    writeJSON(`${item.source}.json`, target);
    trash.splice(i, 1);
    writeJSON("trash.json", trash);
    res.json({ success: true });
});

// Servir le dossier public
app.use(express.static("public"));

// Lancer le serveur
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
