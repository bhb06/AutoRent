document.addEventListener('DOMContentLoaded', function () {
    // Load Navbar
    fetch('../html/navbar.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('navbar-container').innerHTML = html;

    // ✅ Wait until navbar is inserted, then run the logic
    const authLink = document.getElementById("auth-link"); // Make sure you use the correct ID from navbar.html
    const token = localStorage.getItem("token");

    if (authLink) {
        if (token) {
          authLink.textContent = "SIGN OUT";
          authLink.href = "#";
          authLink.addEventListener("click", function handleLogout(e) {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
      
            // Update to SIGN UP
            authLink.textContent = "SIGN UP";
            authLink.href = "/frontend/html/login.html";
      
            // ✅ Detach old listener (optional safety)
            authLink.removeEventListener("click", handleLogout);
      
            // ✅ Reattach fresh listener for SIGN UP
            authLink.addEventListener("click", function handleSignup(e) {
              e.preventDefault();
              window.location.href = "/frontend/html/login.html";
            });
          });
        } else {
          authLink.textContent = "SIGN UP";
          authLink.href = "/frontend/html/login.html";
          authLink.addEventListener("click", function handleSignup(e) {
            e.preventDefault();
            window.location.href = "/frontend/html/login.html";
          });
        }
      }
      
  })
  .catch(error => {
    console.error("Failed to load navbar:", error);
  });
    // Load Footer
    fetch('../html/footer.html')
        .then(res => res.text())
        .then(html => document.getElementById('footer-container').innerHTML = html)
        .catch(err => console.error('Failed to load footer:', err));

    // === Hero Slider ===
    const rentNowBtn = document.querySelector('.order-now');
    const heroImageSlider = document.querySelector('.hero-image-slider');
    const carModel = document.getElementById('car-model');
    const price = document.getElementById('price');

    let currentCarId = null;
    let carsData = [];
    let currentImageIndex = 0;
    const imageInterval = 3000;

    function updateHeroText(car) {
        carModel.textContent = car.model;
        price.textContent = `$${car.dailyFee}`;
    }

    function changeImage() {
        if (carsData.length === 0) return;

        const nextCar = carsData[currentImageIndex];
        currentCarId = nextCar._id;
        const imageUrl = nextCar.image.startsWith('/images/')
            ? `http://localhost:5000${nextCar.image}`
            : `http://localhost:5000/images/${nextCar.image}`;

        let activeImage = heroImageSlider.querySelector('img');

        if (!activeImage) {
            activeImage = document.createElement('img');
            heroImageSlider.appendChild(activeImage);
        }

        activeImage.src = imageUrl;
        activeImage.alt = nextCar.model;
        activeImage.className = 'slide active';

        updateHeroText(nextCar);
        currentImageIndex = (currentImageIndex + 1) % carsData.length;
    }

    if (rentNowBtn) {
        rentNowBtn.addEventListener('click', () => {
            if (currentCarId) {
                window.location.href = `../html/reservations.html?carId=${currentCarId}`;
            } else {
                alert("Car data not ready yet.");
            }
        });
    }    

    fetch('http://localhost:5000/api/cars')
        .then(res => res.json())
        .then(data => {
            carsData = data;
            if (carsData.length > 0) {
                changeImage(); // show first car
                setInterval(changeImage, imageInterval); // rotate
            }
        })
        .catch(err => {
            console.error('Error fetching cars:', err);
            carModel.textContent = '';
            price.textContent = '';
        });

    // === MOST WANTED CAR SECTION ===
    const mostWantedWrapper = document.querySelector('.most-wanted-wrapper');
    const averageFeeBox = document.querySelector('.average-fee-box');

    function updateAverageDailyFeePlaceholder(averageFee) {
        const averageFeeDisplay = document.getElementById('averageDailyFee');
        if (averageFeeDisplay) {
            averageFeeDisplay.textContent = `$${averageFee}`;
        }
    }

    function displayMostWantedCar(carDetails) {
        if (carDetails && carDetails.image) {
            const imageUrl = carDetails.image.startsWith('/images/')
                ? `http://localhost:5000${carDetails.image}`
                : `http://localhost:5000/images/${carDetails.image}`;

            const carCard = document.createElement('div');
            carCard.classList.add('car-card');
            carCard.innerHTML = `
    <div class="most-popular-tag">Most Popular</div>
    <img src="${imageUrl}" alt="${carDetails.brand} ${carDetails.model}">
    <h3 class="car-model">${carDetails.brand} ${carDetails.model}</h3>
    <p class="car-price">Daily Fee: $${carDetails.dailyFee}</p>
    <button class="button view-details-btn" data-id="${carDetails._id}">View Details</button>
    <button class="button reserve-btn" data-car-id="${carDetails._id}">Reserve</button>
`;
const viewDetailsBtn = carCard.querySelector('.view-details-btn');
if (viewDetailsBtn) {
    viewDetailsBtn.addEventListener('click', () => {
        fetch(`http://localhost:5000/api/cars/${carDetails._id}`)
            .then(res => res.json())
            .then(data => {
                if (data) {
                    const carDetailsModel = document.getElementById('carDetailsModel');
                    const carDetailsInfo = document.getElementById('carDetailsInfo');
                    carDetailsModel.textContent = `${data.brand} ${data.model}`;
                    carDetailsInfo.innerHTML = `
                        <p><strong>Year:</strong> ${data.year || 'N/A'}</p>
                        <p><strong>Gearbox:</strong> ${data.gearbox || 'N/A'}</p>
                        <p><strong>Fuel Type:</strong> ${data.fuelType || 'N/A'}</p>
                        <p><strong>AC:</strong> ${data.ac ? 'Yes' : 'No'}</p>
                        <p><strong>Electric Windows:</strong> ${data.electricWindows ? 'Yes' : 'No'}</p>
                    `;
                    document.getElementById('carDetailsModal').style.display = 'block';
                }
            });
    });
}
const carDetailsModal = document.getElementById('carDetailsModal');
const closeCarDetailsModalButton = document.getElementById('closeCarDetailsModal');

// Close when clicking the "X" button
if (closeCarDetailsModalButton) {
    closeCarDetailsModalButton.addEventListener('click', () => {
        carDetailsModal.style.display = 'none';
    });
}

// Close when clicking outside the modal
window.addEventListener('click', (event) => {
    if (event.target === carDetailsModal) {
        carDetailsModal.style.display = 'none';
    }
});

            mostWantedWrapper.innerHTML = '';
            mostWantedWrapper.appendChild(carCard);
            mostWantedWrapper.appendChild(averageFeeBox);

            const reserveBtn = carCard.querySelector('.reserve-btn');
            reserveBtn.addEventListener('click', () => {
                window.location.href = `../html/reservations.html?carId=${carDetails._id}`;
            });
        } else {
            mostWantedWrapper.innerHTML = '<p>Could not retrieve most popular car information.</p>';
        }
    }

    fetch('http://localhost:5000/api/statistics/business')
        .then(res => res.json())
        .then(data => {
            if (data.mostPopularCar) displayMostWantedCar(data.mostPopularCar);
            if (data.averageDailyFee) updateAverageDailyFeePlaceholder(data.averageDailyFee);
        })
        .catch(err => {
            console.error('Error fetching statistics:', err);
            mostWantedWrapper.innerHTML = '<p>Failed to load statistics.</p>';
        });

        function loadBranches() {
            fetch('http://localhost:5000/api/branches')
                .then(response => response.json())
                .then(branches => {
                    const container = document.getElementById('branchContainer');
                    container.innerHTML = ''; // Clear existing
                    branches.forEach(branch => {
                        const branchDiv = document.createElement('div');
                        branchDiv.classList.add('branch');
        
                        const mapIframe = branch.googleLocationLink
                            ? `<div class="branch-map-container">
                                <iframe src="${branch.googleLocationLink}"
                                        width="400"
                                        height="300"
                                        style="border:0;"
                                        allowfullscreen=""
                                        loading="lazy"
                                        referrerpolicy="no-referrer-when-downgrade"></iframe>
                               </div>`
                            : '';
        
                            branchDiv.innerHTML = `
  <h3>${branch.name}</h3>
  ${mapIframe}
  <a href="#" class="view-branch-details-button" data-branch='${JSON.stringify(branch)}'>View Details</a>
`;                         
        
                        container.appendChild(branchDiv);
        
                        const viewDetailsBtn = branchDiv.querySelector('.view-branch-details-button');
                        if (viewDetailsBtn) {
                            viewDetailsBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                const branchData = JSON.parse(e.target.dataset.branch);
        
                                document.getElementById('branchModalTitle').textContent = branchData.name;
                                document.getElementById('branchModalAddress').textContent = `📍 Address: ${branchData.address}`;
                                document.getElementById('branchModalPhone').textContent = `📞 Phone: ${branchData.phone}`;
                                document.getElementById('branchModalHours').textContent = `🕒 Hours: ${branchData.openingTime} – ${branchData.closingTime}`;
        
                                document.getElementById('branchDetailsModal').style.display = 'block';
                            });
                        }
                    });
                })
                .catch(error => {
                    console.error('Error fetching branches:', error);
                    document.getElementById('branchContainer').innerHTML = '<p>Unable to load branch locations.</p>';
                });
        }
        
        // ✅ Correct location to call it — OUTSIDE the fetch
        loadBranches();

        // Close the branch modal when clicking the "X"
