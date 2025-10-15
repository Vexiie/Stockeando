// Helpers
console.log("JS cargado ✅");

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const toast = msg => {
  const t = $('#toast'); 
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.add('hidden'), 2500);
};

// Storage keys
const USERS_KEY = 'stockeando_users_v1';
const SESSION_KEY = 'stockeando_session_v1';
const INVENTORY_KEY = 'stockeando_inventory_v1';

// Inicialización de usuarios
if (!localStorage.getItem(USERS_KEY)) {
  localStorage.setItem(USERS_KEY, JSON.stringify([
    { email: 'malena@bue.edu.ar', name: 'Malena', pass: '1234' }
  ]));
}

// Inicialización de inventario 
const defaultInventory = [
  { id:1, name:"Pupitre Escolar", code:"PUP-001", category:"Mobiliario", location:"Aula 3", date:"2024-01-14", state:"En Uso", desc:"Pupitre individual", tags:["Mobiliario"] },
  { id:2, name:"PC HP", code:"COM-015", category:"Informática", location:"Laboratorio", date:"2024-01-19", state:"En Reparación", desc:"HP ProDesk", tags:["Informática"] }
];

if (!localStorage.getItem(INVENTORY_KEY) || JSON.parse(localStorage.getItem(INVENTORY_KEY)).length === 0) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(defaultInventory));
}

// Estado global
let users = JSON.parse(localStorage.getItem(USERS_KEY));
let inventory = JSON.parse(localStorage.getItem(INVENTORY_KEY));
let session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');

// Función para actualizar stats
const updateStats = () => {
  $('#stat-total').textContent = inventory.length;
  $('#stat-enuso').textContent = inventory.filter(i => i.state==="En Uso").length;
  $('#stat-reparacion').textContent = inventory.filter(i => i.state==="En Reparación").length;
  $('#stat-baja').textContent = inventory.filter(i => i.state==="Para dar de baja").length;
  $('#stat-noid').textContent = inventory.filter(i => i.state==="No identificado").length;
  $('#stat-ubicdes').textContent = inventory.filter(i => i.state==="Ubicación desconocida").length;
};


// Render de inventario
const renderInventory = (items = inventory) => {
  const grid = $('#cards-grid');
  grid.innerHTML = '';
  $('#inventory-title').textContent = `Inventario (${items.length})`;
  const template = $('#card-template');

  items.forEach(item => {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.item-name').textContent = item.name;
    clone.querySelector('.description').textContent = item.desc;
    clone.querySelector('.code').textContent = item.code;
    clone.querySelector('.location').textContent = item.location;
    clone.querySelector('.date').textContent = item.date;

    const status = clone.querySelector('.status');
    status.textContent = item.state;
    status.className = 'status pill'; // reset clases
    switch(item.state){
      case 'En Uso': status.classList.add('enuso'); break;
      case 'En Reparación': status.classList.add('reparacion'); break;
      case 'Para dar de baja': status.classList.add('baja'); break;
      case 'No identificado': status.classList.add('noid'); break;
      case 'Ubicación desconocida': status.classList.add('ubicdes'); break;
    }

    grid.appendChild(clone);
  });
};

// Filtrado y búsqueda
const filterInventory = () => {
  const term = $('#search-input').value.toLowerCase();
  const state = $('#filter-state').value;
  const cat = $('#filter-category').value;

  const filtered = inventory.filter(i => {
    return (i.name.toLowerCase().includes(term) || i.code.toLowerCase().includes(term) || i.location.toLowerCase().includes(term))
      && (state === 'all' || i.state === state)
      && (cat === 'all' || i.category === cat);
  });

  renderInventory(filtered);
};

// Inicialización de eventos
$('#search-input').addEventListener('input', filterInventory);
$('#filter-state').addEventListener('change', filterInventory);
$('#filter-category').addEventListener('change', filterInventory);

$('#btn-add').addEventListener('click', () => {
  toast('Funcionalidad de agregar item activada');
});
// Abrir modal agregar item
$('#btn-add').addEventListener('click', () => {
  $('#item-modal').classList.remove('hidden');
});

// Cerrar modal
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').classList.add('hidden');
  });
});

// Guardar nuevo item
$('#save-item').addEventListener('click', () => {
  const newItem = {
    id: Date.now(),
    name: $('#new-name').value,
    code: $('#new-code').value,
    category: $('#new-category').value,
    location: $('#new-location').value,
    date: $('#new-date').value,
    state: 'En Uso',
    desc: $('#new-desc').value,
    tags: []
  };
  inventory.push(newItem);
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  renderInventory();
  updateStats();
  $('#item-modal').classList.add('hidden');

  // Limpiar inputs
  $('#new-name').value = '';
  $('#new-code').value = '';
  $('#new-category').value = '';
  $('#new-location').value = '';
  $('#new-date').value = '';
  $('#new-desc').value = '';
});


// Inicialización
updateStats();
renderInventory();

