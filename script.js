function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


var observing = false;
var update = false;

var song = {
	title: undefined,
	artist: undefined,
	lyrics: []
};
var scrollTimer;

// OnLoad
var oldHref = document.location.href;
window.onload = async () => {
	if (window.location.href == "https://open.spotify.com/lyrics") {
		if (!update) {
			console.log("1/1 url match");
			update = true;
			lyricsLoader();

			setTimeout(() => { update = false }, 5000);
		};
	} else {
		console.log("2/1 loading lyrics");
	
		const data = await songInfo();
		const titleDIV = data[0];
		const artists = data[1];
	
		if (song.title !== titleDIV.innerHTML || song.artist !== artists.innerHTML) {
			await fetchLyrics(titleDIV, artists);
		};
	};

    const observerReload = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (oldHref != document.location.href) {
                oldHref = document.location.href;

				setTimeout(async () => {
					if (window.location.href == "https://open.spotify.com/lyrics") {
						if (!update) {
							console.log("1/2 url match");
							update = true;
							lyricsLoader();

							setTimeout(() => { update = false }, 5000);
						};
					} else {
						console.log("2/1 loading lyrics");

						const data = await songInfo();
						const titleDIV = data[0];
						const artists = data[1];
					
						if (song.title !== titleDIV.innerHTML || song.artist !== artists.innerHTML) {
							await fetchLyrics(titleDIV, artists);
						};
					};
				}, 1000);
            };
        });
    });

    observerReload.observe(document.body, { subtree: true, childList: true });
};

// Lyrics
async function lyricsLoader() {
	deleteDIVs();

	console.log("2/1 loading lyrics");

	observerNpSong();

	const data = await songInfo();
	const titleDIV = data[0];
	const artists = data[1];

	if (song.title !== titleDIV.innerHTML || song.artist !== artists.innerHTML) {
		await fetchLyrics(titleDIV, artists);
		displayLyrics();
	} else {
		console.log("3 lyrics saved");

		displayLyrics();
	};
};

function deleteDIVs() {
	const div1 = document.querySelector("div.O7ooKKJG0MArEwDgD6IV");
		if (div1) { div1.style.display = "none" } else { return setTimeout(() => { deleteDIVs() }, 100) };
	const div2 = document.querySelector("div.hS_lrRHiW4BSWL8WcE8Q");
		if (div2) { div2.style.display = "none" } else { return setTimeout(() => { deleteDIVs() }, 100) };
	const div3 = document.querySelector("div._Wna90no0o0dta47Heiw");
		if (div3) { div3.style.setProperty('--lyrics-color-background', "transparent") } else { return setTimeout(() => { deleteDIVs() }, 100) };

	return;
};

async function observerNpSong() {
	const observerUpdate = new MutationObserver((mutationsList, observer) => {
		for(const mutation of mutationsList) {
			if (mutation.type === "childList") {
				if (!update) {
					console.log("1/3 url match");
					update = true;
					lyricsLoader();

					setTimeout(() => { update = false }, 5000);
				};
			};
		};
	});
	let npSong = document.querySelector("div.deomraqfhIAoSB3SgXpu");
		while (npSong === null) {
			await delay(100);

			npSong = document.querySelector("div.deomraqfhIAoSB3SgXpu");
				if (npSong && !observing) {
					observing = true;
					observerUpdate.observe(npSong, { subtree: true, childList: true });
				};
		};
		if (npSong && !observing) {
			observing = true;
			observerUpdate.observe(npSong, { subtree: true, childList: true });
		};
	
	return;
};

async function songInfo() {
	console.log("2/2 get data");

	let titleDIV = document.querySelector('a[data-testid="context-item-link"]');
		while (titleDIV === null) {
			await delay(100);

			titleDIV = document.querySelector('a[data-testid="context-item-link"]');
		};

	let artists = document.querySelector('a[data-testid="context-item-info-artist"]');
		while (artists === null) {
			await delay(100);

			artists = document.querySelector('a[data-testid="context-item-info-artist"]');
		};
	
	return [titleDIV, artists];
};

async function fetchLyrics(titleDIV, artists) {
	let title = titleDIV.innerText;
		if (title.includes("(")) { title = title.split("(")[0] };
		if (title.includes(")")) { title = title.split(")")[0] };
		if (title.includes("-")) { title = title.split("-")[0] };

	const searchResponse = await fetch(`http://localhost:2424/lyrics?q=${encodeURIComponent(title + ' ' + artists.innerText)}`);
		if (!searchResponse.ok) { return console.error("Search request failed:", await searchResponse.text()); };

	console.log("3 lyrics recived", title + ' ' + artists.innerText);

	const songData = await searchResponse.json();
		if (songData.status == 204 || !songData.lyrics) { return console.log("No lyrics found", title + ' ' + artists.innerText); };
	const lyrics = songData.lyrics.split('\n');

	const filteredParagraphs = lyrics.filter(paragraph => { return !/\[.*?\]/.test(paragraph) });

	filteredParagraphs.push("");
	filteredParagraphs.push("");
	filteredParagraphs.push("");
	filteredParagraphs.push("");

	song = {
		title: titleDIV.innerHTML,
		artist: artists.innerHTML,
		lyrics: filteredParagraphs
	};

	return;
};

