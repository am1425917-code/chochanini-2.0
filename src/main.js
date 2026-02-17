import './style.css'
import { supabase } from './supabase'

// --- State ---
const state = {
  currentView: 'login', // 'login' | 'home' | 'album' | 'friends'
  user: null,
  profile: null,
  chochas: [],
  friends: [],
  viewingFriendId: null, // If viewing someone else's album
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

// --- DOM Elements ---
const views = {
  login: document.getElementById('login-view'),
  home: document.getElementById('home-view'),
  album: document.getElementById('album-view'),
  friends: document.getElementById('friends-view')
};

const albumGrid = document.getElementById('albumGrid');
const modal = document.getElementById('add-chocha-modal');
const detailModal = document.getElementById('detail-modal');
const detailBody = document.getElementById('detail-body');
const photoPreview = document.getElementById('photoPreview');
const chochaPhotoInput = document.getElementById('chochaPhoto');
const nationalitySelect = document.getElementById('chochaNationality');
const friendsGrid = document.getElementById('friendsGrid');

// --- Initialization ---
async function init() {
  setupNavigation();
  setupAuth();
  setupModal();
  setupFriends();
  populateNationalities();

  // Check current session
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    handleLoggedUser(session.user);
  }
}

// --- Auth Logic ---
function setupAuth() {
  const authChoice = document.getElementById('auth-choice');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const showLoginBtn = document.getElementById('btn-show-login-choice');
  const showRegisterBtn = document.getElementById('btn-show-register-choice');
  const backBtnL = document.getElementById('btn-back-to-choice-l');
  const backBtnR = document.getElementById('btn-back-to-choice-r');

  showLoginBtn.onclick = () => {
    authChoice.classList.add('hidden-view');
    loginForm.classList.remove('hidden-view');
  };

  showRegisterBtn.onclick = () => {
    authChoice.classList.add('hidden-view');
    registerForm.classList.remove('hidden-view');
  };

  const backToChoice = () => {
    loginForm.classList.add('hidden-view');
    registerForm.classList.add('hidden-view');
    authChoice.classList.remove('hidden-view');
  };

  backBtnL.onclick = backToChoice;
  backBtnR.onclick = backToChoice;

  // Login
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    const originalText = btn.textContent;
    btn.textContent = 'Cargando...';
    btn.disabled = true;

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    btn.textContent = originalText;
    btn.disabled = false;

    if (error) return alert('Error: ' + error.message);
    handleLoggedUser(data.user);
  };

  // Register
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    const originalText = btn.textContent;
    btn.textContent = 'Creando...';
    btn.disabled = true;

    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      btn.textContent = originalText;
      btn.disabled = false;
      return alert(error.message);
    }

    const { error: pError } = await supabase.from('profiles').insert([
      { id: data.user.id, username, email }
    ]);

    btn.textContent = originalText;
    btn.disabled = false;

    if (pError) return alert('Error perfil: ' + pError.message);
    handleLoggedUser(data.user);
  };

  document.getElementById('btn-logout').onclick = async () => {
    await supabase.auth.signOut();
    state.user = null;
    state.profile = null;
    backToChoice();
    switchView('login');
  };
}

async function handleLoggedUser(user) {
  state.user = user;

  // Fetch Profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  state.profile = profile;

  if (profile) {
    document.getElementById('user-greeting').textContent = `¡Hola, ${profile.username}!`;
    document.getElementById('user-id-display').textContent = `ID Amigos: ${profile.username}`;
  }

  switchView('home');
  fetchMyCharacters();
}

// --- Character Logic (Supabase) ---
async function fetchMyCharacters() {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', state.user.id);

  if (!error) {
    state.chochas = data || [];
    renderAlbum();
  }
}

async function fetchFriendCharacters(friendId) {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', friendId);

  if (!error) {
    state.chochas = data || [];
    renderAlbum();
  }
}

