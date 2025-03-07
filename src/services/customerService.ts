import { Customer } from "@/types/customer";

export const regCustomer = async (customer: Customer) => {
  console.log(
    "Customer Object Before Sending:",
    JSON.stringify(customer, null, 2)
  );

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/register-customer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.message && data.message.includes("already registered")) {
        console.log("Customer already exists, skipping registration.");
        return data; // Quietly return without error
      }
      throw new Error(data.error || "Failed to register customer");
    }

    return data;
  } catch (error) {
    console.error("Customer Registration Error:", error);
    return null;
  }
};
