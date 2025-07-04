import json

def load_test_cases(file_path="evaluation/test_cases/test_cases.json"):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data["test_cases"]