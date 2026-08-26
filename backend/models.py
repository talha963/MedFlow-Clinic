from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from database import Base
import datetime

class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    dob = Column(String(50))
    contact_info = Column(String(255))
    email = Column(String(255), nullable=True)

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    role = Column(String(50))
    credentials = Column(String(255)) # Hashed password
    specialty = Column(String(255), nullable=True)
    degree = Column(String(255), nullable=True)

class Appointment(Base):
    __tablename__ = "appointments"
    appointment_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"))
    doctor_id = Column(Integer, ForeignKey("users.user_id"))
    date = Column(String(50))
    time = Column(String(50))
    status = Column(String(50))

class AuditLog(Base):
    __tablename__ = "audit_log"
    log_id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(100))
    action = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    approved_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    record_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"))
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"))
    medicines = Column(Text, nullable=True)
    tests = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)

class Prescription(Base):
    __tablename__ = "prescriptions"
    prescription_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"))
    doctor_id = Column(Integer, ForeignKey("users.user_id"))
    medication_details = Column(Text)
    instructions = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
