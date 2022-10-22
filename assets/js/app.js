(function($) {
	const MAX_USERNAME_LENGTH = 30, docTitle = 'Happy Diwali';
	let fireworks, quoteIndex, quote, reqParams;

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

		$('.show-after-firework-init').removeClass('is-hidden');
	}

	function showRandomQuote() {
		try {
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

	function wishFriend() {
		if (reqParams.has('wishFrom')) {
			let wishFrom = reqParams.get('wishFrom');

			try {
				// Check if name is base64 encoded
				if (wishFrom === btoa(atob(wishFrom))) {
					wishFrom = atob(reqParams.get('wishFrom'));
				}
			} catch(err) {
				console.error(err);
			}

			if (wishFrom && typeof(wishFrom) == 'string' && wishFrom.replace(/\s/g, '').length > 0) {
				$('#wishingFriend > #wishingFriend-name').html(wishFrom);
				$('#wishingFriend > .default-wish').addClass('is-hidden');
				$('#wishingFriend > .wishing-friend').removeClass('is-hidden');

				document.title = docTitle + ' | Wish from: ' + wishFrom;

				return true;
			}
		}

		return false;
	}

	function frameShareLinkParam(wishFrom = false) {
		let param = '';

		if (wishFrom && wishFrom.replace(/\s/g, '').length > 0) {
			param = `wishFrom=${ btoa(wishFrom) }`;
		}

		if (quoteIndex && quoteIndex > -1) {
			param += (param.length > 0 ? '&' : '');
			param += `quote=${quoteIndex}`;
		}

		return param;
	}

	function onCopyLinkBtnClicked(btn, wishFrom = false) {
		if (!btn.hasClass('copying')) {
			let linkParams = frameShareLinkParam(wishFrom);

			if (linkParams) {
				let copyText = location.href.replace(location.search, '') + `?${linkParams}`;

				if (copyText && navigator.clipboard) {
					btn.addClass('copying');

					navigator.clipboard.writeText(copyText).then(() => {
						btn.children('.before-copy').addClass('is-hidden');
						btn.children('.after-copied').removeClass('is-hidden');

						setTimeout(() => {
							btn.children('.after-copied').addClass('is-hidden');
							btn.children('.before-copy').removeClass('is-hidden');

							btn.removeClass('copying');
						}, 5000);
					});
				}
			}
		}
	}

	$(document).ready(function() {
		reqParams = new URLSearchParams(location.search);

		let gotWishFromFriend = wishFriend();

		showRandomQuote();

		if (gotWishFromFriend) {
			setTimeout(() => {
				initFireworks();

				$('#wishingFriend > .wishing-friend-giftbox').addClass('is-hidden');

				$('body').removeClass('is-clipped');
			}, 3500);
		} else {
			initFireworks();

			$('body').removeClass('is-clipped');
		}
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

		onCopyLinkBtnClicked($(this));
	});

	$(document).on('click', '#btnWishFriend', function(e) {
		e.preventDefault();
		e.stopPropagation();

		let username = $('#txtUsername').val();

		if (username && username.replace(/\s/g, '').length > 0) {
			username = username.substr(0, MAX_USERNAME_LENGTH);

			if (username.length > 0) {
				onCopyLinkBtnClicked( $(this), username );

				$('#txtUsername').val('');
			}
		}
	});

	$(document).on('keyup', '#txtUsername', function(e) {
		$(this).val(($(this).val() || '').substr(0, MAX_USERNAME_LENGTH));
	});

	$(document).on('keypress', '#txtUsername', function(e) {
		if (e.which == 13) {
			$('#btnWishFriend').click();
		}
	});

	$(document).on('click', '#btnTakeScreenshot', function(e) {
		e.preventDefault();
		e.stopPropagation();

		if (!$('body').hasClass('capturing-screen')) {
			$('body').addClass('capturing-screen');

			$('#capturedImageContainer').html('');

			let initialFireworksBoundariesParam = fireworks.boundaries.height;
			let heightForCapture = $('body')[0].clientHeight;

			// To Capture the background fireworks, set page content height to background
			$('body > .page-background').css({
				'height': heightForCapture,
			});

			fireworks.setOptions({
				'boundaries': $.extend({}, fireworks.boundaries, {
					'height': heightForCapture,
				}),
			});

			$(window).scrollTop(0);

			try {
				html2canvas(document.body)
					.then(canvas => {
						$('#capturedImageContainer').append(canvas);
						return canvas;
					})
					.then(canvas => {
						const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
						$('#capturedImageContainer').append(`<a href="${image}" download="Happy-Diwali-Screenshot.png" id="btnDownloadCapturedImage">Download</a>`);

						$('#capturedImageContainer > #btnDownloadCapturedImage')[0].click();

						// Reset background height
						$('body > .page-background').css({
							'height': 'auto',
						});

						fireworks.setOptions({ 'boundaries': initialFireworksBoundariesParam });

						$('body').removeClass('capturing-screen');
					});
			} catch(err) {
				console.error(err);

				// Reset background height
				$('body > .page-background').css({
					'height': 'auto',
				});

				fireworks.setOptions({ 'boundaries': initialFireworksBoundariesParam });

				$('body').removeClass('capturing-screen');
			}
		}
	});

}) (jQuery);