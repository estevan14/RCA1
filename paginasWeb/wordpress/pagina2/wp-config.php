<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'pagina2db' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '$kYRO|yghiUus2@Nz^<3?`-[(MAR@hfBUi]Cy@=U@~ZY!TC!.cP^{ShHZFey;3Ck' );
define( 'SECURE_AUTH_KEY',  '=9AH@Y!LMs|c(Vb36DMjW2}1~|;RZ9Fl)WvGr/sl l8D5COHeUBF,O``@]TO+b^0' );
define( 'LOGGED_IN_KEY',    '{Ys1-{ssZwq]Zt]KN`t{{K_iv^r$XJM+`Sf4 4I-};(ka~~Qy_!sD+wR.QmH=sHB' );
define( 'NONCE_KEY',        'fa)L/`/<Z9?[Nyd*_pw=FyQN@ d*ERV?{Z9nUh8#%gq_,bsJ8viLIq<;.Uy6A!3e' );
define( 'AUTH_SALT',        '889JvHi~V.T?onX{E07b:0sy} }.kOB$+/SEdXMIUXr<@8*+o/moQeG2u*.>(uB0' );
define( 'SECURE_AUTH_SALT', ',7Y2_%rc2jRCY~*0J5j4EGs}E^.<n@{0$hrL?we|%qDkJm+zb):GxRf |`w_99k?' );
define( 'LOGGED_IN_SALT',   'h~4[&/~Pp|CJTYn/[sRI4I|Y>}-,LyOI:C=U.i`;4o<U0<k?0>8^kXj-qu9M&>OX' );
define( 'NONCE_SALT',       '96z=0t9AasnT^;Q3nHxs@JIy1wE)/I8P|*hy3]]x3/B_(<y1$|2k=x,|/g5-Ho6w' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once( ABSPATH . 'wp-settings.php' );
