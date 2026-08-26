from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.nodes import (
    orchestrator_node,
    patient_agent_node,
    medical_agent_node,
    safety_agent_node,
    summarizer_node
)

def build_medflow_graph():
    # 1. Initialize the graph with our custom State
    workflow = StateGraph(AgentState)

    # 2. Add the agent nodes
    workflow.add_node("orchestrator", orchestrator_node)
    workflow.add_node("patient_agent", patient_agent_node)
    workflow.add_node("medical_agent", medical_agent_node)
    workflow.add_node("safety_agent", safety_agent_node)
    workflow.add_node("summarizer", summarizer_node)

    # 3. Define the edges (Control Flow)
    # Start -> Orchestrator
    workflow.set_entry_point("orchestrator")
    
    # For this prototype, we're building a sequential pipeline instead of full dynamic routing
    # Orchestrator -> Patient -> Medical -> Safety -> Summarizer -> END
    workflow.add_edge("orchestrator", "patient_agent")
    workflow.add_edge("patient_agent", "medical_agent")
    workflow.add_edge("medical_agent", "safety_agent")
    workflow.add_edge("safety_agent", "summarizer")
    workflow.add_edge("summarizer", END)

    # Compile the graph
    app = workflow.compile()
    return app

# Instantiate the graph
medflow_agent_app = build_medflow_graph()
