from database import SessionLocal
from models import Patient

db = SessionLocal()

# Check if patient 1 already exists
patient = db.query(Patient).filter(Patient.patient_id == 1).first()
if not patient:
    print("Seeding database with mock patient data...")
    new_patient = Patient(patient_id=1, name="John Doe", dob="1980-05-15", contact_info="john.doe@example.com")
    db.add(new_patient)
    db.commit()
    print("Patient John Doe (ID: 1) created successfully.")
else:
    print("Patient 1 already exists.")

db.close()
