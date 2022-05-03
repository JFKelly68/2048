import Board, { EVENTS as BoardEvents } from './Board';
import CustomModal, { EVENTS as CustomModalEvents, STYLES as ModalStyles } from './CustomModal';
import DynamicComponent from './Dynamic';

export const STYLES = {
  HIDE_CLASS: 'hidden',
}

export const EVENTS = {
  RESET: 'reset',
  END: 'end',
}

export default class App extends DynamicComponent {
  constructor () {
    super();

    this.boardEl = this.querySelector(Board.tagName);
    this.modalEl = this.querySelector(CustomModal.tagName);
    this.swipeBtnEls = Array.from(this.querySelectorAll(`.js-${ App.actions.swipe }-btn`));
    this.resetEls = Array.from(this.querySelectorAll(`.js-${ App.actions.reset }-btn`));
    this.endEl = this.querySelector(`.js-${ App.actions.end }-btn`);
  }

  static tagName = 'game-app';
  static defaultSize = 4;
  static attributes = {
    size: 'size'
  }
  static actions = {
    swipe: 'swipe',
    reset: 'reset',
    end: 'end',
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

        .${ App.actions.swipe } {
          position: relative;
          width: 80px;
          height: 40px;
        }
    
        .${ App.actions.swipe }::after {
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

        .${ App.actions.swipe }-l {
          transform: rotate(-90deg);
        }
        .${ App.actions.swipe }-r {
          transform: rotate(90deg);
        }
        .${ App.actions.swipe }-d {
          transform: rotate(180deg);
        }

        .${ STYLES.HIDE_CLASS }.${ CustomModal.className } {
          opacity: 0;
          z-index: -1;
        }
      
        .${ STYLES.HIDE_CLASS } .${ CustomModal.className }-content {
          transform: translate3d(0, ${ ModalStyles.TRANSLATE_DISTANCE }, 0);
        }
      </style>
    `
  }

  static template ({ size }) {
    return `
      <section class="grid-3x3">
      <div class="top-l"></div>
      <div class="top-m">
        <button type="button" class="btn ${ App.actions.swipe } ${ App.actions.swipe }-u js-${ App.actions.swipe }-btn" id="${ App.actions.swipe }-up" value="up"></button>
      </div>
      <div class="top-r"></div>
      <div class="mid-l">
        <button type="button" class="btn ${ App.actions.swipe } ${ App.actions.swipe }-l js-${ App.actions.swipe }-btn" id="${ App.actions.swipe }-left" value="left"></button>
      </div>
      <div class="mid-m js-board-container">
        <${ Board.tagName } class="${ Board.classList.join(' ') }" size="${ size }"></${ Board.tagName }>
      </div>
      <div class="mid-r">
        <button type="button" class="btn ${ App.actions.swipe } ${ App.actions.swipe }-r js-${ App.actions.swipe }-btn" id="${ App.actions.swipe }-right" value="right"></button>
      </div>
      <div class="bot-l"></div>
      <div class="bot-m">
        <button type="button" class="btn ${ App.actions.swipe } ${ App.actions.swipe }-d js-${ App.actions.swipe }-btn" id="${ App.actions.swipe }-down" value="down"></button>
      </div>
      <div class="bot-r"></div>
      </section>
      <footer>
        <button type="button" id="${ App.actions.reset }" class="btn ${ App.actions.reset } js-${ App.actions.reset }-btn">Reset</button>
        <button type="button" id="${ App.actions.end }" class="btn ${ App.actions.end } js-${ App.actions.end }-btn">End</button>
      </footer>
      <${ CustomModal.tagName } class="${CustomModal.classList.join(' ')} ${ STYLES.HIDE_CLASS }"
        ${ Object.entries(CustomModal.htmlAttributes).reduce((acc, [attr, value]) => `${acc} ${ attr }="${ value }"`, '') }
        heading="You fucking lost, idiot." 
        description="Maybe don't suck so much? ¯\\(ツ)/¯"
      >
        <button type="button" id="${ App.actions.reset }" class="btn ${ App.actions.reset } js-${ App.actions.reset }-btn">Start Over</button>
      </${ CustomModal.tagName }>
    `;
  }

  connectedCallback () {
    this._addListeners();
  }

  _addListeners () {
    this._onSwipe = this._onSwipe.bind(this);
    this._onReset = this._onReset.bind(this);
    this._onLose = this._onLose.bind(this);
    this._onEnd = this._onEnd.bind(this);

    this.swipeBtnEls.forEach(el => el.addEventListener('click', this._onSwipe));
    this.resetEls.forEach(el => el.addEventListener('click', this._onReset));
    this.endEl.addEventListener('click', this._onEnd);
    this.addEventListener(BoardEvents.LOSE, this._onLose);
  }

  _onEnd (evt) {
    evt.stopPropagation();
    const endEvt = this.constructor.makeEvent(EVENTS.END);
    this.boardEl.dispatchEvent(endEvt);
  }

  _onLose (evt) {
    evt.stopPropagation();
    const openModalEvt = this.constructor.makeEvent(CustomModalEvents.TOGGLE, { detail: { message: CustomModalEvents.OPEN } })
    this.modalEl.dispatchEvent(openModalEvt);
  }

  _onSwipe (evt) {
    evt.preventDefault();
    // determine direction
    const direction = evt.currentTarget.value
    // dispatch event
    const swipeEvt = this.constructor.makeEvent(BoardEvents.SWIPE, { detail: { direction } });
    this.boardEl.dispatchEvent(swipeEvt);
  }

  _onReset (evt) {
    evt.preventDefault();
    const resetEvt = this.constructor.makeEvent(BoardEvents.RESET);
    this.boardEl.dispatchEvent(resetEvt);
  }
}