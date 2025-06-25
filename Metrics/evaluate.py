import time
import json

from langchain.memory import ConversationBufferMemory

from utils.data_loader import load_test_cases
from eval.ragas_evulator import EnhancedRagasEvaluator
from eval.hallucination_checker import HallucinationChecker
from eval.performance_metrics import PerformanceMonitor
from huggingface import setup_agent 
from embedding import ingest_pdfs

def run_evaluation():

    test_cases = load_test_cases()

    vectorstore = ingest_pdfs()
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True, input_key="input", output_key="output")
    agent = setup_agent(vectorstore, memory)
    ragas_evaluator = EnhancedRagasEvaluator()
    hallucination_checker = HallucinationChecker()
    perf_monitor = PerformanceMonitor()

    metrics = {
        "user_input" : [],
        "answers" : [],
        "contexts" : [],
        "reference" : [],
        "hallucination_flags" : [],
        "performance_data": [],
        "latency" : []
    }

    for case in test_cases:
        start_time = time.time()
        #answer = agent.invoke(case["question"])["output"]
        answer = agent.invoke({"input": case["question"]})["output"]
        latency = time.time() - start_time

        context = " ".join([c["content"] for c in case["relevant_contexts"]])
        metrics["user_input"].append(case["question"])
        metrics["answers"].append(answer)
        metrics["contexts"].append([context])
        metrics["reference"].append(case.get("expected_answer", ""))
        metrics["hallucination_flags"].append(
            hallucination_checker.grade(context, answer)
        )
        metrics["performance_data"].append(
            perf_monitor.log_query(case["question"], answer)
        )
        metrics["latency"].append(latency)
    ragas_results = ragas_evaluator.evaluate(
        metrics["user_input"],
        metrics["answers"],
        metrics["contexts"],
        metrics["reference"]

    )

    avg_input_tokens = sum(p['input_tokens'] for p in metrics["performance_data"]) / len(metrics["performance_data"])
    avg_output_tokens = sum(p['output_tokens'] for p in metrics['performance_data']) / len(metrics['performance_data'])
    avg_total_tokens = sum(p['total_tokens'] for p in metrics['performance_data']) / len(metrics['performance_data'])
    avg_cost = sum(p['cost'] for p in metrics['performance_data']) / len(metrics['performance_data'])
    avg_latency = sum(metrics['latency']) / len(metrics['latency'])
    print("=== Kapsamlı Değerlendirme Raporu ===")
    print("Context Recall :  ",ragas_results['context_recall'])
    print("Context Precision :  ", ragas_results['context_precision'])
    print("Faithfulness :  ", ragas_results['faithfulness'])
    print("Answer Relevancy :  ", ragas_results['answer_relevancy'])
    print(f"Ortalama Input Token: {avg_input_tokens:.2f}")
    print(f"Ortalama Output Token: {avg_output_tokens:.2f}")
    print(f"Ortalama Toplam Token: {avg_total_tokens:.2f}")
    print(f"Ortalama Maliyet: {avg_cost:.6f}$")
    print(f"Orlama Gecikme Süresi {avg_latency:.4f}s")

    print(f"Halüsinasyon Oranı: {sum(metrics['hallucination_flags']) / len(metrics['hallucination_flags']) * 100:.9f}%")



if __name__ == "__main__":
    run_evaluation()
