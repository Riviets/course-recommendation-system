from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import psycopg2
from psycopg2 import sql
import os

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)  # Увімкнення CORS для всіх маршрутів

class CourseRecommendationSystem:
    def __init__(self):
        self.conn = None
        self.cur = None
        self.connect_to_db()

    def connect_to_db(self):
        try:
            self.conn = psycopg2.connect(
                dbname=os.environ.get('DB_NAME', 'EducationalPlatformKPZ'),
                user=os.environ.get('DB_USER', 'postgres'),
                password=os.environ.get('DB_PASSWORD', 'AdGj:5415410'),
                host=os.environ.get('DB_HOST', 'localhost'),
                port=os.environ.get('DB_PORT', '5432')
            )
            self.cur = self.conn.cursor()
        except psycopg2.Error as e:
            print(f"Unable to connect to the database: {e}")
            raise

    def recommend_course(self, preferences):
        try:
            query = sql.SQL("""
                SELECT id, title, description, price, duration, status, image_url, category, skill_level, age_category, difficulty, score
                FROM courses_course
                WHERE 1=1
            """)
            params = []

            if preferences['status'] == 'free':
                query += sql.SQL(" AND (price IS NULL OR price = 0)")
            elif preferences['status'] == 'premium':
                if preferences['price_category'] == 'до 500':
                    query += sql.SQL(" AND (price < 500)")
                elif preferences['price_category'] == '500-2000':
                    query += sql.SQL(" AND (price >= 500 AND price < 2000)")
                elif preferences['price_category'] == '2000 і вище':
                    query += sql.SQL(" AND (price >= 2000)")

            if preferences['duration'] == 'менше 10 днів':
                query += sql.SQL(" AND (duration < 10)")
            elif preferences['duration'] == 'менше 30 днів':
                query += sql.SQL(" AND (duration < 30)")
            elif preferences['duration'] == 'більше 30 днів':
                query += sql.SQL(" AND (duration > 30)")

            for key in ['category', 'skill_level', 'age_category', 'difficulty']:
                if key in preferences:
                    query += sql.SQL(f" AND {key} = %s")
                    params.append(preferences[key])

            query += sql.SQL(" ORDER BY RANDOM() LIMIT 1")

            self.cur.execute(query, params)
            course = self.cur.fetchone()

            if course:
                return {
                    'id': course[0],
                    'title': course[1],
                    'description': course[2],
                    'price': course[3],
                    'duration': course[4],
                    'status': course[5],
                    'image_url': course[6],
                    'category': course[7],
                    'skill_level': course[8],
                    'age_category': course[9],
                    'difficulty': course[10],
                    'score': course[11]
                }
            else:
                return None
        except Exception as e:
            print(f"Error occurred: {e}")
            raise

    def get_questions(self):
        return [
            {
                "label": "Який статус курсу вас цікавить?",
                "id": "status",
                "options": [
                    {"value": "free", "text": "Безкоштовно"},
                    {"value": "premium", "text": "Преміум"}
                ]
            },
            {
                "label": "Яка цінова категорія вас цікавить?",
                "id": "price_category",
                "options": [
                    {"value": "до 500", "text": "До 500 грн"},
                    {"value": "500-2000", "text": "500-2000 грн"},
                    {"value": "2000 і вище", "text": "2000 і вище"}
                ]
            },
            {
                "label": "Яка бажана тривалість курсу?",
                "id": "duration",
                "options": [
                    {"value": "менше 10 днів", "text": "Менше 10 днів"},
                    {"value": "менше 30 днів", "text": "Менше 30 днів"},
                    {"value": "більше 30 днів", "text": "Більше 30 днів"}
                ]
            },
            {
                "label": "Оберіть категорію курсу",
                "id": "category",
                "options": [
                    {"value": "Programming", "text": "Програмування"},
                    {"value": "Design", "text": "Дизайн"},
                    {"value": "Marketing", "text": "Маркетинг"}
                ]
            },
            {
                "label": "Який ваш рівень навичок?",
                "id": "skill_level",
                "options": [
                    {"value": "Beginner", "text": "Початковий"},
                    {"value": "Intermediate", "text": "Середній"},
                    {"value": "Advanced", "text": "Високий"}
                ]
            },
            {
                "label": "Яка ваша вікова категорія?",
                "id": "age_category",
                "options": [
                    {"value": "18-25", "text": "18-25"},
                    {"value": "25-40", "text": "25-40"},
                    {"value": "40+", "text": "40+"}
                ]
            },
            {
                "label": "Яка складність курсу вас цікавить?",
                "id": "difficulty",
                "options": [
                    {"value": "Easy", "text": "Легка"},
                    {"value": "Medium", "text": "Середня"},
                    {"value": "Hard", "text": "Важка"}
                ]
            }
        ]

    def __del__(self):
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()

recommendation_system = CourseRecommendationSystem()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/questions', methods=['GET'])
def questions():
    try:
        return jsonify(recommendation_system.get_questions()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        preferences = request.json
        if not preferences:
            return jsonify({'error': 'No preferences provided'}), 400
        
        course = recommendation_system.recommend_course(preferences)
        if course:
            return jsonify({'course': course}), 200
        else:
            return jsonify({'error': 'No matching course found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)