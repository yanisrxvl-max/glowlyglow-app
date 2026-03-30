/* SHARING / NATIVE */

function getShareText() {
      var prenom = document.getElementById('sharePrenom') ? document.getElementById('sharePrenom').value : '';
      prenom = prenom.trim();
      var greeting = prenom ? 'Coucou ' + prenom + ' !\n\n' : '';
      var text = greeting + 'Voici ta recommandation GlowlyGlow \u2728 :\n\n';

      var heroName = document.querySelector('.hero-name') ? document.querySelector('.hero-name').textContent : '';
      heroName = heroName.replace('\u2b50 ', '').trim(); // Remove the star emoji if any
      text += '\u2b50 Ta priorit\u00e9 absolue :\n' + heroName + '\n\n';

      var items = document.querySelectorAll('.cart-item span:first-child');
      if (items.length > 1) {
        text += '\ud83e\uddf0 Ta routine compl\u00e8te :\n';
        items.forEach(function (el) { text += '- ' + el.textContent.trim() + '\n'; });
      }
      return text;
    }

function copyRoutine() {
      var text = getShareText();
      navigator.clipboard.writeText(text).then(function () {
        showToast('\u2714\ufe0f Copi\u00e9 !');
      }).catch(function () {
        showToast('\u274c Erreur copie');
      });
    }

function shareRoutine() {
      var text = getShareText();
      if (navigator.share) {
        navigator.share({
          title: 'Ta routine GlowlyGlow',
          text: text
        }).catch(function () { });
      } else {
        var url = 'https://wa.me/?text=' + encodeURIComponent(text);
        window.open(url, '_blank');
      }
    }

function showToast(msg) {
      let toast = document.getElementById('toastOk');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastOk';
        toast.className = 'toast-ok';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 2000);
    }

