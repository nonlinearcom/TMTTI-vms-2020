const ToggleButton = document.getElementById('toggle-panel');
const AboutCard = document.getElementById('about')

ToggleButton.addEventListener('click', (e) => {
	var toggle = AboutCard.classList.toggle('active');
	ToggleButton.setAttribute('aria-expanded', toggle)
	
});
