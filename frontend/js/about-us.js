document.addEventListener('DOMContentLoaded', function () {
    // Load Navbar
    fetch('../html/navbar.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('navbar-container').innerHTML = html;
  
        // ✅ Only run this after navbar is added
        setupAuthLinkBehavior();
      })
      .catch(error => {
        console.error("Failed to load navbar:", error);
      });
  
    function setupAuthLinkBehavior() {
      const authLink = document.getElementById("auth-link");
      const token = localStorage.getItem("token");
  
      if (!authLink) return;
  
      if (token) {
        authLink.textContent = "SIGN OUT";
        authLink.href = "#";
  
        authLink.onclick = function (e) {
          e.preventDefault();

          const confirmed = confirm("Are you sure you want to sign out?");
          if (!confirmed) return;
          
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("userId");
  
          // Set it back to SIGN UP mode
          authLink.textContent = "SIGN UP";
          authLink.href = "/frontend/html/login.html";
          authLink.onclick = function (e) {
            e.preventDefault();
            window.location.href = "/frontend/html/login.html";
          };
        };
      } else {
        authLink.textContent = "SIGN UP";
        authLink.href = "/frontend/html/login.html";
        authLink.onclick = function (e) {
          e.preventDefault();
          window.location.href = "/frontend/html/login.html";
        };
      }
    }

    // Load Footer
    fetch('../html/footer.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('footer-container').innerHTML = html;
        })
        .catch(error => {
            console.error('Failed to load footer:', error);
        });

    // Load Testimonials from Backend
    function fetchAndRenderTestimonials() {
        fetch('http://localhost:5000/api/reviews')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                const carousel = document.getElementById('testimonials-carousel');
                carousel.innerHTML = '';
    
                if (!data || data.length === 0) {
                    carousel.innerHTML = '<p>No testimonials available yet.</p>';
                    return;
                }
    
                // ✅ Show only the latest 2 reviews
                data.slice(-2).forEach(review => {
                    const comment = review.comment || '';
                    const stars = '★'.repeat(review.stars || 0);
    
                    const slide = document.createElement('div');
                    slide.className = 'testimonial-slide';
                    slide.innerHTML = `
                        <p>"${comment}"</p>
                        <span>${stars}</span>
                    `;
                    carousel.appendChild(slide);
                });
            })
            .catch(error => {
                console.error('Error loading testimonials:', error);
            });
    }
    
    fetchAndRenderTestimonials();
    
    // Handle Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;

            // Simulate dummy success response
            setTimeout(() => {
                alert("✅ Thank you! Your message has been sent successfully.");
                contactForm.reset();
            }, 500); // simulate a slight delay like a real request

        });
    }

    fetch('http://localhost:5000/api/statistics/home-stats')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        document.getElementById('not-rented-today').textContent = data.notRentedToday ?? 'N/A';
        document.getElementById('total-cars').textContent = data.totalCars ?? 'N/A';
        document.getElementById('total-reviews').textContent = data.totalReviews ?? 'N/A';
        document.getElementById('total-reservations').textContent = data.totalReservations ?? 'N/A';
    })
    .catch(error => {
        console.error('Failed to fetch home stats:', error);
    });    
    fetchAndRenderHomeStats();    
});
