import Swal from 'sweetalert2';

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
