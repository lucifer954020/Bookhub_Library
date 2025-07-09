const API_URL = "https://script.google.com/macros/s/AKfycbwxnhm-fxAKRmLk825VdEjm6bD_UBw6AO-XnlXsRTaw-QsrgxAzjIv7SjUdNPd3F7yc1Q/exec";

let allBooks = [];

window.onload = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Invalid data format");

    allBooks = data;
    displayBooks(allBooks);
  } catch (err) {
    document.getElementById("filteredList").innerHTML = "❌ Failed to load books.";
    console.error(err);
  }
};

function applyFilters() {
  const nameQuery = document.getElementById("filterName").value.toLowerCase();
  const folderQuery = document.getElementById("filterFolder").value.toLowerCase();
  const sortBy = document.getElementById("sortBy").value;

  let filtered = allBooks.filter(book => {
    return (
      (!nameQuery || book.title.toLowerCase().includes(nameQuery)) &&
      (!folderQuery || (book.folder || "").toLowerCase().includes(folderQuery))
    );
  });

  if (sortBy === "name") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "size") {
    filtered.sort((a, b) => parseFloat(a.size) - parseFloat(b.size));
  } else if (sortBy === "date") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  displayBooks(filtered);
}

function displayBooks(books) {
  const container = document.getElementById("filteredList");
  if (!books.length) {
    container.innerHTML = "<i>No results found.</i>";
    return;
  }

  container.innerHTML = "";

  books.forEach(book => {
    const div = document.createElement("div");
    div.className = "bg-white dark:bg-gray-800 p-4 rounded shadow text-sm";

    div.innerHTML = `
      <strong class="text-base">${book.title}</strong><br>
      Folder: <code>${book.folder || "N/A"}</code><br>
      Size: ${book.size} MB<br>
      Uploaded: ${new Date(book.date).toLocaleString()}<br>
      <a href="${book.link}" target="_blank" class="text-blue-600 dark:text-blue-400">📥 Download</a>
    `;

    container.appendChild(div);
  });
}

