function main() {

	let game = main;
	game.playing = false;

	function start_game() {
		console.log(game);
		game.playing = true;
	}


	start_game();
}

main();