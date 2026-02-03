'''
SerpApi Keys 
To set serapi key run 'flyctl secrets set SERPAPI_KEY=api_key_here'
Api Key 1: 01e13608c615a24478340d303da39547195a310c983c5f2b177c6cdeb9ac9000
Api Key 2:
Api Key 3:
'''

from pony.orm import Database, Required, Optional, db_session, Json
from datetime import datetime, timedelta
from flask import Flask, render_template, send_from_directory, jsonify
import requests
import psycopg2
import os

app = Flask(__name__, static_folder='.')
db = Database()

class ProductSearch(db.Entity):
    query = Required(str, unique=True)  # The search term (unique to avoid duplicates)
    results = Required(Json)  # Store the results as JSON
    created_at = Required(datetime, default=datetime.now)

# Connect to PostgreSQL
db.bind(provider='postgres', dsn=os.environ.get('DATABASE_URL'))
db.generate_mapping(create_tables=True)

API_KEY = os.environ.get('SERPAPI_KEY')  # Store API key in environment variable
CACHE_DURATION_HOURS = 24  # Cache results for 24 hours

@db_session
def search_product(product):
    # First, check if we have cached results
    cached = ProductSearch.get(query=product.lower())
    
    if cached:
        # Check if cache is still fresh (within 24 hours)
        if datetime.now() - cached.created_at < timedelta(hours=CACHE_DURATION_HOURS):
            print(f"Cache hit for: {product}")
            return cached.results
        else:
            # Cache is stale, delete it
            cached.delete()
    
    # No cache or stale cache - fetch fresh data
    print(f"Fetching fresh data for: {product}")
    url = "https://serpapi.com/search.json"
    params = {
        "q": product,
        "tbm": "shop",
        "api_key": API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = []

    if "shopping_results" in data:
        for item in data["shopping_results"][:5]:
            name = item.get("title", "N/A")
            price = item.get("price", "N/A")
            store = item.get("source", "Unknown Store")
            availability = item.get("availability", "In Stock")
            link = item.get("link", "#")

            results.append({
                "name": name,
                "price": price,
                "store": store,
                "availability": availability,
                "link": link
            })
    
    # Save results to database
    ProductSearch(query=product.lower(), results=results)
    
    return results

# Database connection
def get_db_connection():
    conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
    return conn

# Serve HTML file
@app.route('/')
def index():
    return send_from_directory('.', 'SeniorExpo.html')

# Serve CSS files
@app.route('/<path:filename>.css')
def css(filename):
    return send_from_directory('.', f'{filename}.css')

# Serve JS files
@app.route('/<path:filename>.js')
def js(filename):
    return send_from_directory('.', f'{filename}.js')

# Serve images from the images folder
@app.route('/images/<path:filename>')
def images(filename):
    return send_from_directory('images', filename)

@app.route('/api/search', methods=['POST'])
def api_search():
    from flask import request
    
    data = request.get_json()
    query = data.get('query', '').strip()
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    try:
        results = search_product(query)
        return jsonify({
            'success': True,
            'query': query,
            'results': results
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
