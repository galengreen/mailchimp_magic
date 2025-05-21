// Mouse Trail Effect using Canvas
let mouseTrailCleanup = null;
let isMouseTrailEnabled = true;
let animationFrameId = null;
let canvas = null;

function initMouseTrail() {
  if (!isMouseTrailEnabled) return null;

  // Create canvas element
  canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "2147483647";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let particles = [];
  let mouse = { x: 0, y: 0 };
  let lastMouse = { x: 0, y: 0 };

  // Handle window resize
  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Base Particle class
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.life = 1;
      this.decay = 0.02;
    }

    update() {
      this.life -= this.decay;
    }
  }

  // Orb Particle class
  class OrbParticle extends Particle {
    constructor(x, y) {
      super(x, y);
      this.size = Math.random() * 4 + 5;
      this.speedX = (Math.random() - 0.5) * 2;
      this.speedY = (Math.random() - 0.5) * 2;
      this.decay = 0.015;
    }

    update() {
      super.update();
      this.x += this.speedX;
      this.y += this.speedY;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.size * 3
      );
      const isDark =
        document.documentElement.getAttribute("data-bs-theme") === "dark";
      const color = isDark ? "46, 204, 113" : "46, 204, 113"; // Keep green for both themes
      gradient.addColorStop(0, `rgba(${color}, ${this.life * 0.4})`);
      gradient.addColorStop(0.5, `rgba(${color}, ${this.life * 0.2})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  // Star Particle class
  class StarParticle extends Particle {
    constructor(x, y) {
      super(x, y);
      this.size = Math.random() * 4 + 3;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.3;
      this.speedX = (Math.random() - 0.5) * 4;
      this.speedY = (Math.random() - 0.5) * 4;
      this.decay = 0.03;
      this.points = 5;
      this.innerRadius = this.size * 0.4;
      this.outerRadius = this.size;
    }

    update() {
      super.update();
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      // Draw star
      ctx.beginPath();
      for (let i = 0; i < this.points * 2; i++) {
        const radius = i % 2 === 0 ? this.outerRadius : this.innerRadius;
        const angle = (i * Math.PI) / this.points - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Create gradient for star
      const isDark =
        document.documentElement.getAttribute("data-bs-theme") === "dark";
      const color = isDark ? "255, 255, 255" : "46, 204, 113"; // White for dark theme, green for light theme
      const gradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        this.outerRadius * 2
      );
      gradient.addColorStop(0, `rgba(${color}, ${this.life * 0.9})`);
      gradient.addColorStop(0.5, `rgba(${color}, ${this.life * 0.5})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fill();

      // Add sparkle effect
      ctx.beginPath();
      ctx.arc(0, 0, this.outerRadius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${this.life * 0.8})`;
      ctx.fill();

      ctx.restore();
    }
  }

  // Track mouse movement
  document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Add theme change listener
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "data-bs-theme") {
        // Clear existing particles when theme changes
        particles = [];
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-bs-theme"],
  });

  // Start animation
  function animate() {
    if (!isMouseTrailEnabled) {
      cleanup();
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();

      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Create new particles based on mouse movement
    const dx = mouse.x - lastMouse.x;
    const dy = mouse.y - lastMouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 3) {
      const particleCount = Math.min(Math.floor(distance / 4), 3);
      for (let i = 0; i < particleCount; i++) {
        const offsetX = Math.random() * 16 - 8;
        const offsetY = Math.random() * 16 - 8;
        particles.push(new OrbParticle(mouse.x + offsetX, mouse.y + offsetY));
        if (Math.random() < 0.4) {
          particles.push(
            new StarParticle(mouse.x + offsetX, mouse.y + offsetY)
          );
        }
      }
    }

    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;

    animationFrameId = requestAnimationFrame(animate);
  }

  // Start the animation
  animate();

  // Cleanup function
  function cleanup() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
      canvas = null;
    }
    particles = [];
  }

  return cleanup;
}

// --- Utility: Open HTML in New Tab ---
function openHtmlInNewTab(html, title = "Preview") {
  const blob = new Blob(
    [
      `<!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <title>${title}</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    background-color: white;
                }
            </style>
        </head>
        <body>${html}</body>
        </html>`,
    ],
    { type: "text/html" }
  );
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// --- Demo Mode Function ---
let savedInput = null;
let isDemoMode = false;

async function loadDemoHtml() {
  try {
    const inputHtml = document.getElementById("inputHtml");
    const demoButton = document.querySelector(
      'button[onclick="loadDemoHtml()"]'
    );

    if (!isDemoMode) {
      // Save current input if it's not empty
      if (inputHtml.value.trim()) {
        savedInput = inputHtml.value;
      }

      // Load demo HTML
      const response = await fetch("./assets/demo.html");
      if (!response.ok) {
        throw new Error("Failed to load demo HTML");
      }
      const demoHtml = await response.text();
      inputHtml.value = demoHtml;
      updatePreview("inputPreview", demoHtml);
      processHtml();
      isDemoMode = true;
      // Update button text
      demoButton.innerHTML = '<i class="fas fa-undo"></i> Revert';
    } else {
      // Restore previous input or clear if none was saved
      inputHtml.value = savedInput || "";
      updatePreview("inputPreview", inputHtml.value);
      processHtml();
      isDemoMode = false;
      // Update button text
      demoButton.innerHTML = '<i class="fas fa-play"></i> Demo Mode';
    }
  } catch (error) {
    console.error("Error loading demo HTML:", error);
    alert("Failed to load demo HTML. Please try again later.");
  }
}

// --- Event Listeners for UI ---
document.addEventListener("DOMContentLoaded", function () {
  // Mouse effects toggle functionality
  const mouseEffectsToggle = document.getElementById("mouseEffectsToggle");
  const mouseEffectsIcon = mouseEffectsToggle.querySelector("i");

  // Check for saved mouse effects preference, default to enabled if not set
  isMouseTrailEnabled = localStorage.getItem("mouseEffects") !== "disabled";
  if (isMouseTrailEnabled) {
    mouseTrailCleanup = initMouseTrail();
    mouseEffectsIcon.classList.replace("fa-magic", "fa-magic-wand-sparkles");
  } else {
    mouseEffectsIcon.classList.replace("fa-magic-wand-sparkles", "fa-magic");
  }

  mouseEffectsToggle.addEventListener("click", function () {
    isMouseTrailEnabled = !isMouseTrailEnabled;

    if (isMouseTrailEnabled) {
      // Enable effects
      mouseTrailCleanup = initMouseTrail();
      mouseEffectsIcon.classList.replace("fa-magic", "fa-magic-wand-sparkles");
      localStorage.setItem("mouseEffects", "enabled");
    } else {
      // Disable effects
      if (mouseTrailCleanup) {
        mouseTrailCleanup();
        mouseTrailCleanup = null;
      }
      mouseEffectsIcon.classList.replace("fa-magic-wand-sparkles", "fa-magic");
      localStorage.setItem("mouseEffects", "disabled");
    }
  });

  // Theme toggle functionality
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector("i");

  // Function to update theme
  function updateTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    themeIcon.classList.replace(
      theme === "dark" ? "fa-sun" : "fa-moon",
      theme === "dark" ? "fa-moon" : "fa-sun"
    );
    localStorage.setItem("theme", theme);

    // Update preview frames background
    const previewFrames = document.querySelectorAll(".preview-frame");
    previewFrames.forEach((frame) => {
      const frameDoc = frame.contentDocument || frame.contentWindow.document;
      if (frameDoc.body) {
        frameDoc.body.style.backgroundColor =
          theme === "dark" ? "#1a1a1a" : "#ffffff";
      }
    });

    // Re-highlight code after theme change
    const outputHtml = document.getElementById("outputHtml");
    if (outputHtml) {
      Prism.highlightElement(outputHtml);
    }
  }

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme") || "dark";
  updateTheme(savedTheme);

  themeToggle.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    updateTheme(newTheme);
  });

  // Input/Output live preview and cleaning
  const inputHtml = document.getElementById("inputHtml");
  let debounceTimer;
  inputHtml.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updatePreview("inputPreview", this.value);
      processHtml();
    }, 500);
  });
  // Toggle switches
  document
    .querySelectorAll('.toggle-switch input[type="checkbox"]')
    .forEach((toggle) => {
      toggle.addEventListener("change", processHtml);
    });
  // Collapse icon
  const cleaningOptions = document.getElementById("cleaningOptions");
  cleaningOptions.addEventListener("hide.bs.collapse", function () {
    document.querySelector(".toggle-icon").classList.add("collapsed");
  });
  cleaningOptions.addEventListener("show.bs.collapse", function () {
    document.querySelector(".toggle-icon").classList.remove("collapsed");
  });
  // File upload
  const fileUpload = document.getElementById("fileUpload");
  fileUpload.addEventListener("change", handleFileUpload);

  // Open previews in new tab
  document
    .getElementById("openInputPreview")
    .addEventListener("click", function () {
      openHtmlInNewTab(
        document.getElementById("inputHtml").value,
        "Input Preview"
      );
    });
  document
    .getElementById("openOutputPreview")
    .addEventListener("click", function () {
      const outputHtml = document.getElementById("outputHtml");
      if (outputHtml && outputHtml.textContent) {
        openHtmlInNewTab(outputHtml.textContent, "Output Preview");
      } else {
        alert("No output content to preview!");
      }
    });
});

// --- Cleaning Option State ---
function getOptions() {
  return {
    remove_footer: !document.getElementById("keepFooter").checked,
    remove_social: !document.getElementById("keepSocial").checked,
    remove_legacy_footer: !document.getElementById("keepLegacyFooter").checked,
    standardize_dark_gray_bg:
      !document.getElementById("keepDarkGrayBg").checked,
    remove_header_banner: !document.getElementById("keepHeaderBanner").checked,
    remove_subscribe: !document.getElementById("keepSubscribe").checked,
  };
}

// --- Cleaning Actions Mapping ---
const cleaningActions = {
  remove_footer: (doc) => {
    const footer = doc.querySelector('tbody[data-block-id="17"]');
    if (footer) footer.remove();
  },
  remove_social: (doc) => {
    const socialTable = doc.querySelector("table.mceSocialFollowBlock");
    if (socialTable) {
      const socialTr = socialTable.closest("tr");
      if (socialTr) socialTr.remove();
    }
  },
  remove_legacy_footer: (doc) => {
    const footerTd = doc.querySelector("td#templateFooter");
    if (footerTd) {
      const footerTr = footerTd.closest("tr");
      if (footerTr) footerTr.remove();
    }
  },
  standardize_dark_gray_bg: (doc) => {
    // Standardize all dark gray backgrounds (rgb(37,37,37) and similar)
    doc.querySelectorAll('[style*="background-color"]').forEach((el) => {
      const bg = el.style.backgroundColor.trim().toLowerCase();
      const rgbMatch = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (rgbMatch) {
        const [r, g, b] = rgbMatch.slice(1).map(Number);
        if (r <= 60 && g <= 60 && b <= 60) {
          el.style.backgroundColor = "white";
        }
      }
    });
  },
  remove_header_banner: (doc) => {
    // Remove any large image at the top (likely a banner)
    const images = Array.from(doc.querySelectorAll("img"));
    for (const img of images) {
      // Remove if width >= 600 or parent is a header/banner
      if (
        (img.width && img.width >= 600) ||
        (img.naturalWidth && img.naturalWidth >= 600) ||
        img.closest('[class*="header" i], [class*="banner" i]')
      ) {
        const parentRow = img.closest("tr") || img.closest("td") || img;
        parentRow.remove();
        break;
      }
    }
    // Also try to remove a table row with a banner-like class
    const bannerRow = doc.querySelector(
      'tr[class*="header" i], tr[class*="banner" i]'
    );
    if (bannerRow) bannerRow.remove();
  },
  remove_subscribe: (doc) => {
    // Remove subscribe button sections (Mailchimp: class 'mceButtonLink' with href containing 'SUBSCRIBE')
    doc
      .querySelectorAll(
        'a.mceButtonLink[href*="SUBSCRIBE"], a[href*="SUBSCRIBE"]'
      )
      .forEach((a) => {
        const btnRow =
          a.closest("tr") || a.closest("table") || a.closest("div") || a;
        btnRow.remove();
      });
    // Also remove any block with data-block-id or id containing 'subscribe'
    doc
      .querySelectorAll('[data-block-id*="subscribe" i], [id*="subscribe" i]')
      .forEach((el) => {
        el.remove();
      });
  },
};

// --- HTML Cleaning Pipeline ---
function modifyHtml(html, options) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  Object.entries(options).forEach(([key, enabled]) => {
    if (enabled && cleaningActions[key]) {
      cleaningActions[key](doc);
    }
  });
  // Check if there's a DOCTYPE and include it in the output
  const doctype = doc.doctype;
  const doctypeString = doctype
    ? new XMLSerializer().serializeToString(doctype)
    : "";
  return doctypeString + doc.documentElement.outerHTML;
}

// --- Preview and File Handling ---
function updatePreview(frameId, content) {
  const frame = document.getElementById(frameId);
  const frameDoc = frame.contentDocument || frame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        html, body { 
          margin: 0; 
          padding: 0; 
          width: 100%;
          height: 100%;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
        body { 
          background-color: white; 
          transform: scale(0.8);
          transform-origin: top left;
        }
        .preview-content {
          width: 125%;
          min-height: 100%;
          padding: 0;
          margin: 0;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .preview-content::-webkit-scrollbar {
          display: none;
        }
      </style>
    </head>
    <body class="preview-frame-content">
      <div class="preview-content">
        ${content}
      </div>
    </body>
    </html>
  `);
  frameDoc.close();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    document.getElementById("inputHtml").value = content;
    updatePreview("inputPreview", content);
    processHtml();
  };
  reader.readAsText(file);
}

