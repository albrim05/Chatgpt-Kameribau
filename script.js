document.getElementById('inquiry').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = `Projektanfrage: ${data.get('service')} in ${data.get('place')}`;
  const body = `Guten Tag Kameri,\n\nich interessiere mich für ${data.get('service')}.\n\nProjektort: ${data.get('place')}\n\n${data.get('message')}\n\nName: ${data.get('name')}\nE-Mail: ${data.get('email')}\n`;
  document.getElementById('form-status').textContent = 'Bitte senden Sie die vorbereitete Anfrage in Ihrem E-Mail-Programm ab. Falls es sich nicht öffnet, schreiben Sie direkt an kameribau@hotmail.com oder rufen Sie uns an.';
  window.location.href = `mailto:kameribau@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
