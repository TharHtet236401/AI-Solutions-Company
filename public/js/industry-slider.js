document.addEventListener('DOMContentLoaded', function() {
    const sliderContainer = document.querySelector('.slider-container');
    const slides = document.querySelectorAll('.industry-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.slider-dots');
    
    let currentIndex = 0;
    let isMobile = window.innerWidth <= 768;
    let isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    let slidesToShow = 3; // Default for desktop

    // Only initialize slider if not on mobile or tablet
    function initializeSlider() {
        if (!isMobile && !isTablet) {
            updateSlidesToShow();
            // Create dots
            slides.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('slider-dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });

            // Add event listeners for buttons
            prevBtn.addEventListener('click', previousSlide);
            nextBtn.addEventListener('click', nextSlide);

            // Update dots and buttons
            updateSlider();
        }
    }

    function updateSlidesToShow() {
        if (window.innerWidth > 1200) {
            slidesToShow = 3;
        } else if (window.innerWidth > 1024) {
            slidesToShow = 2;
        } else {
            slidesToShow = 1;
        }
    }

    function updateSliderState() {
        isMobile = window.innerWidth <= 768;
        isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

        if (isMobile || isTablet) {
            // Remove transform and transition for grid layout
            sliderContainer.style.transform = 'none';
            sliderContainer.style.transition = 'none';
            // Hide navigation elements
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
        } else {
            updateSlidesToShow();
            updateSlider();
            // Show navigation elements
            if (prevBtn) prevBtn.style.display = 'flex';
            if (nextBtn) nextBtn.style.display = 'flex';
            if (dotsContainer) dotsContainer.style.display = 'flex';
        }
    }

    function goToSlide(index) {
        if (!isMobile && !isTablet && canSlide()) {
            currentIndex = Math.min(Math.max(index, 0), slides.length - slidesToShow);
            updateSlider();
        }
    }

    function previousSlide() {
        if (!isMobile && !isTablet && canSlide() && currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    }

    function nextSlide() {
        if (!isMobile && !isTablet && canSlide() && currentIndex < slides.length - slidesToShow) {
            currentIndex++;
            updateSlider();
        }
    }

    function canSlide() {
        return slides.length > slidesToShow;
    }

    function updateSlider() {
        if (!isMobile && !isTablet) {
            const offset = -currentIndex * (100 / slidesToShow);
            sliderContainer.style.transform = `translateX(${offset}%)`;
            updateDots();
            updateButtons();
        }
    }

    function updateDots() {
        const dots = document.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function updateButtons() {
        if (prevBtn && nextBtn) {
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= slides.length - slidesToShow;
            
            // Update visibility
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            nextBtn.style.opacity = currentIndex >= slides.length - slidesToShow ? '0.5' : '1';
        }
    }

    // Initialize slider
    initializeSlider();

    // Handle window resize
    window.addEventListener('resize', updateSliderState);

    // Optional: Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer.addEventListener('touchstart', (e) => {
        if (!isMobile && !isTablet && canSlide()) {
            touchStartX = e.changedTouches[0].screenX;
        }
    });

    sliderContainer.addEventListener('touchend', (e) => {
        if (!isMobile && !isTablet && canSlide()) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentIndex < slides.length - slidesToShow) {
                nextSlide();
            } else if (diff < 0 && currentIndex > 0) {
                previousSlide();
            }
        }
    }

    // Optional: Auto-play
    let autoplayInterval;
    
    function startAutoplay() {
        if (canSlide()) {
            autoplayInterval = setInterval(() => {
                if (currentIndex < slides.length - slidesToShow) {
                    nextSlide();
                } else {
                    goToSlide(0);
                }
            }, 5000);
        }
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Start autoplay and handle hover only if we can slide
    if (canSlide()) {
        startAutoplay();
        sliderContainer.addEventListener('mouseenter', stopAutoplay);
        sliderContainer.addEventListener('mouseleave', startAutoplay);
    }
}); 