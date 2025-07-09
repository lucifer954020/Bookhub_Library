const API_URL = "https://script.google.com/macros/s/AKfycbwxnhm-fxAKRmLk825VdEjm6bD_UBw6AO-XnlXsRTaw-QsrgxAzjIv7SjUdNPd3F7yc1Q/exec";

window.onload = async () => {
  try {
    // 🧾 Load visits
    const resVisit = await fetch(`${API_URL}?method=getVisitCount`);
    const visitCount = await resVisit.text();
    document.getElementById("visitCount").textContent = visitCount || "0";

    // 📄 Load books
    const resBooks = await fetch(API_URL);
    const books = await resBooks.json();

    const totalPDFs = Array.isArray(books) ? books.length : 0;
    const uniqueFolders = new Set(books.map(book => book.folder || "Main")).size;

    document.getElementById("pdfCount").textContent = totalPDFs;
    document.getElementById("folderCount").textContent = uniqueFolders;

    // 🔗 Load links
    const resLinks = await fetch(`${API_URL}?method=links`);
    const links = await resLinks.json();
    document.getElementById("linkCount").textContent = Array.isArray(links) ? links.length : 0;

  } catch (err) {
    console.error("❌ Error loading stats:", err);
    const statContainer = document.getElementById("stats");
    if (statContainer) {
      statContainer.innerHTML = "<p class='text-red-600 text-center'>❌ Failed to load stats. Please try again later.</p>";
    }
  }
};
