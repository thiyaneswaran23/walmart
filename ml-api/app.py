from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Load model and vectorizer once
model = joblib.load("product_classifier.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# === Route 1: Predict product label ===
@app.route('/predict-label', methods=['POST'])
def predict_label():
    try:
        data = request.get_json()
        product_name = data.get("productName")
        if not product_name:
            return jsonify({"error": "Product name not provided"}), 400

        # Vectorize the input (reshape into list)
        product_vector = vectorizer.transform([product_name])
        prediction = model.predict(product_vector)[0]

        return jsonify({"predictedLabel": prediction})
    except Exception as e:
        print("Prediction Error:", e)
        return jsonify({"error": "Internal server error"}), 500

# === Route 2: Recommend similar products ===
@app.route('/recommend/<product_id>', methods=['GET'])
def recommend(product_id):
    try:
        # Fetch all products
        response = requests.get("http://localhost:5000/api/pro/all-products")
        products = response.json()

        df = pd.DataFrame(products)

        if product_id not in df['_id'].astype(str).values:
            return jsonify({"error": "Product not found"}), 404

        # Clean and combine fields
        df['productName'] = df['productName'].fillna('')
        df['sellerName'] = df['sellerName'].fillna('')
        df['price'] = df['price'].fillna(0)

        df['combined'] = (
            df['productName'] + ' ' + df['sellerName'] + ' ' + df['price'].astype(str)
        ).str.lower()

        tfidf = TfidfVectorizer()
        tfidf_matrix = tfidf.fit_transform(df['combined'])

        idx = df[df['_id'].astype(str) == product_id].index[0]
        cosine_sim = cosine_similarity(tfidf_matrix[idx], tfidf_matrix).flatten()

        similar_indices = cosine_sim.argsort()[::-1]
        similar_indices = [i for i in similar_indices if str(df.iloc[i]['_id']) != product_id][:5]

        recommendations = df.iloc[similar_indices].to_dict(orient='records')
        return jsonify(recommendations)

    except Exception as e:
        print("Recommendation Error:", e)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)
