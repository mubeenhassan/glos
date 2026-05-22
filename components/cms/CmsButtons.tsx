import Link from "next/link";
import { resolveButtonHref, type CmsButton } from "@/lib/cms";
import { cx } from "@/components/cms/utils";

function buttonVariantClassName(button: CmsButton | undefined) {
  const variant = button?.variant || "primary";
  return `btn btn-${variant}`;
}

export function CmsButtonLink({
  button,
  className,
}: {
  button: CmsButton | undefined;
  className?: string;
}) {
  if (!button?.text) {
    return null;
  }

  const resolved = resolveButtonHref(button);
  const buttonClassName = cx(buttonVariantClassName(button), className);

  if (!resolved.href) {
    return (
      <span className={`${buttonClassName} btn-disabled`} aria-disabled>
        {button.text}
      </span>
    );
  }

  if (resolved.isExternal) {
    return (
      <a
        className={buttonClassName}
        href={resolved.href}
        target={resolved.openInNewTab ? "_blank" : undefined}
        rel={resolved.openInNewTab ? "noreferrer noopener" : undefined}
      >
        {button.text}
      </a>
    );
  }

  return (
    <Link className={buttonClassName} href={resolved.href}>
      {button.text}
    </Link>
  );
}

export function CmsButtonsRow({
  buttons,
  className,
  buttonClassName,
}: {
  buttons: CmsButton[] | undefined;
  className?: string;
  buttonClassName?: string;
}) {
  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <div className={cx("mt-5 flex flex-wrap gap-3", className)}>
      {buttons.map((button, index) => (
        <CmsButtonLink
          key={button._key || `${button.text}-${index}`}
          button={button}
          className={buttonClassName}
        />
      ))}
    </div>
  );
}
