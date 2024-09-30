from flask import Flask, request, jsonify, render_template
import psycopg2
from psycopg2 import sql

app = Flask(__name__, static_folder='static', static_url_path='')

class CourseRecommendationSystem:
    def __init__(self):
        self.conn = psycopg2.connect(
            dbname='edu_platform_db_RDS',
            user='postgres',
            password='1234567890HTML',
            host='edu-platform-db-rds.cjqq6eecqu1g.us-east-2.rds.amazonaws.com',
            port='5432'
        )
        self.cur = self.conn.cursor()

    def recommend_course(self, preferences):
        query = sql.SQL("""
            SELECT id, title, description, price, duration, status
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
                'status': course[5]
            }
        else:
            return None

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
                    {"value": "50-2000", "text": "50-2000 грн"},
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
            }
        ]

    def __del__(self):
        self.cur.close()
        self.conn.close()

recommendation_system = CourseRecommendationSystem()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/questions', methods=['GET'])
def questions():
    return jsonify(recommendation_system.get_questions())

@app.route('/recommend', methods=['POST'])
def recommend():
    preferences = request.json
    course = recommendation_system.recommend_course(preferences)
    return jsonify({'course': course})

if __name__ == '__main__':
    app.run(debug=True)
