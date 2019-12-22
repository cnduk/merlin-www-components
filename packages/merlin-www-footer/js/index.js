export default {
  addOneTrust: function() {
    console.log('onetrust');
    var elItem = document.createElement('li');
    elItem.className = 'c-footer__list-item';
    var elTextLink = document.createElement('a');
    elTextLink.innerHTML = 'Cookie preferences';
    elTextLink.href = '#';
    elTextLink.addEventListener('click', function(e) {
      e.preventDefault();
      Optanon.ToggleInfoDisplay();
      return false;
    });
    elItem.appendChild(elTextLink);
    var elCopyright = document.querySelector('.c-footer__list-item--copyright');
    elCopyright.parentNode.insertBefore(elItem, elCopyright);
  }
};
