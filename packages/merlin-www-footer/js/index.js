export default {
  addOneTrust: function() {
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
    var elCookiePrivacy = document.querySelector(
      '.c-footer__list-item:nth-child(3)'
    );
    elCookiePrivacy.parentNode.insertBefore(elItem, elCookiePrivacy);
  }
};
