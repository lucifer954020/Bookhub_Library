const API_URL = "https://script.google.com/macros/s/AKfycbwxnhm-fxAKRmLk825VdEjm6bD_UBw6AO-XnlXsRTaw-QsrgxAzjIv7SjUdNPd3F7yc1Q/exec";

// On load
window.onload = () => {
  loadBooks();
  loadLinks();
  updateVisitCount();
};

// 📚 Load PDF Books
async function loadBooks() {
  const container = document.getElementById("bookList");
  container.innerHTML = "📦 Loading books...";

  try {
    const res = await fetch(API_URL);
    const books = await res.json();

    if (!Array.isArray(books) || books.length === 0) {
      container.innerHTML = "📭 No books uploaded yet.";
      return;
    }

    container.innerHTML = "";
    books.forEach(book => {
      const div = document.createElement("div");
      div.className = "bg-white dark:bg-gray-800 p-4 rounded shadow text-sm";
      div.innerHTML = `
        <strong>${book.title}</strong><br>
        📁 Folder: ${book.folder || "Main"}<br>
        📦 Size: ${book.size} MB<br>
        📅 Date: ${new Date(book.date).toLocaleString()}<br>
        <a href="${book.link}" target="_blank" class="text-blue-600 dark:text-blue-400">📥 Download</a>
        <button onclick="confirmDelete('${book.title}', '${book.link}')" class="ml-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">🗑 Delete</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = "❌ Failed to load books.";
    console.error("Book load error:", err);
  }
}

// 🧹 Confirm + Delete PDF
async function confirmDelete(title, fileUrl) {
  const token = prompt("Enter admin password to delete:");
  if (!token) return;

  const formData = new URLSearchParams({
    method: "delete",
    title,
    fileUrl,
    token
  });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    const result = await res.text();
    if (result.trim() === "DELETED") {
      alert("✅ File deleted.");
      loadBooks();
    } else {
      alert("❌ Failed to delete:\n" + result);
    }
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

// 🔗 Load Approved Links
async function loadLinks() {
  const container = document.getElementById("importantLinks");
  container.innerHTML = "🔄 Loading links...";

  try {
    const res = await fetch(`${API_URL}?method=links`);
    const links = await res.json();

    if (!Array.isArray(links) || links.length === 0) {
      container.innerHTML = "<i>No links yet.</i>";
      return;
    }

    container.innerHTML = "";
    links.forEach(link => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${link.url}" target="_blank">${link.title}</a>`;
      container.appendChild(li);
    });
  } catch (err) {
    container.innerHTML = "❌ Failed to load links.";
    console.error("Link load error:", err);
  }
}

// 👁 Visit Counter
async function updateVisitCount() {
  const el = document.getElementById("visitCount");
  try {
    await fetch(`${API_URL}?method=logVisit`);
    const res = await fetch(`${API_URL}?method=getVisitCount`);
    const count = await res.text();
    el.textContent = `👁 Total Visits: ${count}`;
  } catch (err) {
    el.textContent = "👁 Visits: Unknown";
    console.error("Visit count error:", err);
  }
}
