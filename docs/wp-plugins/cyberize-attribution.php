<?php
/**
 * Plugin Name: Cyberize Attribution
 * Plugin URI: https://cyberizegroup.com
 * Description: Captures Coach's attribution data and syncs to GoHighLevel
 * Version: 1.0.0
 * Author: Cyberize Group
 * Author URI: https://cyberizegroup.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: cyberize-attribution
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * WC requires at least: 8.0
 * WC tested up to: 9.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CYBERIZE_VERSION', '1.0.0');
define('CYBERIZE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CYBERIZE_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Activation hook - runs when plugin is activated
 */
function cyberize_activate() {
    // Check if WooCommerce is active
    if (!class_exists('WooCommerce')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(
            __('Cyberize Attribution requires WooCommerce to be installed and active.', 'cyberize-attribution'),
            'Plugin dependency check',
            array('back_link' => true)
        );
    }
    
    // Log activation for debugging
    error_log('[Cyberize Attribution] Plugin activated successfully');
}
register_activation_hook(__FILE__, 'cyberize_activate');

/**
 * Deactivation hook - runs when plugin is deactivated
 */
function cyberize_deactivate() {
    error_log('[Cyberize Attribution] Plugin deactivated');
}
register_deactivation_hook(__FILE__, 'cyberize_deactivate');

/**
 * Admin notice - confirms plugin is loaded
 */
function cyberize_admin_notice() {
    ?>
    <div class="notice notice-success is-dismissible">
        <p><strong>Cyberize Attribution</strong> is active and ready! Version <?php echo CYBERIZE_VERSION; ?></p>
    </div>
    <?php
}
add_action('admin_notices', 'cyberize_admin_notice');

/**
 * ============================================
 * PART 2: Settings Page for GHL Webhook URL
 * ============================================
 */

/**
 * Register settings page under WooCommerce menu
 */
add_action('admin_menu', 'cyberize_add_settings_page');

function cyberize_add_settings_page() {
    add_submenu_page(
        'woocommerce',
        'Cyberize Attribution Settings',
        'Cyberize Attribution',
        'manage_woocommerce',
        'cyberize-attribution',
        'cyberize_settings_page_html'
    );
}

/**
 * Register settings
 */
add_action('admin_init', 'cyberize_register_settings');

function cyberize_register_settings() {
    register_setting('cyberize_attribution_settings', 'cyberize_ghl_webhook_url', array(
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default' => '',
    ));
    
    register_setting('cyberize_attribution_settings', 'cyberize_ghl_enabled', array(
        'type' => 'boolean',
        'sanitize_callback' => 'rest_sanitize_boolean',
        'default' => false,
    ));
}

/**
 * Settings page HTML
 */
