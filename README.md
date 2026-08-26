# 🏥 MedFlow Clinic AI

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=24&pause=1000&color=2563EB&center=true&vCenter=true&width=600&height=50&lines=AI-Powered+Clinical+Synthesis;Automated+Revenue+Cycle+Management;Seamless+Healthcare+Experience" alt="Typing SVG" />
</p>

MedFlow Clinic transforms the traditional patient portal into a smart, efficient, and deeply integrated experience. By combining modern web technologies with powerful AI and automated workflows, it provides a seamless healthcare journey from initial booking to digital billing.

---

## ✨ Key Features

### 🧑‍⚕️ For Patients
* **Modern Booking Portal**: Clean, intuitive interface to book appointments, select time slots, and securely submit symptoms.
* **Automated Confirmations**: Instant HTML emails the second a doctor approves an appointment.
* **Digital Prescriptions**: Official, elegantly formatted medical prescriptions sent directly to the inbox.
* **Online Billing**: Securely pay clinic bills online via automated Safepay checkout links.

### 👨‍⚕️ For Doctors
* **AI Clinical Synthesis**: Powered by GraphRAG and Gemini AI, instantly query patient histories and synthesize comprehensive clinical reports.
* **One-Click Prescriptions**: Write and issue prescriptions directly from the AI analysis screen.
* **Revenue Cycle Management**: Generate bills and track financial performance in a beautiful, real-time dashboard.

---

## 🛠️ Technology Stack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Neo4j-018bff?style=for-the-badge&logo=neo4j&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Docker & Docker Compose** installed.
* **API Keys**: Google Gemini API Key & Safepay Sandbox Keys.

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_key
SAFEPAY_PUBLIC_KEY=pub_...
SAFEPAY_SECRET_KEY=sec_...
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

MedFlow relies on n8n for background automation. The system automatically triggers webhooks for events like:
1. **Appointment Approval**: Extracts patient data and routes a confirmation email.
2. **Prescription Issuance**: Generates and emails a beautiful HTML digital prescription.
3. **Medical Billing**: Emails Safepay payment links for automated revenue collection.

---
<p align="center">
  <em>Built with ❤️ for the future of healthcare.</em>
</p>
