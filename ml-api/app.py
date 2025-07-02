
from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)  # Enable CORS

# Route to get product recommendations based on MongoDB _id
@app.route('/recommend/<product_id>', methods=['GET'])
def recommend(product_id):
    try:
        # Fetch all products from the backend API
        response = requests.get("http://localhost:5000/api/pro/all-products")
        products = response.json()

        # Convert to DataFrame
        df = pd.DataFrame(products)

        # Validate input
        if product_id not in df['_id'].astype(str).values:
            return jsonify({"error": "Product not found"}), 404

        # Fill missing values and preprocess features
        df['productName'] = df['productName'].fillna('')
        df['sellerName'] = df['sellerName'].fillna('')
        df['price'] = df['price'].fillna(0)

        # Combine features into a single string
        df['combined'] = (df['productName'] + ' ' + df['sellerName'] + ' ' + df['price'].astype(str)).str.lower()

        # Vectorize using TF-IDF
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(df['combined'])

        # Find index of the selected product
        idx = df[df['_id'].astype(str) == product_id].index[0]
        cosine_sim = cosine_similarity(tfidf_matrix[idx], tfidf_matrix).flatten()

        # Sort and get top 5 similar products excluding the selected one
        similar_indices = cosine_sim.argsort()[::-1]
        similar_indices = [i for i in similar_indices if str(df.iloc[i]['_id']) != product_id][:5]
        recommendations = df.iloc[similar_indices].to_dict(orient='records')

        # Optional: print similarity scores for debugging
        print(f"Recommendations for product ID: {product_id}")
        for i in similar_indices:
            print(f"{df.iloc[i]['productName']} (score: {cosine_sim[i]:.4f})")

        return jsonify(recommendations)

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(port=8000)
