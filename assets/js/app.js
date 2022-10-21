(function($) {
	let fireworks, quoteIndex, quote;

	function initFireworks(withSoundEffect = false) {
		let container = document.querySelector('.page-background');

		if (fireworks) {
			fireworks.stop();

			container.innerHTML = '';
		}

		let options = {};

		if (withSoundEffect) {
			options['sound'] = {
				'enabled': true,
				'files': [
					'assets/music/explosion0.mp3', 'assets/music/explosion1.mp3', 'assets/music/explosion2.mp3'
				],
			};
		}

		fireworks = new Fireworks(container, options);

		fireworks.start();
	}

	function showRandomQuote() {
		try {
			let reqParams = new URLSearchParams(location.search);

			if (reqParams.has('quote')) {
				quoteIndex = parseInt(reqParams.get('quote'));
			}
		} catch(err) {
			console.error(err);

			quoteIndex = -1;
		}

		fetch('diwali-quotes.json')
			.then(res => res.json())
			.then(quotesList => {
				if (quotesList && Array.isArray(quotesList) && quotesList.length > 0) {
					if (!(quoteIndex && quoteIndex > -1 && quoteIndex < quotesList.length)) {
						quoteIndex = Math.floor(Math.random() * quotesList.length);
					}

					if (quoteIndex < quotesList.length) {
						quote = quotesList[quoteIndex];

						if (quote) {
							$('#diwaliQuote').html(`<em>${quote}</em>`);
							$('#diwaliQuote').closest('.columns').removeClass('is-hidden');
						}
					}
				}
			})
			.catch(err => { console.error(err) });
	}

	$(document).ready(function() {
		initFireworks();

		showRandomQuote();
	});

	$(document).on('click', '#btnToggleFireworkSound', function(e) {
		e.preventDefault();
		e.stopPropagation();

		if ($(this).prop('fireworkSoundEnabled')) {
			initFireworks(false);
			$(this).prop('fireworkSoundEnabled', false);
			$(this).children('.when-muted').removeClass('is-hidden');
			$(this).children('.when-unmuted').addClass('is-hidden');
		} else {
			initFireworks(true);
			$(this).prop('fireworkSoundEnabled', true);
			$(this).children('.when-unmuted').removeClass('is-hidden');
			$(this).children('.when-muted').addClass('is-hidden');
		}
	});

	$(document).on('click', '#btnShareDiwaliQuote', function(e) {
		e.preventDefault();
		e.stopPropagation();

		if (quoteIndex && quoteIndex > -1 && !$(this).hasClass('copying')) {
			let copyText = location.href.replace(location.search, '') + `?quote=${quoteIndex}`;

			if (navigator.clipboard) {
				$(this).addClass('copying');

				navigator.clipboard.writeText(copyText).then(() => {
					$(this).children('.before-copy').addClass('is-hidden');
					$(this).children('.after-copied').removeClass('is-hidden');

					setTimeout(() => {
						$(this).children('.after-copied').addClass('is-hidden');
						$(this).children('.before-copy').removeClass('is-hidden');

						$(this).removeClass('copying');
					}, 5000);
				});
			}
		}
	});

}) (jQuery);