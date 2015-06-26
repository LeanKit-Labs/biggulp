var gutil = require( "gulp-util" );
var banner = [
	"                                                                                ",
	"                                   ..:/:..                                      ",
	"                                -/////////:-.                                   ",
	"                            -.:///////////////-..                               ",
	"                         .:+ss/  `.://///////////::.                            ",
	"                       /osssss/     `.-:////////////:-                          ",
	"                      .sssssss/         `-:///////////`                         ",
	"                      .sssssss/            `.:////////`                         ",
	"                      .sssssss/               ``-:////`                         ",
	"                      .sssssss/                   `.:/`                         ",
	"                      .sssssss/                    `-o.                         ",
	"                      .sssssss/                 ./shmm-                         ",
	"                      .sssssss/             .-+ydmmmmm-                         ",
	"                      .sssssss/          .:ohdmmmmmmmm-                         ",
	"                      .sssssss/      ../ydmmmmmmmmmmmd.                         ",
	"                       `-/osss/   .-oydmmmmmmmmmmmhs:.                          ",
	"                          `./o/./shmmmmmmmmmmmdy+-`                             ",
	"                             `::yhmmmmmmmmmhs/.                                 ",
	"                                 ::ohdmdho:`                                    ",
	"        ..                          `-/-`           ...        ... ...          ",
	"       +mm.                                         mms        dds smd          ",
	"       +mm.     ..--..       ..--..       ..--..    mms   .::      ymd          ",
	"       +mm.   .shddddho.   :sdddddhs-   -sdddddds-  mms  /hmh: dmy ymmddd       ",
	"       +mm.  -dmy:  :ymd. ommo:  :smd: -dmy:  :ymd. mms:ymh/`  mmy ymm          ",
	"       +mm.  ymmyyyyyymmo mmo      hmy +mm:    :mm/ mmdmmo`    mmy ymd          ",
	"       +mm.  smmo         dmy      dmh +mm:    :mm/ mmhhmh/    mmy ymd          ",
	"       :mms: .hmd+:-:oho  /dmy+::+hmmh +mm:    :mm/ mms`+dmy-  mmy +mmo:        ",
	"        :ydd  `/shdddho-   .+ydddh  hy /hh.    :hh: hho  `ohh+`hhs  /ydd+       ",
	"                                                                                "
];

module.exports = {
	banner: function() {
		// yay for brute-forcing colors onto the banner...?
		var colorized = gutil.colors.green( banner.slice( 0, 19 ).join( "\n" ) );
		colorized += "\n" + gutil.colors.white( banner[ 19 ].substring( 0, 37 ) );
		colorized += gutil.colors.green( banner[ 19 ].substring( 37, 41 ) );
		colorized += gutil.colors.white( banner[ 19 ].substring( 41, 80 ) ) + "\n";
		colorized += gutil.colors.white( banner.slice( 20 ).join( "\n" ) );
		return colorized;
	}
};
