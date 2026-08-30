from database import SessionLocal, engine
import models

def seed_data():
    db = SessionLocal()
    
    # We no longer hard-code doctors here. Only Firebase-registered doctors (auto-synced) will exist.
    # To keep the dummy script working for patients/appointments, we will grab the FIRST available doctor,
    # or create a temporary "System" doctor if none exist yet.
    doctor = db.query(models.User).filter(models.User.role == "Doctor").first()
    if not doctor:
        print("ERROR: Cannot seed dummy data because no Firebase doctors exist in the database.")
        print("Please log into the Doctor Dashboard first to auto-sync a real account.")
        db.close()
        return
        
    doc_id = doctor.user_id
        
    # 2. Create Dummy Patients
    patients_data = [
        {"name": "Ali Khan", "dob": "1990-01-01", "contact": "555-0001"},
        {"name": "Sarah Smith", "dob": "1985-05-12", "contact": "555-0002"},
        {"name": "Ahmed Ali", "dob": "1978-11-23", "contact": "555-0003"}
    ]
    
    patients = []
    for p in patients_data:
        existing = db.query(models.Patient).filter(models.Patient.name == p["name"]).first()
        if not existing:
            new_p = models.Patient(name=p["name"], dob=p["dob"], contact_info=p["contact"])
            db.add(new_p)
            db.commit()
            db.refresh(new_p)
            patients.append(new_p)
        else:
            patients.append(existing)
            
    # 3. Create Appointments & Medical Records
    for i, p in enumerate(patients):
        appt = db.query(models.Appointment).filter(models.Appointment.patient_id == p.patient_id).first()
        if not appt:
            appt = models.Appointment(
                patient_id=p.patient_id,
                doctor_id=doc_id,
                date="2026-08-25",
                time=f"10:0{i} AM",
                status="Pending"
            )
            db.add(appt)
            db.commit()
            db.refresh(appt)
            
            # Add Medical Record
            record = models.MedicalRecord(
                patient_id=p.patient_id,
                appointment_id=appt.appointment_id,
                symptoms=f"Headache and fever for patient {p.name}",
                medicines="Paracetamol 500mg",
                tests="None recently"
            )
            db.add(record)
            db.commit()
            
    print("Dummy data seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_data()
