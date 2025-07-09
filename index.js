// index.js
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwxnhm-fxAKRmLk825VdEjm6bD_UBw6AO-XnlXsRTaw-QsrgxAzjIv7SjUdNPd3F7yc1Q/exec";
const UPLOAD_API_URL = SHEET_API_URL;

let books = [];
let adminToken = null;

async function loadBooks() {
  try {
    const res = await fetch(SHEET_API_URL);
    const data = await res.json();
    books = data;
    displayBooks(books);
    loadLinks();
  } catch (err) {
    console.error("Failed to load books:", err);
  }
}

function displayBooks(bookList) {
  const container = document.getElementById("bookList");
  container.innerHTML = "";

  bookList.forEach(book => {
    const fileId = book.link.match(/[-\w]{25,}/)?.[0];
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

function checkAdminAccess() {
  const isAdmin = confirm("Are you an admin? Click OK to enter token.");
  if (isAdmin) {
    const token = prompt("Enter admin delete token:");
    if (token === "Pawan123@") {
      adminToken = token;
      document.querySelectorAll(".delete-btn").forEach(btn => btn.classList.remove("hidden"));
      addLinkUploadForm();
    } else {
      alert("❌ Invalid token.");
    }
  }
}

async function handleDelete(title, fileUrl, cardElement) {
  if (!adminToken) return alert("Admin token not set.");
  const confirmDelete = confirm(`Are you sure you want to delete "${title}"?`);
  if (!confirmDelete) return;

  const url = new URL(SHEET_API_URL);
  url.searchParams.append("method", "delete");
  url.searchParams.append("token", adminToken);
  url.searchParams.append("fileUrl", fileUrl);
  url.searchParams.append("title", title);

  const response = await fetch(url);
  const result = await response.text();
  if (result === "DELETED") {
    alert("✅ Deleted successfully.");
    cardElement.remove();
  } else {
    alert("❌ Failed: " + result);
  }
}

document.getElementById("searchInput").addEventListener("input", () => {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = books.filter(b => b.title.toLowerCase().includes(keyword));
  displayBooks(filtered);
});

document.getElementById("sortBy").addEventListener("change", () => {
  const sorted = [...books];
  const sortBy = document.getElementById("sortBy").value;
  if (sortBy === "name") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "recent") {
    sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === "size") {
    sorted.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  }
  displayBooks(sorted);
});

async function loadLinks() {
  const linkList = document.getElementById("linkList");
  linkList.innerHTML = "<li>Loading...</li>";
  try {
    const res = await fetch(SHEET_API_URL + "?method=links");
    const links = await res.json();
    linkList.innerHTML = "";
    links.forEach(link => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${link.url}" target="_blank" class="text-blue-600 hover:underline">${link.title}</a>`;
      linkList.appendChild(li);
    });
  } catch (e) {
    linkList.innerHTML = "<li>Failed to load links.</li>";
  }
}

function addLinkUploadForm() {
  const container = document.getElementById("importantLinks");
  const form = document.createElement("form");
  form.classList.add("mt-4");
  form.innerHTML = `
    <input type="text" id="linkTitle" placeholder="Link Title" class="p-2 border rounded mr-2 mb-2" />
    <input type="url" id="linkURL" placeholder="https://..." class="p-2 border rounded mr-2 mb-2" />
    <button class="bg-green-600 text-white px-4 py-2 rounded">Add</button>
  `;
  form.onsubmit = async e => {
    e.preventDefault();
    const title = document.getElementById("linkTitle").value;
    const url = document.getElementById("linkURL").value;

    await fetch(SHEET_API_URL + "?method=addlink&token=" + adminToken + "&title=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(url));
    alert("✅ Link added.");
    loadLinks();
  };
  container.appendChild(form);
}

window.onload = loadBooks;
