from typing import TypedDict, Annotated, Sequence, Any
import operator
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    patient_id: int
    current_agent: str
    patient_data: dict
    medical_data: dict
    safety_approval: bool
    summary: str
