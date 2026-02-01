const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");
const modal = document.getElementById("terms-modal");
const termsScroll = document.getElementById("terms-scroll");
const termsActions = document.querySelector(".terms-actions");
const agreeBtn = document.getElementById("agree-btn");
const ageBtn = document.getElementById("age-btn");
const signupBtn = document.getElementById("signup-btn");
const constructionBubble = document.getElementById("construction-bubble");
const sidebarButtons = document.querySelectorAll(".sidebar-btn");
const subpages = document.querySelectorAll(".subpage");
const sidebarBack = document.getElementById("sidebar-back");
const supportForm = document.getElementById("support-form");
const supportSubmit = document.getElementById("support-submit");
const supportStatus = document.getElementById("support-status");
const wordCount = document.getElementById("word-count");
const adminSubmit = document.getElementById("admin-submit");
const adminCodeInput = document.getElementById("admin-code");
const adminLock = document.getElementById("admin-lock");
const adminContent = document.getElementById("admin-content");
const adminError = document.getElementById("admin-error");
const bannerSlot = document.getElementById("banner-slot");
const profileSlot = document.getElementById("profile-slot");
const imagesGrid = document.getElementById("images-grid");
const videosGrid = document.getElementById("videos-grid");
const adminMedia = document.getElementById("admin-media");
const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightbox-content");
const collapseBtn = document.getElementById("collapse-btn");
const deleteModal = document.getElementById("delete-modal");
const deleteYes = document.getElementById("delete-yes");
const deleteNo = document.getElementById("delete-no");

const storageKey = "sloanex-content";
let deleteTarget = null;

const defaultState = {
  banner: null,
  profile: null,
  images: [],
  videos: []
};

const state = loadState();

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return { ...defaultState };
  }
  try {
    return { ...defaultState, ...JSON.parse(saved) };
  } catch (error) {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function showSection(target) {
  sections.forEach((section) => {
    section.classList.toggle("active", section.id === target);
  });
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.target === target);
  });
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => showSection(btn.dataset.target));
});

termsScroll.addEventListener("scroll", () => {
  const reachedBottom =
    termsScroll.scrollTop + termsScroll.clientHeight >= termsScroll.scrollHeight;
  if (reachedBottom) {
    agreeBtn.disabled = false;
    ageBtn.disabled = false;
    termsActions.classList.remove("hidden");
  }
});

function handleTermsButton(button) {
  button.classList.add("clicked");
  button.dataset.clicked = "true";
  if (agreeBtn.dataset.clicked && ageBtn.dataset.clicked) {
    modal.classList.remove("active");
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }
}

agreeBtn.addEventListener("click", () => handleTermsButton(agreeBtn));
ageBtn.addEventListener("click", () => handleTermsButton(ageBtn));

signupBtn.addEventListener("click", () => {
  constructionBubble.classList.remove("hidden");
  constructionBubble.addEventListener(
    "click",
    () => {
      constructionBubble.classList.add("hidden");
    },
    { once: true }
  );
  document.addEventListener(
    "click",
    () => {
      constructionBubble.classList.add("hidden");
    },
    { once: true }
  );
});

function setActiveSubpage(target) {
  subpages.forEach((page) => {
    page.classList.toggle("active", page.id === target);
  });
  sidebarButtons.forEach((btn) => {
    const isActive = btn.dataset.subpage === target;
    btn.classList.toggle("active", isActive);
    btn.classList.toggle("clicked", isActive && btn.dataset.subpage === "exclusive-main");
  });
  if (target === "account" || target === "subscription") {
    sidebarBack.classList.remove("hidden");
  } else {
    sidebarBack.classList.add("hidden");
  }
}

sidebarButtons.forEach((btn) => {
  btn.addEventListener("click", () => setActiveSubpage(btn.dataset.subpage));
});

sidebarBack.addEventListener("click", (event) => {
  event.currentTarget.classList.add("clicked");
  setTimeout(() => {
    event.currentTarget.classList.remove("clicked");
    setActiveSubpage("exclusive-main");
  }, 150);
});

