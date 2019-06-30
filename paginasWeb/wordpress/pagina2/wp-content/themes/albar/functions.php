<?php
/**
 * Albar functions and definitions
 *
 * @package Albar
 */
define( 'KAIRA_THEME_VERSION' , '1.7.71' );

// Is ONLY USED IF the user prompts for the premium update
define( 'KAIRA_UPDATE_URL', 'https://updates.kairaweb.com/' );
// Upgrade / Order Premium page
require get_template_directory() . '/upgrade/upgrade.php';

if ( file_exists( get_stylesheet_directory() . '/settings/class.kaira-theme-settings.php' ) ) {
    require_once( get_stylesheet_directory() . '/settings/class.kaira-theme-settings.php' );
}

// Theme Widgets
include get_template_directory() . '/includes/widgets.php';

// Load WP included scripts
require get_template_directory() . '/includes/inc/template-tags.php';
require get_template_directory() . '/includes/inc/extras.php';
require get_template_directory() . '/includes/inc/customizer.php';

// Load TGM plugin class
require_once get_template_directory() . '/includes/inc/class-tgm-plugin-activation.php';

if ( ! function_exists( 'kaira_setup_theme' ) ) :
/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which runs
 * before the init hook. The init hook is too late for some features, such as indicating
 * support post thumbnails.
 */
function kaira_setup_theme() {
    
    /**
     * Set the content width based on the theme's design and stylesheet.
     */
    global $content_width;
    if ( ! isset( $content_width ) )
        $content_width = 870; /* pixels */

	/**
	 * Make theme available for translation
	 * Translations can be filed in the /languages/ directory
	 * If you're building a theme based on Alba, use a find and replace
	 * to change 'albar' to the name of your theme in all the template files
	 */
	load_theme_textdomain( 'albar', get_template_directory() . '/languages' );

	/**
	 * Add default posts and comments RSS feed links to head
	 */
	add_theme_support( 'automatic-feed-links' );

	/**
	 * This theme uses wp_nav_menu() in one location.
	 */
	register_nav_menus( array(
		'main-menu' => __( 'Main Menu', 'albar' )
	) );

	add_theme_support('post-thumbnails');
    if ( function_exists( 'add_image_size' ) ) {
        add_image_size('blog_standard_img', 580, 380, true );
    }
	
	// The custom header is used for the logo
	add_theme_support('custom-header', array(
        'default-image' => '',
		'width'         => 290,
		'height'        => 110,
		'flex-width' => true,
		'flex-height' => true,
		'header-text' => false,
	));
	
	add_editor_style();

	/**
	 * Enable support for Post Formats
	 */
	add_theme_support( 'post-formats', array( 'aside', 'image', 'video', 'quote', 'link' ) );
    add_theme_support( 'custom-background', array( 'default-color' => '#ffffff', ) );
    
    add_theme_support( 'title-tag' );
    
    add_theme_support( 'woocommerce' );
    add_theme_support( 'wc-product-gallery-zoom' );
    add_theme_support( 'wc-product-gallery-lightbox' );
    add_theme_support( 'wc-product-gallery-slider' );
}
endif; // kaira_setup
add_action( 'after_setup_theme', 'kaira_setup_theme' );

/**
 * Register widgetized area and update sidebar with default widgets
 */
function kaira_widgets_init() {
	register_sidebar( array(
		'name'          => __( 'Sidebar', 'albar' ),
		'id'            => 'sidebar-1',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>'
	) );
	register_sidebar(array(
		'name' => __('Albar Footer', 'albar'),
		'id' => 'site-footer',
        'before_widget' => '<aside id="%1$s" class="widget %2$s">',
        'after_widget'  => '</aside>',
        'before_title'  => '<h4 class="widgettitle">',
        'after_title'   => '</h4>'
	));
	
    register_widget( 'alba_carousel' );
    register_widget( 'alba_heading' );
    register_widget( 'alba_icon' );
}
add_action( 'widgets_init', 'kaira_widgets_init' );

