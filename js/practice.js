/**
 * 연습 문제 정답 확인 함수
 * @param {string} questionId - 질문 ID (예: 'q6')
 * @param {string} correctAnswer - 정답 단어
 */
function checkAnswer(questionId, correctAnswer) {
    const input = document.getElementById(questionId + '-input');
    const resultDiv = document.getElementById(questionId + '-result');
    const answerDiv = document.getElementById(questionId + '-answer');
    
    // 입력값 정규화 (소문자 변환, 공백 제거)
    const userAnswer = input.value.trim().toLowerCase();
    const correct = correctAnswer.trim().toLowerCase();

    if (userAnswer === correct) {
        // 정답
        resultDiv.textContent = '🎉 정답입니다!';
        resultDiv.className = 'result-message correct';
        answerDiv.style.display = 'block'; // 정답 설명 표시
        input.style.borderColor = '#27ae60';
    } else {
        // 오답
        resultDiv.textContent = '❌ 다시 시도해보세요.';
        resultDiv.className = 'result-message wrong';
        answerDiv.style.display = 'none';
        input.style.borderColor = '#e74c3c';
        
        // 입력창에 포커스 후 흔들림 효과 (CSS animation 추가 가능)
        input.focus();
    }
}

/**
 * 정답 토글 함수 (서술형/번역 문제용)
 * @param {HTMLElement} button - 클릭된 버튼 요소
 */
function toggleAnswer(button) {
    const answer = button.nextElementSibling;
    if (answer.style.display === 'block') {
        answer.style.display = 'none';
        button.textContent = '정답 보기';
    } else {
        answer.style.display = 'block';
        button.textContent = '정답 숨기기';
    }
}

// Enter 키 입력 시 정답 확인 기능 추가
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.practice-input');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // 해당 input의 부모 요소에서 버튼 찾기
                const btn = input.parentElement.parentElement.querySelector('.check-answer-btn');
                if (btn) btn.click();
            }
        });
    });
});
