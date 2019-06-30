<?php
/**
 * The template part for displaying home services
 *
 * @package sensible-wp
 */
?>


			<div class="home-services">
            	
				<?php if ( get_theme_mod( 'services_text' ) ) : ?>
                
        			<div class="grid grid-pad">
                    
            			<div class="col-1-1">
                        	<h6 class="wow animated fadeIn"><?php echo wp_kses_post(get_theme_mod( 'services_text' )); ?></h6>
                        </div>
                        
            		</div><!-- grid -->
                    
				<?php endif; ?>
                
                <?php $services_columns_number = esc_html( get_theme_mod( 'sensiblewp_services_columns_number', '3' )); ?>  
                
        		<div class="grid grid-pad no-top">
                    
					<div class="col-1-<?php echo esc_html( $services_columns_number ); ?> tri-clear wow animated fadeIn" data-wow-delay="0.25s"> 
    					<div class="service sbox-1">
                        
                        <?php if( get_theme_mod( 'active_service_1' ) == '') : ?>
                        
                        	<?php if ( get_theme_mod( 'service_icon_1' ) ) : ?>
                				<i class="fa <?php echo esc_html( get_theme_mod( 'service_icon_1' )); ?>"></i>
                            <?php endif; ?> 
                            
                            <?php if ( get_theme_mod( 'service_title_1' ) ) : ?>
              					<h5><?php echo wp_kses_post( get_theme_mod( 'service_title_1' )); ?></h5>
                            <?php endif; ?> 
                            
                            <?php if ( get_theme_mod( 'service_text_1' ) ) : ?>
              					<p class="member-description"><?php echo wp_kses_post( get_theme_mod( 'service_text_1' )); ?></p>
                            <?php endif; ?>
                            
                        <?php endif; ?>  
                             
  						</div><!-- service --> 
					</div><!-- col-1-3 --> 
                    
                    <div class="col-1-<?php echo esc_html( $services_columns_number ); ?> tri-clear wow animated fadeIn" data-wow-delay="0.25s"> 
    					<div class="service sbox-2">
                        
                        <?php if( get_theme_mod( 'active_service_2' ) == '') : ?>
                        
                        	<?php if ( get_theme_mod( 'service_icon_2' ) ) : ?>
                				<i class="fa <?php echo esc_html( get_theme_mod( 'service_icon_2' )); ?>"></i>
                            <?php endif; ?> 
                            
                            <?php if ( get_theme_mod( 'service_title_2' ) ) : ?>
              					<h5><?php echo wp_kses_post( get_theme_mod( 'service_title_2' )); ?></h5>
                            <?php endif; ?> 
                            
                            <?php if ( get_theme_mod( 'service_text_2' ) ) : ?>
              					<p class="member-description"><?php echo wp_kses_post( get_theme_mod( 'service_text_2' )); ?></p>
                            <?php endif; ?> 
                            
                        <?php endif; ?> 
                             
  						</div><!-- service --> 
					</div><!-- col-1-3 --> 
     
                    <div class="col-1-<?php echo esc_html( $services_columns_number ); ?> tri-clear wow animated fadeIn" data-wow-delay="0.25s"> 
    					<div class="service sbox-3">
                        
                         <?php if( get_theme_mod( 'active_service_3' ) == '') : ?>
                        
                        	<?php if ( get_theme_mod( 'service_icon_3' ) ) : ?>
                				<i class="fa <?php echo esc_html( get_theme_mod( 'service_icon_3' )); ?>"></i>
                            <?php endif; ?> 
                            
                            <?php if ( get_theme_mod( 'service_title_3' ) ) : ?>
              					<h5><?php echo wp_kses_post( get_theme_mod( 'service_title_3' )); ?></h5>
                            <?php endif; ?> 
                            
                            <?php if ( get_theme_mod( 'service_text_3' ) ) : ?>
              					<p class="member-description"><?php echo wp_kses_post( get_theme_mod( 'service_text_3' )); ?></p> 
                            <?php endif; ?> 
                            
                        <?php endif; ?> 
                             
  						</div><!-- service --> 
					</div><!-- col-1-3 -->    
  
        		</div><!-- grid -->
                
                <?php if ( get_theme_mod( 'service_button_text' ) ) : ?>
                    
                    	<?php if ( get_theme_mod( 'service_button_url' ) ) : ?>
                    		<a href="<?php echo esc_url( get_page_link( get_theme_mod('service_button_url'))) ?>" class="featured-link"> 
						<?php endif; ?>
                            
                          	<button class="wow animated fadeIn" data-wow-delay="0.25s">
							
              					<?php echo wp_kses_post( get_theme_mod( 'service_button_text' )); ?> 
                            
                            </button></a>
                        
				<?php endif; ?> 
                
        	</div><!-- home-services --> 
