<?php
/**
 * Theme functions and definitions
 *
 * @package Business_Mart
 */

if ( ! function_exists( 'business_mart_enqueue_styles' ) ) :

	/**
	 * Load assets.
	 *
	 * @since 1.0.0
	 */
	function business_mart_enqueue_styles() {

		wp_enqueue_style( 'surya-chandra-lite-style-parent', get_template_directory_uri() . '/style.css' );
		wp_enqueue_style( 'business-mart-style', get_stylesheet_directory_uri() . '/style.css', array( 'surya-chandra-lite-style-parent' ), '1.0.0' );

	}

endif;

add_action( 'wp_enqueue_scripts', 'business_mart_enqueue_styles', 99 );

if ( ! function_exists( 'business_mart_theme_defaults' ) ) :

	/**
	 * Customize theme defaults.
	 *
	 * @since 1.0.0
	 *
	 * @param array $defaults Theme defaults.
	 * @param array Custom theme defaults.
	 */
	function business_mart_theme_defaults( $defaults ) {

		$defaults['header_layout']  = 2;
		$defaults['global_layout']  = 'left-sidebar';
		$defaults['excerpt_length'] = 50;
		$defaults['archive_layout'] = 'simple';

		return $defaults;

	}

endif;

add_filter( 'surya_chandra_filter_default_theme_options', 'business_mart_theme_defaults', 99 );