if(!function_exists('kaira_footer_widget_params')):
/**
 * Set the widths of the footer widgets
 *
 * @param $params
 * @return mixed
 * 
 * @filter dynamic_sidebar_params
 */
function kaira_footer_widget_params($params){
	// Check that this is the footer
	if ($params[0]['id'] != 'site-footer') return $params;

	$sidebars_widgets = wp_get_sidebars_widgets();
	$count = count($sidebars_widgets[$params[0]['id']]);
	$params[0]['before_widget'] = preg_replace('/\>$/', ' style="width:'.round(100/$count,4).'%" >', $params[0]['before_widget']);

	return $params;
}
endif;
add_filter('dynamic_sidebar_params', 'kaira_footer_widget_params');

function kaira_print_styles(){
    $custom_css = '';
    if ( kaira_theme_option( 'kra-custom-css' ) ) {
        $custom_css = kaira_theme_option( 'kra-custom-css' );
    }
    
    $body_font = kaira_theme_option( 'kra-body-google-font-name' );
    $body_font_color = kaira_theme_option( 'kra-body-google-font-color' );
    $h_font = kaira_theme_option( 'kra-heading-google-font-name' );
    $h_font_color = kaira_theme_option( 'kra-heading-google-font-color' );
    
    $primary_color = kaira_theme_option( 'kra-primary-color' );
    $primary_color_hover = kaira_theme_option( 'kra-primary-color-hover' ); ?>
    <style type="text/css" media="screen">
        body,
        .page-header h1,
        .alba-banner-heading h5,
        .alba-carousel-block,
        .alba-heading-text {
            color: <?php echo $body_font_color; ?>;
            <?php echo ( $body_font ) ? $body_font : 'font-family: \'Open Sans\', sans-serif;'; ?>
        }
        h1, h2, h3, h4, h5, h6,
        h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {
            color: <?php echo $h_font_color; ?>;
            <?php echo ( $h_font ) ? $h_font : 'font-family: \'Roboto\', sans-serif;'; ?>
        }
        
        .alba-button,
        .post .alba-blog-permalink-btn,
        .search article.page .alba-blog-permalink-btn,
        .wpcf7-submit,
        .alba-home-slider-prev,
        .alba-home-slider-next,
        .woocommerce span.onsale,
        .alba-carousel-arrow-prev,
        .alba-carousel-arrow-next {
            background-color: <?php echo $primary_color; ?>;
        }
        .site-header-one .site-title a,
        .site-header-two .site-title a,
        .site-header-one .site-top-bar i,
        .site-header-two .site-social i,
        .navigation-main li:hover > a,
        li.current_page_item > a,
        li.current_page_ancestor > a,
        .page-header .cx-breadcrumbs a,
        .sidebar-navigation-left .current_page_item,
        .sidebar-navigation-right .current_page_item,
        .woocommerce ul.products li.product .price,
        .woocommerce div.product p.price,
        .entry-content a,
        .alba-blog-standard-block a,
        .home-slider-wrap-hint a,
        .widget ul li a,
        #comments .logged-in-as a,
        .alba-heading i,
        .alba-heading b,
        .alba-banner-heading h3 b {
            color: <?php echo $primary_color; ?>;
        }
        .navigation-main li.current_page_item,
        .navigation-main li.current_page_ancestor {
            border-bottom: 2px solid <?php echo $primary_color; ?>;
        }
        .navigation-main ul ul {
            border-top: 2px solid <?php echo $primary_color; ?>;
        }
        .alba-button:hover,
        .wpcf7-submit:hover,
        .post .alba-blog-permalink-btn:hover,
        .search article.page .alba-blog-permalink-btn:hover,
        
        .alba-home-slider-prev:hover,
        .alba-home-slider-next:hover,
        .alba-carousel-arrow-prev:hover,
        .alba-carousel-arrow-next:hover {
            background-color: <?php echo $primary_color_hover; ?>;
        }
        .entry-content a:hover,
        h1 a:hover, h2 a:hover, h3 a:hover, h4 a:hover, h5 a:hover, h6 a:hover,
        .alba-blog-standard-block a:hover,
        #comments .logged-in-as a:hover,
        .widget .tagcloud a:hover,
        .sidebar-navigation ul li a:hover,
        .cx-breadcrumbs a:hover,
        .widget ul li a:hover {
            color: <?php echo $primary_color_hover; ?>;
        }
        .sidebar-navigation-left .current_page_item {
            box-shadow: 3px 0 0 <?php echo $primary_color; ?> inset;
        }
        .sidebar-navigation-right .current_page_item {
            box-shadow: -3px 0 0 <?php echo $primary_color; ?> inset;
        }
        <?php echo htmlspecialchars_decode( $custom_css ); ?>
    </style>
    <?php
}
add_action('wp_head', 'kaira_print_styles', 11);

