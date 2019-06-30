<?php
/**
 * The template part for home intro
 *
 * @package sensible-wp
 */
?>


			<div class="home-content">
        		<div class="grid grid-pad">
        			<div class="col-1-1">
                		
						<?php if ( get_theme_mod( 'intro_text' ) ) : ?>
        			  		
                            <h6 class="wow animated fadeInLeft"><?php echo wp_kses_post( get_theme_mod( 'intro_text' )); ?></h6>
                		
						<?php endif; ?>
                        
                        <?php if ( get_theme_mod( 'intro_textbox' ) ) : ?>
        			  		
                            <p class="wow animated fadeInRight"><?php echo wp_kses_post( get_theme_mod( 'intro_textbox' )); ?></p>  
                		
						<?php endif; ?>

                	</div><!-- col-1-1 --> 
        		</div><!-- grid -->
        	</div><!-- home-content -->