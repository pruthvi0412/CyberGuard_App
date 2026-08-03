import re
import string

STANDARD_STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're",
    "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he',
    'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it',
    "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those',
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and',
    'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
    'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
    'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just',
    'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're',
    've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't",
    'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't",
    'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn',
    "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't",
    'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
}

class TextPreprocessor:
    def __init__(self):
        self.stop_words = set(STANDARD_STOPWORDS)
        # Retain critical crime keywords/negations
        self.stop_words -= {'no', 'not', 'nor', 'never', 'none', 'against', 'out'}

    def preprocess(self, text: str) -> str:
        if not text:
            return ""
        text = str(text).lower()
        # Normalize URLs and emails
        text = re.sub(r'https?://\S+|www\.\S+', ' url_link ', text)
        text = re.sub(r'\S+@\S+', ' email_addr ', text)
        # Normalize phone numbers and large account numbers
        text = re.sub(r'\b(?:\+91|0)?[6-9]\d{9}\b', ' phone_num ', text)
        text = re.sub(r'\b\d{9,18}\b', ' bank_account ', text)
        # Replace non-alphanumeric with spaces
        text = re.sub(r'[^a-zA-Z0-9_\s]', ' ', text)
        # Normalize isolated numbers
        text = re.sub(r'\b\d+\b', ' num_val ', text)
        
        # Fast whitespace tokenizer
        words = text.split()
        cleaned_words = [
            w for w in words 
            if w not in self.stop_words and len(w) > 1
        ]
        return ' '.join(cleaned_words)