/**
 * Enqueue scripts and styles
 */
function kaira_scripts() {
    if ( kaira_theme_option( 'kra-body-google-font-url' ) ) {
        wp_enqueue_style( 'albar-google-font-body', kaira_theme_option( 'kra-body-google-font-url' ), array(), KAIRA_THEME_VERSION );
    } else {
        wp_enqueue_style( 'albar-google-body-font-default', '//fonts.googleapis.com/css?family=Open+Sans:400,300,300italic,400italic,600,600italic,700,700italic', array(), KAIRA_THEME_VERSION );
    }
    if ( kaira_theme_option( 'kra-heading-google-font-url' ) ) {
        wp_enqueue_style( 'albar-google-font-heading', kaira_theme_option( 'kra-heading-google-font-url' ), array(), KAIRA_THEME_VERSION );
    } else {
        wp_enqueue_style( 'albar-google-heading-font-default', '//fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,500,500italic,700,700italic', array(), KAIRA_THEME_VERSION );
    }
    
    wp_enqueue_style( 'albar-fontawesome', get_template_directory_uri().'/includes/font-awesome/css/font-awesome.css', array(), '4.7.0' );
	wp_enqueue_style( 'albar-style', get_stylesheet_uri(), array(), KAIRA_THEME_VERSION );
    
	wp_enqueue_script( 'albar-caroufredSel', get_template_directory_uri() . '/js/jquery.carouFredSel-6.2.1-packed.js', array('jquery'), KAIRA_THEME_VERSION, true );
    
	wp_enqueue_script( 'albar-customjs', get_template_directory_uri() . '/js/custom.js', array('jquery'), KAIRA_THEME_VERSION, true );
    
	wp_enqueue_script( 'albar-skip-link-focus-fix', get_template_directory_uri() . '/js/skip-link-focus-fix.js', array(), KAIRA_THEME_VERSION, true );
    
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}

	if ( is_singular() && wp_attachment_is_image() ) {
		wp_enqueue_script( 'kaira-keyboard-image-navigation', get_template_directory_uri() . '/js/keyboard-image-navigation.js', array('jquery'), KAIRA_THEME_VERSION );
	}
}
add_action( 'wp_enqueue_scripts', 'kaira_scripts' );

/**
 * Enqueue admin JS.
 */
function kaira_load_admin_script() {
    wp_enqueue_script( 'albar-admin-js', get_template_directory_uri() . '/upgrade/js/admin-custom.js', array( 'jquery' ), KAIRA_THEME_VERSION, true );
}
add_action( 'admin_enqueue_scripts', 'kaira_load_admin_script' );

// Create function to check if WooCommerce exists.
if ( ! function_exists( 'kaira_is_woocommerce_activated' ) ) :
    
function kaira_is_woocommerce_activated() {
    if ( class_exists( 'woocommerce' ) ) { return true; } else { return false; }
}

endif; // kaira_is_woocommerce_activated

if ( kaira_is_woocommerce_activated() ) {
    require get_template_directory() . '/includes/inc/woocommerce-inc.php';
}

/**
 * Exclude slider category from sidebar widgets.
 */
