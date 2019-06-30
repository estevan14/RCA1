/**
 * Albar Custom admin JS Functionality
 *
 */
( function( $ ) {
    
    $(window).load(function() {
        
        $( 'body.themes-php .theme-browser div.theme' ).bind( 'click', function() {
            $( 'span.premium-link' ).parent().css({ 'background-color' : '#d54e21', 'color' : '#FFF' });
        });
        
    });
    
} )( jQuery );