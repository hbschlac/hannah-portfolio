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
    <div>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3 / 4",
          background: colors.mist,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showImage ? (
          <Image
            src={photoUrl!}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            style={{ objectFit: "cover" }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: 400,
              fontSize: "3.4rem",
              color: colors.inkSoft,
              letterSpacing: "-0.02em",
            }}
          >
            {initial}
          </span>
        )}
      </div>
      <div style={{ marginTop: 10 }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: 19,
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
            fontSize: 12,
            color: colors.inkSoft,
            letterSpacing: "0.05em",
            marginTop: 3,
          }}
        >
          {role ? `${role.toUpperCase()} · ${city}` : city.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
