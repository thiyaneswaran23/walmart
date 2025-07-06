import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# === Load your dataset ===
df = pd.read_csv("expanded_ecommerce_dataset.csv")  # Use the correct filename

# === Use correct column names from your CSV ===
df = df.dropna(subset=["title", "label"])
X = df["title"]
y = df["label"]

# === Train the model ===
vectorizer = TfidfVectorizer()
X_vectorized = vectorizer.fit_transform(X)

model = LogisticRegression()
model.fit(X_vectorized, y)

# === Save model and vectorizer ===
joblib.dump(model, "product_classifier.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("✅ Model and vectorizer saved successfully.")
