<?php if(!isset($content_width)) $content_width = 640;
define('CPOTHEME_ID', 'transcend');
define('CPOTHEME_NAME', 'Transcend');
define('CPOTHEME_VERSION', '1.1.6');
//Other constants
define('CPOTHEME_LOGO_WIDTH', '180');
define('CPOTHEME_USE_SLIDES', true);
define('CPOTHEME_USE_FEATURES', true);
define('CPOTHEME_USE_PORTFOLIO', true);
define('CPOTHEME_USE_SERVICES', true);
define('CPOTHEME_PREMIUM_NAME', 'Transcend Pro');
define('CPOTHEME_PREMIUM_URL', 'http://www.cpothemes.com/theme/transcend');
define('CPOTHEME_THUMBNAIL_WIDTH', 400);
define('CPOTHEME_THUMBNAIL_HEIGHT', 500);

//Load Core; check existing core or load development core
$core_path = get_template_directory().'/core/';
if(defined('CPOTHEME_CORE')) $core_path = CPOTHEME_CORELITE;
require_once $core_path.'init.php';

$include_path = get_template_directory().'/includes/';

//Main components
require_once($include_path.'setup.php');

// Add Welcome Screen & Epsilon Framework
if ( ! class_exists( 'CPO_Theme' ) ) {
	require get_template_directory() . '/includes/class-cpo-theme.php';
}

if ( ! defined( 'SHORTPIXEL_AFFILIATE_CODE' ) ) {
    define( 'SHORTPIXEL_AFFILIATE_CODE', '3AXNUKA28044' );
}