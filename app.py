from flask import Flask, jsonify, request, render_template
import psycopg2
import os

app = Flask(__name__)

def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.environ.get('DB_NAME', 'EducationalPlatformKPZ'),
        user=os.environ.get('DB_USER', 'postgres'),
        password=os.environ.get('DB_PASSWORD', 'AdGj:5415410'),
        host=os.environ.get('DB_HOST', 'localhost'),
        port=os.environ.get('DB_PORT', '5432')
    )
    return conn

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

@app.route('/get-questions', methods=['GET'])
def get_questions():
    return jsonify(questions)

@app.route('/submit-answer', methods=['POST'])
def submit_answer():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()

    query = "SELECT * FROM courses WHERE 1=1"
    params = []

    for key, value in data.items():
        if key != 'is_last':
            if key == 'duration':
                if value == 'До 20':
                    query += " AND duration < 20"
                elif value == '20-40':
                    query += " AND duration BETWEEN 20 AND 40"
                elif value == 'Більше 40':
                    query += " AND duration > 40"
            else:
                query += f" AND {key} = %s"
                params.append(value)

    try:
        cur.execute(query, params)
        courses = cur.fetchall()
        
        if len(courses) == 0:
            query_last = query.rsplit('AND', 1)[0] + " ORDER BY id DESC LIMIT 1"
            cur.execute(query_last, params[:-1])
            courses = cur.fetchall()
        
        response = []
        for course in courses:
            response.append({
                'id': course[0],
                'title': course[1],
                'description': course[2],
                'price': course[3],
                'duration': course[4],
                'status': course[5],
                'category': course[6],
                'skill_level': course[7],
                'age_category': course[8],
                'difficulty': course[9]
            })
        
        return jsonify({
            'courses': response,
            'count': len(response),
            'is_final': len(response) <= 1 or data.get('is_last', False)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)