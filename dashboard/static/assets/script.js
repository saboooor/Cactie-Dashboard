document.addEventListener('DOMContentLoaded', () => {
	const a = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
	a.forEach(b => {
		b.addEventListener('click', () => {
			const c = b.dataset.target;
			const d = document.getElementById(c);
			b.classList.toggle('is-active');
			d.classList.toggle('is-active');
		});
	});
});

// Functions to open and close a modal
function openModal(element, options) {
	if (options && options.channel) document.getElementsByName('channel')[0].value = options.channel;
	if (options && options.message) document.getElementsByName('message')[0].value = options.message;
	element.classList.add('is-active');
}

function closeModal(element) { element.classList.remove('is-active'); }

// Add a click event on various child elements to close the parent modal
document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button').forEach($close => {
	const $target = $close.closest('.modal');

	$close.addEventListener('click', () => {
		closeModal($target);
	});
});