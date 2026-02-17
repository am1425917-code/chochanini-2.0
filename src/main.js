import './style.css'

// State
const state = {
  currentView: 'home', // 'home' | 'album'
  chochas: [
    {
      id: 1,
      name: 'Espíritu del Bosque',
      age: 850,
      nationality: '🇨🇴',
      countryCode: 'COL',
      acqDate: '2023-01-15',
      isVigente: true,
      depDate: '',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2164&auto=format&fit=crop',
      desc: 'Guardián místico de los bosques antiguos.',
      skills: { mamando: 5, brincando: 4, movimiento: 5 },
      averageRating: 4.7
    },
    {
      id: 2,
      name: 'Isabella García',
      age: 28,
      nationality: '🇲🇽',
      countryCode: 'MEX',
      acqDate: '2022-05-10',
      isVigente: false,
      depDate: '2024-05-10',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
      desc: 'Exploradora intrépida.',
      skills: { mamando: 4, brincando: 3, movimiento: 4 },
      averageRating: 3.7
    },
    {
      id: 3,
      name: 'Sofía Martínez',
      age: 24,
      nationality: '🇪🇸',
      countryCode: 'ESP',
      acqDate: '2023-08-20',
      depDate: '2024-02-20',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60',
      desc: 'Reina del arte y el color.',
      skills: { mamando: 5, brincando: 5, movimiento: 5 },
      averageRating: 5.0
    }
  ],
  tempSkills: { mamando: 0, brincando: 0, movimiento: 0 }
};

// Flags Data
const flags = [
  { name: 'Argentina', emoji: '🇦🇷', code: 'ARG' },
  { name: 'Bolivia', emoji: '🇧🇴', code: 'BOL' },
  { name: 'Brasil', emoji: '🇧🇷', code: 'BRA' },
  { name: 'Chile', emoji: '🇨🇱', code: 'CHL' },
  { name: 'Colombia', emoji: '🇨🇴', code: 'COL' },
  { name: 'Costa Rica', emoji: '🇨🇷', code: 'CRI' },
  { name: 'Cuba', emoji: '🇨🇺', code: 'CUB' },
  { name: 'Ecuador', emoji: '🇪🇨', code: 'ECU' },
  { name: 'El Salvador', emoji: '🇸🇻', code: 'SLV' },
  { name: 'España', emoji: '🇪🇸', code: 'ESP' },
  { name: 'EE.UU.', emoji: '🇺🇸', code: 'USA' },
  { name: 'Guatemala', emoji: '🇬🇹', code: 'GTM' },
  { name: 'Honduras', emoji: '🇭🇳', code: 'HND' },
  { name: 'México', emoji: '🇲🇽', code: 'MEX' },
  { name: 'Nicaragua', emoji: '🇳🇮', code: 'NIC' },
  { name: 'Panamá', emoji: '🇵🇦', code: 'PAN' },
  { name: 'Paraguay', emoji: '🇵🇾', code: 'PRY' },
  { name: 'Perú', emoji: '🇵🇪', code: 'PER' },
  { name: 'Puerto Rico', emoji: '🇵🇷', code: 'PRI' },
  { name: 'Rep. Dominicana', emoji: '🇩🇴', code: 'DOM' },
  { name: 'Uruguay', emoji: '🇺🇾', code: 'URY' },
  { name: 'Venezuela', emoji: '🇻🇪', code: 'VEN' }
];

// DOM Elements
const views = {
  home: document.getElementById('home-view'),
  album: document.getElementById('album-view')
};
const albumGrid = document.getElementById('albumGrid');
const modal = document.getElementById('add-chocha-modal');
const detailModal = document.getElementById('detail-modal');
const detailBody = document.getElementById('detail-body');
const photoPreview = document.getElementById('photoPreview');
const chochaPhotoInput = document.getElementById('chochaPhoto');
const nationalitySelect = document.getElementById('chochaNationality');

// --- Initialization ---
function init() {
  setupNavigation();
  setupModal();
  populateNationalities();
  renderAlbum();
}

// --- Navigation Logic ---
function setupNavigation() {
  document.getElementById('btn-my-album').addEventListener('click', () => switchView('album'));
  document.getElementById('btn-back-home').addEventListener('click', () => switchView('home'));
}

