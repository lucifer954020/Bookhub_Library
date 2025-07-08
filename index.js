const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzwTDUbzfuInO33rPEapcZlFMHwKF2UuieXrn570n7lQtg1ywwGouhzqmfcFhea-AADuw/exec";

let books = [];

async function loadBooks() {
  try {
    const res = await fetch(SHEET_API_URL);
    const data = await res.json();
    books = data;
    displayBooks(books);
  } catch (err) {
    console.error("Failed to load books:", err);
  }
}

function displayBooks(bookList) {
  const container = document.getElementById("bookList");
  container.innerHTML = "";

  bookList.forEach(book => {
    const fileId = book.link.match(/[-\\w]{25,}/)?.[0];
    const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const card = document.createElement("div");
    card.className = "bg-white shadow-md p-4 rounded-lg flex flex-col justify-between";

    card.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">${book.title}</h3>
      <p class="text-gray-500 text-sm mb-1">Size: ${book.size} MB</p>
      <p class="text-gray-500 text-sm mb-3">Uploaded: ${new Date(book.date).toLocaleDateString()}</p>
      <a href="${downloadLink}" target="_blank" class="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">Download</a>
      <button class="delete-btn mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 hidden">Delete</button>
    `;

    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => handleDelete(book.title, book.link, card));

    container.appendChild(card);
  });

  checkAdminAccess();
}


const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = books.filter(b => b.title.toLowerCase().includes(keyword));
  displayBooks(filtered);
});

const sortSelect = document.getElementById("sortBy");
sortSelect.addEventListener("change", () => {
  const sorted = [...books];
  const sortBy = sortSelect.value;
  if (sortBy === "name") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "recent") {
    sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === "size") {
    sorted.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  }
  displayBooks(sorted);
});

window.onload = loadBooks;
let adminToken = null;

function checkAdminAccess() {
  const isAdmin = confirm("Are you an admin? Click OK to enter token.");
  if (isAdmin) {
    const token = prompt("Enter admin delete token:");
    if (token) {
      adminToken = token;
      document.querySelectorAll(".delete-btn").forEach(btn => btn.classList.remove("hidden"));
    }
  }
}

async function handleDelete(title, fileUrl, cardElement) {
  if (!adminToken) return alert("Admin token not set.");

  const confirmDelete = confirm(`Are you sure you want to delete "${title}"?`);
  if (!confirmDelete) return;

  const response = await fetch("https://script.google.com/macros/s/AKfycbwxnhm-fxAKRmLk825VdEjm6bD_UBw6AO-XnlXsRTaw-QsrgxAzjIv7SjUdNPd3F7yc1Q/exec?method=delete", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token: adminToken,
      fileUrl: fileUrl,
      title: title
    })
  });

  const result = await response.text();
  if (result === "DELETED") {
    alert("✅ Deleted successfully.");
    cardElement.remove();
  } else {
    alert("❌ Failed: " + result);
  }
}
