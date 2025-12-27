/* ===========================
   DOM Elements
   =========================== */
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const previewWrap = document.getElementById('previewWrap');
const removeImageBtn = document.getElementById('removeImage');
const imgPromptEl = document.getElementById('imgPrompt');
const imgGenBtn = document.getElementById('imgGenBtn');
const clearImgBtn = document.getElementById('clearImgBtn');
const imgResult = document.getElementById('imgResult');
const imgLoading = document.getElementById('imgLoading');
const imageInfo = document.getElementById('imageInfo');
const charCount = document.getElementById('charCount');

const promptEl = document.getElementById('prompt');
const genBtn = document.getElementById('genBtn');
const clearTxtBtn = document.getElementById('clearTxtBtn');
const txtResult = document.getElementById('txtResult');
const txtLoading = document.getElementById('txtLoading');
const textCharCount = document.getElementById('textCharCount');

const resultsList = document.getElementById('resultsList');
const clearAllResults = document.getElementById('clearAllResults');
const alertContainer = document.getElementById('alertContainer');
const themeToggle = document.getElementById('themeToggle');
const checkHealthBtn = document.getElementById('checkHealth');
const healthStatus = document.getElementById('healthStatus');

let currentFile = null;
let resultsCount = 0;

/* ===========================
   Utility Functions
   =========================== */

// Show alert message
function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show animate__animated animate__fadeInDown`;
  alert.innerHTML = `
    <i class="fas fa-${getIconForType(type)} me-2"></i>
    ${escapeHtml(message)}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.classList.add('animate__fadeOutUp');
    setTimeout(() => alert.remove(), 500);
  }, 5000);
}

