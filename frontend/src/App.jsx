import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const documentIcons = {
  Prescription: "💊",
  Report: "🧪",
  Scan: "🩻",
};

const formatDate = (date) => {
  if (!date) return "";

  const parts = date.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return date;
};

const convertToInputDate = (date) => {
  if (!date) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  if (date.includes("/")) {
    const [day, month, year] = date.split("/");

    return `${year}-${month.padStart(
      2,
      "0"
    )}-${day.padStart(2, "0")}`;
  }

  return date;
};

const getExpiryMessage = (expiryDate) => {
  if (!expiryDate) return "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${expiryDate}T00:00:00`);

  const difference =
    Math.ceil(
      (expiry - today) /
        (1000 * 60 * 60 * 24)
    );

  if (difference < 0) {
    return "⚠️ Medicine expired";
  }

  if (difference === 0) {
    return "⚠️ Expires today";
  }

  if (difference === 1) {
    return "⚠️ Expires in 1 day";
  }

  if (difference <= 7) {
    return `⚠️ Expires in ${difference} days`;
  }

  if (difference <= 15) {
    return `🔔 Expires in ${difference} days`;
  }

  return `📅 Expires in ${difference} days`;
};

function App() {
  /* ================= DOCUMENTS ================= */

  const [documents, setDocuments] = useState([]);
  const [showAssistant, setShowAssistant] = useState(false);

const [assistantQuestion, setAssistantQuestion] =
  useState("");

const [assistantAnswer, setAssistantAnswer] =
  useState("");

const askAssistant = () => {
  const question =
    assistantQuestion.trim().toLowerCase();

  if (!question) {
    setAssistantAnswer(
      "Please ask me something about your Health Vault."
    );
    return;
  }

  if (
    question.includes("medicine") ||
    question.includes("medicines")
  ) {
    if (medicines.length === 0) {
      setAssistantAnswer(
        "There are no medicines saved in your Health Vault."
      );
    } else {
      const medicineList = medicines
        .map(
          (medicine) =>
            `${medicine.name} (${medicine.dose}) at ${medicine.time}`
        )
        .join(", ");

      setAssistantAnswer(
        `Your saved medicines are: ${medicineList}.`
      );
    }

    return;
  }

  if (
    question.includes("document") ||
    question.includes("prescription") ||
    question.includes("report")
  ) {
    setAssistantAnswer(
      `You have ${documents.length} medical document(s) saved in your Health Vault.`
    );

    return;
  }

  if (
    question.includes("expiry") ||
    question.includes("expire")
  ) {
    const expiryMedicines = medicines.filter(
      (medicine) => medicine.expiryDate
    );

    if (expiryMedicines.length === 0) {
      setAssistantAnswer(
        "No medicine expiry dates have been added yet."
      );
    } else {
      setAssistantAnswer(
        expiryMedicines
          .map(
            (medicine) =>
              `${medicine.name} expires on ${formatDate(
                medicine.expiryDate
              )}.`
          )
          .join(" ")
      );
    }

    return;
  }

  if (
    question.includes("blood") ||
    question.includes("allergy") ||
    question.includes("condition")
  ) {
    setAssistantAnswer(
      `Blood group: ${
        personalInfo.bloodGroup || "Not added"
      }. Allergies: ${
        personalInfo.allergies || "None added"
      }. Medical conditions: ${
        personalInfo.conditions || "None added"
      }.`
    );

    return;
  }

  setAssistantAnswer(
    "I can help you check your saved medicines, medical documents, expiry dates, blood group, allergies and medical conditions."
  );
};
  const [personalInfo, setPersonalInfo] = useState(() => {
  const saved = localStorage.getItem("healthVaultPersonalInfo");

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {
        name: "",
        age: "",
        bloodGroup: "",
        allergies: "",
        conditions: "",
        emergencyContact: "",
      };
    }
  }

  return {
    name: "",
    age: "",
    bloodGroup: "",
    allergies: "",
    conditions: "",
    emergencyContact: "",
  };
});

const [showPersonalForm, setShowPersonalForm] =
  useState(false);

