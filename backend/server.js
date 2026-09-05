const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5001;

const uploadsFolder = path.join(__dirname, "uploads");
const dataFolder = path.join(__dirname, "data");

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
}

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

const documentsFile = path.join(dataFolder, "documents.json");
const medicinesFile = path.join(dataFolder, "medicines.json");

if (!fs.existsSync(documentsFile)) {
  fs.writeFileSync(documentsFile, "[]");
}

if (!fs.existsSync(medicinesFile)) {
  fs.writeFileSync(medicinesFile, "[]");
}

const upload = multer({
  dest: uploadsFolder,
});

const readJSON = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
};

const writeJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

/* ================= BASIC ================= */

app.get("/", (req, res) => {
  res.json({
    message: "Health Vault Backend is running!",
  });
});

/* ================= DOCUMENTS ================= */

app.get("/api/documents", (req, res) => {
  res.json(readJSON(documentsFile));
});

app.post(
  "/api/documents",
  upload.single("file"),
  (req, res) => {
    const documents = readJSON(documentsFile);

    const document = {
      id: Date.now().toString(),
      type: req.body.type,
      title: req.body.title,
      doctor: req.body.doctor,
      date: req.body.date,
      issue: req.body.issue,
      file: req.file
        ? {
            name: req.file.originalname,
            type: req.file.mimetype,
            path: `/uploads/${req.file.filename}`,
          }
        : null,
    };

    documents.push(document);
    writeJSON(documentsFile, documents);

    res.json(document);
  }
);

app.put(
  "/api/documents/:id",
  upload.single("file"),
  (req, res) => {
    const documents = readJSON(documentsFile);

    const index = documents.findIndex(
      (doc) => doc.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const oldDocument = documents[index];

    documents[index] = {
      ...oldDocument,
      type: req.body.type,
      title: req.body.title,
      doctor: req.body.doctor,
      date: req.body.date,
      issue: req.body.issue,
      file: req.file
        ? {
            name: req.file.originalname,
            type: req.file.mimetype,
            path: `/uploads/${req.file.filename}`,
          }
        : oldDocument.file,
    };

    writeJSON(documentsFile, documents);

    res.json(documents[index]);
  }
);

app.delete("/api/documents/:id", (req, res) => {
  let documents = readJSON(documentsFile);

  documents = documents.filter(
    (doc) => doc.id !== req.params.id
  );

  writeJSON(documentsFile, documents);

  res.json({
    message: "Document deleted",
  });
});

/* ================= MEDICINES ================= */

app.get("/api/medicines", (req, res) => {
  const medicines = readJSON(medicinesFile);

  const fixedMedicines = medicines.map((medicine) => ({
    ...medicine,
    expiryDate: medicine.expiryDate || "",
    history: medicine.history || [],
  }));

  res.json(fixedMedicines);
});

app.post("/api/medicines", (req, res) => {
  const medicines = readJSON(medicinesFile);

  const medicine = {
    id: Date.now().toString(),
    name: req.body.name,
    dose: req.body.dose,
    time: req.body.time,
    expiryDate: req.body.expiryDate || "",
    status: "Pending",
    takenAt: null,
    missedAt: null,
    history: [],
  };

  medicines.push(medicine);

  writeJSON(medicinesFile, medicines);

  res.json(medicine);
});

app.put("/api/medicines/:id", (req, res) => {
  const medicines = readJSON(medicinesFile);

  const index = medicines.findIndex(
    (medicine) => medicine.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Medicine not found",
    });
  }

  medicines[index] = {
    ...medicines[index],
    name: req.body.name,
    dose: req.body.dose,
    time: req.body.time,
    expiryDate:
      req.body.expiryDate ||
      medicines[index].expiryDate ||
      "",
    history: medicines[index].history || [],
  };

  writeJSON(medicinesFile, medicines);

  res.json(medicines[index]);
});

app.delete("/api/medicines/:id", (req, res) => {
  let medicines = readJSON(medicinesFile);

  medicines = medicines.filter(
    (medicine) => medicine.id !== req.params.id
  );

  writeJSON(medicinesFile, medicines);

  res.json({
    message: "Medicine deleted",
  });
});

app.patch("/api/medicines/:id/status", (req, res) => {
  const medicines = readJSON(medicinesFile);

  const index = medicines.findIndex(
    (medicine) => medicine.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Medicine not found",
    });
  }

  const medicine = medicines[index];

  const history = medicine.history || [];

  if (req.body.status === "Taken") {
    history.push({
      status: "Taken",
      time: req.body.takenAt,
    });
  }

  if (req.body.status === "Missed") {
    history.push({
      status: "Missed",
      time: req.body.missedAt,
    });
  }

  medicines[index] = {
    ...medicine,
    status: req.body.status,
    takenAt: req.body.takenAt || null,
    missedAt: req.body.missedAt || null,
    history,
  };

  writeJSON(medicinesFile, medicines);

  res.json(medicines[index]);
});

/* ================= FILES ================= */

app.use("/uploads", express.static(uploadsFolder));

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Health Vault Backend running on port ${PORT}`);
});
  