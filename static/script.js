document.addEventListener('DOMContentLoaded', function () {
    const questionsContainer = document.getElementById('questions-container');
    const resultContainer = document.getElementById('result');
    let questions = [];
    let currentQuestionIndex = 0;
    const answers = {};

    // Отримання питань від сервера
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
                if (currentQuestionIndex < questions.length) {
                    showNextQuestion();
                } else {
                    submitAnswers();
                }
            });
        }
    }

    function submitAnswers() {
        fetch('/submit-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...answers, is_last: true })
        })
        .then(response => response.json())
        .then(course => {
            if (course.error) {
                resultContainer.innerHTML = `<p>${course.error}</p>`;
            } else {
                resultContainer.innerHTML = `
                    <div class="course">
                        <h1 class="course__title">${course.title}</h1>
                        <div class="course__info">
                            <div class="course__info-basic">
                                <p class="course__description">${course.description}</p>
                                ${course.image_url ? `<img src="${course.image_url}" alt="${course.title}" class="course__image img-fluid mb-4" />` : ''} 
                            </div>
                            <div class="course__info-detailed">
                                <p><strong>Duration:</strong> ${course.duration} days</p>
                                <p><strong>Status:</strong> ${course.status}</p>
                                <p><strong>Price:</strong> ${course.price ? `${course.price} UAH` : 'Free'}</p>
                                <p><strong>Category:</strong> ${course.category}</p>
                                <p><strong>Skill Level:</strong> ${course.skill_level}</p>
                                <p><strong>Age Category:</strong> ${course.age_category}</p>
                                <p><strong>Difficulty:</strong> ${course.difficulty}</p>
                                <p><strong>Score:</strong> ${course.score}</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            resultContainer.classList.remove('hidden');
            questionsContainer.classList.add('hidden');

            const restartBtn = document.createElement('button');
            restartBtn.innerText = 'Почати заново';
            restartBtn.classList.add('btn', 'testing__btn');
            resultContainer.appendChild(restartBtn);

            restartBtn.addEventListener('click', function () {
                currentQuestionIndex = 0;
                for (let key in answers) {
                    delete answers[key];
                }
                resultContainer.classList.add('hidden');
                questionsContainer.classList.remove('hidden');
                showNextQuestion();
            });
        });
    }
});