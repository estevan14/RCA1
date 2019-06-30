<?php
/**
 * The template part for displaying home team
 *
 * @package sensible-wp
 */
?>


			<div class="home-team">
        		
                <?php if ( get_theme_mod( 'team_text' ) ) : ?>
                	
                    <div class="grid grid-pad">
            			<div class="col-1-1">
                        	<h6 class="wow animated fadeInRight"><?php echo wp_kses_post( get_theme_mod( 'team_text' )); ?></h6>
                        </div><!-- col-1-1 -->  
            		</div><!-- grid -->
                
				<?php endif; ?> 
                
               <?php $team_columns_number = esc_html( get_theme_mod( 'sensiblewp_team_columns_number', '3' )); ?>
                
        		<div class="grid grid-pad no-top">
    
					<div class="col-1-<?php echo esc_html( $team_columns_number ); ?> tri-clear wow animated fadeInLeft" data-wow-delay="0.15s">
    					<div class="member tbox-1">
                        
                        <?php if( get_theme_mod( 'active_member_1' ) == '') : ?>
                        
             	 			<?php if ( get_theme_mod( 'member_image_1' ) ) : ?>
        						<img src="<?php echo esc_url( get_theme_mod( 'member_image_1' ) ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>">
							<?php endif; ?>
                            
                            <?php if ( get_theme_mod( 'member_name_1' ) ) : ?>
              					<h5><?php echo wp_kses_post( get_theme_mod( 'member_name_1' )); ?></h5>
                            <?php endif; ?>
                            
                            <?php if ( get_theme_mod( 'member_text_1' ) ) : ?>
              					<p class="member-description"><?php echo wp_kses_post( get_theme_mod( 'member_text_1' )); ?></p>
                            <?php endif; ?> 
                    
                    		<?php if ( get_theme_mod( 'member_fb_1' ) ) : ?>
                    			<a href="<?php echo esc_url( get_theme_mod( 'member_fb_1' )); ?>" target="_blank"><i class="fa fa-facebook"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_twitter_1' ) ) : ?>
                    			<a href="<?php echo esc_url( get_theme_mod( 'member_twitter_1' )); ?>" target="_blank"><i class="fa fa-twitter"></i></a>
                    		<?php endif; ?> 
                    
                    		<?php if ( get_theme_mod( 'member_linked_1' ) ) : ?>
                    			<a href="<?php echo esc_url( get_theme_mod( 'member_linked_1' )); ?>" target="_blank"><i class="fa fa-linkedin"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_google_1' ) ) : ?>
                    			<a href="<?php echo esc_url( get_theme_mod( 'member_google_1' )); ?>" target="_blank"><i class="fa fa-google-plus"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_email_1' ) ) : ?>
                    			<a href="mailto:<?php echo esc_html( get_theme_mod( 'member_email_1' )); ?>" target="_blank"><i class="fa fa-envelope-o"></i></a>
                    		<?php endif; ?>
                            
                        <?php endif; ?>
                    	
  						</div><!-- member --> 
					</div><!-- col-1-3 -->
                    
                    <div class="col-1-<?php echo esc_html( $team_columns_number ); ?> tri-clear wow animated fadeInLeft" data-wow-delay="0.15s">
    					<div class="member tbox-2">
                        
                        <?php if( get_theme_mod( 'active_member_2' ) == '') : ?>
                        
             	 			<?php if ( get_theme_mod( 'member_image_2' ) ) : ?>
        						<img src="<?php echo esc_url( get_theme_mod( 'member_image_2' ) ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>">
							<?php endif; ?>
                            
                            <?php if ( get_theme_mod( 'member_name_2' ) ) : ?>
              					<h5><?php echo wp_kses_post( get_theme_mod( 'member_name_2' )); ?></h5>
                            <?php endif; ?>
                            
                            <?php if ( get_theme_mod( 'member_text_2' ) ) : ?>
              					<p class="member-description"><?php echo wp_kses_post( get_theme_mod( 'member_text_2' )); ?></p>
                            <?php endif; ?> 
                    
                    		<?php if ( get_theme_mod( 'member_fb_2' ) ) : ?>
                    			<a href="<?php echo esc_url( get_theme_mod( 'member_fb_2' )); ?>" target="_blank"><i class="fa fa-facebook"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_twitter_2' ) ) : ?>
                    		<a href="<?php echo esc_url( get_theme_mod( 'member_twitter_2' )); ?>" target="_blank"><i class="fa fa-twitter"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_linked_2' ) ) : ?>
                    		<a href="<?php echo esc_url( get_theme_mod( 'member_linked_2' )); ?>" target="_blank"><i class="fa fa-linkedin"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_google_2' ) ) : ?>
                    		<a href="<?php echo esc_url( get_theme_mod( 'member_google_2' )); ?>" target="_blank"><i class="fa fa-google-plus"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_email_2' ) ) : ?>
                    		<a href="mailto:<?php echo esc_html( get_theme_mod( 'member_email_2' )); ?>" target="_blank"><i class="fa fa-envelope-o"></i></a>
                    		<?php endif; ?>
                             
                    	<?php endif; ?>
                        
  						</div><!-- member --> 
					</div><!-- col-1-3 --> 
                    
                    <div class="col-1-<?php echo esc_html( $team_columns_number ); ?> tri-clear wow animated fadeInLeft" data-wow-delay="0.15s">
    					<div class="member tbox-3">  
                        
                        <?php if( get_theme_mod( 'active_member_3' ) == '') : ?> 
                        
             	 			<?php if ( get_theme_mod( 'member_image_3' ) ) : ?>
        						<img src="<?php echo esc_url( get_theme_mod( 'member_image_3' ) ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>">
							<?php endif; ?>
                            
                            <?php if ( get_theme_mod( 'member_name_3' ) ) : ?>
              					<h5><?php echo wp_kses_post( get_theme_mod( 'member_name_3' )); ?></h5>
                            <?php endif; ?>
                            
                            <?php if ( get_theme_mod( 'member_text_3' ) ) : ?>
              					<p class="member-description"><?php echo wp_kses_post( get_theme_mod( 'member_text_3' )); ?></p>
                            <?php endif; ?> 
                    
                    		<?php if ( get_theme_mod( 'member_fb_3' ) ) : ?>
                    			<a href="<?php echo esc_url( get_theme_mod( 'member_fb_3' )); ?>" target="_blank"><i class="fa fa-facebook"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_twitter_3' ) ) : ?>
                    		<a href="<?php echo esc_url( get_theme_mod( 'member_twitter_3' )); ?>" target="_blank"><i class="fa fa-twitter"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_linked_3' ) ) : ?>
                    		<a href="<?php echo esc_url( get_theme_mod( 'member_linked_3' )); ?>" target="_blank"><i class="fa fa-linkedin"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_google_3' ) ) : ?>
                    		<a href="<?php echo esc_url( get_theme_mod( 'member_google_3' )); ?>" target="_blank"><i class="fa fa-google-plus"></i></a>
                    		<?php endif; ?>
                    
                    		<?php if ( get_theme_mod( 'member_email_3' ) ) : ?>
                    		<a href="mailto:<?php echo esc_html( get_theme_mod( 'member_email_3' )); ?>" target="_blank"><i class="fa fa-envelope-o"></i></a> 
                    		<?php endif; ?>
                             
                    	<?php endif; ?>
  						
                        </div><!-- member --> 
					</div><!-- col-1-3 --> 
                       
            	</div><!-- grid -->
                
                <?php if ( get_theme_mod( 'team_button_text' ) ) : ?>
                    
                    <?php if ( get_theme_mod( 'team_button_url' ) ) : ?>
                    	
                        <a href="<?php echo esc_url( get_page_link( get_theme_mod('team_button_url'))) ?>" class="featured-link"> 
						
					<?php endif; ?>
                            
                    	<button class="wow animated fadeInLeft" data-wow-delay="0.15s">  
				
              				<?php echo esc_html( get_theme_mod( 'team_button_text' )); ?>
                            
                        </button>
                            
                     </a> 
                        
				<?php endif; ?> 
                
        	</div><!-- home-team -->