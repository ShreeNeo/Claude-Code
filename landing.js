// Update hero clock
function updateClock() {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourHand = document.getElementById('hourHand');
  const minuteHand = document.getElementById('minuteHand');
  const secondHand = document.getElementById('secondHand');

  if (hourHand && minuteHand && secondHand) {
    hourHand.style.transform = `rotate(${(hours * 30) + (minutes * 0.5)}deg)`;
    minuteHand.style.transform = `rotate(${minutes * 6}deg)`;
    secondHand.style.transform = `rotate(${seconds * 6}deg)`;
  }
}
updateClock();
setInterval(updateClock, 1000);

// Scroll-based clock hand rotation (0deg at top, 360deg at bottom)
function updateScrollClock() {
  const scrollPercentage = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  const rotation = scrollPercentage * 360;
  const scrollHand = document.getElementById('scrollHand');
  if (scrollHand) {
    scrollHand.style.transform = `rotate(${rotation}deg)`;
  }
}

window.addEventListener('scroll', updateScrollClock);
updateScrollClock();

// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

document.querySelectorAll('.feature-card, .timeline-step, .pricing-card').forEach(el => {
  observer.observe(el);
});

// Stagger animations
document.querySelectorAll('.feature-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
});

document.querySelectorAll('.timeline-step').forEach((step, i) => {
  step.style.transitionDelay = `${i * 0.2}s`;
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
