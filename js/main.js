// Mouse Trail Effect using Canvas
document.addEventListener('DOMContentLoaded', function() {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '2147483647';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let particles = [];
    let mouse = { x: 0, y: 0 };
    let lastMouse = { x: 0, y: 0 };

    // Handle window resize
    window.addEventListener('resize', () => {
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
                this.x, this.y, 0,
                this.x, this.y, this.size * 3
            );
            gradient.addColorStop(0, `rgba(46, 204, 113, ${this.life * 0.4})`);
            gradient.addColorStop(0.5, `rgba(46, 204, 113, ${this.life * 0.2})`);
            gradient.addColorStop(1, `rgba(46, 204, 113, 0)`);
            
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
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.outerRadius * 2);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.life * 0.9})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.life * 0.5})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.fill();

            // Add sparkle effect
            ctx.beginPath();
            ctx.arc(0, 0, this.outerRadius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.life * 0.8})`;
            ctx.fill();
            
            ctx.restore();
        }
    }

    // Animation loop
    function animate() {
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
                // Create both orb and star particles
                particles.push(new OrbParticle(mouse.x + offsetX, mouse.y + offsetY));
                if (Math.random() < 0.4) { // 40% chance to create a star
                    particles.push(new StarParticle(mouse.x + offsetX, mouse.y + offsetY));
                }
            }
        }

        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;

        requestAnimationFrame(animate);
    }

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Start animation
    animate();
});

function copyOutput() {
  const outputText = document.getElementById('outputHtml');
  outputText.select();
  document.execCommand('copy');
  
  // Show feedback
  const button = document.querySelector('.btn-primary');
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check"></i> Copied!';
  setTimeout(() => {
    button.innerHTML = originalText;
  }, 2000);
}

function downloadOutput() {
  const outputText = document.getElementById('outputHtml').value;
  if (!outputText) {
    alert('No content to download!');
    return;
  }

  const blob = new Blob([outputText], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cleaned_mailchimp.html';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    document.getElementById('inputHtml').value = content;
    updatePreview('inputPreview', content);
    processHtml();
  };
  reader.readAsText(file);
}

function updatePreview(frameId, content) {
  const frame = document.getElementById(frameId);
  const frameDoc = frame.contentDocument || frame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          background-color: white;
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body class="preview-frame-content">
      ${content}
    </body>
    </html>
  `);
  frameDoc.close();
}

function getOptions() {
  return {
    remove_footer: document.getElementById('removeFooter').checked,
    remove_social: document.getElementById('removeSocial').checked,
    standardize_bg: document.getElementById('standardizeBg').checked,
    remove_legacy_footer: document.getElementById('removeLegacyFooter').checked
  };
}

function modifyHtml(html, options) {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  if (options.remove_footer) {
    // Remove footer (tbody with data-block-id="17")
    const footer = doc.querySelector('tbody[data-block-id="17"]');
    if (footer) {
      footer.remove();
    }
  }

  if (options.remove_social) {
    // Remove LinkedIn section
    const socialTable = doc.querySelector('table.mceSocialFollowBlock');
    if (socialTable) {
      const socialTr = socialTable.closest('tr');
      if (socialTr) {
        socialTr.remove();
      }
    }
  }

  if (options.standardize_bg) {
    // Find all elements that have background-color:#252525 in their style attribute
    const elements = doc.querySelectorAll('[style*="background-color:#252525"]');
    elements.forEach(element => {
      element.style.backgroundColor = 'white';
    });

    // Set background color for the main container
    const mainContainer = doc.querySelector('table.mcnTextBlock');
    if (mainContainer) {
      mainContainer.style.backgroundColor = 'white';
    }

    // Set background color for the body
    const body = doc.body;
    if (body) {
      body.style.backgroundColor = 'white';
    }

    // Set background color for the main table
    const mainTable = doc.querySelector('table.mcnTextBlockInner');
    if (mainTable) {
      mainTable.style.backgroundColor = 'white';
    }
  }

  if (options.remove_legacy_footer) {
    // Remove legacy Mailchimp footer
    const footerTd = doc.querySelector('td#templateFooter');
    if (footerTd) {
      const footerTr = footerTd.closest('tr');
      if (footerTr) {
        footerTr.remove();
      }
    }
  }

  return doc.documentElement.outerHTML;
}

function processHtml() {
  const inputHtml = document.getElementById('inputHtml').value;
  const options = getOptions();
  
  try {
    const modifiedHtml = modifyHtml(inputHtml, options);
    document.getElementById('outputHtml').value = modifiedHtml;
    updatePreview('outputPreview', modifiedHtml);
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while processing the HTML');
  }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
  const inputHtml = document.getElementById('inputHtml');
  let debounceTimer;
  
  // Add input event listener
  inputHtml.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updatePreview('inputPreview', this.value);
      processHtml();
    }, 500);
  });

  // Add change event listeners to all toggle switches
  const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', processHtml);
  });

  // Add collapse event listener
  const cleaningOptions = document.getElementById('cleaningOptions');
  cleaningOptions.addEventListener('hide.bs.collapse', function () {
    document.querySelector('.toggle-icon').classList.add('collapsed');
  });
  cleaningOptions.addEventListener('show.bs.collapse', function () {
    document.querySelector('.toggle-icon').classList.remove('collapsed');
  });

  // Add file upload listener
  const fileUpload = document.getElementById('fileUpload');
  fileUpload.addEventListener('change', handleFileUpload);
}); 