<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #content div and all content after
 *
 * @package sensible-wp
 */
?>

	</section><!-- #content --> 
    
    
    <?php if( get_theme_mod( 'active_footer_social' ) == '') : ?> 
        
        	<?php if ( get_theme_mod( 'footer_social_text' ) ) : ?>
        		<div class="social-bar">
        	<?php else : ?>
        		<div class="social-bar-none"> 
        	<?php endif; ?>
            
        		<div class="grid grid-pad">
        			<div class="col-1-1">
                
                	<?php if ( get_theme_mod( 'footer_social_text' ) ) : ?>
        			  	
                        <span class="wow animated fadeIn"><?php echo wp_kses_post( get_theme_mod( 'footer_social_text' )); ?></span>
                	
					<?php endif; ?> 
              			
                        <div class="wow animated fadeIn">
                        
                        	<?php get_template_part( 'content', 'social' ); // Social Icons ?> 	
                            
                        </div>   
                
                	</div><!-- col-1-1 -->
        		</div><!-- grid -->
        	<?php if ( get_theme_mod( 'footer_social_text' ) ) : ?>  
        		</div><!-- social-bar -->
        	<?php else : ?>
        		</div><!-- social-bar  -->
        	<?php endif; ?>
        
       
		<?php endif; ?>
		
        
    <?php if( get_theme_mod( 'active_footer_contact' ) == '') : ?>
    
    
    <div class="footer-contact">
        <div class="grid grid-pad">
            
            <div class="col-1-1">
            
            	<?php if ( get_theme_mod( 'footer_title_text' ) ) : ?> 
    				
                    <h6><?php echo wp_kses_post( get_theme_mod( 'footer_title_text' )); // footer title ?></h6>
    			
				<?php endif; ?>
                
            </div><!-- col-1-1 -->
            	
                <div class="col-1-3">
            		<div class="footer-block">
                    
                    	<?php if ( get_theme_mod( 'bottom_footer_icon_1' ) ) : ?> 
    						
                            <i class="fa <?php echo wp_kses_post( get_theme_mod( 'bottom_footer_icon_1', __( 'fa-map-marker', 'sensible-wp' ) )); // first icon ?>"></i>
    					
						<?php endif; ?>
                        
                        <?php if ( get_theme_mod( 'first_text' ) ) : ?> 
    						
                            <h5><?php echo wp_kses_post( get_theme_mod( 'first_text' )); // first icon ?></h5>
    					
						<?php endif; ?>
                        
                        <?php if ( get_theme_mod( 'sensiblewp_footer_first' ) ) : ?> 
    						
                            <p><?php echo wp_kses_post( get_theme_mod( 'sensiblewp_footer_first' )); // first icon ?></p>
    					
						<?php endif; ?>  
            		
            		</div><!-- footer-block -->
    			</div><!-- col-1-3 -->
                
            	<div class="col-1-3">
            		<div class="footer-block">
            			
                        <?php if ( get_theme_mod( 'bottom_footer_icon_2' ) ) : ?> 
    						
                            <i class="fa <?php echo wp_kses_post( get_theme_mod( 'bottom_footer_icon_2', __( 'fa-mobile', 'sensible-wp' ) )); // second icon ?>"></i>
    					
						<?php endif; ?>
                        
                        <?php if ( get_theme_mod( 'second_text' ) ) : ?> 
    						
                            <h5><?php echo wp_kses_post( get_theme_mod( 'second_text' )); // second icon ?></h5>
    					
						<?php endif; ?>
                        
                        <?php if ( get_theme_mod( 'sensiblewp_footer_second' ) ) : ?> 
    						
                            <p><?php echo wp_kses_post( get_theme_mod( 'sensiblewp_footer_second' )); // second icon ?></p>
    					
						<?php endif; ?> 
                 
            		</div><!-- footer-block -->
    			</div><!-- col-1-3 -->
                
            	<div class="col-1-3">
            		<div class="footer-block">
                    	
                        <?php if ( get_theme_mod( 'bottom_footer_icon_3' ) ) : ?> 
    						
                            <i class="fa <?php echo wp_kses_post( get_theme_mod( 'bottom_footer_icon_3', __( 'fa-envelope-o', 'sensible-wp' ) )); // third icon ?>"></i>
    					
						<?php endif; ?>
                        
                        <?php if ( get_theme_mod( 'third_text' ) ) : ?> 
    						
                            <h5><?php echo wp_kses_post( get_theme_mod( 'third_text' )); // third icon ?></h5> 
    					
						<?php endif; ?>
                        
                        <?php if ( get_theme_mod( 'sensiblewp_footer_third' ) ) : ?>  
    						
                            <p><?php echo wp_kses_post( get_theme_mod( 'sensiblewp_footer_third' )); // third icon ?></p> 
    					  
						<?php endif; ?>  
            		  
            		</div><!-- footer-block -->
    			</div><!-- col-1-3 -->
                
    	</div><!-- grid -->
    </div><!-- footer-contact --> 
    
    <?php endif; ?> 
	

	<footer id="colophon" class="site-footer" role="contentinfo">
    	<div class="grid grid-pad">
			<div class="site-info col-1-1">
				<?php if ( get_theme_mod( 'sensiblewp_footerid' ) ) : ?> 
        			<?php echo wp_kses_post( get_theme_mod( 'sensiblewp_footerid' )); // footer id ?>
				<?php else : ?>  
    				<?php printf( __( 'Theme: %1$s by %2$s', 'sensible-wp' ), 'Sensible', '<a href="http://modernthemes.net" rel="designer">modernthemes.net</a>' ); ?>
				<?php endif; ?>
			</div><!-- .site-info --> 
        </div><!-- grid -->
	</footer><!-- #colophon -->

</div><!-- #page --> 

<?php wp_footer(); ?>

</body>
</html>
