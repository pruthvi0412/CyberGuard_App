import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import joblib
import nltk

load_dotenv()

# ── Path Resolution ──────────────────────────────────────────────────────────
# This finds the absolute path of the 'ml-service' folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Standardize paths to ensure they work regardless of where you run the script
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, 'models', 'classifier.pkl')
DEFAULT_VECTOR_PATH = os.path.join(BASE_DIR, 'models', 'vectorizer.pkl')

MODEL_PATH      = os.getenv('MODEL_PATH',      DEFAULT_MODEL_PATH)
VECTORIZER_PATH = os.getenv('VECTORIZER_PATH', DEFAULT_VECTOR_PATH)

# ── NLTK Setup ───────────────────────────────────────────────────────────────
# Note: Since we fixed SSL manually, this will now work or skip if files exist
for pkg in ['punkt', 'stopwords', 'wordnet', 'averaged_perceptron_tagger', 'punkt_tab']:
    try:
        nltk.data.find(f'tokenizers/{pkg}')
    except LookupError:
        try:
            # Silent attempt to download
            nltk.download(pkg, quiet=True)
        except:
            pass 

from classifier import CybercrimeClassifier
from preprocessor import TextPreprocessor

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

MODEL_VERSION = '1.0.0'
classifier = CybercrimeClassifier()
preprocessor = TextPreprocessor()

model_loaded = False
try:
    classifier.load(MODEL_PATH, VECTORIZER_PATH)
    model_loaded = True
    logger.info(f'✅ Model loaded successfully from: {MODEL_PATH}')
except Exception as e:
    logger.warning(f'⚠️  Model not found — run train_model.py first. ({e})')


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model_loaded,
        'model_version': MODEL_VERSION,
        'categories': classifier.CATEGORIES,
    })


@app.route('/predict', methods=['POST'])
def predict():
    if not model_loaded:
        return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 503

    data = request.get_json(silent=True)
    if not data or 'text' not in data:
        return jsonify({'error': 'Request body must contain a "text" field.'}), 400

    text = str(data['text']).strip()
    max_len = int(os.getenv('MAX_TEXT_LENGTH', 5000))
    if not text:
        return jsonify({'error': 'Text cannot be empty.'}), 400
    if len(text) > max_len:
        text = text[:max_len]

    try:
        cleaned   = preprocessor.preprocess(text)
        result    = classifier.predict(cleaned)
        logger.info(f'Predicted: {result["category"]} ({result["confidence"]:.2f})')
        return jsonify({**result, 'model_version': MODEL_VERSION})
    except Exception as e:
        logger.error(f'Prediction error: {e}')
        return jsonify({'error': 'Prediction failed.', 'detail': str(e)}), 500


@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    if not model_loaded:
        return jsonify({'error': 'Model not loaded.'}), 503

    data = request.get_json(silent=True)
    if not data or 'texts' not in data or not isinstance(data['texts'], list):
        return jsonify({'error': 'Request body must contain a "texts" array.'}), 400

    results = []
    for text in data['texts'][:50]:          # cap at 50 per batch
        try:
            cleaned = preprocessor.preprocess(str(text))
            results.append(classifier.predict(cleaned))
        except Exception as e:
            results.append({'error': str(e)})

    return jsonify({'results': results, 'count': len(results), 'model_version': MODEL_VERSION})


@app.route('/model-info', methods=['GET'])
def model_info():
    return jsonify({
        'model_version': MODEL_VERSION,
        'categories': classifier.CATEGORIES,
        'algorithm': 'TF-IDF + Logistic Regression',
        'preprocessing': 'tokenization, stopword removal, lemmatization',
        'model_loaded': model_loaded,
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    logger.info(f'🚀 ML Service running on port {port}')
    app.run(host='0.0.0.0', port=port, debug=debug)