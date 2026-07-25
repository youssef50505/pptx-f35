/* ============================================================
   F-35 LIGHTNING II — PRESENTATION ENGINE
   Handles slide transitions, 3D camera orchestration,
   keyboard/click navigation, progress bar, and loading state.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM References ---
    const slides      = document.querySelectorAll('.slide');
    const prevBtn     = document.getElementById('prev-btn');
    const nextBtn     = document.getElementById('next-btn');
    const counter     = document.getElementById('slide-counter');
    const progressBar = document.getElementById('progress-bar');
    const modelViewer = document.getElementById('fighter-model');
    const overlay     = document.getElementById('loading-overlay');

    // --- State ---
    let current    = 0;
    const total    = slides.length;
    let isAnimating = false;     // debounce rapid navigation
    const DEBOUNCE  = 650;       // ms — matches CSS transition duration

    // =========================================================
    // LOADING OVERLAY
    // =========================================================
    if (modelViewer) {
        // model-viewer fires 'load' once the GLB is fully parsed
        modelViewer.addEventListener('load', () => {
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 400); // slight extra delay for polish
        });

        // Fallback: hide overlay after 8 s even if model fails
        setTimeout(() => {
            if (!overlay.classList.contains('hidden')) {
                overlay.classList.add('hidden');
            }
        }, 8000);
    } else {
        // No model-viewer at all — hide immediately
        overlay.classList.add('hidden');
    }

    // =========================================================
    // SLIDE NAVIGATION
    // =========================================================
    function goTo(index) {
        if (index < 0 || index >= total || index === current || isAnimating) return;

        // Debounce
        isAnimating = true;
        setTimeout(() => { isAnimating = false; }, DEBOUNCE);

        const direction = index > current ? 1 : -1;

        slides.forEach((slide, i) => {
            slide.classList.remove('slide--active', 'slide--prev');
            if (i === index) {
                slide.classList.add('slide--active');
            } else if (i < index) {
                slide.classList.add('slide--prev');
            }
        });

        current = index;

        // --- Camera orbit ---
        const orbit = slides[current].dataset.orbit;
        if (orbit && modelViewer) {
            modelViewer.cameraOrbit = orbit;
        }

        // --- HUD updates ---
        const slideNum = String(current + 1).padStart(2, '0');
        const totalNum = String(total).padStart(2, '0');
        counter.textContent = `${slideNum} / ${totalNum}`;

        // Progress bar
        const pct = ((current + 1) / total) * 100;
        progressBar.style.width = `${pct}%`;

        // Button opacity
        prevBtn.style.opacity        = current === 0 ? '0.25' : '1';
        prevBtn.style.pointerEvents  = current === 0 ? 'none' : 'auto';
        nextBtn.style.opacity        = current === total - 1 ? '0.25' : '1';
        nextBtn.style.pointerEvents  = current === total - 1 ? 'none' : 'auto';
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // =========================================================
    // EVENT LISTENERS
    // =========================================================
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowRight':
            case ' ':          // Space bar
                e.preventDefault();
                next();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prev();
                break;
            case 'Home':
                e.preventDefault();
                goTo(0);
                break;
            case 'End':
                e.preventDefault();
                goTo(total - 1);
                break;
        }
    });

    // Touch / swipe support
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const delta = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(delta) > 60) {
            delta < 0 ? next() : prev();
        }
    }, { passive: true });

    // =========================================================
    // INITIALISE
    // =========================================================
    goTo(0);
});
