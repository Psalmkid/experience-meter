(function () {
    function computeScore() {
        const container = document.getElementById('list');
        const checkboxes = container ? container.querySelectorAll('input[type="checkbox"]:not([disabled])') : [];
        const total = checkboxes.length;
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        // More checked -> higher percentage. If nothing to check, treat as perfect (100%).
        const percent = total === 0 ? 100 : Math.round((checked / total) * 100);
        return { checked, total, percent };
    }

    function calculateComparisonAge(percent) {
        // Higher percentage = higher age (more experienced = compared to older person)
        // 0% = ~5 years old, 100% = ~70 years old
        return Math.max(5, Math.round(5 + (percent * 0.65)));
    }

    function calculateAndNavigate() {
        const score = computeScore();
        try {
            sessionStorage.setItem('grimScore', JSON.stringify(score));
        } catch (e) {
            console.warn('Could not save score to sessionStorage', e);
        }
        window.location.href = 'score.html';
    }

    function clearCheckboxes() {
        const container = document.getElementById('list');
        const checkboxes = container ? container.querySelectorAll('input[type="checkbox"]:not([disabled])') : [];
        checkboxes.forEach(cb => cb.checked = false);
        try { sessionStorage.removeItem('grimScore'); } catch (e) {}
    }

    function createSkullPop(event) {
        // Create multiple skulls per checkbox click
        const skullCount = Math.floor(Math.random() * 3) + 3; // 3-5 skulls
        const rect = event.target.getBoundingClientRect();
        
        for (let i = 0; i < skullCount; i++) {
            const skull = document.createElement('div');
            skull.className = 'skull-pop';
            skull.textContent = '💀';
            
            // Random position from checkbox
            const angle = (Math.random() * Math.PI * 2);
            const distance = 50 + Math.random() * 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            skull.style.setProperty('--tx', tx + 'px');
            skull.style.setProperty('--ty', ty + 'px');
            skull.style.left = (rect.left + rect.width / 2) + 'px';
            skull.style.top = (rect.top + rect.height / 2) + 'px';
            skull.style.transform = 'translate(-50%, -50%)';
            
            document.body.appendChild(skull);
            
            // Trigger animation
            setTimeout(() => skull.classList.add('animate'), 10);
            
            // Remove element after animation
            setTimeout(() => skull.remove(), 1200);
        }
    }


    // Score page initializer
    function initScorePage() {
        function getScore() {
            try {
                const raw = sessionStorage.getItem('grimScore');
                if (!raw) return null;
                return JSON.parse(raw);
            } catch (e) { return null; }
        }

        function shareText(score) {
            const age = calculateComparisonAge(score.percent);
            let text = `I scored ${score.percent}% on The Grim's Experience Meter — you're about as experienced as a ${age} year old. ${score.checked}/${score.total} items checked.`;
            if (age > 50) {
                text += ' 😅 you should seek help!';
            }
            return text;
        }

        function openPopup(url) {
            window.open(url, '_blank', 'noopener');
        }

        const score = getScore();
        const scoreArea = document.getElementById('score-area');
        const noData = document.getElementById('no-data');
        const percentEl = document.getElementById('percent');
        const ageComparisonEl = document.getElementById('ageComparison');

        if (!score) {
            if (noData) noData.style.display = 'block';
            if (scoreArea) scoreArea.style.display = 'none';
            return;
        }

        // Calculate comparison age
        const comparisonAge = calculateComparisonAge(score.percent);

        // show values
        if (percentEl) percentEl.textContent = score.percent + '%';
        if (ageComparisonEl) {
            let ageText = `You're about as experienced as a ${comparisonAge} year old`;
            if (comparisonAge > 50) {
                ageText += ' 😅 You should seek help!'
            }
            ageComparisonEl.textContent = ageText;
        }
        if (noData) noData.style.display = 'none';
        if (scoreArea) scoreArea.style.display = 'block';

        const text = shareText(score);
        const urlToShare = window.location.origin ? window.location.origin + window.location.pathname.replace(/score\.html$/, 'index.html') : 'index.html';

        const webShareBtn = document.getElementById('webShare');
        const whatsappBtn = document.getElementById('whatsapp');
        const twitterBtn = document.getElementById('twitter');
        const fbBtn = document.getElementById('facebook');
        const tgBtn = document.getElementById('telegram');
        const copyBtn = document.getElementById('copy');
        const retakeBtn = document.getElementById('retake');

        if (webShareBtn) webShareBtn.addEventListener('click', function () {
            if (navigator.share) {
                navigator.share({ title: 'My Grim Score', text: text, url: urlToShare }).catch(() => {});
                return;
            }
            alert('Web Share API not supported. Use the platform buttons below.');
        });

        if (whatsappBtn) whatsappBtn.addEventListener('click', function () {
            const wa = 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + urlToShare);
            openPopup(wa);
        });

        if (twitterBtn) twitterBtn.addEventListener('click', function () {
            const tw = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(urlToShare);
            openPopup(tw);
        });

        if (fbBtn) fbBtn.addEventListener('click', function () {
            const fb = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(urlToShare) + '&quote=' + encodeURIComponent(text);
            openPopup(fb);
        });

        if (tgBtn) tgBtn.addEventListener('click', function () {
            const tg = 'https://t.me/share/url?url=' + encodeURIComponent(urlToShare) + '&text=' + encodeURIComponent(text);
            openPopup(tg);
        });

        if (copyBtn) copyBtn.addEventListener('click', function () {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text + ' ' + urlToShare).then(function () { alert('Score copied to clipboard'); }, function () { alert('Could not copy'); });
            } else {
                prompt('Copy this text', text + ' ' + urlToShare);
            }
        });

        if (retakeBtn) retakeBtn.addEventListener('click', function () {
            try { sessionStorage.removeItem('grimScore'); } catch (e) {}
            window.location.href = 'index.html';
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const submit = document.getElementById('submit');
        const reset = document.getElementById('reset');
        if (submit) submit.addEventListener('click', calculateAndNavigate);
        if (reset) reset.addEventListener('click', clearCheckboxes);

        // Use event delegation for skull animation - works for all checkboxes
        const container = document.getElementById('list');
        if (container) {
            container.addEventListener('change', function(event) {
                if (event.target.type === 'checkbox' && !event.target.disabled) {
                    createSkullPop(event);
                }
            });
        }

        // Initialize score page behavior if present
        if (document.getElementById('score-area') || document.getElementById('percent')) {
            initScorePage();
        }
    });
})();