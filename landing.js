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

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to 'dark'
const currentTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', currentTheme);
themeIcon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';

themeToggle?.addEventListener('click', () => {
  const theme = htmlElement.getAttribute('data-theme');
  const newTheme = theme === 'dark' ? 'light' : 'dark';

  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
});

// RPM meter scroll animation
function updateRPMMeter() {
  const scrollPercentage = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

  // Rotate needle from -90deg (left) to 90deg (right)
  const rotation = -90 + (scrollPercentage * 180);
  const rpmNeedle = document.getElementById('rpmNeedle');
  if (rpmNeedle) {
    rpmNeedle.style.transform = `rotate(${rotation}deg)`;
  }

  // Fill the arc based on scroll percentage
  const arcLength = 1000; // Approximate arc length for larger SVG
  const offset = arcLength - (scrollPercentage * arcLength);
  const rpmArc = document.getElementById('rpmArc');
  if (rpmArc) {
    rpmArc.style.strokeDashoffset = offset;
  }
}

window.addEventListener('scroll', updateRPMMeter);
updateRPMMeter();

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
