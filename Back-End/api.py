import os
from dotenv import load_dotenv
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from ingestion import ingest_pdfs
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain.memory import ConversationBufferMemory
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate
from langchain import hub
from langchain_community.vectorstores import Chroma
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

# Check if OpenAI API key is set
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable is not set")

app = FastAPI()

origins = [
    "http://localhost",  
    "http://localhost:3000",
    "https://btuchatbot.vercel.app",
    "https://btubitirmebackend.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

class QueryRequest(BaseModel):
    query: str

class CustomRetriever:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore

    def retrieve(self, query: str, k: int = 3) -> List[Dict]:
        """Retrieves relevant documents for a specific query."""
        docs = self.vectorstore.as_retriever(search_kwargs={"k": k}).get_relevant_documents(query)
        return [{
            "content": doc.page_content,
            "source": doc.metadata.get("source", "unknown"),
            "madde": doc.metadata.get("madde_number", "?")
        } for doc in docs]

def format_docs(docs: List[Dict]) -> str:
    """Converts documents into readable format."""
    return "\n\n".join(
        f"Kaynak: {doc['source']}\nMADDE: {doc['madde']}\nİçerik: {doc['content']}"
        for doc in docs
    )

@tool
def retrieve(query: str) -> str:
    """
    Used to search for relevant articles in PDFs.
    For example: Conduct research on 'requirements for establishing a student club'.
    """
    docs = retriever.retrieve(query)
    return format_docs(docs)

@tool("google_search_univ")
def google_search_univ(query: str) -> str:
    """
Uses Google Custom Search to search only pages within the btu.edu.tr domain.
query parameter: the user’s original query.
 Merges the returned results and outputs them as a single string.
 Use this tool to acces up-to-date information about the university

    """
    from googleapiclient.discovery import build

    API_KEY = os.getenv("GOOGLE_API_KEY")
    CSE_ID = os.getenv("GOOGLE_CSE_ID")

    service = build("customsearch", "v1", developerKey=API_KEY)
    try:
        results = service.cse().list(q=query, cx=CSE_ID, num=3).execute()
    except Exception as error:
        return f"Google Custom Search Error: {error}"
    if "items" not in results:
        return "Üniversite sitesinde ilgili sonuc bulunamadi"

    snippets= []
    for item in results["items"]:
        title= item.get("title", "")
        link = item.get("link", "")
        snippet = item.get("snippet", "")
        snippets.append(f"{title}\n{link}\n{snippet}")
    return "\n\n".join(snippets)

def setup_agent(vectorstore, memory):
    tools = [retrieve, google_search_univ]
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.7,
        api_key=os.getenv("OPENAI_API_KEY")
    )

    custom_prompt = ChatPromptTemplate.from_messages([ 
        SystemMessagePromptTemplate.from_template(
            """
         You are an assistant for Bursa Technical University and you use a ReAct style approach.
Your task is to answer questions using only the retrieved document excerpts provided.

You have access to the following tool(s): {tools}.
The names of the tools are: {tool_names}.
Action: retrieve
Action Input: "the query"
Observation: (the result)

Follow these steps:
1. Start with "Thought: ..." for reasoning,
2. If needed, call the tool with EXACT format:
   Action: retrieve
   Action Input: "sorgu"
3. Then you'll get Observation: ...
4. You can do more Thought: or produce final with "Final Answer: ..."
In the final answer, you MUST reference "Kaynak: <pdf>, MADDE: <...>" if used.


IMPORTANT:
- You must always use the document_retriever tool when needed.
- If the question has multiple parts, break it down and use the tool for each part. 
- In your final answer, you MUST include at least one reference line in the EXACT format:
    "Kaynak: [PDF adı], MADDE: [madde numarası]"
- If you require additional information, output a command in the exact format: [RETRIEVE: your additional query]. If the question requires information from multiple topics, output multiple retrieval commands.
- Do not invent any information that is not present in the retrieved documents.
- End your chain-of-thought with "Final Answer:" followed by your final answer.
- Follow Turkish grammar rules strictly.
- If no further document retrieval is required, end directly with "Final Answer:" without adding a new Thought/Action.
- retrieve: used to locate an article number and its content inside PDFs.
- google_search_univ: used to search Google but restricted only to our university’s sites (www.btu.edu.tr).Use this tool to access up-to-date information about the university.
- If the LLM realizes that the question cannot be answered from the PDFs, it must use google_search_univ to access up-to-date information about university.

- If neither tool (retrieve ve google_search_univ) can provide an answer, finish with “Final Answer: Bu konuda elimde bilgi yok.”

- Never add a new “Thought:” or “Action:” after the Final Answer.

*******

Now let's begin.
                """
        ),
        HumanMessagePromptTemplate.from_template("""
         Previous Conversation:
    {chat_history}

    New Question:
    {input}

    Agent Thought (Scratchpad):
    Thought:  # Thinking starts here
    {agent_scratchpad}
        """)
    ])

    agent = create_react_agent(llm, tools, custom_prompt)

    return AgentExecutor(
        agent=agent,
        tools=tools,
        memory=memory,
        verbose=False,
        handle_parsing_errors=True,
        max_iterations=15,
        max_execution_time=60
    )

@app.on_event("startup")
async def startup():
    vectorstore = ingest_pdfs()
    global retriever
    retriever = CustomRetriever(vectorstore)

    global memory
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        input_key="input",
        output_key="output"
    )

    global agent_executor
    agent_executor = setup_agent(vectorstore, memory)

@app.post("/query")
async def query(request: QueryRequest):
    try:
        query = request.query
        response = agent_executor.invoke({
            "input": query,
            "chat_history": memory.chat_memory.messages
        })
        return {"response": response["output"]}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "BTU Mevzuat Asistanına Hoşgeldiniz!"}

class TitleRequest(BaseModel):
    messages: list[str]  # Son 2-3 kullanıcı mesajı
from fastapi import Response

@app.head("/")
async def root_head():
    return Response(status_code=200)

@app.post("/generate_title")
async def generate_title(request: TitleRequest):
    try:
        # Mesajları birleştirip başlık için prompt hazırla
        prompt = (
            "Aşağıdaki sohbet mesajlarına uygun, kısa ve anlamlı bir sohbet başlığı üret. "
            "Başlık 5 kelimeyi geçmesin ve konuya odaklı olsun. Sadece başlığı döndür.\n\n"
            "Mesajlar:\n" + "\n".join(request.messages)
        )
        api_key = os.getenv("OPENAI_API_KEY")
        llm = ChatOpenAI(
            model="gpt-4o-mini",  # Mevcut modelin aynısı kullanılıyor
            temperature=0.5,
            api_key=api_key
        )
        response = llm([HumanMessage(content=prompt)])
        title = response.content
        return {"title": title}
    except Exception as e:
        print(f"Başlık üretme hatası: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 

if __name__ == "__main__":
    import uvicorn
    import sys
    
    # Get port from environment variable or use default
    port = int(os.getenv("PORT", 8000))
    
    # Print port for debugging
    print(f"Starting server on port: {port}")
    
    # Run the server with explicit configuration
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=False,
        workers=1,
        loop="asyncio"
    )

