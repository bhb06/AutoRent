document.addEventListener('DOMContentLoaded', function() {
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
     
    const allReviewsContainer = document.getElementById('all-reviews-container');
    const newReviewForm = document.getElementById('newReviewForm');
    const newRatingStars = document.querySelectorAll('#newReviewForm .star-rating .stars .star');
    const newRatingResultDisplay = document.getElementById('newRatingResult');
    const newSelectedRatingInput = document.getElementById('newSelectedRating');

    const editReviewModal = document.getElementById('editReviewModal');
    const closeEditModalButton = document.querySelector('#editReviewModal .close-button');
    const editReviewForm = document.getElementById('editReviewForm');
    const editRatingStars = document.querySelectorAll('#editReviewModal .star-rating .stars .edit-star');
    const editRatingResultDisplay = document.getElementById('editRatingResult');
    const editSelectedRatingInput = document.getElementById('editSelectedRating');

    let allReviews = [];
    function getStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<span class="fa${i <= rating ? 's' : 'r'} fa-star"></span>`;
        }
        return stars;
    }

    function renderReviews(reviews) {
        allReviewsContainer.innerHTML = '';
        reviews.forEach(review => {
            const user = review.userId || {};
            const username = user.username || 'Anonymous';
            const profileImage = user.profileImage
                ? `http://localhost:5000${user.profileImage}`
                : 'http://localhost:5000/images/users/profile.jpg';
            const date = new Date(review.createdAt).toLocaleDateString();
    
            const reviewCard = document.createElement('div');
            reviewCard.classList.add('review-card');
    
            const showActions = review.isOwn;
    
            reviewCard.innerHTML = `
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
                <div class="review-actions">
                    ${showActions ? `<button class="edit-button" data-review-id="${review.id}">Edit</button>` : ''}
                    ${showActions ? `<button class="delete-button" data-review-id="${review.id}">Delete</button>` : ''}
                </div>
            `;
            allReviewsContainer.appendChild(reviewCard);
        });
        attachReviewActionsListeners();
    }
    
    function fetchReviews() {
        const token = localStorage.getItem('token');
        fetch('http://localhost:5000/api/reviews', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    window.location.href = '/login.html';
                    throw new Error('Unauthorized');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const loggedInUserId = getLoggedInUserIdFromToken();
            console.log("Logged in user ID:", loggedInUserId);
            console.log("Reviews from backend:", data);
            allReviews = data.map(review => ({
                ...review,
                id: review._id, // ✅ add this line
                isOwn: review.userId && review.userId._id === loggedInUserId
            }));
            renderReviews(allReviews);
        })
        .catch(error => {
            console.error('Failed to fetch reviews:', error);
            allReviewsContainer.innerHTML = '<p class="error-message">Failed to load reviews.</p>';
        });
    }

    function getLoggedInUserIdFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payloadBase64 = token.split('.')[1];
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);
            return payload.id; 
        } catch (error) {
            console.error('Error decoding or parsing JWT token', error);
            return null;
        }
    }

    function handleRating(stars, resultDisplay, ratingInput) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                updateStarDisplay(stars, resultDisplay, rating);
                ratingInput.value = rating;
            });
        });
    }

    function updateStarDisplay(stars, resultDisplay, rating) {
        stars.forEach(star => {
            star.classList.toggle('selected', parseInt(star.dataset.rating) <= rating);
        });
        resultDisplay.textContent = `(${rating}/5)`;
    }

    function attachReviewActionsListeners() {
        const editButtons = document.querySelectorAll('.edit-button');
        const deleteButtons = document.querySelectorAll('.delete-button');
    
        console.log("🔁 Attaching listeners to", editButtons.length, "edit buttons and", deleteButtons.length, "delete buttons");
    
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const reviewId = this.dataset.reviewId;
                console.log("✏️ Edit clicked for reviewId:", reviewId);
    
                const reviewToEdit = allReviews.find(review => review.id === reviewId);
                if (reviewToEdit && reviewToEdit.isOwn) {
                    document.getElementById('editReviewTitle').value = reviewToEdit.title;
                    document.getElementById('editReviewText').value = reviewToEdit.comment;
                    updateStarDisplay(editRatingStars, editRatingResultDisplay, reviewToEdit.stars);
                    editSelectedRatingInput.value = reviewToEdit.stars;
                    editReviewForm.dataset.reviewId = reviewId;
                    editReviewModal.style.display = 'block';
                }
            });
        });
    
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const reviewId = this.dataset.reviewId;
                console.log("🗑️ Delete clicked for reviewId:", reviewId);
    
                const reviewToDelete = allReviews.find(review => review.id === reviewId);
                if (reviewToDelete && reviewToDelete.isOwn) {
                    if (confirm('Are you sure you want to delete your review?')) {
                        deleteReview(reviewId);
                    }
                }
            });
        });
    }
    

    function postNewReview(event) {
        event.preventDefault();
        const title = document.getElementById('reviewTitle').value;
        const text = document.getElementById('reviewText').value;
        const rating = newSelectedRatingInput.value;
        const token = localStorage.getItem('token');

        if (rating > 0) {
            const newReviewData = { title, stars: rating, comment: text };
            fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newReviewData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // IMPORTANT:  Check the *actual* structure of the 'data' object!
                console.log("Response from server:", data);

                if (data.message && data.message === "Review submitted") {
                    newReviewForm.reset();
                    updateStarDisplay(newRatingStars, newRatingResultDisplay, 0);
                    newSelectedRatingInput.value = 0;
                    fetchReviews();
                    alert('Thank you for your review!');
                } else if (data.error) {
                    alert(`Failed to submit review: ${data.error}`); // Use data.error, or data.message, or whatever the error field is
                } else {
                    alert('Failed to submit review.');
                }
            })
            .catch(error => {
                console.error('Error submitting review:', error);
                alert('Failed to submit review.');
            });
        } else {
            alert('Please select a rating.');
        }
    }

    function updateReview(event) {
        event.preventDefault();
    
        const reviewId = editReviewForm.dataset.reviewId;
        const title = document.getElementById('editReviewTitle').value;
        const text = document.getElementById('editReviewText').value;
        const rating = editSelectedRatingInput.value;
        const token = localStorage.getItem('token');
    
        if (rating > 0 && reviewId) {
            const updatedReviewData = { title, stars: rating, comment: text };
    
            fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedReviewData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("📝 Review update response:", data);
    
                // Accept success in either structure
                if (data.message === 'Review updated successfully' || data.success === true) {
                    editReviewModal.style.display = 'none';
                    fetchReviews();
                    alert('✅ Review updated successfully!');
                } else if (data.message) {
                    alert(`⚠️ Failed to update review: ${data.message}`);
                } else {
                    alert('❌ Failed to update review.');
                }
            })
            .catch(error => {
                console.error('Error updating review:', error);
                alert('❌ Failed to update review.');
            });
    
        } else {
            alert('⚠️ Please select a rating.');
        }
    }
    

    function deleteReview(reviewId) {
        const token = localStorage.getItem('token');
    
        fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("🗑️ Delete response:", data);
    
            if (data.message === 'Review deleted' || data.success === true) {
                fetchReviews();
                alert('✅ Review deleted successfully!');
            } else if (data.message) {
                alert(`⚠️ Failed to delete review: ${data.message}`);
            } else {
                alert('❌ Failed to delete review.');
            }
        })
        .catch(error => {
            console.error('Error deleting review:', error);
            alert('❌ Failed to delete review.');
        });
    }
    
    // --- Event Listeners ---

    handleRating(newRatingStars, newRatingResultDisplay, newSelectedRatingInput);
    newReviewForm.addEventListener('submit', postNewReview);

    handleRating(editRatingStars, editRatingResultDisplay, editSelectedRatingInput);
    closeEditModalButton.addEventListener('click', () => {
        editReviewModal.style.display = 'none';
        editReviewForm.dataset.reviewId = '';
    });
    editReviewForm.addEventListener('submit', updateReview);

    const cancelEditButton = document.querySelector('#editReviewModal .form-actions .cancel-button');
    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', () => {
            editReviewModal.style.display = 'none';
            editReviewForm.dataset.reviewId = '';
        });
    }

    fetchReviews();
});
