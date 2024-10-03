document.addEventListener('DOMContentLoaded', function () {
    const questionsContainer = document.getElementById('questions-container');
    const resultContainer = document.getElementById('result');
    let questions = [];
    let currentQuestionIndex = 0;
    const answers = {};

    fetch('/get-questions')
        .then(response => response.json())
        .then(data => {
            questions = data;
            showNextQuestion();
        })
        .catch(error => console.error('Error fetching questions:', error));

    function showNextQuestion() {
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];
            questionsContainer.innerHTML = '';

            const div = document.createElement('div');
            div.classList.add('question');

            const label = document.createElement('label');
            label.innerText = question.question;
            div.appendChild(label);

            const select = document.createElement('select');
            select.name = question.type;

            question.options.forEach((option) => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.innerText = option;
                select.appendChild(opt);
            });

            div.appendChild(select);

            const submitBtn = document.createElement('button');
            submitBtn.innerText = currentQuestionIndex === questions.length - 1 ? 'Отримати рекомендацію' : 'Далі';
            submitBtn.classList.add('btn', 'testing__btn');
            div.appendChild(submitBtn);

            questionsContainer.appendChild(div);

            submitBtn.addEventListener('click', function (e) {
                e.preventDefault();
                answers[question.type] = select.value;
                currentQuestionIndex++;
                submitAnswers(currentQuestionIndex >= questions.length);
            });
        }
    }

    function submitAnswers(isFinal = false) {
        fetch('/submit-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...answers, is_last: isFinal })
        })
        .then(response => response.json())
        .then(data => {
            displayResults(data.courses);
            if (data.is_final || isFinal) {
                questionsContainer.classList.add('hidden');
            } else {
                showNextQuestion();
            }
        });
    }

    function displayResults(courses) {
        resultContainer.innerHTML = '';
        if (courses.length === 0) {
            resultContainer.innerHTML = '<p>На жаль, не знайдено курсів, які відповідають вашим критеріям.</p>';
        } else {
            courses.forEach(course => {
                const courseElement = document.createElement('div');
                courseElement.classList.add('course');
                courseElement.innerHTML = `
                    <h2 class="course__title">${course.title}</h2>
                    <div class="course__info">
                        <div class="course__info-basic">
                            <p class="course__description">${course.description}</p>
                        </div>
                        <div class="course__info-detailed">
                            <p><strong>Duration:</strong> ${course.duration} days</p>
                            <p><strong>Status:</strong> ${course.status}</p>
                            <p><strong>Price:</strong> ${course.price ? `${course.price} UAH` : 'Free'}</p>
                            <p><strong>Category:</strong> ${course.category}</p>
                            <p><strong>Skill Level:</strong> ${course.skill_level}</p>
                            <p><strong>Age Category:</strong> ${course.age_category}</p>
                            <p><strong>Difficulty:</strong> ${course.difficulty}</p>
                        </div>
                    </div>
                `;
                resultContainer.appendChild(courseElement);
            });
        }
        resultContainer.classList.remove('hidden');
    }

    const restartBtn = document.createElement('button');
    restartBtn.innerText = 'Почати заново';
    restartBtn.style.maxWidth = '800px';
    restartBtn.style.display = 'block';
    restartBtn.style.margin = '20px auto';
    restartBtn.style.padding = '10px 20px';
    restartBtn.style.textAlign = 'center'; 
    restartBtn.classList.add('btn', 'testing__btn');
    restartBtn.addEventListener('click', function () {
        currentQuestionIndex = 0;
        for (let key in answers) {
            delete answers[key];
        }
        resultContainer.classList.add('hidden');
        questionsContainer.classList.remove('hidden');
        showNextQuestion();
    });
    document.body.appendChild(restartBtn);
});