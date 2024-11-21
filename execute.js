document.addEventListener("DOMContentLoaded", () => {
    fetchPayloads();
  });

  let allPayloads = {};

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
    const dynamicInputs = document.getElementById("dynamicInputs");
    secondaryFilter.innerHTML = "";

    if (primaryFilter === "Reverse Shell" || primaryFilter === "File Transfer") {
      dynamicInputs.style.display = "flex";
    } else {
      dynamicInputs.style.display = "none";
    }
  
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
    fetch("payloads.json")
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
    const lhostInput = document.getElementById("lhostInput").value; // Get the value
    const lportInput = document.getElementById("lportInput").value;
    const filenameInput = document.getElementById("filenameInput").value;
    
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

     // Replace placeholders if inputs are provided
     if (primaryFilter === "Reverse Shell" || primaryFilter === "File Transfer") {
      filteredPayloads = filteredPayloads.map((payload) =>
        payload
          .replace(/\[LHOST\]/g, lhostInput || "[LHOST]")
          .replace(/\[LPORT\]/g, lportInput || "[LPORT]")
          .replace(/\[FILENAME\]/g, filenameInput || "[FILENAME]")
      );
    }
    
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
      
