document.addEventListener('DOMContentLoaded', async function () {
    let currentQuestionIndex = 0;
    const questions = await fetchQuestions();
    const questionsContainer = document.getElementById('questions-container');
    const form = document.getElementById('preferences-form');
    let preferences = {};

    function showQuestion(index) {
        questionsContainer.innerHTML = '';

        if (index >= questions.length) {
            submitPreferences(preferences);
            return;
        }

        const question = questions[index];
        const questionCard = document.createElement('div');
        questionCard.classList.add('question-card');
        questionCard.innerHTML = `<label>${question.label}</label>`;

        question.options.forEach(option => {
            const radioOption = document.createElement('input');
            radioOption.type = 'radio';
            radioOption.name = question.id;
            radioOption.value = option.value;

            radioOption.addEventListener('click', function () {
                preferences[question.id] = this.value;

                if (question.id === 'status' && this.value === 'free') {
                    currentQuestionIndex++;
                }

                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
            });

            const optionLabel = document.createElement('label');
            optionLabel.textContent = option.text;

            questionCard.appendChild(radioOption);
            questionCard.appendChild(optionLabel);
            questionCard.appendChild(document.createElement('br'));
        });

        questionsContainer.appendChild(questionCard);
    }

    async function fetchQuestions() {
        const response = await fetch('/questions');
        return response.json();
    }

    function submitPreferences(preferences) {
        fetch('/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences),
        })
        .then(response => response.json())
        .then(response => {
            const course = response.course; // Витягнути курс із об'єкта
            displayCourseRecommendation(course);
            showRestartButton();
        });
    }

    function displayCourseRecommendation(course) {
        const resultContainer = document.getElementById('result');
        resultContainer.classList.remove('hidden'); // Показати елемент результату
        if (course) {
            resultContainer.innerHTML = `
                <div class="course">
                    <h1 class="course__title">${course.title}</h1>
                    <div class="course__info">
                        <div class="course__info-basic">
                            <p class="course__description">${course.description}</p>
                            ${course.image_url ? `<img src="${course.image_url}" alt="${course.title}" class="course__image img-fluid mb-4" />` : ''}
                        </div>
                        <div class="course__info-detailed">
                            <p><strong>Duration:</strong> ${course.duration} weeks</p>
                            <p><strong>Status:</strong> ${course.status}</p>
                            <p><strong>Price:</strong> ${course.price ? `${course.price} UAH` : 'Free'}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultContainer.innerHTML = `<p>Курс не знайдено</p>`;
        }
    }

    function showRestartButton() {
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Почати заново';
        restartButton.classList.add('testing__btn', 'btn');
        restartButton.addEventListener('click', function () {
            resetTest();
        });
        document.getElementById('result').appendChild(restartButton);
    }

    function resetTest() {
        currentQuestionIndex = 0;
        preferences = {};
        document.getElementById('result').classList.add('hidden'); // Сховати елемент результату
        showQuestion(currentQuestionIndex);
    }

    showQuestion(currentQuestionIndex);
});
