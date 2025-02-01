document.addEventListener('DOMContentLoaded', function() {
    const sliderContainer = document.querySelector('.slider-container');
    const slides = document.querySelectorAll('.industry-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.slider-dots');

    let currentIndex = 0;
    let slidesToShow = 3;
    const totalSlides = slides.length;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    function updateSlidesToShow() {
        if (window.innerWidth > 1200) {
            slidesToShow = 3;
        } else if (window.innerWidth > 768) {
            slidesToShow = 2;
        } else {
            slidesToShow = 1;
        }
        updateSlider();
    }

    function updateSlider() {
        const slideWidth = 100 / slidesToShow;
        const offset = -currentIndex * slideWidth;
        sliderContainer.style.transform = `translateX(${offset}%)`;

        // Update active states for visible slides
        slides.forEach((slide, index) => {
            const isActive = index >= currentIndex && index < currentIndex + slidesToShow;
            slide.classList.toggle('active', isActive);
            // Also update pointer events based on visibility
            slide.style.pointerEvents = isActive ? 'auto' : 'none';
        });

        // Update dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });

        // Update buttons visibility and state
        prevBtn.style.display = 'flex'; // Always show buttons
        nextBtn.style.display = 'flex';
        
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= totalSlides - slidesToShow;

        // Update button opacity based on state
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentIndex >= totalSlides - slidesToShow ? '0.5' : '1';
    }

    function goToSlide(index) {
        currentIndex = Math.min(Math.max(index, 0), totalSlides - slidesToShow);
        updateSlider();
    }

    prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
    });

    // Handle window resize
    window.addEventListener('resize', updateSlidesToShow);

    // Initialize
    updateSlidesToShow();

    // Optional: Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    sliderContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentIndex < totalSlides - slidesToShow) {
                // Swipe left
                goToSlide(currentIndex + 1);
            } else if (diff < 0 && currentIndex > 0) {
                // Swipe right
                goToSlide(currentIndex - 1);
            }
        }
    }

    // Optional: Auto-play
    let autoplayInterval;
    
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            if (currentIndex < totalSlides - slidesToShow) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(0);
            }
        }, 5000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Start autoplay and handle hover
    startAutoplay();
    sliderContainer.addEventListener('mouseenter', stopAutoplay);
    sliderContainer.addEventListener('mouseleave', startAutoplay);
}); 