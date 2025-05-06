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