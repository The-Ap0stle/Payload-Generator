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
  const filenameInput = document.getElementById("filenameInput");

  const payloadDropdown = document.getElementById("payloadDropdown");
  const encoderDropdown = document.getElementById("encoderDropdown");
  const iterationsInput = document.getElementById("iterationsInput");
  const formatDropdown = document.getElementById("formatDropdown");
  const outputInput = document.getElementById("outputInput");
  const generateButton = document.getElementById("generateButton");

  secondaryFilter.innerHTML = "";
  dynamicInputs.style.display = "none";
  filenameInput.style.display = "none";

  // Show Msfvenom Builder fields
  if (primaryFilter === "Msfvenom Builder") {
    dynamicInputs.style.display = "flex";
    payloadDropdown.style.display = "inline-block";
    encoderDropdown.style.display = "inline-block";
    iterationsInput.style.display = "inline-block";
    formatDropdown.style.display = "inline-block";
    outputInput.style.display = "inline-block";
    generateButton.style.display = "inline-block";

    // Populate dropdowns
    const payloads = allPayloads["Msfvenom Builder"]["Payloads"];
    const encoders = allPayloads["Msfvenom Builder"]["Encoder"];

    populateDropdown(payloadDropdown, payloads);
    populateDropdown(encoderDropdown, encoders);
  }
} 

// Populate dropdown with options
function populateDropdown(dropdown, options) {
  dropdown.innerHTML = '<option value="">Select Option</option>'; // Reset options
  options.forEach(option => {
    const optElement = document.createElement("option");
    optElement.value = option;
    optElement.textContent = option;
    dropdown.appendChild(optElement);
  });
}

function generateMsfvenomCommand() {
  const lhost = document.getElementById("lhostInput").value.trim();
  const lport = document.getElementById("lportInput").value.trim();
  const payload = document.getElementById("payloadDropdown").value;
  const encoder = document.getElementById("encoderDropdown").value;
  const iterations = document.getElementById("iterationsInput").value.trim();
  const format = document.getElementById("formatDropdown").value;
  const output = document.getElementById("outputInput").value.trim();
  
  if (!lhost || !lport || !payload || !output) {
    alert("LHOST, LPORT, Payload, and Output are required fields!");
    return;
  }

  let command = `msfvenom -p ${payload} LHOST=${lhost} LPORT=${lport} -o ${output}`;
  if (format) command += ` -f ${format}`;
  if (encoder) command += ` -e ${encoder}`;
  if (iterations) command += ` -i ${iterations}`;

  alert(`Generated Command:\n\n${command}`);
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
   if (primaryFilter === "Reverse Shell") {
    filteredPayloads = filteredPayloads.map((payload) =>
      payload.replace(/\[LHOST\]/g, lhostInput || "[LHOST]").replace(/\[LPORT\]/g, lportInput || "[LPORT]")
    );
  } else if (primaryFilter === "File Transfer") {
    filteredPayloads = filteredPayloads.map((payload) =>
      payload
        .replace(/\[LHOST\]/g, lhostInput || "[LHOST]")
        .replace(/\[LPORT\]/g, lportInput || "[LPORT]")
        .replace(/\[File\]/g, filenameInput || "[FILENAME]")
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
    
