const CSS_TRANSITION_LENGTH = '300ms';
const CSS_TRANSLATE_DISTANCE = '200px';
const CSS_HIDE_CLASS = 'hidden';

const template = document.createElement('template');

// TODO: refactor to remove <style> from basic template (add it append it as a separate element?)
// TODO: add <p> styles or just generally improve the .modal-content styling
template.innerHTML = `
  <style>
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 1;
      
      display: flex;
      align-items: center;

      transition: opacity ${ CSS_TRANSITION_LENGTH };
    }

    .modal-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background-color: rgba(0,0,0,0.3);
    }

    .modal-content {
      margin: 0 auto;
      width: 60%;
      min-width: 300px;
      background-color: #FFFFFF;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;

      transform: translate3d(0, 0, 0);
      transition: transform ${ CSS_TRANSITION_LENGTH } ease-out;
    }

    .${ CSS_HIDE_CLASS }.modal {
      opacity: 0;
      z-index: -1;
    }

    .${ CSS_HIDE_CLASS } .modal-content {
      transform: translate3d(0, ${ CSS_TRANSLATE_DISTANCE }, 0);
    }
  </style>
  <aside class="modal ${ CSS_HIDE_CLASS } js-modal" id="modal" role="dialog" aria-labelledby="dialog">
    <div class="modal-bg"></div>
    <article class="modal-content">
      <h4 class="js-modal-title"><slot name="title"></slot></h4>
      <p class="js-modal-description"><slot name="description"></slot></p>
      <section class="modal-options">
        <slot></slot>
      </section>
    </article>
  </aside>
`;

// https://developer.mozilla.org/en-US/docs/Web/Web_Components
class CustomModal extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowRoot.querySelector('.js-modal-title').innerText = this.getAttribute('title');
    this.shadowRoot.querySelector('.js-modal-description').innerText = this.getAttribute('desctiption');
  }

  connectedCallback () {
    this._mainEl = this.shadowRoot.querySelector('.js-modal');
    this.addListeners();
  }

  addListeners () {
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

    // NOTE: refactor to be able to remove eventListener in disconnectedCallback()
    this.addEventListener('MODAL', (evt) => {
      evt.preventDefault();
      const { message } = evt.detail;
      switch (message) {
        case 'OPEN':
          this.open();
          break;
        case 'CLOSE':
          this.close();
          break;
        default:
          console.error(`Invalid modal message: ${ message }`);
          break;
      }
    });
  }

  open () {
    this._mainEl.classList.remove(CSS_HIDE_CLASS);
  }
  close () {
    this._mainEl.classList.add(CSS_HIDE_CLASS);
  }
}

window.customElements.define('custom-modal', CustomModal);