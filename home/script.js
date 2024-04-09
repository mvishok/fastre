const AnimateOnScroll = function ({ offset } = { offset: 10 }) {

  const windowTop = offset * window.innerHeight / 100;
  const windowBottom = window.innerHeight - windowTop;
  const windowLeft = 0;
  const windowRight = window.innerWidth;

  this.start = element => {
    window.requestAnimationFrame(() => {

      element.style.animationDelay = element.dataset.animationDelay;
      element.style.animationDuration = element.dataset.animationDuration;


      element.classList.add(element.dataset.animation);

 
      element.dataset.animated = "true";
    });
  };

  this.inViewport = element => {
    
    const elementRect = element.getBoundingClientRect();
    const elementTop =
    elementRect.top + parseInt(element.dataset.animationOffset) ||
    elementRect.top;
    const elementBottom =
    elementRect.bottom - parseInt(element.dataset.animationOffset) ||
    elementRect.bottom;
    const elementLeft = elementRect.left;
    const elementRight = elementRect.right;


    return (
      elementTop <= windowBottom &&
      elementBottom >= windowTop &&
      elementLeft <= windowRight &&
      elementRight >= windowLeft);

  };


  this.verifyElementsInViewport = (els = elements) => {
    for (let i = 0, len = els.length; i < len; i++) {

      if (els[i].dataset.animated) continue;

      this.inViewport(els[i]) && this.start(els[i]);
    }
  };


  this.getElements = () =>
  document.querySelectorAll("[data-animation]:not([data-animated])");


  this.update = () => {
    elements = this.getElements();
    elements && this.verifyElementsInViewport(elements);
  };


  window.addEventListener("load", this.update, false);
  window.addEventListener(
  "scroll",
  () => this.verifyElementsInViewport(elements),
  { passive: true });

  window.addEventListener(
  "resize",
  () => this.verifyElementsInViewport(elements),
  { passive: true });

};

// Initialize
const options = {
  offset: 15 // percentage of the window
};

const animation = new AnimateOnScroll(options);

setTimeout(() => {
  const arrows = document.getElementById('arrows');
  arrows.style.display = 'block';
}, 2200);

var btnDownload = document.getElementById("btn-download");

btnDownload.addEventListener("click", function() {
  if (btnDownload.classList.contains("downloaded")) {
    btnDownload.classList.remove("downloaded");
  } else {
    btnDownload.classList.add("downloaded");
  }
});
