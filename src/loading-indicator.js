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
