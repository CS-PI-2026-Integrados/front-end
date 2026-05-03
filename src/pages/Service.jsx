import { ConvictedCard } from '@/components/service/ConvictedCard.jsx'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs.jsx'

const Service = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <div>
          <h1 className="text-3xl font-bold">Emissão de Comprovantes</h1>
          <p className="text-muted-foreground mt-2">Gere comprovantes de comparecimento com foto</p>
        </div>
        <div>
          <Tabs defaultValue="novo" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="novo">Novo comprovante</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="novo" className="flex w-full gap-6">
              <ConvictedCard className="flex-1" />
              <ConvictedCard className="flex-1" />
            </TabsContent>
          </Tabs>
        </div>
        {/*<div className="flex w-full flex-row justify-between gap-6">*/}
        {/*  <ConvictedCard className="flex-1" />*/}
        {/*  <ConvictedCard className="flex-1" /> /!*só simulando mesmo.*!/*/}
        {/*</div>*/}
      </div>
    </div>
  )
}

export default Service
