import time
import tiktoken


class PerformanceMonitor:
    def __init__(self):
        self.enc = tiktoken.get_encoding("cl100k_base")

    def calculate_tokens(self, text):
        return len(self.enc.encode(text))

    def log_query(self, question, answer):

        input_tokens = self.calculate_tokens(question)
        output_tokens = self.calculate_tokens(answer)

        return {
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": input_tokens + output_tokens,
            "cost": self._calculate_cost(input_tokens, output_tokens)
        }

    def _calculate_cost(self, input_tokens, output_tokens):

        return (input_tokens * 0.00015 + output_tokens * 0.0006) / 1000