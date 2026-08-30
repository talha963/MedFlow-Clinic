from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class DoctorCreate(BaseModel):
    name: str
    specialty: str
    degree: str
    email: str # Mapped to credentials or stored somewhere if needed
    
class DoctorResponse(BaseModel):
    user_id: int
    name: str
    specialty: Optional[str] = None
    degree: Optional[str] = None

    class Config:
        from_attributes = True

# --- Patient Schemas ---
class PatientBase(BaseModel):
    name: str
    dob: str
    contact_info: str
    email: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    patient_id: int

    class Config:
        from_attributes = True

# --- Medical Record Schemas ---
class MedicalRecordBase(BaseModel):
    medicines: Optional[str] = None
    tests: Optional[str] = None
    symptoms: Optional[str] = None

# --- Appointment Schemas ---
class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    date: str
    time: str
    status: str
    requested_as_any: Optional[bool] = False

class AppointmentCreate(AppointmentBase):
    medical_record: Optional[MedicalRecordBase] = None

class AppointmentResponse(AppointmentBase):
    appointment_id: int

    class Config:
        from_attributes = True

class ApprovalRequest(BaseModel):
    approved_by: int

class AppointmentStatusUpdate(BaseModel):
    status: str

# --- Chatbot Schemas ---
class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# --- Prescription Schemas ---
class PrescriptionCreate(BaseModel):
    patient_id: int
    doctor_email: str
    medication_details: str
    instructions: str

class PrescriptionResponse(BaseModel):
    prescription_id: int
    patient_id: int
    doctor_id: int
    medication_details: str
    instructions: str
    timestamp: datetime

    class Config:
        from_attributes = True

class BillingBase(BaseModel):
    amount: float
    status: str = "Pending"
    icd10_codes: Optional[str] = None
    cpt_codes: Optional[str] = None
    stripe_payment_link: Optional[str] = None

class BillingCreate(BillingBase):
    appointment_id: int
    patient_id: int

class BillingResponse(BillingBase):
    billing_id: int
    appointment_id: int
    patient_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
