<?php
global $woocommerce;
$site_social = '';

if ( ( kaira_theme_option( 'kra-social-email' ) == '' ) && ( kaira_theme_option( 'kra-social-skype' ) == '' ) && ( kaira_theme_option( 'kra-social-facebook' ) == '' ) && ( kaira_theme_option( 'kra-social-twitter' ) == '' ) && ( kaira_theme_option( 'kra-social-google-plus' ) == '' ) && ( kaira_theme_option( 'kra-social-youtube' ) == '' ) && ( kaira_theme_option( 'kra-social-instagram' ) == '' ) && ( kaira_theme_option( 'kra-social-pinterest' ) == '' ) && ( kaira_theme_option( 'kra-social-linkedin' ) == '' ) && ( kaira_theme_option( 'kra-social-tumblr' ) == '' ) && ( kaira_theme_option( 'kra-social-flickr' ) == '' ) ) :
    $site_social = 'header-nosocial';
endif; ?>
    <header id="masthead" class="site-header site-header-one <?php echo ( kaira_theme_option( 'kra-header-search' ) == 1 ) ? '' : sanitize_html_class( 'bg-left' ); ?> <?php echo sanitize_html_class( $site_social ); ?> <?php echo ( kaira_theme_option( 'kra-website-layout' ) == 'site-layout-boxed' ) ? sanitize_html_class( 'header-boxed-in' ) : ''; ?>">
        
        <?php if ( !kaira_theme_option( 'kra-remove-header-top-bar' ) ) : ?>

            <div class="site-top-bar site-pad">
                <div class="site-container">
                    <?php if ( kaira_theme_option( 'kra-website-txt-address' ) ) : ?>
                    <div class="site-top-bar-left">
                        
                        <?php
                        if ( kaira_is_woocommerce_activated() ) { ?>
                            
                            <?php if ( is_user_logged_in() ) { ?>
                                <div class="site-header-right-link"><i class="fa fa-user"></i> <a href="<?php echo get_permalink( get_option('woocommerce_myaccount_page_id') ); ?>" title="<?php _e('My Account','albar'); ?>"><?php _e('My Account','albar'); ?></a></div>
                            <?php } else { ?>
                                <div class="site-header-right-link"><i class="fa fa-user"></i> <a href="<?php echo get_permalink( get_option('woocommerce_myaccount_page_id') ); ?>" title="<?php _e('Login','albar'); ?>"><?php _e('Sign In / Register','albar'); ?></a></div>
                            <?php } ?>
                        
                        <?php
                        } ?>
                        
                        <i class="fa fa-map-marker"></i> <?php echo wp_kses_post( kaira_theme_option( 'kra-website-txt-address' ) ) ?>
                        
                    </div>
                    <?php endif; ?>
                    <div class="site-top-bar-right">
                        <?php if ( kaira_theme_option( 'kra-website-txt-email' ) ) : ?>
                        <i class="fa fa-envelope-o"></i> <a href="<?php echo esc_url( 'mailto:' . antispambot( kaira_theme_option( 'kra-website-txt-email' ), 1 ) ) ?>"><?php echo ( kaira_theme_option( 'kra-website-txt-email-txt' ) ) ? esc_attr( kaira_theme_option( 'kra-website-txt-email-txt' ) ) : _e( 'Email', 'albar' ); ?></a>
                        <?php endif; ?>
                        
                        <?php if ( kaira_theme_option( 'kra-website-txt-phone' ) ) : ?>
                        <i class="fa fa-phone"></i> <?php echo wp_kses_post( kaira_theme_option( 'kra-website-txt-phone' ) ) ?>
                        <?php endif; ?>
                        
                        <?php if ( kaira_is_woocommerce_activated() ) : ?>
                            <div class="header-cart">
                                <a class="header-cart-contents" href="<?php echo esc_url( wc_get_cart_url() ); ?>" title="<?php _e('View your shopping cart', 'albar'); ?>">
                                    <span class="header-cart-checkout <?php echo ( $woocommerce->cart->cart_contents_count > 0 ) ? sanitize_html_class( 'cart-has-items' ) : ''; ?>">
                                        <i class="fa fa-shopping-cart"></i>
                                        <span><?php echo sprintf( _n( '%d item', '%d items', $woocommerce->cart->cart_contents_count, 'albar' ), $woocommerce->cart->cart_contents_count); ?></span>
                                    </span>
                                </a>
                            </div>
                        <?php endif; ?>
                        
                        <?php if ( kaira_theme_option( 'kra-header-search' ) == 1 ) : ?>
                            <div class="search-button">
                                <i class="fa fa-search"></i>
                            </div>
                        <?php endif; ?>
                        
                    </div>
                    <div class="clearboth"></div>
                </div>
            </div>

        <?php endif; ?>

        <div class="header-bar site-pad">
            <div class="site-container">
                <div class="header-bar-inner">
                    <div class="site-branding">
                        <?php if( get_header_image() ) : ?>
                            <a href="<?php echo esc_url(home_url('/')); ?>" title="<?php echo esc_attr(get_bloginfo('name', 'display')); ?>" rel="home"><img src="<?php esc_url( header_image() ); ?>" alt="<?php echo esc_attr(get_bloginfo('name')) ?>" /></a>
                        <?php else : ?>
                            <h1 class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>" title="<?php echo esc_attr(get_bloginfo('name', 'display')); ?>" rel="home"><?php bloginfo('name'); ?></a></h1>
                            <h2 class="site-description"><?php bloginfo('description'); ?></h2>
                        <?php endif; ?>
                    </div>
                    <div class="site-header-right">
                        <div class="site-social">
                            <?php get_template_part( '/includes/inc/social-links' ); ?>
                        </div>
                        <nav id="site-navigation" class="navigation-main" role="navigation">
                            <span class="header-menu-button"><i class="fa fa-bars"></i><span><?php echo _e( 'Menu', 'albar' ); ?></span></span>
                            <div id="main-menu" class="main-menu-container">
                                <div class="main-menu-close"><i class="fa fa-angle-right"></i><i class="fa fa-angle-left"></i></div>
                                <?php wp_nav_menu( array( 'theme_location' => 'main-menu' ) ); ?>
                            </div>
                        </nav><!-- #site-navigation -->
                    </div>
                    <div class="clearboth"></div>
                </div>
                <?php if ( kaira_theme_option( 'kra-header-search' ) == 1 ) : ?>
                    <div class="search-block">
                        <?php get_search_form(); ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <div class="clearboth"></div>
    </header><!-- #masthead -->