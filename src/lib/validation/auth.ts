import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string({ message: "Email is required." })
    .trim()
    .min(1, "Email is required.")
    .email("Please provide a valid email address."),
  password: z
    .string({ message: "Password is required." })
    .min(1, "Password is required."),
});

export type SignInInput = z.infer<typeof signInSchema>;
