const API_URL = "https://script.google.com/macros/s/AKfycbwxnhm-fxAKRmLk825VdEjm6bD_UBw6AO-XnlXsRTaw-QsrgxAzjIv7SjUdNPd3F7yc1Q/exec";

window.onload = async () => {
  try {
    // Fetch all uploaded PDFs
    const resBooks = await fetch(API_URL);
    const books = await resBooks.json();

    const totalPDFs = books.length;
    const uniqueFolders = new Set(books.map(book => book.folder || "")).size;

    document.getElementById("pdfCount").textContent = totalPDFs;
    document.getElementById("folderCount").textContent = uniqueFolders;

    // Fetch approved links
    const resLinks = await fetch(`${API_URL}?method=links`);
    const links = await resLinks.json();
    document.getElementById("linkCount").textContent = links.length;

  } catch (err) {
    console.error("Error loading stats:", err);
    document.getElementById("stats").innerHTML = "❌ Failed to load stats.";
  }
};
