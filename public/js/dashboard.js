// 대시보드 스크립트
let db = null;
let firebaseInitialized = false;

// Firebase 설정 (feedback.js와 동일)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase 초기화
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseInitialized = true;
        loadDashboard();
    } else {
        loadLocalDashboard();
    }
} catch (error) {
    console.log('Firebase not initialized, loading local data');
    loadLocalDashboard();
}

// Firebase에서 대시보드 데이터 로드
async function loadDashboard() {
    try {
        const snapshot = await db.collection('feedback').get();
        const feedbackData = [];

        snapshot.forEach(doc => {
            feedbackData.push(doc.data());
        });

        renderDashboard(feedbackData);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('dashboard-content').innerHTML =
            '<p style="color: red; text-align: center;">데이터를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 로컬 스토리지에서 대시보드 데이터 로드
function loadLocalDashboard() {
    const feedbackData = JSON.parse(localStorage.getItem('feedback') || '[]');
    renderDashboard(feedbackData);
}

// 대시보드 렌더링
function renderDashboard(feedbackData) {
    const pages = ['basic', 'structure', 'example', 'practice'];
    const pageNames = {
        'basic': '1. 기본 용법',
        'structure': '2. 구조 설명',
        'example': '3. The Way We Were',
        'practice': '4. 연습 문제'
    };

    let totalPositive = 0;
    let totalNegative = 0;
    let totalFeedback = 0;

    const pageStats = {};
    pages.forEach(page => {
        pageStats[page] = { positive: 0, negative: 0, comments: [], total: 0 };
    });

    // 데이터 집계
    feedbackData.forEach(feedback => {
        const page = feedback.pageId;
        if (pageStats[page]) {
            pageStats[page].total++;
            totalFeedback++;

            if (feedback.type === 'positive') {
                pageStats[page].positive++;
                totalPositive++;
            } else {
                pageStats[page].negative++;
                totalNegative++;
            }

            if (feedback.comment) {
                pageStats[page].comments.push({
                    text: feedback.comment,
                    type: feedback.type,
                    timestamp: feedback.timestamp
                });
            }
        }
    });

    // 전체 만족도 계산
    const approvalRating = totalFeedback > 0 ? Math.round((totalPositive / totalFeedback) * 100) : 0;

    // 분석: 최고/최악의 페이지 찾기
    let bestPage = '-';
    let worstPage = '-';
    let highestRating = -1;
    let lowestRating = 101;

    pages.forEach(page => {
        const stats = pageStats[page];
        if (stats.total > 0) {
            const rating = (stats.positive / stats.total) * 100;
            if (rating > highestRating) {
                highestRating = rating;
                bestPage = pageNames[page];
            }
            if (rating < lowestRating) {
                lowestRating = rating;
                worstPage = pageNames[page];
            }
        }
    });

    if (totalFeedback === 0) {
        bestPage = '데이터 없음';
        worstPage = '데이터 없음';
    }

    // 1. 핵심 지표 (KPI Cards)
    const indicatorsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${totalFeedback}</div>
                <div class="stat-label">총 피드백</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #27ae60;">${approvalRating}%</div>
                <div class="stat-label">전체 만족도</div>
            </div>
            <div class="stat-card">
                <div class="stat-label" style="margin-bottom: 5px;">🏆 베스트 페이지</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: #2c3e50;">${bestPage}</div>
                <div style="font-size: 0.9rem; color: #7f8c8d;">(만족도 ${totalFeedback > 0 ? Math.round(highestRating) : 0}%)</div>
            </div>
            <div class="stat-card">
                <div class="stat-label" style="margin-bottom: 5px;">⚠️ 개선 필요 페이지</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: #e74c3c;">${worstPage}</div>
                <div style="font-size: 0.9rem; color: #7f8c8d;">(만족도 ${totalFeedback > 0 ? Math.round(lowestRating) : 0}%)</div>
            </div>
        </div>
    `;

    // 2. 페이지별 상세 분석
    let pagesHTML = '';
    pages.forEach(page => {
        const stats = pageStats[page];
        const rating = stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0;

        let commentsHTML = '';
        if (stats.comments.length > 0) {
            commentsHTML = '<div class="comments-list"><h4>📝 최근 코멘트</h4>';
            stats.comments.slice(-3).reverse().forEach(comment => { // 최근 3개만
                const icon = comment.type === 'positive' ? '👍' : '👎';
                const date = comment.timestamp ?
                    (comment.timestamp.toDate ? comment.timestamp.toDate().toLocaleDateString() : new Date(comment.timestamp).toLocaleDateString())
                    : '-';
                commentsHTML += `
                    <div class="comment-item" style="border-left: 3px solid ${comment.type === 'positive' ? '#27ae60' : '#e74c3c'}">
                        <div style="display: flex; justify-content: space-between;">
                            <span>${icon} ${comment.text}</span>
                            <span class="comment-meta">${date}</span>
                        </div>
                    </div>
                `;
            });
            commentsHTML += '</div>';
        } else {
            commentsHTML = '<p style="color: #999; font-size: 0.9rem; margin-top: 15px;">등록된 코멘트가 없습니다.</p>';
        }

        pagesHTML += `
            <div class="page-feedback">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3>${pageNames[page]}</h3>
                    <div style="text-align: right;">
                        <span style="font-size: 1.5rem; font-weight: bold; color: ${rating >= 70 ? '#27ae60' : (rating >= 40 ? '#f39c12' : '#e74c3c')}">${rating}%</span>
                        <span style="font-size: 0.9rem; color: #7f8c8d;">만족도</span>
                    </div>
                </div>
                
                <div class="feedback-bar" style="background: #eee; height: 20px;">
                    <div class="bar-positive" style="width: ${rating}%; background: #27ae60; height: 100%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #666; margin-bottom: 15px;">
                    <span>긍정: ${stats.positive}</span>
                    <span>부정: ${stats.negative}</span>
                    <span>총: ${stats.total}</span>
                </div>

                ${commentsHTML}
            </div>
        `;
    });

    document.getElementById('dashboard-content').innerHTML = indicatorsHTML + pagesHTML;
}