function cyberize_settings_page_html() {
    if (!current_user_can('manage_woocommerce')) {
        return;
    }
    
    // Show save message
    if (isset($_GET['settings-updated'])) {
        add_settings_error('cyberize_messages', 'cyberize_message', 'Settings Saved', 'updated');
    }
    
    settings_errors('cyberize_messages');
    
    $webhook_url = get_option('cyberize_ghl_webhook_url', '');
    $enabled = get_option('cyberize_ghl_enabled', false);
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        
        <form action="options.php" method="post">
            <?php settings_fields('cyberize_attribution_settings'); ?>
            
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">
                        <label for="cyberize_ghl_enabled">Enable GHL Integration</label>
                    </th>
                    <td>
                        <input type="checkbox" id="cyberize_ghl_enabled" name="cyberize_ghl_enabled" value="1" <?php checked($enabled, true); ?> />
                        <p class="description">When enabled, attribution data will be sent to GHL on order processing.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="cyberize_ghl_webhook_url">GHL Webhook URL</label>
                    </th>
                    <td>
                        <input type="url" id="cyberize_ghl_webhook_url" name="cyberize_ghl_webhook_url" 
                               value="<?php echo esc_attr($webhook_url); ?>" 
                               class="regular-text" 
                               placeholder="https://services.leadconnectorhq.com/hooks/..." />
                        <p class="description">Enter the Inbound Webhook URL from your GHL Workflow.</p>
                    </td>
                </tr>
            </table>
            
            <?php submit_button('Save Settings'); ?>
        </form>
        
        <hr />
        
        <h2>Attribution Data Preview</h2>
        <p>The following data will be sent to GHL when an order is processed:</p>
        <pre style="background: #f1f1f1; padding: 15px; border-radius: 5px;">
{
  "email": "customer@example.com",
  "phone": "+1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "order_id": "12345",
  "order_total": "79.00",
  "order_date": "2026-01-27T07:13:00Z",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "winter-sale",
  "utm_content": "",
  "utm_keyword": "",
  "gclid": "abc123",
  "fbclid": "",
  "landing_page": "/"
}
        </pre>
        
        <h2>Status</h2>
        <ul>
            <li><strong>Plugin Version:</strong> <?php echo CYBERIZE_VERSION; ?></li>
            <li><strong>GHL Integration:</strong> <?php echo $enabled ? '<span style="color:green;">Enabled</span>' : '<span style="color:red;">Disabled</span>'; ?></li>
            <li><strong>Webhook URL:</strong> <?php echo $webhook_url ? '<span style="color:green;">Configured</span>' : '<span style="color:orange;">Not Set</span>'; ?></li>
        </ul>
    </div>
    <?php
}

/**
 * ============================================
 * PART 3: Send Attribution to GHL on Order Processing
 * ============================================
 */

/**
 * Hook into order status change to "processing"
 * This fires when payment is confirmed
 */
add_action('woocommerce_order_status_processing', 'cyberize_send_to_ghl', 10, 1);

/**
 * Send order + attribution data to GHL webhook
 * 
 * @param int $order_id The WooCommerce order ID
 */
function cyberize_send_to_ghl($order_id) {
    // Check if GHL integration is enabled
    $enabled = get_option('cyberize_ghl_enabled', false);
    if (!$enabled) {
        error_log("[Cyberize Attribution] GHL integration disabled, skipping order $order_id");
        return;
    }
    
    // Get webhook URL
    $webhook_url = get_option('cyberize_ghl_webhook_url', '');
    if (empty($webhook_url)) {
        error_log("[Cyberize Attribution] No webhook URL configured, skipping order $order_id");
        return;
    }
    
    // Get the order object
    $order = wc_get_order($order_id);
    if (!$order) {
        error_log("[Cyberize Attribution] Order not found: $order_id");
        return;
    }
    
    // Check if we've already sent this order to GHL (idempotency)
    $already_sent = $order->get_meta('_cyberize_ghl_sent');
    if ($already_sent === 'yes') {
        error_log("[Cyberize Attribution] Order $order_id already sent to GHL, skipping");
        return;
    }
    
    // Build the payload using GHL's expected field names (camelCase)
    $first_name = $order->get_billing_first_name();
    $last_name = $order->get_billing_last_name();
    
    $payload = array(
        // Contact fields (GHL standard names)
        'email'        => $order->get_billing_email(),
        'phone'        => $order->get_billing_phone(),
        'firstName'    => $first_name,
        'lastName'     => $last_name,
        'name'         => trim($first_name . ' ' . $last_name),
        'address1'     => $order->get_billing_address_1(),
        'city'         => $order->get_billing_city(),
        'state'        => $order->get_billing_state(),
        'postalCode'   => $order->get_billing_postcode(),
        'country'      => $order->get_billing_country(),
        
        // Order data
        'order_id'     => (string) $order_id,
        'order_total'  => $order->get_total(),
        'order_date'   => $order->get_date_created()->format('c'),
        
        // Attribution data
        'utm_source'   => $order->get_meta('_coach_ghl_utm_source') ?: '',
        'utm_medium'   => $order->get_meta('_coach_ghl_utm_medium') ?: '',
        'utm_campaign' => $order->get_meta('_coach_ghl_utm_campaign') ?: '',
        'utm_content'  => $order->get_meta('_coach_ghl_utm_content') ?: '',
        'utm_keyword'  => $order->get_meta('_coach_ghl_utm_keyword') ?: '',
        'gclid'        => $order->get_meta('_coach_ghl_gclid') ?: '',
        'fbclid'       => $order->get_meta('_coach_ghl_fbclid') ?: '',
        'landing_page' => $order->get_meta('_coach_ghl_landing_page') ?: '',
    );
    
    error_log("[Cyberize Attribution] Sending order $order_id to GHL");
    error_log("[Cyberize Attribution] Payload: " . json_encode($payload));
    
    // Send POST request to GHL
    $response = wp_remote_post($webhook_url, array(
        'method'      => 'POST',
        'timeout'     => 30,
        'headers'     => array(
            'Content-Type' => 'application/json',
        ),
        'body'        => json_encode($payload),
    ));
    
    // Check for errors
    if (is_wp_error($response)) {
        $error_message = $response->get_error_message();
        error_log("[Cyberize Attribution] GHL webhook failed for order $order_id: $error_message");
        $order->update_meta_data('_cyberize_ghl_error', $error_message);
        $order->save();
        return;
    }
    
    // Check response code
    $response_code = wp_remote_retrieve_response_code($response);
    $response_body = wp_remote_retrieve_body($response);
    
    error_log("[Cyberize Attribution] GHL response for order $order_id: HTTP $response_code");
    
    if ($response_code >= 200 && $response_code < 300) {
        // Success - mark as sent
        $order->update_meta_data('_cyberize_ghl_sent', 'yes');
        $order->update_meta_data('_cyberize_ghl_sent_at', current_time('c'));
        $order->save();
        error_log("[Cyberize Attribution] Order $order_id successfully sent to GHL");
    } else {
        // Failed
        error_log("[Cyberize Attribution] GHL webhook returned HTTP $response_code for order $order_id");
        $order->update_meta_data('_cyberize_ghl_error', "HTTP $response_code: $response_body");
        $order->save();
    }
}

