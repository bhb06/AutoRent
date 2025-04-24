const BASE_API = 'http://localhost:5000/api/invoices';

document.addEventListener('DOMContentLoaded', function () {
  const totalCostSpan = document.getElementById('totalCost');
  const rentalDetailsDiv = document.getElementById('rentalDetails');
  const creditCardOption = document.getElementById('creditCardOption');
  const creditCardDetailsDiv = document.getElementById('creditCardDetails');
  const payAtLocationOption = document.getElementById('payAtLocationOption');
  const couponCodeInput = document.getElementById('couponCode');
  const couponMessage = document.getElementById('couponMessage');

  const reservationId = localStorage.getItem('reservationId');
  const localReservation = JSON.parse(localStorage.getItem('currentReservation'));
  const token = localStorage.getItem('token');

  // ----------------- Display Rental Summary -----------------
  if (token && reservationId) {
    fetch('http://localhost:5000/api/reservations/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const latest = data[data.length - 1];
        rentalDetailsDiv.innerHTML = `
          <p><strong>Car:</strong> ${latest.selectedCars.map(c => `${c.brand} ${c.model}`).join(', ')}</p>
          <p><strong>Pickup:</strong> ${new Date(latest.pickupDate).toLocaleDateString()}</p>
          <p><strong>Drop-off:</strong> ${new Date(latest.dropDate).toLocaleDateString()}</p>
          <p><strong>Base Price:</strong> $${latest.totalPrice.toFixed(2)}</p>
        `;
        totalCostSpan.textContent = `$${latest.totalPrice.toFixed(2)}`;
        localStorage.setItem('estimatedCost', latest.totalPrice);
      });
  } else if (localReservation) {
    rentalDetailsDiv.innerHTML = `
      <p><strong>Car:</strong> ${localReservation.car}</p>
      <p><strong>Pickup:</strong> ${localReservation.pickupDate}</p>
      <p><strong>Drop-off:</strong> ${localReservation.dropoffDate}</p>
      <p><strong>Base Price:</strong> $${localReservation.totalPrice}</p>
    `;
    totalCostSpan.textContent = `$${localReservation.totalPrice}`;
    localStorage.setItem('estimatedCost', localReservation.totalPrice);
  } else {
    rentalDetailsDiv.innerHTML = '<p>No reservation found.</p>';
    return;
  }

  // ----------------- Payment Method Switching -----------------
  creditCardOption?.addEventListener('change', () => {
    creditCardDetailsDiv.classList.remove('hidden');
  });

  payAtLocationOption?.addEventListener('change', () => {
    creditCardDetailsDiv.classList.add('hidden');
  });

  // ----------------- Apply Coupon -----------------
  window.applyCoupon = async () => {
    couponMessage.textContent = '';

    const coupon = couponCodeInput.value.trim();
    const estimatedCost = parseFloat(localStorage.getItem('estimatedCost'));
    const reservationId = localStorage.getItem('reservationId');

    if (!reservationId || !token) {
      return alert('❌ Coupons only work for logged-in users.');
    }

    try {
      const res = await fetch('http://localhost:5000/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ couponCode: coupon, reservationId })
      });

      const data = await res.json();

      if (!res.ok) {
        couponMessage.textContent = data.message || '❌ Invalid coupon';
        return;
      }

      const discounted = estimatedCost * (1 - data.discountPercent / 100);
      totalCostSpan.textContent = `$${discounted.toFixed(2)}`;
      localStorage.setItem('finalCost', discounted.toFixed(2));
      couponMessage.textContent = '✅ Coupon applied!';
    } catch (err) {
      console.error('Coupon apply error:', err);
      couponMessage.textContent = '❌ Failed to apply coupon. Try again.';
    }
  };

  // ----------------- Create Reservation if Needed -----------------
  async function ensureReservation() {
    const localReservation = JSON.parse(localStorage.getItem('currentReservation'));
    const pickupBranch = localStorage.getItem('pickupBranch');
    const dropoffBranch = localStorage.getItem('dropoffBranch');
    const selectedCarIds = JSON.parse(localStorage.getItem('selectedCarIds') || '[]');

    if (!pickupBranch || !dropoffBranch || selectedCarIds.length === 0) {
      throw new Error('Missing reservation details (branches or car IDs)');
    }

    const res = await fetch('http://localhost:5000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        pickupBranch,
        dropBranch: dropoffBranch,
        pickupDate: localReservation.pickupDate,
        dropDate: localReservation.dropoffDate,
        selectedCars: selectedCarIds,
        services: []
      })
    });

    const data = await res.json();
    if (res.ok && data.data?._id) {
      localStorage.setItem('reservationId', data.data._id);
      return data.data._id;
    } else {
      throw new Error(data.message || data.error || 'Failed to create reservation');
    }
  }

  // ----------------- Save Transaction -----------------
  window.saveTransaction = async () => {
    const paymentMethod = getPaymentMethod();
    const couponCode = couponCodeInput.value.trim();

    if (!token) return alert('Saving transactions is only available for logged-in users.');

    try {
      const finalReservationId = await ensureReservation();

      const res = await fetch(`${BASE_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reservationId: finalReservationId,
          paymentMethod,
          couponCode
        })
      });

      const data = await res.json();
      alert(data.message || 'Transaction saved');
      if (data.data?._id) {
        localStorage.setItem('invoiceId', data.data._id);
        window.location.href = "/frontend/html/index.html";
      }
    } catch (err) {
      alert('❌ Error saving transaction: ' + err.message);
    }
  };

  // ----------------- Proceed to Payment -----------------
  window.proceedToPayment = async () => {
    const method = getPaymentMethod();
    if (!method) return alert('Please select a payment method.');

    if (method === 'payAtLocation') {
      alert('❌ You selected "Paying at Location". You cannot use "Pay Now".');
      return;
    }

    if (method === 'creditCard') {
      const card = document.getElementById('cardNumber').value;
      const exp = document.getElementById('expiryDate').value;
      const cvv = document.getElementById('cvv').value;
      if (!card || !exp || !cvv) return alert('Fill credit card info');
    }

    if (!token) {
      alert('You must be logged in to complete payment.');
      return;
    }

    let invoiceId = localStorage.getItem('invoiceId');
    if (!invoiceId) {
      await saveTransaction();
      invoiceId = localStorage.getItem('invoiceId');
      if (!invoiceId) {
        alert('❌ Failed to create transaction. Please try again.');
        return;
      }
    }

    const res = await fetch(`${BASE_API}/${invoiceId}/pay`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ paymentMethod: method })
    });

    const data = await res.json();
    alert(data.message || 'Payment completed');
    window.location.href = "/frontend/html/index.html";
  };

  // ----------------- Cancel Transaction -----------------
  window.cancelTransaction = async () => {
    const invoiceId = localStorage.getItem('invoiceId');
    if (!token || !invoiceId) {
      alert('Only logged-in users can cancel a transaction.');
      return;
    }

    const res = await fetch(`${BASE_API}/${invoiceId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });

    const data = await res.json();
    alert(data.message || 'Transaction canceled');
    localStorage.removeItem('invoiceId');
    localStorage.removeItem('reservationId');
    localStorage.removeItem('currentReservation');
    window.location.href = '/frontend/html/index.html';
  };

  // ----------------- Request Quotation -----------------
  window.requestQuotation = async () => {
    if (!token) {
      alert('Only logged-in users can request a quotation.');
      return;
    }

    let reservationId = localStorage.getItem('reservationId');
    if (!reservationId) {
      try {
        reservationId = await ensureReservation();
      } catch (err) {
        alert('❌ Failed to create reservation: ' + err.message);
        return;
      }
    }

    localStorage.setItem('quotationReservationId', reservationId);
    window.location.href = '/frontend/html/quotation-requested.html';
  };

  // ----------------- Soft Cancel -----------------
  window.softCancel = () => {
    alert("Your transaction info will be canceled. You will be redirected to the homepage.");
    window.location.href = "/frontend/html/index.html";
  };
});
