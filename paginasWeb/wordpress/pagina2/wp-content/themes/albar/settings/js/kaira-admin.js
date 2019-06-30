/**
 * Albar Admin Custom Functionality
 *
 */
( function( $ ) {
    
    jQuery( document ).ready( function() {
        
        $( '.kra-click-preview' ).click( function(e){
            $( '.premium-upsell-wrap' ).fadeToggle();
            $( 'html, body' ).animate( {'scrollTop':0} );
        });
        $('.premium-upsell-wrap-close').click(function(e){
            $( '.premium-upsell-wrap' ).fadeToggle();
        });
        
        // WP Media upload functionality
        var kra_media = true,
        orig_kra_attachment = wp.media.editor.send.attachment;
     
        $( '.media_upload_button' ).click(function(e) {
            var send_attachment_bkp = wp.media.editor.send.attachment;
            var button = $(this);
            var id = button.attr('id').replace('_button', '');
            kra_media = true;
            wp.media.editor.send.attachment = function(props, attachment){
                if ( kra_media ) {
                    $("#"+id).val(attachment.url);
                } else {
                    return orig_kra_attachment.apply( this, [props, attachment] );
                };
            }
     
            wp.media.editor.open(button);
            return false;
        });
     
        $('.add_media').on('click', function(){
            kra_media = false;
        });
		
        
        // WP Color Picker functionality
        $( '.color-picker-wrapper' ).each( function () {
            
            var kra_color_picker_id = $(this).attr('id');
            
            $( '#' + kra_color_picker_id + ' .color_picker' ).iris({
                width: 280,
                hide: true,
                palettes: true,
                change: function(event, ui) {
                    // Change the .color-indicator bg color and the input value
                    $( '#' + kra_color_picker_id + ' .color-indicator' ).css( 'background', ui.color.toString() );
                }

            });
                        
        });
        
    });
    
} )( jQuery );