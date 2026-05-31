'use client'

import {useId, useState} from 'react'
import {FiChevronDown} from 'react-icons/fi'
import type {FaqEntryItem} from '@/lib/faq'
import {cx} from '@/components/cms/utils'

type Props = {
  items: FaqEntryItem[]
  defaultOpenId?: string | null
}

const listClassName = 'm-0 flex list-none flex-col gap-[16px] p-0';

const itemClassName = 'overflow-hidden rounded-[8px] bg-[#FAFAFA]';

const triggerClassName =
  'flex w-full cursor-pointer items-center justify-between gap-4 bg-transparent px-5 py-4 text-left md:px-6 md:py-6';

const triggerOpenClassName = 'md:border-b md:border-[#00000026]';

const questionClassName =
  'm-0 flex-1 md:font-[600] font-[500] text-[16px] leading-snug text-[#111827] md:text-[20px]';

const iconClassName =
  'shrink-0 text-[18px] text-[#6b7280] transition-transform duration-300';

const answerWrapClassName = 'border-t border-[#eceef2] px-5 pb-5 pt-6 md:px-6 md:pb-6';

const answerClassName =
  'm-0 text-[14px] leading-7 text-[#4b5563] md:text-[20px] md:leading-[1.5]';

export default function FaqAccordion({items, defaultOpenId}: Props) {
  const baseId = useId()
  const [openId, setOpenId] = useState<string | null>(
    defaultOpenId ?? items[0]?._id ?? null,
  )

  if (items.length === 0) {
    return null
  }

  return (
    <ul className={listClassName}>
      {items.map((item) => {
        const isOpen = openId === item._id
        const panelId = `${baseId}-${item._id}-panel`
        const triggerId = `${baseId}-${item._id}-trigger`

        return (
          <li key={item._id} className={itemClassName}>
            <button
              type="button"
              id={triggerId}
              className={cx(triggerClassName, isOpen && triggerOpenClassName)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : item._id)}
            >
              <span className={questionClassName}>{item.question}</span>
              <FiChevronDown
                className={cx(iconClassName, isOpen && 'rotate-180')}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={answerWrapClassName}
              >
                <p className={answerClassName}>{item.answer}</p>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
