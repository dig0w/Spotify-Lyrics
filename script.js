function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const mainUrl = 'https://open.spotify.com/lyrics';
const fetchUrl = 'http://localhost:2024/lyrics?q=';

const nowPlayingWidget = '[data-testid="now-playing-widget"]';
const npTitle = '[data-testid="context-item-link"]';
const npArtist = '[data-testid="context-item-info-artist"]';
const lyricsContainer = 'div._Wna90no0o0dta47Heiw';
const lcParent = 'div.FUYNhisXTCmbzt9IDxnT';
const noLyricsContainer = 'div.e7eFLioNSG5PAi1qVFT4';
const durationContainer = '[data-testid="playback-duration"]';
const lyricsButton = '[data-testid="lyrics-button"]';

var song = {
	title: undefined,
	artist: undefined,
	lyrics: []
};
var scrollTimer;
var index = 0;

var observing = false;
var update = false;

// OnLoad
var oldUrl = document.location.href;
window.onload = async () => {
	if (window.location.href == mainUrl) {
		if (!update) {
			console.log("1/1 url match");
			update = true;
			lyricsLoader();

			setTimeout(() => { update = false }, 5000);
		};
	} else {
		loadButton();

		console.log("2/1 loading lyrics");
	
		const data = await songInfo();
		const titleContainer = data[0];
		const artistsContainer = data[1];
	
		if (song.title !== titleContainer.innerHTML || song.artist !== artistsContainer.innerHTML) {
			await fetchLyrics(titleContainer, artistsContainer);
		};
	};

	observerNpSong();

    const observerReload = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (oldUrl != document.location.href) {
                oldUrl = document.location.href;

				setTimeout(async () => {
					if (window.location.href == mainUrl) {
						if (!update) {
							console.log("1/2 url match");
							update = true;
							lyricsLoader();

							setTimeout(() => { update = false }, 5000);
						};
					} else {
						console.log("2/1 loading lyrics");

						const data = await songInfo();
						const titleContainer = data[0];
						const artistsContainer = data[1];

						if (song.title !== titleContainer.innerHTML || song.artist !== artistsContainer.innerHTML) {
							await fetchLyrics(titleContainer, artistsContainer);
						};
					};
				}, 1000);
            };
        });
    });

    observerReload.observe(document.body, { subtree: true, childList: true });
};

