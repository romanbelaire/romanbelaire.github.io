/* Photo Carousel — vanilla JS, no dependencies */
(function () {

	function initCarousel(root) {
		var slides = Array.prototype.slice.call(root.querySelectorAll('.photo-carousel__slide'));
		var dotsWrap = root.querySelector('.photo-carousel__dots');
		var prevBtn = root.querySelector('.photo-carousel__arrow--prev');
		var nextBtn = root.querySelector('.photo-carousel__arrow--next');
		var viewport = root.querySelector('.photo-carousel__viewport');
		var count = slides.length;

		if (!count) return;

		var current = 0;
		slides.forEach(function (slide, i) {
			if (slide.getAttribute('data-state') === 'active') current = i;
		});

		var dots = slides.map(function (_, i) {
			var dot = document.createElement('button');
			dot.type = 'button';
			dot.className = 'photo-carousel__dot' + (i === current ? ' is-active' : '');
			dot.setAttribute('aria-label', 'Go to photo ' + (i + 1));
			dot.addEventListener('click', function () {
				goTo(i);
			});
			dotsWrap.appendChild(dot);
			return dot;
		});

		function setStates(newIndex) {
			slides.forEach(function (slide, i) {
				var state;
				if (i === newIndex) state = 'active';
				else if (i === (newIndex - 1 + count) % count) state = 'prev';
				else if (i === (newIndex + 1) % count) state = 'next';
				else state = 'hidden';
				slide.setAttribute('data-state', state);
			});
			dots.forEach(function (dot, i) {
				dot.classList.toggle('is-active', i === newIndex);
			});
		}

		function goTo(newIndex) {
			newIndex = ((newIndex % count) + count) % count;
			if (newIndex === current) return;
			current = newIndex;
			setStates(current);
			resetAutoplay();
		}

		function next() { goTo(current + 1); }
		function prev() { goTo(current - 1); }

		prevBtn.addEventListener('click', prev);
		nextBtn.addEventListener('click', next);

		root.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
			else if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
		});

		// Swipe / drag support
		var pointerStartX = null;
		viewport.addEventListener('pointerdown', function (e) {
			pointerStartX = e.clientX;
		});
		viewport.addEventListener('pointerup', function (e) {
			if (pointerStartX === null) return;
			var dx = e.clientX - pointerStartX;
			pointerStartX = null;
			if (Math.abs(dx) > 40) {
				if (dx < 0) next(); else prev();
			}
		});

		// Autoplay
		var autoplayMs = parseInt(root.getAttribute('data-autoplay'), 10) || 0;
		var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var timer = null;

		function startAutoplay() {
			if (!autoplayMs || reducedMotion || count < 2) return;
			stopAutoplay();
			timer = setInterval(next, autoplayMs);
		}

		function stopAutoplay() {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		}

		function resetAutoplay() {
			if (timer) startAutoplay();
		}

		root.addEventListener('mouseenter', stopAutoplay);
		root.addEventListener('mouseleave', startAutoplay);
		root.addEventListener('focusin', stopAutoplay);
		root.addEventListener('focusout', startAutoplay);

		setStates(current);
		startAutoplay();
	}

	function init() {
		var carousels = document.querySelectorAll('.photo-carousel');
		for (var i = 0; i < carousels.length; i++) initCarousel(carousels[i]);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

})();