function getIconForType(type) {
  const icons = {
    'success': 'check-circle',
    'danger': 'exclamation-circle',
    'warning': 'exclamation-triangle',
    'info': 'info-circle'
  };
  return icons[type] || 'info-circle';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Validate image file
function validateImage(file) {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp'];
  const maxSize = 16 * 1024 * 1024; // 16MB
  
  if (!validTypes.includes(file.type)) {
    showAlert('Invalid file type. Please upload PNG, JPEG, GIF, WebP, or BMP.', 'danger');
    return false;
  }
  
  if (file.size > maxSize) {
    showAlert('File too large. Maximum size is 16MB.', 'danger');
    return false;
  }
  
  return true;
}


/* ===========================
   Image Upload & Preview
   =========================== */
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!validateImage(file)) {
    imageInput.value = '';
    return;
  }
  
  currentFile = file;
  
  const reader = new FileReader();
  reader.onload = (ev) => {
    preview.src = ev.target.result;
    previewWrap.classList.remove('d-none');
    
    // Show image info
    const img = new Image();
    img.onload = () => {
      imageInfo.innerHTML = `
        <i class="fas fa-info-circle"></i> 
        ${img.width}x${img.height} • ${formatFileSize(file.size)}
      `;
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// Remove image
removeImageBtn.addEventListener('click', () => {
  clearImageUpload();
});

// Clear image upload
function clearImageUpload() {
  imageInput.value = '';
  preview.src = '';
  previewWrap.classList.add('d-none');
  imageInfo.innerHTML = '';
  currentFile = null;
}

// Clear all image inputs
clearImgBtn.addEventListener('click', () => {
  clearImageUpload();
  imgPromptEl.value = '';
  imgResult.innerHTML = '';
  charCount.textContent = '0';
  showAlert('Image upload cleared', 'info');
});

// Character counter for image prompt
imgPromptEl.addEventListener('input', (e) => {
  const length = e.target.value.length;
  charCount.textContent = length;
  
  if (length > 450) {
    charCount.classList.add('text-warning');
  } else {
    charCount.classList.remove('text-warning');
  }
});

/* ===========================
   Image + Prompt Generation
   =========================== */
imgGenBtn.addEventListener('click', async () => {
  if (!currentFile) {
    showAlert('Please choose an image first', 'warning');
    return;
  }

  const prompt = imgPromptEl.value.trim();
  if (!prompt) {
    showAlert('Please enter a prompt', 'warning');
    return;
  }

  if (prompt.length > 500) {
    showAlert('Prompt too long. Maximum 500 characters', 'danger');
    return;
  }

  // Disable button and show loading
  imgGenBtn.disabled = true;
  imgGenBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Generating...';
  imgLoading.classList.remove('d-none');
  imgResult.innerHTML = '';

  const formData = new FormData();
  formData.append('file', currentFile);
  formData.append('prompt', prompt);

  try {
    const response = await fetch('/api/infer_image', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();


    if (response.ok) {
      imgResult.innerHTML = renderImageResult(data);
      addResultCard('image', data, preview.src);
      showAlert('Text generated successfully!', 'success');
    } else {
      const errorMsg = data.error || 'Failed to generate text';
      imgResult.innerHTML = renderError(errorMsg);
      showAlert(errorMsg, 'danger');
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMsg = 'Network error. Please check your connection and try again.';
    imgResult.innerHTML = renderError(errorMsg);
    showAlert(errorMsg, 'danger');
  } finally {
    imgGenBtn.disabled = false;
    imgGenBtn.innerHTML = '<i class="fas fa-magic me-2"></i> Generate';
    imgLoading.classList.add('d-none');
  }
});

/* ===========================
   Text Generation
   =========================== */

// Character counter for text prompt
promptEl.addEventListener('input', (e) => {
  const length = e.target.value.length;
  textCharCount.textContent = length;
  
  if (length > 450) {
    textCharCount.classList.add('text-warning');
  } else {
    textCharCount.classList.remove('text-warning');
  }
});

// Generate text from prompt
genBtn.addEventListener('click', async () => {
  const prompt = promptEl.value.trim();
  
  if (!prompt) {
    showAlert('Please enter a prompt', 'warning');
    return;
  }

  if (prompt.length > 500) {
    showAlert('Prompt too long. Maximum 500 characters', 'danger');
    return;
  }

  genBtn.disabled = true;
  genBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Generating...';
  txtLoading.classList.remove('d-none');
  txtResult.innerHTML = '';

  try {
    const response = await fetch('/api/generate_text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (response.ok) {
      txtResult.innerHTML = renderTextResult(data);
      addResultCard('text', data);
      showAlert('Text generated successfully!', 'success');
    } else {
      const errorMsg = data.error || 'Failed to generate text';
      txtResult.innerHTML = renderError(errorMsg);
      showAlert(errorMsg, 'danger');
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMsg = 'Network error. Please check your connection and try again.';
    txtResult.innerHTML = renderError(errorMsg);
    showAlert(errorMsg, 'danger');
  } finally {
    genBtn.disabled = false;
    genBtn.innerHTML = '<i class="fas fa-lightbulb me-2"></i> Generate';
    txtLoading.classList.add('d-none');
  }
});

// Clear text generation
clearTxtBtn.addEventListener('click', () => {
  promptEl.value = '';
  txtResult.innerHTML = '';
  textCharCount.textContent = '0';
  showAlert('Text prompt cleared', 'info');
});


/* ===========================
   Render Functions
   =========================== */

function renderImageResult(data) {
  return `
    <div class="p-3 result-card fade-in">
      <div class="mb-2">
        <strong class="text-primary"><i class="fas fa-quote-left me-1"></i> Prompt:</strong>
        <p class="text-muted small mb-0 ms-3">${escapeHtml(data.prompt)}</p>
      </div>
      <div>
        <strong class="text-success"><i class="fas fa-magic me-1"></i> Generated:</strong>
        <p class="text-secondary mb-0 ms-3">${escapeHtml(data.generated)}</p>
      </div>
    </div>
  `;
}

function renderTextResult(data) {
  return `
    <div class="p-3 result-card fade-in">
      <div class="mb-2">
        <strong class="text-primary"><i class="fas fa-quote-left me-1"></i> Prompt:</strong>
        <p class="text-muted small mb-0 ms-3">${escapeHtml(data.prompt)}</p>
      </div>
      <div>
        <strong class="text-success"><i class="fas fa-lightbulb me-1"></i> Generated:</strong>
        <p class="text-secondary mb-0 ms-3">${escapeHtml(data.generated)}</p>
      </div>
    </div>
  `;
}

function renderError(message) {
  return `
    <div class="alert alert-danger fade-in">
      <i class="fas fa-exclamation-circle me-2"></i>
      <strong>Error:</strong> ${escapeHtml(message)}
    </div>
  `;
}

/* ===========================
   Results Management
   =========================== */

function addResultCard(type, data, imageSrc = null) {
  const card = document.createElement('div');
  card.className = 'result-card animate__animated animate__fadeInUp';
  
  const timestamp = new Date().toLocaleString();
  const resultId = ++resultsCount;
  
  card.innerHTML = `
    <div class="result-header">
      <div class="d-flex align-items-center gap-2">
        <span class="badge ${type === 'image' ? 'bg-primary' : 'bg-success'}">
          <i class="fas fa-${type === 'image' ? 'image' : 'keyboard'} me-1"></i>
          ${type === 'image' ? 'Image' : 'Text'}
        </span>
        <small class="text-muted">#${resultId}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <small class="text-muted">
          <i class="fas fa-clock me-1"></i>${timestamp}
        </small>
        <button class="btn btn-sm btn-outline-danger delete-result">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    ${imageSrc ? `
      <div class="mb-2">
        <img src="${imageSrc}" alt="Generated from" class="img-fluid rounded" style="max-height: 150px; object-fit: cover;">
      </div>
    ` : ''}
    
    <div class="result-content">
      <div class="result-prompt">
        <i class="fas fa-quote-left me-1"></i>
        <strong>Prompt:</strong> ${escapeHtml(data.prompt)}
      </div>
      <div class="result-generated">
        <i class="fas fa-magic me-1"></i>
        <strong>Generated:</strong> ${escapeHtml(data.generated)}
      </div>
    </div>
  `;
  
  // Add delete functionality
  const deleteBtn = card.querySelector('.delete-result');
  deleteBtn.addEventListener('click', () => {
    card.classList.add('animate__fadeOutRight');
    setTimeout(() => {
      card.remove();
      checkResultsEmpty();
    }, 500);
  });
  
  // Remove empty state if exists
  const empty = resultsList.querySelector('.empty');
  if (empty) {
    empty.remove();
    clearAllResults.classList.remove('d-none');
  }
  
  resultsList.insertBefore(card, resultsList.firstChild);
}


function checkResultsEmpty() {
  const cards = resultsList.querySelectorAll('.result-card');
  if (cards.length === 0) {
    resultsList.innerHTML = `
      <div class="empty text-center text-muted py-5">
        <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
        <p class="lead">No results yet</p>
        <p class="small">Upload an image or enter a prompt to get started</p>
      </div>
    `;
    clearAllResults.classList.add('d-none');
  }
}

// Clear all results
clearAllResults.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all results?')) {
    resultsList.innerHTML = `
      <div class="empty text-center text-muted py-5">
        <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
        <p class="lead">No results yet</p>
        <p class="small">Upload an image or enter a prompt to get started</p>
      </div>
    `;
    clearAllResults.classList.add('d-none');
    resultsCount = 0;
    showAlert('All results cleared', 'info');
  }
});

/* ===========================
   Theme Toggle
   =========================== */
themeToggle.addEventListener('click', () => {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update icon
  const icon = themeToggle.querySelector('i');
  if (newTheme === 'light') {
    icon.className = 'fas fa-sun';
  } else {
    icon.className = 'fas fa-moon';
  }
  
  showAlert(`Switched to ${newTheme} theme`, 'info');
});

// Load saved theme
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  
  const icon = themeToggle.querySelector('i');
  if (savedTheme === 'light') {
    icon.className = 'fas fa-sun';
  }
});

