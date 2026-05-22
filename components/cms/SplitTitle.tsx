import { stegaClean } from "@sanity/client/stega";

type SplitTitleProps = {
  as?: "h1" | "h2";
  title: string;
  className?: string;
  dataSanity?: string;
  wordOuterClassName: string;
  wordInnerClassName: string;
};

export default function SplitTitle({
  as: Tag = "h2",
  title,
  className,
  dataSanity,
  wordOuterClassName,
  wordInnerClassName,
}: SplitTitleProps) {
  const cleanTitle = stegaClean(title);
  const segments = cleanTitle.split(/(\s+)/);

  return (
    <Tag className={className} aria-label={cleanTitle} data-sanity={dataSanity}>
      {segments.map((segment, index) =>
        /^\s+$/.test(segment) ? (
          segment
        ) : (
          <span key={index} className={wordOuterClassName}>
            <span className={wordInnerClassName}>{segment}</span>
          </span>
        ),
      )}
    </Tag>
  );
}