useEffect(() => {
  localStorage.setItem(
    "healthVaultPersonalInfo",
    JSON.stringify(personalInfo)
  );
}, [personalInfo]);
const hospitals = [
  {
    name: "City Care Hospital",
    location: "Main Road",
    general: 24,
    icu: 6,
    emergency: 4,
    phone: "011-12345678",
  },
  {
    name: "ABC Multispeciality Hospital",
    location: "Central Avenue",
    general: 18,
    icu: 4,
    emergency: 2,
    phone: "011-87654321",
  },
  {
    name: "Health Plus Hospital",
    location: "Green Park",
    general: 12,
    icu: 3,
    emergency: 3,
    phone: "011-45678901",
  },
];

  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState(null);
  const [selectedDocument, setSelectedDocument] =
    useState(null);
  const [selectedFile, setSelectedFile] =
    useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [sortBy, setSortBy] = useState("date");

  const [newDocument, setNewDocument] = useState({
    type: "Prescription",
    title: "",
    doctor: "",
    date: "",
    issue: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/api/documents`)
      .then((response) => response.json())
      .then((data) => {
        setDocuments(data);
      })
      .catch((error) => {
        console.error(
          "Could not load documents:",
          error
        );
      });
  }, []);

  const saveDocument = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append(
        "type",
        newDocument.type
      );

      formData.append(
        "title",
        newDocument.title
      );

      formData.append(
        "doctor",
        newDocument.doctor
      );

      formData.append(
        "date",
        newDocument.date
      );

      formData.append(
        "issue",
        newDocument.issue
      );

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      let response;

      if (editingDocument) {
        response = await fetch(
          `${API_URL}/api/documents/${editingDocument.id}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        response = await fetch(
          `${API_URL}/api/documents`,
          {
            method: "POST",
            body: formData,
          }
        );
      }

      if (!response.ok) {
        throw new Error(
          "Document request failed"
        );
      }

      const savedDocument =
        await response.json();

      if (editingDocument) {
        setDocuments((previous) =>
          previous.map((document) =>
            document.id === editingDocument.id
              ? savedDocument
              : document
          )
        );
      } else {
        setDocuments((previous) => [
          ...previous,
          savedDocument,
        ]);
      }

      resetDocumentForm();
    } catch (error) {
      console.error(error);
      alert("Could not save document.");
    }
  };

  const resetDocumentForm = () => {
    setNewDocument({
      type: "Prescription",
      title: "",
      doctor: "",
      date: "",
      issue: "",
    });

    setSelectedFile(null);
    setEditingDocument(null);
    setShowForm(false);
  };

  const editDocument = (document) => {
    setEditingDocument(document);

    setNewDocument({
      type: document.type,
      title: document.title,
      doctor: document.doctor,
      date: convertToInputDate(
        document.date
      ),
      issue: document.issue,
    });

    setSelectedFile(null);
    setShowForm(true);
  };

  const deleteDocument = async (document) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this document?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/documents/${document.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setDocuments((previous) =>
        previous.filter(
          (item) => item.id !== document.id
        )
      );

      if (
        selectedDocument?.id === document.id
      ) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error(error);
      alert("Could not delete document.");
    }
  };

  /* ================= MEDICINES ================= */

  const [medicines, setMedicines] = useState([]);

  const [showMedicineForm, setShowMedicineForm] =
    useState(false);

  const [editingMedicine, setEditingMedicine] =
    useState(null);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dose: "",
    time: "",
    expiryDate: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/api/medicines`)
      .then((response) => response.json())
      .then((data) => {
        setMedicines(data);
      })
      .catch((error) => {
        console.error(
          "Could not load medicines:",
          error
        );
      });
  }, []);

  /* Expiry notification */

  useEffect(() => {
    medicines.forEach((medicine) => {
      if (!medicine.expiryDate) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiry = new Date(
        `${medicine.expiryDate}T00:00:00`
      );

      const days = Math.ceil(
        (expiry - today) /
          (1000 * 60 * 60 * 24)
      );

      if (
        days === 15 ||
        days === 7 ||
        days === 1
      ) {
        console.log(
          `Expiry reminder: ${medicine.name} expires in ${days} day(s).`
        );
      }
    });
  }, [medicines]);

  const saveMedicine = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (editingMedicine) {
        response = await fetch(
          `${API_URL}/api/medicines/${editingMedicine.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              newMedicine
            ),
          }
        );
      } else {
        response = await fetch(
          `${API_URL}/api/medicines`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(
              newMedicine
            ),
          }
        );
      }

      if (!response.ok) {
        throw new Error(
          "Medicine request failed"
        );
      }

      const savedMedicine =
        await response.json();

      if (editingMedicine) {
        setMedicines((previous) =>
          previous.map((medicine) =>
            medicine.id === editingMedicine.id
              ? savedMedicine
              : medicine
          )
        );
      } else {
        setMedicines((previous) => [
          ...previous,
          savedMedicine,
        ]);
      }

      resetMedicineForm();
    } catch (error) {
      console.error(error);
      alert("Could not save medicine.");
    }
  };

  const resetMedicineForm = () => {
    setNewMedicine({
      name: "",
      dose: "",
      time: "",
      expiryDate: "",
    });

    setEditingMedicine(null);
    setShowMedicineForm(false);
  };

  const toggleMedicineStatus = async (
    index
  ) => {
    const medicine = medicines[index];

    const newStatus =
      medicine.status === "Taken"
        ? "Pending"
        : "Taken";

    const now =
      new Date().toLocaleString();

    const updatedData = {
      status: newStatus,
      takenAt:
        newStatus === "Taken"
          ? now
          : null,
      missedAt: null,
    };

    try {
      const response = await fetch(
        `${API_URL}/api/medicines/${medicine.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            updatedData
          ),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Status update failed"
        );
      }

      const updatedMedicine =
        await response.json();

      setMedicines((previous) =>
        previous.map((item, i) =>
          i === index
            ? updatedMedicine
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert(
        "Could not update medicine status."
      );
    }
  };

  const markMedicineMissed = async (
    index
  ) => {
    const medicine = medicines[index];

    const now =
      new Date().toLocaleString();

    const updatedData = {
      status: "Missed",
      takenAt: null,
      missedAt: now,
    };

    try {
      const response = await fetch(
        `${API_URL}/api/medicines/${medicine.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            updatedData
          ),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Missed update failed"
        );
      }

      const updatedMedicine =
        await response.json();

      setMedicines((previous) =>
        previous.map((item, i) =>
          i === index
            ? updatedMedicine
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert(
        "Could not mark medicine as missed."
      );
    }
  };

  const editMedicine = (medicine) => {
    setEditingMedicine(medicine);

    setNewMedicine({
      name: medicine.name,
      dose: medicine.dose,
      time: medicine.time,
      expiryDate:
        medicine.expiryDate || "",
    });

    setShowMedicineForm(true);
  };

  const deleteMedicine = async (index) => {
    const medicine = medicines[index];

    if (
      !window.confirm(
        "Are you sure you want to delete this medicine?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/medicines/${medicine.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Medicine delete failed"
        );
      }

      setMedicines((previous) =>
        previous.filter(
          (item) =>
            item.id !== medicine.id
        )
      );
    } catch (error) {
      console.error(error);
      alert(
        "Could not delete medicine."
      );
    }
  };

  /* ================= SORT ================= */

  const filteredDocuments = documents
    .filter((doc) => {
      const search =
        searchTerm.trim().toLowerCase();

      const matchesCategory =
        selectedCategory === "All" ||
        doc.type === selectedCategory;

      const matchesSearch =
        doc.title
          ?.toLowerCase()
          .includes(search) ||
        doc.doctor
          ?.toLowerCase()
          .includes(search) ||
        doc.issue
          ?.toLowerCase()
          .includes(search);

      return (
        matchesCategory &&
        matchesSearch
      );
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return b.date.localeCompare(
          a.date
        );
      }

      if (sortBy === "doctor") {
        return a.doctor.localeCompare(
          b.doctor
        );
      }

      if (sortBy === "issue") {
        return a.issue.localeCompare(
          b.issue
        );
      }

      return 0;
    });

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">
        <div>
          <h1>🏥 Health Vault</h1>

          <p>
            Your medical documents, safely
            organized.
          </p>
        </div>

        <button
          className="add-button"
          onClick={() => {
            setEditingDocument(null);

            setNewDocument({
              type: "Prescription",
              title: "",
              doctor: "",
              date: "",
              issue: "",
            });

            setSelectedFile(null);
            setShowForm(true);
          }}
        >
          + Add Document
        </button>
        <button
  className="assistant-button"
  onClick={() => setShowAssistant(true)}
