<?php
/**
 * Sensible Theme Customizer 
 *
 * @package sensible-wp
 */
 
function sensiblewp_theme_customizer( $wp_customize ) { 
	
	//allows donations
    class sensiblewp_Info extends WP_Customize_Control { 
     
        public $label = '';
        public function render_content() {
        ?>

        <?php
        }
    }	
	
	// Pro
    $wp_customize->add_section(
        'sensiblewp_theme_info',
        array(
            'title' => esc_html__('Sensible Pro', 'sensible-wp'), 
            'priority' => 5, 
            'description' => __('Need a little more Sensible? If you want to see what additional features <a href="http://modernthemes.net/wordpress-themes/sensible-pro/" target="_blank">Sensible Pro</a> has, check them all out right <a href="http://modernthemes.net/wordpress-themes/sensible-pro/" target="_blank">here</a>.', 'sensible-wp'), 
        )
    );
	 
    //Donations section
    $wp_customize->add_setting('sensiblewp_help', array(
			'sanitize_callback' => 'sensiblewp_no_sanitize',
            'type' => 'info_control',
            'capability' => 'edit_theme_options',
        )
    );
    $wp_customize->add_control( new sensiblewp_Info( $wp_customize, 'sensiblewp_help', array( 
        'section' => 'sensiblewp_theme_info', 
        'settings' => 'sensiblewp_help', 
        'priority' => 10
        ) )
    );
	   
	// Fonts  
    $wp_customize->add_section(
        'sensiblewp_typography',
        array(
            'title' => esc_html__('Google Fonts', 'sensible-wp' ),   
            'priority' => 40,
    ));
	
    $font_choices = 
        array(
			'Open Sans:400italic,700italic,400,700' => 'Open Sans',
			'Oswald:400,700' => 'Oswald',
			'Source Sans Pro:400,700,400italic,700italic' => 'Source Sans Pro',
			'Playfair Display:400,700,400italic' => 'Playfair Display',
			'Montserrat:400,700' => 'Montserrat',
			'Raleway:400,700' => 'Raleway',
            'Droid Sans:400,700' => 'Droid Sans',
            'Lato:400,700,400italic,700italic' => 'Lato',
            'Arvo:400,700,400italic,700italic' => 'Arvo',
            'Lora:400,700,400italic,700italic' => 'Lora',
			'Merriweather:400,300italic,300,400italic,700,700italic' => 'Merriweather',
			'Oxygen:400,300,700' => 'Oxygen',
			'PT Serif:400,700' => 'PT Serif', 
            'PT Sans:400,700,400italic,700italic' => 'PT Sans',
            'PT Sans Narrow:400,700' => 'PT Sans Narrow',
			'Cabin:400,700,400italic' => 'Cabin',
			'Fjalla One:400' => 'Fjalla One',
			'Francois One:400' => 'Francois One',
			'Josefin Sans:400,300,600,700' => 'Josefin Sans',  
			'Libre Baskerville:400,400italic,700' => 'Libre Baskerville',
            'Arimo:400,700,400italic,700italic' => 'Arimo',
            'Ubuntu:400,700,400italic,700italic' => 'Ubuntu',
            'Bitter:400,700,400italic' => 'Bitter',
            'Droid Serif:400,700,400italic,700italic' => 'Droid Serif',
            'Roboto:400,400italic,700,700italic' => 'Roboto',
            'Open Sans Condensed:700,300italic,300' => 'Open Sans Condensed',
            'Roboto Condensed:400italic,700italic,400,700' => 'Roboto Condensed',
            'Roboto Slab:400,700' => 'Roboto Slab',
            'Yanone Kaffeesatz:400,700' => 'Yanone Kaffeesatz',
            'Rokkitt:400' => 'Rokkitt',
    );
	
	//body font size
    $wp_customize->add_setting(
        'sensiblewp_body_size',
        array(
            'sanitize_callback' => 'absint',
            'default'           => '15', 
        )       
    );
    $wp_customize->add_control( 'sensiblewp_body_size', array(
        'type'        => 'number', 
        'priority'    => 10,
        'section'     => 'sensiblewp_typography',
        'label'       => esc_html__('Body Font Size', 'sensible-wp'), 
        'input_attrs' => array(
            'min'   => 10,
            'max'   => 28,
            'step'  => 1,
            'style' => 'margin-bottom: 10px;',
        ),
  	));
    
    $wp_customize->add_setting(
        'headings_fonts',
        array(
            'sanitize_callback' => 'sensiblewp_sanitize_fonts',
    ));
    
    $wp_customize->add_control(
        'headings_fonts',
        array(
            'type' => 'select',
			'default'           => '20', 
            'description' => esc_html__('Select your desired font for the headings. Open Sans is the default Heading font.', 'sensible-wp'),
            'section' => 'sensiblewp_typography',
            'choices' => $font_choices
    ));
    
    $wp_customize->add_setting(
        'body_fonts',
        array(
            'sanitize_callback' => 'sensiblewp_sanitize_fonts',
    ));
    
    $wp_customize->add_control(
        'body_fonts',
        array(
            'type' => 'select',
			'default'           => '30', 
            'description' => esc_html__( 'Select your desired font for the body. Open Sans is the default Body font.', 'sensible-wp' ), 
            'section' => 'sensiblewp_typography',  
            'choices' => $font_choices 
    )); 

	// Colors
	$wp_customize->add_setting( 'sensiblewp_text_color', array(
        'default'     => '#8c9398',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_text_color', array(
        'label'	   => esc_html__( 'Text Color', 'sensible-wp' ),
        'section'  => 'colors',
        'settings' => 'sensiblewp_text_color',
		'priority' => 10 
    ))); 
	
    $wp_customize->add_setting( 'sensiblewp_link_color', array( 
        'default'     => '#ea474b',   
        'sanitize_callback' => 'sanitize_hex_color', 
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_link_color', array(
        'label'	   => esc_html__( 'Link Color', 'sensible-wp'),
        'section'  => 'colors',
        'settings' => 'sensiblewp_link_color', 
		'priority' => 30
    )));
	
	$wp_customize->add_setting( 'sensiblewp_hover_color', array(
        'default'     => '#ea474b',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_hover_color', array(
        'label'	   => esc_html__( 'Hover Color', 'sensible-wp' ), 
        'section'  => 'colors',
        'settings' => 'sensiblewp_hover_color',
		'priority' => 35 
    )));
	
	$wp_customize->add_setting( 'sensiblewp_custom_color', array( 
        'default'     => '#ea474b', 
		'sanitize_callback' => 'sanitize_hex_color',
    ));
	
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_custom_color', array(
        'label'	   => esc_html__( 'Theme Color', 'sensible-wp' ),
        'section'  => 'colors',
        'settings' => 'sensiblewp_custom_color', 
		'priority' => 20
    )));
	
	$wp_customize->add_setting( 'sensiblewp_custom_color_hover', array( 
        'default'     => '#ea474b',  
		'sanitize_callback' => 'sanitize_hex_color', 
    ));
	
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_custom_color_hover', array(
        'label'	   => esc_html__( 'Theme Hover Color', 'sensible-wp' ),
        'section'  => 'colors',
        'settings' => 'sensiblewp_custom_color_hover', 
		'priority' => 25
    )));
	
	$wp_customize->add_setting( 'sensiblewp_site_title_color', array(
        'default'     => '#ea474b', 
        'sanitize_callback' => 'sanitize_hex_color',
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_site_title_color', array(
        'label'	   => esc_html__( 'Site Title Color', 'sensible-wp' ),  
        'section'  => 'colors',
        'settings' => 'sensiblewp_site_title_color',
		'priority' => 40
    )));
	
	$wp_customize->add_setting( 'sensiblewp_blockquote', array(
        'default'     => '#f1f1f1',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_blockquote', array(
        'label'	   => esc_html__( 'Blockquote Background', 'sensible-wp' ),
        'section'  => 'colors',
        'settings' => 'sensiblewp_blockquote', 
		'priority' => 45
    )));
	
	$wp_customize->add_setting( 'sensiblewp_blockquote_border', array(
        'default'     => '#ea474b', 
        'sanitize_callback' => 'sanitize_hex_color',
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_blockquote_border', array(
        'label'	   => esc_html__( 'Blockquote Accent Color', 'sensible-wp' ), 
        'section'  => 'colors',
        'settings' => 'sensiblewp_blockquote_border', 
		'priority' => 50
    ))); 
	
	$wp_customize->add_setting( 'sensiblewp_entry', array(
        'default'     => '#ffffff', 
        'sanitize_callback' => 'sanitize_hex_color',
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_entry', array(
        'label'	   => esc_html__( 'Entry Title Color', 'sensible-wp' ), 
        'section'  => 'colors',
        'settings' => 'sensiblewp_entry',  
		'priority' => 55
    )));
	
	// nav 
	$wp_customize->add_section( 'sensiblewp_nav', array(
	'title' => esc_html__( 'Navigation', 'sensible-wp' ), 
	'priority' => '13', 
	));
	
	// Nav
	$wp_customize->add_setting( 'sensiblewp_nav_link_color', array(
        'default'     => '#ffffff',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_nav_link_color', array(
        'label'	   => esc_html__( 'Navigation Link Color', 'sensible-wp' ),
        'section'  => 'sensiblewp_nav',
        'settings' => 'sensiblewp_nav_link_color',
		'priority' => 70 
    )));
	
	$wp_customize->add_setting( 'sensiblewp_nav_link_hover_color', array(
        'default'     => '#ffffff',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_nav_link_hover_color', array(
        'label'	   => esc_html__( 'Navigation Link Hover Color', 'sensible-wp' ),
        'section'  => 'sensiblewp_nav',
        'settings' => 'sensiblewp_nav_link_hover_color', 
		'priority' => 75
    )));
	
	$wp_customize->add_setting( 'sensiblewp_nav_drop_link_color', array(  
        'default'     => '#8c9398',
        'sanitize_callback' => 'sanitize_hex_color',
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_nav_drop_link_color', array(
        'label'	   => esc_html__( 'Menu Drop Down Link Color', 'sensible-wp' ),
        'section'  => 'sensiblewp_nav',
        'settings' => 'sensiblewp_nav_drop_link_color',
		'priority' => 105
    ))); 
	
	//Animations
	$wp_customize->add_section( 'sensiblewp_animations' , array(  
	    'title'       => esc_html__( 'Animations', 'sensible-wp' ),
	    'priority'    => 39, 
	    'description' => esc_html__( 'We can make things fly across the screen.', 'sensible-wp' ),
	));
	
    $wp_customize->add_setting(
        'sensiblewp_animate',
        array(
            'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
            'default' => 0,
    ));
	
    $wp_customize->add_control( 
        'sensiblewp_animate',
        array(
            'type' => 'checkbox',
            'label' => esc_html__('Check this box if you want to disable the animations.', 'sensible-wp'),
            'section' => 'sensiblewp_animations',  
            'priority' => 1,           
    ));

    // Logo upload
    $wp_customize->add_section( 'sensiblewp_logo_section' , array(  
	    'title'       => esc_html__( 'Logo and Icons', 'sensible-wp' ),
	    'priority'    => 21, 
	    'description' => esc_html__( 'Upload a logo to replace the default site name and description in the header. Also, upload your site favicon and Apple Icons.', 'sensible-wp'),
	));

	$wp_customize->add_setting( 'sensiblewp_logo', array(
		'sanitize_callback' => 'esc_url_raw',
	));

	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'sensiblewp_logo', array( 
		'label'    => esc_html__( 'Logo', 'sensible-wp' ),
		'type'           => 'image',
		'section'  => 'sensiblewp_logo_section', 
		'settings' => 'sensiblewp_logo',
		'priority' => 1,
	))); 
	
	// Logo Width
	$wp_customize->add_setting( 'logo_size', array(
	    'sanitize_callback' => 'sensiblewp_sanitize_text',
		'default'	        => '200'  
	));

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'logo_size', array( 
		'label'    => esc_html__( 'Change the width of the Logo in PX.', 'sensible-wp' ),
		'description'    => esc_html__( 'Only enter numeric value', 'sensible-wp' ),
		'section'  => 'sensiblewp_logo_section', 
		'settings' => 'logo_size',  
		'priority'   => 2 
	)));
	
	//Favicon Upload
	$wp_customize->add_setting(
		'site_favicon',
		array(
			'default' => (get_stylesheet_directory_uri( 'stylesheet_directory') . '/img/favicon.png'), 
			'sanitize_callback' => 'esc_url_raw',
	));
	
    $wp_customize->add_control(
        new WP_Customize_Image_Control(
            $wp_customize,
            'site_favicon',
            array(
               'label'          => esc_html__( 'Upload your favicon (16x16 pixels)', 'sensible-wp' ),
			   'type' 			=> 'image',
               'section'        => 'sensiblewp_logo_section',
               'settings'       => 'site_favicon',
               'priority' => 2,
    )));
	
    //Apple touch icon 144
    $wp_customize->add_setting(
        'apple_touch_144',
        array(
            'default-image' => '',
			'sanitize_callback' => 'esc_url_raw',
    ));
	
    $wp_customize->add_control(
        new WP_Customize_Image_Control(
            $wp_customize,
            'apple_touch_144',
            array(
               'label'          => esc_html__( 'Upload your Apple Touch Icon (144x144 pixels)', 'sensible-wp' ),
               'type'           => 'image',
               'section'        => 'sensiblewp_logo_section',
               'settings'       => 'apple_touch_144',
               'priority'       => 11,
    )));
	
    //Apple touch icon 114
    $wp_customize->add_setting(
        'apple_touch_114',
        array(
            'default-image' => '',
			'sanitize_callback' => 'esc_url_raw', 
    ));

    $wp_customize->add_control(
        new WP_Customize_Image_Control(
            $wp_customize,
            'apple_touch_114',
            array(
               'label'          => esc_html__( 'Upload your Apple Touch Icon (114x114 pixels)', 'sensible-wp' ),
               'type'           => 'image',
               'section'        => 'sensiblewp_logo_section',
               'settings'       => 'apple_touch_114',
               'priority'       => 12,
    )));
	
    //Apple touch icon 72
    $wp_customize->add_setting(
        'apple_touch_72',
        array(
            'default-image' => '',
			'sanitize_callback' => 'esc_url_raw',
    ));
	
    $wp_customize->add_control(
        new WP_Customize_Image_Control(
            $wp_customize,
            'apple_touch_72',
            array(
               'label'          => esc_html__( 'Upload your Apple Touch Icon (72x72 pixels)', 'sensible-wp' ),
               'type'           => 'image',
               'section'        => 'sensiblewp_logo_section',
               'settings'       => 'apple_touch_72',
               'priority'       => 13,
    )));
	
    //Apple touch icon 57
    $wp_customize->add_setting(
        'apple_touch_57',
        array(
            'default-image' => '',
			'sanitize_callback' => 'esc_url_raw',
    ));
	
    $wp_customize->add_control(
        new WP_Customize_Image_Control(
            $wp_customize,
            'apple_touch_57',
            array(
               'label'          => esc_html__( 'Upload your Apple Touch Icon (57x57 pixels)', 'sensible-wp' ),
               'type'           => 'image',
               'section'        => 'sensiblewp_logo_section',
               'settings'       => 'apple_touch_57',
               'priority'       => 14,
    )));
	
	// Hero Section
	$wp_customize->add_section( 'sensiblewp_slider_section', array(
		'title'          => esc_html__( 'Home Hero Section', 'sensible-wp' ),
		'priority'       => 24, 
		'description' => esc_html__( 'Edit your Home Page Hero', 'sensible-wp'), 
	));
	
	$wp_customize->add_setting('active_hero',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	));
	
	$wp_customize->add_control( 
    'active_hero', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Hero', 'sensible-wp' ),  
        'section' => 'sensiblewp_slider_section', 
		'priority'   => 10
    )); 
	
	// Main Background
	$wp_customize->add_setting( 'sensiblewp_main_bg', array(
		'sanitize_callback' => 'esc_url_raw',
	) );

	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'sensiblewp_main_bg', array( 
		'label'    => esc_html__( 'Hero Image', 'sensible-wp' ),
		'section'  => 'sensiblewp_slider_section',  
		'settings' => 'sensiblewp_main_bg', 
		'priority'   => 20
	) ) );
	
	// First Heading
	$wp_customize->add_setting( 'sensiblewp_first_heading' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	    ) 
	);
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_first_heading', array( 
    'label' => esc_html__( 'Hero Heading', 'sensible-wp' ),    
    'section' => 'sensiblewp_slider_section',
    'settings' => 'sensiblewp_first_heading',
	'priority'   => 30
	) ) );
	
	// Hero Button Text
	$wp_customize->add_setting( 'sensiblewp_hero_button_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	    ) 
	);
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_hero_button_text', array( 
    'label' => esc_html__( 'Hero Button Text', 'sensible-wp' ),   
    'section' => 'sensiblewp_slider_section',
    'settings' => 'sensiblewp_hero_button_text',  
	'priority'   => 40 
	) ) );
	
	// Page Drop Downs 
	$wp_customize->add_setting('hero_button_url', array( 
		'capability' => 'edit_theme_options', 
        'sanitize_callback' => 'sensiblewp_sanitize_int' 
	));
	
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'hero_button_url', array( 
    	'label' => esc_html__( 'Hero Button URL', 'sensible-wp' ), 
    	'section' => 'sensiblewp_slider_section', 
		'type' => 'dropdown-pages',
    	'settings' => 'hero_button_url',
		'priority'   => 50 
	)));
	
	// Home Social Panel
	$wp_customize->add_panel( 'social_panel', array(
    'priority'       => 25,
    'capability'     => 'edit_theme_options',
    'theme_supports' => '',
    'title'          => esc_html__( 'Home Social Section', 'sensible-wp' ),
    'description'    		 => esc_html__( 'Edit your home page social media icons', 'sensible-wp' ),
	));
	
	// Page URL
	$wp_customize->add_setting( 'page_url_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	));  

	$wp_customize->add_control( 'page_url_text', array(
		'type'     => 'url',
		'label'    => esc_html__( 'External URL Option', 'sensible-wp' ), 
		'description' => esc_html__( 'If you use an external URL, leave the Widget Button Link above empty. Must include http:// before any URL.', 'sensible-wp' ),
		'section'  => 'sensiblewp_slider_section',   
		'settings' => 'page_url_text',
		'priority'   => 60
	));  
	
	// Social Section 
	$wp_customize->add_section( 'sensiblewp_settings', array(
    	'title'          => esc_html__( 'Social Media Icons', 'sensible-wp' ),
        'priority'       => 38,
		'panel' => 'social_panel',  
    ) );
	
	// Home Social Section 
	$wp_customize->add_setting('active_social',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	)); 
	
	$wp_customize->add_control( 
    'active_social', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Home Social Section', 'sensible-wp' ),
        'section' => 'sensiblewp_settings', 
		'priority'   => 1
    ));
	
	// Social Text
		$wp_customize->add_setting( 'social_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	    )); 

		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'social_text', array(
		'label'    => esc_html__( 'Socials Heading', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'social_text',
		'priority'   => 1
		) ) ); 
	
	// Social Icon Colors
	$wp_customize->add_setting( 'sensiblewp_social_color', array( 
        'default'     => '#888888', 
		'sanitize_callback' => 'sanitize_hex_color',
    ));
	
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_social_color', array(
        'label'	   => esc_html__( 'Social Icon Color', 'sensible-wp' ),
        'section'  => 'sensiblewp_settings',
        'settings' => 'sensiblewp_social_color', 
		'priority' => 1
    )));
	
	$wp_customize->add_setting( 'sensiblewp_social_color_hover', array( 
        'default'     => '#888888',  
		'sanitize_callback' => 'sanitize_hex_color',  
    ));
	
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_social_color_hover', array(
        'label'	   => esc_html__( 'Social Icon Hover Color', 'sensible-wp' ),
        'section'  => 'sensiblewp_settings',
        'settings' => 'sensiblewp_social_color_hover', 
		'priority' => 2
    )));
	
	$wp_customize->add_setting(
        'sensiblewp_social_new_window', 
        array(
            'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
            'default' => 0,
    ));
	
    $wp_customize->add_control( 
        'sensiblewp_social_new_window',
        array(
            'type' => 'checkbox',
            'label' => esc_html__( 'Open links in new window?', 'sensible-wp' ),
            'section'  => 'sensiblewp_settings',
            'priority' => 10,       
    ));
	
	// Facebook
	$wp_customize->add_setting( 'sensiblewp_fb',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_fb', array(
		'label'    => esc_html__( 'Facebook URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_fb',
		'priority'   => 30
	))); 
	
	// Twitter
	$wp_customize->add_setting( 'sensiblewp_twitter',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_twitter', array(
		'label'    => esc_html__( 'Twitter URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_twitter',
		'priority'   => 40
	))); 
	
	// LinkedIn
	$wp_customize->add_setting( 'sensiblewp_linked',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_linked', array(
		'label'    => esc_html__( 'LinkedIn URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_linked',
		'priority'   => 50
	)));
	
	// Google Plus
	$wp_customize->add_setting( 'sensiblewp_google',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_google', array(
		'label'    => esc_html__( 'Google Plus URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_google',
		'priority'   => 60
	)));
	
	// Instagram
	$wp_customize->add_setting( 'sensiblewp_instagram',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_instagram', array(
		'label'    => esc_html__( 'Instagram URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_instagram',
		'priority'   => 70
	)));
	
	// Snapchat
	$wp_customize->add_setting( 'sensiblewp_snapchat',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_snapchat', array(
		'label'    => esc_html__( 'Snapchat URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings',  
		'settings' => 'sensiblewp_snapchat',
		'priority'   => 73
	)));
	
	// Vine
	$wp_customize->add_setting( 'sensiblewp_vine',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_vine', array(
		'label'    => esc_html__( 'Vine URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_vine', 
		'priority'   => 75 
	)));
	
	// Flickr
	$wp_customize->add_setting( 'sensiblewp_flickr',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_flickr', array(
		'label'    => esc_html__( 'Flickr URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_flickr',
		'priority'   => 80
	)));
	
	// Pinterest
	$wp_customize->add_setting( 'sensiblewp_pinterest',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_pinterest', array(
		'label'    => esc_html__( 'Pinterest URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_pinterest',
		'priority'   => 90
	)));
	
	// Youtube
	$wp_customize->add_setting( 'sensiblewp_youtube',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_youtube', array(
		'label'    => esc_html__( 'YouTube URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_youtube',  
		'priority'   => 100
	)));
	
	// Vimeo
	$wp_customize->add_setting( 'sensiblewp_vimeo',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_vimeo', array(
		'label'    => esc_html__( 'Vimeo URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_vimeo',
		'priority'   => 110
	)));
	
	// Tumblr
	$wp_customize->add_setting( 'sensiblewp_tumblr',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_tumblr', array(
		'label'    => esc_html__( 'Tumblr URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_tumblr', 
		'priority'   => 120
	)));
	
	// Dribbble
	$wp_customize->add_setting( 'sensiblewp_dribbble',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_dribbble', array(
		'label'    => esc_html__( 'Dribbble URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_dribbble',
		'priority'   => 130
	)));
	
	// behance
	$wp_customize->add_setting( 'sensiblewp_behance',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_behance', array(
		'label'    => esc_html__( 'Behance URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_behance',
		'priority'   => 132
	)));
	
	// 500px
	$wp_customize->add_setting( 'sensiblewp_500px',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_500px', array(
		'label'    => esc_html__( '500px URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_500px',
		'priority'   => 134
	)));
	
	// VK
	$wp_customize->add_setting( 'sensiblewp_vk',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_vk', array(
		'label'    => esc_html__( 'VK URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_vk',
		'priority'   => 135
	)));
	
	// yelp
	$wp_customize->add_setting( 'sensiblewp_yelp',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_yelp', array(
		'label'    => esc_html__( 'Yelp URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_yelp',
		'priority'   => 140
	)));
	
	// xing
	$wp_customize->add_setting( 'sensiblewp_xing',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_xing', array(
		'label'    => esc_html__( 'Xing URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_xing',
		'priority'   => 145
	)));
	
	// skype
	$wp_customize->add_setting( 'sensiblewp_skype',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_skype', array(
		'label'    => esc_html__( 'Skype URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_skype',
		'priority'   => 150
	)));
	
	// deviantart
	$wp_customize->add_setting( 'sensiblewp_deviant',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_deviant', array(
		'label'    => esc_html__( 'DeviantArt URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_deviant',
		'priority'   => 155
	)));
	
	// reddit
	$wp_customize->add_setting( 'sensiblewp_reddit',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_reddit', array(
		'label'    => esc_html__( 'Reddit URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_reddit',
		'priority'   => 160
	)));
	
	// github
	$wp_customize->add_setting( 'sensiblewp_github',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_github', array(
		'label'    => esc_html__( 'Github URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_github',
		'priority'   => 165
	)));
	
	// codepen
	$wp_customize->add_setting( 'sensiblewp_codepen',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_codepen', array(
		'label'    => esc_html__( 'Codepen URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_codepen',
		'priority'   => 165
	)));
	
	// spotify
	$wp_customize->add_setting( 'sensiblewp_spotify',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_spotify', array(
		'label'    => esc_html__( 'Spotify URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_spotify',
		'priority'   => 170
	)));
	
	// soundcloud
	$wp_customize->add_setting( 'sensiblewp_soundcloud',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_soundcloud', array(
		'label'    => esc_html__( 'SoundCloud URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_soundcloud',
		'priority'   => 175
	)));
	
	// lastfm
	$wp_customize->add_setting( 'sensiblewp_lastfm',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_lastfm', array(
		'label'    => esc_html__( 'lastFM URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_lastfm',
		'priority'   => 180
	)));
	
	// stumbleupon
	$wp_customize->add_setting( 'sensiblewp_stumble',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_stumble', array(
		'label'    => esc_html__( 'StumbleUpon URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_stumble',
		'priority'   => 185
	)));
	
	// Weibo
	$wp_customize->add_setting( 'sensiblewp_weibo', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_weibo', array(
		'label'    => esc_html__( 'Weibo URL:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings',  
		'settings' => 'sensiblewp_weibo', 
		'priority'   => 188
	)));
	
	// Phone Number
	$wp_customize->add_setting( 'sensiblewp_phone_number_icon',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_phone_number_icon', array(
		'label'    => esc_html__( 'Phone Number:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings',
		'settings' => 'sensiblewp_phone_number_icon',
		'priority'   => 190
	)));
	
	// Email
	$wp_customize->add_setting( 'sensiblewp_email_icon', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_email_icon', array(
		'label'    => esc_html__( 'Email:', 'sensible-wp' ),
		'section'  => 'sensiblewp_settings',
		'settings' => 'sensiblewp_email_icon',
		'priority'   => 195
	))); 
	
	// RSS
	$wp_customize->add_setting( 'sensiblewp_rss',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_rss', array(
		'label'    => esc_html__( 'RSS URL:', 'sensible-wp' ), 
		'section'  => 'sensiblewp_settings', 
		'settings' => 'sensiblewp_rss',
		'priority'   => 200
	)));
	
	
	// Home Intro Panel
	$wp_customize->add_panel( 'intro_panel', array(
    'priority'       => 26,
    'capability'     => 'edit_theme_options',
    'theme_supports' => '',
    'title'          => esc_html__( 'Home Intro Section', 'sensible-wp' ),
    'description'    => esc_html__( 'Edit your home page intro settings', 'sensible-wp' ),
	));
	
	// Home Intro Section
	$wp_customize->add_section( 'sensiblewp_intro_section', array(
		'title'          => esc_html__( 'Home Intro Section', 'sensible-wp' ),
		'priority'       => 10,
		'description' => esc_html__( 'Edit your home page Intro section content', 'sensible-wp' ), 
		'panel' => 'intro_panel',
	));
	
	// Home Intro Section
	$wp_customize->add_setting('active_intro',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	); 
	
	$wp_customize->add_control( 
    'active_intro', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Home Intro Section', 'sensible-wp' ),
        'section' => 'sensiblewp_intro_section', 
		'priority'   => 1  
    ));
	
	// Intro Text
	$wp_customize->add_setting( 'intro_text' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	));
	
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'intro_text', array(
		'label'    => esc_html__( 'Intro Title Text', 'sensible-wp' ),
		'section'  => 'sensiblewp_intro_section', 
		'settings' => 'intro_text', 
		'priority'   => 2
	)));
	
	// Intro Text Box
	$wp_customize->add_setting( 'intro_textbox' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'intro_textbox', array( 
    	'label' => esc_html__( 'Intro Text Box', 'sensible-wp' ),
    	'section' => 'sensiblewp_intro_section',
    	'settings' => 'intro_textbox', 
		'type'     => 'textarea',
		'priority'   => 3
	)));
	
	// Home Services Panel
	$wp_customize->add_panel( 'services_panel', array(
    	'priority'       => 27,
    	'capability'     => 'edit_theme_options',
    	'theme_supports' => '',
    	'title'          => esc_html__( 'Home Services Section', 'sensible-wp' ),
    	'description'    => esc_html__( 'Edit your home page Services settings.', 'sensible-wp'),
	) );
	
	// Home Services Section
	$wp_customize->add_section( 'sensiblewp_services_section', array( 
		'title'          => esc_html__( 'Home Services Content', 'sensible-wp' ),
		'priority'       => 10,
		'description' => esc_html__( 'Edit your home page Services content.', 'sensible-wp'), 
		'panel' => 'services_panel',  
	));

	$wp_customize->add_setting('active_services', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'active_services', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Services Section', 'sensible-wp' ), 
        'section' => 'sensiblewp_services_section', 
		'priority'   => 10
    ));
	
	// Services Text
	$wp_customize->add_setting( 'services_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	    ) 
	); 

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'services_text', array(
		'label'    => esc_html__( 'Services Title Text', 'sensible-wp' ),
		'section'  => 'sensiblewp_services_section', 
		'settings' => 'services_text', 
		'priority'   => 20
	) ) );
	
	// Services Button Area
	$wp_customize->add_setting( 'service_button_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	    ) 
	); 

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_button_text', array(
		'label'    => esc_html__( 'Services Button Text', 'sensible-wp' ),
		'section'  => 'sensiblewp_services_section', 
		'settings' => 'service_button_text', 
		'priority'   => 30 
	) ) );
	
	// Page Drop Downs 
	$wp_customize->add_setting('service_button_url', array( 
		'capability' => 'edit_theme_options', 
        'sanitize_callback' => 'sensiblewp_sanitize_int' 
	));
	
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_button_url', array( 
    	'label' => esc_html__( 'Service Button URL', 'sensible-wp' ), 
    	'section' => 'sensiblewp_services_section', 
		'type' => 'dropdown-pages',
    	'settings' => 'service_button_url',
		'priority'   => 40
	)));
    
	//Services Columns
    $wp_customize->add_setting( 
        'sensiblewp_services_columns_number',
        array(
            'sanitize_callback' => 'absint',
            'default'           => '3',
        )
    );
	
    $wp_customize->add_control( 'sensiblewp_services_columns_number', array(
        'type'        => 'number', 
        'priority'    => 5,
        'section'     => 'sensiblewp_services_section', 
        'label'       => esc_html__('Services Columns Width', 'sensible-wp'),
		'description'       => esc_html__('Set the width of the each Services Column. 1 = 100% of the width, 4 = 25% of the width.', 'sensible-wp'), 
        'input_attrs' => array( 
            'min'   => 1,
            'max'   => 5,  
            'step'  => 1,
            'style' => 'margin-bottom: 10px;',
        ), 
  	)); 
	
	// Home Service Box 1 Section
	$wp_customize->add_section( 'sensiblewp_services_box_1', array(
		'title'          => esc_html__( 'Services Box 1', 'sensible-wp' ),
		'priority'       => 20,
		'description' => esc_html__( 'Edit your home page services box 1. Choose from any of the icons at http://fortawesome.github.io/Font-Awesome/cheatsheet/. Example: "fa-arrow-right".', 'sensible-wp'),
		'panel' => 'services_panel', 
	));
	
	$wp_customize->add_setting('active_service_1', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'active_service_1', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Service Box 1', 'sensible-wp' ),
        'section' => 'sensiblewp_services_box_1', 
		'priority'   => 1
    ));
	
	// Service Icon 1
	$wp_customize->add_setting( 'service_icon_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_icon_1', array(
		'label'    => esc_html__( 'Service Icon 1', 'sensible-wp' ),
		'section'  => 'sensiblewp_services_box_1', 
		'settings' => 'service_icon_1', 
		'priority'   => 2
	)));
	
	// Service Title 1
	$wp_customize->add_setting( 'service_title_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_title_1', array(
		'label'    => esc_html__( 'Service Title 1', 'sensible-wp' ),
		'section'  => 'sensiblewp_services_box_1',
		'settings' => 'service_title_1', 
		'priority'   => 3
	)));
	
	// Service Text 1
	$wp_customize->add_setting( 'service_text_1' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_text_1', array( 
    'label' => esc_html__( 'Service Text Box 1', 'sensible-wp' ), 
    'section' => 'sensiblewp_services_box_1',
    'settings' => 'service_text_1', 
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Home Service Box 2 Section
	$wp_customize->add_section( 'sensiblewp_services_box_2', array(
		'title'          => esc_html__( 'Services Box 2', 'sensible-wp' ),
		'priority'       => 30,
		'description' => esc_html__( 'Edit your home page services box 2. Choose from any of the icons at http://fortawesome.github.io/Font-Awesome/cheatsheet/. Example: "fa-arrow-right".', 'sensible-wp' ),
		'panel' => 'services_panel', 
	));
	
	$wp_customize->add_setting('active_service_2', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'active_service_2', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Service Box 2', 'sensible-wp' ),
        'section' => 'sensiblewp_services_box_2', 
		'priority'   => 1
    ));
	
	// Service Icon 2
	$wp_customize->add_setting( 'service_icon_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_icon_2', array(
		'label'    => esc_html__( 'Service Icon 2', 'sensible-wp' ),
		'section'  => 'sensiblewp_services_box_2', 
		'settings' => 'service_icon_2', 
		'priority'   => 2
	)));
	
	// Service Title 2
	$wp_customize->add_setting( 'service_title_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_title_2', array(
		'label'    => esc_html__( 'Service Title 2', 'sensible-wp' ),
		'section'  => 'sensiblewp_services_box_2',
		'settings' => 'service_title_2', 
		'priority'   => 3
	)));
	
	// Service Text 2
	$wp_customize->add_setting( 'service_text_2' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_text_2', array( 
    'label' => esc_html__( 'Service Text Box 2', 'sensible-wp' ), 
    'section' => 'sensiblewp_services_box_2',
    'settings' => 'service_text_2', 
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Home Service Box 3 Section
	$wp_customize->add_section( 'sensiblewp_services_box_3', array(
		'title'          => esc_html__( 'Services Box 3', 'sensible-wp' ),
		'priority'       => 40,
		'description' => esc_html__( 'Edit your home page services box 3. Choose from any of the icons at http://fortawesome.github.io/Font-Awesome/cheatsheet/. Example: "fa-arrow-right".', 'sensible-wp'),
		'panel' => 'services_panel',  
	));
	
	$wp_customize->add_setting('active_service_3', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'active_service_3', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Service Box 3', 'sensible-wp' ),
        'section' => 'sensiblewp_services_box_3', 
		'priority'   => 1
    ));
	
	// Service Icon 3
	$wp_customize->add_setting( 'service_icon_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_icon_3', array(
		'label'    => esc_html__( 'Service Icon 3', 'sensible-wp' ),
		'section'  => 'sensiblewp_services_box_3', 
		'settings' => 'service_icon_3', 
		'priority'   => 2
	)));
	
	// Service Title 3
	$wp_customize->add_setting( 'service_title_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_title_3', array(
		'label'    => esc_html__( 'Service Title 3', 'sensible-wp' ),
		'section'  => 'sensiblewp_services_box_3',
		'settings' => 'service_title_3', 
		'priority'   => 3
	)));
	
	// Service Text 3
	$wp_customize->add_setting( 'service_text_3' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'service_text_3', array( 
    'label' => esc_html__( 'Service Text Box 3', 'sensible-wp' ), 
    'section' => 'sensiblewp_services_box_3',
    'settings' => 'service_text_3',
	'type'     => 'textarea', 
	'priority'   => 4
	))); 
	
	// Blog Panel
	$wp_customize->add_panel( 'blog_panel', array(
    'priority'       => 28,
    'capability'     => 'edit_theme_options',
    'theme_supports' => '',
    'title'          => esc_html__( 'Home Blog Section', 'sensible-wp' ),
    'description' 			 => esc_html__( 'Edit your home page blog settings', 'sensible-wp' ),
	));
	
	// Home Blog Section
	$wp_customize->add_section( 'sensiblewp_blog_section', array(
		'title'          => esc_html__( 'Home Blog Section', 'sensible-wp' ),
		'priority'       => 10,
		'description' => esc_html__( 'Edit your home page Blog section', 'sensible-wp' ),
		'panel' => 'blog_panel',
	));

	$wp_customize->add_setting('active_blog',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	));
	
	$wp_customize->add_control( 
    'active_blog', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Blog Section', 'sensible-wp' ), 
        'section' => 'sensiblewp_blog_section',
		'priority'   => 1 
    ));
	
	// Blog Text
	$wp_customize->add_setting( 'blog_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'blog_text', array(
		'label'    => esc_html__( 'Blog Title Text', 'sensible-wp' ),
		'section'  => 'sensiblewp_blog_section', 
		'settings' => 'blog_text', 
		'priority'   => 2
	)));
	
	// Blog CTA
	$wp_customize->add_setting( 'blog_cta', array(
	    'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'blog_cta', array(
		'label'    => esc_html__( 'Blog Call-to-Action', 'sensible-wp' ),
		'section'  => 'sensiblewp_blog_section', 
		'settings' => 'blog_cta', 
		'priority'   => 2 
	)));
	
	// Team Panel
	$wp_customize->add_panel( 'team_panel', array(
    'priority'       => 29,
    'capability'     => 'edit_theme_options',
    'theme_supports' => '',
    'title'          => esc_html__( 'Home Team Member Section', 'sensible-wp' ),
    'description'    		 => esc_html__( 'Edit your home page team member settings', 'sensible-wp' ),
	));
	
	// Home Team Section
	$wp_customize->add_section( 'sensiblewp_team_section', array(
		'title'          => esc_html__( 'Home Team Section', 'sensible-wp' ), 
		'priority'       => 10,
		'description' 			 => esc_html__( 'Edit your home page Team section', 'sensible-wp'),
		'panel' 		 => 'team_panel',   
	));

	$wp_customize->add_setting('active_team',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	));
	
	$wp_customize->add_control( 
    'active_team', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Team Section Content', 'sensible-wp' ),  
        'section' => 'sensiblewp_team_section',
		'priority'   => 10 
    ));
	
	// Team Text
	$wp_customize->add_setting( 'team_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'team_text', array(
		'label'    => esc_html__( 'Team Title Text', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_section', 
		'settings' => 'team_text', 
		'priority'   => 20
	))); 

	$wp_customize->add_setting('active_team',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	));
	
	// Team Member Button Area
	$wp_customize->add_setting( 'team_button_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	    ) 
	); 

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'team_button_text', array(
		'label'    => esc_html__( 'Team Member Button Text', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_section', 
		'settings' => 'team_button_text', 
		'priority'   => 30
	) ) );
	
	// Team Member Page Drop Downs 
	$wp_customize->add_setting('team_button_url', array( 
		'capability' => 'edit_theme_options', 
        'sanitize_callback' => 'sensiblewp_sanitize_int' 
	));
	
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'team_button_url', array( 
    	'label' => esc_html__( 'Team Member Button URL', 'sensible-wp' ), 
    	'section' => 'sensiblewp_team_section', 
		'type' => 'dropdown-pages',
    	'settings' => 'team_button_url', 
		'priority'   => 40
	)));
	
	//Team Members Columns
    $wp_customize->add_setting( 
        'sensiblewp_team_columns_number',
        array(
            'sanitize_callback' => 'absint',
            'default'           => '3',
        )
    );
	
    $wp_customize->add_control( 'sensiblewp_team_columns_number', array(
        'type'        => 'number', 
        'priority'    => 50,
        'section'     => 'sensiblewp_team_section', 
        'label'       => esc_html__('Team Member Columns Width', 'sensible-wp'),
		'description'       => esc_html__('Set the width of the each Team Member Column. 1 = 100% of the width, 4 = 25% of the width.', 'sensible-wp'), 
        'input_attrs' => array( 
            'min'   => 1,
            'max'   => 5,  
            'step'  => 1,
            'style' => 'margin-bottom: 10px;', 
        ), 
  	));
	
	// Home Team Member 1
	$wp_customize->add_section( 'sensiblewp_team_member_1', array(
		'title'          => esc_html__( 'Team Member 1', 'sensible-wp' ),  
		'priority'       => 20,
		'description' => esc_html__( 'Edit your Team Member 1', 'sensible-wp' ),
		'panel' => 'team_panel',   
	));
	
	$wp_customize->add_setting('active_member_1', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'active_member_1', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Member Box 1', 'sensible-wp' ),
        'section' => 'sensiblewp_team_member_1', 
		'priority'   => 1
    ));
	
	// Team Member Picture 1
	$wp_customize->add_setting( 'member_image_1', array(    
		'sanitize_callback' => 'esc_url_raw',
	));

	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'member_image_1', array( 
		'label'    => esc_html__( 'Team Member Image 1', 'sensible-wp' ), 
		'section'  => 'sensiblewp_team_member_1',  
		'settings' => 'member_image_1',  
		'priority'   => 2
	))); 
	
	// Team Member Name 1
	$wp_customize->add_setting( 'member_name_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_name_1', array(
		'label'    => esc_html__( 'Team Member Name 1', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_1', 
		'settings' => 'member_name_1',
		'priority'   => 3
	))); 
	
	// Team Member Text 1
	$wp_customize->add_setting( 'member_text_1' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_text_1', array( 
    'label' => esc_html__( 'Team Member Text Box 1', 'sensible-wp' ), 
    'section' => 'sensiblewp_team_member_1',
    'settings' => 'member_text_1', 
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Team Member Facebook 1
	$wp_customize->add_setting( 'member_fb_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_fb_1', array(
		'label'    => esc_html__( 'Team Member Facebook 1', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_1', 
		'settings' => 'member_fb_1',
		'priority'   => 5
	))); 
	
	// Team Member Twitter 1
	$wp_customize->add_setting( 'member_twitter_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_twitter_1', array(
		'label'    => esc_html__( 'Team Member Twitter 1', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_1', 
		'settings' => 'member_twitter_1',
		'priority'   => 6
	))); 
	
	// Team Member LinkedIn 1
	$wp_customize->add_setting( 'member_linked_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_linked_1', array(
		'label'    => esc_html__( 'Team Member LinkedIn 1', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_1', 
		'settings' => 'member_linked_1',
		'priority'   => 7
	))); 
	
	// Team Member Google 1
	$wp_customize->add_setting( 'member_google_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_google_1', array(
		'label'    => esc_html__( 'Team Member Google 1', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_1', 
		'settings' => 'member_google_1',
		'priority'   => 8
	))); 
	
	// Team Member Email 1
	$wp_customize->add_setting( 'member_email_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_email_1', array(
		'label'    => esc_html__( 'Team Member Email 1', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_1', 
		'settings' => 'member_email_1',
		'priority'   => 9
	)));  
	
	// Home Team Member 2
	$wp_customize->add_section( 'sensiblewp_team_member_2', array(
		'title'          => esc_html__( 'Team Member 2', 'sensible-wp' ),  
		'priority'       => 30,
		'description' => esc_html__( 'Edit your Team Member 2', 'sensible-wp' ),
		'panel' => 'team_panel',   
	));
	
	$wp_customize->add_setting('active_member_2', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'active_member_2', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Member Box 2', 'sensible-wp' ),  
        'section' => 'sensiblewp_team_member_2', 
		'priority'   => 1
    ));
	
	// Team Member Picture 2
	$wp_customize->add_setting( 'member_image_2', array(    
		'sanitize_callback' => 'esc_url_raw',
	));

	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'member_image_2', array( 
		'label'    => esc_html__( 'Team Member Image 2', 'sensible-wp' ), 
		'section'  => 'sensiblewp_team_member_2',  
		'settings' => 'member_image_2',  
		'priority'   => 2
	))); 
	
	// Team Member Name 2
	$wp_customize->add_setting( 'member_name_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_name_2', array(
		'label'    => esc_html__( 'Team Member Name 2', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_2', 
		'settings' => 'member_name_2',
		'priority'   => 3
	))); 
	
	// Team Member Text 2
	$wp_customize->add_setting( 'member_text_2' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_text_2', array( 
    'label' => esc_html__( 'Team Member Text Box 2', 'sensible-wp' ), 
    'section' => 'sensiblewp_team_member_2',
    'settings' => 'member_text_2', 
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Team Member Facebook 2
	$wp_customize->add_setting( 'member_fb_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_fb_2', array(
		'label'    => esc_html__( 'Team Member Facebook 2', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_2', 
		'settings' => 'member_fb_2',
		'priority'   => 5
	))); 
	
	// Team Member Twitter 2
	$wp_customize->add_setting( 'member_twitter_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_twitter_2', array(
		'label'    => esc_html__( 'Team Member Twitter 2', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_2', 
		'settings' => 'member_twitter_2',
		'priority'   => 6
	))); 
	
	// Team Member LinkedIn 2
	$wp_customize->add_setting( 'member_linked_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_linked_2', array(
		'label'    => esc_html__( 'Team Member LinkedIn 2', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_2', 
		'settings' => 'member_linked_2',
		'priority'   => 7
	))); 
	
	// Team Member Google 2
	$wp_customize->add_setting( 'member_google_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_google_2', array(
		'label'    => esc_html__( 'Team Member Google 2', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_2', 
		'settings' => 'member_google_2',
		'priority'   => 8
	))); 
	
	// Team Member Email 2
	$wp_customize->add_setting( 'member_email_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_email_2', array(
		'label'    => esc_html__( 'Team Member Email 2', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_2', 
		'settings' => 'member_email_2',
		'priority'   => 9
	)));  
	
	// Home Team Member 3
	$wp_customize->add_section( 'sensiblewp_team_member_3', array(
		'title'          => esc_html__( 'Team Member 3', 'sensible-wp' ), 
		'priority'       => 40,
		'description' => esc_html__( 'Edit your Team Member 3', 'sensible-wp' ),
		'panel' => 'team_panel',   
	));
	
	$wp_customize->add_setting('active_member_3', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'active_member_3', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Member Box 3', 'sensible-wp' ), 
        'section' => 'sensiblewp_team_member_3', 
		'priority'   => 1
    ));
	
	// Team Member Picture 3
	$wp_customize->add_setting( 'member_image_3', array(    
		'sanitize_callback' => 'esc_url_raw',
	));

	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'member_image_3', array( 
		'label'    => esc_html__( 'Team Member Image 3', 'sensible-wp' ), 
		'section'  => 'sensiblewp_team_member_3',  
		'settings' => 'member_image_3',  
		'priority'   => 2
	))); 
	
	// Team Member Name 3
	$wp_customize->add_setting( 'member_name_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_name_3', array(
		'label'    => esc_html__( 'Team Member Name 3', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_3', 
		'settings' => 'member_name_3',
		'priority'   => 3
	))); 
	
	// Team Member Text 3
	$wp_customize->add_setting( 'member_text_3' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_text_3', array( 
    'label' => esc_html__( 'Team Member Text Box 3', 'sensible-wp' ), 
    'section' => 'sensiblewp_team_member_3',
    'settings' => 'member_text_3', 
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Team Member Facebook 3
	$wp_customize->add_setting( 'member_fb_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_fb_3', array(
		'label'    => esc_html__( 'Team Member Facebook 3', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_3', 
		'settings' => 'member_fb_3',
		'priority'   => 5
	))); 
	
	// Team Member Twitter 3
	$wp_customize->add_setting( 'member_twitter_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_twitter_3', array(
		'label'    => esc_html__( 'Team Member Twitter 3', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_3', 
		'settings' => 'member_twitter_3',
		'priority'   => 6
	))); 
	
	// Team Member LinkedIn 3
	$wp_customize->add_setting( 'member_linked_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_linked_3', array(
		'label'    => esc_html__( 'Team Member LinkedIn 3', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_3', 
		'settings' => 'member_linked_3',
		'priority'   => 7
	))); 
	
	// Team Member Google 3
	$wp_customize->add_setting( 'member_google_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_google_3', array(
		'label'    => esc_html__( 'Team Member Google 3', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_3', 
		'settings' => 'member_google_3',
		'priority'   => 8
	))); 
	
	// Team Member Email 3
	$wp_customize->add_setting( 'member_email_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'member_email_3', array(
		'label'    => esc_html__( 'Team Member Email 3', 'sensible-wp' ),
		'section'  => 'sensiblewp_team_member_3', 
		'settings' => 'member_email_3',
		'priority'   => 9 
	)));
	
	// Widget Panel
	$wp_customize->add_panel( 'widget_panel', array(
    'priority'       => 30,
    'capability'     => 'edit_theme_options',
    'theme_supports' => '',
    'title'          => esc_html__( 'Home Widget Section', 'sensible-wp' ),
    'description'    => esc_html__( 'Edit your home page widget settings. The main body of the widget area can be edited under the Widgets section below.', 'sensible-wp' ),
	));
	
	// Home Widget Section
	$wp_customize->add_section( 'sensiblewp_widget_section', array(
		'title'          => esc_html__( 'Home Widget Section', 'sensible-wp' ), 
		'priority'       => 10,
		'description' => esc_html__( 'Customize the home widget area. The main body of the widget area can be edited under the Widgets section below.', 'sensible-wp' ),
		'panel' => 'widget_panel', 
	));
	
	// Number of Widget Columns 
	$wp_customize->add_setting( 'sensiblewp_widget_columns', array(
		'default'	        => 'option1',
		'sanitize_callback' => 'sensiblewp_sanitize_widget_content',
	));

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_widget_columns', array(
		'label'    => esc_html__( 'Number of Widget Columns', 'sensible-wp' ),
		'description'    => esc_html__( 'Select the number of widget columns to use. 1 Column will take up the entire widget area, while 4 columns will give space to use 4 widgets for content.', 'sensible-wp' ),
		'section'  => 'sensiblewp_widget_section', 
		'settings' => 'sensiblewp_widget_columns',
		'type'     => 'radio',
		'priority'   => 5,  
		'choices'  => array(
			'option1' => esc_html__( '1 Column', 'sensible-wp' ),
			'option2' => esc_html__( '2 Columns', 'sensible-wp' ), 
			'option3' => esc_html__( '3 Columns', 'sensible-wp' ),
			'option4' => esc_html__( '4 Columns', 'sensible-wp' ),
			),
	)));
	
	//New Widget Background Image
	$wp_customize->add_setting( 'sensiblewp_new_widget_area_background',
		array(
			'sanitize_callback' => 'esc_url_raw',
	));
	
	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'sensiblewp_new_widget_area_background', array(
		'label'	=> esc_html__( 'Widget Background Area', 'sensible-wp' ),
		'type'           => 'image',
		'section'	=> 'sensiblewp_widget_section',
		'settings' => 'sensiblewp_new_widget_area_background', 
		'priority'	=> 20
	)));
	
	// Icon
	$wp_customize->add_setting( 'home_widget_icon' , array( 
		'default' => 'fa-paper-plane',
	    'sanitize_callback' => 'sensiblewp_sanitize_text' 
	));
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'home_widget_icon', array(
		'description' => esc_html__( 'Choose from any of the icons at http://fortawesome.github.io/Font-Awesome/cheatsheet/. Example: "fa-arrow-right".', 'sensible-wp' ), 
    	'label' => esc_html__( 'Widget Icon', 'sensible-wp' ),  
    	'section' => 'sensiblewp_widget_section',
    	'settings' => 'home_widget_icon',
		'priority'   => 30
	))); 

	// hide section
	$wp_customize->add_setting('active_home_widget',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	));
	
	$wp_customize->add_control( 
    'active_home_widget', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Widget Section', 'sensible-wp' ),  
        'section' => 'sensiblewp_widget_section',
		'priority'   => 1
    ));
	
	// Widget Text
	$wp_customize->add_setting('sensiblewp_widget_button_text', array(
		'sanitize_callback' => 'sensiblewp_sanitize_text' 
	));
	
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_widget_button_text', array(
		'label' => esc_html__( 'Widget Button Text', 'sensible-wp' ),
		'section' => 'sensiblewp_widget_section',
		'settings' => 'sensiblewp_widget_button_text',
		'priority' => 40
	)));
	
	//Page Drop Downs
	$wp_customize->add_setting( 'sensiblewp_widget_button_url', array(
		'capability' => 'edit_theme_options',
		'sanitize_callback' => 'absint' 
	));
	
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_widget_button_url', array(
		'label' => esc_html__( 'Widget Button URL', 'sensible-wp' ),
		'section' => 'sensiblewp_widget_section',
		'type' => 'dropdown-pages',
		'settings' => 'sensiblewp_widget_button_url',
		'priority' => 50
	))); 
	
	// Footer Panel
	$wp_customize->add_panel( 'sensiblewp_footer_panel', array(
    'priority'       => 32, 
    'capability'     => 'edit_theme_options',
    'theme_supports' => '',
    'title'          => esc_html__( 'Footer Options', 'sensible-wp' ),
    'description'    		 => esc_html__( 'Edit your footer options', 'sensible-wp' ),
	)); 
	 
	// Add Footer Section
	$wp_customize->add_section( 'footer-custom' , array(
    	'title' => esc_html__( 'Footer', 'sensible-wp' ),
    	'priority' => 32,
    	'description' => esc_html__( 'Customize your footer area', 'sensible-wp' ),
		'panel' => 'sensiblewp_footer_panel' 
	) );
	
	// Hide Footer Section 
	$wp_customize->add_setting('active_footer_contact',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	)); 
	
	$wp_customize->add_control( 
    'active_footer_contact', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Footer Top Section', 'sensible-wp' ), 
        'section' => 'footer-custom', 
		'priority'   => 12 
    ));
	
	// Footer Social Section 
	$wp_customize->add_setting('active_footer_social',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	)); 
	
	$wp_customize->add_control( 
    'active_footer_social', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Footer Social Section', 'sensible-wp' ),
        'section' => 'footer-custom', 
		'priority'   => 10
    ));
	
	// Social Text
		$wp_customize->add_setting( 'footer_social_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	    )); 

		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'footer_social_text', array(
		'label'    => esc_html__( 'Footer Social Heading', 'sensible-wp' ),
		'section'  => 'footer-custom',
		'settings' => 'footer_social_text', 
		'priority'   => 11
		) ) ); 
	
	// Phone Text
	$wp_customize->add_setting( 'footer_title_text',
	array(
	    'sanitize_callback' => 'sensiblewp_sanitize_text',
	) 
	);

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'footer_title_text', array(
		'label'    => esc_html__( 'Footer Title Text', 'sensible-wp' ),
		'section'  => 'footer-custom', 
		'settings' => 'footer_title_text', 
		'priority'   => 20
	) ) );
	
	// Bottom Footer Icon 1
	$wp_customize->add_setting( 'bottom_footer_icon_1', array( 
		'default' => 'fa-map-marker',
	    'sanitize_callback' => 'sensiblewp_sanitize_text',
	));
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'bottom_footer_icon_1', array(  
    'label' => esc_html__( 'First Icon', 'sensible-wp' ),  
    'section' => 'footer-custom', 
    'settings' => 'bottom_footer_icon_1', 
	'priority'   => 30 
	)));
	
	// Address Text
	$wp_customize->add_setting( 'first_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'first_text', array(
		'label'    => esc_html__( 'Footer First Text', 'sensible-wp' ),
		'section'  => 'footer-custom', 
		'settings' => 'first_text', 
		'priority'   => 40
	)));
	
	// Footer Address
	$wp_customize->add_setting( 'sensiblewp_footer_first',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	));
	
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_footer_first', array( 
    'label' => esc_html__( 'Footer First Column', 'sensible-wp' ),
    'section' => 'footer-custom',
    'settings' => 'sensiblewp_footer_first', 
	'type'     => 'textarea', 
	'priority'   => 50
	) ) );
	
	// Bottom Footer Icon 2
	$wp_customize->add_setting( 'bottom_footer_icon_2' , array( 
		'default' => 'fa-mobile',
	    'sanitize_callback' => 'sensiblewp_sanitize_text'
	)); 
	
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'bottom_footer_icon_2', array(  
    'label' => esc_html__( 'Second Icon', 'sensible-wp' ),  
    'section' => 'footer-custom',
    'settings' => 'bottom_footer_icon_2',
	'priority'   => 60
	)));
	
	// Phone Text
	$wp_customize->add_setting( 'second_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	));
		
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'second_text', array(
		'label'    => esc_html__( 'Footer Second Text', 'sensible-wp' ),
		'section'  => 'footer-custom', 
		'settings' => 'second_text', 
		'priority'   => 70
	)));
	
	// Footer Phone
	$wp_customize->add_setting( 'sensiblewp_footer_second',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_footer_second', array(
    'label' => esc_html__( 'Footer Second Column', 'sensible-wp' ),
    'section' => 'footer-custom',
    'settings' => 'sensiblewp_footer_second',
	'type'     => 'textarea',   
	'priority'   => 80
	)));
	
	// Bottom Footer Icon 3
	$wp_customize->add_setting( 'bottom_footer_icon_3' , array( 
		'default' => 'fa-envelope-o', 
		'sanitize_callback' => 'sensiblewp_sanitize_text' 
	));   
	
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'bottom_footer_icon_3', array(  
    'label' => esc_html__( 'Third Icon', 'sensible-wp' ), 
    'section' => 'footer-custom',
    'settings' => 'bottom_footer_icon_3',
	'priority'   => 90
	)));
	
	// Email Text
	$wp_customize->add_setting( 'third_text',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	));

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'third_text', array(
		'label'    => esc_html__( 'Footer Third Text', 'sensible-wp' ),
		'section'  => 'footer-custom',   
		'settings' => 'third_text', 
		'priority'   => 100
	)));
	
	// Footer Contact
	$wp_customize->add_setting( 'sensiblewp_footer_third',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	));
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_footer_third', array(
    'label' => esc_html__( 'Footer Third Column', 'sensible-wp' ),
    'section' => 'footer-custom',
    'settings' => 'sensiblewp_footer_third',  
	'type'     => 'textarea',   
	'priority'   => 110
	)));

	// Footer Byline Text 
	$wp_customize->add_setting( 'sensiblewp_footerid',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	));
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_footerid', array(
    'label' => esc_html__( 'Footer Byline Text', 'sensible-wp' ),
    'section' => 'footer-custom', 
    'settings' => 'sensiblewp_footerid',
	'priority'   => 120
	))); 
	
	$wp_customize->add_setting( 'sensiblewp_footer_color', array( 
        'default'     => '#242830',  
        'sanitize_callback' => 'sanitize_hex_color', 
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_footer_color', array(
        'label'	   => esc_html__( 'Footer Background Color', 'sensible-wp'),
        'section'  => 'footer-custom',
        'settings' => 'sensiblewp_footer_color',
		'priority' => 125
    )));
	
	$wp_customize->add_setting( 'sensiblewp_footer_text_color', array( 
        'default'     => '#ffffff', 
        'sanitize_callback' => 'sanitize_hex_color', 
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_footer_text_color', array(
        'label'	   => esc_html__( 'Footer Text Color', 'sensible-wp'),
        'section'  => 'footer-custom',
        'settings' => 'sensiblewp_footer_text_color', 
		'priority' => 135
    )));
	
	$wp_customize->add_setting( 'sensiblewp_footer_link_color', array( 
        'default'     => '#b3b3b3',
        'sanitize_callback' => 'sanitize_hex_color', 
    ));
 
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'sensiblewp_footer_link_color', array(
        'label'	   => esc_html__( 'Footer Link Color', 'sensible-wp'),  
        'section'  => 'footer-custom',
        'settings' => 'sensiblewp_footer_link_color', 
		'priority' => 140
    )));

    // Choose excerpt or full content on blog
    $wp_customize->add_section( 'sensiblewp_layout_section' , array( 
	    'title'       => esc_html__( 'Blog Layout', 'sensible-wp' ),
	    'priority'    => 22, 
	    'description' => esc_html__( 'Change how Sensible displays posts', 'sensible-wp' ),
	));
	
	// Blog Title
	$wp_customize->add_setting( 'sensiblewp_blog_title',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
			'default' => 'Blog'
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_blog_title', array(
		'label'    => esc_html__( 'Posts Page Title', 'sensible-wp' ),
		'section'  => 'sensiblewp_layout_section', 
		'settings' => 'sensiblewp_blog_title',
		'priority'   => 10 
	))); 
	
	// Blog Background
	$wp_customize->add_setting( 'sensiblewp_blog_bg', array(
		'sanitize_callback' => 'esc_url_raw',
	) );

	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'sensiblewp_blog_bg', array( 
		'label'    => esc_html__( 'Posts Page Image', 'sensible-wp' ),
		'section'  => 'sensiblewp_layout_section',  
		'settings' => 'sensiblewp_blog_bg',   
		'priority'   => 20,
	)));

	$wp_customize->add_setting( 'sensiblewp_post_content', array(
		'default'	        => 'option1',
		'sanitize_callback' => 'sensiblewp_sanitize_index_content',
	));
	
	// Post Content
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'sensiblewp_post_content', array(
		'label'    => esc_html__( 'Post content', 'sensible-wp' ),
		'section'  => 'sensiblewp_layout_section',
		'settings' => 'sensiblewp_post_content',
		'type'     => 'radio',
		'priority'   => 30,
		'choices'  => array(
			'option1' => 'Excerpts',
			'option2' => 'Full content',
			),
	)));
	
	//Excerpt
    $wp_customize->add_setting(
        'exc_length',
        array(
            'sanitize_callback' => 'absint',
            'default'           => '30',
    )); 
	
    $wp_customize->add_control( 'exc_length', array( 
        'type'        => 'number',
        'priority'    => 2, 
        'section'     => 'sensiblewp_layout_section',
        'label'       => esc_html__('Excerpt length', 'sensible-wp'),
        'description' => esc_html__('Choose your excerpt length here. Default: 30 words', 'sensible-wp'),
		'priority'   => 40,
        'input_attrs' => array(
            'min'   => 10,
            'max'   => 200,
            'step'  => 5
        ), 
	)); 
	
	// Page Services Panel
	$wp_customize->add_panel( 'services_page_panel', array(
    'priority'       => 36,
    'capability'     => 'edit_theme_options',
    'theme_supports' => '',
    'title'          => esc_html__( 'Services Page Section', 'sensible-wp' ),
    'description'    		 => esc_html__( 'Edit your Services page settings.', 'sensible-wp' ),
	) );
	
	// Services Page Section
	$wp_customize->add_section( 'sensiblewp_services_page_section', array(
		'title'          => esc_html__( 'Services Page Content', 'sensible-wp' ),
		'priority'       => 10,
		'description' 			 => esc_html__( 'Edit your home page Services content.', 'sensible-wp' ),
		'panel' => 'services_page_panel',  
	));
	
	//Services Columns
    $wp_customize->add_setting( 
        'sensiblewp_services_page_columns_number',
        array(
            'sanitize_callback' => 'absint',
            'default'           => '3',
        )
    );
	
    $wp_customize->add_control( 'sensiblewp_services_page_columns_number', array(
        'type'        => 'number', 
        'priority'    => 5,
        'section'     => 'sensiblewp_services_page_section', 
        'label'       => esc_html__('Services Columns Width', 'sensible-wp'),
		'description'       => esc_html__('Set the width of the each Services Column. 1 = 100% of the width, 4 = 25% of the width.', 'sensible-wp'), 
        'input_attrs' => array( 
            'min'   => 1,
            'max'   => 5,  
            'step'  => 1,
            'style' => 'margin-bottom: 10px;',
        ), 
  	)); 
	
	// Page Service Box 1 Section
	$wp_customize->add_section( 'sensiblewp_page_services_box_1', array(
		'title'          => esc_html__( 'Services Page Box 1', 'sensible-wp' ),
		'priority'       => 20,
		'description' => esc_html__( 'Edit your services page box 1. Choose from any of the icons at http://fortawesome.github.io/Font-Awesome/cheatsheet/. Example: "fa-arrow-right".', 'sensible-wp' ),
		'panel' => 'services_page_panel', 
	));
	
	$wp_customize->add_setting('active_page_service_1',  
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'active_page_service_1', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Service Page Box 1', 'sensible-wp' ), 
        'section' => 'sensiblewp_page_services_box_1',
		'priority'   => 1
    ));
	
	// Page Service Icon 1
	$wp_customize->add_setting( 'page_service_icon_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_service_icon_1', array(
		'label'    => esc_html__( 'Service Page Icon 1', 'sensible-wp' ),
		'section'  => 'sensiblewp_page_services_box_1', 
		'settings' => 'page_service_icon_1', 
		'priority'   => 2
	)));
	
	// Service Page Title 1
	$wp_customize->add_setting( 'page_service_title_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_service_title_1', array(
		'label'    => esc_html__( 'Service Page Title 1', 'sensible-wp' ),
		'section'  => 'sensiblewp_page_services_box_1',
		'settings' => 'page_service_title_1', 
		'priority'   => 3
	)));
	
	// Service Page Text 1
	$wp_customize->add_setting( 'page_service_text_1' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_service_text_1', array( 
    'label' => esc_html__( 'Service Page Text Box 1', 'sensible-wp' ), 
    'section' => 'sensiblewp_page_services_box_1',
    'settings' => 'page_service_text_1', 
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Service Page Box 2 Section
	$wp_customize->add_section( 'sensiblewp_page_services_box_2', array(
		'title'          => esc_html__( 'Services Page Box 2', 'sensible-wp' ),
		'priority'       => 30,
		'description' 			 => esc_html__( 'Edit your services page box 2. Choose from any of the icons at http://fortawesome.github.io/Font-Awesome/cheatsheet/. Example: "fa-arrow-right".', 'sensible-wp' ),
		'panel' => 'services_page_panel', 
	));
	
	$wp_customize->add_setting('active_page_service_2', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'active_page_service_2', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Service Page Box 2', 'sensible-wp' ),
        'section' => 'sensiblewp_page_services_box_2', 
		'priority'   => 1
    ));
	
	// Service Page Icon 2
	$wp_customize->add_setting( 'page_service_icon_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_service_icon_2', array(
		'label'    => esc_html__( 'Service Page Icon 2', 'sensible-wp' ),
		'section'  => 'sensiblewp_page_services_box_2', 
		'settings' => 'page_service_icon_2', 
		'priority'   => 2
	)));
	
	// Service Page Title 2
	$wp_customize->add_setting( 'page_service_title_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_service_title_2', array(
		'label'    => esc_html__( 'Service Page Title 2', 'sensible-wp' ),
		'section'  => 'sensiblewp_page_services_box_2',
		'settings' => 'page_service_title_2', 
		'priority'   => 3
	)));
	
	// Service Page Text 2
	$wp_customize->add_setting( 'page_service_text_2' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_service_text_2', array( 
    'label' => esc_html__( 'Service Page Text Box 2', 'sensible-wp' ), 
    'section' => 'sensiblewp_page_services_box_2',
    'settings' => 'page_service_text_2', 
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Service Page Box 3 Section
	$wp_customize->add_section( 'sensiblewp_page_services_box_3', array(
		'title'          => esc_html__( 'Services Page Box 3', 'sensible-wp' ),
		'priority'       => 40,
		'description'			 => esc_html__( 'Edit your services page box 3. Choose from any of the icons at http://fortawesome.github.io/Font-Awesome/cheatsheet/. Example: "fa-arrow-right".', 'sensible-wp' ),
		'panel' 		 => 'services_page_panel',   
	));
	
	$wp_customize->add_setting('active_page_service_3', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox', 
	    ) 
	);  
	
	$wp_customize->add_control( 
    'active_page_service_3', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Service Page Box 3', 'sensible-wp' ), 
        'section' => 'sensiblewp_page_services_box_3', 
		'priority'   => 1
    ));
	
	// Service Page Icon 3
	$wp_customize->add_setting( 'page_service_icon_3', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_service_icon_3', array(
		'label'    => esc_html__( 'Service Page Icon 3', 'sensible-wp' ),
		'section'  => 'sensiblewp_page_services_box_3', 
		'settings' => 'page_service_icon_3',
		'priority'   => 2
	)));
	
	// Service Page Title 3
	$wp_customize->add_setting( 'page_service_title_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_service_title_3', array(
		'label'    => esc_html__( 'Service Page Title 3', 'sensible-wp' ),
		'section'  => 'sensiblewp_page_services_box_3',
		'settings' => 'page_service_title_3', 
		'priority'   => 3
	)));
	
	// Service Page Text 3
	$wp_customize->add_setting( 'page_service_text_3' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_service_text_3', array( 
    'label' => esc_html__( 'Service Page Text Box 3', 'sensible-wp' ), 
    'section' => 'sensiblewp_page_services_box_3',
    'settings' => 'page_service_text_3',
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Team Page Panel
	$wp_customize->add_panel( 'page_team_panel', array(
    'priority'       => 37,
    'capability'     => 'edit_theme_options',
    'theme_supports' => '',
    'title'          => esc_html__( 'Team Member Page Section', 'sensible-wp' ),
    'description'    		 => esc_html__( 'Edit your team member page settings.', 'sensible-wp' ), 
	)); 
	
	// Team Page Section
	$wp_customize->add_section( 'page_sensiblewp_team_section', array(
		'title'          => esc_html__( 'Team Page Section', 'sensible-wp' ),
		'priority'       => 10,
		'description' 			 => esc_html__( 'Edit your Team Member page section.', 'sensible-wp' ),
		'panel' => 'page_team_panel',   
	));
	
	//Team Members Columns
    $wp_customize->add_setting( 
        'sensiblewp_team_page_columns_number',
        array(
            'sanitize_callback' => 'absint',
            'default'           => '3',
    ));
	
    $wp_customize->add_control( 'sensiblewp_team_page_columns_number', array(
        'type'        => 'number',
        'priority'    => 50,
        'section'     => 'page_sensiblewp_team_section',
        'label'       => esc_html__('Team Member Columns Width', 'sensible-wp'),
		'description' => esc_html__('Set the width of the each Team Member Column. 1 = 100% of the width, 4 = 25% of the width.', 'sensible-wp'), 
        'input_attrs' => array( 
            'min'   => 1,
            'max'   => 5,
            'step'  => 1,
            'style' => 'margin-bottom: 10px;',
        ), 
  	));
	
	// Page Team Member 1
	$wp_customize->add_section( 'page_sensiblewp_team_member_1', array(
		'title'          => esc_html__( 'Team Member 1', 'sensible-wp' ),
		'priority'       => 20,
		'description' => esc_html__( 'Edit your page - Team Member 1', 'sensible-wp' ),
		'panel' => 'page_team_panel',   
	));
	
	$wp_customize->add_setting('page_active_member_1', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'page_active_member_1', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Member Box 1', 'sensible-wp' ),
        'section' => 'page_sensiblewp_team_member_1', 
		'priority'   => 1
    ));
	
	// Page - Team Member Picture 1
	$wp_customize->add_setting( 'page_member_image_1', array(    
		'sanitize_callback' => 'esc_url_raw',
	));

	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'page_member_image_1', array( 
		'label'    => esc_html__( 'Team Member Image 1', 'sensible-wp' ), 
		'section'  => 'page_sensiblewp_team_member_1',  
		'settings' => 'page_member_image_1',  
		'priority'   => 2
	))); 
	
	// Page - Team Member Name 1
	$wp_customize->add_setting( 'page_member_name_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_name_1', array(
		'label'    => esc_html__( 'Team Member Name 1', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_1', 
		'settings' => 'page_member_name_1',
		'priority'   => 3
	))); 
	
	// Page - Team Member Text 1
	$wp_customize->add_setting( 'page_member_text_1' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_text_1', array( 
    'label' => esc_html__( 'Team Member Text Box 1', 'sensible-wp' ), 
    'section' => 'page_sensiblewp_team_member_1',
    'settings' => 'page_member_text_1', 
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Page - Team Member Facebook 1
	$wp_customize->add_setting( 'page_member_fb_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_fb_1', array(
		'label'    => esc_html__( 'Team Member Facebook 1', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_1', 
		'settings' => 'page_member_fb_1',
		'priority'   => 5
	))); 
	
	// Page - Team Member Twitter 1
	$wp_customize->add_setting( 'page_member_twitter_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_twitter_1', array(
		'label'    => esc_html__( 'Team Member Twitter 1', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_1', 
		'settings' => 'page_member_twitter_1',
		'priority'   => 6
	))); 
	
	// Page - Team Member LinkedIn 1
	$wp_customize->add_setting( 'page_member_linked_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_linked_1', array(
		'label'    => esc_html__( 'Team Member LinkedIn 1', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_1', 
		'settings' => 'page_member_linked_1',
		'priority'   => 7
	))); 
	
	// Page - Team Member Google 1
	$wp_customize->add_setting( 'page_member_google_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_google_1', array(
		'label'    => esc_html__( 'Team Member Google 1', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_1', 
		'settings' => 'page_member_google_1',
		'priority'   => 8
	))); 
	
	// Page - Team Member Email 1
	$wp_customize->add_setting( 'page_member_email_1',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_email_1', array(
		'label'    => esc_html__( 'Team Member Email 1', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_1', 
		'settings' => 'page_member_email_1',
		'priority'   => 9
	)));  
	
	// Page - Home Team Member 2
	$wp_customize->add_section( 'page_sensiblewp_team_member_2', array(
		'title'          => esc_html__( 'Team Member 2', 'sensible-wp' ),
		'priority'       => 30,
		'description' => esc_html__( 'Edit your Team Member 2', 'sensible-wp' ),
		'panel' => 'page_team_panel',   
	));
	
	$wp_customize->add_setting('page_active_member_2', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'page_active_member_2', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Member Box 2', 'sensible-wp' ),
        'section' => 'page_sensiblewp_team_member_2', 
		'priority'   => 1
    ));
	
	// Page - Team Member Picture 2
	$wp_customize->add_setting( 'page_member_image_2', array(    
		'sanitize_callback' => 'esc_url_raw',
	));

	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'page_member_image_2', array( 
		'label'    => esc_html__( 'Team Member Image 2', 'sensible-wp' ), 
		'section'  => 'page_sensiblewp_team_member_2',  
		'settings' => 'page_member_image_2',  
		'priority'   => 2
	))); 
	
	// Page - Team Member Name 2
	$wp_customize->add_setting( 'page_member_name_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_name_2', array(
		'label'    => esc_html__( 'Team Member Name 2', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_2', 
		'settings' => 'page_member_name_2',
		'priority'   => 3
	))); 
	
	// Page - Team Member Text 2
	$wp_customize->add_setting( 'page_member_text_2' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_text_2', array( 
    'label' => esc_html__( 'Team Member Text Box 2', 'sensible-wp' ), 
    'section' => 'page_sensiblewp_team_member_2',
    'settings' => 'page_member_text_2', 
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Page - Team Member Facebook 2
	$wp_customize->add_setting( 'page_member_fb_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_fb_2', array(
		'label'    => esc_html__( 'Team Member Facebook 2', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_2', 
		'settings' => 'page_member_fb_2',
		'priority'   => 5
	))); 
	
	// Page - Team Member Twitter 2
	$wp_customize->add_setting( 'page_member_twitter_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_twitter_2', array(
		'label'    => esc_html__( 'Team Member Twitter 2', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_2', 
		'settings' => 'page_member_twitter_2',
		'priority'   => 6
	))); 
	
	// Page - Team Member LinkedIn 2
	$wp_customize->add_setting( 'page_member_linked_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_linked_2', array(
		'label'    => esc_html__( 'Team Member LinkedIn 2', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_2', 
		'settings' => 'page_member_linked_2',
		'priority'   => 7
	))); 
	
	// Page - Team Member Google 2
	$wp_customize->add_setting( 'page_member_google_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_google_2', array(
		'label'    => esc_html__( 'Team Member Google 2', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_2', 
		'settings' => 'page_member_google_2',
		'priority'   => 8
	))); 
	
	// Page - Team Member Email 2
	$wp_customize->add_setting( 'page_member_email_2',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_email_2', array(
		'label'    => esc_html__( 'Team Member Email 2', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_2', 
		'settings' => 'page_member_email_2',
		'priority'   => 9
	)));  
	
	// Page - Home Team Member 3
	$wp_customize->add_section( 'page_sensiblewp_team_member_3', array(
		'title'          => esc_html__( 'Team Member 3', 'sensible-wp' ), 
		'priority'       => 40,
		'description' => esc_html__( 'Edit your Team Member 3', 'sensible-wp' ),
		'panel' => 'page_team_panel',   
	));
	
	$wp_customize->add_setting('page_active_member_3', 
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_checkbox',
	    ) 
	);  
	
	$wp_customize->add_control( 
    'page_active_member_3', 
    array(
        'type' => 'checkbox',
        'label' => esc_html__( 'Hide Member Box 3', 'sensible-wp' ),
        'section' => 'page_sensiblewp_team_member_3', 
		'priority'   => 1
    ));
	
	// Page - Team Member Picture 3
	$wp_customize->add_setting( 'page_member_image_3', array(    
		'sanitize_callback' => 'esc_url_raw',
	));

	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'page_member_image_3', array( 
		'label'    => esc_html__( 'Team Member Image 3', 'sensible-wp' ), 
		'section'  => 'page_sensiblewp_team_member_3',  
		'settings' => 'page_member_image_3',  
		'priority'   => 2
	))); 
	
	// Page - Team Member Name 3
	$wp_customize->add_setting( 'page_member_name_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_name_3', array(
		'label'    => esc_html__( 'Team Member Name 3', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_3', 
		'settings' => 'page_member_name_3',
		'priority'   => 3
	))); 
	
	// Page - Team Member Text 3
	$wp_customize->add_setting( 'page_member_text_3' ,
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text',
	)); 
	 
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_text_3', array( 
    'label' => esc_html__( 'Team Member Text Box 3', 'sensible-wp' ), 
    'section' => 'page_sensiblewp_team_member_3',
    'settings' => 'page_member_text_3', 
	'type'     => 'textarea', 
	'priority'   => 4
	)));
	
	// Page - Team Member Facebook 3
	$wp_customize->add_setting( 'page_member_fb_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_fb_3', array(
		'label'    => esc_html__( 'Team Member Facebook 3', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_3', 
		'settings' => 'page_member_fb_3',
		'priority'   => 5
	))); 
	
	// Page - Team Member Twitter 3
	$wp_customize->add_setting( 'page_member_twitter_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_twitter_3', array(
		'label'    => esc_html__( 'Team Member Twitter 3', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_3', 
		'settings' => 'page_member_twitter_3',
		'priority'   => 6
	))); 
	
	// Page - Team Member LinkedIn 3
	$wp_customize->add_setting( 'page_member_linked_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_linked_3', array(
		'label'    => esc_html__( 'Team Member LinkedIn 3', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_3',  
		'settings' => 'page_member_linked_3',
		'priority'   => 7
	))); 
	
	// Page - Team Member Google 3
	$wp_customize->add_setting( 'page_member_google_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_google_3', array(
		'label'    => esc_html__( 'Team Member Google 3', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_3', 
		'settings' => 'page_member_google_3',
		'priority'   => 8
	))); 
	
	// Page - Team Member Email 3
	$wp_customize->add_setting( 'page_member_email_3',
	    array(
	        'sanitize_callback' => 'sensiblewp_sanitize_text', 
	));  

	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'page_member_email_3', array(
		'label'    => esc_html__( 'Team Member Email 3', 'sensible-wp' ),
		'section'  => 'page_sensiblewp_team_member_3',
		'settings' => 'page_member_email_3', 
		'priority'   => 9 
	)));
	

	// Set site name and description to be previewed in real-time
	$wp_customize->get_setting('blogname')->transport='postMessage';
	$wp_customize->get_setting('blogdescription')->transport='postMessage';
	$wp_customize->get_setting( 'header_textcolor' )->transport = 'postMessage';
	
	// Move sections up 
	$wp_customize->get_section('static_front_page')->priority = 10; 


}
add_action('customize_register', 'sensiblewp_theme_customizer');

/**
 * Binds JS handlers to make Theme Customizer preview reload changes asynchronously.
 */
function sensiblewp_customize_preview_js() {
	
	// Enqueue scripts for real-time preview
	wp_enqueue_script( 'sensiblewp_customizer', get_template_directory_uri() . '/js/customizer.js', array( 'customize-preview' ), '20130508', true ); 
	
}
add_action( 'customize_preview_init', 'sensiblewp_customize_preview_js' );