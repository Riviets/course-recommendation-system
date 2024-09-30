document.addEventListener('DOMContentLoaded', async function () {
    let currentQuestionIndex = 0;
    const questions = await fetchQuestions();
    const questionsContainer = document.getElementById('questions-container');
    const form = document.getElementById('preferences-form');
    let preferences = {};

    // Функція для відображення поточного питання
    function showQuestion(index) {
        questionsContainer.innerHTML = ''; // Очищуємо контейнер перед новим питанням

        if (index >= questions.length) {
            form.querySelector('button[type="submit"]').style.display = 'block'; // Показуємо кнопку після завершення питань
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

                // Умовна логіка для пропуску питання про вартість
                if (question.id === 'status' && this.value === 'free') {
                    currentQuestionIndex++; // Пропустити питання про вартість
                }

                // Показуємо наступне питання після відповіді
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

    // Функція для отримання питань з сервера
    async function fetchQuestions() {
        const response = await fetch('/questions');
        return response.json();
    }

    // Обробка надсилання форми
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Запобігаємо звичайному надсиланню форми

        submitPreferences(preferences);
    });

    // Надсилання відповідей на сервер і отримання рекомендації
    function submitPreferences(preferences) {
        fetch('/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences),
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('result').textContent = `Рекомендований курс: ${data.course.title}`;
        });
    }

    // Спочатку ховаємо кнопку відправки і показуємо перше питання
    form.querySelector('button[type="submit"]').style.display = 'none';
    showQuestion(currentQuestionIndex);
});