>
  🤖 AI Assistant
</button>
      </header>

      <main>
        {/* ================= PERSONAL INFORMATION ================= */}

<section className="personal-section">

  <div className="section-header">

    <div>
      <h2>👤 Personal Health Information</h2>
      <p>Your important health information in one place.</p>
    </div>

    <button
      className="add-button"
      onClick={() => setShowPersonalForm(true)}
    >
      ✏️ Edit Information
    </button>

  </div>

  <div className="personal-card">

    <div className="info-item">
      <strong>Name</strong>
      <span>
        {personalInfo.name || "Not added"}
      </span>
    </div>

    <div className="info-item">
      <strong>Age</strong>
      <span>
        {personalInfo.age || "Not added"}
      </span>
    </div>

    <div className="info-item">
      <strong>Blood Group</strong>
      <span>
        {personalInfo.bloodGroup || "Not added"}
      </span>
    </div>

    <div className="info-item">
      <strong>Allergies</strong>
      <span>
        {personalInfo.allergies || "None added"}
      </span>
    </div>

    <div className="info-item">
      <strong>Medical Conditions</strong>
      <span>
        {personalInfo.conditions || "None added"}
      </span>
    </div>

    <div className="info-item">
      <strong>Emergency Contact</strong>
      <span>
        {personalInfo.emergencyContact || "Not added"}
      </span>
    </div>

  </div>

