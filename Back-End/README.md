# BTU-LangChain-RAG Backend - LangChain ReAct Agent Servisi

**BTU-CHATBOT: LANGCHAIN TABANLI ÇOK AJANLI RAG CHATBOTU VE DEĞERLENDİRİLMESİ** projesinin backend servisi. **LangChain ReAct agent** mimarisi kullanarak PDF dökümanlarından bilgi çeker ve **OpenAI GPT-4o-mini** ile chatbot yanıtları üretir.

## Ne İşe Yarar?

- **LangChain ReAct Agent**: ReAct pattern ile reasoning
- **PDF Arama**: Staj yönergesi, ders katalogları gibi PDF'lerden MADDE bazlı bilgi bulur
- **Web Arama**: BTU web sitesinden güncel bilgileri çeker  
- **Akıllı Chatbot Yanıtları**: GPT-4o-mini ile doğal dil cevapları üretir
- **Kaynak Belirtme**: Her yanıtta kaynak PDF ve MADDE numarası

## Dosya Yapısı

```
Back-End/
├── api.py           # FastAPI + LangChain ReAct Agent servisi
├── ingestion.py     # PDF işleme ve ChromaDB entegrasyonu
├── requirements.txt # Python bağımlılıkları
└── docs/            # PDF dosyaları (MADDE'ler buraya)
```

## Kurulum

```bash
# 1. Klasöre git
cd Back-End

# 2. Virtual environment oluştur (önerilen)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# veya
venv\Scripts\activate     # Windows

# 3. Paketleri yükle
pip install -r requirements.txt

# 4. API anahtarlarını ayarla (.env dosyası)
Proje kök dizininde `.env` dosyası oluşturun:
```env
# OpenAI API Key (zorunlu)
OPENAI_API_KEY=sk-your-openai-key

# Google Custom Search API (zorunlu)
GOOGLE_API_KEY=your-google-api-key
GOOGLE_CSE_ID=your-cse-id

# Local development için:
HOST=127.0.0.1
PORT=8000

# Production deployment için:
# HOST=0.0.0.0
# PORT=8000
```

# 5. PDF'leri docs/ klasörüne koy

# 6. LangChain agent sunucusunu başlat
# Local development için:
uvicorn api:app --reload --host 127.0.0.1 --port 8000

# Production için:
# uvicorn api:app --host 0.0.0.0 --port 8000
```

## LangChain ReAct Agent Mimarisi

### ReAct Agent Pattern
Sistem **LangChain ReAct agent** kullanarak **ReAct (Reasoning and Acting)** pattern'ı uygular:

```python
# LangChain Agent Tools
@tool
def retrieve(query: str) -> str:
    """PDF dokümanlarında MADDE bazlı arama yapar"""
    docs = retriever.retrieve(query)
    return format_docs(docs)

@tool("google_search_univ")
def google_search_univ(query: str) -> str:
    """BTU web sitesinde güncel bilgi arar"""
    # Google Custom Search API kullanır
```

### Agent Reasoning Süreci
1. **Thought**: Soruyu analiz eder
2. **Action**: Uygun aracı seçer (PDF arama veya web arama)
3. **Action Input**: Araca parametre geçer
4. **Observation**: Sonuçları değerlendirir
5. **Final Answer**: Kaynak belirtili chatbot yanıtı üretir

## PDF İşleme Sistemi

### `ingestion.py` - MADDE Bazlı Chunking
- PDF dosyalarını okur
- Her PDF'i **MADDE** numaralarına göre semantik olarak böler
- ChromaDB vektör veritabanına kaydeder
- Efficient retrieval için optimize eder

```python
def split_by_madde(text: str, pdf_name: str):
    """PDF'i MADDE'lere böler"""
    pattern = r"(MADDE\s+\d+.*?)(?=MADDE\s+\d+|$)"
    madde_blocks = re.findall(pattern, text, re.DOTALL)
    
    docs = []
    for block in madde_blocks:
        # MADDE numarasını extract et
        header_pattern = r"MADDE\s+(\d+)\s*-\s*\((\d+|[a-zA-Z])\)"
        header_match = re.search(header_pattern, block)
        
        docs.append(Document(
            page_content=block.strip(),
            metadata={
                "source": pdf_name, 
                "madde_number": identifier
            }
        ))
    return docs
```

### ChromaDB Vektör Veritabanı
- **OpenAI Embeddings** ile vektörizasyon
- **Batch Processing** ile memory efficient işleme
- **Persistent Storage** ile disk'te saklama
- **Semantic Search** ile relevance scoring

## FastAPI Server

### `api.py` - Ana Endpoint'ler
LangChain ReAct agent'ı FastAPI üzerinden sunar:

```python
@app.post("/query")
async def query(request: QueryRequest):
    """Ana chatbot soru-cevap endpoint'i"""
    # LangChain ReAct agent'ı çalıştır
    response = agent_executor.invoke({"input": request.query})
    return {"response": response["output"]}

@app.post("/generate_title") 
async def generate_title(request: TitleRequest):
    """Chatbot sohbet başlığı üretimi"""
    # Son mesajlara göre başlık üret
    
@app.get("/")
async def root():
    """Health check endpoint'i"""
```

