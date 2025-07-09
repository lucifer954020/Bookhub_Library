const API_URL = "https://script.google.com/macros/s/AKfycbwxnhm-fxAKRmLk825VdEjm6bD_UBw6AO-XnlXsRTaw-QsrgxAzjIv7SjUdNPd3F7yc1Q/exec";

// On page load
window.onload = () => {
  loadBooks();
  loadLinks();
  updateVisitCount();
  setupDarkMode(); // 👈 initialize dark mode toggle
};

async function loadBooks() {
  const container = document.getElementById("bookList");
  container.innerHTML = "Loading books...";

  try {
    const res = await fetch(API_URL);
    const books = await res.json();

    if (!Array.isArray(books) || books.length === 0) {
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
    console.error(err);
  }
}
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
      alert("✅ File deleted successfully.");
      loadBooks();
    } else {
      alert("❌ Failed to delete:\n" + result);
    }
  } catch (err) {
    alert("❌ Error deleting file: " + err.message);
  }
}

async function loadLinks() {
  const container = document.getElementById("importantLinks");
  try {
    const res = await fetch(`${API_URL}?method=links`);
    const links = await res.json();

    if (!Array.isArray(links) || links.length === 0) {
      container.innerHTML = "<i>No important links yet.</i>";
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
    console.error(err);
  }
}

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

// 🌙 Dark Mode Toggle Support
function setupDarkMode() {
  const toggle = document.getElementById("darkToggle");
  const body = document.body;
  const circle = document.getElementById("toggleCircle");

  if (!toggle || !circle) return; // Don't run if toggle elements are missing

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.add("bg-gray-900", "text-white");
      circle.classList.add("translate-x-5");
    } else {
      body.classList.remove("bg-gray-900", "text-white");
      circle.classList.remove("translate-x-5");
    }
  });
}