/* ===========================
   Health Check
   =========================== */
checkHealthBtn.addEventListener('click', async () => {
  checkHealthBtn.disabled = true;
  checkHealthBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
  healthStatus.innerHTML = '';
  
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    
    if (response.ok) {
      const statusClass = data.model_loaded ? 'success' : 'danger';
      const statusIcon = data.model_loaded ? 'check-circle' : 'times-circle';
      
      healthStatus.innerHTML = `
        <div class="alert alert-${statusClass} small mt-2 mb-0">
          <i class="fas fa-${statusIcon} me-2"></i>
          <strong>Status:</strong> ${data.status}<br>
          <strong>Model:</strong> ${data.model_loaded ? 'Loaded ✓' : 'Not Loaded ✗'}<br>
          <strong>Device:</strong> ${data.device}<br>
          <strong>Dtype:</strong> ${data.dtype}
        </div>
      `;
      showAlert(`System is ${data.model_loaded ? 'ready' : 'not ready'}`, statusClass);
    } else {
      healthStatus.innerHTML = renderError('Failed to check health status');
    }
  } catch (error) {
    console.error('Health check error:', error);
    healthStatus.innerHTML = renderError('Cannot connect to server');
    showAlert('Cannot connect to server', 'danger');
  } finally {
    checkHealthBtn.disabled = false;
    checkHealthBtn.innerHTML = '<i class="fas fa-heartbeat"></i> Check Status';
  }
});


/* ===========================
   Keyboard Shortcuts
   =========================== */
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to generate
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    
    if (document.activeElement === imgPromptEl && currentFile) {
      imgGenBtn.click();
    } else if (document.activeElement === promptEl) {
      genBtn.click();
    }
  }
  
  // Escape to clear
  if (e.key === 'Escape') {
    if (document.activeElement === imgPromptEl) {
      clearImgBtn.click();
    } else if (document.activeElement === promptEl) {
      clearTxtBtn.click();
    }
  }
});

/* ===========================
   Drag and Drop Support
   =========================== */
const dropZone = document.querySelector('.card.glass');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = 'var(--accent-primary)';
  dropZone.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = '';
  dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = '';
  dropZone.style.backgroundColor = '';
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (validateImage(file)) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      imageInput.files = dataTransfer.files;
      imageInput.dispatchEvent(new Event('change'));
      showAlert('Image uploaded via drag & drop', 'success');
    }
  }
});

/* ===========================
   Auto-save to localStorage
   =========================== */
function saveState() {
  const state = {
    imgPrompt: imgPromptEl.value,
    textPrompt: promptEl.value
  };
  localStorage.setItem('appState', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('appState');
  if (saved) {
    try {
      const state = JSON.parse(saved);
      if (state.imgPrompt) {
        imgPromptEl.value = state.imgPrompt;
        charCount.textContent = state.imgPrompt.length;
      }
      if (state.textPrompt) {
        promptEl.value = state.textPrompt;
        textCharCount.textContent = state.textPrompt.length;
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  }
}

// Save state on input
imgPromptEl.addEventListener('input', saveState);
promptEl.addEventListener('input', saveState);

// Load state on page load
window.addEventListener('load', loadState);

/* ===========================
   Initialize
   =========================== */
console.log('BLIP-2 Image to Text Generator initialized');
showAlert('Welcome! Upload an image to get started', 'info');
