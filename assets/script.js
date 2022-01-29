


function main() {

	let game = main;
	game.playing = false;
	game.shiftState = false;
	game.shiftState1 = false;

	game.fasttrack = false;

	game.eTargetText = document.getElementById('target-text');
	game.eSourceText = document.getElementById('source-text');

	document.body.onkeydown = (e) => {
		// console.log(e);
		if (e.key == "Shift") {
			game.shiftState = true;
			game.shiftState1 = true;
		}
		if (e.key == " ") {
			game.shiftState = true;
			game.shiftState1 = true;
		}
		if (e.key == "f") {
			game.fasttrack = !game.fasttrack;
		}
	};
	document.body.onkeyup = (e) => {
		// console.log(e);
		if (e.key == "Shift") {
			game.shiftState = false;
		}
		if (e.key == " ") {
			game.shiftState = false;
		}
	};


	let pages = [`Es war Piemontkirschenzeit und der Tag begann mit Krönung Light. Auch im Hause von Kaiser, wo sich die böse Stiefmutter mal wieder in ihrem Cholesterinspiegel überprüfte. Dieser sprach zu ihr: 'Du besitzt zwar immer noch die Kraft der zwei Herzen, aber Schneekoppewittchen hat dafür das volle Verwöhnaroma!`,
				 `Das ärgerte die Stiefmutter ganz gewaltig und sie beschloss, einen Jägermeister auszusenden, um Schneekoppewittchen zu beseitigen. Dieser ging mit Schneekoppewittchen in den Wald, damit ihn die Kräuterpolizei nicht ertappen konnte.`,
				 `Dort richtete er seinen Danone auf Schneekoppewittchen, um ihr die Kugel zu geben. Allerdings erwies sich der Jägermeister als kleiner Feigling. Denn er hatte nicht den nötigen Mumm um sie zu erschießen. Das war ja schließlich auch nicht die feine Englische Art. Also sagte Schneekoppewittchen: 'Merci!' und rannte zu den sieben Bergen in das Haus der sieben Fruchtzwerge. Die Fruchtzwerge waren aber gerade in ihrem Bergwerk in Villabajo, um Goldbären und Megaperls abzubauen.`];


	const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Z', 'Y', 'Ä', 'Ö', 'Ü'];
    function classifyMajuskels(text) {
    	for (const c of letters) {
    		text = text.replaceAll(c, `[${c}]`)
    	}
		text = text.replaceAll(`[`, `<span class="maj">`)
		text = text.replaceAll(`]`, `</span>`)
    	return text;
    }


	function start_game() {
		game.playing = true;
		game.currWaitTime = 400;
		if (game.fasttrack) {
			game.currWaitTime = 10;
		}

		game.pageIndex = 0;
		open_page();
	}


	function open_page() {
		if (pages[game.pageIndex] === undefined) {
			game.playing = false;
			return;
		}
		game.eSourceText.innerHTML = classifyMajuskels(pages[game.pageIndex]);
		game.nextLetterIndex = 0;
		game.shiftState1 = true;
		game.eTargetText.innerHTML = "";
		let pageDelay = 2000;
		if (game.fasttrack) {
			pageDelay = 200;
		}
		window.setTimeout(next_char, game.currWaitTime + pageDelay);
	}

	function next_char() {
		if (!game.playing) {
			return;
		}
		let next = pages[game.pageIndex][game.nextLetterIndex];
		game.nextLetterIndex += 1;
		if (next === undefined) {
			game.pageIndex += 1;
			open_page();
			return;
		}
		let content;
		if (next.trim().length > 0 && (game.shiftState || game.shiftState1)) {
			next = next.toUpperCase();
			game.shiftState1 = false;
		} else {
			next = next.toLowerCase();
		}
		if (next.toLowerCase() != next) { // Upper
			content = document.createElement('span');
			content.innerText = next;
			content.setAttribute('class', 'maj')
		} else {
			content = document.createTextNode(next);
		}
		game.eTargetText.appendChild(content);

		if (game.currWaitTime > 150) {
			game.currWaitTime *= 0.96;
		} else {
			game.currWaitTime = 150;
		}

		// A bit of extra time before an uppercase letter.
		let extra = 0;
		next = pages[game.pageIndex][game.nextLetterIndex];
		if (next != undefined && next.toLowerCase() != next) { // Upper
			extra = 200;
		}
		if (game.fasttrack) {
			extra = 0;
			game.currWaitTime = 30;
		}
		window.setTimeout(next_char, game.currWaitTime + extra);
	}

	start_game();
}

main();