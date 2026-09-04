import ComingSoon from "@/components/ComingSoon";
import { CosmeticsIcon } from "@/components/CategoryIcons";

export const metadata = {
  title: "Cosmetics — Coming Soon — Parkolyn Amsterdam",
  description: "Parkolyn Amsterdam's cosmetics line is in development. Join the list to be notified at launch.",
};

export default function CosmeticsPage() {
  return (
    <ComingSoon
      icon={<CosmeticsIcon className="h-full w-full" />}
      title="Cosmetics"
      description="Our cosmetics line is the next chapter of Parkolyn Amsterdam — currently in development with the same care as our debut fragrance collection. Join the list to be notified the moment it launches."
    />
  );
}
