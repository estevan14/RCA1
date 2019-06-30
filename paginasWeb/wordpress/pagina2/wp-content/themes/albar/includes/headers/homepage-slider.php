<?php
$slider_cats = kaira_theme_option( 'kra-slider-categories' );

if( $slider_cats ) :

    $slider_query = new WP_Query( 'cat=' . $slider_cats . '&posts_per_page=-1&orderby=date&order=DESC' ); ?>

    <?php if ( $slider_query->have_posts() ) : ?>

        <div class="alba-home-slider-wrapper alba-home-slider-remove"<?php echo ( kaira_theme_option( 'kra-slider-auto-scroll' ) ) ? ' data-auto="4000"' : ' data-auto="false"'; ?><?php echo ( kaira_theme_option( 'kra-circular-slider' ) ) ? ' data-circular="true"' : ' data-circular="false"'; ?><?php echo ( kaira_theme_option( 'kra-infinite-slider' ) ) ? ' data-infinite="true"' : ' data-infinite="false"'; ?>>
            <div class="alba-home-slider-prev"><i class="fa fa-angle-left"></i></div>
            <div class="alba-home-slider-next"><i class="fa fa-angle-right"></i></div>
            
            <div class="alba-home-slider">
                
                <?php while ( $slider_query->have_posts() ) : $slider_query->the_post(); ?>
                
                    <?php if ( kaira_theme_option( 'kra-slider-links' ) ) : ?>
                        <a href="<?php the_permalink(); ?>" class="alba-home-slider-block">
                    <?php else: ?>
                        <div class="alba-home-slider-block">
                    <?php endif; ?>
                        
                        <?php if ( has_post_thumbnail() ) : ?>
                        
                            <?php the_post_thumbnail( 'full', array( 'class' => '' ) ); ?>
                            
                        <?php endif; ?>
                        
                        <h3>
                            <?php the_title(); ?>
                        </h3>
                        
                    <?php if ( kaira_theme_option( 'kra-slider-links' ) ) : ?>
                        </a>
                    <?php else: ?>
                        </div>
                    <?php endif; ?>
                
                <?php endwhile; ?>
                
            </div>
            
            <?php if ( kaira_theme_option( 'kra-enable-slider-pagination' ) ) : ?>
            <div class="alba-home-slider-pager"></div>
            <?php endif; ?>
        </div>
        
    <?php endif; wp_reset_query(); ?>

<?php else: ?>
    
    <div class="alba-home-slider-wrapper alba-home-slider-remove" data-auto="4000" data-circular="true" data-infinite="true">
        <div class="home-slider-wrap-hint">
            <?php _e( 'See how to', 'albar' ); ?> <a href="https://kairaweb.com/documentation/setting-up-the-albar-default-slider/" target="_blank"><?php _e( 'Add your own slides here', 'albar' ); ?></a>
        </div>

        <div class="alba-home-slider-prev"><i class="fa fa-angle-left"></i></div>
        <div class="alba-home-slider-next"><i class="fa fa-angle-right"></i></div>
        
        <div class="alba-home-slider">
                
                <div class="alba-home-slider-block">
                    
                    <img src="<?php echo get_template_directory_uri() ?>/images/demo/dummy_img_01.jpg" alt="<?php esc_attr_e('Demo Slide One', 'albar') ?>" />
                    
                    <h3>
                        <?php _e( 'Beautifully Simple', 'albar' ); ?>
                    </h3>
                    
                </div>
                
                <div class="alba-home-slider-block">
                    
                    <img src="<?php echo get_template_directory_uri() ?>/images/demo/dummy_img_02.jpg" alt="<?php esc_attr_e('Demo Slide Two', 'albar') ?>" />
                    
                    <h3>
                        <?php _e( 'Build Easily', 'albar' ); ?>
                    </h3>
                    
                </div>
            
        </div>
        <div class="alba-home-slider-pager"></div>
    </div>

<?php endif; ?>