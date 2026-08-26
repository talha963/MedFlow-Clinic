import os
from neo4j import GraphDatabase

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "medflow_neo4j")

def seed_graph():
    print("Connecting to Neo4j...")
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    # Define our Cypher query to seed the DB
    # We will create a Patient (ID 1)
    # The Patient has a Condition: Hypertension
    # The Patient takes a Medication: Lisinopril
    # We'll create another Medication: Ibuprofen
    # And a rule: Ibuprofen CONFLICTS_WITH Hypertension
    
    delete_query = "MATCH (n) DETACH DELETE n"
    
    insert_query = """
    CREATE (p:Patient {id: 1, name: "John Doe"})
    
    // Conditions
    CREATE (c1:Condition {name: "Hypertension", severity: "Moderate", diagnosed: "2024-01-15"})
    CREATE (p)-[:HAS_CONDITION]->(c1)
    
    // Medications
    CREATE (m1:Medication {name: "Lisinopril", class: "ACE Inhibitor"})
    CREATE (p)-[:TAKES_MEDICATION {dosage: "10mg", frequency: "Daily"}]->(m1)
    
    CREATE (m2:Medication {name: "Ibuprofen", class: "NSAID"})
    CREATE (p)-[:TAKES_MEDICATION {dosage: "400mg", frequency: "As needed"}]->(m2)
    
    // Guidelines / Conflicts
    CREATE (m2)-[:CONFLICTS_WITH {reason: "NSAIDs can elevate blood pressure and reduce efficacy of antihypertensives"}]->(c1)
    CREATE (m1)-[:TREATS]->(c1)
    """
    
    with driver.session() as session:
        print("Executing seed query...")
        session.run(delete_query)
        session.run(insert_query)
        print("Neo4j database successfully seeded with patient graph!")

    driver.close()

if __name__ == "__main__":
    seed_graph()
