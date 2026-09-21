import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import TrackForm from "./TrackForm";

export const metadata = {
  title: "Track your order — Parkolyn Amsterdam",
  description: "Check the status of your Parkolyn Amsterdam order and follow your parcel with the courier.",
};

export default function TrackPage() {
  return (
    <div className="container-px py-20">
      <SectionHeading
        eyebrow="Track"
        title="Track your order"
        description="Enter the email address or mobile number you used at checkout to see where your order is — including the courier and tracking number once it ships."
      />

      <div className="mt-12 max-w-3xl">
        <TrackForm />
        <p className="mt-10 text-xs leading-relaxed text-ink-dim/80">
          For your privacy we only show order status and courier details — never your address or contact
          information. Can&apos;t find your order?{" "}
          <Link href="/contact" className="text-gold underline-offset-2 hover:underline">
            Get in touch
          </Link>{" "}
          and we&apos;ll help.
        </p>
      </div>
    </div>
  );
}
