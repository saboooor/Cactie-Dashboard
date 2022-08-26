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

async function copy(text) {
	await navigator.clipboard.writeText(text).catch(() => alert('Failed to copy text!'));
	alert('Copied successfully!');
}