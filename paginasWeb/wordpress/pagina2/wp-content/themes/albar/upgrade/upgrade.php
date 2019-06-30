<?php
/**
 * Functions for users wanting to upgrade to premium
 *
 * @package Albar
 */

/**
 * Display the upgrade to Premium page & load styles.
 */
function kaira_premium_admin_menu() {
    global $kaira_upgrade_page;
    $kaira_upgrade_page = add_theme_page( __( 'About Albar', 'albar' ), '<span class="premium-link">' . __( 'About Albar', 'albar' ) . '</span>', 'edit_theme_options', 'theme_info', 'kaira_render_upgrade_page' );
}
add_action( 'admin_menu', 'kaira_premium_admin_menu' );

/**
 * Enqueue admin stylesheet only on upgrade page.
 */
function kaira_load_upgrade_page_scripts() {
    global $pagenow;
	if ( $pagenow == 'themes.php' ) {
		wp_enqueue_style( 'kaira-upgrade-css', get_template_directory_uri() . '/upgrade/css/upgrade-admin.css' );
	    wp_enqueue_script( 'caroufredsel', get_template_directory_uri() . '/js/jquery.carouFredSel-6.2.1-packed.js', array( 'jquery' ), KAIRA_THEME_VERSION, true );
	    wp_enqueue_script( 'kaira-upgrade-js', get_template_directory_uri() . '/upgrade/js/upgrade-custom.js', array( 'jquery' ), KAIRA_THEME_VERSION, true );
	}
}
add_action( 'admin_enqueue_scripts', 'kaira_load_upgrade_page_scripts' );

/**
 * Render the premium page to download premium upgrade plugin
 */
function kaira_render_upgrade_page() {
	get_template_part( 'upgrade/tpl/upgrade-page' );
}
