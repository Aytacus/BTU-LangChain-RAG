# BTU-LangChain-RAG Metrics - RAGAS ile Chatbot Performans Değerlendirme

**BTU-CHATBOT: LANGCHAIN TABANLI ÇOK AJANLI RAG CHATBOTU VE DEĞERLENDİRİLMESİ** projesinin metrics ve değerlendirme sistemi. **RAGAS framework** kullanarak LangChain ReAct agent tabanlı chatbot sisteminin performansını ölçer ve analiz eder.

## Ne İşe Yarar?

Bu modül, BTU-LangChain-RAG chatbot sisteminin kalitesini çeşitli metriklerle değerlendirmek için tasarlanmıştır:

- **Answer Relevancy**: Chatbot yanıtlarının soruyla olan ilişkisi
- **Context Precision**: Bulunan kaynakların kalitesi  
- **Context Recall**: Önemli bilgilerin yakalanması
- **Faithfulness**: Kaynak belgelerle tutarlılık
- **Hallucination Detection**: Yanıtlarda yanlış bilgi tespiti
- **Token Usage Analysis**: GPT-4o-mini maliyet analizi

## Özellikler

### RAGAS Framework Integration
- **RAGAS 0.1.21** ile kapsamlı chatbot değerlendirme
- **OpenAI GPT-4o-mini** ile cost-effective analiz
- **Batch Processing** ile yüksek verimlilik
- **Detailed Reporting** ile görselleştirme

### Chatbot-Specific Metrics
- **Response Quality**: Yanıt kalitesi ölçümü
- **Source Attribution**: Kaynak doğruluğu kontrolü
- **Agent Reasoning**: LangChain ReAct agent mantığı analizi
- **Conversation Flow**: Sohbet akışı değerlendirme

### Test Dataset Management
- **Question-Answer Pairs**: Chatbot test senaryoları
- **Ground Truth**: Referans yanıtlar
- **Context Sources**: PDF ve web kaynak dokümanları
- **Edge Cases**: Sınır durumları testi

## Teknolojiler

### Core Framework
- **RAGAS 0.1.21**: RAG sistem değerlendirme framework'ü
- **Python 3.8+**: Programming language
- **Pandas 2.0.3**: Veri manipülasyonu ve analiz
- **NumPy 1.24.3**: Numerik hesaplamalar

### AI & ML
- **OpenAI GPT-4o-mini**: Evaluation model
- **LangChain 0.3.10**: Agent evaluation
- **Sentence Transformers**: Embedding modelleri
- **NLTK 3.8.1**: Doğal dil işleme

### Data Processing
- **JSON**: Test data formatı
- **CSV**: Metrics export
- **Matplotlib 3.7.2**: Görselleştirme
- **Seaborn 0.12.2**: İstatistiksel grafikler

## Kurulum

### Gereksinimler
- **Python 3.8+**
- **pip** package manager
- **Git**
- **OpenAI API Key** (GPT-4o-mini için)

### Kurulum Adımları

```bash
# 1. Repository klonla
git clone https://github.com/Aytacus/BTU-LangChain-RAG.git
cd BTU-LangChain-RAG/Metrics

# 2. Virtual environment oluştur
python -m venv venv
source venv/bin/activate  # Linux/Mac
# veya
venv\Scripts\activate     # Windows

# 3. Dependencies yükle
pip install -r requirements.txt

# 4. Environment variables ayarla
# .env dosyası oluştur:
OPENAI_API_KEY=sk-your-openai-key

# 5. Test data hazırla
# test_data.json dosyasını düzenle
```

## Kullanım

### Temel Değerlendirme
```bash
# Ana değerlendirme script'i çalıştır
python evaluate.py

# Detaylı analiz ile
python evaluate.py --detailed

# Specific metric ile
python evaluate.py --metric faithfulness
```

### Batch Evaluation
```bash
# Çoklu test dosyası ile
python batch_evaluate.py --input-dir test_datasets/

# Custom output directory
python batch_evaluate.py --output-dir results/
```

## Proje Yapısı

```
Metrics/
├── evaluate.py           # Ana değerlendirme script'i
├── batch_evaluate.py     # Batch processing
├── metrics_analyzer.py   # Sonuç analizi
├── requirements.txt      # Python dependencies
├── test_data.json       # Test soru-cevap çiftleri
├── ground_truth.json    # Referans yanıtlar
├── results/             # Değerlendirme sonuçları
│   ├── detailed_report.csv
│   ├── summary_stats.json
│   └── visualizations/
└── datasets/            # Test veri setleri
    ├── academic_qa.json
    ├── regulation_qa.json
    └── general_qa.json
```

## Test Data Formatı

### test_data.json
```json
{
  "questions": [
    {
      "id": "q001",
      "question": "Staj süresi kaç gün?",
      "contexts": [
        "MADDE 5 - Staj süresi en az 30 iş günüdür..."
      ],
      "ground_truth": "Staj süresi en az 30 iş günüdür.",
      "category": "staj"
    }
  ]
}
```

