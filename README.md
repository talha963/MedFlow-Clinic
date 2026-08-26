# 🏥 MedFlow Clinic AI

> **A next-generation, AI-powered healthcare platform seamlessly connecting patients, doctors, and medical data.**

MedFlow Clinic transforms the traditional patient portal into a smart, efficient, and deeply integrated experience. By combining modern web technologies with powerful AI and automated workflows, it provides a seamless healthcare journey from initial booking to digital prescriptions.

---

## ✨ Key Features

### 🧑‍⚕️ For Patients
* **Modern Booking Portal**: Clean, intuitive interface to book appointments, select time slots, and securely submit symptoms.
* **Automated Confirmations**: Instant HTML emails and SMS notifications the second a doctor approves an appointment.
* **Digital Prescriptions**: Official, elegantly formatted medical prescriptions sent directly to the inbox upon issuance.

### 👨‍⚕️ For Doctors
* **AI Clinical Synthesis**: Powered by GraphRAG and Gemini AI, instantly query patient histories and synthesize comprehensive clinical reports.
* **One-Click Prescriptions**: Write and issue prescriptions directly from the AI analysis screen without breaking focus.
* **Real-Time Management**: Approve or reject appointments with automated background patient communication.

---

## 🛠️ Technology Stack

| Category | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 14, React, Tailwind CSS, Lucide Icons |
| **Backend** | Python, FastAPI, SQLAlchemy |
| **Databases**| MySQL (Relational Data), Neo4j (Graph Database for AI) |
| **AI & RAG** | LangChain, Google Gemini API |
| **Automation**| n8n (Webhooks, Twilio SMS, Gmail SMTP) |
| **Auth & Infra**| Firebase Auth, Docker, Docker Compose |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Docker & Docker Compose** installed on your machine.
* **Node.js 20+** (for local frontend development).
* **API Keys**: Google Gemini API Key.
* **n8n instance** (Local or Cloud) for automation workflows.

### 2. Environment Setup
Clone the repository and create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Launch the Platform
Run the entire stack using Docker Compose:
```bash
docker-compose up -d --build
```

### 4. Access Points
* **Patient Portal**: `http://localhost:3000`
* **Doctor Dashboard**: `http://localhost:3000/doctor/login`
* **Backend API Docs**: `http://localhost:8000/docs`

---

## ⚙️ Workflow Automation (n8n)

MedFlow relies heavily on n8n for background automation. The system automatically triggers webhooks for the following events:
1. **Appointment Approval**: Triggers when a doctor confirms a booking. Extracts patient data and routes it to Twilio (SMS) and Gmail (Email).
2. **Prescription Issuance**: Triggers when a doctor writes a prescription. Generates and emails a beautiful HTML digital prescription.

---

## 🤝 Contributing & Future Roadmap

This project is actively maintained and continuously expanding. Upcoming features include:
* *Enhanced AI chat interfaces for real-time patient triage.*
* *Advanced analytics dashboard for clinic administration.*

Contributions, issues, and feature requests are always welcome!

---
*Built with ❤️ for the future of healthcare.*
