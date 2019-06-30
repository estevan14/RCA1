<?php
/**
 * Sensible WP Pro Theme Customizer 
 *
 * @package sensible-wp
 */

/**
 * Add CSS in <head> for styles handled by the theme customizer
 *
 * @since 1.5
 */
function sensiblewp_add_customizer_css() { 
	
	$color = ( get_theme_mod( 'sensiblewp_link_color', '#ea474b' ) );
	$hover_color = ( get_theme_mod( 'sensiblewp_hover_color', '#ea474b' ) );
	$theme_color = ( get_theme_mod( 'sensiblewp_custom_color' ) );
	$theme_hover_color = ( get_theme_mod( 'sensiblewp_custom_color_hover' ) );
	$social_color = ( get_theme_mod( 'sensiblewp_social_color' ) );
	$social_hover_color = ( get_theme_mod( 'sensiblewp_social_color_hover' ) );
	
	$checkVars = array($color != '#ea474b', $hover_color != '#ea474b', $theme_color != '#ea474b', $theme_hover_color != '#ea474b', $social_color != '#888888', $social_hover_color != '#888888');
	
	?>
	<!-- Sensible customizer CSS -->
	<style>
		body { border-color: <?php echo $color; ?>; }
		
		a { color: <?php echo $color; ?>; } 
		
		<?php if ( get_theme_mod( 'sensiblewp_hover_color' ) ) : ?>
		.main-navigation li:hover > a, a:hover { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_hover_color', '#ea474b' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color_hover' ) ) : ?>
		.member .fa:hover { background: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color_hover', '#ea474b' )) ?>; } 
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		#sequence .slide-arrow { background: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; } 
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_social_color' ) ) : ?>
		.social-media-icons .fa { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_social_color', '#888888' )) ?>; } 
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_social_color_hover' ) ) : ?>
		.social-media-icons .fa:hover { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_social_color_hover', '#888888' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		.home-services .fa, .service .fa  { background: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; }
		<?php endif; ?>
		 
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		.entry-header { background: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		.home-entry-title:after, .member-entry-title:after, .works-entry-title:after, .client-entry-title:after, .home-news h5:after, .home-team h5:after, .home-cta h6:after, .footer-contact h5:after, .member h5:after { border-color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; } 
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		.main-navigation ul ul li { border-color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		button, input[type="button"], input[type="reset"], input[type="submit"] { background: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; }  
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		button, input[type="button"], input[type="reset"], input[type="submit"] { border-color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; }  
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		.home-blog .entry-footer:hover, button:hover, input[type="button"]:hover, input[type="reset"]:hover, input[type="submit"]:hover { border-color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; }  
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		.nav-previous, .paging-navigation .nav-previous, .post-navigation .nav-previous, .nav-next, .paging-navigation .nav-next, .post-navigation .nav-next { background: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; }  
		<?php endif; ?>
		
		#site-navigation button:hover { background: none; }
		
		<?php if ( get_theme_mod( 'sensiblewp_site_title_color' ) ) : ?>
		h1.site-title a { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_site_title_color', '#ea474b' )) ?>; } 
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_text_color' ) ) : ?>
		body, button, input, select, textarea, p { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_text_color', '#8c9398' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_nav_link_color' ) ) : ?>
		.site-header .main-navigation ul li a { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_nav_link_color', '#ffffff' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_nav_link_hover_color' ) ) : ?>
		.site-header .main-navigation a:hover { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_nav_link_hover_color', '#ffffff' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_nav_drop_link_color' ) ) : ?>
		.main-navigation ul ul a { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_nav_drop_link_color', '#8c9398' )) ?> !important; } 
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_blockquote' ) ) : ?>
		blockquote { background: <?php echo esc_attr( get_theme_mod( 'sensiblewp_blockquote', '#f1f1f1' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_blockquote_border' ) ) : ?>
		blockquote { border-color:<?php echo esc_attr( get_theme_mod( 'sensiblewp_blockquote_border', '#ea474b' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_entry' ) ) : ?>
		.entry-header .entry-title, .featured-img-header .entry-title { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_entry', '#ffffff' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_footer_color' ) ) : ?>
		.site-footer { background: <?php echo esc_attr( get_theme_mod( 'sensiblewp_footer_color', '#242830' )) ?>; }
		<?php endif; ?> 
		
		<?php if ( get_theme_mod( 'sensiblewp_footer_text_color' ) ) : ?>
		.site-footer { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_footer_text_color', '#ffffff' )) ?>; }
		<?php endif; ?> 
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		.footer-contact h5 { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; }  
		<?php endif; ?> 
		
		<?php if ( get_theme_mod( 'sensiblewp_custom_color' ) ) : ?>
		.footer-contact h5:after { border-color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_custom_color', '#ea474b' )) ?>; }  
		<?php endif; ?> 
		
		<?php if ( get_theme_mod( 'sensiblewp_footer_link_color' ) ) : ?>
		.site-footer a { color: <?php echo esc_attr( get_theme_mod( 'sensiblewp_footer_link_color', '#b3b3b3' )) ?>; }
		<?php endif; ?>
		
		<?php if ( get_theme_mod( 'sensiblewp_body_size' ) ) : ?>
		body, p { font-size: <?php echo esc_attr( get_theme_mod( 'sensiblewp_body_size' )) ?>px; } 
		<?php endif; ?>  
		
	</style>
<?php } 

add_action( 'wp_head', 'sensiblewp_add_customizer_css' );
