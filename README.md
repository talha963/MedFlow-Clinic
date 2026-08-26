# 🏥 MedFlow Clinic AI

![MedFlow Clinic Banner](https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop)

**MedFlow Clinic** is a next-generation, AI-powered healthcare platform designed to seamlessly connect patients, doctors, and medical data. By combining modern web technologies (Next.js) with powerful AI and automated workflows (n8n), MedFlow Clinic transforms the traditional patient portal into a smart, efficient, and deeply integrated experience.

---

## ✨ Features

### 🧑‍⚕️ For Patients
- **Modern Booking Portal**: A clean, intuitive interface to book appointments, select preferred time slots, and submit medical symptoms securely.
- **Instant Automated Confirmations**: Patients receive beautiful HTML confirmation emails and SMS notifications the second a doctor approves their appointment.
- **Digital Prescriptions**: Official, elegantly formatted medical prescriptions are automatically sent directly to the patient's inbox upon issuance.

### 👨‍⚕️ For Doctors
- **AI Clinical Synthesis**: Powered by GraphRAG and Gemini AI, the doctor dashboard can instantly query patient histories and synthesize comprehensive clinical reports.
- **One-Click Prescriptions**: Write and issue prescriptions directly from the AI analysis screen without breaking focus.
- **Real-Time Appointment Management**: Approve or reject appointments with instant automated patient communication in the background.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Lucide Icons
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: MySQL (Relational Data), Neo4j (Graph Database for AI)
- **AI & RAG**: LangChain, Google Gemini API
- **Workflow Automation**: n8n (Webhook triggers, Twilio SMS, Gmail SMTP)
- **Authentication**: Firebase Auth
- **Infrastructure**: Docker & Docker Compose

---

## 🚀 Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js 20+](https://nodejs.org/)
- Google Gemini API Key
- n8n instance (Local or Cloud)

### 1. Clone the repository
```bash
git clone https://github.com/talha963/MedFlow-Clinic.git
cd MedFlow-Clinic
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Start the Application
Run the entire stack using Docker Compose:
```bash
docker-compose up -d --build
```

### 4. Access the Portals
- **Patient Booking Portal**: [http://localhost:3000](http://localhost:3000)
- **Doctor Dashboard**: [http://localhost:3000/doctor/login](http://localhost:3000/doctor/login)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ⚙️ Automated Workflows (n8n)

MedFlow heavily utilizes n8n for background automation. The JSON workflow templates are available in the `/workflows` directory (or created dynamically).

1. **Appointment Approval Flow**: `Webhook → Format Data → Twilio SMS / Gmail`
2. **Prescription Issuance Flow**: `Webhook → Generate HTML Report → Gmail SMTP`

Import these into your n8n instance and activate them to enable automatic patient communications.

---

## 🤝 Contributing

This project is actively maintained and expanding with new AI features. Contributions, issues, and feature requests are welcome!

---
*Built with ❤️ for the future of healthcare.*
