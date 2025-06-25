from ragas import evaluate
import numpy as np
from ragas.metrics import (
context_recall,
context_precision,
faithfulness,
answer_relevancy
)

from datasets import Dataset

class EnhancedRagasEvaluator:
    def __init__(self):
        self.metrics = [
            context_recall,
            context_precision,
            faithfulness,
            answer_relevancy,
        ]
    def evaluate(self, questions, answers, contexts, references):
        dataset = Dataset.from_dict(
            {
                'user_input': questions,
                'answers': answers,
                'response': answers,
                'contexts': contexts,
                'reference' : references

            }
        )

        results = evaluate(dataset, self.metrics)


        return {
            "context_precision": results["context_precision"],
            "context_recall": results["context_recall"],
            "faithfulness": results["faithfulness"],
            "answer_relevancy": results["answer_relevancy"],
        }