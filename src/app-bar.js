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
