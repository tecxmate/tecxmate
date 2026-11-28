/**
 * A product's rendered app icon (its rounded tile is part of the image), light by default and dark with the
 * site's dark theme. `base` is a folder in /public holding {light,dark}-{64,128,256,512}.{webp,png}; the 1024 px
 * originals are never served. loading="lazy" keeps the hidden theme's copy from downloading. VoiceTecx: Apple's Liquid Glass export from tecxmate/voicetecx docs/brand (cb450c5).
 */
const SIZES = [64, 128, 256, 512]

export function AppIcon({ base, alt, sizes, className = "" }: { base: string; alt: string; sizes: string; className?: string }) {
  const set = (theme: "light" | "dark", ext: "webp" | "png") =>
    SIZES.map((s) => `${base}/${theme}-${s}.${ext} ${s}w`).join(", ")
  const pic = (theme: "light" | "dark", show: string) => (
    <picture className={show}>
      <source type="image/webp" srcSet={set(theme, "webp")} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${base}/${theme}-256.png`}
        srcSet={set(theme, "png")}
        sizes={sizes}
        alt={alt}
        width={512}
        height={512}
        loading="lazy"
        className={`block w-full h-auto ${className}`}
      />
    </picture>
  )
  return (
    <>
      {pic("light", "block dark:hidden")}
      {pic("dark", "hidden dark:block")}
    </>
  )
}
