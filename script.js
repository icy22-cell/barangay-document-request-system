"use strict";

const form = document.getElementById("request-form");
const requestList = document.getElementById("request-list");
const emptyMessage = document.getElementById("empty-message");
const submitButton = document.getElementById("submit-btn");

const STORAGE_KEY = "barangayDocumentRequests";

function loadRequests() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Could not load saved requests:", error);
    return [];
  }
}

let requests = loadRequests();

function saveRequests() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.warn("Could not save requests in this browser:", error);
    alert("Your request was added for this session, but your browser could not save it for later.");
  }
}

function createReferenceNumber() {
  // Short unique reference based on the date and a random suffix.
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `BR-${datePart}-${randomPart}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
}

function addCell(row, value) {
  const cell = document.createElement("td");
  // textContent prevents form input from being interpreted as HTML.
  cell.textContent = value ?? "";
  row.appendChild(cell);
  return cell;
}

function renderRequests() {
  requestList.replaceChildren();

  requests.forEach((request) => {
    const row = document.createElement("tr");
    addCell(row, request.reference);
    addCell(row, request.fullName);
    addCell(row, request.documentType);
    addCell(row, request.purpose);
    addCell(row, formatDate(request.date));

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "status-badge";
    badge.textContent = request.status || "Pending";
    statusCell.appendChild(badge);
    row.appendChild(statusCell);

    requestList.appendChild(row);
  });

  emptyMessage.hidden = requests.length > 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const fullName = document.getElementById("full-name").value.trim();
  const address = document.getElementById("address").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const documentType = document.getElementById("document-type").value;
  const purpose = document.getElementById("purpose").value.trim();

  if (!fullName || !address || !contact || !documentType || !purpose) {
    alert("Please complete all fields before submitting.");
    return;
  }

  const request = {
    reference: createReferenceNumber(),
    fullName,
    address,
    contact,
    documentType,
    purpose,
    date: new Date().toISOString(),
    status: "Pending"
  };

  requests.unshift(request);
  saveRequests();
  renderRequests();
  form.reset();

  alert(
    `Request submitted successfully!\nYour reference number is ${request.reference}.\nStatus: Pending`
  );
});

renderRequests();
