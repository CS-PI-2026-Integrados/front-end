import { useMemo } from 'react'
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
} from '@/shared/components/ui/card.jsx'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useTheme } from '@/shared/hooks/useTheme'

export function ProofData({ monthlyCounts = [], isLoading = false, error = null }) {
  const { isDarkMode } = useTheme()

  const dadosGrafico = useMemo(() => {
    const nomesMeses = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]

    return monthlyCounts.map(({ month, count }) => ({
      name: nomesMeses[Number(month.slice(5, 7)) - 1],
      total: count,
    }))
  }, [monthlyCounts])

  const tooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f3f4f6' : '#111827',
            borderRadius: '8px',
            border: isDarkMode ? '1px solid #374151' : 'none',
            padding: '8px 12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <p style={{ fontSize: '12px' }}>{`Total: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">Atendimentos mensais</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Total de atendimentos registrados por mês nos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p
            role="status"
            className="text-muted-foreground flex h-75 items-center justify-center text-sm"
          >
            Carregando atendimentos mensais...
          </p>
        ) : error ? (
          <p
            role="alert"
            className="text-destructive flex h-75 items-center justify-center text-sm"
          >
            {error}
          </p>
        ) : (
          <div style={{ width: '100%', minWidth: 0, minHeight: 0 }} className="mt-4 h-75">
            <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                />
                <XAxis
                  dataKey="name"
                  axisLine={true}
                  tickLine={true}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  dy={6}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={true}
                  tickLine={true}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  dx={-6}
                />

                <Tooltip
                  cursor={{ fill: isDarkMode ? '#374151' : '#f3f4f6' }}
                  content={tooltipContent}
                />
                <Bar dataKey="total" fill="#166534" radius={[6, 6, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
