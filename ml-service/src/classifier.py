import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline

class CybercrimeClassifier:
    CATEGORIES = [
        'phishing', 'identity_theft', 'online_fraud', 'cyberbullying',
        'hacking', 'ransomware', 'social_media_crime', 'financial_fraud',
        'data_breach', 'child_exploitation', 'other'
    ]

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=10000, ngram_range=(1, 2),
            min_df=1, sublinear_tf=True
        )
        self.model = LogisticRegression(
            max_iter=1000, C=1.0, solver='lbfgs',
            multi_class='multinomial', random_state=42
        )
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
        proba    = self.model.predict_proba(X)[0]
        scores   = {cat: round(float(p), 4) for cat, p in zip(self.model.classes_, proba)}
        confidence = float(max(proba))
        return {'category': category, 'confidence': round(confidence, 4), 'scores': scores}

    def save(self, model_path: str, vectorizer_path: str):
        joblib.dump(self.model,      model_path)
        joblib.dump(self.vectorizer, vectorizer_path)

    def load(self, model_path: str, vectorizer_path: str):
        self.model      = joblib.load(model_path)
        self.vectorizer = joblib.load(vectorizer_path)
        self._fitted    = True
