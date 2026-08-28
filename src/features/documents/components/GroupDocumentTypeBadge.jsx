import { Badge } from '@/shared/components/ui/badge'

const TYPE_CONFIG = {
  CONCLUSAO: {
    label: 'Conclusão',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  NAO_COMPARECIMENTO: {
    label: 'Não comparecimento',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  COMPARECIMENTO_PARCIAL: {
    label: 'Comparecimento parcial',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
}

export function GroupDocumentTypeBadge({ type }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.CONCLUSAO
  return <Badge className={config.className}>{config.label}</Badge>
}
