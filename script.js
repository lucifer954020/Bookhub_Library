const UPLOAD_API_URL = "https://script.google.com/macros/s/AKfycbzwTDUbzfuInO33rPEapcZlFMHwKF2UuieXrn570n7lQtg1ywwGouhzqmfcFhea-AADuw/exec";

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const title = form.description.value;
  const file = form.file.files[0];

  if (!file) {
    alert("Please select a PDF file");
    return;
  }

  const formData = new FormData();
  formData.append("description", title);
  formData.append("file", file);

  try {
    const res = await fetch(UPLOAD_API_URL, {
      method: "POST",
      body: formData,
    });

    const link = await res.text();
    console.log("Upload response:", link);

    if (link.startsWith("https://")) {
      document.getElementById("responseMsg").innerHTML = `✅ Uploaded successfully! <a href="${link}" target="_blank">View PDF</a>`;
    } else {
      document.getElementById("responseMsg").innerText = "⚠️ Upload failed: " + link;
    }
  } catch (error) {
    console.error("Upload error:", error);
    document.getElementById("responseMsg").innerText = "⚠️ Error: " + error.message;
  }
});