import './styles.css';
import Swal from 'sweetalert2';

class AppBar extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
  
      const style = document.createElement("style");
      this._newStyle(style);
  
      const div = document.createElement("div");
      div.classList.add("app-bar");
      div.textContent = "Notes App";
  
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(div);
    }
  
  
    _newStyle(styleElement) {
      styleElement.textContent = `
  
        :host {
          background-color: #C75B7A;
          color: white;
          width: 100%;
          text-align: center;
          font-family: 'Poppins', sans-serif;
          font-weight: bold; 
          font-size: 24px;
          box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.2);
        }
  
        .app-bar {
          padding: 24px 20px;
        }
  
        @media (max-width: 600px) {
          .app-bar {
            padding: 16px 10px;
            font-size: 20px;
          }
        }
      `;
    }
  }
  
  customElements.define("app-bar", AppBar);


  class NoteForm extends HTMLElement {
    _shadowRoot = null;
    _style = null;
  
    _submitEvent = "submit";
    _addNoteEvent = "add-note";
    _loadingEvent = "loading";
  
    constructor() {
      super();
  
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._style = document.createElement("style");
  
      this.render();
    }
  
    _emptyContent() {
      this._shadowRoot.innerHTML = "";
    }
  
    _newStyle() {
      this._style.textContent = `
          .form-container {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          background-color: #fff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
  
        .form-container h2 {
          margin-top: 0;
          color: #C75B7A;
          font-size: 1.5em;
        }
  
        .form-group {
          margin-bottom: 12px;
        }
  
        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 600;
          color: #C75B7A;
        }
  
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1em;
          font-family: 'Poppins', sans-serif;
        }
  
        .form-group textarea {
          resize: vertical;
          height: 100px;
        }
  
        .submit-button {
          background-color: #C75B7A;
          color: white;
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1em;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          transition: background-color 0.3s ease;
        }
  
        .submit-button:hover {
          background-color: #a14a64;
        }
  
        @media (max-width: 600px) {
          .form-container {
            padding: 12px;
            margin-bottom: 16px;
          }
  
          .form-container h2 {
            font-size: 1.3em;
          }
            
          .submit-button {
            width: 100%;
            padding: 10px;
          }
        }
  
      `;
    }
  
    render() {
      this._emptyContent();
      this._newStyle();
  
      this._shadowRoot.appendChild(this._style);
      this._shadowRoot.innerHTML += `
        <form class="form-container">
          <h2>Tambah Catatan Baru</h2>
          <div class="form-group">
            <label for="title">Judul</label>
            <input type="text" id="title" name="title" required>
          </div>
          <div class="form-group">
            <label for="body">Isi</label>
            <textarea id="body" name="body" required></textarea>
          </div>
          <button type="submit" class="submit-button">Tambah</button>
        </form>
      `;
    }
  
    connectedCallback() {
      this._shadowRoot
        .querySelector("form")
        .addEventListener("submit", (event) => this._onFormSubmit(event, this));
      this.addEventListener(this._submitEvent, this._onAddNote);
    }
  
    disconnectedCallback() {
      this._shadowRoot
        .querySelector("form")
        .removeEventListener("submit", (event) =>
          this._onFormSubmit(event, this)
        );
      this.removeEventListener(this._submitEvent, this._onAddNote);
    }
  
    async _onAddNote() {
      const form = this._shadowRoot.querySelector("form");
      const title = form.querySelector("#title").value.trim();
      const body = form.querySelector("#body").value.trim();
    
      if (title && body) {
        const newNote = { title, body };
    
        this.dispatchEvent(new CustomEvent(this._loadingEvent, { detail: true }));
    
        try {
          const response = await fetch('https://notes-api.dicoding.dev/v2/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNote),
          });
    
          const result = await response.json();
    
          if (!response.ok) {
            throw new Error(result.message || 'Gagal menambahkan catatan.');
          }
    
          this.dispatchEvent(new CustomEvent(this._addNoteEvent, {
            detail: result.data,
            bubbles: true,
            composed: true,
          }));
    
          form.reset();
        } catch (error) {
          Swal.fire({ icon: 'error', title: 'Oops...', text: error.message });
        } finally {
          this.dispatchEvent(new CustomEvent(this._loadingEvent, { detail: false }));
        }
      }
    }
    
    
  
    _onFormSubmit(event, noteFormInstance) {
      noteFormInstance.dispatchEvent(new CustomEvent(this._submitEvent));
  
      event.preventDefault();
    }
  }
  
  
  
  customElements.define("note-form", NoteForm);

  
  import anime from 'animejs/lib/anime.es.js';

  class NoteList extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.notes = [];
      this.loading = false;
      this.render();
    }
  
    connectedCallback() {
      this.fetchNotes();
    
      this.addEventListener('add-note', this.addNoteHandler.bind(this));
      this.addEventListener('delete-note', this.deleteNoteHandler.bind(this));
      this.addEventListener('archive-note', this.archiveNoteHandler.bind(this));
      this.addEventListener('loading', this.toggleLoading.bind(this));
    }
    
    archiveNoteHandler(event) {
      const updatedNote = event.detail;
      this.notes = this.notes.map(note => note.id === updatedNote.id ? updatedNote : note);
      this.render();
    }
    
  
    async fetchNotes() {
      this.loading = true;
      this.render();
  
      try {
        const response = await fetch('https://notes-api.dicoding.dev/v2/notes', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.message || 'Gagal mengambil catatan.');
        }
  
        this.notes = result.data;
        this.render();
      } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
      } finally {
        this.loading = false;
        this.render();
      }
    }
  
    set notesData(data) {
      this.notes = data;
      this.render();
    }
  
    addNoteHandler(event) {
      const newNote = event.detail;
    
      this.notes.unshift(newNote);
    
      this.render();
    
      const noteElements = this.shadowRoot.querySelectorAll('note-item');
      if (noteElements.length > 0) {
        anime({
          targets: noteElements[0].shadowRoot.querySelector('.note'),
          translateY: [-50, 0],
          opacity: [0, 1],
          easing: 'easeOutExpo',
          duration: 800,
        });
      }
    }  
    
    
  
    async deleteNoteHandler(event) {
      const { id } = event.detail;
  
      this.dispatchEvent(new CustomEvent('loading', { detail: true }));
  
      try {
        const response = await fetch(`https://notes-api.dicoding.dev/v2/notes/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.message || 'Gagal menghapus catatan.');
        }
  
        this.notes = this.notes.filter(note => note.id !== id);
        this.render();
      } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
      } finally {
        this.dispatchEvent(new CustomEvent('loading', { detail: false }));
      }
    }
  
    toggleLoading(event) {
      this.loading = event.detail;
      this.render();
    }
  
    render() {
      this.shadowRoot.innerHTML = '';
  
      if (this.loading) {
        const loadingIndicator = document.createElement('loading-indicator');
        this.shadowRoot.appendChild(loadingIndicator);
        return;
      }
  
    if (this.notes.length === 0) {
      this.shadowRoot.innerHTML = '<p>Tidak ada catatan.</p>';
      return;
    }
      
  
      this.notes.forEach(note => {
        const noteItem = document.createElement('note-item');
        noteItem.note = note;
        this.shadowRoot.appendChild(noteItem);
      });
    }
  }
  
  customElements.define('note-list', NoteList);


  class NoteItem extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    set note(data) {
      this._note = data;
      this.render();
    }
  
    async deleteNote() {
      const { id } = this._note;
  
      this.dispatchEvent(new CustomEvent('loading', { detail: true }));
  
      try {
        const response = await fetch(
          `https://notes-api.dicoding.dev/v2/notes/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
  
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.message || 'Gagal menghapus catatan.');
        }
  
        this.dispatchEvent(
          new CustomEvent('delete-note', {
            detail: { id },
            bubbles: true,
            composed: true,
          })
        );
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `Error: ${error.message}`,
        });
      }
       finally {
        this.dispatchEvent(new CustomEvent('loading', { detail: false }));
      }
    }
  
    async archiveNote() {
      const { id, archived } = this._note;
  
      this.dispatchEvent(new CustomEvent('loading', { detail: true }));
  
      try {
        const response = await fetch(
          `https://notes-api.dicoding.dev/v2/notes/${id}/archive`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
  
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.message || 'Gagal mengarsipkan catatan.');
        }
  
        this.dispatchEvent(
          new CustomEvent('archive-note', {
            detail: result,
            bubbles: true,
            composed: true,
          })
        );
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `Error: ${error.message}`,
        });
      }
       finally {
        this.dispatchEvent(new CustomEvent('loading', { detail: false }));
      }
    }
  
    render() {
      const { title, body, createdAt } = this._note;
      const date = new Date(createdAt).toLocaleString();
  
      const style = document.createElement('style');
      style.textContent = `
          .note {
            position: relative; 
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px 16px 16px 16px; 
            padding-top: 40px;
            background-color: #f9f9f9;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .note-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #C75B7A;
          }
          .note-body {
            flex-grow: 1;
            margin-bottom: 8px;
            white-space: pre-wrap; 
          }
          .note-footer {
            font-size: 12px;
            color: #D9ABAB;
            text-align: right;
          }
          .delete-button {
            background-color: #921A40;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 16px;
            z-index: 1; 
          }
          .delete-button:hover {
            background-color: #b71c1c;
          }
          .archive-button {
            background-color: green;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 16px;
            z-index: 1; 
          }
          .archive-button:hover {
            background-color: #006400;
          }
            .button-container {
            display: flex;
            justify-content: end;
            gap: 8px;
            align-items: center;
            position: absolute;
            top: 8px;
            right: 8px; /* Untuk menempatkan container di pojok kanan atas */
            width: 120px; /* Sesuaikan lebar container dengan kebutuhan */
  }
      `;
  
      const container = document.createElement('div');
      container.classList.add('note');
      container.innerHTML = `
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
      <div class="button-container"> 
      <button class="delete-button">
          <i class="fas fa-trash"></i>
        </button>
        <button class="archive-button">
      <i class="fa-regular fa-folder-open"></i>
    </button>
    </div> 
        <div class="note-title">${title}</div>
        <div class="note-body">${body}</div>
        <div class="note-footer">Created at: ${date}</div>
      `;
  
      const deleteButton = container.querySelector('.delete-button');
      deleteButton.addEventListener('click', () => {
        Swal.fire({
          title: 'Apakah kamu yakin?',
          text: 'Catatan ini akan dihapus secara permanen!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Ya, hapus!',
        }).then((result) => {
          if (result.isConfirmed) {
            this.deleteNote();
          }
        });
      });
      
  
      const archiveButton = container.querySelector('.archive-button');
      archiveButton.addEventListener('click', () => this.archiveNote());
  
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(container);
    }
  }
  
  customElements.define('note-item', NoteItem);
  

  class LoadingIndicator extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.render();
    }
  
    render() {
      const style = document.createElement("style");
      style.textContent = `
        .loader {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #C75B7A;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
  
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
  
      const loader = document.createElement("div");
      loader.classList.add("loader");
  
      this.shadowRoot.appendChild(style);
      this.shadowRoot.appendChild(loader);
    }
  }
  
  customElements.define("loading-indicator", LoadingIndicator);
  