/**
 * DEBUG: Show GHL sync status on orders page
 */
add_action('admin_notices', 'cyberize_debug_last_order');

function cyberize_debug_last_order() {
    // Only show on orders page
    $screen = get_current_screen();
    if (!$screen || $screen->id !== 'woocommerce_page_wc-orders') {
        return;
    }
    
    // Get the most recent order
    $orders = wc_get_orders(array('limit' => 1, 'orderby' => 'date', 'order' => 'DESC'));
    if (empty($orders)) {
        return;
    }
    
    $order = $orders[0];
    $order_id = $order->get_id();
    
    // Read meta
    $utm_source = $order->get_meta('_coach_ghl_utm_source');
    $ghl_sent = $order->get_meta('_cyberize_ghl_sent');
    $ghl_sent_at = $order->get_meta('_cyberize_ghl_sent_at');
    $ghl_error = $order->get_meta('_cyberize_ghl_error');
    
    $status_icon = $ghl_sent === 'yes' ? '✅' : ($ghl_error ? '❌' : '⏳');
    $status_text = $ghl_sent === 'yes' ? 'Sent to GHL' : ($ghl_error ? 'Error' : 'Pending');
    
    ?>
    <div class="notice notice-info">
        <p><strong>Cyberize GHL Sync - Order #<?php echo $order_id; ?>:</strong> <?php echo $status_icon; ?> <?php echo $status_text; ?></p>
        <ul style="font-size: 12px;">
            <li>Attribution Source: <code><?php echo $utm_source ?: '(none)'; ?></code></li>
            <li>Sent to GHL: <code><?php echo $ghl_sent ?: 'no'; ?></code></li>
            <?php if ($ghl_sent_at): ?>
            <li>Sent At: <code><?php echo $ghl_sent_at; ?></code></li>
            <?php endif; ?>
            <?php if ($ghl_error): ?>
            <li style="color: red;">Error: <code><?php echo $ghl_error; ?></code></li>
            <?php endif; ?>
        </ul>
    </div>
    <?php
}
