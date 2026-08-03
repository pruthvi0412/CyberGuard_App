import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
from classifier import CybercrimeClassifier
from preprocessor import TextPreprocessor

prep = TextPreprocessor()
clf = CybercrimeClassifier()
clf.load(
    os.path.join(os.path.dirname(__file__), 'models', 'classifier.pkl'),
    os.path.join(os.path.dirname(__file__), 'models', 'vectorizer.pkl')
)

test_texts = [
    "A corporate employee received a spoofed email disguised as a Microsoft 365 Security Alert, claiming that an unauthorized login attempt from a foreign IP address required immediate password verification. The email used a high-urgency tone and a fraudulent 'Review Activity' button that redirected the user to a pixel-perfect imitation of the company's Single Sign-On (SSO) portal. Unaware of the spoofed URL, the employee entered their corporate credentials and completed a multi-factor authentication (MFA) prompt triggered by the attacker, resulting in a full takeover of the employee's mailbox and sensitive internal documents.",
    "Someone called asking for OTP for electricity bill update and 50000 rupees was debited from Google Pay UPI.",
    "Our entire server files are encrypted with .locked extension and ransomware note is demanding 5 Bitcoin.",
    "A stalker is following me, tracking my phone and sending threatening abusive messages on WhatsApp.",
    "Someone stole my Aadhaar card and PAN card to open fake bank accounts and take loans in my name.",
    "Our AWS customer database with 500,000 user passwords was leaked and dumped on the dark web.",
    "Massive 50Gbps UDP flood traffic attacking our website causing full server downtime and outage."
]

for t in test_texts:
    cleaned = prep.preprocess(t)
    res = clf.predict(cleaned)
    print(f"\nText: {t[:80]}...")
    print(f"-> Category: {res['category']} | Subcategory: {res['subcategory']} | Confidence: {res['confidence']:.2%} | Severity: {res['severity']}")
