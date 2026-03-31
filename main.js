// ── Auth ──────────────────────────────────────────────────────────────────
const user = JSON.parse(localStorage.getItem("user")) || { username: "demo", phone: "", contact_info: "" };
const currentUserId = user.username;

let items = JSON.parse(localStorage.getItem("lnf_items")) || [];

const formBox     = document.getElementById("formBox");
const addBtn      = document.getElementById("addBtn");
const submitBtn   = document.getElementById("submitBtn");
const searchInput = document.getElementById("search");
const itemsDiv    = document.getElementById("items");

// ── Toggle form visibility ─────────────────────────────────────────────────
addBtn.onclick = () => {
    // Use getComputedStyle so we correctly detect display:none set by CSS class
    const isOpen = getComputedStyle(formBox).display !== "none";
    formBox.style.display  = isOpen ? "none" : "block";
    itemsDiv.style.display = isOpen ? "flex" : "none";
};

// ── Image preview ──────────────────────────────────────────────────────────
function previewImage(input) {
    const preview = document.getElementById("imagePreview");
    preview.innerHTML = "";
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.cssText = "max-width:100%;max-height:160px;border-radius:8px;margin-top:8px;";
            preview.appendChild(img);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ── Submit new item ────────────────────────────────────────────────────────
submitBtn.onclick = () => {
    const title       = document.getElementById("title").value.trim();
    const location    = document.getElementById("location").value.trim();
    const description = document.getElementById("description").value.trim();
    const imageInput  = document.getElementById("image");
    const statusInput = document.querySelector('input[name="status"]:checked');
    const errorBox    = document.getElementById("error");

    errorBox.style.color = "red";
    errorBox.innerText   = "";

    const hasImage = imageInput.files && imageInput.files[0];

    // Must have name OR image
    if (!title && !hasImage) {
        errorBox.innerText = "Please provide an item name or upload an image (or both).";
        return;
    }

    // Use FileReader to convert image to base64, then save
    const saveItem = (imageData) => {
        const item = {
            id:           Date.now(),
            title:        title || "Unnamed Item",
            location,
            description,
            contact_info: user.contact_info || user.phone || "",
            image:        imageData || null,
            status:       statusInput ? statusInput.value : "found",
            date:         new Date().toLocaleDateString(),
            owner:        currentUserId
        };

        items.push(item);
        saveAndRender();

        // Clear form
        document.getElementById("title").value       = "";
        document.getElementById("location").value    = "";
        document.getElementById("description").value = "";
        imageInput.value = "";
        document.getElementById("imagePreview").innerHTML = "";

        formBox.style.display  = "none";
        itemsDiv.style.display = "flex";
    };

    if (hasImage) {
        const reader = new FileReader();
        reader.onload = (e) => saveItem(e.target.result);
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveItem(null);
    }
};

// ── Delete item ────────────────────────────────────────────────────────────
function deleteItem(id, owner) {
    if (owner !== currentUserId) {
        alert("You can only remove your own items.");
        return;
    }
    if (!confirm("Remove this item?")) return;
    items = items.filter(item => item.id !== id);
    saveAndRender();
}

// ── Save & render ──────────────────────────────────────────────────────────
function saveAndRender() {
    try {
        localStorage.setItem("lnf_items", JSON.stringify(items));
    } catch (e) {
        // localStorage quota exceeded (common with large base64 images)
        const errorBox = document.getElementById("error");
        if (errorBox) {
            errorBox.style.color = "red";
            errorBox.innerText = "Storage full! Try uploading a smaller image.";
        }
        // Remove the item we just pushed so state stays consistent
        items.pop();
        return;
    }
    renderItems();
}

// ── Render items ───────────────────────────────────────────────────────────
function renderItems() {
    const search   = searchInput.value.toLowerCase();
    const filtered = items.filter(item =>
        item.title.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search))
    );

    itemsDiv.innerHTML = "";

    if (filtered.length === 0) {
        itemsDiv.innerHTML = "<div class='empty'>Nothing to be found here.</div>";
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";

        const locationHTML = item.location
            ? `<div class="meta">Location: ${item.location}</div>` : "";

        const badge = item.status === "found"
            ? `<span class="badge badge-found">Found</span>`
            : `<span class="badge badge-lost">Lost</span>`;

        const contactBtn = item.contact_info
            ? `<a href="https://wa.me/${item.contact_info.replace(/\D/g, '')}"
                  target="_blank" class="contact-finder-link">
                 <button class="contact-btn">Contact the Finder</button>
               </a>` : "";

        const deleteBtn = item.owner === currentUserId
            ? `<button class="delete-btn" onclick="deleteItem(${item.id}, '${item.owner}')">Remove</button>`
            : "";

        // Support both old image_url (string) and new image (base64)
        const imgSrc = item.image || item.image_url || null;

        div.innerHTML = `
            ${imgSrc ? `<img src="${imgSrc}" alt="${item.title}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:8px;">` : ""}
            ${badge}
            <h4>${item.title}</h4>
            ${locationHTML}
            <div class="meta">Date: ${item.date}</div>
            <p>${item.description || ""}</p>
            <div class="meta">Posted by <strong>${item.owner}</strong></div>
            ${contactBtn}
            ${deleteBtn}
        `;

        itemsDiv.appendChild(div);
    });
}

searchInput.addEventListener("input", renderItems);
renderItems();