supportForm.addEventListener("input", () => {
  const formData = new FormData(supportForm);
  const description = formData.get("description") || "";
  const words = description
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length > 200) {
    const limited = words.slice(0, 200).join(" ");
    supportForm.description.value = limited;
  }
  wordCount.textContent = `${Math.min(words.length, 200)} / 200 words`;

  const allFilled =
    formData.get("name") &&
    formData.get("email") &&
    supportForm.description.value.trim();
  supportSubmit.disabled = !allFilled;
});

supportForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  supportSubmit.classList.add("clicked");
  supportStatus.textContent = "Sending...";

  const payload = {
    name: supportForm.name.value,
    email: supportForm.email.value,
    description: supportForm.description.value
  };

  try {
    const response = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Support request failed.");
    }

    supportStatus.textContent = "Support request sent.";
    supportForm.reset();
    supportSubmit.disabled = true;
    wordCount.textContent = "0 / 200 words";
  } catch (error) {
    supportStatus.textContent = "Unable to send request.";
  } finally {
    setTimeout(() => supportSubmit.classList.remove("clicked"), 200);
  }
});

function renderHero() {
  bannerSlot.innerHTML = state.banner
    ? `<img src="${state.banner}" alt="Banner" />`
    : "<span>Banner Image (16:9)</span>";
  profileSlot.innerHTML = state.profile
    ? `<img src="${state.profile}" alt="Profile" />`
    : "<span>Profile Picture</span>";
}

function renderGrids() {
  imagesGrid.innerHTML = "";
  videosGrid.innerHTML = "";

  state.images.forEach((item) => {
    const card = createMediaCard(item, "image", false);
    imagesGrid.appendChild(card);
  });

  state.videos.forEach((item) => {
    const card = createMediaCard(item, "video", false);
    videosGrid.appendChild(card);
  });
}

function renderAdmin() {
  adminMedia.innerHTML = "";
  const allItems = [
    ...(state.profile ? [{ id: "profile", src: state.profile, type: "image", label: "Profile" }] : []),
    ...(state.banner ? [{ id: "banner", src: state.banner, type: "image", label: "Banner" }] : []),
    ...state.images.map((item) => ({ ...item, type: "image", label: "Image" })),
    ...state.videos.map((item) => ({ ...item, type: "video", label: "Video" }))
  ];

  allItems.forEach((item) => {
    const card = createMediaCard(item, item.type, true);
    adminMedia.appendChild(card);
  });
}

function createMediaCard(item, type, isAdmin) {
  const card = document.createElement("div");
  card.className = "media-card";

  if (item.label) {
    const label = document.createElement("strong");
    label.textContent = item.label;
    label.style.color = "var(--pink)";
    card.appendChild(label);
  }

  if (type === "image") {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = "Uploaded";
    img.addEventListener("click", () => expandMedia(item, type));
    card.appendChild(img);
  } else {
    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    video.addEventListener("click", () => expandMedia(item, type));
    card.appendChild(video);
  }

  if (type === "video" && isAdmin) {
    const playBtn = document.createElement("button");
    playBtn.className = "primary-btn";
    playBtn.textContent = "Play";
    playBtn.addEventListener("click", () => {
      playBtn.classList.add("clicked");
      const video = card.querySelector("video");
      if (video) {
        video.play();
      }
    });
    card.appendChild(playBtn);
  }

  if (isAdmin) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "primary-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      deleteBtn.classList.add("clicked");
      deleteTarget = item;
      deleteModal.classList.remove("hidden");
      deleteYes.checked = false;
      deleteNo.checked = false;
    });
    card.appendChild(deleteBtn);
  }

  return card;
}

function expandMedia(item, type) {
  lightboxContent.innerHTML = "";
  if (type === "image") {
    const img = document.createElement("img");
    img.src = item.src;
    lightboxContent.appendChild(img);
  } else {
    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    video.autoplay = true;
    lightboxContent.appendChild(video);
  }
  lightbox.classList.remove("hidden");
}

collapseBtn.addEventListener("click", () => {
  collapseBtn.classList.add("clicked");
  lightbox.classList.add("hidden");
  setTimeout(() => collapseBtn.classList.remove("clicked"), 200);
});