async function addNewChocha() {
  const name = document.getElementById('chochaName').value;
  const age = document.getElementById('chochaAge').value;
  const nationalityOption = nationalitySelect.options[nationalitySelect.selectedIndex];
  const acqDate = document.getElementById('chochaAcqDate').value;
  const isVigente = document.getElementById('chochaIsVigente').checked;
  const depDate = document.getElementById('chochaDepDate').value;
  const desc = document.getElementById('chochaDesc').value;
  const gordura = document.getElementById('chochaGordura').value;
  const color = document.getElementById('chochaColor').value;

  if (state.tempSkills.mamando === 0 || state.tempSkills.brincando === 0 || state.tempSkills.movimiento === 0 || !gordura || !color) {
    return alert('¡Debes completar todas las habilidades y características!');
  }

  const totalPoints = state.tempSkills.mamando + state.tempSkills.brincando + state.tempSkills.movimiento + parseInt(gordura) + parseInt(color);
  const averageRating = (totalPoints / 5).toFixed(1);

  const file = chochaPhotoInput.files[0];
  if (!file) return alert('¡Falta la foto!');

  // Conversion for storage (Base64 for simplicity in MVP, Storage in future)
  const reader = new FileReader();
  reader.onload = async (f) => {
    const newChar = {
      user_id: state.user.id,
      name,
      age,
      nationality: nationalityOption.dataset.emoji,
      country_code: nationalityOption.value,
      acq_date: acqDate,
      is_vigente: isVigente,
      dep_date: isVigente ? null : depDate,
      desc,
      image_data: f.target.result,
      skills: state.tempSkills,
      characteristics: { gordura, color },
      average_rating: parseFloat(averageRating)
    };

    const { error } = await supabase.from('characters').insert([newChar]);
    if (error) return alert('Error guardando: ' + error.message);

    modal.classList.add('hidden-modal');
    fetchMyCharacters();
  };
  reader.readAsDataURL(file);
}

