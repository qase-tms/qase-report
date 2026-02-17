import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import { Send, Loader2, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { useRootStore } from '../../store'
import { isServerMode } from '../../services/ApiDataService'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'

type DialogState = 'form' | 'sending' | 'success' | 'error'

interface SendResponse {
  success: boolean
  run_id: number
  run_url: string
  results_count: number
}

interface ErrorResponse {
  error: string
  message: string
}

export const SendToQaseButton = observer(() => {
  const root = useRootStore()

  // Mode gating - render nothing in static mode
  if (!isServerMode()) {
    return null
  }

  const [open, setOpen] = useState(false)
  const [dialogState, setDialogState] = useState<DialogState>('form')
  const [currentStep, setCurrentStep] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form fields
  const [projectCode, setProjectCode] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [title, setTitle] = useState(root.reportStore.runData?.title ?? '')

  // Success response
  const [successData, setSuccessData] = useState<SendResponse | null>(null)

  // Update title when run data changes
  useEffect(() => {
    if (root.reportStore.runData?.title) {
      setTitle(root.reportStore.runData.title)
    }
  }, [root.reportStore.runData?.title])

  // Cleanup timers on unmount
  useEffect(() => {
    let timer1: NodeJS.Timeout
    let timer2: NodeJS.Timeout

    if (dialogState === 'sending') {
      timer1 = setTimeout(() => setCurrentStep(1), 800)
      timer2 = setTimeout(() => setCurrentStep(2), 1600)
    }

    return () => {
      if (timer1) clearTimeout(timer1)
      if (timer2) clearTimeout(timer2)
    }
  }, [dialogState])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when closing
      setDialogState('form')
      setErrorMessage(null)
      setCurrentStep(0)
      setSuccessData(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any previous error
    setErrorMessage(null)

    // Set to sending state
    setDialogState('sending')
    setCurrentStep(0)

    try {
      const response = await fetch('/api/send-to-qase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_code: projectCode.trim(),
          token: apiToken.trim(),
          title: title.trim(),
        }),
      })

      if (!response.ok) {
        // Parse error response
        let errorData: ErrorResponse
        try {
          errorData = await response.json()
        } catch {
          errorData = {
            error: 'UnknownError',
            message: 'An unexpected error occurred',
          }
        }

        // Map status codes to user-friendly messages
        let userMessage = errorData.message
        if (response.status === 401) {
          userMessage = 'Invalid API token. Please check your token and try again.'
        } else if (response.status === 404) {
          userMessage = 'Project not found. Please verify the project code.'
        } else if (response.status === 502) {
          userMessage = 'Could not reach Qase API. Please check your network connection.'
        }

        // Set error message and go back to form state
        setErrorMessage(userMessage)
        setDialogState('form')
        return
      }

      // Parse success response
      const data: SendResponse = await response.json()
      setSuccessData(data)
      setDialogState('success')
    } catch (error) {
      // Network error or parsing error
      setErrorMessage('Could not reach Qase API. Please check your network connection.')
      setDialogState('form')
    }
  }

  const handleFieldChange = () => {
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage(null)
    }
  }

  const isSubmitDisabled =
    !projectCode.trim() || !apiToken.trim() || !title.trim()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          disabled={!root.reportStore.runData}
          aria-label="Send to Qase"
          className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send to Qase</DialogTitle>
          <DialogDescription>Send test results to Qase TMS</DialogDescription>
        </DialogHeader>

        {/* Form State */}
        {dialogState === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Error Alert */}
            {errorMessage && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Project Code Field */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Project Code
              </label>
              <input
                type="text"
                value={projectCode}
                onChange={(e) => {
                  setProjectCode(e.target.value)
                  handleFieldChange()
                }}
                placeholder="e.g. DEMO"
                className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* API Token Field */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                API Token
              </label>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => {
                  setApiToken(e.target.value)
                  handleFieldChange()
                }}
                placeholder="Qase API token"
                className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Test Run Title Field */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Test Run Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  handleFieldChange()
                }}
                className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitDisabled}>
                Send Results
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Sending State - Progress Indicator */}
        {dialogState === 'sending' && (
          <div className="flex flex-col gap-4 py-4">
            {/* Step 1: Creating test run */}
            <div className="flex items-center gap-3">
              {currentStep > 0 ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              )}
              <span className="text-sm">Creating test run...</span>
            </div>

            {/* Step 2: Sending results */}
            <div className="flex items-center gap-3">
              {currentStep > 1 ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              ) : currentStep === 1 ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-muted" />
              )}
              <span className="text-sm">Sending results...</span>
            </div>

            {/* Step 3: Completing run */}
            <div className="flex items-center gap-3">
              {currentStep > 2 ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              ) : currentStep === 2 ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-muted" />
              )}
              <span className="text-sm">Completing run...</span>
            </div>
          </div>
        )}

        {/* Success State */}
        {dialogState === 'success' && successData && (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Results sent successfully!</p>
                <p className="text-xs text-muted-foreground">
                  {successData.results_count} test results sent
                </p>
              </div>
            </div>

            <a
              href={successData.run_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <span>Open in Qase TMS</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
})
