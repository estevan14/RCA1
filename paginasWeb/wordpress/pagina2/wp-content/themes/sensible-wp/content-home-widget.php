<?php
/**
 * The template part for displaying home widget area
 *
 * @package sensible-wp
 */
?>


		<div class="home-cta" style="background: url(<?php echo esc_url( get_theme_mod( 'sensiblewp_new_widget_area_background' )); ?>) no-repeat center center fixed; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover;">  
        	<div class="grid grid-pad">
            	<div class="sensible-home-widget-area">
                    
                    	<div class="col-1-1">
                
                			<?php if ( get_theme_mod( 'home_widget_icon' ) ) : ?>
                            
                				<i class="fa <?php echo esc_html( get_theme_mod( 'home_widget_icon' )); ?>"></i>
                                
							<?php endif; ?> 
                    
                    	</div><!-- col-1-1 --> 
                    
                    	<div class="col-1-1">
                    
                    		<?php if ( is_active_sidebar('home-widget') ) : ?>
                    
    							<?php dynamic_sidebar('home-widget'); ?> 
                           
    		 				<?php endif; ?>
                    
                    	</div><!-- col-1-1 -->
    
                    	<div class="col-1-1">
                    
                    		<?php if ( get_theme_mod( 'sensiblewp_widget_button_url' ) ) : ?>
                    			
                                <a href="<?php echo esc_url( get_page_link( get_theme_mod('sensiblewp_widget_button_url')))?>"> 
                        			
									<?php if ( get_theme_mod( 'sensiblewp_widget_button_text' ) ) : ?> 
                            			
                                        <button class="outline white">
											<?php echo esc_html( get_theme_mod( 'sensiblewp_widget_button_text' )); ?>
                                        </button>
									
									<?php endif; ?> 
                                    
                        		</a>
                                
                    		<?php endif; ?> 
                    
                    	</div><!-- col-1-1 --> 
                    
            	</div><!-- sensible-home-widget-area --> 
			</div><!-- grid -->
        </div><!-- home-cta --> 