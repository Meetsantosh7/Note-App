// DOM Elements
const addBtn = document.querySelector("#addBtn");
const main = document.querySelector("#main");
const searchInput = document.querySelector("#searchInput");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    loadNotes();
    
    // Add search functionality
    searchInput.addEventListener("input", filterNotes);
});

addBtn.addEventListener("click", () => {
    addNote();
});

// Functions
function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString();
}

function createNoteElement(id, title = "", content = "", timestamp = getCurrentDateTime()) {
    const note = document.createElement("div");
    note.classList.add("note");
    note.dataset.id = id;
    
    note.innerHTML = `
        <div class="note-header">
            <h3>Note</h3>
            <div class="note-actions">
                <i class="save fas fa-save" title="Save note"></i>
                <i class="trash fas fa-trash" title="Delete note"></i>
            </div>
        </div>
        <div class="note-title">
            <textarea placeholder="Note title...">${title}</textarea>
        </div>
        <div class="note-content">
            <textarea placeholder="Write your thoughts here...">${content}</textarea>
        </div>
        <div class="note-footer">
            Last updated: ${timestamp}
        </div>
    `;
    
    // Event listeners for the note
    const saveBtn = note.querySelector(".save");
    const deleteBtn = note.querySelector(".trash");
    const titleTextarea = note.querySelector(".note-title textarea");
    const contentTextarea = note.querySelector(".note-content textarea");
    
    // Auto-resize textareas
    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }
    
    titleTextarea.addEventListener("input", () => {
        autoResize(titleTextarea);
    });
    
    contentTextarea.addEventListener("input", () => {
        autoResize(contentTextarea);
    });
    
    // Initialize heights
    setTimeout(() => {
        autoResize(titleTextarea);
        autoResize(contentTextarea);
    }, 0);
    
    // Save note
    saveBtn.addEventListener("click", () => {
        updateNote(note);
        showSaveAnimation(saveBtn);
    });
    
    // Delete note
    deleteBtn.addEventListener("click", () => {
        deleteNote(note);
    });
    
    // Auto-save on input
    titleTextarea.addEventListener("blur", () => updateNote(note));
    contentTextarea.addEventListener("blur", () => updateNote(note));
    
    return note;
}

function addNote(title = "", content = "", isInitializing = false) {
    const id = Date.now().toString();
    const note = createNoteElement(id, title, content);
    
    if (isInitializing) {
        main.appendChild(note); // Append if loading from storage to maintain order
    } else {
        main.prepend(note); // Prepend for new notes to add them to the start (left)
    }
    
    // Add fade-in animation
    note.style.opacity = "0";
    // Ensure element is in flow for prepended items before animating
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            note.style.opacity = "1";
        });
    });
    
    if (!isInitializing) {
        saveNotes();
    }
    
    return note;
}

function updateNote(noteElement) {
    const id = noteElement.dataset.id;
    const titleTextarea = noteElement.querySelector(".note-title textarea");
    const contentTextarea = noteElement.querySelector(".note-content textarea");
    const footerElement = noteElement.querySelector(".note-footer");
    
    const title = titleTextarea.value.trim();
    const content = contentTextarea.value.trim();
    const timestamp = getCurrentDateTime();
    
    // Update the timestamp in the footer
    footerElement.textContent = `Last updated: ${timestamp}`;
    
    saveNotes();
}

function deleteNote(noteElement) {
    // Add fade-out animation
    noteElement.style.opacity = "0";
    noteElement.style.transform = "scale(0.8)";
    
    setTimeout(() => {
        noteElement.remove();
        saveNotes();
    }, 300);
}

function showSaveAnimation(saveBtn) {
    saveBtn.classList.add("fa-check");
    saveBtn.classList.remove("fa-save");
    
    setTimeout(() => {
        saveBtn.classList.remove("fa-check");
        saveBtn.classList.add("fa-save");
    }, 1000);
}

function saveNotes() {
    const notes = [];
    
    document.querySelectorAll(".note").forEach(noteElement => {
        const id = noteElement.dataset.id;
        const titleTextarea = noteElement.querySelector(".note-title textarea");
        const contentTextarea = noteElement.querySelector(".note-content textarea");
        const footerElement = noteElement.querySelector(".note-footer");
        
        const title = titleTextarea.value.trim();
        const content = contentTextarea.value.trim();
        const timestamp = footerElement.textContent.replace("Last updated: ", "");
        
        if (title !== "" || content !== "") {
            notes.push({ id, title, content, timestamp });
        }
    });
    
    localStorage.setItem("notes", JSON.stringify(notes));
}

function loadNotes() {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    
    if (savedNotes.length === 0) {
        // Add a welcome note if no notes exist
        addNote(
            "Welcome to Noteworthy!",
            "This is your new note-taking app. Here are some tips:\n\n• Click the + button to add a new note\n• Use the search box to find notes\n• Click the save icon to save your changes\n• Notes are automatically saved when you click outside the text area",
            true
        );
    } else {
        savedNotes.forEach(note => {
            addNote(note.title, note.content, true);
        });
    }
}

function filterNotes() {
    const searchTerm = searchInput.value.toLowerCase();
    const notes = document.querySelectorAll(".note");
    
    notes.forEach(note => {
        const titleText = note.querySelector(".note-title textarea").value.toLowerCase();
        const contentText = note.querySelector(".note-content textarea").value.toLowerCase();
        
        if (titleText.includes(searchTerm) || contentText.includes(searchTerm)) {
            note.style.display = "flex";
        } else {
            note.style.display = "none";
        }
    });
}