function handleDelete(confirm) {
  deleteModal.classList.add("hidden");
  if (!deleteTarget) {
    return;
  }
  if (confirm) {
    if (deleteTarget.id === "profile") {
      state.profile = null;
    } else if (deleteTarget.id === "banner") {
      state.banner = null;
    } else if (deleteTarget.type === "image") {
      state.images = state.images.filter((item) => item.id !== deleteTarget.id);
    } else if (deleteTarget.type === "video") {
      state.videos = state.videos.filter((item) => item.id !== deleteTarget.id);
    }
    saveState();
    renderGrids();
    renderAdmin();
  }
  deleteTarget = null;
}

deleteYes.addEventListener("change", () => {
  deleteNo.checked = false;
  handleDelete(deleteYes.checked);
});
deleteNo.addEventListener("change", () => {
  deleteYes.checked = false;
  handleDelete(false);
});

function handleFileUpload(files, type, uploadCard) {
  if (!files.length) {
    return;
  }

  const progressBar = uploadCard.querySelector(".progress-bar");
  const progressLabel = uploadCard.querySelector(".progress-label");
  const timer = uploadCard.querySelector(".timer");

  let seconds = 0;
  progressBar.style.width = "0%";
  progressLabel.textContent = "0%";
  progressLabel.style.color = "inherit";
  timer.textContent = "0s";

  const timerId = setInterval(() => {
    seconds += 1;
    timer.textContent = `${seconds}s`;
  }, 1000);

  const total = files.length;
  let completed = 0;

  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const item = {
        id: `${Date.now()}-${Math.random()}`,
        src: reader.result,
        type
      };

      if (type === "profile") {
        state.profile = item.src;
      } else if (type === "banner") {
        state.banner = item.src;
      } else if (type === "images") {
        state.images.push(item);
      } else if (type === "videos") {
        state.videos.push(item);
      }

      completed += 1;
      const percent = Math.round((completed / total) * 100);
      progressBar.style.width = `${percent}%`;
      progressLabel.textContent = `${percent}%`;

      if (completed === total) {
        clearInterval(timerId);
        progressLabel.textContent = "Complete";
        progressLabel.style.color = "#20c66b";
        saveState();
        renderHero();
        renderGrids();
        renderAdmin();
      }
    };
    reader.readAsDataURL(file);
  });
}

function bindUploadCards() {
  const uploadCards = document.querySelectorAll(".upload-card");
  uploadCards.forEach((card) => {
    const input = card.querySelector("input");
    const type = card.dataset.upload;
    input.addEventListener("change", () => handleFileUpload(input.files, type, card));
    card.addEventListener("dragover", (event) => {
      event.preventDefault();
      card.style.borderColor = "var(--pink)";
    });
    card.addEventListener("dragleave", () => {
      card.style.borderColor = "var(--purple)";
    });
    card.addEventListener("drop", (event) => {
      event.preventDefault();
      card.style.borderColor = "var(--purple)";
      if (event.dataTransfer?.files?.length) {
        handleFileUpload(event.dataTransfer.files, type, card);
      }
    });
  });
}

async function validateAdmin(code) {
  const response = await fetch("/api/admin-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  });
  if (!response.ok) {
    return false;
  }
  const data = await response.json();
  return data?.ok;
}

adminSubmit.addEventListener("click", async () => {
  adminSubmit.classList.add("clicked");
  const code = adminCodeInput.value.trim();
  adminError.textContent = "";
  const ok = await validateAdmin(code);
  if (ok) {
    sessionStorage.setItem("adminUnlocked", "true");
    adminLock.classList.add("hidden");
    adminContent.classList.remove("hidden");
  } else {
    adminError.textContent = "Invalid code.";
  }
  setTimeout(() => adminSubmit.classList.remove("clicked"), 200);
});

function initAdmin() {
  if (sessionStorage.getItem("adminUnlocked") === "true") {
    adminLock.classList.add("hidden");
    adminContent.classList.remove("hidden");
  }
}

renderHero();
renderGrids();
renderAdmin();
initAdmin();
bindUploadCards();
