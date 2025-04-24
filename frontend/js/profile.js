// ✅ Updated profile.js to also fetch user's saved transactions with edit actions

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
  fetch('/frontend/html/footer.html')
    .then(res => res.text())
    .then(html => document.getElementById('footer-container').innerHTML = html);

  fetch('http://localhost:5000/api/auth/me', { headers })
    .then(res => res.json())
    .then(user => {
      document.getElementById('usernameDisplay').textContent = user.username;
      document.getElementById('emailDisplay').textContent = `Email: ${user.email}`;
      document.getElementById('phoneDisplay').textContent = `Phone: ${user.phone || 'N/A'}`;
      document.getElementById('ageDisplay').textContent = `Age: ${user.age || 'N/A'}`;
      document.getElementById('pointsDisplay').textContent = `Points: ${user.points || 0}`;
      document.getElementById('userProfilePicture').src = user.profileImage
        ? `http://localhost:5000${user.profileImage}`
        : 'http://localhost:5000/images/users/default.jpg';

      document.getElementById('editUsername').value = user.username;
      document.getElementById('editEmail').value = user.email;
      document.getElementById('editPhone').value = user.phone || '';
      document.getElementById('editAge').value = user.age || '';

      document.getElementById('editProfileButton').onclick = () => document.getElementById('editProfileModal').style.display = 'block';
      document.querySelector('.close-button').onclick = () => document.getElementById('editProfileModal').style.display = 'none';
      window.onclick = e => { if (e.target === document.getElementById('editProfileModal')) document.getElementById('editProfileModal').style.display = 'none'; };

      document.getElementById('editProfileForm').addEventListener('submit', e => {
        e.preventDefault();
        const updated = {
          username: document.getElementById('editUsername').value,
          email: document.getElementById('editEmail').value,
          phone: document.getElementById('editPhone').value,
          age: document.getElementById('editAge').value
        };
        fetch('http://localhost:5000/api/users/update-profile', {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updated)
        })
          .then(res => res.json())
          .then(() => {
            alert('✅ Profile updated successfully!');
            location.reload();
          })
          .catch(err => alert('❌ Failed to update profile.'));
      });

      document.getElementById('profileImageUpload').addEventListener('change', async () => {
        const file = document.getElementById('profileImageUpload').files[0];
        if (!file) return alert("Please choose an image to upload.");

        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('http://localhost:5000/api/upload?folder=users', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();
        if (res.ok) {
          alert('✅ Image uploaded!');
          document.getElementById('userProfilePicture').src = `http://localhost:5000${data.path}?t=${Date.now()}`;
        } else {
          alert(data.msg || '❌ Upload failed.');
        }
      });

      const renderReservations = (containerId, reservations, emptyMessage) => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        if (!reservations.length) {
          container.innerHTML = `<p>${emptyMessage}</p>`;
          return;
        }
        reservations.forEach(resv => {
          container.innerHTML += `
            <div class="reservation-item">
              <h3>${resv.selectedCars[0]?.brand || 'Car'} ${resv.selectedCars[0]?.model || ''}</h3>
              <p>Status: ${resv.status}</p>
              <p>Pickup: ${new Date(resv.pickupDate).toLocaleDateString()}</p>
              <p>Drop-off: ${new Date(resv.dropDate).toLocaleDateString()}</p>
            </div>
          `;
        });
      };

      fetch('http://localhost:5000/api/reservations/my', { headers })
        .then(res => res.json())
        .then(allReservations => {
          const now = new Date();
          renderReservations('upcomingReservations', allReservations.filter(r => r.status === 'reserved' && new Date(r.pickupDate) > now), 'No upcoming reservations.');
          renderReservations('completedReservations', allReservations.filter(r => r.status === 'completed'), 'No completed reservations.');
          renderReservations('canceledReservations', allReservations.filter(r => r.status === 'canceled'), 'No canceled reservations.');
        });

      fetch('http://localhost:5000/api/invoices/my', { headers })
        .then(res => res.json())
        .then(invoices => {
          const container = document.getElementById('invoiceList');
          container.innerHTML = '';
          if (!invoices.length) return container.innerHTML = '<p>No invoices found.</p>';
          invoices.forEach(invoice => {
            container.innerHTML += `
              <div class="invoice-item">
                <h3>Invoice #${invoice._id.slice(-6)}</h3>
                <p>Amount: $${invoice.amount}</p>
                <p>Status: ${invoice.status}</p>
                <p>Method: ${invoice.paymentMethod}</p>
                <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>`;
          });
        });

      // ✅ Fetch & show saved transactions with action buttons
      fetch('http://localhost:5000/api/invoices/my-saved', { headers })
  .then(res => res.json())
  .then(savedInvoices => {
    const savedContainer = document.getElementById('savedTransactionsList');
    savedContainer.innerHTML = '';

    const saved = savedInvoices.filter(inv => inv.status === 'saved');

    if (!saved.length) {
      savedContainer.innerHTML = '<p>No saved transactions.</p>';
      return;
    }

    saved.forEach(invoice => {
      savedContainer.innerHTML += `
        <div class="invoice-item">
          <h3>Saved Transaction #${invoice._id.slice(-6)}</h3>
          <p>Amount: $${invoice.amount}</p>
          <p>Method: ${invoice.paymentMethod}</p>
          <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
          <p>Status: ${invoice.status}</p>
          <button onclick="completeTransaction('${invoice._id}')">✅ Complete</button>
          <button onclick="cancelTransaction('${invoice._id}')">❌ Cancel</button>
        </div>`;

        
    });
  });

    }); // end of user fetch
}); // end DOMContentLoaded

// ✅ Global Transaction Actions
window.completeTransaction = async (invoiceId) => {
  const token = localStorage.getItem('token');
  const method = prompt("Enter payment method to complete (e.g., creditCard, payAtLocation):");
  if (!method) return;

  try {
    const res = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/pay`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ paymentMethod: method })
    });

    const data = await res.json();
    alert(data.message || 'Payment completed.');
    location.reload();
  } catch (err) {
    alert('❌ Error completing transaction.');
  }
};

window.cancelTransaction = async (invoiceId) => {
  const token = localStorage.getItem('token');
  if (!confirm('Are you sure you want to cancel this transaction?')) return;

  try {
    const res = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    alert(data.message || 'Transaction canceled.');
    location.reload();
  } catch (err) {
    alert('❌ Error canceling transaction.');
  }
};
