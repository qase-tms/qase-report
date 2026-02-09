import { useState, useEffect } from 'react'
import { TextField, InputAdornment } from '@mui/material'
import { Search } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

export const TestListSearch = observer(() => {
  const { testResultsStore } = useRootStore()
  const [localQuery, setLocalQuery] = useState('')

  // Debounce: only update store after 300ms of no typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      testResultsStore.setSearchQuery(localQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [localQuery, testResultsStore])

  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Search tests..."
      value={localQuery}
      onChange={(e) => setLocalQuery(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color="action" />
          </InputAdornment>
        ),
      }}
    />
  )
})