function switchView(viewName) {
  // Hide all views
  Object.values(views).forEach(el => {
    el.classList.remove('active-view');
    el.classList.add('hidden-view'); // Ensure hidden class handles display:none
    setTimeout(() => {
      if (!el.classList.contains('active-view')) el.style.display = 'none';
    }, 500); // Wait for fade out if we had one, but CSS handles it simpler
  });

  // Show target view
  const target = views[viewName];
  target.style.display = 'flex'; // Force display flex before adding active class for animation
  // Small delay to allow display change to register before opacity transition
  setTimeout(() => {
    target.classList.remove('hidden-view');
    target.classList.add('active-view');
  }, 10);

  state.currentView = viewName;
}

// --- Rendering ---
function renderAlbum() {
  albumGrid.innerHTML = '';
  // Sort by rating descending
  const sortedChochas = [...state.chochas].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));

  sortedChochas.forEach(chocha => {
    const card = document.createElement('div');
    card.className = 'panini-sticker';
    card.innerHTML = `
      <div class="sticker-rating-badge">
        <div class="rating-label">CALIDAD DE PERSONAJE</div>
        <div class="rating-value">${chocha.averageRating ? chocha.averageRating.toFixed(1) : '0.0'} <span>★</span></div>
      </div>
      <div class="sticker-top">
        <span class="sticker-flag">${chocha.nationality}</span>
        <span class="sticker-country-code">${chocha.countryCode || 'INT'}</span>
      </div>
      <div class="sticker-image-wrapper">
        <img src="${chocha.image}" alt="${chocha.name}" class="sticker-image">
      </div>
        <div class="sticker-info">
          <h3 class="sticker-name">${chocha.name}</h3>
          <div class="sticker-details">
            <span>EDAD: <strong>${chocha.age || '?'}</strong></span>
            <div class="sticker-dates">
               <span>IN: ${formatDate(chocha.acqDate)}</span>
               ${chocha.isVigente
        ? `<span class="sticker-status-badge">VIGENTE</span>`
        : `<span>OUT: ${formatDate(chocha.depDate)}</span>`
      }
            </div>
          </div>
        </div>
      `;
    card.addEventListener('click', () => openDetailModal(chocha));
    albumGrid.appendChild(card);
  });
}

function openDetailModal(chocha) {
  detailBody.innerHTML = `
      <div class="detail-header">
        <span style="font-size: 3rem;">${chocha.nationality}</span>
        <div class="sticker-rating-badge" style="position: static; transform: none;">
          ${chocha.averageRating.toFixed(1)} <span>★</span>
        </div>
      </div>
      
      <div class="detail-main-info">
        <h2 class="app-title" style="font-size: 2.5rem; margin:0;">${chocha.name}</h2>
        <p style="color: var(--panini-yellow); font-weight: 700;">${chocha.countryCode} | EDAD: ${chocha.age}</p>
        <img src="${chocha.image}" class="detail-image" alt="${chocha.name}">
        <p style="font-style: italic; opacity: 0.8; margin-top: 1rem;">"${chocha.desc || 'Sin descripción.'}"</p>
      </div>
  
      <div class="detail-stats-grid">
        <div class="detail-skill-row">
          <span>Mamando</span>
          <div class="detail-skill-stars">${'★'.repeat(chocha.skills.mamando)}${'☆'.repeat(5 - chocha.skills.mamando)}</div>
        </div>
        <div class="detail-skill-row">
          <span>Brincando</span>
          <div class="detail-skill-stars">${'★'.repeat(chocha.skills.brincando)}${'☆'.repeat(5 - chocha.skills.brincando)}</div>
        </div>
        <div class="detail-skill-row">
          <span>Movimiento</span>
          <div class="detail-skill-stars">${'★'.repeat(chocha.skills.movimiento)}${'☆'.repeat(5 - chocha.skills.movimiento)}</div>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; margin-top: 5px; font-size: 0.8rem; opacity: 0.7;">
          <p>Entrada: ${formatDate(chocha.acqDate)}</p>
          <p>Salida: ${chocha.isVigente ? 'VIGENTE' : formatDate(chocha.depDate)}</p>
        </div>
      </div>
    `;
  detailModal.classList.remove('hidden-modal');
}

