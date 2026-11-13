/**
 * Board modal metrics for the shared <Modal>: 20/24/14 header, 18 px title, 13 px description,
 * body flush under the header and a borderless 16/24/20 footer (the body's bottom padding supplies the 16).
 */
export const boardModal = [
  '[&>div:first-child]:pt-5 [&>div:first-child]:pb-3.5',
  '[&>div:first-child_h2]:text-[18px] [&>div:first-child_h2]:leading-[26px]',
  '[&>div:first-child_p]:text-13 [&>div:first-child_p]:leading-[19px]',
  '[&>div:nth-child(2)]:pt-0',
  '[&>div:nth-child(3)]:border-0 [&>div:nth-child(3)]:pt-0 [&>div:nth-child(3)]:pb-5',
  'bg-raised sm:max-h-[calc(100dvh-48px)]',
].join(' ');
