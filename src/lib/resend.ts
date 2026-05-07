import { Resend } from "resend";

const key = process.env.RESEND_API_KEY;
if (!key) throw new Error("RESEND_API_KEY is not set");

export const resend = new Resend(key);
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "hello@shotstudio.app";
