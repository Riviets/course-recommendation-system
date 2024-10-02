from flask import Flask, jsonify, request, render_template
import psycopg2
import os

app = Flask(__name__)

# Підключення до бази даних
def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.environ.get('DB_NAME', 'EducationalPlatformKPZ'),
        user=os.environ.get('DB_USER', 'postgres'),
        password=os.environ.get('DB_PASSWORD', 'AdGj:5415410'),
        host=os.environ.get('DB_HOST', 'localhost'),
        port=os.environ.get('DB_PORT', '5432')
    )
    return conn

# Повертає запитання для тестування
@app.route('/get-questions', methods=['GET'])
def get_questions():
    questions = [
        {
            'id': 1,
            'question': 'Оберіть категорію курсу',
            'options': ['Programming', 'Design', 'Marketing'],
            'type': 'category'
        },
        {
            'id': 2,
            'question': 'Оберіть рівень навичок',
            'options': ['Beginner', 'Intermediate', 'Advanced'],
            'type': 'skill_level'
        },
        {
            'id': 3,
            'question': 'Оберіть вартість курсу',
            'options': ['Безкоштовний', 'Платний'],
            'type': 'status'
        },
        {
            'id': 4,
            'question': 'Оберіть тривалість курсу',
            'options': ['До 20', '20-40', 'Більше 40'],
            'type': 'duration'
        },
        {
            'id': 5,
            'question': 'Оберіть вікову категорію',
            'options': ['12-18', '18-25', '25-40'],
            'type': 'age_category'
        },
        {
            'id': 6,
            'question': 'Оберіть складність курсу',
            'options': ['Easy', 'Medium', 'Hard'],
            'type': 'difficulty'
        }
    ]
    return jsonify(questions)

@app.route('/submit-answers', methods=['POST'])
def submit_answers():
    data = request.json

    category = data.get('category')
    skill_level = data.get('skill_level')
    status = data.get('status')
    duration = data.get('duration')
    age_category = data.get('age_category')
    difficulty = data.get('difficulty')

    conn = get_db_connection()
    cur = conn.cursor()

    # Умови для тривалості курсу
    duration_condition = ""
    if duration == 'До 20':
        duration_condition = "duration < 20"
    elif duration == '20-40':
        duration_condition = "duration BETWEEN 20 AND 40"
    elif duration == 'Більше 40':
        duration_condition = "duration > 40"

    # Формування SQL-запиту
    query = f"""
        SELECT title, description, price, duration, status, category, skill_level, age_category, difficulty, score 
        FROM courses 
        WHERE category = %s AND skill_level = %s AND status = %s 
        AND {duration_condition}
    """
    
    params = [category, skill_level, status]  # Основні параметри

    # Додаємо параметри для age_category та difficulty, якщо вони задані
    if age_category:
        query += " AND age_category = %s"
        params.append(age_category)  # Додаємо до списку
    if difficulty:
        query += " AND difficulty = %s"
        params.append(difficulty)  # Додаємо до списку

    query += " LIMIT 1;"  # Додаємо обмеження на кількість

    try:
        print("Executing query:", query)  # Діагностичний вивід запиту
        print("With params:", params)      # Діагностичний вивід параметрів
        cur.execute(query, params)  # Передаємо параметри в запит
        course = cur.fetchone()
    except Exception as e:
        return jsonify({'error': str(e)}), 500  # Повертає помилку
    finally:
        conn.close()

    if course:
        response = {
            'title': course[0],
            'description': course[1],
            'price': course[2],
            'duration': course[3],
            'status': course[4],
            'category': course[5],
            'skill_level': course[6],
            'age_category': course[7],
            'difficulty': course[8],
            'score': course[9],
        }
    else:
        response = {'error': 'Не знайдено відповідного курсу.'}

    return jsonify(response)




# Головна сторінка
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
