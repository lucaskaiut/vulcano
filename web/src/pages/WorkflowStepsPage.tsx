import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  WORKFLOW_TYPE_LABELS,
  WORKFLOW_TYPES,
  listSteps,
} from '../services/workflowService'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Select } from '../components/ui/Select'
import { WorkflowStepsEditor } from '../components/workflow/WorkflowStepsEditor'
import type { WorkflowType } from '../types/workflow'

export function WorkflowStepsPage() {
  const [selectedType, setSelectedType] = useState<WorkflowType>('vacation_request')

  const {
    data: steps = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['workflow-steps', selectedType],
    queryFn: () => listSteps(selectedType),
  })

  const typeOptions = WORKFLOW_TYPES.map((t) => ({
    value: t,
    label: WORKFLOW_TYPE_LABELS[t],
  }))

  return (
    <>
      <PageHeader title="Configuração de Workflows" />

      <Card>
        <CardHeader className="text-left">
          <CardTitle>Etapas de aprovação</CardTitle>
        </CardHeader>

        <div className="mb-4 max-w-sm">
          <Select
            value={selectedType}
            options={typeOptions}
            onChange={(v) => setSelectedType(v)}
            aria-label="Selecione o tipo de workflow"
          />
        </div>

        {isLoading ? (
          <p className="py-4 text-center text-sm text-foreground-muted">
            Carregando...
          </p>
        ) : (
          <WorkflowStepsEditor
            type={selectedType}
            steps={steps}
            onStepsChanged={() => refetch()}
          />
        )}
      </Card>
    </>
  )
}
