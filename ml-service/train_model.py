"""
train_model.py — trains TF-IDF + Logistic Regression on dataset.csv
Run: python3 train_model.py
"""
import os, sys, json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import nltk

for pkg in ['punkt','stopwords','wordnet']:
    try: nltk.data.find(f'tokenizers/{pkg}')
    except LookupError: nltk.download(pkg, quiet=True)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
from preprocessor import TextPreprocessor
from classifier   import CybercrimeClassifier

DATA_PATH       = os.path.join(os.path.dirname(__file__), 'data', 'dataset.csv')
MODEL_PATH      = os.path.join(os.path.dirname(__file__), 'models', 'classifier.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), 'models', 'vectorizer.pkl')

os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

# ── Load data ─────────────────────────────────────────────────────────────────
print('📂 Loading dataset...')
df = pd.read_csv(DATA_PATH)
df.dropna(subset=['text','label'], inplace=True)
df['text']  = df['text'].astype(str)
df['label'] = df['label'].astype(str)
print(f'   Loaded {len(df)} samples across {df["label"].nunique()} categories')
print(f'   Distribution:\n{df["label"].value_counts().to_string()}')

# ── Preprocess ────────────────────────────────────────────────────────────────
print('\n🔧 Preprocessing text...')
prep = TextPreprocessor()
df['cleaned'] = df['text'].apply(prep.preprocess)

# ── Train / test split ────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    df['cleaned'], df['label'], test_size=0.2, random_state=42, stratify=df['label']
)
print(f'   Train: {len(X_train)}   Test: {len(X_test)}')

# ── Train ─────────────────────────────────────────────────────────────────────
print('\n🤖 Training model...')
clf = CybercrimeClassifier()
clf.fit(X_train.tolist(), y_train.tolist())

# ── Evaluate ──────────────────────────────────────────────────────────────────
print('\n📊 Evaluating...')
X_test_vec = clf.vectorizer.transform(X_test)
y_pred     = clf.model.predict(X_test_vec)
acc        = accuracy_score(y_test, y_pred)
print(f'   Accuracy : {acc:.4f}')
print(f'\n{classification_report(y_test, y_pred)}')

if '--evaluate' in sys.argv:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import seaborn as sns
    cm = confusion_matrix(y_test, y_pred, labels=clf.model.classes_)
    fig, ax = plt.subplots(figsize=(12,10))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=clf.model.classes_,
                yticklabels=clf.model.classes_, ax=ax, cmap='Blues')
    ax.set_title('Confusion Matrix'); ax.set_ylabel('True'); ax.set_xlabel('Predicted')
    plt.tight_layout()
    plt.savefig(os.path.join(os.path.dirname(__file__), 'models', 'confusion_matrix.png'), dpi=150)
    print('   Confusion matrix saved to models/confusion_matrix.png')

# ── Save ──────────────────────────────────────────────────────────────────────
clf.save(MODEL_PATH, VECTORIZER_PATH)
print(f'\n✅ Model saved to      {MODEL_PATH}')
print(f'✅ Vectorizer saved to {VECTORIZER_PATH}')
print('\n🚀 Ready! Start the service with: python3 src/app.py')