</section>
{/* ================= HOSPITAL AVAILABILITY ================= */}

<section className="hospital-section">

  <div className="section-header">

    <div>
      <h2>🏥 Hospital Bed Availability</h2>
      <p>View demo availability of nearby hospitals.</p>
    </div>

  </div>

  <div className="hospital-list">

    {hospitals.map((hospital) => (

      <div
        className="hospital-card"
        key={hospital.name}
      >

        <h3>{hospital.name}</h3>

        <p>📍 {hospital.location}</p>

        <div className="bed-grid">

          <div>
            <strong>{hospital.general}</strong>
            <span>General</span>
          </div>

          <div>
            <strong>{hospital.icu}</strong>
            <span>ICU</span>
          </div>

          <div>
            <strong>{hospital.emergency}</strong>
            <span>Emergency</span>
          </div>

        </div>

        <p>📞 {hospital.phone}</p>

      </div>

    ))}

  </div>

</section>

{/* ================= EMERGENCY ================= */}

<section className="emergency-section">

  <div>
    <h2>🆘 Emergency Information</h2>

    <p>
      Keep your emergency contact information easily
      accessible.
    </p>
  </div>

  <div className="emergency-card">

    <h3>Emergency Contact</h3>

    <p>
      {personalInfo.emergencyContact ||
        "No emergency contact added yet."}
    </p>

    <p>
      📌 Blood Group:{" "}
      {personalInfo.bloodGroup || "Not added"}
    </p>

    <p>
      ⚠️ Allergies:{" "}
      {personalInfo.allergies || "None added"}
    </p>

  </div>

</section>
{/* ================= PERSONAL FORM ================= */}