### CORS & Security
Frontend'in backend'e erişebilmesi için CORS ayarları:
```python
# Local development + Production origins
origins = [
    "http://localhost:3000",              # Local React development
    "https://btuchatbot.vercel.app",      # Production frontend
    "https://btubitirmebackend.onrender.com"  # Production backend (self-reference)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

> **Not**: Frontend'inizi farklı bir domain'de deploy ederseniz, o URL'yi de `origins` listesine eklemeniz gerekir.

## Gerekli Paketler

```txt
fastapi==0.115.6         # Web framework
langchain==0.3.10        # LangChain ReAct agent framework  
langchain-openai==0.2.10 # OpenAI integration
langchain-community==0.3.10 # Community tools
chromadb==0.5.23         # Vector database
pypdf==5.1.0             # PDF processing
openai==1.57.2           # OpenAI API
uvicorn==0.32.1          # ASGI server
tiktoken==0.8.0          # Token counting
python-dotenv==1.0.1     # Environment variables
pydantic==2.10.3         # Data validation
google-api-python-client # Google Custom Search API
```

## Local Development

### Hızlı Başlangıç (Local)
```bash
# 1. Repository'yi klonla
git clone https://github.com/Aytacus/BTU-LangChain-RAG.git
cd BTU-LangChain-RAG/Back-End

# 2. Virtual environment oluştur
python -m venv venv
source venv/bin/activate

# 3. Dependencies yükle
pip install -r requirements.txt

# 4. Environment variables (.env)
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_API_KEY=your-google-api-key  
GOOGLE_CSE_ID=your-cse-id

# 5. PDF'leri docs/ klasörüne koy

# 6. LangChain ReAct agent'ı başlat
uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

### API Test Etme
```bash
# LangChain agent'a soru sor
curl -X POST "http://localhost:8000/query" \
     -H "Content-Type: application/json" \
     -d '{"query": "Staj süresi kaç gün?"}'

# Response:
{
  "response": "Thought: Kullanıcı staj süresi hakkında bilgi istiyor...\nAction: retrieve\nAction Input: staj süresi\nObservation: Kaynak: STAJ_YONERGESI.pdf MADDE: 5...\nFinal Answer: Staj süresi en az 30 iş günüdür. Kaynak: STAJ_YONERGESI.pdf, MADDE: 5"
}

# Chatbot başlığı üret
curl -X POST "http://localhost:8000/generate_title" \
     -H "Content-Type: application/json" \
     -d '{"messages": ["Merhaba", "Staj hakkında bilgi istiyorum"]}'

# Health check
curl http://localhost:8000/
```

### Development Tips
```bash
# Verbose mode (agent reasoning görmek için)
# api.py'de verbose=True yap

# Database sıfırla
rm -rf .chroma/

# Hot reload ile geliştirme
uvicorn api:app --reload --log-level debug
```

## Production Deployment

### Environment Setup
```bash
# Production environment variables
OPENAI_API_KEY=sk-prod-key
GOOGLE_API_KEY=prod-google-key
GOOGLE_CSE_ID=prod-cse-id
PORT=8000
HOST=0.0.0.0
```



### AWS EC2 Deployment
```bash
# EC2 instance setup
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv -y

# Project setup
git clone https://github.com/Aytacus/BTU-LangChain-RAG.git
cd BTU-LangChain-RAG/Back-End
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Systemd service
sudo nano /etc/systemd/system/btulangchainrag.service
sudo systemctl enable btulangchainrag.service
sudo systemctl start btulangchainrag.service
```

## LangChain Agent Performance Tuning

### Response Quality
```python
# Custom prompt optimization for chatbot
custom_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template("""
    You are a BTU chatbot assistant using LangChain ReAct approach.
    
    ALWAYS include source references:
    "Kaynak: [PDF adı], MADDE: [madde numarası]"
    """),
    HumanMessagePromptTemplate.from_template("""
    Previous Conversation: {chat_history}
    Question: {input}
    Agent Thought: {agent_scratchpad}
    """)
])
```

### Conversational Memory
```python
# Chatbot conversation memory setup
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
    input_key="input", 
    output_key="output"
)
```

## Debug & Monitoring

### Common Issues

**LangChain agent parsing errors:**
```bash
# ReAct pattern'ı kontrol et
# Tool output format'ını doğrula
# Max iterations'ı artır
```

**ChromaDB memory issues:**
```bash
# Batch size'ı küçült (ingestion.py'de)
# Memory cleanup ekle
# Disk space kontrol et
```

**OpenAI rate limits:**
```bash
# Rate limiting middleware ekle
# Batch requests kullan
# GPT-4o-mini önerilen (maliyet etkin)
```

## Metrics & Analytics

Backend performansı için key metrics:
- **LangChain agent response time**: Reasoning süresi
- **Tool usage**: PDF vs web arama oranı
- **Source accuracy**: Kaynak attribution doğruluğu
- **Token consumption**: GPT-4o-mini kullanımı
- **Memory usage**: ChromaDB ve conversation memory

## API Endpoints

| Endpoint | Method | Description | LangChain Agent Flow |
|----------|--------|-------------|------------|
| `/query` | POST | Ana chatbot soru-cevap | ReAct agent invoke |
| `/generate_title` | POST | Chatbot sohbet başlığı | GPT-4o-mini direct |
| `/` | GET | Health check | Status check |

---

> **Not**: Bu backend, LangChain ReAct agent sistemi kullanarak geliştirilmiş production-ready RAG chatbot servisidir. ReAct pattern ile şeffaf reasoning süreci ve kaynak attribution sağlar. 

> **Not**: 
> - **Local development**: `HOST=127.0.0.1` kullanın (güvenlik için)
> - **Production deployment**: `HOST=0.0.0.0` kullanın (tüm interfacelerden erişim için)
