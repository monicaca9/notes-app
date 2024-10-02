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
