import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Twitch Community Intelligence — What Viewers & Creators Are Saying",
  description: "1,200+ data points from Reddit, App Store, YouTube, and more — analyzing creator-viewer connection pain points and notification gaps on Twitch. Built with Claude Code.",
  openGraph: {
    title: "Twitch Community Intelligence",
    description: "Live research: 1,200+ data points on what Twitch viewers and creators actually say about community, discovery, and notifications.",
  },
};

export default function TwitchCommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