// --- Friends Logic ---
function setupFriends() {
  document.getElementById('btn-add-friend').onclick = async () => {
    const friendUsername = document.getElementById('friend-id-input').value;
    if (!friendUsername) return;

    // 1. Find user by username
    const { data: friendProfile, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', friendUsername)
      .single();

    if (error || !friendProfile) return alert('Usuario no encontrado');

    // 2. Add to friends (simplified relation)
    const { error: fError } = await supabase.from('friends').insert([
      { user_id: state.user.id, friend_id: friendProfile.id }
    ]);

    if (fError) {
      if (fError.code === '23505') return alert('Ya son amigos');
      return alert('Error agregando amigo: ' + fError.message);
    }

    alert('¡Amigo agregado!');
    fetchFriends();
  };
}

async function fetchFriends() {
  // En Supabase necesitamos una tabla 'friends' con (user_id, friend_id)
  const { data, error } = await supabase
    .from('friends')
    .select('friend_id, profiles!friends_friend_id_fkey(username)')
    .eq('user_id', state.user.id);

  if (!error) {
    state.friends = data.map(f => ({ id: f.friend_id, username: f.profiles.username }));
    renderFriends();
  }
}

function renderFriends() {
  friendsGrid.innerHTML = '';
  state.friends.forEach(friend => {
    const div = document.createElement('div');
    div.className = 'friend-card';
    div.innerHTML = `
      <div class="friend-info">
        <h4>${friend.username}</h4>
        <p>Toca para ver su álbum</p>
      </div>
      <span class="icon">➜</span>
    `;
    div.onclick = () => {
      state.viewingFriendId = friend.id;
      document.getElementById('album-title').textContent = `Álbum de ${friend.username}`;
      document.getElementById('addChochaBtn').parentElement.style.display = 'none'; // Hide FAB
      fetchFriendCharacters(friend.id);
      switchView('album');
    };
    friendsGrid.appendChild(div);
  });
}

// --- NavigationLogic ---
function setupNavigation() {
  document.getElementById('btn-my-album').onclick = () => {
    state.viewingFriendId = null;
    document.getElementById('album-title').textContent = 'Mi Álbum';
    document.getElementById('addChochaBtn').parentElement.style.display = 'block';
    fetchMyCharacters();
    switchView('album');
  };
  document.getElementById('btn-friends').onclick = () => {
    fetchFriends();
    switchView('friends');
  };
  document.getElementById('btn-back-home').onclick = () => switchView('home');
  document.getElementById('btn-back-home-friends').onclick = () => switchView('home');
}

function switchView(viewName) {
  Object.values(views).forEach(v => v.classList.add('hidden-view'));
  views[viewName].classList.remove('hidden-view');
  state.currentView = viewName;
}

// --- Modals, Rendering & Helpers ---
function renderAlbum() {
  albumGrid.innerHTML = '';
  const sorted = [...state.chochas].sort((a, b) => b.average_rating - a.average_rating);

  sorted.forEach(chocha => {
    const card = document.createElement('div');
    card.className = 'panini-sticker';
    card.innerHTML = `
      <div class="sticker-rating-badge">
        <div class="rating-label">CALIDAD DE PERSONAJE</div>
        <div class="rating-value">${chocha.average_rating.toFixed(1)} <span>★</span></div>
      </div>
      <div class="sticker-top">
        <span class="sticker-flag">${chocha.nationality}</span>
        <span class="sticker-country-code">${chocha.country_code || 'INT'}</span>
      </div>
      <div class="sticker-image-wrapper">
        <img src="${chocha.image_data}" alt="${chocha.name}" class="sticker-image">
      </div>
      <div class="sticker-info">
        <h3 class="sticker-name">${chocha.name}</h3>
        <div class="sticker-details">
          <span>EDAD: <strong>${chocha.age || '?'}</strong></span>
          <div class="sticker-dates">
             <span>IN: ${formatDate(chocha.acq_date)}</span>
             ${chocha.is_vigente
        ? `<span class="sticker-status-badge">VIGENTE</span>`
        : `<span>OUT: ${formatDate(chocha.dep_date)}</span>`
      }
          </div>
        </div>
      </div>
    `;
    card.onclick = () => openDetailModal(chocha);
    albumGrid.appendChild(card);
  });
}

function openDetailModal(chocha) {
  const gorduraLabel = { '5': 'Flaca', '4': 'Promedio', '2': 'Gorda', '1': 'Volqueta' }[chocha.characteristics.gordura];
  const colorLabel = { '5': 'Blanquita', '4': 'Morenita', '3': 'Negrita' }[chocha.characteristics.color];

  detailBody.innerHTML = `
    <div class="detail-header">
      <span style="font-size: 3rem;">${chocha.nationality}</span>
      <div class="sticker-rating-badge" style="position: static; transform: none; padding: 10px;">
         <div class="rating-label">CALIDAD DE PERSONAJE</div>
         <div class="rating-value" style="font-size: 1.5rem;">${chocha.average_rating.toFixed(1)} <span>★</span></div>
      </div>
    </div>
    <div class="detail-main-info">
      <h2 class="app-title" style="font-size: 2.5rem; margin:0; line-height:1.2;">${chocha.name}</h2>
      <img src="${chocha.image_data}" class="detail-image" alt="${chocha.name}">
      <p style="font-style: italic; opacity: 0.8;">"${chocha.desc || 'Sin descripción.'}"</p>
    </div>
    <div class="detail-stats-grid">
      <div class="detail-skill-row"><span>Mamando</span><span>${'★'.repeat(chocha.skills.mamando)}</span></div>
      <div class="detail-skill-row"><span>Brincando</span><span>${'★'.repeat(chocha.skills.brincando)}</span></div>
      <div class="detail-skill-row"><span>Movimiento</span><span>${'★'.repeat(chocha.skills.movimiento)}</span></div>
      <div class="detail-skill-row"><span>Gordura</span><span>${gorduraLabel}</span></div>
      <div class="detail-skill-row"><span>Color</span><span>${colorLabel}</span></div>
    </div>
  `;
  detailModal.classList.remove('hidden-modal');
}

function formatDate(date) {
  if (!date) return '--/--/--';
  return new Date(date).toLocaleDateString();
}

function setupModal() {
  document.getElementById('addChochaBtn').onclick = () => {
    modal.classList.remove('hidden-modal');
    document.getElementById('addChochaForm').reset();
    state.tempSkills = { mamando: 0, brincando: 0, movimiento: 0 };
    document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    photoPreview.style.backgroundImage = 'none';
    photoPreview.innerHTML = '<span>Subir Foto</span>';
  };

  document.querySelector('.close-modal').onclick = () => modal.classList.add('hidden-modal');
  document.getElementById('btn-close-detail').onclick = () => detailModal.classList.add('hidden-modal');

  // Star Logic
  document.querySelectorAll('.star-rating').forEach(cont => {
    cont.querySelectorAll('.star').forEach(star => {
      star.onclick = () => {
        const val = parseInt(star.dataset.value);
        state.tempSkills[cont.dataset.skill] = val;
        cont.querySelectorAll('.star').forEach(s => {
          s.classList.toggle('active', parseInt(s.dataset.value) <= val);
        });
      };
    });
  });

  photoPreview.onclick = () => chochaPhotoInput.click();
  chochaPhotoInput.onchange = (e) => {
    const reader = new FileReader();
    reader.onload = f => {
      photoPreview.innerHTML = '';
      photoPreview.style.backgroundImage = `url(${f.target.result})`;
      photoPreview.style.backgroundSize = 'cover';
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  document.getElementById('addChochaForm').onsubmit = (e) => {
    e.preventDefault();
    addNewChocha();
  };

  document.getElementById('chochaIsVigente').onchange = (e) => {
    document.getElementById('depDateGroup').style.display = e.target.checked ? 'none' : 'block';
  };
}

function populateNationalities() {
  flags.forEach(flag => {
    const opt = document.createElement('option');
    opt.value = flag.code;
    opt.dataset.emoji = flag.emoji;
    opt.textContent = `${flag.emoji} ${flag.name}`;
    nationalitySelect.appendChild(opt);
  });
}

init();
