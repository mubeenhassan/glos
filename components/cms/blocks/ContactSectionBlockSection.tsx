import ContactForm, {
  type ContactFormField,
} from "@/components/contact/ContactForm";
import { blockFieldDataAttribute } from "@/components/cms/sanityData";
import type { CmsBlockProps } from "@/components/cms/types";
import { getContactOffices } from "@/lib/contact";
import { cleanOptionalText, cmsSectionWidthClassName, cx } from "@/components/cms/utils";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";

export type ContactOfficeCard = {
  _key?: string;
  city: string;
  address: string;
  phone: string | null;
  email: string | null;
};

const sectionClassName = cx(
  "cms-contact-section",
  cmsSectionWidthClassName,
  "pb-12 pt-4 md:pb-16 md:pt-8 lg:pb-20",
);

const columnHeadingClassName =
  "m-0 md:font-[600] font-[500] text-[18px] leading-tight tracking-[-0.01em] text-[#1A1A1A] md:text-[48px]";

const officeCardsClassName = "mt-6 flex flex-col gap-[32px] md:mt-8";

const officeCardClassName = "rounded-[8px] bg-[#FAFAFA] md:p-[24px] p-[12px]";

const officeCityClassName =
  "m-0 mb-[16px] md:mb-[24px] text-[20px] font-semibold leading-tight text-[#111827] md:text-[24px]";

const officeRowsClassName = "flex flex-col gap-3";
const officeRowClassName = "flex items-center gap-4";

const iconWrapClassName =
  "mt-0.5 flex md:h-[40px] h-[30px] md:w-[40px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#FB612E] text-white";

const officeTextClassName = "m-0 pt-0.5 md:text-[20px] text-[14px] leading-relaxed text-[#374151]";

const hoursCardClassName = "mt-6 rounded-[8px] bg-[#FAFAFA] md:p-[24px] p-[12px]";

const hoursHeadingClassName =
  "m-0 mb-[16px] md:mb-[24px] text-[20px] font-semibold leading-tight text-[#111827] md:text-[24px]";

const hoursRowClassName =
  "flex items-center justify-between gap-6 py-1 text-[15px] ";

function normalizeFormFields(
  fields: CmsBlockProps<"contactSectionBlock">["block"]["formFields"],
): ContactFormField[] {
  if (!fields?.length) {
    return [];
  }

  const normalized: ContactFormField[] = [];

  for (const field of fields) {
    const label = field.label?.trim();
    const name = field.name?.trim();
    const fieldType = field.fieldType;

    if (
      !label ||
      !name ||
      !fieldType ||
      !["text", "email", "tel", "textarea"].includes(fieldType)
    ) {
      continue;
    }

    normalized.push({
      _key: field._key,
      label,
      name,
      fieldType,
      placeholder: field.placeholder?.trim() || undefined,
      required: Boolean(field.required),
    });
  }

  return normalized;
}

function normalizeOffices(
  raw: CmsBlockProps<"contactSectionBlock">["block"]["offices"],
): ContactOfficeCard[] {
  const offices: ContactOfficeCard[] = [];

  for (const office of raw || []) {
    const city = office.city?.trim();
    const address = office.address?.trim();
    if (!city || !address) {
      continue;
    }

    offices.push({
      _key: office._key,
      city,
      address,
      phone: office.phone?.trim() || null,
      email: office.email?.trim() || null,
    });
  }

  return offices;
}