### Chatbot Response Format
```json
{
  "response_id": "r001", 
  "question_id": "q001",
  "response": "Staj süresi 30 iş günüdür. Kaynak: STAJ_YONERGESI.pdf, MADDE: 5",
  "reasoning": "Thought: Kullanıcı staj süresi hakkında...",
  "sources": ["STAJ_YONERGESI.pdf"],
  "timestamp": "2024-01-15T10:30:00"
}
```

## RAGAS Metrikleri

### Context Precision
Retrieve edilen context'lerin ne kadarının soruyla alakalı olduğunu ölçer.

```python
from ragas.metrics import context_precision

# Chatbot retrieved contexts kalitesi
precision_score = context_precision.score(
    question=question,
    contexts=retrieved_contexts,
    answer=chatbot_response
)
```

### Context Recall  
Ground truth yanıt için gerekli tüm bilgilerin retrieve edilip edilmediğini ölçer.

```python
from ragas.metrics import context_recall

recall_score = context_recall.score(
    question=question,
    contexts=retrieved_contexts,
    ground_truth=ground_truth_answer
)
```

### Faithfulness
Chatbot yanıtının retrieve edilen context'lerle ne kadar tutarlı olduğunu ölçer.

```python
from ragas.metrics import faithfulness

faithfulness_score = faithfulness.score(
    question=question,
    answer=chatbot_response,
    contexts=retrieved_contexts
)
```

### Answer Relevancy
Chatbot yanıtının soruyla ne kadar alakalı olduğunu ölçer.

```python
from ragas.metrics import answer_relevancy

relevancy_score = answer_relevancy.score(
    question=question,
    answer=chatbot_response,
    contexts=retrieved_contexts
)
```

## Örnek Değerlendirme

### evaluate.py
```python
from ragas import evaluate
from ragas.metrics import (
    context_precision,
    context_recall, 
    faithfulness,
    answer_relevancy
)

# Test dataset yükle
dataset = load_test_data("test_data.json")

# RAGAS evaluation
result = evaluate(
    dataset=dataset,
    metrics=[
        context_precision,
        context_recall,
        faithfulness, 
        answer_relevancy
    ],
    llm=ChatOpenAI(model="gpt-4o-mini"),
    embeddings=OpenAIEmbeddings()
)

# Sonuçları kaydet
result.to_pandas().to_csv("results/evaluation_results.csv")
```

## Sonuç Analizi

### Metrics Dashboard
```python
# Detaylı analiz
python metrics_analyzer.py --input results/evaluation_results.csv

# Görselleştirme üret
python metrics_analyzer.py --visualize --output-dir visualizations/
```

### Performance Reports
- **Overall Score**: Genel chatbot performansı
- **Metric Breakdown**: Her metrik için detay
- **Category Analysis**: Soru kategorilerine göre performans
- **Trend Analysis**: Zaman içinde performans değişimi

## Gelişmiş Özellikler

### Custom Metrics
```python
# Chatbot-specific custom metric
def source_attribution_accuracy(response, ground_truth_sources):
    """Kaynak attribution doğruluğunu ölçer"""
    mentioned_sources = extract_sources(response)
    return jaccard_similarity(mentioned_sources, ground_truth_sources)
```

### A/B Testing
```python
# Farklı chatbot versiyonlarını karşılaştır
compare_models(
    model_a="langchain-react-v1",
    model_b="langchain-react-v2", 
    test_dataset=test_data
)
```

### Real-time Monitoring
```python
# Production chatbot monitoring
monitor_chatbot_performance(
    endpoint="https://api.btu-langchain-rag.com",
    metrics_interval=3600  # Her saat
)
```

## Interpretability

### Failure Analysis
- **Low Faithfulness**: Kaynak dışı bilgi kullanımı
- **Low Precision**: İlgisiz context retrieval
- **Low Recall**: Eksik bilgi yakalama
- **Low Relevancy**: Soruyla uyumsuz yanıtlar

### Error Categories
1. **Retrieval Errors**: Yanlış PDF/MADDE bulma
2. **Generation Errors**: Yanlış yanıt üretimi  
3. **Source Errors**: Kaynak attribution hataları
4. **Reasoning Errors**: LangChain agent mantık hataları

## Deployment & CI/CD

### Automated Testing
```bash
# GitHub Actions ile otomatik test
name: Chatbot Evaluation
on: [push, pull_request]
jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run RAGAS evaluation
        run: python evaluate.py --ci-mode
```

### Production Monitoring
```python
# Canlı chatbot monitoring
schedule_evaluation(
    frequency="daily",
    dataset="production_samples.json",
    alert_threshold=0.7
)
```

## Sonuçların Yorumlanması

### Score Ranges
- **0.9-1.0**: Mükemmel chatbot performansı
- **0.8-0.9**: İyi performans
- **0.7-0.8**: Kabul edilebilir performans  
- **<0.7**: İyileştirme gerekli

### Optimization Strategies
- **Düşük Precision**: Context filtering iyileştir
- **Düşük Recall**: Retrieval strategy genişlet
- **Düşük Faithfulness**: Prompt engineering
- **Düşük Relevancy**: Agent reasoning optimize et

---

> **Not**: Bu değerlendirme sistemi, LangChain ReAct agent tabanlı chatbot sisteminin kalitesini objektif metriklerle ölçer ve sürekli iyileştirme için rehberlik sağlar. RAGAS framework ile industry-standard değerlendirme yapar. 