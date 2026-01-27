'''
postgres connection string: postgres://postgres:hqruyrABLah8Ghb@search-db.flycast:5432
format                      postgres://username:password@hostname:5432/database
'''

from flask import Flask, render_template, send_from_directory, jsonify
import psycopg2
import os

app = Flask(__name__, static_folder='.')



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

# Example API endpoint that retrieves data using the database
@app.route('/api/data')
def get_data():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT NOW()')
        result = cur.fetchone()
        cur.close()
        conn.close()
        return jsonify({'database_time': str(result[0])})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