const closeBranchDetailsModalButton = document.getElementById('closeBranchDetailsModal');
const branchDetailsModal = document.getElementById('branchDetailsModal');

if (closeBranchDetailsModalButton) {
    closeBranchDetailsModalButton.addEventListener('click', () => {
        branchDetailsModal.style.display = 'none';
    });
}

// Close the branch modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === branchDetailsModal) {
        branchDetailsModal.style.display = 'none';
    }
});

        
    // === REVIEWS (full featured) ===
const reviewsCarousel = document.querySelector('.reviews-carousel');

function getStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="fa${i <= rating ? 's' : 'r'} fa-star"></span>`;
    }
    return stars;
}

function createFullReviewCard(review) {
    const user = review.userId || {};
    const username = user.username || 'Anonymous';
    const profileImage = user.profileImage
        ? `http://localhost:5000${user.profileImage}`
        : 'http://localhost:5000/images/users/profile.jpg';
    const date = new Date(review.createdAt).toLocaleDateString();

    const card = document.createElement('div');
    card.classList.add('review-card');
    card.innerHTML = `
        <div class="review-user">
            <img src="${profileImage}" alt="${username}" class="review-user-img"
                 onerror="this.src='http://localhost:5000/images/users/profile.jpg'">
            <div class="review-user-info">
                <strong>${username}</strong>
                <span class="review-date">${date}</span>
            </div>
        </div>
        <div class="review-info">
            <h4>${review.title}</h4>
            <div class="rating">${getStarRating(review.stars)} (${review.stars}/5)</div>
            <p class="review-text">${review.comment}</p>
        </div>
    `;
    return card;
}

