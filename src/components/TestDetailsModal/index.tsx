import { observer } from 'mobx-react-lite'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useRootStore } from '../../store'
import { TestDetails } from '../TestDetails'

export const TestDetailsModal = observer(() => {
  const { selectedTest, clearSelection } = useRootStore()

  return (
    <Dialog
      open={!!selectedTest}
      onClose={clearSelection}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="test-details-title"
    >
      <DialogTitle id="test-details-title">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">
            {selectedTest ? selectedTest.title : 'Test Details'}
          </Typography>
          <IconButton
            onClick={clearSelection}
            size="small"
            aria-label="close dialog"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <TestDetails />
      </DialogContent>
    </Dialog>
  )
})
