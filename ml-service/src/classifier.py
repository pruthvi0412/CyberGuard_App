import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.calibration import CalibratedClassifierCV

class CybercrimeClassifier:
    CATEGORIES = [
        'phishing',
        'financial_fraud',
        'identity_theft',
        'cyberbullying',
        'hacking',
        'ransomware',
        'data_breach',
        'online_fraud',
        'child_exploitation',
        'women_child_safety',
        'network_attacks',
        'crypto_fraud',
        'other'
    ]

    SEVERITY_MAP = {
        'phishing': 'HIGH',
        'financial_fraud': 'CRITICAL',
        'identity_theft': 'HIGH',
        'cyberbullying': 'MEDIUM',
        'hacking': 'CRITICAL',
        'ransomware': 'CRITICAL',
        'data_breach': 'CRITICAL',
        'online_fraud': 'MEDIUM',
        'child_exploitation': 'CRITICAL',
        'women_child_safety': 'CRITICAL',
        'network_attacks': 'HIGH',
        'crypto_fraud': 'HIGH',
        'other': 'LOW'
    }

    SUBCATEGORY_MAP = {
        'phishing': 'Email / SSO Phishing & Spoofing',
        'financial_fraud': 'UPI / Banking & Card Fraud',
        'identity_theft': 'Aadhaar / SIM Swap & Impersonation',
        'cyberbullying': 'Online Harassment & Doxxing',
        'hacking': 'Unauthorized Intrusion & Account Takeover',
        'ransomware': 'Ransomware Extortion & Malware',
        'data_breach': 'Corporate Database Leak & PII Theft',
        'online_fraud': 'E-Commerce & Marketplace Scam',
        'child_exploitation': 'CSAM & Minor Protection',
        'women_child_safety': 'Emergency Distress & Cyberstalking',
        'network_attacks': 'DDoS & Infrastructure Flooding',
        'crypto_fraud': 'Crypto Drainer & Web3 Scam',
        'other': 'General Inquiry'
    }

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=25000,
            ngram_range=(1, 3),
            min_df=1,
            sublinear_tf=True,
            strip_accents='unicode'
        )
        base_model = LogisticRegression(
            max_iter=2000,
            C=4.0,
            solver='lbfgs',
            class_weight='balanced',
            random_state=42
        )
        self.model = base_model
        self._fitted = False

    def fit(self, texts, labels):
        X = self.vectorizer.fit_transform(texts)
        self.model.fit(X, labels)
        self._fitted = True

    def predict(self, text: str) -> dict:
        if not self._fitted:
            raise RuntimeError('Model not fitted. Call fit() or load() first.')
        X = self.vectorizer.transform([text])
        category = self.model.predict(X)[0]
        proba = self.model.predict_proba(X)[0]
        scores = {cat: round(float(p), 4) for cat, p in zip(self.model.classes_, proba)}
        confidence = float(max(proba))
        
        severity = self.SEVERITY_MAP.get(category, 'MEDIUM')
        subcategory = self.SUBCATEGORY_MAP.get(category, 'General Cybercrime')

        return {
            'category': category,
            'confidence': round(confidence, 4),
            'severity': severity,
            'subcategory': subcategory,
            'scores': scores
        }

    def save(self, model_path: str, vectorizer_path: str):
        joblib.dump(self.model, model_path)
        joblib.dump(self.vectorizer, vectorizer_path)

    def load(self, model_path: str, vectorizer_path: str):
        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vectorizer_path)
        self._fitted = True