function formatDate(dateString) {
  if (!dateString) return '--/--/--';
  const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

// --- Modal & Form Logic ---
function setupModal() {
  // Toggle Vigente/DepDate visibility
  const isVigenteCheckbox = document.getElementById('chochaIsVigente');
  const depDateGroup = document.getElementById('depDateGroup');

  isVigenteCheckbox.addEventListener('change', () => {
    depDateGroup.style.display = isVigenteCheckbox.checked ? 'none' : 'block';
  });

  // Star Rating Interaction
  const starContainers = document.querySelectorAll('.star-rating');
  starContainers.forEach(container => {
    const stars = container.querySelectorAll('.star');
    const skillName = container.dataset.skill;

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.value);
        state.tempSkills[skillName] = rating;

        // Update UI
        stars.forEach(s => {
          if (parseInt(s.dataset.value) <= rating) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
    });
  });

  // Open
  document.getElementById('addChochaBtn').addEventListener('click', () => {
    modal.classList.remove('hidden-modal');
    // Reset form
    document.getElementById('addChochaForm').reset();
    state.tempSkills = { mamando: 0, brincando: 0, movimiento: 0 };
    document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    photoPreview.innerHTML = '<span>Subir Foto</span>';
    photoPreview.style.backgroundImage = 'none';
  });

  // Close
  document.querySelector('.close-modal').addEventListener('click', () => {
    modal.classList.add('hidden-modal');
  });

  document.getElementById('btn-close-detail').addEventListener('click', () => {
    detailModal.classList.add('hidden-modal');
  });

  // Photo Upload Preview
  photoPreview.addEventListener('click', () => chochaPhotoInput.click());
  chochaPhotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        photoPreview.innerHTML = ''; // Remove text
        photoPreview.style.backgroundImage = `url(${f.target.result})`;
        photoPreview.style.backgroundSize = 'cover';
        photoPreview.style.backgroundPosition = 'center';
      };
      reader.readAsDataURL(file);
    }
  });

  // Save Form
  document.getElementById('addChochaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addNewChocha();
  });
}

function populateNationalities() {
  flags.forEach(flag => {
    const option = document.createElement('option');
    option.value = flag.code; // Use code as value for logic, but we need to store emoji too
    option.dataset.emoji = flag.emoji;
    option.textContent = `${flag.emoji} ${flag.name}`;
    nationalitySelect.appendChild(option);
  });
}

function addNewChocha() {
  const name = document.getElementById('chochaName').value;
  const age = document.getElementById('chochaAge').value;
  const nationalityOption = nationalitySelect.options[nationalitySelect.selectedIndex];
  const acqDate = document.getElementById('chochaAcqDate').value;
  const isVigente = document.getElementById('chochaIsVigente').checked;
  const depDate = document.getElementById('chochaDepDate').value;
  const desc = document.getElementById('chochaDesc').value;
  const gordura = document.getElementById('chochaGordura').value;
  const color = document.getElementById('chochaColor').value;

  // Validation for skills and characteristics
  if (state.tempSkills.mamando === 0 || state.tempSkills.brincando === 0 || state.tempSkills.movimiento === 0 || !gordura || !color) {
    alert('¡Debes completar todas las habilidades y características!');
    return;
  }

  // Calculate average (total points / 5 categories)
  const totalStars = state.tempSkills.mamando + state.tempSkills.brincando + state.tempSkills.movimiento + parseInt(gordura) + parseInt(color);
  const averageRating = (totalStars / 5).toFixed(1);

  const file = chochaPhotoInput.files[0];
  if (!file) {
    alert('¡Falta la foto de la chocha!');
    return;
  }

  const reader = new FileReader();
  reader.onload = (f) => {
    const newChocha = {
      id: Date.now(),
      name,
      age,
      nationality: nationalityOption.dataset.emoji,
      countryCode: nationalityOption.value,
      acqDate,
      isVigente,
      depDate: isVigente ? '' : depDate,
      desc,
      image: f.target.result,
      skills: { ...state.tempSkills },
      characteristics: { gordura, color },
      averageRating: parseFloat(averageRating)
    };

    state.chochas.push(newChocha);
    renderAlbum();
    modal.classList.add('hidden-modal');
  };
  reader.readAsDataURL(file);
}

// Start
init();
