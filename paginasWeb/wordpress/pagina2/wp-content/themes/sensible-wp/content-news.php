<?php
/**
 * The template part for displaying home posts
 *
 * @package sensible-wp
 */
?>


			<div class="home-news">
                
				<?php if ( get_theme_mod( 'blog_text' ) ) : ?>
                
                	<div class="grid grid-pad">
            			<div class="col-1-1">
                    		<h6 class="wow animated fadeIn"><?php echo wp_kses_post( get_theme_mod( 'blog_text' )); ?></h6>
                    	</div><!-- col-1-1 -->  
                    </div><!-- grid -->
                    
				<?php endif; ?> 
           	    	
            	<div class="grid grid-pad no-top">
                
                	<?php
						global $post;
						$args = array( 'post_type' => 'post', 'posts_per_page' => 3, 'meta_query' => array(
        					'relation' => 'OR',
        					array(
            					'key' => '_sn_primary_checkbox',
            					'value' => false,
            					'type' => 'BOOLEAN'
        					),
        					array(
            					'key' => '_sn_primary_checkbox',
            					'compare' => 'NOT EXISTS'
        					)
    						)); 
						$myposts = get_posts( $args );
						foreach( $myposts as $post ) :	setup_postdata($post); ?>
              
                        <div class="col-1-3 tri-clear wow animated fadeInUp" data-wow-delay="0.25s">
            
            				<a href="<?php the_permalink(); ?>"><?php the_post_thumbnail('sensible-wp-home-blog'); ?></a> 
							<h5><?php the_title(); ?></h5>
                        	<p><?php $content = get_the_content(); echo wp_trim_words( $content , '20' ); ?> <a href="<?php the_permalink(); ?>"> <?php echo esc_html__( 'Read More', 'sensible-wp' ) ?></a></p>
                        
                        </div><!-- col-1-3 --> 

					<?php endforeach; ?>
                    
        		</div><!-- grid -->
        	</div><!-- home-news -->
            
            
        	
            <?php if ( get_theme_mod( 'blog_cta' ) ) : ?>
        		
                <div class="home-blog-cta">
        			<div class="grid grid-pad">
            			<div class="col-1-1">
                			<a href="<?php if( get_option( 'show_on_front' ) == 'page' ) echo get_permalink( get_option('page_for_posts' ) );
else echo esc_url( home_url() );?>">
								<button class="outline white">
									<?php echo esc_html( get_theme_mod( 'blog_cta' )); ?>
                            	</button>
                            </a>  
        				</div><!-- col-1-1 -->
            		</div><!-- grid -->
        		</div><!-- home-blog-cta -->
            
			<?php endif; ?>