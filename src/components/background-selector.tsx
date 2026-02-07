import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BackgroundSelector() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Fond d'application</h3>

      <Tabs defaultValue="color">
        <TabsList>
          <TabsTrigger value="color">Couleur</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>

        <TabsContent value="color">
          <p>Sélection de couleur</p>
        </TabsContent>

        <TabsContent value="image">
          <p>Upload d'image</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
