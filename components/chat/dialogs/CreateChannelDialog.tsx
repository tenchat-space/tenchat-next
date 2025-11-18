import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Typography
} from "@mui/material";

interface CreateChannelDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateChannelDialog({ open, onClose }: CreateChannelDialogProps) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    // Mock creation logic
    console.log("Creating channel:", { name, isPrivate });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Create Channel</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Channel Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            placeholder="What is this channel about?"
          />
          <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <FormControlLabel
              control={<Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} color="secondary" />}
              label="Private Channel"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
              {isPrivate 
                ? "Only people with an invite link can join." 
                : "Anyone can find and join this channel."}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="secondary" onClick={handleCreate} disabled={!name}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

