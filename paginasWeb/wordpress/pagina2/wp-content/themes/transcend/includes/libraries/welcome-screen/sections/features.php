<?php
if ( ! defined( 'WPINC' ) ) {
	die;
}
/**
 * Features
 */

$features = array(
	'slider-options'    => array(
		'label'   => esc_html__( 'Improved Slider Options', 'transcend' ),
		'sub'     => esc_html__( 'Add more slides, control the appearance & position of slides.', 'transcend' ),
		'cpo'     => '<span class="dashicons dashicons-no-alt"></span>',
		'cpo-pro' => '<span class="dashicons dashicons-yes"></span></i>'
	),
	'woocommerce'       => array(
		'label'   => esc_html__( 'WooCommerce Support', 'transcend' ),
		'sub'     => esc_html__( 'Create a WooCommerce powered shop. Supports WooCommerce v3.x and upwards', 'transcend' ),
		'cpo'     => '<span class="dashicons dashicons-no-alt"></span>',
		'cpo-pro' => '<span class="dashicons dashicons-yes"></span></i>'
	),
	'reorder-sections'  => array(
		'label'   => esc_html__( 'Reorder Homepage Sections', 'transcend' ),
		'sub'     => esc_html__( 'Re-order your site\'s front-page sections in any way you want.', 'transcend' ),
		'cpo'     => '<span class="dashicons dashicons-no-alt"></span>',
		'cpo-pro' => '<span class="dashicons dashicons-yes"></span></i>'
	),
	'custom-colors'     => array(
		'label'   => esc_html__( 'Custom Color Schemes & Color Controls', 'transcend' ),
		'sub'     => esc_html__( 'Easily change your site\'s color schemes.', 'transcend' ),
		'cpo'     => '<span class="dashicons dashicons-no-alt"></span>',
		'cpo-pro' => '<span class="dashicons dashicons-yes"></span></i>'
	),
	'typography'        => array(
		'label'   => esc_html__( 'Custom Typography Controls', 'transcend' ),
		'sub'     => esc_html__( 'Want a different font family? No problem. Just an upgrade away.', 'transcend' ),
		'cpo'     => '<span class="dashicons dashicons-no-alt"></span>',
		'cpo-pro' => '<span class="dashicons dashicons-yes"></span></i>'
	),
	'tagline'           => array(
		'label'   => esc_html__( 'Tagline', 'transcend' ),
		'sub'     => esc_html__( 'Re-order your site\'s front-page sections in any way you want.', 'transcend' ),
		'cpo'     => esc_html__( 'Minimal', 'transcend' ),
		'cpo-pro' => esc_html__( 'Improved', 'transcend' )
	),
	'dedicated-support' => array(
		'label'   => esc_html__( 'Dedicated Support Team', 'transcend' ),
		'cpo'     => '<span class="dashicons dashicons-yes"></span>',
		'cpo-pro' => '<span class="dashicons dashicons-yes"></span></i>'
	),
	'security-updates'  => array(
		'label'   => esc_html__( 'Critical security updates ', 'transcend' ),
		'cpo'     => '<span class="dashicons dashicons-yes"></span>',
		'cpo-pro' => '<span class="dashicons dashicons-yes"></span></i>'
	),

	'featured-updates' => array(
		'label'   => esc_html__( 'Future feature updates ', 'transcend' ),
		'cpo'     => '<span class="dashicons dashicons-no-alt"></span>',
		'cpo-pro' => '<span class="dashicons dashicons-yes"></span></i>'
	),
);
?>
<div class="featured-section features">
    <table class="free-pro-table">
        <thead>
        <tr>
            <th></th>
            <th><?php _e( 'Lite', 'transcend' ) ?></th>
            <th><?php _e( 'PRO', 'transcend' ) ?></th>
        </tr>
        </thead>
        <tbody>
		<?php foreach ( $features as $feature ): ?>
            <tr>
	            <td class="feature">
		            <h3><?php echo $feature['label']; ?></h3>
		            <?php if ( isset( $feature['sub'] ) ): ?>
		            	<p><?php echo $feature['sub']; ?></p>
		            <?php endif ?>
	            </td>
                <td class="cpo-feature">
					<?php echo $feature['cpo']; ?>
                </td>
                <td class="cpo-pro-feature">
					<?php echo $feature['cpo-pro']; ?>
                </td>
            </tr>
		<?php endforeach; ?>
        <tr>
            <td></td>
            <td colspan="2" class="text-right"><a href="//www.cpothemes.com/theme/transcend?utm_source=transcend&utm_medium=about-page&utm_campaign=upsell" target="_blank"
                               class="button button-primary button-hero"><span class="dashicons dashicons-cart"></span><?php _e( 'Get The Pro Version Now!', 'transcend' ) ?></a></td>
        </tr>
        </tbody>
    </table>
</div>