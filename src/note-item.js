import Swal from 'sweetalert2';

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
