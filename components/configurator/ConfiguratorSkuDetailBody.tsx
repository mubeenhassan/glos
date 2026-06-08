import {cx} from '@/components/cms/utils'
import type {SkuDetailPayload} from '@/lib/configuratorSkuDetail'

function keyIcon(type: SkuDetailPayload['keyInfoItems'][number]['key'], colour = '#b8bcc5') {
  if (type === 'power') {
    return (
      <svg viewBox="0 0 16 16" className="block h-4 w-4" aria-hidden="true">
        <path d="M9.4 0.9 4.7 8h2.8L6.6 15l4.7-7H8.4z" fill="currentColor" />
      </svg>
    )
  }

  if (type === 'finish') {
    return (
      <svg viewBox="0 0 16 16" className="block h-4 w-4" aria-hidden="true">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#1d1e22" />
      </svg>
    )
  }

  if (type === 'colour') {
    return (
      <svg viewBox="0 0 16 16" className="block h-4 w-4" aria-hidden="true">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill={colour} />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 16 16" className="block h-4 w-4" aria-hidden="true">
      <path d="M1.5 14.5 8 1.8l6.5 12.7z" fill="#b8bcc5" />
    </svg>
  )
}

function keyIconClass(key: SkuDetailPayload['keyInfoItems'][number]['key']) {
  if (key === 'power') return 'text-[#111216]'
  if (key === 'finish') return 'text-[#b4b7be]'
  if (key === 'colour') return 'text-[#f3b32f]'
  return 'text-[#b6b8bf]'
}

function SpecSection({
  title,
  rows,
  emptyMessage,
}: {
  title: string
  rows: SkuDetailPayload['designRows']
  emptyMessage: string
}) {
  return (
    <article className="cfg-sku-spec-section">
      <h3 className="m-0 mb-3 text-[14px] font-bold text-[#111827]">{title}</h3>
      {rows.length === 0 ? (
        <p className="meta text-xs">{emptyMessage}</p>
      ) : (
        <dl className="m-0">
          {rows.map((item) => (
            <div
              key={`${title}-${item.label}-${item.value}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#0000001A] py-1.5"
            >
              <dt className="m-0 text-[12px] font-[400] text-[#374151]">{item.label}</dt>
              <dd className="m-0 text-right text-[12px] text-[#374151]">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  )
}

type ConfiguratorSkuDetailBodyProps = {
  detail: SkuDetailPayload
}

export default function ConfiguratorSkuDetailBody({detail}: ConfiguratorSkuDetailBodyProps) {
  return (
    <div className="cfg-sku-panel-body grid grid-cols-1 gap-5 min-[900px]:grid-cols-3 min-[900px]:gap-6">
      <div className="cfg-sku-spec-section grid gap-3 min-[900px]:gap-[10px]">
        <article className="cfg-sku-spec-section border-b border-[#eceef2] pb-4 min-[900px]:border-b-0 min-[900px]:pb-0">
          <h3 className="m-0 mb-2.5 text-[14px] font-[700] text-[#111827]">Key Product Info</h3>
          {detail.keyInfoItems.length === 0 ? (
            <p className="meta text-xs">No key product info available.</p>
          ) : (
            <div className="flex flex-wrap gap-x-5 gap-y-2 min-[900px]:gap-x-6">
              {detail.keyInfoItems.map((item) => (
                <div
                  key={item.key}
                  className={cx(
                    'inline-flex min-h-6 items-center gap-2 text-[12px] text-[#171a22]',
                    item.key === 'power' && ' text-[#2563EB]',
                  )}
                >
                  <span
                    className={cx(
                      'inline-flex h-4 w-4 shrink-0 translate-y-[-1px] items-center justify-center',
                      keyIconClass(item.key),
                    )}
                    aria-hidden="true"
                  >
                    {item.key === 'colour'
                      ? keyIcon('colour', detail.colourSwatch)
                      : keyIcon(item.key)}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <SpecSection
          title="Design Specifications"
          rows={detail.designRows}
          emptyMessage="No design specification rows available."
        />
      </div>

      <div className="cfg-sku-spec-section grid gap-5 min-[900px]:gap-[22px]">
        <SpecSection
          title="Performance Specifications"
          rows={detail.performanceRows}
          emptyMessage="No performance specification rows available."
        />
      </div>

      <div className="cfg-sku-spec-section grid gap-5 min-[900px]:gap-[22px]">
        <SpecSection title="Driver" rows={detail.driverRows} emptyMessage="No driver rows available." />
        <SpecSection
          title="Installation Specifications"
          rows={detail.installationRows}
          emptyMessage="No installation rows available."
        />
      </div>
    </div>
  )
}
