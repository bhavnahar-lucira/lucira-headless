import { z } from "zod";

export const schemeSchema = z.object({
  instalment_amount: z
    .coerce.number({
      required_error: "Monthly Instalment Amount is required",
      invalid_type_error: "Monthly Instalment Amount is required",
    })
    .min(2000, "Minimum EMI is ₹2000")
    .max(19000, "Maximum EMI is ₹19000")
    .refine((val) => val % 500 === 0, {
      message: "Amount must be multiple of ₹500",
  }),

  mobile: z.string().min(10, "Mobile is required"),

  first_name: z.string().min(1, "First Name is required"),

  last_name: z.string().optional(),

  email: z.string().optional(),

  employee_id: z.string().min(1, "Agent is required"),

  address: z.string().optional(),
  pincode: z.coerce.string().min(1, "Pincode is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),

  nominee_name: z.string().optional(),
  nominee_age: z.coerce.number().optional(),
  nominee_relation: z.string().optional(),

  tenure: z.number(),
});