// Observe Now Playing Song
async function observerNpSong() {
	const observerUpdate = new MutationObserver(async (mutationsList, observer) => {
		for(const mutation of mutationsList) {
			if (mutation.type === "childList") {
				if (window.location.href == mainUrl) {
					if (!update) {
						console.log("1/3 url match");
						update = true;
						lyricsLoader();

						setTimeout(() => { update = false }, 5000);
					};
				} else {
					loadButton();

					console.log("2/1 loading lyrics");

					const data = await songInfo();
					const titleContainer = data[0];
					const artistsContainer = data[1];

					if (song.title !== titleContainer.innerHTML || song.artist !== artistsContainer.innerHTML) {
						await fetchLyrics(titleContainer, artistsContainer);
					};
				};
			};
		};
	});
	let npSong = document.querySelector(nowPlayingWidget);
		while (npSong === null) {
			await delay(100);

			npSong = document.querySelector(nowPlayingWidget);
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

// Load Lyrics
async function lyricsLoader() {
	console.log("2/1 loading lyrics");

	const data = await songInfo();
	const titleContainer = data[0];
	const artistsContainer = data[1];

	if (song.title !== titleContainer.innerHTML || song.artist !== artistsContainer.innerHTML) {
		await fetchLyrics(titleContainer, artistsContainer);
		displayLyrics();
	} else {
		console.log("3 lyrics saved");

		displayLyrics();
	};
};

// Get Song Info
async function songInfo() {
	console.log("2/2 get data");

	let titleContainer = document.querySelector(npTitle);
		while (titleContainer === null) {
			await delay(100);

			titleContainer = document.querySelector(npTitle);
		};

	let artistsContainer = document.querySelector(npArtist);
		while (artistsContainer === null) {
			await delay(100);

			artistsContainer = document.querySelector(npArtist);
		};
	
	return [titleContainer, artistsContainer];
};

// Get Lyrics
async function fetchLyrics(titleContainer, artistsContainer) {
	let title = titleContainer.innerText;
		if (title.includes("(")) { title = title.split("(")[0] };
		if (title.includes(")")) { title = title.split(")")[0] };
		if (title.includes("-")) { title = title.split("-")[0] };

	const searchResponse = await fetch(`${fetchUrl}${encodeURIComponent(title + ' ' + artistsContainer.innerText)}`);
		if (!searchResponse.ok) { return console.error("Search request failed:", await searchResponse.text()); };

	console.log("3 lyrics recived", title + " " + artistsContainer.innerText);

	let lyrics = [];

	const songData = await searchResponse.json();
		if (songData.status == 204 || !songData.lyrics) {
			const noLyrics = ["You'll have to guess the lyrics for this one.", "Looks like we don't have the lyrics for this song.", "You caught us, we're still working on getting lyrics for this one.", "Hmm. We don't know the lyrics for this one."];

			lyrics.push("");
			lyrics.push("");
			lyrics.push("");
			lyrics.push("");
			lyrics.push(noLyrics[Math.floor(Math.random() * noLyrics.length)]);

			console.log("No lyrics found", title + " " + artistsContainer.innerText);
		} else {
			lyrics = songData.lyrics.split("\n");
		};

	const filteredParagraphs = lyrics.filter(paragraph => { return !/\[.*?\]/.test(paragraph) });

	filteredParagraphs.push("");
	filteredParagraphs.push("");

	song = {
		title: titleContainer.innerHTML,
		artist: artistsContainer.innerHTML,
		lyrics: filteredParagraphs
	};

	return;
};

// Show the Lyrics
async function displayLyrics() {
	console.log("4 test 1");

	let divLyrics = document.querySelector(lyricsContainer);

	await delay(100);

	if (document.querySelectorAll(lyricsContainer).length > 1) {
		console.log("4/1 remove 2 lyrics div");

		document.querySelectorAll(lyricsContainer)[1].parentElement.remove();
	};
	if (!divLyrics) {
		divLyrics = document.createElement("div");
		divLyrics.setAttribute("class", "_Wna90no0o0dta47Heiw");

		const parent = document.createElement("div");
		parent.setAttribute("class", "gqaWFmQeKNYnYD5gRv3x");
		parent.appendChild(divLyrics);

		const parentP = document.querySelector(lcParent);
			if (!parentP) { return };
			parentP.appendChild(parent);

		console.log("4/2 create lyrics div");
	};

	const noLyricDiv = document.querySelector(noLyricsContainer);
	if (noLyricDiv) {
		noLyricDiv.style.display = "none";

		if (divLyrics.children.length > song.lyrics.length) {
			for (let i = song.lyrics.length; i < divLyrics.children.length; i++) {
				console.log("4/3 hiding extra lyric lines");
				divLyrics.children[i].style.display = "none";
			};
		} else {
			for (let i = 0; i < divLyrics.children.length; i++) {
				divLyrics.children[i].style.display = "";
			};
		};

		console.log("5 test 2");

		index = 0;

		for (let i = 0; i < song.lyrics.length; i++) {
			let paragraph = song.lyrics[i];
				if (paragraph == "") { paragraph = "⠀" };

			if (divLyrics.children.length > i) {
				const divPC = document.createElement("div");
				divPC.setAttribute("class", "BXlQFspJp_jq9SKhUSP3");
				divPC.innerHTML = paragraph;

				divLyrics.children[i].replaceChild(divPC, divLyrics.children[i].children[0]);

				divLyrics.children[i].removeAttribute("class");

				divLyrics.children[i].setAttribute("dir", "auto");
				// divLyrics.children[i].setAttribute("class", "nw6rbs8R08fpPn7RWW2w SruqsAzX8rUtY2isUZDF");
				divLyrics.children[i].setAttribute("class", "nw6rbs8R08fpPn7RWW2w vapgYYF2HMEeLJuOWGq5");
				divLyrics.children[i].setAttribute("data-testid", "fullscreen-lyric");

				console.log("6 edit lyric", song.lyrics.length);
			} else {
				const divP = document.createElement("div");
				divP.setAttribute("dir", "auto");
				// divP.setAttribute("class", "nw6rbs8R08fpPn7RWW2w SruqsAzX8rUtY2isUZDF");
				divP.setAttribute("class", "nw6rbs8R08fpPn7RWW2w vapgYYF2HMEeLJuOWGq5");
				divP.setAttribute("data-testid", "fullscreen-lyric");
				const divPC = document.createElement("div");
				divPC.setAttribute("class", "BXlQFspJp_jq9SKhUSP3");
				divPC.innerHTML = paragraph;

					divP.appendChild(divPC);

				divLyrics.appendChild(divP);

				console.log("7 create lyric", song.lyrics.length);
			};
		};

		const divProvider = document.createElement("div");
			divProvider.setAttribute("class", "LomBcMvfM8AEmZGquAdj");
		const pProvider = document.createElement("p");
			pProvider.setAttribute("class", "encore-text encore-text-body-small");
			pProvider.setAttribute("data-encore-id", "text");
			pProvider.setAttribute("dir", "auto");
			pProvider.innerHTML = "Lyrics provided by Genius";

			divProvider.appendChild(pProvider);
		divLyrics.appendChild(divProvider);

		divLyrics.children[0].scrollIntoView({ behavior: "smooth", block: "center" });

		autoScrollLyrics(divLyrics);

		return;
	} else {
		return console.log("7 Has Lyrics");
	};
};

// Auto Scroll the Lyrics
function autoScrollLyrics(divLyrics) {
	clearInterval(scrollTimer);

	const divDur = document.querySelector(durationContainer);
		if (!divDur) { return };

	const currentTime = divDur.getAttribute("data-test-position") / 1000;
	const duration = Number(divDur.innerHTML.split(":")[0]) * 60 + Number(divDur.innerHTML.split(":")[1]);
	let totalLines = 0;
		for (let i = 0; i < divLyrics.children.length; i++) {
			if (divLyrics.children[i].style.display != "none") {
				++totalLines;
			};
		};
	const progress = currentTime / duration;
    const lineIndex = Math.floor(progress * totalLines) - 1;

    if (lineIndex >= 0 && lineIndex < totalLines) {
		// divLyrics.children[lineIndex].scrollIntoView({ behavior: "smooth", block: "center" });
		divLyrics.children[lineIndex].classList.add("sl-autoScrollLyrics");
		divLyrics.children[lineIndex].classList.add("EhKgYshvOwpSrTv399Mw");
			if (divLyrics.children[lineIndex - 1]) {
				divLyrics.children[lineIndex - 1].classList.remove("sl-autoScrollLyrics");
			};

		if (isLyricLineVisible(divLyrics) || index == 0) {
			divLyrics.children[lineIndex].scrollIntoView({ behavior: "smooth", block: "center" });
		};

		index++;
    };


	// <div dir="auto" class="nw6rbs8R08fpPn7RWW2w vapgYYF2HMEeLJuOWGq5 EhKgYshvOwpSrTv399Mw" data-testid="fullscreen-lyric"></div>
	// <div dir="auto" class="nw6rbs8R08fpPn7RWW2w vapgYYF2HMEeLJuOWGq5" data-testid="fullscreen-lyric"></div>

	return scrollTimer = setInterval(() => {
		autoScrollLyrics(divLyrics)
	}, 1000);
};

// Check if current Lyric is Visible
function isLyricLineVisible(divLyrics) {
	const currentLyric = divLyrics.querySelector(".sl-autoScrollLyrics");
		if (currentLyric) {
			const rect = currentLyric.getBoundingClientRect();
			return ( rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) );
		};

    return false;
};

// Load Lyrics Button
function loadButton() {
	setTimeout(() => {
		console.log("load button");

		const lyricsbtn = document.querySelector(lyricsButton);

		if (lyricsbtn && lyricsbtn.disabled) {
			lyricsbtn.disabled = false;
			lyricsbtn.setAttribute("aria-label", "Lyrics");

			lyricsbtn.addEventListener("click", () => {
				return window.location.href = "/lyrics";
			});

			console.log("enabled button");
		} else if (!lyricsbtn) {
			console.log("no lyrics button")
			loadButton()
		};

		return;
	}, 1000);
};