// --- Main Cleaning Trigger ---
function processHtml() {
  const inputHtml = document.getElementById("inputHtml").value;
  const options = getOptions();
  try {
    // If input is empty or only contains whitespace, return empty string
    if (!inputHtml || !inputHtml.trim()) {
      const outputHtml = document.getElementById("outputHtml");
      outputHtml.textContent = "";
      updatePreview("outputPreview", "");
      return;
    }

    const modifiedHtml = modifyHtml(inputHtml, options);
    const outputHtml = document.getElementById("outputHtml");
    outputHtml.textContent = modifiedHtml;

    // Syntax highlighting for the output html
    Prism.highlightElement(outputHtml);
    updatePreview("outputPreview", modifiedHtml);
  } catch (error) {
    console.error("Error:", error);
    alert(
      "An error occurred while processing the HTML.\n" +
        (error.message || error)
    );
  }
}

// --- Output Copy/Download ---
function copyOutput() {
  const outputText = document.getElementById("outputHtml");

  // Temporarily create a textarea of the output text to copy it
  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = outputText.textContent;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextarea);

  const button = document.querySelector(".btn-primary");
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check"></i> Copied!';
  setTimeout(() => {
    button.innerHTML = originalText;
  }, 2000);
}

function downloadOutput() {
  const outputText = document.getElementById("outputHtml").textContent;
  if (!outputText) {
    alert("No content to download!");
    return;
  }
  const blob = new Blob([outputText], { type: "text/html" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cleaned_mailchimp.html";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
