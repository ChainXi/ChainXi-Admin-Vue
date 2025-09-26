interface BusuanziType {
  fetch: () => void
}

interface Window {
  Busuanzi?: BusuanziType
}

declare const Busuanzi: BusuanziType | undefined