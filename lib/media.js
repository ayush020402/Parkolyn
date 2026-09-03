// Ad / brand media gallery — this powers the "Studio" section that exists
// specifically so real photos and video ads can be dropped in while the
// physical product is still in production.
//
// HOW TO ADD YOUR OWN CONTENT:
// 1. Drop the file into /public/media/ads/ (e.g. teaser-01.mp4, shoot-02.jpg)
// 2. Add an entry below with matching `src`.
// 3. type: "video" | "image" | "placeholder"
//    Leave type: "placeholder" entries as-is until you have real footage —
//    they render as designed brand cards instead of a broken file.

export const MEDIA_ITEMS = [
  {
    id: "brand-film",
    type: "placeholder",
    size: "large",
    title: "Brand Film — Coming Soon",
    caption: "Drop your hero ad video at /public/media/ads/brand-film.mp4",
  },
  {
    id: "campaign-01",
    type: "placeholder",
    size: "small",
    title: "Campaign Shoot",
    caption: "Add a local photo — /public/media/ads/campaign-01.jpg",
  },
  {
    id: "campaign-02",
    type: "placeholder",
    size: "small",
    title: "Behind the Scenes",
    caption: "Add a local video — /public/media/ads/campaign-02.mp4",
  },
  {
    id: "campaign-03",
    type: "placeholder",
    size: "small",
    title: "Studio Details",
    caption: "Add a local photo — /public/media/ads/campaign-03.jpg",
  },
  {
    id: "campaign-04",
    type: "placeholder",
    size: "small",
    title: "Reel",
    caption: "Add a local video — /public/media/ads/campaign-04.mp4",
  },
];
