var $ = require('jquery');
var waypoints = require('./lib/waypoints');
var fotorama = require('./lib/fotorama');
var lightYoutubeEmbeds = require('./lib/lightYoutubeEmbeds');
var cr001waypoints = require('./modules/cr001-waypoints');
var modal = require('./modules/modal');
var shopify = require('./modules/shopify');
var populateCollection = require('./modules/populateCollection');
var height = require('./modules/height');
var fullwidthvideowrapper = require('./modules/full-width-video-wrapper');
var nProgress = require('./lib/nProgress');
var imageLoading = require('./modules/imageLoading');
var videoBg = require('./lib/jquery.videoBackground.js');
var countdown = require('./lib/countdown.js');
var sc = require('./lib/sc.js');
var soundcloud = require('./modules/soundcloud.js');

videoBg();
lightYoutubeEmbeds();
waypoints();
fotorama();
height();
cr001waypoints();
modal();
shopify();
populateCollection();
fullwidthvideowrapper();
nProgress();
imageLoading();
countdown();
sc();
soundcloud();


