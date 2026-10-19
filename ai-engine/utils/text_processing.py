import re
import numpy as np

def clean_text(text: str) -> str:
    """Removes special characters, extra whitespace, and lowercases text."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s\+\#\.]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def tokenize(text: str) -> list[str]:
    """Tokenizes cleaned text into words."""
    cleaned = clean_text(text)
    return [w for w in cleaned.split() if len(w) > 1]
