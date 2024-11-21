document.addEventListener("DOMContentLoaded", () => {
  fetchPayloads();
});

let allPayloads = {};

// Populate Primary Filter
function populatePrimaryFilter() {
  const primaryFilter = document.getElementById("primaryFilter");
  primaryFilter.innerHTML = '<option value="">Select Vulnerability</option>';

  Object.keys(allPayloads).forEach((vulnerabilityType) => {
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

// Populate Msfvenom Dropdowns
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

// Generate Msfvenom Payload
function executeSearch() {
  const primaryFilter = document.getElementById("primaryFilter").value;
  const resultsContainer = document.getElementById("searchResults");
  const errorMessage = document.getElementById("error-message");
  const copyButton = document.getElementById("copyButton");

  errorMessage.textContent = "";
  resultsContainer.innerHTML = "";
  copyButton.style.display = "none";

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
}

// Copy Payloads
function copyPayloads() {
  const resultsContainer = document.getElementById("searchResults");
  const payloadItems = resultsContainer.getElementsByClassName("payload-item");

  if (payloadItems.length === 0) return;

  const payloadText = Array.from(payloadItems)
    .map((item) => item.textContent)
    .join("\n");

  navigator.clipboard.writeText(payloadText).catch((err) => {
    console.error("Error copying payloads:", err);
  });
}

// Fetch Payloads
function fetchPayloads() {
  fetch("payloads.json")
    .then((response) => response.json())
    .then((data) => {
      allPayloads = data;
      populatePrimaryFilter();
    })
    .catch((error) => console.error("Error loading payloads:", error));
}
