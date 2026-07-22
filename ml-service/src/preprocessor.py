import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

class TextPreprocessor:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        # Keep crime-relevant negations
        self.stop_words -= {'no', 'not', 'nor', 'never', 'none'}

    def preprocess(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r'http\S+|www\S+', ' url ', text)
        text = re.sub(r'\S+@\S+', ' email ', text)
        text = re.sub(r'\b\d{10,}\b', ' phonenumber ', text)
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\d+', ' num ', text)
        tokens = word_tokenize(text)
        tokens = [
            self.lemmatizer.lemmatize(t)
            for t in tokens
            if t not in self.stop_words and len(t) > 2
        ]
        return ' '.join(tokens)
