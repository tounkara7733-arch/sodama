import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// emplacement des fichiers JSON
const DATA_DIR = path.join(process.cwd(), "data");

// lire JSON
function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
}

// écrire JSON
function writeJSON(file, data) {
  fs.writeFileSync(
    path.join(DATA_DIR, file),
    JSON.stringify(data, null, 2)
  );
}

// créer routes
function createRoutes(name) {
  app.get(`/api/${name}`, (req, res) => {
    res.json(readJSON(`${name}.json`));
  });

  app.post(`/api/${name}`, (req, res) => {
    const data = readJSON(`${name}.json`);
    data.push(req.body);
    writeJSON(`${name}.json`, data);
    res.json({ success: true });
  });

  app.delete(`/api/${name}/:index`, (req, res) => {
    const data = readJSON(`${name}.json`);
    const index = Number(req.params.index);

    const trash = readJSON("trash.json");
    trash.push({ ...data[index], source: name });
    writeJSON("trash.json", trash);

    data.splice(index, 1);
    writeJSON(`${name}.json`, data);

    res.json({ success: true });
  });
}

// créer routes
createRoutes("ciment");
createRoutes("transport");
createRoutes("versement");

// corbeille
app.get("/api/trash", (req, res) => {
  res.json(readJSON("trash.json"));
});

export default app;
