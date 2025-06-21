
// ========== CONSTANTS ==========
const folderSelect = document.getElementById('folderSelect');
const newNoteBtn = document.getElementById('newNoteBtn');
const noteModal = document.getElementById('noteModal');
const noteText = document.getElementById('noteText');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const notesContainer = document.getElementById('notesContainer');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const exportBtn = document.getElementById('exportBtn');

// ========== STATE ==========
let folders = JSON.parse(localStorage.getItem('godsFolders')) || ["Ram", "Shiv", "Krishna", "Work", "Personal"];
let currentFolder = folderSelect.value;
let editingNoteId = null;

// ========== INIT ==========
function initFolders() {
  folderSelect.innerHTML = '';
  folders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder;
    option.textContent = folder;
    folderSelect.appendChild(option);
  });
}

initFolders();
loadNotes(currentFolder);

// ========== EVENTS ==========
folderSelect.addEventListener('change', () => {
  currentFolder = folderSelect.value;
  loadNotes(currentFolder);
});

newNoteBtn.addEventListener('click', () => {
  editingNoteId = null;
  noteText.value = '';
  noteModal.style.display = 'flex';
});

cancelNoteBtn.addEventListener('click', () => {
  noteModal.style.display = 'none';
});

saveNoteBtn.addEventListener('click', () => {
  const text = noteText.value.trim();
  if (!text) return alert("Note is empty!");

  const notes = getNotes(currentFolder);
  if (editingNoteId !== null) {
    notes[editingNoteId].text = text;
    notes[editingNoteId].date = new Date().toLocaleString();
  } else {
    notes.push({ text, date: new Date().toLocaleString() });
  }
  localStorage.setItem('godsNotes_' + currentFolder, JSON.stringify(notes));
  noteModal.style.display = 'none';
  loadNotes(currentFolder);
});

exportBtn.addEventListener('click', () => {
  const allData = {};
  folders.forEach(f => {
    allData[f] = getNotes(f);
  });
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gods_notes_backup.json';
  link.click();
});

importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      for (const folder in data) {
        if (!folders.includes(folder)) folders.push(folder);
        localStorage.setItem('godsNotes_' + folder, JSON.stringify(data[folder]));
      }
      localStorage.setItem('godsFolders', JSON.stringify(folders));
      initFolders();
      loadNotes(currentFolder);
      alert("Notes imported successfully!");
    } catch {
      alert("Invalid file format");
    }
  };
  reader.readAsText(file);
});

// ========== FUNCTIONS ==========
function getNotes(folder) {
  return JSON.parse(localStorage.getItem('godsNotes_' + folder)) || [];
}

function loadNotes(folder) {
  notesContainer.innerHTML = '';
  const notes = getNotes(folder);
  notes.forEach((note, index) => {
    const div = document.createElement('div');
    div.className = 'note';
    div.innerHTML = \`
      <div class="note-actions">
        <button onclick="editNote(\${index})">✏️</button>
        <button onclick="deleteNote(\${index})">🗑️</button>
      </div>
      <div class="note-content">\${note.text}</div>
      <small>\${note.date}</small>
    \`;
    notesContainer.appendChild(div);
  });
}

window.editNote = function(index) {
  const notes = getNotes(currentFolder);
  editingNoteId = index;
  noteText.value = notes[index].text;
  noteModal.style.display = 'flex';
};

window.deleteNote = function(index) {
  if (!confirm("Delete this note?")) return;
  const notes = getNotes(currentFolder);
  notes.splice(index, 1);
  localStorage.setItem('godsNotes_' + currentFolder, JSON.stringify(notes));
  loadNotes(currentFolder);
};

// ========== CREATE FOLDER ==========
const createFolderBtn = document.createElement('button');
createFolderBtn.id = 'createFolderBtn';
createFolderBtn.textContent = '📂➕ Create Folder';
folderSelect.parentNode.appendChild(createFolderBtn);

createFolderBtn.addEventListener('click', () => {
  const name = prompt("Enter new folder name:");
  if (!name) return;
  if (folders.includes(name)) return alert("Folder already exists.");
  folders.push(name);
  localStorage.setItem('godsFolders', JSON.stringify(folders));
  initFolders();
  folderSelect.value = name;
  currentFolder = name;
  loadNotes(currentFolder);
});