function kaira_exclude_slider_categories_widget( $args ) {
    $exclude = ''; // ID's of the categories to exclude
    if ( kaira_theme_option( 'kra-slider-categories', false ) ) {
        $exclude = kaira_theme_option( 'kra-slider-categories' );
    }
    $args['exclude'] = $exclude;
    return $args;
}
add_filter( 'widget_categories_args', 'kaira_exclude_slider_categories_widget' );

/**
 * Display recommended plugins with the TGM class
 */
function kaira_register_required_plugins() {
    $plugins = array(
        // The recommended WordPress.org plugins.
        array(
            'name'      => __( 'Elementor Page Builder', 'albar' ),
            'slug'      => 'elementor',
            'required'  => false,
        ),
        array(
            'name'      => __( 'WooCommerce', 'albar' ),
            'slug'      => 'woocommerce',
            'required'  => false,
        ),
        array(
            'name'      => __( 'Contact Form 7', 'albar' ),
            'slug'      => 'contact-form-7',
            'required'  => false,
        ),
        array(
            'name'      => __( 'Breadcrumb NavXT', 'albar' ),
            'slug'      => 'breadcrumb-navxt',
            'required'  => false,
        )
    );
    $config = array(
        'id'           => 'albar',
        'menu'         => 'tgmpa-install-plugins'
    );

    tgmpa( $plugins, $config );
}
add_action( 'tgmpa_register', 'kaira_register_required_plugins' );

/**
 * Elementor Check
 */
if ( ! defined( 'ELEMENTOR_PARTNER_ID' ) ) {
    define( 'ELEMENTOR_PARTNER_ID', 2118 );
}

/* Enque Admin CSS for Conica notice */
function kaira_load_admin_notice_script() {
    wp_enqueue_style( 'kaira-admin-notice-css', get_template_directory_uri() . '/settings/css/kaira-admin-notice.css' );
}
add_action( 'admin_enqueue_scripts', 'kaira_load_admin_notice_script' );

/* Display the admin Conica Recommendation notice */
function kaira_recommended_plugin_notice() {
    global $current_user;
    $user_id = $current_user->ID;
    
    if ( ! get_user_meta( $user_id, 'kaira_recommended_plugin_ignore_notice' ) ) {
        echo '<div class="updated albar-conica-notice"><p>';
        printf( __( '<a href="%1$s" class="albar-conica-notice-close"></a></p>', 'albar' ), '?kaira_recommended_plugin_nag_ignore=0' ); ?>
            <?php printf( __( '<p style="color: red;">LATEST UPDATE: Requires WooCommerce 3.3 or more</p><p>We recommend rather trying out our NEW Power theme, Avant - <a href="%1$s" class="albar-notice-a">Download and try Avant now</a></p><p>With 7 header layouts, 5 Blog layouts and 3 Footer layouts, full website color options and lots of other customization settings, you\'ll be able to create the perfect site. All built within the WordPress Customizer.<br /><b>If not, Albar will still work and we will keep it updated.</b></p>', 'albar' ), admin_url( 'theme-install.php?search=avant' ) ); ?>
            <a href="<?php echo esc_url( admin_url( 'theme-install.php?search=avant' ) ); ?>" class="albar-conica-img"><img src="<?php echo get_template_directory_uri(); ?>/images/conica-screenshot.png" alt="<?php esc_attr_e( 'Try out Avant instead', 'albar' ); ?>" /></a>
        <?php
        echo '</p></div>';
    }
}
add_action('admin_notices', 'kaira_recommended_plugin_notice');

/* Dismiss notice */
function kaira_recommended_plugin_nag_ignore() {
    global $current_user;
    $user_id = $current_user->ID;
        
    /* If user clicks to ignore the notice, add that to their user meta */
    if ( isset($_GET['kaira_recommended_plugin_nag_ignore']) && '0' == $_GET['kaira_recommended_plugin_nag_ignore'] ) {
        add_user_meta( $user_id, 'kaira_recommended_plugin_ignore_notice', 'true', true );
    }
}
add_action('admin_init', 'kaira_recommended_plugin_nag_ignore');
