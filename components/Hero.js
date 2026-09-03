import fs from "fs";
import path from "path";
import HeroContent from "./HeroContent";

function heroVideoExists() {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", "media", "hero.mp4"));
  } catch {
    return false;
  }
}

export default function Hero() {
  return <HeroContent hasVideo={heroVideoExists()} />;
}
