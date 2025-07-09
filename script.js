const UPLOAD_API_URL = "https://script.google.com/macros/s/AKfycbwxnhm-fxAKRmLk825VdEjm6bD_UBw6AO-XnlXsRTaw-QsrgxAzjIv7SjUdNPd3F7yc1Q/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const message = document.getElementById("responseMsg");
  const progress = document.getElementById("progressBar");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = form.description.value.trim();
    const file = form.file.files[0];
    const password = form.pdfPassword.value;
    const folderName = form.folderName.value.trim();

    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF.");
      return;
    }

    message.innerText = "📤 Preparing file...";
    progress.value = 0;
    progress.classList.remove("hidden");

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      const data = new URLSearchParams({
        method: "upload",
        file: base64,
        filename: file.name,
        description: title,
        pdfPassword: password,
        folderName: folderName
      });

      const xhr = new XMLHttpRequest();
      xhr.open("POST", UPLOAD_API_URL, true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          progress.value = percent;
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 && xhr.responseText.startsWith("https://")) {
          message.innerHTML = `✅ Uploaded successfully! <a href="${xhr.responseText}" target="_blank" class="text-blue-600 underline">View PDF</a>`;
        } else {
          message.innerText = "❌ Upload failed: " + xhr.responseText;
        }
        progress.classList.add("hidden");
      };

      xhr.onerror = () => {
        message.innerText = "❌ Upload error.";
        progress.classList.add("hidden");
      };

      xhr.send(data);
    };

    reader.readAsDataURL(file);
  });
});
