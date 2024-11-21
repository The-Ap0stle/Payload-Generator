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

function populateMsfvenomBuilder() {
  const payloadDropdown = document.getElementById("payloadDropdownBuilder");
  const encoderDropdown = document.getElementById("encoderDropdownBuilder");
  const formatDropdown = document.getElementById("formatDropdownBuilder");

  // Populate dropdowns from JSON
  const payloads = allPayloads["Msfvenom Builder"]["Payload"] || [];
  const encoders = allPayloads["Msfvenom Builder"]["Encoder"] || [];
  const formats = allPayloads["Msfvenom Builder"]["Format"] || [];

  populateDropdown(payloadDropdown, payloads);
  populateDropdown(encoderDropdown, encoders);
  populateDropdown(formatDropdown, formats);
}

// Helper Function to Populate Dropdowns
function populateDropdown(dropdown, items) {
  dropdown.innerHTML = '<option value="">Select an Option</option>'; // Clear existing options
  if (items.length === 0) {
    dropdown.innerHTML = '<option value="">No Options Available</option>';
    return;
  }

  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    dropdown.appendChild(option);
  });
}

// Update Secondary Filter Options
function updateSecondaryFilter() {
  const primaryFilter = document.getElementById("primaryFilter").value;
  const secondaryFilter = document.getElementById("secondaryFilter");
  const dynamicInputs = document.getElementById("dynamicInputs");
  const filenameInput = document.getElementById("filenameInput");
  const msfvenomBuilder = document.getElementById("msfvenomBuilder");
  secondaryFilter.innerHTML = "";
  dynamicInputs.style.display = "none";
  filenameInput.style.display = "none";
  msfvenomBuilder.style.display = "none";

  if (primaryFilter === "Msfvenom Builder") {
    msfvenomBuilder.style.display = "block"; // Show Msfvenom Builder
    populateMsfvenomBuilder(); // Populate builder dropdowns
    return;
  } 

  if (primaryFilter === "Reverse Shell") {
    dynamicInputs.style.display = "flex";
  } else if (primaryFilter === "File Transfer") {
    dynamicInputs.style.display = "flex";
    filenameInput.style.display = "inline-block";
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

function generateMsfvenomCommand() {
  const lhost = document.getElementById("lhostInputBuilder").value.trim();
  const lport = document.getElementById("lportInputBuilder").value.trim();
  const payload = document.getElementById("payloadDropdownBuilder").value;
  const encoder = document.getElementById("encoderDropdownBuilder").value;
  const iterations = document.getElementById("iterationsInputBuilder").value.trim();
  const format = document.getElementById("formatDropdownBuilder").value;
  const output = document.getElementById("outputInputBuilder").value.trim();
  const commandContainer = document.getElementById("generatedCommandContainer");
  const copyButton = document.getElementById("copyCommandButtonBuilder");

  if (!lhost || !lport || !payload || !output) {
    errorMessage.textContent = "LHOST, LPORT, Payload, and Output are required fields!";
    return;
  } 

  let command = `msfvenom -p ${payload} LHOST=${lhost} LPORT=${lport} -o ${output}`;
  if (format) command += ` -f ${format}`;
  if (encoder) command += ` -e ${encoder}`;
  if (iterations) command += ` -i ${iterations}`;

  commandContainer.innerHTML = `<p>Run the Following Command in Terminal:</p><code>${command}</code>`;
  copyButton.style.display = "inline-block"; // Show the copy button
}

function copyMsfvenomCommand() {
  const commandContainer = document.getElementById("generatedCommandContainer");
  const commandText = commandContainer.innerText || "";

  if (commandText) {
    navigator.clipboard
      .writeText(commandText)
      .catch((err) => console.error("Error copying command:", err));
  }
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
    
