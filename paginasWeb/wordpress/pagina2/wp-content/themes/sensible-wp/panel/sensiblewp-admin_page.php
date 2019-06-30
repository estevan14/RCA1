<?php

function sensiblewp_admin_page_styles() {
    wp_enqueue_style( 'sensiblewp-font-awesome-admin', get_template_directory_uri() . '/fonts/font-awesome.css' ); 
	wp_enqueue_style( 'sensiblewp-style-admin', get_template_directory_uri() . '/panel/css/theme-admin-style.css' ); 
}
add_action( 'admin_enqueue_scripts', 'sensiblewp_admin_page_styles' ); 

     
    add_action('admin_menu', 'sensiblewp_setup_menu');
     
    function sensiblewp_setup_menu(){
    	add_theme_page( esc_html__('Sensible Theme Details', 'sensible-wp' ), esc_html__('Sensible Theme Details', 'sensible-wp' ), 'edit_theme_options', 'sensiblewp-setup', 'sensiblewp_init' );
    }  
     
 	function sensiblewp_init(){ 
	 	echo '<div class="grid grid-pad"><div class="col-1-1"><h1 style="text-align: center;">';
		printf( esc_html__('Thank you for using Sensible!', 'sensible-wp' )); 
        echo "</h1></div></div>";
			
		echo '<div class="grid grid-pad" style="border-bottom: 1px solid #ccc; padding-bottom: 40px; margin-bottom: 30px;" ><div class="col-1-3"><h2>'; 
		printf( esc_html__('Sensible Theme Setup', 'sensible-wp' )); 
        echo '</h2>';
		
		echo '<p>';
		printf( esc_html__('We created a quick theme setup video to help you get started with Sensible. Watch the video with the link below.', 'sensible-wp' )); 
		echo '</p>'; 
		
		echo '<a href="http://modernthemes.net/documentation/sensible-documentation/sensible-theme-setup/" target="_blank"><button>';
		printf( esc_html__('View Video', 'sensible-wp' ));
		echo "</button></a></div>";
		
		echo '<div class="col-1-3"><h2>'; 
		printf( esc_html__('Documentation', 'sensible-wp' ));
        echo '</h2>';  
		
		echo '<p>';
		printf( esc_html__('Check out our Sensible Documentation to learn how to use Sensible and for tutorials on theme functions. Click the link below.', 'sensible-wp' )); 
		echo '</p>'; 
		
		echo '<a href="http://modernthemes.net/documentation/sensible-documentation/" target="_blank"><button>'; 
		printf( esc_html__('Read Docs', 'sensible-wp' ));
		echo "</button></a></div>";
		
		echo '<div class="col-1-3"><h2>'; 
		printf( esc_html__('About ModernThemes', 'sensible-wp' )); 
        echo '</h2>';  
		
		echo '<p>';
		printf( esc_html__('Want more to learn more about ModernThemes? Let us help you at www.modernthemes.net.', 'sensible-wp' ));
		echo '</p>';
		
		echo '<a href="http://modernthemes.net/" target="_blank"><button>';
		printf( esc_html__('About Us', 'sensible-wp' ));
		echo '</button></a></div></div>';
		
		echo '<div class="grid grid-pad senswp"><div class="col-1-1"><h1 style="padding-bottom: 30px; text-align: center;">';
		printf( esc_html__('Want more features? Go Pro.', 'sensible-wp' ));  
		echo '</h1></div>';
		
        echo '<div class="col-1-4"><i class="fa fa-cogs"></i><h4>';
		printf( esc_html__('Post Format Options', 'sensible-wp' ));
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__('Add unlimited Services and Team Members using post formats instead of Customizer content. Comes with more content options that are easier to use.', 'sensible-wp' ));
		echo '</p></div>';
		
        echo '<div class="col-1-4"><i class="fa fa-image"></i><h4>';
        printf( esc_html__('Home Page Slider', 'sensible-wp' ));
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__('Add multiple slides to your front page. Create slides from Image post formats and customize the settings in the Theme Customizer. ', 'sensible-wp' ));
		echo '</p></div>'; 
		
        echo '<div class="col-1-4"><i class="fa fa-th"></i><h4>';
		printf( esc_html__('Home Templates + Sections', 'sensible-wp' ));
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__( 'Add widgets to home sections for a contact form, skill bars, and details spinner. Includes home page templates for Full-Screen Slider and Video Banner.', 'sensible-wp' )); 
		echo '</p></div> '; 
            
        echo '<div class="col-1-4"><i class="fa fa-shopping-cart"></i><h4>'; 
		printf( esc_html__( 'WooCommerce', 'sensible-wp' ));
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__( 'Turn your website into a powerful eCommerce machine. Sensible Pro is fully compatible with WooCommerce.', 'sensible-wp' ));
		echo '</p></div></div>';
            
        echo '<div class="grid grid-pad senswp"><div class="col-1-4"><i class="fa fa-th-list"></i><h4>';
		printf( esc_html__( 'More Sidebars', 'sensible-wp' ));
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__( 'Sometimes you need different sidebars for different pages. We got you covered, offering up to 5 different sidebars.', 'sensible-wp' ));
		echo '</p></div>';
		
       	echo '<div class="col-1-4"><i class="fa fa-font"></i><h4>More Google Fonts</h4><p>';
		printf( esc_html__( 'Access an additional 65 Google fonts with Sensible Pro right in the WordPress customizer.', 'sensible-wp' ));
		echo '</p></div>'; 
		
       	echo '<div class="col-1-4"><i class="fa fa-file-image-o"></i><h4>';
		printf( esc_html__( 'PSD Files', 'sensible-wp' ));
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__( 'Premium versions include PSD files. Preview your own content or showcase a customized version for your clients.', 'sensible-wp' ));
		echo '</p></div>';
            
        echo '<div class="col-1-4"><i class="fa fa-support"></i><h4>';
		printf( esc_html__( 'Free Support', 'sensible-wp' )); 
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__( 'Call on us to help you out. Premium themes come with free support that goes directly to our support staff.', 'sensible-wp' ));
		echo '</p></div></div>';
		
		echo '<div class="grid grid-pad" style="border-bottom: 1px solid #ccc; padding-bottom: 50px; margin-bottom: 30px;"><div class="col-1-1"><a href="http://modernthemes.net/wordpress-themes/sensible-pro/" target="_blank"><button class="pro">'; 
		printf( esc_html__( 'View Pro Version', 'sensible-wp' ));
		echo '</button></a></div></div>';
		
		
		echo '<div class="grid grid-pad senswp"><div class="col-1-1"><h1 style="padding-bottom: 30px; text-align: center;">';
		printf( esc_html__('Premium Membership. Premium Experience.', 'sensible-wp' )); 
		echo '</h1></div>';
		
        echo '<div class="col-1-4"><i class="fa fa-cogs"></i><h4>'; 
		printf( esc_html__('Plugin Compatibility', 'sensible-wp' ));
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__('Use our new free plugins with this theme to add functionality for things like projects, clients, team members and more. Compatible with all premium themes!', 'sensible-wp' ));
		echo '</p></div>';
		
		echo '<div class="col-1-4"><i class="fa fa-desktop"></i><h4>'; 
        printf( esc_html__('Agency Designed Themes', 'sensible-wp' ));
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__('Look as good as can be with our new premium themes. Each one is agency designed with modern styles and professional layouts.', 'sensible-wp' ));
		echo '</p></div>'; 
		
        echo '<div class="col-1-4"><i class="fa fa-users"></i><h4>';
        printf( esc_html__('Membership Options', 'sensible-wp' ));
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__('We have options to fit every budget. Choose between a single theme, or access to all current and future themes for a year, or forever!', 'sensible-wp' ));
		echo '</p></div>'; 
		
		echo '<div class="col-1-4"><i class="fa fa-calendar"></i><h4>'; 
		printf( esc_html__( 'Access to New Themes', 'sensible-wp' )); 
		echo '</h4>';
		
        echo '<p>';
		printf( esc_html__( 'New themes added monthly! When you purchase a premium membership you get access to all premium themes, with new themes added monthly.', 'sensible-wp' ));   
		echo '</p></div>';
		
		
		echo '<div class="grid grid-pad" style="border-bottom: 1px solid #ccc; padding-bottom: 50px; margin-bottom: 30px;"><div class="col-1-1"><a href="https://modernthemes.net/premium-wordpress-themes/" target="_blank"><button class="pro">'; 
		printf( esc_html__( 'Get Premium Membership', 'sensible-wp' )); 
		echo '</button></a></div></div>';
		
		
		
		echo '<div class="grid grid-pad"><div class="col-1-1"><h2 style="text-align: center;">'; 
		printf( esc_html__( 'Changelog' , 'sensible-wp' ) );
        echo "</h2>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.2.9 - Update: New Font Awesome' , 'sensible-wp' ) );
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.2.8 - Fix: PHP 7.2' , 'sensible-wp' ) );
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.2.7 - Fix: changed the link color on the search results page' , 'sensible-wp' ) );
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.2.6 - Update: added SEO optimization for h1 tags on home page' , 'sensible-wp' ) );
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.2.5 - Fix: number input bug in theme customizer' , 'sensible-wp' ) );
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.2.4 - Fix: removed http from Skype social icons' , 'sensible-wp' ) );
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.2.3 - Update: Tested with WordPress 4.5, Updating Font Awesome icons to 4.6, Added Snapchat and Weibo social icon options' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.2.2 - Update: blog page will now go fullwidth if no sidebar is active' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.2.1 - Update: added many new social icon options to theme customizer' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.1.9 - Update: updated demo link in description' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.1.8 - Update: added new Font Awesome 4.5 icons' , 'sensible-wp' ) ); 
        echo "</p>"; 
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.1.7 - Fix: issues with Landscape view on mobile devices' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.1.6 - added Navigation section that was deleted when WordPress switched to 4.3. Removed color options from Menu Locations.' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.1.5 - minor bug fixes' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.1.3 - fixed Social Icons section to make them centered if no text is displayed' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.1.2 - updated Font Awesome icons' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.1.1 - minor bug fixes' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.1.0 - added pt_BR translation' , 'sensible-wp' ) ); 
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.0.36 - minor bug fixes' , 'sensible-wp' ) );
        echo "</p>";
		
		echo '<p style="text-align: center;">'; 
		printf( esc_html__( '1.0.35 - added zn_CH translation' , 'sensible-wp' ) );
        echo "</p>";
		
		echo '<p style="text-align: center;">';
		printf( esc_html__('1.0.34 - added option to change blog header background. Go to Appearance -> Customize -> Blog Layout to add Blog Header background', 'sensible-wp' )); 
		echo '</p></div></div>';
		
    }
?>