{showPersonalForm && (
  <div className="modal">

    <div className="modal-content">

      <h2>👤 Personal Information</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowPersonalForm(false);
        }}
      >

        <label>Name</label>

        <input
          type="text"
          value={personalInfo.name}
          onChange={(e) =>
            setPersonalInfo({
              ...personalInfo,
              name: e.target.value,
            })
          }
        />

        <label>Age</label>

        <input
          type="number"
          value={personalInfo.age}
          onChange={(e) =>
            setPersonalInfo({
              ...personalInfo,
              age: e.target.value,
            })
          }
        />

        <label>Blood Group</label>

        <input
          type="text"
          placeholder="e.g. B+"
          value={personalInfo.bloodGroup}
          onChange={(e) =>
            setPersonalInfo({
              ...personalInfo,
              bloodGroup: e.target.value,
            })
          }
        />

        <label>Allergies</label>

        <input
          type="text"
          placeholder="e.g. None"
          value={personalInfo.allergies}
          onChange={(e) =>
            setPersonalInfo({
              ...personalInfo,
              allergies: e.target.value,
            })
          }
        />

        <label>Medical Conditions</label>

        <input
          type="text"
          placeholder="e.g. None"
          value={personalInfo.conditions}
          onChange={(e) =>
            setPersonalInfo({
              ...personalInfo,
              conditions: e.target.value,
            })
          }
        />

        <label>Emergency Contact</label>

        <input
          type="text"
          placeholder="Name and phone number"
          value={personalInfo.emergencyContact}
          onChange={(e) =>
            setPersonalInfo({
              ...personalInfo,
              emergencyContact: e.target.value,
            })
          }
        />

        <div className="form-buttons">

          <button
            type="button"
            className="cancel-button"
            onClick={() =>
              setShowPersonalForm(false)
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-button"
          >
            Save Information
          </button>

        </div>

      </form>

    </div>

  </div>
)}

        {/* ================= MEDICINE ================= */}

        <section className="medicine-section">

          <div className="section-header">

            <div>
              <h2>
                💊 Medicine Reminder
              </h2>

              <p>
                Keep track of your medicines
                and doses.
              </p>
            </div>

            <button
              className="add-button"
              onClick={() => {
                setEditingMedicine(null);

                setNewMedicine({
                  name: "",
                  dose: "",
                  time: "",
                  expiryDate: "",
                });

                setShowMedicineForm(true);
              }}
            >
              + Add Medicine
            </button>

          </div>

          <div className="reminder-info">
            ⏰ Medicine times and expiry
            dates are tracked automatically.
          </div>

          <div className="medicine-list">

            {medicines.length === 0 ? (

              <p>
                No medicines added yet.
              </p>

            ) : (

              medicines.map(
                (medicine, index) => (

                  <div
                    className="medicine-card"
                    key={medicine.id}
                  >

                    <h3>
                      {medicine.name}
                    </h3>

                    <p>
                      Dose: {medicine.dose}
                    </p>

                    <p>
                      Time: {medicine.time}
                    </p>

                    {medicine.expiryDate && (
                      <p>
                        Expiry:{" "}
                        {formatDate(
                          medicine.expiryDate
                        )}
                      </p>
                    )}

                    {medicine.expiryDate && (
                      <p className="medicine-reminder">
                        {getExpiryMessage(
                          medicine.expiryDate
                        )}
                      </p>
                    )}

                    {medicine.takenAt && (
                      <p>
                        Last Taken:{" "}
                        {medicine.takenAt}
                      </p>
                    )}

                    {medicine.missedAt && (
                      <p>
                        Last Missed:{" "}
                        {medicine.missedAt}
                      </p>
                    )}

                    <button
                      className="medicine-status"
                      onClick={() =>
                        toggleMedicineStatus(
                          index
                        )
                      }
                    >
                      {medicine.status}
                    </button>

                    <button
                      className="missed-button"
                      onClick={() =>
                        markMedicineMissed(
                          index
                        )
                      }
                    >
                      Missed
                    </button>

                    <button
                      className="edit-button"
                      onClick={() =>
                        editMedicine(
                          medicine
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteMedicine(
                          index
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>
                )
              )
            )}

          </div>

          {/* ================= MEDICINE FORM ================= */}

          {showMedicineForm && (
            <div className="modal">

              <div className="modal-content">

                <h2>
                  {editingMedicine
                    ? "Edit Medicine"
                    : "Add Medicine"}
                </h2>

                <form
                  onSubmit={saveMedicine}
                >

                  <label>
                    Medicine Name
                  </label>

                  <input
                    type="text"
                    value={
                      newMedicine.name
                    }
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        name:
                          e.target.value,
                      })
                    }
                    required
                  />

                  <label>
                    Dose
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. 500 mg"
                    value={
                      newMedicine.dose
                    }
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        dose:
                          e.target.value,
                      })
                    }
                    required
                  />

                  <label>
                    Time
                  </label>

                  <input
                    type="time"
                    value={
                      newMedicine.time
                    }
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        time:
                          e.target.value,
                      })
                    }
                    required
                  />

                  <label>
                    Medicine Expiry Date
                  </label>

                  <input
                    type="date"
                    value={
                      newMedicine.expiryDate
                    }
                    onChange={(e) =>
                      setNewMedicine({
                        ...newMedicine,
                        expiryDate:
                          e.target.value,
                      })
                    }
                  />

                  <div className="form-buttons">

                    <button
                      type="button"
                      className="cancel-button"
                      onClick={
                        resetMedicineForm
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="save-button"
                    >
                      {editingMedicine
                        ? "Update Medicine"
                        : "Add Medicine"}
                    </button>

                  </div>

                </form>

              </div>

            </div>
          )}

          {/* ================= HISTORY ================= */}

          <div className="medicine-history">

            <h3>
              📋 Medicine History
            </h3>

            {medicines.every(
              (medicine) =>
                !medicine.history ||
                medicine.history.length === 0
            ) ? (

              <p>
                No medicine history yet.
              </p>

            ) : (

              medicines.map((medicine) => {

                if (
                  !medicine.history ||
                  medicine.history.length === 0
                ) {
                  return null;
                }

                return medicine.history
                  .slice()
                  .reverse()
                  .map(
                    (entry, index) => (

                      <div
                        className="history-item"
                        key={`${medicine.id}-${index}`}
                      >

                        <strong>
                          {medicine.name}
                        </strong>

                        <span>
                          {entry.status ===
                          "Taken"
                            ? `✅ Taken at ${entry.time}`
                            : `❌ Missed at ${entry.time}`}
                        </span>

                      </div>

                    )
                  );
              })
            )}

          </div>

        </section>

        {/* ================= DOCUMENTS ================= */}

        <h2>
          Your Medical Documents
        </h2>

        <p className="subtitle">
          Prescriptions, reports and medical
          records in one place.
        </p>

        <input
          className="search"
          type="text"
          placeholder="🔍 Search by document, doctor or health issue..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
        />

        <div className="categories">

          {[
            "All",
            "Prescription",
            "Report",
            "Scan",
          ].map((category) => (

            <button
              key={category}
              className={
                selectedCategory ===
                category
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedCategory(
                  category
                )
              }
            >
              {category}
            </button>

          ))}

        </div>

        {/* SORT */}

        <div className="sort-box">

          <label>
            Sort documents:
          </label>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
          >
            <option value="date">
              Date — Newest First
            </option>

            <option value="doctor">
              Doctor / Hospital
            </option>

            <option value="issue">
              Health Issue
            </option>
          </select>

        </div>

        <div className="documents">

          {filteredDocuments.length === 0 ? (

            <p>
              No documents found.
            </p>

          ) : (

            filteredDocuments.map(
              (doc) => (

                <div
                  className="document-card"
                  key={doc.id}
                >

                  <div className="document-icon">
                    {
                      documentIcons[
                        doc.type
                      ] || "📄"
                    }
                  </div>

                  <span className="document-type">
                    {doc.type}
                  </span>

                  <h3>
                    {doc.title}
                  </h3>

                  <p>
                    👨‍⚕️ {doc.doctor}
                  </p>

                  <p>
                    📅{" "}
                    {formatDate(
                      doc.date
                    )}
                  </p>

                  <p>
                    🩺 {doc.issue}
                  </p>

                  <button
                    className="view-button"
                    onClick={() =>
                      setSelectedDocument(
                        doc
                      )
                    }
                  >
                    View
                  </button>

                  <button
                    className="edit-button"
                    onClick={() =>
                      editDocument(doc)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteDocument(doc)
                    }
                  >
                    Delete
                  </button>

                </div>

              )
            )
          )}

        </div>

      </main>

      {/* ================= DOCUMENT FORM ================= */}

      {showForm && (
        <div className="modal">

          <div className="modal-content">

            <h2>
              {editingDocument
                ? "Edit Medical Document"
                : "Add Medical Document"}
            </h2>

            <form
              onSubmit={saveDocument}
            >

              <label>
                Document Type
              </label>

              <select
                value={
                  newDocument.type
                }
                onChange={(e) =>
                  setNewDocument({
                    ...newDocument,
                    type:
                      e.target.value,
                  })
                }
              >
                <option>
                  Prescription
                </option>

                <option>
                  Report
                </option>

                <option>
                  Scan
                </option>
              </select>

              <label>
                Document Name
              </label>

              <input
                type="text"
                placeholder="e.g. Blood Test Report"
                value={
                  newDocument.title
                }
                onChange={(e) =>
                  setNewDocument({
                    ...newDocument,
                    title:
                      e.target.value,
                  })
                }
                required
              />

              <label>
                Doctor / Hospital
              </label>

              <input
                type="text"
                placeholder="e.g. Dr. Sharma"
                value={
                  newDocument.doctor
                }
                onChange={(e) =>
                  setNewDocument({
                    ...newDocument,
                    doctor:
                      e.target.value,
                  })
                }
                required
              />

              <label>
                Date
              </label>

              <input
                type="date"
                value={
                  newDocument.date
                }
                onChange={(e) =>
                  setNewDocument({
                    ...newDocument,
                    date:
                      e.target.value,
                  })
                }
                required
              />

              <label>
                Health Issue
              </label>

              <input
                type="text"
                placeholder="e.g. Fever"
                value={
                  newDocument.issue
                }
                onChange={(e) =>
                  setNewDocument({
                    ...newDocument,
                    issue:
                      e.target.value,
                  })
                }
                required
              />

              <label>
                Upload Prescription /
                Report
              </label>

              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const file =
                    e.target.files[0];

                  if (file) {
                    setSelectedFile(
                      file
                    );
                  }
                }}
              />

              {editingDocument &&
                editingDocument.file &&
                !selectedFile && (
                  <p>
                    📎 Current file:{" "}
                    {
                      editingDocument.file
                        .name
                    }
                  </p>
                )}

              {selectedFile && (
                <p>
                  📎 Selected:{" "}
                  {selectedFile.name}
                </p>
              )}

              <div className="form-buttons">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={
                    resetDocumentForm
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingDocument
                    ? "Update Document"
                    : "Add Medical Document"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================= VIEW DOCUMENT ================= */}

      {selectedDocument && (
        <div className="modal">

          <div className="modal-content">

            <h2>
              {selectedDocument.title}
            </h2>

            <p>
              <strong>
                Document Type:
              </strong>{" "}
              {selectedDocument.type}
            </p>

            {selectedDocument.file?.path ? (

              <div className="document-preview">

                <strong>
                  Uploaded File:
                </strong>

                <p>
                  📎{" "}
                  {
                    selectedDocument.file
                      .name
                  }
                </p>

                {selectedDocument.file.type?.startsWith(
                  "image/"
                ) ? (

                  <img
                    className="preview-image"
                    src={`${API_URL}${selectedDocument.file.path}`}
                    alt={
                      selectedDocument.file
                        .name
                    }
                  />

                ) : selectedDocument.file
                    .type ===
                  "application/pdf" ? (

                  <iframe
                    className="preview-pdf"
                    src={`${API_URL}${selectedDocument.file.path}`}
                    title={
                      selectedDocument.file
                        .name
                    }
                  />

                ) : (

                  <p>
                    File preview is not
                    supported.
                  </p>

                )}

              </div>

            ) : (

              <p>
                📎 No file uploaded for
                this document.
              </p>

            )}

            <p>
              <strong>
                Doctor / Hospital:
              </strong>{" "}
              {selectedDocument.doctor}
            </p>

            <p>
              <strong>
                Date:
              </strong>{" "}
              {formatDate(
                selectedDocument.date
              )}
            </p>

            <p>
              <strong>
                Health Issue:
              </strong>{" "}
              {selectedDocument.issue}
            </p>

            <div className="form-buttons">

              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  setSelectedDocument(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}
      {showAssistant && (
        <div className="modal">

          <div className="modal-content">

            <h2>🤖 Health Vault AI Assistant</h2>

            <p>
              Ask me about your saved health information.
            </p>

            <input
              type="text"
              placeholder="e.g. What medicines do I have?"
              value={assistantQuestion}
              onChange={(e) =>
                setAssistantQuestion(e.target.value)
              }
            />

            <button
              className="save-button"
              onClick={askAssistant}
            >
              Ask Assistant
            </button>

            {assistantAnswer && (
              <div className="assistant-answer">
                <strong>🤖 Assistant:</strong>
                <p>{assistantAnswer}</p>
              </div>
            )}

            <div className="form-buttons">

              <button
                className="cancel-button"
                onClick={() => {
                  setShowAssistant(false);
                  setAssistantQuestion("");
                  setAssistantAnswer("");
                }}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
export default App;