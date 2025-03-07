import { Customer } from "@/types/customer";

export const regCustomer = async (customer: Customer) => {
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
      throw new Error(data.error || "Failed to register customer");
    }

    return data;
  } catch (error) {
    console.error("Customer Registration Error:", error);
    return null;
  }
};
