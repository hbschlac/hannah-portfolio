"use client";

import Image from "next/image";
import { useState } from "react";
import { colors, fonts } from "@/lib/jamie/brand";

type Props = {
  name: string;
  role?: string;
  city: string;
  photoUrl?: string;
};

export default function PortraitCard({ name, role, city, photoUrl }: Props) {
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = !!photoUrl && !imgFailed;
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          background: colors.mist,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
        }}
      >
        {showImage ? (
          <Image
            src={photoUrl!}
            alt={name}
            fill
            sizes="(max-width: 768px) 33vw, 200px"
            style={{ objectFit: "cover" }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: 400,
              fontSize: "2.6rem",
              color: colors.inkSoft,
              letterSpacing: "-0.02em",
            }}
          >
            {initial}
          </span>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: 18,
            color: colors.ink,
            lineHeight: 1.15,
            letterSpacing: "-0.005em",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 11,
            color: colors.inkSoft,
            letterSpacing: "0.08em",
            marginTop: 4,
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {role ? `${role} · ${city}` : city}
        </div>
      </div>
    </div>
  );
}
