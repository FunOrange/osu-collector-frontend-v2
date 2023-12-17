"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// const stripePromise = loadStripe("pk_test_51JVjhhKoq9U17mD0sDkdxbLmHsLEvF0eeUUhgaJEeZgG0Iskojm8KV6UQPp4KeccpCU06rDqPmlb1EhMTOy9TrVN001tIYiti9")
const stripePromise = loadStripe(
  "pk_live_51JVjhhKoq9U17mD0DFdbNlJ7dBkPDBZd6lMrLcfd3AfKiuSp7beXY16YpttOc4ZzS4ulVJ7vwSoLeCfe2tTuYnF100TETgqT2M"
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
