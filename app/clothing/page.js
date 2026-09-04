import ComingSoon from "@/components/ComingSoon";
import { ClothingIcon } from "@/components/CategoryIcons";

export const metadata = {
  title: "Clothing — Coming Soon — Parkolyn Amsterdam",
  description: "Parkolyn Amsterdam's apparel line is in development. Join the list to be notified at launch.",
};

export default function ClothingPage() {
  return (
    <ComingSoon
      icon={<ClothingIcon className="h-full w-full" />}
      title="Clothing"
      description="Our apparel line is the next chapter of Parkolyn Amsterdam — currently in development with the same care as our debut fragrance collection. Join the list to be notified the moment it launches."
    />
  );
}
