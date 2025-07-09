const API_URL = "https://script.google.com/macros/s/AKfycbwxnhm-fxAKRmLk825VdEjm6bD_UBw6AO-XnlXsRTaw-QsrgxAzjIv7SjUdNPd3F7yc1Q/exec";
const ADMIN_TOKEN = "Pawan123@";

// On page load
window.onload = () => {
  loadBooks();
  loadLinks();
  updateVisitCount();
};

async function loadBooks() {
  const container = document.getElementById("bookList");
  container.innerHTML = "Loading books...";

  try {
    const res = await fetch(API_URL);
    const books = await res.json();

    if (books.length === 0) {
      container.innerHTML = "No books uploaded yet.";
      return;
    }

    container.innerHTML = "";
    books.forEach(book => {
      const div = document.createElement("div");
      div.className = "book-item";
      div.innerHTML = `
        <strong>${book.title}</strong><br>
        Size: ${book.size} MB<br>
        Uploaded: ${new Date(book.date).toLocaleString()}<br>
        <a href="${book.link}" target="_blank">📥 Download</a>
        <button onclick="confirmDelete('${book.title}', '${book.link}')">🗑 Delete</button>
        <hr>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = "❌ Failed to load books.";
  }
}

async function confirmDelete(title, fileUrl) {
  const token = prompt("Enter admin password to delete:");
  if (!token) return;

  const params = new URLSearchParams({
    method: "delete",
    title,
    fileUrl,
    token
  });

  try {
    const res = await fetch(`${API_URL}?${params}`);
    const result = await res.text();

    if (result === "DELETED") {
      alert("✅ Deleted successfully.");
      loadBooks();
    } else {
      alert("❌ Failed to delete: " + result);
    }
  } catch {
    alert("❌ Error during deletion.");
  }
}

async function loadLinks() {
  const container = document.getElementById("importantLinks");
  try {
    const res = await fetch(`${API_URL}?method=links`);
    const links = await res.json();

    if (links.length === 0) {
      container.innerHTML = "<i>No important links yet.</i>";
      return;
    }

    container.innerHTML = "";
    links.forEach(link => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${link.url}" target="_blank">${link.title}</a>`;
      container.appendChild(li);
    });
  } catch {
    container.innerHTML = "❌ Failed to load links.";
  }
}

async function updateVisitCount() {
  const el = document.getElementById("visitCount");
  await fetch(`${API_URL}?method=logVisit`);
  const res = await fetch(`${API_URL}?method=getVisitCount`);
  const count = await res.text();
  el.textContent = `👁 Total Visits: ${count}`;
}
