import os
import time
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

_vectorstore = None

def init_rag_pipeline():
    global _vectorstore
    
    pinecone_api_key = os.environ.get("PINECONE_API_KEY")
    if not pinecone_api_key:
        print("WARNING: PINECONE_API_KEY is missing! RAG cannot initialize.")
        return
        
    index_name = "medflow-rag-v2"
    
    # Initialize Pinecone Client
    pc = Pinecone(api_key=pinecone_api_key)
    
    # Create index if it doesn't exist
    if index_name not in pc.list_indexes().names():
        print(f"Creating Pinecone index '{index_name}'...")
        pc.create_index(
            name=index_name,
            dimension=3072, # Gemini-embedding-2 dimension
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
        print("Waiting for Pinecone index to initialize...")
        while not pc.describe_index(index_name).status['ready']:
            time.sleep(2)
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, "data", "medflow_docs.txt")
    loader = TextLoader(file_path)
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_documents(docs)

    print("Upserting documents to Pinecone (this acts as loading if already exists)...")
    _vectorstore = PineconeVectorStore.from_documents(splits, embeddings, index_name=index_name)
    print("Pinecone Vector Store initialized!")

def ask_chatbot(user_message: str, chat_history: list) -> str:
    global _vectorstore
    if _vectorstore is None:
        init_rag_pipeline()
        
    if _vectorstore is None:
        return "Sorry, the Knowledge Base is not available."
        
    # 1. Retrieve raw documents
    results = _vectorstore.similarity_search(user_message, k=3)
    context_text = "\n\n".join([doc.page_content for doc in results])
    
    # 2. Generate prompt
    system_prompt = (
        "You are the MedFlow Clinic AI Assistant. "
        "Use the following pieces of retrieved context to answer the user's question. "
        "If you don't know the answer based on the context, say that you don't know. "
        "Keep the answer concise and helpful.\n\n"
        f"CONTEXT:\n{context_text}"
    )
    
    # 3. Call LLM directly
    llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0.3)
    
    messages = [
        ("system", system_prompt),
        ("human", user_message)
    ]
    
    response = llm.invoke(messages)
    content = response.content
    
    if isinstance(content, str):
        return content
    elif isinstance(content, list) and len(content) > 0:
        # Sometimes returns a list of blocks
        first_block = content[0]
        if isinstance(first_block, dict) and "text" in first_block:
            return first_block["text"]
        return str(first_block)
    elif isinstance(content, dict) and "text" in content:
        return content["text"]
    
    return str(content)
