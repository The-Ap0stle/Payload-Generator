document.addEventListener("DOMContentLoaded", () => {
    fetchPayloads();
  });

  let allPayloads = {};

// Toggle hamburger menu
function toggleMenu() {
  const menuItems = document.getElementById('menuItems');
  menuItems.style.display = menuItems.style.display === 'block' ? 'none' : 'block';
}

// Show specified section
function showSection(section) {
  document.querySelector('.search-section').style.display = 'none';
  document.querySelector('.help-section').style.display = 'none';

  if (section === 'search') document.getElementById('searchSection').style.display = 'block';
 
  if (section === 'help') document.getElementById('helpSection').style.display = 'block';

  
}

// Populate Primary Filter Options
function populatePrimaryFilter() {
    const primaryFilter = document.getElementById("primaryFilter");
    primaryFilter.innerHTML = '<option value="">Select Vulnerability</option>'; // Reset options
    
    Object.keys(allPayloads).forEach(vulnerabilityType => {
        const option = document.createElement("option");
        option.value = vulnerabilityType;
        option.textContent = vulnerabilityType;
        primaryFilter.appendChild(option);
    });
}

// Update Secondary Filter Options
function updateSecondaryFilter() {
    const primaryFilter = document.getElementById("primaryFilter").value;
    const secondaryFilter = document.getElementById("secondaryFilter");
    secondaryFilter.innerHTML = "";
  
    if (primaryFilter && allPayloads[primaryFilter]) {
      Object.keys(allPayloads[primaryFilter]).forEach(subType => {
        const option = document.createElement("option");
        option.value = subType;
        option.textContent = subType;
        secondaryFilter.appendChild(option);
      });
      secondaryFilter.classList.remove("disabled");
    } else {
      secondaryFilter.innerHTML = '<option>No Options</option>';
      secondaryFilter.classList.add("disabled");
    }
  } 

  // Function to fetch and load payloads from JSON file
  function fetchPayloads() {
    fetch("https://raw.githubusercontent.com/The-Ap0stle/Payload-Generator/main/payloads.json")
      .then(response => response.json())
      .then(data => {
        allPayloads = data;
        populatePrimaryFilter(); // Populate primary filter options after loading data
      })
      .catch(error => console.error("Error loading payloads:", error));
  }
  
  // Executes search based on filters and optional keyword
  function executeSearch() {
    const primaryFilter = document.getElementById("primaryFilter").value;
    const secondaryFilter = document.getElementById("secondaryFilter").value;
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    const resultsContainer = document.getElementById("searchResults");
    const errorMessage = document.getElementById("error-message");
    const copyButton = document.getElementById("copyButton");
    
    errorMessage.textContent = "";
    resultsContainer.innerHTML = "";
    copyButton.style.display = "none";

    if (keyword && (!primaryFilter || !secondaryFilter)) {
      errorMessage.textContent = "Please set filters to search with keywords.";
      return;
    }
    
    if (!primaryFilter || !secondaryFilter) {
      errorMessage.textContent = "Please set filters to search.";
      return;
    }
    
    let filteredPayloads = allPayloads[primaryFilter][secondaryFilter];
    
    // Filter by keyword if provided
    if (keyword) {
      filteredPayloads = filteredPayloads.filter(payload => payload.toLowerCase().includes(keyword));
    }
    
    // Display filtered payloads or no results message
    if (filteredPayloads.length > 0) {
      filteredPayloads.forEach(payload => {
        const payloadItem = document.createElement("div");
        payloadItem.className = "payload-item";
        payloadItem.textContent = payload;
        resultsContainer.appendChild(payloadItem);
      });
      copyButton.style.display = "inline-block";
    } else {
      resultsContainer.innerHTML = "<p>No payloads found.</p>";
    }
  }

  function copyPayloads() {
    const resultsContainer = document.getElementById("searchResults");
    const payloadItems = resultsContainer.getElementsByClassName("payload-item");

    if (payloadItems.length === 0) return;

    const payloadText = Array.from(payloadItems).map(item => item.textContent).join("\n");

    navigator.clipboard.writeText(payloadText).catch(err => {
      console.error("Error copying payloads:", err);
    });
  }  
      
