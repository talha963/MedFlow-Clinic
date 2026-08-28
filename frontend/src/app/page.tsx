"use client";
import { useState, useEffect } from "react";
import { Calendar, User, Phone, CheckCircle2, ArrowRight, ShieldCheck, Clock, Award, Activity, Heart, Brain, Shield, Star, ChevronRight, Microscope } from "lucide-react";
import ChatWidget from "../components/ChatWidget";

export default function PatientPortal() {
  const [formData, setFormData] = useState({ name: "", dob: "", phone: "", email: "", date: "", time: "", doctor_id: "", medicines: "", tests: "", symptoms: "" });
  const [submitted, setSubmitted] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctors`)
      .then(res => res.json())
      .then(data => {
        setAvailableDoctors(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, doctor_id: data[0].user_id.toString() }));
        }
      })
      .catch(err => console.error("Failed to fetch doctors:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patientRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formData.name, dob: formData.dob, contact_info: formData.phone, email: formData.email })
    });
    let newPatientId = 1;
    if (patientRes.ok) {
      const patientData = await patientRes.json();
      newPatientId = patientData.patient_id;
    }
    const hasMedicalRecord = formData.medicines || formData.tests || formData.symptoms;
    const medical_record = hasMedicalRecord ? {
      medicines: formData.medicines,
      tests: formData.tests,
      symptoms: formData.symptoms
    } : null;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: newPatientId,
        doctor_id: parseInt(formData.doctor_id),
        date: formData.date,
        time: formData.time,
        status: "Pending",
        medical_record: medical_record
      })
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500 selection:text-white flex flex-col">

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">MedFlow<span className="text-blue-500">Clinic</span></span>
          </div>
          <div className="hidden md:flex gap-8 font-bold text-slate-600 text-sm">
            <a href="#about" className="hover:text-blue-600 transition-colors">About Us</a>
            <a href="#services" className="hover:text-blue-600 transition-colors">Our Services</a>
            <a href="#facilities" className="hover:text-blue-600 transition-colors">Facilities</a>
            <a href="/doctor/login" className="hover:text-blue-600 transition-colors">Doctor Portal</a>
          </div>
          <div>
            <a href="#booking" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-full transition-colors">
              Book Appointment
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── HERO ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Accepting New Patients
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Next-Generation Healthcare, <br/>
                <span className="text-blue-600">Powered by AI.</span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
                Experience medical care where human expertise meets artificial intelligence. We ensure faster diagnoses, safer prescriptions, and zero waiting room time.
              </p>
              <div className="flex gap-4">
                <a href="#booking" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                  Get Started <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#about" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all">
                  Learn More
                </a>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-teal-100 rounded-3xl transform rotate-3 scale-105 opacity-50 filter blur-xl"></div>
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&h=1000&auto=format&fit=crop"
                alt="Doctor Consultation"
                className="relative rounded-3xl shadow-2xl border border-white object-cover h-[600px] w-full max-w-md mx-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full"><Award className="w-8 h-8" /></div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Top Rated</p>
                  <p className="text-xl font-black text-slate-800">#1 Clinic 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
              <div className="text-center px-4">
                <p className="text-3xl font-black text-blue-600 mb-1">10k+</p>
                <p className="text-sm font-bold text-slate-500 uppercase">Patients Served</p>
              </div>
              <div className="text-center px-4">
                <p className="text-3xl font-black text-blue-600 mb-1">50+</p>
                <p className="text-sm font-bold text-slate-500 uppercase">Specialists</p>
              </div>
              <div className="text-center px-4">
                <p className="text-3xl font-black text-blue-600 mb-1">24/7</p>
                <p className="text-sm font-bold text-slate-500 uppercase">AI Support</p>
              </div>
              <div className="text-center px-4">
                <p className="text-3xl font-black text-emerald-500 mb-1">100%</p>
                <p className="text-sm font-bold text-slate-500 uppercase">Safe Prescriptions</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ABOUT / MISSION ── */}
        <div id="about" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Intro headline */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-widest rounded-full mb-4">Who We Are</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Reimagining Healthcare from the Ground Up</h2>
              <p className="text-lg text-slate-500 leading-relaxed">MedFlow Clinic was built on a single belief — that every patient deserves intelligent, compassionate, and frictionless care. We bridge the gap between cutting-edge AI and the irreplaceable human touch of our world-class medical team.</p>
            </div>

            {/* Mission / Vision two-column */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop"
                  alt="MedFlow team collaborating"
                  className="rounded-3xl shadow-xl object-cover h-[460px] w-full"
                />
                <div className="absolute -top-6 -right-6 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-lg">
                  <p className="text-3xl font-black">15+</p>
                  <p className="text-sm font-bold text-blue-200">Years of Excellence</p>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-2"><Heart className="w-6 h-6 text-red-500" /> Our Mission</h3>
                  <p className="text-slate-600 leading-relaxed">To deliver personalized, evidence-based medical care powered by AI intelligence — reducing wait times, eliminating prescription errors, and empowering patients with real-time health insights.</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-2"><Brain className="w-6 h-6 text-blue-500" /> Our Vision</h3>
                  <p className="text-slate-600 leading-relaxed">A world where every patient — regardless of geography or background — has access to the same high-quality diagnostic accuracy and specialist-level care that was once only available to a privileged few.</p>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center gap-2"><Shield className="w-6 h-6 text-emerald-500" /> Our Promise</h3>
                  <p className="text-slate-600 leading-relaxed">Every prescription is AI-validated. Every diagnosis is specialist-reviewed. Every interaction is private and protected. We hold ourselves to the highest clinical and ethical standards.</p>
                </div>
              </div>
            </div>

            {/* Core Values cards */}
            <div id="services" className="grid md:grid-cols-3 gap-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3">AI-Powered Diagnostics</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Our graph-based AI synthesises your complete medical history, flags drug interactions, and surfaces early warning signs — in seconds, not days.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3">Safe Prescription Engine</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Every medication is cross-checked against allergies, current treatments and clinical guidelines before a prescription is ever issued to you.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-5">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3">Seamless Patient Experience</h4>
                <p className="text-slate-500 text-sm leading-relaxed">From booking to follow-up, our platform eliminates paperwork, automates notifications, and keeps you informed at every step of your care journey.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FACILITIES ── */}
        <div id="facilities" className="bg-white border-t border-slate-200 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-full mb-4">Our Facilities</span>
              <h2 className="text-4xl font-black text-slate-900 mb-4">Explore Our World-Class Spaces</h2>
              <p className="text-lg text-slate-600">We combine the latest clinical advancements with cutting-edge artificial intelligence to deliver care that is truly tailored to you.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-50 rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-shadow group">
                <div className="overflow-hidden h-52">
                  <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop" alt="Modern Clinic Lab" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">State-of-the-Art Labs</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Our diagnostic labs feature the most advanced medical technology available — ensuring precise, rapid, and accurate test results every time.</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-shadow group">
                <div className="overflow-hidden h-52">
                  <img src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=600&auto=format&fit=crop" alt="Doctor consulting patient" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Compassionate Consultation Rooms</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Designed for comfort and privacy — our AI handles the paperwork, freeing our doctors to focus entirely on listening to you.</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-shadow group">
                <div className="overflow-hidden h-52">
                  <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=600&auto=format&fit=crop" alt="Medical data analysis" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Data-Driven Precision Care</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">By mapping your complete health history in a knowledge graph, we proactively flag potential issues before they become serious problems.</p>
                </div>
              </div>
            </div>

            {/* Wide banner image */}
            <div className="mt-12 relative rounded-3xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=1400&auto=format&fit=crop"
                alt="MedFlow Clinic interior"
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex items-center px-12">
                <div className="max-w-md text-white">
                  <h3 className="text-3xl font-black mb-3">Built for the Future of Medicine</h3>
                  <p className="text-blue-200 leading-relaxed">Every corner of MedFlow Clinic is designed with one goal in mind — getting you healthier, faster, and keeping you that way.</p>
                  <a href="#booking" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                    Book Your Visit <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOOKING FORM (at the bottom) ── */}
        <div id="booking" className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-widest rounded-full mb-4">Book an Appointment</span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">Your Health Cannot Wait.<br/>Neither Should You.</h2>
              <p className="text-slate-500 text-lg">Skip the queue. Use our intelligent scheduling system to instantly secure your slot with a top-rated specialist.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid lg:grid-cols-5">
              {/* Info Side */}
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 to-blue-800 text-white p-12 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Calendar className="w-48 h-48" /></div>
                <div className="relative z-10 space-y-6">
                  <h3 className="text-3xl font-black">Schedule Your Visit</h3>
                  <p className="text-blue-200 text-lg leading-relaxed">
                    Fill out the form to request an appointment. Our intelligent scheduling system will automatically confirm your time slot and notify the specialist.
                  </p>
                </div>
                <div className="relative z-10 space-y-6 mt-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"><Clock className="w-6 h-6" /></div>
                    <div>
                      <p className="font-bold">Opening Hours</p>
                      <p className="text-blue-200">Mon – Fri, 8:00 AM – 8:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"><Phone className="w-6 h-6" /></div>
                    <div>
                      <p className="font-bold">Emergency Contact</p>
                      <p className="text-blue-200">+1 (800) MED-FLOW</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"><ShieldCheck className="w-6 h-6" /></div>
                    <div>
                      <p className="font-bold">AI Safety Verified</p>
                      <p className="text-blue-200">Every appointment is AI-reviewed</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Form Side */}
              <div className="lg:col-span-3 p-12 bg-white">
                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">Request Received!</h3>
                    <p className="text-lg text-slate-600 max-w-md">Your appointment request has been submitted. We will contact you shortly to confirm.</p>
                    <button onClick={() => setSubmitted(false)} className="px-6 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition-colors">Book Another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input required type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="John Doe" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input required type="tel" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="(555) 000-0000" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Email Address <span className="text-blue-500">(Confirmation will be sent here)</span></label>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <input required type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="patient@example.com" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Date of Birth</label>
                      <input required type="date" value={formData.dob} onChange={(e)=>setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Preferred Date</label>
                        <input required type="date" value={formData.date} onChange={(e)=>setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Preferred Time</label>
                        <input required type="time" value={formData.time} onChange={(e)=>setFormData({...formData, time: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Select Specialist</label>
                      <select value={formData.doctor_id} onChange={(e)=>setFormData({...formData, doctor_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                        {availableDoctors.map(doc => (
                          <option key={doc.user_id} value={doc.user_id}>{doc.name}{doc.specialty ? ` (${doc.specialty})` : ""}</option>
                        ))}
                      </select>
                    </div>
                    <div className="pt-4 border-t border-slate-200 mt-6">
                      <h4 className="text-md font-bold text-slate-800 mb-2">Medical History (Optional)</h4>
                      <p className="text-xs text-slate-500 mb-4">Provide any current medications, past tests, or symptoms to help the doctor prepare for your visit.</p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Symptoms</label>
                          <textarea value={formData.symptoms} onChange={(e)=>setFormData({...formData, symptoms: e.target.value})} rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Briefly describe your symptoms..."></textarea>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Current Medicines</label>
                          <textarea value={formData.medicines} onChange={(e)=>setFormData({...formData, medicines: e.target.value})} rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="List any medications you are currently taking..."></textarea>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Previous Tests</label>
                          <textarea value={formData.tests} onChange={(e)=>setFormData({...formData, tests: e.target.value})} rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Mention any recent lab work or tests..."></textarea>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4">
                      Confirm Appointment Request <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded flex items-center justify-center"><Activity className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-black text-white tracking-tight">MedFlow<span className="text-blue-500">Clinic</span></span>
            </div>
            <p className="max-w-sm text-sm">Providing advanced, AI-assisted healthcare solutions. Setting the new standard for clinical excellence and patient safety.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#facilities" className="hover:text-blue-400 transition-colors">Facilities</a></li>
              <li><a href="#booking" className="hover:text-blue-400 transition-colors">Book Online</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="/doctor/login" className="hover:text-blue-400 transition-colors">Doctor Portal</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          &copy; {new Date().getFullYear()} MedFlow Clinic AI. All rights reserved.
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}