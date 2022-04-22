import Board, { EVENTS as BoardEvents } from './Board';
import DynamicComponent from './Dynamic';

export default class App extends DynamicComponent {
  constructor () {
    super();

    this.boardEl = this.shadowRoot.querySelector(Board.tagName);
    this.swipeBtnEls = Array.from(this.shadowRoot.querySelectorAll('.js-swipe-btn'));
    this.resetEls = Array.from(this.shadowRoot.querySelectorAll('.js-reset-btn'));
  }

  static defaultSize = 4;

  static attributes = {
    size: 'size'
  }

  static styles () {
    return `
      <style>
        .top-m,
        .mid-l,
        .mid-r,
        .bot-m {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .swipe {
          position: relative;
          width: 80px;
          height: 40px;
        }
    
        .swipe::after {
          content: '^';
          display: flex;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          align-items: center;
          justify-content: center;
          transform-origin: center;
        }

        .swipe-l {
          transform: rotate(-90deg);
        }
        .swipe-r {
          transform: rotate(90deg);
        }
        .swipe-d {
          transform: rotate(180deg);
        }
      </style>
    `
  }

  static template ({ size }) {
    return `
      <div class="top-l"></div>
      <div class="top-m">
        <button type="button" class="btn swipe swipe-u js-swipe-btn" id="swipe-up" value="up"></button>
      </div>
      <div class="top-r"></div>
      <div class="mid-l">
        <button type="button" class="btn swipe swipe-l js-swipe-btn" id="swipe-left" value="left"></button>
      </div>
      <div class="mid-m js-board-container">
        <game-board class="${ Board.classList.join(' ') }" size="${ size }"></game-board>
      </div>
      <div class="mid-r">
        <button type="button" class="btn swipe swipe-r js-swipe-btn" id="swipe-right" value="right"></button>
      </div>
      <div class="bot-l"></div>
      <div class="bot-m">
        <button type="button" class="btn swipe swipe-d js-swipe-btn" id="swipe-down" value="down"></button>
      </div>
      <div class="bot-r"></div>
      <custom-modal heading="You fucking lost, idiot." description="Maybe don't suck so much? ¯\(ツ)/¯" class="js-modal-lost">
        <!-- TODO: implement other options for lose state -->
        <button type="button" id="reset" class="btn reset js-reset-btn">Start Over</button>
      </custom-modal>
    `;
  }

  connectedCallback () {
    this._addListeners();
  }

  _addListeners () {
    const handleSwipe = this.swipe.bind(this);
    const handleReset = this.reset.bind(this);

    this.swipeBtnEls.forEach(el => el.addEventListener('click', handleSwipe));
    this.resetEls.forEach(el => el.addEventListener('click', handleReset));
  }

  swipe (evt) {
    evt.preventDefault();
    // determine direction
    const direction = evt.currentTarget.value
    // dispatch event
    const swipeEvt = this.constructor.makeEvent(BoardEvents.SWIPE, { detail: { direction } });
    this.boardEl.dispatchEvent(swipeEvt);
  }

  reset (evt) {
    evt.preventDefault();
    const resetEvt = this.constructor.makeEvent(BoardEvents.RESET);
    this.boardEl.dispatchEvent(resetEvt);
  }
}