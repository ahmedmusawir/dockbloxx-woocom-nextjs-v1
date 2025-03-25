import CheckoutPageContent from "./CheckoutPageContent";
import { fetchShippingOptions } from "@/services/checkoutServices";

/**
 * The Checkout Page - Server Side Rendering (ISR)
 * - Fetches shipping options from WooCommerce ACF REST API.
 * - Logs results for verification.
 * - Embeds JSON object into the page for debugging.
 */
const Checkout = async () => {
  // console.log("Fetching Shipping Options...");

  const shippingData = await fetchShippingOptions();

  return (
    <div>
      {/* Embed Shipping Data */}
      <script
        id="shipping-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(shippingData),
        }}
      />

      {/* Main Checkout Page Content */}
      <CheckoutPageContent />
    </div>
  );
};

export default Checkout;
