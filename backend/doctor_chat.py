import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from database import SessionLocal
import models
from neo4j_db import neo4j_conn

def handle_doctor_chat(user_message: str):
    llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0)
    
    # We ask the LLM to classify the intent and extract information.
    system_prompt = """
    You are a medical AI assistant for doctors. The doctor will ask you to find patients or ask medical questions.
    If the doctor is asking to find or open a patient's record (e.g., "give me the record of Ali", "search for John"), 
    respond with ONLY a JSON object in this exact format:
    {"action": "search_patient", "name": "Ali"}
    
    If the doctor asks a general medical question, use your knowledge to answer it.
    If the doctor asks about graph connections (e.g. "what drugs interact with X"), respond with ONLY a JSON object:
    {"action": "graph_query", "query": "..."}
    
    If it's just a general chat, respond with plain text (not JSON).
    """
    
    messages = [
        ("system", system_prompt),
        ("human", user_message)
    ]
    
    response = llm.invoke(messages)
    raw_content = response.content
    
    # Safely extract text
    if isinstance(raw_content, str):
        content_text = raw_content
    elif isinstance(raw_content, list) and len(raw_content) > 0:
        first_block = raw_content[0]
        if isinstance(first_block, dict) and "text" in first_block:
            content_text = first_block["text"]
        else:
            content_text = str(first_block)
    elif isinstance(raw_content, dict) and "text" in raw_content:
        content_text = raw_content["text"]
    else:
        content_text = str(raw_content)
        
    content_text = content_text.strip()
    
    # Clean markdown code blocks if any
    if content_text.startswith("```json"):
        content_text = content_text[7:-3].strip()
    elif content_text.startswith("```"):
        content_text = content_text[3:-3].strip()
            
    try:
        data = json.loads(content_text)
        action = data.get("action")
        
        if action == "search_patient":
            name_query = data.get("name", "")
            db = SessionLocal()
            try:
                # Search MySQL for patients matching the name
                patients = db.query(models.Patient).filter(models.Patient.name.ilike(f"%{name_query}%")).all()
                if not patients:
                    return {
                        "type": "text",
                        "message": f"I couldn't find any patients matching '{name_query}' in the database."
                    }
                
                patient_list = [
                    {"patient_id": p.patient_id, "name": p.name, "dob": p.dob}
                    for p in patients
                ]
                
                return {
                    "type": "patient_list",
                    "message": f"I found the following patients matching '{name_query}'. Please click one to view their complete GraphRAG record:",
                    "patients": patient_list
                }
            finally:
                db.close()
                
        elif action == "graph_query":
            # For future advanced GraphRAG queries directly from chat
            return {
                "type": "text",
                "message": "Graph queries directly from chat are coming soon! Please select a patient to view their GraphRAG summary."
            }
            
    except json.JSONDecodeError:
        # It's just a plain text response from the LLM
        return {
            "type": "text",
            "message": content_text
        }
    
    return {
        "type": "text",
        "message": "I didn't understand that request."
    }
