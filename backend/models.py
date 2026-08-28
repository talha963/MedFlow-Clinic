from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    dob = Column(String(50))
    contact_info = Column(String(255))
    email = Column(String(255), nullable=True)

    # Relationships
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="patient", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    billing_records = relationship("BillingRecord", back_populates="patient", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    role = Column(String(50))
    credentials = Column(String(255)) # Hashed password
    specialty = Column(String(255), nullable=True)
    degree = Column(String(255), nullable=True)

    # Relationships
    appointments = relationship("Appointment", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")

class Appointment(Base):
    __tablename__ = "appointments"
    appointment_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"))
    doctor_id = Column(Integer, ForeignKey("users.user_id"))
    date = Column(String(50))
    time = Column(String(50))
    status = Column(String(50))

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("User", back_populates="appointments")
    medical_record = relationship("MedicalRecord", back_populates="appointment", uselist=False, cascade="all, delete-orphan")
    billing_record = relationship("BillingRecord", back_populates="appointment", uselist=False, cascade="all, delete-orphan")

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

    # Relationships
    patient = relationship("Patient", back_populates="medical_records")
    appointment = relationship("Appointment", back_populates="medical_record")

class Prescription(Base):
    __tablename__ = "prescriptions"
    prescription_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"))
    doctor_id = Column(Integer, ForeignKey("users.user_id"))
    medication_details = Column(Text)
    instructions = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("User", back_populates="prescriptions")

class BillingRecord(Base):
    __tablename__ = "billing_records"
    billing_id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"))
    patient_id = Column(Integer, ForeignKey("patients.patient_id"))
    amount = Column(Float, default=0.0)
    status = Column(String(50), default="Pending") # Pending, Paid, Overdue
    icd10_codes = Column(String(255), nullable=True) # e.g. "E03.9, J45.909"
    cpt_codes = Column(String(255), nullable=True) # e.g. "99214"
    stripe_payment_link = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="billing_records")
    appointment = relationship("Appointment", back_populates="billing_record")
