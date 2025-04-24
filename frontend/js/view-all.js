const BASE_API_URL = 'http://localhost:5000';

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

    fetch('../html/footer.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('footer-container').innerHTML = html;
        })
        .catch(error => {
            console.error('Failed to load footer:', error);
        });

    const carGrid = document.querySelector('.car-grid');
    const sortByCategory = document.getElementById('sort');
    const filterButton = document.querySelector('.filter-button');
    const makeSelect = document.getElementById('make');
    const modelSelect = document.getElementById('model');

    let allCars = []; // Store the currently fetched cars

     // Map of groupIDs to category names (added)
     const categoryMap = {
        "67feca01b3702a051be7d61f": "SUV",
        "67feca17b3702a051be7d625": "Electric",
        "67feca20b3702a051be7d628": "Hybrid",
        "67feca28b3702a051be7d62b": "Convertible",
        "67feca0bb3702a051be7d622": "Minivan",
      }
    
      // Function to get URL parameters (case-insensitive) (added)
      function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search)
    
        // First try exact match
        if (urlParams.has(name)) {
          return urlParams.get(name)
        }
    
        // If not found, try case-insensitive search
        for (const [key, value] of urlParams.entries()) {
          if (key.toLowerCase() === name.toLowerCase()) {
            return value
          }
        }
    
        return null
      }

    // Function to display car cards
    function displayCars(cars) {
        carGrid.innerHTML = '';
        cars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.classList.add('car-card');
            carCard.dataset.engineSize = car.engineSize || '';
            carCard.dataset.numDoors = car.numDoors || '';
            carCard.dataset.numPassengers = car.passengers || '';
            carCard.dataset.fuelType = car.fuelType || '';
            carCard.dataset.gearbox = car.gearbox || '';
            carCard.dataset.ac = car.ac ? 'Yes' : 'No';
            carCard.dataset.electricWindows = car.electricWindows ? 'Yes' : 'No';
            carCard.dataset.make = car.brand || '';
            carCard.dataset.model = car.model || '';
            carCard.dataset.year = car.year || '';
            carCard.dataset.dailyFee = car.dailyFee || '';
            carCard.dataset.type = car.type || '';

            carCard.innerHTML = `
                <div class="image-slider">
                    <div class="slide" style="display: block;">
                        <img src="http://localhost:5000${car.image}" alt="${car.brand} ${car.model}">
                    </div>
                </div>
                <h3>${car.brand} ${car.model}</h3>
                <p class="car-details">${car.type || ''} - $${car.dailyFee || ''}/day - ${car.year || ''} - ${car.gearbox || ''} - ${car.fuelType || ''}</p>
                <button class="view-details-btn" data-car-id="${car._id}">View Details</button>
                <button class="reserve-btn" data-car-id="${car._id}">Reserve</button>
            `;
            carGrid.appendChild(carCard);
        });
        attachViewDetailsListeners();
        attachReserveListeners();
    }

    // Function to initialize the sort dropdown based on URL parameter
    function initializeSortDropdown() {
        // Get groupID from URL (try both groupID and groupId)
        const groupID = getQueryParam("groupID") || getQueryParam("groupId")
        console.log("Detected groupID from URL:", groupID)
    
        if (groupID && sortByCategory) {
          // First try to find an option with the exact value
          let found = false
          for (let i = 0; i < sortByCategory.options.length; i++) {
            if (sortByCategory.options[i].value === groupID) {
              sortByCategory.selectedIndex = i
              found = true
              console.log("Found exact match for groupID in dropdown:", groupID)
              break
            }
          }
    
          // If not found, check if we need to add the option
          if (!found) {
            console.log("No exact match found for groupID in dropdown, checking if we need to add it")
    
            // Check if this is a known category
            if (categoryMap[groupID]) {
              // Add the option
              const option = document.createElement("option")
              option.value = groupID
              option.textContent = categoryMap[groupID]
              sortByCategory.appendChild(option)
    
              // Select it
              sortByCategory.value = groupID
              console.log("Added and selected new option for:", categoryMap[groupID])
            } else {
              console.log("Unknown groupID, cannot add to dropdown:", groupID)
            }
          }
        }
      }

    // Function to fetch and display cars (always sends groupId if present)
    function fetchAndDisplayCars() {
        const groupID = getQueryParam("groupID") || getQueryParam("groupId");
        console.log("fetchAndDisplayCars - groupID from URL:", groupID)
  
      let apiUrl = "http://localhost:5000/api/cars"
      if (groupID) {
        apiUrl += `?groupId=${groupID}`
      }
      console.log("fetchAndDisplayCars - API URL:", apiUrl)
  
      fetch(apiUrl)
        .then((response) => {
          console.log("fetchAndDisplayCars - Response status:", response.status)
          return response.json()
        })
        .then((data) => {
          console.log("fetchAndDisplayCars - Data received:", data.length, "cars")
          allCars = data
          displayCars(allCars)
          populateMakeModelFilters(allCars)
        })
        .catch((error) => {
          console.error("Failed to fetch cars:", error)
          carGrid.innerHTML = "<p>Failed to load cars.</p>"
        })
    }

    // Function to populate the Make and Model dropdowns
    function populateMakeModelFilters(cars) {
        // Clear existing options first (except the first one)
        while (makeSelect.options.length > 1) {
          makeSelect.remove(1)
        }
    
        while (modelSelect.options.length > 1) {
          modelSelect.remove(1)
        }
    
        const makes = [...new Set(cars.map((car) => car.brand).filter(Boolean))].sort()
        const models = [...new Set(cars.map((car) => car.model).filter(Boolean))].sort()
    
        makes.forEach((make) => {
          const option = document.createElement("option")
          option.value = make
          option.textContent = make
          makeSelect.appendChild(option)
        })
    
        models.forEach((model) => {
          const option = document.createElement("option")
          option.value = model
          option.textContent = model
          modelSelect.appendChild(option)
        })
      }

    // Function to filter cars based on selected criteria (sidebar filters)
    function filterCars() {
        const sidebarFilters = {
            make: makeSelect.value,
            model: document.getElementById('model').value,
            year: document.getElementById('year').value,
            engineSize: document.getElementById('engine_size').value,
            numDoors: document.getElementById('num_doors').value,
            passengers: document.getElementById('passengers').value,
            fuelType: document.getElementById('fuel_type').value,
            gearbox: document.getElementById('gearbox').value,
            ac: document.getElementById('ac').value,
            electricWindows: document.getElementById('electric_windows').value
        };

        const filteredCars = allCars.filter(car => {
            const matchesSidebar =
                (sidebarFilters.make === '' || car.brand === sidebarFilters.make) &&
                (sidebarFilters.model === '' || car.model === sidebarFilters.model) &&
                (sidebarFilters.year === '' || String(car.year) === sidebarFilters.year) &&
                (sidebarFilters.engineSize === '' || String(car.engineSize) === sidebarFilters.engineSize) &&
                (sidebarFilters.numDoors === '' || String(car.numDoors) === sidebarFilters.numDoors) &&
                (sidebarFilters.passengers === '' || String(car.passengers) === sidebarFilters.passengers) &&
                (sidebarFilters.fuelType === '' || car.fuelType === sidebarFilters.fuelType) &&
                (sidebarFilters.gearbox === '' || car.gearbox === sidebarFilters.gearbox) &&
                (sidebarFilters.ac === '' || (car.ac ? 'Yes' : 'No') === sidebarFilters.ac) &&
                (sidebarFilters.electricWindows === '' || (car.electricWindows ? 'Yes' : 'No') === (car.electricWindows ? 'Yes' : 'No'));

            return matchesSidebar;
        });
        displayCars(filteredCars);
    }

    // Event listener for sort by category
    if (sortByCategory) {
      sortByCategory.addEventListener("change", function () {
        const selectedGroupID = this.value
        console.log("Sort dropdown changed to:", selectedGroupID)
  
        // Update the URL
        const url = new URL(window.location.href)
        if (selectedGroupID === "default" || selectedGroupID === "") {
          url.searchParams.delete("groupID")
        } else {
          url.searchParams.set("groupID", selectedGroupID)
        }
        window.history.pushState({}, "", url) // Update URL without reloading
  
        // Fetch and display cars
        fetchAndDisplayCars()
      })
    }

    // Event listener for the filter button (sidebar filters)
    if (filterButton) {
        filterButton.addEventListener('click', filterCars); // Apply sidebar filters to the currently fetched cars
    }

    function attachViewDetailsListeners() {
        const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
        const body = document.body;

        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', function() {
                const carId = this.dataset.carId;
                fetch(`${BASE_API_URL}/api/cars/${carId}`)
                .then(response => response.json())
                    .then(car => {
                        if (car) {
                            const popup = document.createElement('div');
                            popup.classList.add('car-details-popup');
                            popup.innerHTML = `
                                <h3>${car.brand} ${car.model} - Details</h3>
                                ${car.engineSize ? `<p><strong>Engine Size:</strong> ${car.engineSize} cc</p>` : ''}
                                ${car.numDoors ? `<p><strong>Number of Doors:</strong> ${car.numDoors}</p>` : ''}
                                ${car.passengers ? `<p><strong>Number of Passengers:</strong> ${car.passengers}</p>` : ''}
                                ${car.fuelType ? `<p><strong>Fuel Type:</strong> ${car.fuelType}</p>` : ''}
                                ${car.gearbox ? `<p><strong>Gearbox:</strong> ${car.gearbox}</p>` : ''}
                                <p><strong>AC:</strong> ${car.ac ? 'Yes' : 'No'}</p>
                                <p><strong>Electric Windows:</strong> ${car.electricWindows ? 'Yes' : 'No'}</p>
                                <p><strong>Daily Fee:</strong> $${car.dailyFee}</p>
                                <button class="close-popup">Close</button>
                            `;
                            body.appendChild(popup);

                            const closeButton = popup.querySelector('.close-popup');
                            closeButton.addEventListener('click', function() {
                                body.removeChild(popup);
                            });
                        } else {
                            alert('Car details not found.');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching car details:', error);
                        alert('Failed to load car details.');
                    });
            });
        });
    }

    function attachReserveListeners() {
        const reserveButtons = document.querySelectorAll('.reserve-btn');

        reserveButtons.forEach(button => {
            button.addEventListener('click', function() {
                const carId = this.dataset.carId;
                window.location.href = `../html/reservations.html?carId=${carId}`;
            });
        });
    }

    // Initialize the sort dropdown based on URL parameter
    initializeSortDropdown()

    // Initial fetch of cars (the backend will handle filtering based on URL)
    fetchAndDisplayCars();
});