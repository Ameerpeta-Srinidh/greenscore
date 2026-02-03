from app.llm import call_llm
from app.parser import parse_response
import os

# Mock connection to Ollama
os.environ["OLLAMA_URL"] = "http://localhost:11434/api/generate"
os.environ["MODEL"] = "llama3.2:1b"

def test():
    text = "I ran 5km"
    print(f"Testing with text: {text}")
    try:
        raw = call_llm(text)
        print("RAW RESPONSE:")
        print(raw)
        print("-" * 20)
        
        parsed = parse_response(raw)
        print("PARSED RESPONSE:")
        print(parsed)
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test()
