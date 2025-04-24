const BASE_API_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async function () {
  const carId = new URLSearchParams(window.location.search).get('carId');

  const carTitle = document.getElementById('carTitle');
  const carImage = document.getElementById('mainCarImage');
  const selectedCarsInput = document.getElementById('selectedCars');
  const carPrice = document.getElementById('carPrice');
  const totalPrice = document.getElementById('totalPrice');
  const pickupDateInput = document.getElementById('pickupDate');
  const dropDateInput = document.getElementById('dropDate');
  const specsList = document.querySelector('.specs-list');

  const reservationForm = document.getElementById('reservationForm');
  const userNameInput = document.getElementById('userName');
  const phoneNumberInput = document.getElementById('phoneNumber');
  const emailInput = document.getElementById('email');
  const requiredFields = [
    { input: userNameInput, message: 'User Name is required.' },
    { input: phoneNumberInput, message: 'Phone Number is required.' },
    { input: pickupDateInput, message: 'Pickup Date is required.' },
    { input: dropDateInput, message: 'Drop-off Date is required.' }
  ];
  const errorSummaryContainer = document.createElement('div');
  errorSummaryContainer.style.color = 'red';
  errorSummaryContainer.style.marginBottom = '10px';
  if (reservationForm) {
    reservationForm.prepend(errorSummaryContainer);
  }

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
  const footer = await fetch('../html/footer.html').then(res => res.text());
  document.getElementById('footer-container').innerHTML = footer;

  // Load Car Info
  if (carId) {
    try {
      const res = await fetch(`${BASE_API_URL}/api/cars/${carId}`);
      const car = await res.json();

      carTitle.textContent = `${car.brand} ${car.model}`;
      carImage.src = `${BASE_API_URL}${car.image}`;
      carImage.alt = `${car.brand} ${car.model}`;
      selectedCarsInput.value = `${car.brand} ${car.model}`;
      carPrice.textContent = `$${car.dailyFee}/day`;

      specsList.innerHTML = `
        <li><i class="fas fa-id-card"></i><span class="spec-label">Plate Number</span><strong>${car.plateNumber || 'N/A'}</strong></li>
        <li><i class="fas fa-calendar-alt"></i><span class="spec-label">Year</span><strong>${car.year || 'N/A'}</strong></li>
        <li><i class="fas fa-users"></i><span class="spec-label">Passengers</span><strong>${car.passengers || 'N/A'}</strong></li>
        <li><i class="fas fa-door-closed"></i><span class="spec-label">Doors</span><strong>${car.numDoors || 'N/A'}</strong></li>
        <li><i class="fas fa-cog"></i><span class="spec-label">Gearbox</span><strong>${car.gearbox || 'N/A'}</strong></li>
        <li><i class="fas fa-tachometer-alt"></i><span class="spec-label">Engine Size</span><strong>${car.engineSize || 'N/A'} CC</strong></li>
        <li><i class="fas fa-gas-pump"></i><span class="spec-label">Fuel Type</span><strong>${car.fuelType || 'N/A'}</strong></li>
        <li><i class="fas fa-snowflake"></i><span class="spec-label">AC</span><strong>${car.ac ? 'Yes' : 'No'}</strong></li>
        <li><i class="fas fa-bolt"></i><span class="spec-label">Electric Windows</span><strong>${car.electricWindows ? 'Yes' : 'No'}</strong></li>
        <li><i class="fas fa-check-circle"></i><span class="spec-label">Availability</span><strong>${car.availability ? 'Yes' : 'No'}</strong></li>
      `;
    } catch (err) {
      console.error('Failed to fetch car data:', err);
      alert('Could not load selected car.');
    }
  }

  // Price calculation
  function calculateTotalPrice() {
    const start = new Date(pickupDateInput.value);
    const end = new Date(dropDateInput.value);
    if (!isNaN(start) && !isNaN(end) && start < end) {
      const days = (end - start) / (1000 * 60 * 60 * 24);
      const pricePerDay = parseFloat(carPrice.textContent.replace(/[^\d.]/g, ''));
      totalPrice.value = (days * pricePerDay).toFixed(2);
    } else {
      totalPrice.value = '';
    }
  }

  pickupDateInput.addEventListener('change', calculateTotalPrice);
  dropDateInput.addEventListener('change', calculateTotalPrice);

  // Form validation & submission
  if (reservationForm) {
    reservationForm.addEventListener('submit', function (event) {
      event.preventDefault();
      let isValid = true;
      let errorMessages = [];

      document.querySelectorAll('.error-message').forEach(el => el.remove());
      requiredFields.forEach(item => item.input.classList.remove('required-error'));
      errorSummaryContainer.textContent = '';

      requiredFields.forEach(item => {
        if (!item.input.value.trim()) {
          isValid = false;
          item.input.classList.add('required-error');
          const errorSpan = document.createElement('span');
          errorSpan.classList.add('error-message');
          errorSpan.style.color = 'red';
          errorSpan.style.display = 'block';
          errorSpan.style.marginTop = '5px';
          errorSpan.textContent = item.message;
          item.input.parentNode.appendChild(errorSpan);
          errorMessages.push(item.message);
        }
      });

      const phoneValue = phoneNumberInput.value.trim();
      if (phoneValue && !/^\d{8,12}$/.test(phoneValue)) {
        isValid = false;
        phoneNumberInput.classList.add('required-error');
        const errorSpan = document.createElement('span');
        errorSpan.classList.add('error-message');
        errorSpan.style.color = 'red';
        errorSpan.style.display = 'block';
        errorSpan.style.marginTop = '5px';
        errorSpan.textContent = 'Phone number should be 8-12 digits';
        phoneNumberInput.parentNode.appendChild(errorSpan);
        errorMessages.push('Invalid phone number format.');
      }

      if (!isValid) {
        const uniqueErrors = [...new Set(errorMessages)];
        errorSummaryContainer.textContent = 'Please correct the following errors: ' + uniqueErrors.join(', ');
        return;
      }

      // ✅ Store data in localStorage
      const reservationObject = {
        carId,
        car: selectedCarsInput.value,
        pickupDate: pickupDateInput.value,
        dropoffDate: dropDateInput.value,
        totalPrice: totalPrice.value,
        pickupBranch: document.getElementById('pickupBranch').value,
        dropBranch: document.getElementById('dropoffBranch').value
      };
      
      // ✅ Save carId as an array for backend compatibility
      localStorage.setItem('selectedCarIds', JSON.stringify([carId]));
      localStorage.setItem('pickupBranch', reservationObject.pickupBranch);
      localStorage.setItem('dropoffBranch', reservationObject.dropBranch);
      localStorage.setItem('currentReservation', JSON.stringify(reservationObject));
      
      

      window.location.href = '../html/checkout.html';
    });

    phoneNumberInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
    });

    userNameInput.addEventListener('input', function () {
      this.value = this.value.replace(/\d/g, '');
    });
  }

  // Branch popup handlers
  const body = document.body;
  function showBranchDetails(details) {
    const popup = document.createElement('div');
    popup.classList.add('branch-details-popup');
    popup.innerHTML = `
      <h3>Branch Details</h3>
      <p><strong>Opening Time:</strong> ${details.opening}</p>
      <p><strong>Closing Time:</strong> ${details.closing}</p>
      <p><strong>Address:</strong> ${details.address}</p>
      <p><strong>Phone Number:</strong> ${details.phone}</p>
      <span class="close-button">&times;</span>
    `;
    body.appendChild(popup);
    popup.querySelector('.close-button').addEventListener('click', () => popup.remove());
    popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
  }

  document.querySelectorAll('.view-details-button, .view-details-adjacent-button')
    .forEach(button => {
      button.addEventListener('click', function () {
        const selectId = this.dataset.selectId;
        const select = document.getElementById(selectId);
        if (!select || !select.value) {
          alert('Please select a branch first.');
          return;
        }
        const option = select.options[select.selectedIndex];
        const detailsJson = option.getAttribute('data-details');
        if (detailsJson && detailsJson !== 'null') {
          const details = JSON.parse(detailsJson);
          showBranchDetails(details);
        } else {
          alert('No details available for this branch.');
        }
      });
    });
});
