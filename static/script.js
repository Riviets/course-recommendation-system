document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('preferences-form');
    const questionsContainer = document.getElementById('questions-container');
    const resultContainer = document.getElementById('result');
    const restartBtn = document.createElement('button');

    // Отримання питань від сервера
    fetch('/get-questions')
        .then(response => response.json())
        .then(data => {
            data.forEach((question) => {
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
                questionsContainer.appendChild(div);
            });

            // Додавання кнопки "Надіслати"
            const submitBtn = document.createElement('button');
            submitBtn.innerText = 'Отримати рекомендацію';
            submitBtn.classList.add('btn', 'testing__btn');
            form.appendChild(submitBtn);

            form.addEventListener('submit', function (e) {
                e.preventDefault();

                const formData = new FormData(form);
                const answers = {};
                formData.forEach((value, key) => {
                    answers[key] = value;
                });

                // Відправка відповідей на сервер
                fetch('/submit-answers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(answers)
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
                                        </div>
                                    </div>
                                </div>
                            `;
                        }

                        resultContainer.classList.remove('hidden');
                        form.classList.add('hidden');
                        restartBtn.classList.remove('hidden');
                    });
            });

            // Додавання кнопки "Почати заново"
            restartBtn.innerText = 'Почати заново';
            restartBtn.classList.add('btn', 'testing__btn');
            restartBtn.classList.add('hidden');
            form.appendChild(restartBtn);

            restartBtn.addEventListener('click', function () {
                form.reset();
                resultContainer.classList.add('hidden');
                form.classList.remove('hidden');
                restartBtn.classList.add('hidden');
            });
        })
        .catch(error => console.error('Error fetching questions:', error));
});
