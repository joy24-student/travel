import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password needs one uppercase letter")
  .regex(/[a-z]/, "Password needs one lowercase letter")
  .regex(/[0-9]/, "Password needs one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const emailOnlySchema = z.object({
  email: emailSchema,
});

export const otpSchema = z.object({
  identifier: z.string().trim().min(1, "Email or phone is required"),
  token: z
    .string()
    .trim()
    .min(6, "Enter the 6 digit code")
    .max(8, "Code is too long"),
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema.optional().or(z.literal("")),
    token: z.string().trim().optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type EmailOnlyFormValues = z.infer<typeof emailOnlySchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
