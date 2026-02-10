import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Dialog,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
} from '@mui/material'
import { useRootStore } from '../../store'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export const SearchModal = observer(({ open, onClose }: SearchModalProps) => {
  const root = useRootStore()
  const [query, setQuery] = useState('')

  // Filter results by title (case-insensitive)
  const results = root.testResultsStore.resultsList.filter((test) =>
    test.title.toLowerCase().includes(query.toLowerCase())
  )

  // Limit to first 10 results for performance
  const displayedResults = results.slice(0, 10)

  const handleResultClick = (testId: string) => {
    root.selectTest(testId)
    onClose()
    setQuery('') // Clear search on close
  }

  const handleClose = () => {
    onClose()
    setQuery('') // Clear search on close
  }

  const getSuiteName = (test: (typeof results)[0]) => {
    if (!test.relations?.suite?.data?.length) {
      return 'No suite'
    }
    return test.relations.suite.data.map((s) => s.title).join(' > ')
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          position: 'fixed',
          top: '20%',
          m: 0,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="Search tests..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="outlined"
          size="small"
        />
      </Box>

      <List sx={{ maxHeight: '400px', overflow: 'auto', px: 1, pb: 1 }}>
        {query.trim() === '' ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  Type to search tests...
                </Typography>
              }
            />
          </ListItem>
        ) : displayedResults.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  No results found
                </Typography>
              }
            />
          </ListItem>
        ) : (
          displayedResults.map((test) => (
            <ListItemButton
              key={test.id}
              onClick={() => handleResultClick(test.id)}
              sx={{ borderRadius: 1 }}
            >
              <ListItemText
                primary={test.title}
                secondary={`${test.execution.status} • ${getSuiteName(test)}`}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
          ))
        )}
      </List>
    </Dialog>
  )
})
