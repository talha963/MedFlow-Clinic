from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

from fastapi.middleware.cors import CORSMiddleware

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedFlow AI Backend API")

# Add CORS Middleware to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to MedFlow AI API"}

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Very basic placeholder authentication for now
    user = db.query(models.User).filter(models.User.name == request.username).first()
    if not user or user.credentials != request.password: # Note: Real app should hash passwords!
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"access_token": "fake-jwt-token-for-now", "token_type": "bearer"}

@app.get("/api/doctors", response_model=List[schemas.DoctorResponse])
def get_doctors(db: Session = Depends(get_db)):
    # Return all users with role Doctor
    return db.query(models.User).filter(models.User.role == "Doctor").all()

@app.post("/api/doctors", response_model=schemas.DoctorResponse)
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db)):
    db_user = models.User(
        name=doctor.name,
        role="Doctor",
        credentials=doctor.email, # Storing email here as mock auth reference
        specialty=doctor.specialty,
        degree=doctor.degree
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/patients/{patient_id}", response_model=schemas.PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.get("/api/patients", response_model=List[schemas.PatientResponse])
def search_patients(search: str = "", db: Session = Depends(get_db)):
    query = db.query(models.Patient)
    if search:
        query = query.filter(models.Patient.name.ilike(f"%{search}%"))
    return query.limit(10).all()

@app.post("/api/patients", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

from typing import List, Optional

@app.get("/api/appointments", response_model=List[schemas.AppointmentResponse])
def get_appointments(doctor_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Appointment)
    if doctor_id:
        query = query.filter(models.Appointment.doctor_id == doctor_id)
    return query.all()

@app.post("/api/appointments", response_model=schemas.AppointmentResponse)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    db_appointment = models.Appointment(
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        date=appointment.date,
        time=appointment.time,
        status=appointment.status
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    if appointment.medical_record and (appointment.medical_record.medicines or appointment.medical_record.tests or appointment.medical_record.symptoms):
        db_record = models.MedicalRecord(
            patient_id=appointment.patient_id,
            appointment_id=db_appointment.appointment_id,
            medicines=appointment.medical_record.medicines,
            tests=appointment.medical_record.tests,
            symptoms=appointment.medical_record.symptoms
        )
        db.add(db_record)
        db.commit()
        
    return db_appointment

@app.put("/api/appointments/{appointment_id}/status", response_model=schemas.AppointmentResponse)
def update_appointment_status(appointment_id: int, status_update: schemas.AppointmentStatusUpdate, db: Session = Depends(get_db)):
    db_appointment = db.query(models.Appointment).filter(models.Appointment.appointment_id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db_appointment.status = status_update.status
    db.commit()
    db.refresh(db_appointment)

    # TRIGGER n8n WEBHOOK FOR SMS when doctor approves (frontend sends "Confirmed")
    if status_update.status == "Confirmed":
        patient = db.query(models.Patient).filter(models.Patient.patient_id == db_appointment.patient_id).first()
        if patient:
            webhook_url = "http://n8n:5678/webhook/appointment-approved"
            payload = {
                "patient_name": patient.name,
                "patient_email": patient.email or "",
                "patient_phone": patient.contact_info,
                "appointment_date": db_appointment.date,
                "appointment_time": db_appointment.time
            }
            try:
                import requests
                requests.post(webhook_url, json=payload, timeout=2)
            except Exception as e:
                print(f"Failed to trigger n8n webhook: {e}")

    return db_appointment

@app.post("/api/prescriptions", response_model=schemas.PrescriptionResponse)
def create_prescription(prescription: schemas.PrescriptionCreate, db: Session = Depends(get_db)):
    # Look up doctor_id by email
    doctor = db.query(models.User).filter(models.User.credentials == prescription.doctor_email).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    db_prescription = models.Prescription(
        patient_id=prescription.patient_id,
        doctor_id=doctor.user_id,
        medication_details=prescription.medication_details,
        instructions=prescription.instructions
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)

    # TRIGGER n8n WEBHOOK to send prescription report email
    patient = db.query(models.Patient).filter(models.Patient.patient_id == prescription.patient_id).first()
    if patient and patient.email:
        try:
            import requests as req
            import datetime
            req.post(
                "http://host.docker.internal:5678/webhook/prescription-issued",
                json={
                    "patient_name": patient.name,
                    "patient_email": patient.email,
                    "patient_phone": patient.contact_info,
                    "doctor_name": doctor.name,
                    "doctor_specialty": doctor.specialty or "General Physician",
                    "medication_details": prescription.medication_details,
                    "instructions": prescription.instructions,
                    "issued_date": datetime.date.today().strftime("%B %d, %Y")
                },
                timeout=3
            )
        except Exception as e:
            print(f"Prescription webhook failed: {e}")

    return db_prescription

@app.get("/api/appointments", response_model=List[schemas.AppointmentResponse])
def get_appointments(doctor_id: int, db: Session = Depends(get_db)):
    appointments = db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor_id).all()
    return appointments

@app.get("/api/appointments/{appointment_id}/record")
def get_appointment_record(appointment_id: int, db: Session = Depends(get_db)):
    record = db.query(models.MedicalRecord).filter(models.MedicalRecord.appointment_id == appointment_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="No medical record attached to this appointment")
    return {
        "symptoms": record.symptoms,
        "medicines": record.medicines,
        "tests": record.tests
    }

from langchain_core.messages import HumanMessage
from agents.graph import medflow_agent_app

@app.get("/api/users/profile")
def get_user_profile(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.credentials == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"name": user.name, "role": user.role, "specialty": user.specialty, "user_id": user.user_id}

@app.get("/api/patients/{patient_id}/timeline")
def get_patient_timeline(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    appointments = db.query(models.Appointment).filter(models.Appointment.patient_id == patient_id).order_by(models.Appointment.date.desc()).all()
    
    timeline = []
    for appt in appointments:
        doctor = db.query(models.User).filter(models.User.user_id == appt.doctor_id).first()
        doc_name = doctor.name if doctor else "Unknown Doctor"
        
        bill = db.query(models.BillingRecord).filter(models.BillingRecord.appointment_id == appt.appointment_id).first()
        record = db.query(models.MedicalRecord).filter(models.MedicalRecord.appointment_id == appt.appointment_id).first()
        
        symptoms = "Routine Checkup"
        if record and record.symptoms:
            symptoms = record.symptoms
            
        timeline.append({
            "id": appt.appointment_id,
            "date": appt.date,
            "type": "Consultation",
            "title": f"Visit with {doc_name}",
            "description": symptoms,
            "status": appt.status,
            "bill_amount": bill.amount if bill else None,
            "bill_status": bill.status if bill else None
        })
        
    return timeline

@app.get("/api/patients/{patient_id}/summary")
def get_patient_summary(patient_id: int, db: Session = Depends(get_db)):
    # 1. Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    # 2. Prepare the initial state for the LangGraph agents
    initial_state = {
        "messages": [HumanMessage(content=f"Summarize history and recommendations for patient {patient_id}")],
        "patient_id": patient_id,
        "current_agent": "orchestrator",
        "patient_data": {},
        "medical_data": {},
        "safety_approval": False,
        "summary": ""
    }
    
    # 3. Execute the LangGraph workflow
    result = medflow_agent_app.invoke(initial_state)
    
    # 4. Return the summary generated by the graph
    return {"patient_id": patient_id, "summary": result["summary"]}

import os
from google import genai
from rag_chatbot import ask_chatbot

@app.post("/api/chat")
def chat_with_bot(request: schemas.ChatRequest):
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        return {"reply": "I'm sorry, my AI brain is currently disconnected (GEMINI_API_KEY missing). Please ask the administrator to set up the API key!"}

    try:
        # The rag_chatbot uses langchain_google_genai which relies on the GOOGLE_API_KEY environment variable.
        # We'll set it here just in case.
        os.environ["GOOGLE_API_KEY"] = gemini_api_key
        
        if not request.messages:
            return {"reply": "Please provide a message."}
            
        current_msg = request.messages[-1].content
        
        # Call the true vector RAG pipeline
        reply = ask_chatbot(current_msg, request.messages[:-1])
        
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"An error occurred: {str(e)}"}

from doctor_chat import handle_doctor_chat

class DoctorChatRequest(schemas.BaseModel):
    message: str

@app.post("/api/doctor/chat")
def doctor_chat_endpoint(request: DoctorChatRequest):
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        return {"type": "text", "message": "GEMINI_API_KEY is missing."}
        
    try:
        os.environ["GOOGLE_API_KEY"] = gemini_api_key
        return handle_doctor_chat(request.message)
    except Exception as e:
        return {"type": "text", "message": f"An error occurred: {str(e)}"}

# --- BILLING ENDPOINTS (SAFEPAY PAKISTAN) ---

@app.get("/api/patients/{patient_id}/suggest-codes")
def suggest_medical_codes(patient_id: int, db: Session = Depends(get_db)):
    import json
    # Removed deprecated import
    import os
    
    patient = db.query(models.Patient).filter(models.Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    appointment = db.query(models.Appointment).filter(models.Appointment.patient_id == patient_id).order_by(models.Appointment.date.desc()).first()
    
    medical_context = "General Consultation"
    if appointment:
        record = db.query(models.MedicalRecord).filter(models.MedicalRecord.appointment_id == appointment.appointment_id).first()
        if record:
            medical_context = json.dumps({"symptoms": record.symptoms, "medicines": record.medicines, "tests": record.tests})

    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        return {"icd10": "E03.9", "cpt": "99214"}

    try:
        client = genai.Client(api_key=gemini_api_key)
        
        prompt = f"""
        You are an expert medical billing coder. 
        Based on the following patient medical record/symptoms:
        {medical_context}
        
        Suggest exactly ONE primary ICD-10 diagnosis code and ONE CPT procedure code.
        Respond ONLY with a valid JSON object in this exact format, with no markdown:
        {{"icd10": "CODE", "cpt": "CODE"}}
        """
        
        response = client.models.generate_content(
            model='gemini-flash-lite-latest',
            contents=prompt,
        )
        
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text)
    except Exception as e:
        print("AI Coding Error:", e)
        return {"icd10": "E03.9", "cpt": "99214"}


@app.post("/api/billing", response_model=schemas.BillingResponse)
def create_billing(billing: schemas.BillingCreate, db: Session = Depends(get_db)):
    import os
    import requests

    safepay_public = os.environ.get("SAFEPAY_PUBLIC_KEY")
    checkout_url = ""

    # Generate Real Safepay Tracker
    if safepay_public:
        try:
            res = requests.post(
                "https://sandbox.api.getsafepay.com/order/v1/init",
                json={
                    "client": safepay_public,
                    "amount": float(billing.amount),
                    "currency": "PKR",
                    "environment": "sandbox"
                },
                timeout=5
            )
            if res.status_code == 200:
                data = res.json()
                token = data.get("data", {}).get("token")
                if token:
                    checkout_url = f"https://sandbox.api.getsafepay.com/checkout/pay?env=sandbox&beacon={token}&source=custom"
        except Exception as e:
            print("Safepay API error:", e)

    # Fallback if API fails or key is missing
    if not checkout_url:
        checkout_url = f"https://sandbox.api.getsafepay.com/checkout/pay?amount={billing.amount}&currency=PKR&env=sandbox"
    
    db_bill = models.BillingRecord(
        appointment_id=billing.appointment_id,
        patient_id=billing.patient_id,
        amount=billing.amount,
        status="Pending",
        icd10_codes=billing.icd10_codes,
        cpt_codes=billing.cpt_codes,
        stripe_payment_link=checkout_url # Now storing the real Safepay Tracker link
    )
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)

    # --- TRIGGER N8N AUTOMATED INVOICE EMAIL ---
    try:
        patient = db.query(models.Patient).filter(models.Patient.patient_id == billing.patient_id).first()
        if patient and getattr(patient, "email", None):
            webhook_url = "http://n8n:5678/webhook/billing-issued"
            payload = {
                "patient_name": patient.name,
                "patient_email": patient.email,
                "patient_phone": patient.contact_info,
                "amount": billing.amount,
                "payment_link": checkout_url,
                "billing_id": db_bill.billing_id
            }
            requests.post(webhook_url, json=payload, timeout=3)
    except Exception as e:
        print(f"Failed to trigger billing webhook: {e}")

    return db_bill

@app.get("/api/billing/stats")
def get_billing_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    
    total_revenue = db.query(func.sum(models.BillingRecord.amount)).filter(models.BillingRecord.status == "Paid").scalar() or 0.0
    pending_revenue = db.query(func.sum(models.BillingRecord.amount)).filter(models.BillingRecord.status == "Pending").scalar() or 0.0
    
    total_invoices = db.query(models.BillingRecord).count()
    paid_invoices = db.query(models.BillingRecord).filter(models.BillingRecord.status == "Paid").count()
    
    # Get 10 most recent invoices for the table
    recent_invoices = db.query(models.BillingRecord).order_by(models.BillingRecord.timestamp.desc()).limit(10).all()
    
    # Format the recent invoices to include patient names
    formatted_invoices = []
    for inv in recent_invoices:
        patient = db.query(models.Patient).filter(models.Patient.patient_id == inv.patient_id).first()
        formatted_invoices.append({
            "id": inv.billing_id,
            "patient_name": patient.name if patient else "Unknown",
            "amount": inv.amount,
            "status": inv.status,
            "date": inv.timestamp.strftime("%Y-%m-%d"),
            "stripe_payment_link": inv.stripe_payment_link
        })
        
    return {
        "revenue_collected": total_revenue,
        "revenue_pending": pending_revenue,
        "total_invoices": total_invoices,
        "paid_invoices": paid_invoices,
        "recent": formatted_invoices
    }