function fetchReviews() {
    if (!reviewsCarousel) return;

    fetch('http://localhost:5000/api/reviews')
        .then(res => res.json())
        .then(data => {
            reviewsCarousel.innerHTML = '';
            if (Array.isArray(data) && data.length > 0) {
                const reviewsToShow = data.slice(0, 10); // ✅ show only the first 10
                reviewsToShow.forEach(review => {
                    reviewsCarousel.appendChild(createFullReviewCard(review));
                });
            } else {
                reviewsCarousel.innerHTML = '<p>No customer reviews yet.</p>';
            }
        })
        .catch(err => {
            console.error('Error loading reviews:', err);
            reviewsCarousel.innerHTML = '<p>Failed to load reviews.</p>';
        });
}

fetchReviews();

const prevReviewBtn = document.querySelector('.prev-review');
const nextReviewBtn = document.querySelector('.next-review');

if (prevReviewBtn && nextReviewBtn && reviewsCarousel) {
    const scrollAmount = 320; // Adjust based on card width + gap

    prevReviewBtn.addEventListener('click', () => {
        reviewsCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextReviewBtn.addEventListener('click', () => {
        reviewsCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
}

// === ADD REVIEW MODAL ===
const addReviewBtn = document.querySelector('.add-review-button');
const addReviewModal = document.getElementById('addReviewModal');
const closeReviewModalBtn = addReviewModal?.querySelector('.close-button');

if (addReviewBtn && addReviewModal) {
    addReviewBtn.addEventListener('click', () => {
        addReviewModal.style.display = 'block';
    });
}

if (closeReviewModalBtn) {
    closeReviewModalBtn.addEventListener('click', () => {
        addReviewModal.style.display = 'none';
    });
}

window.addEventListener('click', (event) => {
    if (event.target === addReviewModal) {
        addReviewModal.style.display = 'none';
    }
});

// === RATING SELECTION IN ADD REVIEW MODAL ===
const modalStars = document.querySelectorAll('#addReviewModal .star-rating .star');
const selectedRatingInput = document.getElementById('selectedRatingHomepage');
const ratingResult = document.getElementById('ratingResult');

modalStars.forEach(star => {
    star.addEventListener('click', function () {
        const rating = parseInt(this.dataset.rating);
        selectedRatingInput.value = rating;
        updateStars(rating);
    });
});

function updateStars(rating) {
    modalStars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
    ratingResult.textContent = ` (${rating}/5)`;
}

const addReviewForm = document.getElementById('addReviewForm');

if (addReviewForm) {
    addReviewForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('reviewTitleHomepage').value.trim();
        const comment = document.getElementById('reviewTextHomepage').value.trim();
        const stars = parseInt(document.getElementById('selectedRatingHomepage').value);
        const token = localStorage.getItem('token'); // 🔑 Make sure user is logged in

        if (!stars || stars < 1 || stars > 5) {
            alert('Please select a rating between 1 and 5 stars.');
            return;
        }

        fetch('http://localhost:5000/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, comment, stars })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Review submitted' || data.success) {
                alert('✅ Review submitted successfully!');
                document.getElementById('addReviewModal').style.display = 'none';
                fetchReviews(); // Refresh carousel
            } else {
                alert('⚠️ Error submitting review: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
            alert('❌ Failed to submit review. Check console.');
        });
    });
}


});
