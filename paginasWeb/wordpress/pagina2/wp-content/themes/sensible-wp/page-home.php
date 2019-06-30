<?php
/**
Template Name: Home Page
 *
 * @package sensible-wp
 */

get_header(); ?>

		<?php if( get_theme_mod( 'active_hero' ) == '') : ?>
        
        	<section id="hero-header" data-speed="8" data-type="background" style="background: url('<?php echo esc_url( get_theme_mod( 'sensiblewp_main_bg', ( get_stylesheet_directory_uri( 'stylesheet_directory') . '/img/hero-1.jpg'))); ?>')  50% 0 no-repeat fixed;"> 
            	<div class="hero-content-container">
                	<div class="hero-content">
                            
                            <span>
                            
                            <?php if ( get_theme_mod( 'sensiblewp_first_heading' ) ) : ?>
                            
               					<h1 class="animated fadeInDown delay">
									<?php echo esc_textarea( get_theme_mod( 'sensiblewp_first_heading')) ?>
                                </h1> 
                                
							<?php endif; ?> 
                            
                            <?php if ( get_theme_mod( 'sensiblewp_hero_button_text' ) ) : ?>
                            
                            	<?php if ( get_theme_mod( 'hero_button_url' ) ) : ?>
                            
                    				<a href="<?php echo esc_url( get_page_link( get_theme_mod('hero_button_url'))) ?>" class="featured-link"> 
                                
								<?php endif; ?>
       
                    			<?php if ( get_theme_mod( 'page_url_text' ) ) : ?> 
                            
    								<a href="<?php echo esc_url( get_theme_mod ( 'page_url_text' )) ?>" class="featured-link" target="_blank">
                                   
								<?php endif; ?> 
                            
                            			<button class="wow animated fadeInDown delay">
											<?php echo esc_html( get_theme_mod( 'sensiblewp_hero_button_text')) ?>
                            			</button>
                            
                            		</a>
                               
                            <?php endif; ?> 
                            
                               	  
                			</span>
                             
            	</div><!-- hero-content --> 
        	</div><!-- hero-content-container -->
        </section><!-- hero-header -->
				
        
	<?php endif; ?>
		
        
   	<?php if( get_theme_mod( 'active_social' ) == '') : ?>
        
        	<?php if ( get_theme_mod( 'social_text' ) ) : ?>
        		<div class="social-bar">
        	<?php else : ?>
        		<div class="social-bar-none">
        	<?php endif; ?> 
            
        		<div class="grid grid-pad">
        			<div class="col-1-1">
                
                	<?php if ( get_theme_mod( 'social_text' ) ) : ?>
        			  	
                        <span class="wow animated fadeIn"><?php echo wp_kses_post(get_theme_mod( 'social_text' )); ?></span> 
                	
					<?php endif; ?> 
              			
                        <div class="wow animated fadeIn">
                        	
                            <?php get_template_part( 'content', 'social' ); // Social Icons ?> 
                            
                        </div>   
                
                	</div><!-- col-1-1 -->
        		</div><!-- grid -->
                
        	<?php if ( get_theme_mod( 'social_text' ) ) : ?>
        		</div><!-- social bar -->
        	<?php else : ?>
        		</div><!-- social bar --> 
        	<?php endif; ?>
        
        
		<?php endif; ?>
		
        
        <?php if( get_theme_mod( 'active_intro' ) == '') : ?>  
        
        	 <?php get_template_part( 'content', 'intro' ); // intro ?> 
        
		<?php endif; ?>
        
        
        <?php if( get_theme_mod( 'active_services' ) == '') : ?>    
        		
        	<?php get_template_part( 'content', 'services' ); // services ?> 
              
		<?php endif; ?>
        
        
        <?php if( get_theme_mod( 'active_blog' ) == '') : ?> 
        
        	<?php get_template_part( 'content', 'news' ); // news ?> 
        
		<?php endif; ?>
		
        
        <?php if( get_theme_mod( 'active_team' ) == '') : ?>   
        
        	<?php get_template_part( 'content', 'team' ); // team ?>
        
		<?php endif; ?>
		
        
        <?php if( get_theme_mod( 'active_home_widget' ) == '') : ?>
        
        	<?php get_template_part( 'content', 'home-widget' ); // home widget ?> 
		
		<?php endif; ?>
		

<?php get_footer(); ?>