function OfficeCard({ office }: { office: ContactOfficeCard }) {
  return (
    <article className={officeCardClassName} aria-label={office.city}>
      <h3 className={officeCityClassName}>{office.city}</h3>
      <div className={officeRowsClassName}>
        <div className={officeRowClassName}>
          <span className={iconWrapClassName} aria-hidden="true">
            <FiMapPin className="h-4 w-4" />
          </span>
          <p className={officeTextClassName}>{office.address}</p>
        </div>
        {office.phone ? (
          <div className={officeRowClassName}>
            <span className={iconWrapClassName} aria-hidden="true">
              <FiPhone className="h-4 w-4" />
            </span>
            <a
              href={`tel:${office.phone.replace(/\s/g, "")}`}
              className={cx(
                officeTextClassName,
                "transition-colors hover:text-[#EF6C44]",
              )}
            >
              {office.phone}
            </a>
          </div>
        ) : null}
        {office.email ? (
          <div className={officeRowClassName}>
            <span className={iconWrapClassName} aria-hidden="true">
              <FiMail className="h-4 w-4" />
            </span>
            <a
              href={`mailto:${office.email}`}
              className={cx(
                officeTextClassName,
                "break-all transition-colors hover:text-[#EF6C44]",
              )}
            >
              {office.email}
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default async function ContactSectionBlockSection({
  block,
  pageId,
}: CmsBlockProps<"contactSectionBlock">) {
  const formTitle = cleanOptionalText(block.formTitle) || "Send us a message";
  const officesTitle = cleanOptionalText(block.officesTitle) || "Our Offices";
  const submitLabel = cleanOptionalText(block.submitLabel) || "Send Message";
  const businessHoursTitle =
    cleanOptionalText(block.businessHoursTitle) || "Business Hours";

  const formFields = normalizeFormFields(block.formFields);
  let offices = normalizeOffices(block.offices);

  if (offices.length === 0) {
    const legacyOffices = await getContactOffices();
    offices = legacyOffices.map((office) => ({
      _key: office._id,
      city: office.city,
      address: office.address,
      phone: office.phone,
      email: office.email,
    }));
  }

  const businessHours: {
    _key?: string;
    label: string;
    hours: string;
  }[] = [];

  for (const row of block.businessHours || []) {
    const label = row.label?.trim();
    const hours = row.hours?.trim();
    if (!label || !hours) {
      continue;
    }
    businessHours.push({ _key: row._key, label, hours });
  }

  const hasForm = formFields.length > 0;
  const hasOffices = offices.length > 0;
  const hasHours = businessHours.length > 0;

  if (!hasForm && !hasOffices && !hasHours) {
    return null;
  }

  return (
    <section
      className={sectionClassName}
      aria-label={`${formTitle} — ${officesTitle}`}
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-14 xl:gap-16">
        {hasForm ? (
          <div>
            <h2
              className={columnHeadingClassName}
              data-sanity={blockFieldDataAttribute({
                pageId,
                blockKey: block._key,
                field: "formTitle",
              })}
            >
              {formTitle}
            </h2>
            <div className="mt-6 md:mt-[32px]">
              <ContactForm fields={formFields} submitLabel={submitLabel} />
            </div>
          </div>
        ) : null}

        {hasOffices || hasHours ? (
          <div className={cx(!hasForm && "lg:col-span-2")}>
            {hasOffices ? (
              <>
                <h2
                  className={columnHeadingClassName}
                  data-sanity={blockFieldDataAttribute({
                    pageId,
                    blockKey: block._key,
                    field: "officesTitle",
                  })}
                >
                  {officesTitle}
                </h2>
                <div
                  className={officeCardsClassName}
                  data-sanity={blockFieldDataAttribute({
                    pageId,
                    blockKey: block._key,
                    field: "offices",
                  })}
                >
                  {offices.map((office) => (
                    <OfficeCard key={office._key || office.city} office={office} />
                  ))}
                </div>
              </>
            ) : null}

            {hasHours ? (
              <div className={hoursCardClassName}>
                <h3
                  className={hoursHeadingClassName}
                  data-sanity={blockFieldDataAttribute({
                    pageId,
                    blockKey: block._key,
                    field: "businessHoursTitle",
                  })}
                >
                  {businessHoursTitle}
                </h3>
                <dl className="m-0">
                  {businessHours.map((row) => (
                    <div
                      key={row._key || row.label}
                      className={hoursRowClassName}
                    >
                      <dt className="m-0 font-medium text-[#1A1A1A]">
                        {row.label}
                      </dt>
                      <dd className="m-0 shrink-0 text-right text-[#555555]">
                        {row.hours}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