function displayLyrics() {
	console.log("4 test 1");

	let divLyrics = document.querySelector("div._Wna90no0o0dta47Heiw");
		if (document.querySelectorAll("div._Wna90no0o0dta47Heiw").length > 1) {
			console.log("4/1 remove 2 lyrics div");

			document.querySelectorAll("div._Wna90no0o0dta47Heiw")[1].parentElement.remove();
		};
		if (!divLyrics) {
			divLyrics = document.createElement("div");
			divLyrics.setAttribute("class", "_Wna90no0o0dta47Heiw");

			const parent = document.createElement("div");
			parent.setAttribute("class", "gqaWFmQeKNYnYD5gRv3x");
			parent.appendChild(divLyrics);

			const parentP = document.querySelector("div.FUYNhisXTCmbzt9IDxnT");
				if (!parentP) { return };
				parentP.appendChild(parent);

			let noLyricDiv = document.querySelector("div.e7eFLioNSG5PAi1qVFT4");
				if (noLyricDiv) { noLyricDiv.style.display = "none" };

			console.log("4/2 create lyrics div");
		};

		// if (divLyrics.children.length > song.lyrics.length) {
		// 	while (divLyrics.children.length > song.lyrics.length) {
		// 		console.log("4/3 remove children a more");

		// 		divLyrics.children[divLyrics.children.length - 1].remove();
		// 	};
		// };

		if (divLyrics.children.length > song.lyrics.length) {
			for (let i = song.lyrics.length; i < divLyrics.children.length; i++) {
				console.log("4/3 hiding extra lyric lines");
				divLyrics.children[i].style.display = 'none';
			};
		} else {
			for (let i = 0; i < divLyrics.children.length; i++) {
				divLyrics.children[i].style.display = '';
			};
		};

	console.log("5 test 2");

	for (let i = 0; i < song.lyrics.length; i++) {
		let paragraph = song.lyrics[i];
			if (paragraph == "") { paragraph = "⠀" };

		if (divLyrics.children.length > i) {
			divLyrics.children[i].children[0].innerHTML = paragraph;

			console.log("6 edit lyric", song.lyrics.length);
		} else {
			const divP = document.createElement("div");
			divP.setAttribute("dir", "auto");
			divP.setAttribute("class", "nw6rbs8R08fpPn7RWW2w SruqsAzX8rUtY2isUZDF");
			divP.setAttribute("data-testid", "fullscreen-lyric");
			const divPC = document.createElement("div");
			divPC.setAttribute("class", "BXlQFspJp_jq9SKhUSP3");
			divPC.innerHTML = paragraph;

				divP.appendChild(divPC);

			divLyrics.appendChild(divP);

			console.log("7 create lyric", song.lyrics.length);
		};
	};

	divLyrics.children[0].scrollIntoView({ behavior: "smooth", block: "center" });

	let noLyricDiv = document.querySelector("div.e7eFLioNSG5PAi1qVFT4");
		if (noLyricDiv) { noLyricDiv.style.display = "none" };

	autoScrollLyrics(divLyrics);

	return;
};

function autoScrollLyrics(divLyrics) {
	clearInterval(scrollTimer);

	const divDur = document.querySelector("div.encore-text.encore-text-marginal.encore-internal-color-text-subdued.kQqIrFPM5PjMWb5qUS56");
		if (!divDur) { return };

	const currentTime = divDur.getAttribute("data-test-position") / 1000;
	const duration = Number(divDur.innerHTML.split(":")[0]) * 60 + Number(divDur.innerHTML.split(":")[1]);
	const totalLines = divLyrics.children.length;
	const progress = currentTime / duration;
    const lineIndex = Math.floor(progress * totalLines) - 1;

    if (lineIndex >= 0 && lineIndex < totalLines) {
		divLyrics.children[lineIndex].scrollIntoView({ behavior: "smooth", block: "center" });
		divLyrics.children[lineIndex].classList.add("sl-autoScrollLyrics");
			if (divLyrics.children[lineIndex - 1]) {
				divLyrics.children[lineIndex - 1].classList.remove("sl-autoScrollLyrics");
			};

		// if (isLyricLineVisible(divLyrics)) {
		// 	divLyrics.children[lineIndex].scrollIntoView({ behavior: "smooth", block: "center" });
		// };
    };

	return scrollTimer = setInterval(() => {
		autoScrollLyrics(divLyrics)
	}, 1000);
};

function isLyricLineVisible(divLyrics) {
	const currentLyric = divLyrics.querySelector(".sl-autoScrollLyrics");
		if (currentLyric) {
			const rect = currentLyric.getBoundingClientRect();
			return ( rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) );
		};

    return false;
};