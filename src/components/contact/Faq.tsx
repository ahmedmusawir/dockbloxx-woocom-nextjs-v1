import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";

const faqs = [
  {
    question: "Will DockBloxx fit on my dock?",
    answer: `**Size Matters!** We make DockBloxx for all pole sizes.  
  If you don’t see the size you are looking for, please contact us for custom fabrication.  
  In most cases, we do not charge for custom sizing.`,
  },
  {
    question: "What if I order the wrong size?",
    answer: `**Shhh…It happens!** If you order the wrong size, no problem!  
  Simply visit our returns page at [https://dockbloxx.com/returns/](https://dockbloxx.com/returns/)  
  We will advance-ship you the correct product and provide you a return label for the incorrect product(s).
  
  We only ask that you pay for the actual freight cost of our replacement shipment so you can shop DockBloxx worry-free — and we don’t lose our swim shorts!`,
  },
  {
    question: "Will DockBloxx work on round poles?",
    answer: `**YES!** We make DockBloxx for round poles and pilings.  
  Simply contact us at [support@dockbloxx.com](mailto:support@dockbloxx.com) or call us at **404.220.9641**.  
  We will ask that you provide a measurement of:
  
  - **The Diameter** of the pole (the distance from one edge of the pole to the other)  
  **OR**  
  - **The Circumference** of the pole (distance around the pole)  
  
  **Pro-Tip:** Please send us pictures of the measurement to ensure the perfect fit!  
  For more info, visit our [how-to page](https://dockbloxx.com/how-to/)`,
  },
  {
    question: "How do I Install DockBloxx?",
    answer: `DockBloxx are designed for **super easy installation!**  
  Each product comes with detailed instructions and all the necessary hardware.  
  If you need extra help, our [How-To page](https://dockbloxx.com/how-to-dockbloxx/) offers helpful guides and videos.  
  **Click, Watch, Install, Enjoy!**`,
  },
  {
    question: "Do DockBloxx come in different colors?",
    answer: `DockBloxx come in any color you want, **as long as it’s Black!**
  
  **Exception:** Our **Table Bloxx** comes in a wood-grain, slightly off-white color so it stays **COOL** to the touch.  
  Please see website photos for reference.`,
  },
  {
    question:
      "Can I Return or Exchange a DockBloxx product if I am not satisfied for any reason?",
    answer: `Yes! At DockBloxx, we stand behind the quality of our products and want our customers to be **fully satisfied**.  
  **IF, FOR ANY REASON, YOU ARE NOT 100% SATISFIED**, please visit our [returns page](https://dockbloxx.com/our-policy) or e-mail [support@dockbloxx.com](mailto:support@dockbloxx.com) —  
  Our customer satisfaction team will dive into action to make sure you receive the resolution you desire.`,
  },
  {
    question: "How do I care for and maintain my DockBloxx?",
    answer: `DockBloxx are designed to be **low-maintenance** and extremely durable.  
  To clean your DockBloxx products, simply use any cleaning agent, then rinse. DockBloxx are **impervious to chemicals**.
  
  **Pro Tip:** As stewards of our waterways, please kindly use **environmentally safe products**.`,
  },
  {
    question: "What materials are DockBloxx made from?",
    answer: `DockBloxx are made from **High-Density Polyethylene (HDPE)** and **marine-grade 316 stainless steel** hardware.
  
  - HDPE resists mold, mildew, and rotting  
  - HDPE is recyclable, keeping non-biodegradable waste out of landfills  
  - HDPE reduces plastic production by up to **50%**  
  - Replaces heavier, less-strong materials  
  - Combines strength, corrosion resistance, cost-efficiency, and eco-friendliness  
  
  Besides DockBloxx, HDPE is used in:
  
  - Wood plastic composites  
  - Cutting Boards  
  - Plastic surgery (skeletal/facial reconstruction)  
  - Snowboards  
  - 3D printing filament  
  - Food and beverage containers`,
  },
  {
    question: "How do I become a DockBloxx Authorized Reseller?",
    answer: `Please Fill out the [application form](/dealer-login).  
  Our team will review your application and contact you with more information about partnership opportunities.`,
  },
];

const Faq = () => {
  return (
    <div className="bg-gray-50">
      {/* <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40"> */}
      <div className="mx-auto max-w-7xl px-1 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-500 sm:text-5xl">
            Inquiring Minds Want To Know!
          </h2>
          <dl className="mt-16 divide-y divide-gray-900/10">
            {faqs.map((faq) => (
              <Disclosure
                key={faq.question}
                as="div"
                className="py-6 first:pt-0 last:pb-0"
              >
                <dt className="">
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900">
                    <span className="text-2xl font-extrabold text-gray-500">
                      Q: {faq.question}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      <PlusIcon
                        aria-hidden="true"
                        className="size-6 group-data-[open]:hidden"
                      />
                      <MinusIcon
                        aria-hidden="true"
                        className="size-6 group-[&:not([data-open])]:hidden"
                      />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel
                  as="dd"
                  className="mt-2 prose prose-lg text-gray-600 max-w-none space-y-4 bg-gray-200 p-8 rounded-lg"
                >
                  <span className="text-xl text-gray-600">
                    <ReactMarkdown>{faq.answer}</ReactMarkdown>
                  </span>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Faq;
