// profile.js
document.addEventListener('DOMContentLoaded', () => {
    const profileImageInput = document.getElementById('profileImageUpload');
  
    profileImageInput.addEventListener('change', async () => {
      const file = profileImageInput.files[0];
      if (!file) {
        alert("Please choose an image to upload.");
        return;
      }
  
      const formData = new FormData();
      formData.append('image', file); // Make sure your backend expects the field name 'image'
  
      const token = localStorage.getItem('token'); 
      // Adjust if you're using a different auth method
  
      try {
        const response = await fetch('http://localhost:5000/api/upload?folder=profiles', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // DON'T add Content-Type when using FormData
          },
          body: formData
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }
  
        const data = await response.json();
        alert("Image uploaded successfully!");
        // Optional: update the profile image preview
        const imagePath = data.user?.profileImage || data.path;
        document.getElementById('userProfilePicture').src = `${imagePath}?t=${Date.now()}`; // cache buster

      } catch (error) {
        console.error("Upload error:", error);
        alert("An error occurred during image upload.");
      }
    });
  });
  
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Load Navbar and Footer
    fetch('/frontend/html/navbar.html')
        .then(res => res.text())
        .then(html => document.getElementById('navbar-container').innerHTML = html);

    fetch('/frontend/html/footer.html')
        .then(res => res.text())
        .then(html => document.getElementById('footer-container').innerHTML = html);

    // === Fetch Profile Info ===
    fetch('http://localhost:5000/api/auth/me', { headers })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
        })
        .then(user => {
            const userId = user._id; // Assuming your user object has an '_id' field

            document.getElementById('usernameDisplay').textContent = user.username;
            document.getElementById('emailDisplay').textContent = `Email: ${user.email}`;
            document.getElementById('phoneDisplay').textContent = `Phone: ${user.phone || 'N/A'}`;
            document.getElementById('ageDisplay').textContent = `Age: ${user.age || 'N/A'}`;
            document.getElementById('pointsDisplay').textContent = `Points: ${user.points || 0}`;
            document.getElementById('userProfilePicture').src = user.profileImage || '/frontend/images/user-placeholder.png';

            // Fill edit modal
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editPhone').value = user.phone || '';
            document.getElementById('editAge').value = user.age || '';

            // === Image Upload Logic ===
            const profileImageUpload = document.getElementById('profileImageUpload');
            const userProfilePicture = document.getElementById('userProfilePicture');

            profileImageUpload.addEventListener('change', async () => {
                const file = profileImageUpload.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('userId', userId);

                    try {
                        const response = await fetch('http://localhost:5000/api/upload', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            body: formData
                        });

                        if (response.ok) {
                            const data = await response.json();
                            console.log('Image uploaded:', data);
                            // Update the profile picture on the page
                            userProfilePicture.src = data.user ? data.user.profileImage : data.path;
                        } else {
                            const errorData = await response.json();
                            console.error('Image upload failed:', errorData);
                            alert('Failed to upload image.');
                        }
                    } catch (error) {
                        console.error('Error during image upload:', error);
                        alert('An error occurred during image upload.');
                    }
                }
            });
        })
        .catch(err => console.error('Profile fetch error:', err));

    // === Fetch Current Reservations ===
    fetch('http://localhost:5000/api/users/current-bookings', { headers })
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('currentReservations');
            container.innerHTML = '';
            if (data.length === 0) {
                container.innerHTML = '<p>No current reservations.</p>';
                return;
            }
            data.forEach(resv => {
                container.innerHTML += `
                    <div class="reservation-item">
                        <h3>${resv.selectedCars[0].brand} ${resv.selectedCars[0].model}</h3>
                        <p>Status: ${resv.status}</p>
                        <p>Pickup: ${new Date(resv.pickupDate).toLocaleDateString()}</p>
                        <p>Drop-off: ${new Date(resv.dropDate).toLocaleDateString()}</p>
                    </div>`;
            });
        })
        .catch(err => console.error('Current reservations fetch error:', err));

    // === Fetch Past Reservations ===
    fetch('http://localhost:5000/api/users/booking-history', { headers })
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('reservationHistory');
            container.innerHTML = '';
            if (data.length === 0) {
                container.innerHTML = '<p>No past reservations.</p>';
                return;
            }
            data.forEach(resv => {
                container.innerHTML += `
                    <div class="history-item">
                        <h3>${resv.selectedCars[0].brand} ${resv.selectedCars[0].model}</h3>
                        <p>Status: ${resv.status}</p>
                        <p>Pickup: ${new Date(resv.pickupDate).toLocaleDateString()}</p>
                        <p>Drop-off: ${new Date(resv.dropDate).toLocaleDateString()}</p>
                    </div>`;
            });
        })
        .catch(err => console.error('Booking history fetch error:', err));

    // === Fetch Invoices ===
    fetch('http://localhost:5000/api/invoices/my', { headers })
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('invoiceList');
            container.innerHTML = '';
            if (data.length === 0) {
                container.innerHTML = '<p>No invoices found.</p>';
                return;
            }
            data.forEach(invoice => {
                container.innerHTML += `
                    <div class="invoice-item">
                        <h3>Invoice #${invoice._id.slice(-6)}</h3>
                        <p>Amount: $${invoice.amount}</p>
                        <p>Status: ${invoice.paid ? 'Paid' : 'Unpaid'}</p>
                        <p>Method: ${invoice.paymentMethod}</p>
                        <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
                    </div>`;
            });
        })
        .catch(err => console.error('Invoice fetch error:', err));

    // === Edit Profile Modal ===
    const modal = document.getElementById('editProfileModal');
    document.getElementById('editProfileButton').onclick = () => modal.style.display = 'block';
    document.querySelector('.close-button').onclick = () => modal.style.display = 'none';
    window.onclick = e => { if (e.target == modal) modal.style.display = 'none'; };

    // === Save Profile Changes ===
    document.getElementById('editProfileForm').addEventListener('submit', e => {
        e.preventDefault();
        const updated = {
            username: document.getElementById('editUsername').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            age: document.getElementById('editAge').value,
        };

        fetch('http://localhost:5000/api/users/update-profile', {
            method: 'PATCH',
            headers,
            body: JSON.stringify(updated)
        })
        .then(res => res.json())
        .then(data => {
            alert('Profile updated successfully');
            modal.style.display = 'none';
            location.reload();
        })
        .catch(err => {
            console.error('Update error:', err);
            alert('Failed to update profile.');
        });
    });
});