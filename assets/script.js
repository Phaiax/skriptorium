


function main() {

	let game = main;
	game.playing = false;
	game.play_state = false;
	game.shiftState = false;
	game.shiftState1 = false;

	game.fasttrack = false;

	game.eTargetText = document.getElementById('target-text');
	game.eSourceText = document.getElementById('source-text');
	game.eHelpText = document.getElementById('help-text');
	game.eScoreCnt = document.getElementById('scorecnt');
	game.eScoreArea = document.getElementById('score-area');

	document.body.onkeydown = (e) => {
		// console.log(e);
		if (e.key == "Shift" || e.key == " ") {
			game.shiftState = true;
			game.shiftState1 = true;
			if (game.play_state === "wait_space_start_writing") {
				on_space_start_writing();
			} 
			if (game.play_state === "wait_space_page_turn") {
				on_space_page_turn();
			} 
		}
		if (e.key == "f") {
			game.fasttrack = !game.fasttrack;
		}
	};
	document.body.onkeyup = (e) => {
		// console.log(e);
		if (e.key == "Shift" || e.key == " ") {
			game.shiftState = false;
		}
	};


	let pages = [`Es war Piemontkirschenzeit und der Tag begann mit Krönung Light. Auch im Hause von Kaiser, wo sich die böse Stiefmutter mal wieder in ihrem Cholesterinspiegel überprüfte. Dieser sprach zu ihr: 'Du besitzt zwar immer noch die Kraft der zwei Herzen, aber Schneekoppewittchen hat dafür das volle Verwöhnaroma!`,
				 `Das ärgerte die Stiefmutter ganz gewaltig und sie beschloss, einen Jägermeister auszusenden, um Schneekoppewittchen zu beseitigen. Dieser ging mit Schneekoppewittchen in den Wald, damit ihn die Kräuterpolizei nicht ertappen konnte.`,
				 `Dort richtete er seinen Danone auf Schneekoppewittchen, um ihr die Kugel zu geben. Allerdings erwies sich der Jägermeister als kleiner Feigling. Denn er hatte nicht den nötigen Mumm um sie zu erschießen. Das war ja schließlich auch nicht die feine Englische Art. Also sagte Schneekoppewittchen: 'Merci!' und rannte zu den sieben Bergen in das Haus der sieben Fruchtzwerge. Die Fruchtzwerge waren aber gerade in ihrem Bergwerk in Villabajo, um Goldbären und Megaperls abzubauen.`];


	const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Z', 'Y', 'Ä', 'Ö', 'Ü'];
    function classify_majuskels(text) {
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
		game.score = 0;
		update_score();
		if (game.fasttrack) {
			game.currWaitTime = 10;
		}

		game.pageIndex = 0;
		prepare_source();
		game.eHelpText.innerText = "Drücke die Leertaste zum Starten und zum Großschreiben.";
		game.play_state = "wait_space_start_writing";
		window.setTimeout(sound_while_waiting_for_start, 1000);
	}

	function update_score(delta) {
		if (delta !== undefined) {
			// game.score = Math.max(0, game.score + delta);
			game.score = game.score + delta;
		}
		game.eScoreCnt.innerText = game.score;
	}

	function prepare_source() {
		game.eSourceText.innerHTML = classify_majuskels(pages[game.pageIndex]);
		game.nextLetterIndex = 0;
		game.shiftState1 = true;
		game.eTargetText.innerHTML = "";
		game.eTargetText.setAttribute('class', '');
		game.collection = "";
		update_score();
	}

	function sound_while_waiting_for_start() {
		if (game.play_state != "wait_space_start_writing") {
			return;
		}
		const duration = trigger_saying("s");
		window.setTimeout(sound_while_waiting_for_start, duration +
			3000 + get_random_int(8000));
	}

	function sound_while_idling() {
		if (game.play_state != "finished") {
			return;
		}
		const duration = trigger_saying("g");
		window.setTimeout(sound_while_idling, duration +
			3000 + get_random_int(8000));
	}

	function on_page_finished() {
		game.pageIndex += 1;
		game.play_state = "animation_score_count";
		game.eTargetText.setAttribute('class', "nomin"); // hide
		game.eScoreArea.setAttribute('class', ""); // show

		let pluses = document.querySelectorAll(`#target-text .maj`);
		let minuses = document.querySelectorAll(`#target-text .wrongmaj`);
		let time = 1700;
		for (const plus of pluses) {
			window.setTimeout(() => {
				update_score(10);
				plus.setAttribute('class', "maj counted");
			}, time);
			time += 150;
		}
		time += 2000;
		for (const minus of minuses) {
			window.setTimeout(() => {
				update_score(-10);
				minus.setAttribute('class', "wrongmaj counted");
			}, time);
			time += 150;
		}
		time += 2000;
		window.setTimeout(() => {
			if (game.pageIndex >= pages.length) {
				game.eHelpText.innerText = "Das wars. Zuklappen und auf zum Komplet.";
				game.play_state = "finished";
				window.setTimeout(sound_while_idling, 1000);
			} else {
				prepare_source();
				game.eHelpText.innerText = "Weiterschreiben mit Leertaste.";
				game.play_state = "wait_space_start_writing";
				window.setTimeout(sound_while_waiting_for_start, 1000);
			}
		}, time);
	}


	function on_space_start_writing() {
		game.play_state = "writing";
		game.eHelpText.innerText = "";
		game.eScoreArea.setAttribute('class', "noscore"); // show
		if (pages[game.pageIndex] === undefined) {
			game.playing = false;
			return;
		}
		
		window.setTimeout(next_char, game.currWaitTime);
	}

	function next_char() {
		if (!game.playing) {
			return;
		}
		let next = pages[game.pageIndex][game.nextLetterIndex];
		game.nextLetterIndex += 1;
		if (next === undefined) {
			on_page_finished();
			return;
		}
		let class_ = "min";
		const is_alphanumeric = next.match(/[a-zA-Z]/) != null;
		if (is_alphanumeric) {
			const should_upper = next.match(/[A-Z]/) != null;
			if (game.shiftState || game.shiftState1) {
				next = next.toUpperCase();
				game.shiftState1 = false;

				if (should_upper) {
					class_ = "maj";
					trigger_saying("p");
				} else {
					class_ = "wrongmaj";
					trigger_saying("n");
				}
			} else {
				next = next.toLowerCase();
			}
		}
		content = document.createElement('span');
		content.innerText = next;
		content.setAttribute('class', class_)
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

	function get_random_int(max) {
	  return Math.floor(Math.random() * max);
	}

	function setup_audio() {
		const audioContext = new AudioContext();
		game.audioContext = audioContext;

		function make_ambient(id, gain) {
			let o = {}
			o.Element = document.querySelector(`audio#${id}`);
			o.Src = audioContext.createMediaElementSource(o.Element);
			o.Gain = new GainNode(audioContext, {gain: gain});
			o.Panner = new StereoPannerNode(audioContext, { pan: 0 });
			o.Src.connect(o.Gain).connect(o.Panner).connect(audioContext.destination);
			o.duration = 1; // not undefined :)
			o.Element.addEventListener('loadedmetadata', (event) => {
				o.duration = o.Element.duration;
			});
			return o;
		}
		let ambients = {}
		game.ambients = ambients;

		ambients.activity1 = make_ambient("a-activity1", 0.2);
		ambients.activity2 = make_ambient("a-activity2", 0.2);
		ambients.activity3 = make_ambient("a-activity3", 0.2);
		ambients.activity4 = make_ambient("a-activity4", 0.2);
		ambients.activity5 = make_ambient("a-activity5", 0.2);
		ambients.activity6 = make_ambient("a-activity6", 0.2);
		ambients.activity7 = make_ambient("a-activity7", 0.2);
		ambients.activity8 = make_ambient("a-activity8", 0.2);
		ambients.activity9 = make_ambient("a-activity9", 0.2);
		ambients.activity10 = make_ambient("a-activity10", 0.2);
		// ambients.choral = make_ambient("a-choral", 0.1);
		ambients.mumble1 = make_ambient("a-mumble1", 0.4);
		ambients.mumble2 = make_ambient("a-mumble2", 0.4);
		ambients.paper = make_ambient("a-paper", 0.3);
		ambients.steps1 = make_ambient("a-steps1", 0.4);
		ambients.steps2 = make_ambient("a-steps2", 0.4);
		ambients.quill1 = make_ambient("a-quill1", 0.4);
		ambients.quill2 = make_ambient("a-quill2", 0.4);

		function make_saying(id) {
			let o = {}
			o.Element = document.querySelector(`audio#${id}`);
			o.Src = audioContext.createMediaElementSource(o.Element);
			o.Gain = new GainNode(audioContext, {gain: 0.8});
			o.Panner = new StereoPannerNode(audioContext, { pan: 0 });
			o.Src.connect(o.Gain).connect(o.Panner).connect(audioContext.destination);
			o.duration = 1; // not undefined :)
			o.Element.addEventListener('loadedmetadata', (event) => {
				o.duration = o.Element.duration;
			});
			o.Element.addEventListener('ended', (event) => {
				game.sayings.is_playing = false;
			});
			return o;
		}

		let sayingsn = {} // negative
		let sayingsp = {} // positive
		let sayingss = {} // speedup
		let sayingsg = {} // general
		let sayingsc = {} // credits
		game.sayings = {
			is_playing: false,
			p: sayingsp,
			n: sayingsn,
			g: sayingsg,
			c: sayingsc,
			s: sayingss,
			unsaid_keys: {
				p: [],
				n: [],
				g: [],
				c: [],
				s: [],
			}
		};

		sayingsn.alsbrennmaterialtaugteswohl = make_saying("v-alsbrennmaterialtaugteswohl");
		sayingsn.ausdiesemskriptumkannmanhoechstenseinebuchstabsneuppemachen = make_saying("v-ausdiesemskriptumkannmanhoechstenseinebuchstabsneuppemachen");
		sayingsn.brauchtihreineneuekerze = make_saying("v-brauchtihreineneuekerze");
		sayingsc.credits1 = make_saying("v-credits1");
		sayingsc.credits2 = make_saying("v-credits2");
		sayingsc.credits3 = make_saying("v-credits3");
		sayingsc.credits4 = make_saying("v-credits4");
		sayingsn.daslaeuftwohlunterdichtericherfreiheit = make_saying("v-daslaeuftwohlunterdichtericherfreiheit");
		sayingsn.derabendistnochlang = make_saying("v-derabendistnochlang");
		sayingss.derabterwartetdieabschriftzursechstenstunde = make_saying("v-derabterwartetdieabschriftzursechstenstunde");
		// sayingsg.derbaumhataestedasistdasbestedennwaerseinpfahldannwaererkahl = make_saying("v-derbaumhataestedasistdasbestedennwaerseinpfahldannwaererkahl");
		sayingsg.derbaumhataestedasistdasbestedennwaerseinpfahldannwaererkahl2 = make_saying("v-derbaumhataestedasistdasbestedennwaerseinpfahldannwaererkahl2");
		sayingsp.dieserkodexgereichteuchzurehre = make_saying("v-dieserkodexgereichteuchzurehre");
		// sayingsg.eilemitweile = make_saying("v-eilemitweile");
		sayingsg.eilemitweile2 = make_saying("v-eilemitweile2");
		// sayingsp.eineflinkehand = make_saying("v-eineflinkehand");
		sayingsp.eineflinkehand2 = make_saying("v-eineflinkehand2");
		sayingsp.einepraechtigemajuskel = make_saying("v-einepraechtigemajuskel");
		sayingsp.eineruhigehand = make_saying("v-eineruhigehand");
		sayingsn.eineseiteistnochkeinbuch = make_saying("v-eineseiteistnochkeinbuch");
		sayingsp.eingutesaugenmas = make_saying("v-eingutesaugenmas");
		sayingsn.einkrampfinderhandistnochkeineentschuldigung = make_saying("v-einkrampfinderhandistnochkeineentschuldigung");
		sayingsp.einschreiberlingwieerimbuchesteht = make_saying("v-einschreiberlingwieerimbuchesteht");
		sayingsp.eurefederistsoscharfwieeuerverstand = make_saying("v-eurefederistsoscharfwieeuerverstand");
		sayingsp.eurehandschreibtschweisfrei = make_saying("v-eurehandschreibtschweisfrei");
		sayingsp.eurehingabeistbewundernswert = make_saying("v-eurehingabeistbewundernswert");
		sayingsp.flinkwieehundjeh = make_saying("v-flinkwieehundjeh");
		sayingsn.habtihrdemweinzugesprochen = make_saying("v-habtihrdemweinzugesprochen");
		sayingss.hurtig = make_saying("v-hurtig");
		sayingss.hurtigdasabendgebetbeginntinwenigenminuten = make_saying("v-hurtigdasabendgebetbeginntinwenigenminuten");
		sayingsp.ichseheihrseidmitdergotischenminuskelvertrait = make_saying("v-ichseheihrseidmitdergotischenminuskelvertrait");
		sayingsp.ichwerdedembibliothekarvoneurenfortschrittenberichten = make_saying("v-ichwerdedembibliothekarvoneurenfortschrittenberichten");
		sayingsp.ihrfuehrteinespitzefeder = make_saying("v-ihrfuehrteinespitzefeder");
		sayingsn.ihrhabteinmajuskelproblemmeinlieber = make_saying("v-ihrhabteinmajuskelproblemmeinlieber");
		sayingsn.ihrseidnichtwuerdigfuerdasskriptorium = make_saying("v-ihrseidnichtwuerdigfuerdasskriptorium");
		sayingsn.ihrsitztganzschoenindertinte = make_saying("v-ihrsitztganzschoenindertinte");
		sayingsg.ihrtaetigteineehrenswerteaufgabe = make_saying("v-ihrtaetigteineehrenswerteaufgabe");
		sayingsg.ihrwandertaufdemschmalengradzwischenmajuskelundminuskel = make_saying("v-ihrwandertaufdemschmalengradzwischenmajuskelundminuskel");
		sayingsn.ihrwartetwohlaufdieerfindungderbrille = make_saying("v-ihrwartetwohlaufdieerfindungderbrille");
		sayingss.keinemuedigkeitvorschuetzen = make_saying("v-keinemuedigkeitvorschuetzen");
		sayingsn.majuskelnsinddiegrosenminuskelndiekleinenfallsihresvergessenhabt = make_saying("v-majuskelnsinddiegrosenminuskelndiekleinenfallsihresvergessenhabt");
		// sayingsg.majuskelnundminuskelnhauptsachekeinepusteln = make_saying("v-majuskelnundminuskelnhauptsachekeinepusteln");
		sayingsp.manhateuchgutausgebildet = make_saying("v-manhateuchgutausgebildet");
		sayingsp.manwaechstmitseinenaufgaben = make_saying("v-manwaechstmitseinenaufgaben");
		sayingsp.meistergutenberghaetteesnichtbesserdruckenkoennen = make_saying("v-meistergutenberghaetteesnichtbesserdruckenkoennen");
		sayingsp.minuskelnsindeurestaerke = make_saying("v-minuskelnsindeurestaerke");
		sayingsg.morgenstundhatgoldimmund = make_saying("v-morgenstundhatgoldimmund");
		sayingsn.nunjaerrarehumanumest = make_saying("v-nunjaerrarehumanumest");
		sayingsg.oraetlabora = make_saying("v-oraetlabora");
		sayingsn.papieristgeduldig = make_saying("v-papieristgeduldig");
		sayingsn.regelnsindnunmalregeln = make_saying("v-regelnsindnunmalregeln");
		sayingss.schnellerschneller = make_saying("v-schnellerschneller");
		sayingss.schwingtdiefeder = make_saying("v-schwingtdiefeder");
		sayingsp.sehrgut = make_saying("v-sehrgut");
		sayingss.sputeteuch = make_saying("v-sputeteuch");
		sayingsg.uebungmachtdenmeister = make_saying("v-uebungmachtdenmeister");
		sayingsn.welcheinesudelei = make_saying("v-welcheinesudelei");
		// sayingsp.werwagtgewinnt = make_saying("v-werwagtgewinnt");
		sayingsp.werwagtgewinnt2 = make_saying("v-werwagtgewinnt2");
		sayingsg.wogehobeltwirdfallenspaene = make_saying("v-wogehobeltwirdfallenspaene");
		sayingsg.wogeschriebenwirddatropftdietinte = make_saying("v-wogeschriebenwirddatropftdietinte");


		function do_ambient() {
			// randomly play ambient
			let pan = (Math.random() * 2) - 1;
			const keys = Object.keys(ambients);
			const key = keys[get_random_int(keys.length)];
			const ambient = ambients[key];

			ambient.Element.play();

			let wait_to_next = 1000 + get_random_int(3000);
			console.log(`Ambient: ${key} (takes ${ambient.duration}s, then waiting ${wait_to_next}ms)`);
			window.setTimeout(do_ambient, (ambient.duration * 1000) + wait_to_next);
		}

	    if (audioContext.state === 'suspended') {
	        audioContext.resume();
	    }

	    do_ambient();
	}

	function shuffle(a) {
	    for (let i = a.length - 1; i > 0; i--) {
	        const j = Math.floor(Math.random() * (i + 1));
	        [a[i], a[j]] = [a[j], a[i]];
	    }
	    return a;
	}

	function trigger_saying(type) {
		if (game.sayings.is_playing) {
			return;
		}
		if (game.sayings.unsaid_keys[type].length == 0) {
			const keys = Object.keys(game.sayings[type]);
			shuffle(keys)
			game.sayings.unsaid_keys[type] = keys;
		}
		const key = game.sayings.unsaid_keys[type].pop();
		const saying = game.sayings[type][key];
		game.sayings.is_playing = true;
		saying.Element.play();
		console.log(`Saying: ${key} (takes ${saying.duration}s)`);
		return Math.floor(saying.duration * 1000);
	}

	setup_audio();
	start_game();

}

main();