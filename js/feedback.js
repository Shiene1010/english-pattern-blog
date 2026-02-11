// Firebase 피드백 시스템
let selectedFeedback = null;
let currentPageId = null;

// Firebase 설정 (사용자가 Firebase 프로젝트 생성 후 입력해야 함)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase 초기화 여부 확인
let db = null;
let firebaseInitialized = false;

// Firebase 초기화 시도
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log('Firebase initialized successfully');
    }
} catch (error) {
    console.log('Firebase not initialized:', error.message);
}

// 페이지별 피드백 초기화
function initFeedback(pageId) {
    currentPageId = pageId;
    
    const posBtn = document.querySelector('.feedback-btn.positive');
    const negBtn = document.querySelector('.feedback-btn.negative');
    const submitBtn = document.querySelector('.submit-feedback');
    const commentBox = document.querySelector('.feedback-comment');
    const messageDiv = document.querySelector('.feedback-message');

    // 피드백 버튼 클릭 이벤트
    posBtn.addEventListener('click', () => selectFeedback('positive', posBtn, negBtn, submitBtn));
    negBtn.addEventListener('click', () => selectFeedback('negative', negBtn, posBtn, submitBtn));

    // 제출 버튼 클릭 이벤트
    submitBtn.addEventListener('click', () => submitFeedback(commentBox, messageDiv, submitBtn));
}

// 피드백 선택
function selectFeedback(type, selectedBtn, otherBtn, submitBtn) {
    selectedFeedback = type;
    
    // 버튼 스타일 업데이트
    selectedBtn.classList.add('selected');
    otherBtn.classList.remove('selected');
    
    // 제출 버튼 활성화
    submitBtn.disabled = false;
}

// 피드백 제출
async function submitFeedback(commentBox, messageDiv, submitBtn) {
    if (!selectedFeedback) {
        showMessage(messageDiv, '피드백을 선택해주세요.', 'error');
        return;
    }

    const comment = commentBox.value.trim();
    
    // Firebase가 초기화되지 않은 경우 로컬 저장소에 저장
    if (!firebaseInitialized) {
        saveFeedbackLocally(selectedFeedback, comment);
        showMessage(messageDiv, '피드백이 저장되었습니다. 감사합니다! (로컬 저장)', 'success');
        disableFeedbackForm(submitBtn);
        return;
    }

    // Firebase에 저장
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = '제출 중...';

        await db.collection('feedback').add({
            pageId: currentPageId,
            type: selectedFeedback,
            comment: comment || null,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        showMessage(messageDiv, '피드백이 제출되었습니다. 감사합니다!', 'success');
        disableFeedbackForm(submitBtn);
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showMessage(messageDiv, '피드백 제출 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = '피드백 제출';
    }
}

// 로컬 저장소에 피드백 저장 (Firebase 미사용 시)
function saveFeedbackLocally(type, comment) {
    const feedback = {
        pageId: currentPageId,
        type: type,
        comment: comment || null,
        timestamp: new Date().toISOString()
    };
    
    // 로컬 스토리지에서 기존 피드백 가져오기
    let allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
    allFeedback.push(feedback);
    localStorage.setItem('feedback', JSON.stringify(allFeedback));
    
    console.log('Feedback saved locally:', feedback);
}

// 메시지 표시
function showMessage(messageDiv, text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `feedback-message ${type}`;
    messageDiv.style.display = 'block';
    
    // 3초 후 메시지 숨기기
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// 피드백 폼 비활성화
function disableFeedbackForm(submitBtn) {
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });
    
    document.querySelector('.feedback-comment').disabled = true;
    submitBtn.textContent = '제출 완료';
    submitBtn.disabled = true;
}
