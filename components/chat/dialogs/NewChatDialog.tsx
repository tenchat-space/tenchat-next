import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NewChatDialog({ open, onClose }: NewChatDialogProps) {
  const [search, setSearch] = useState("");

  const MOCK_USERS = [
    { id: "1", name: "Alice Chen", username: "@alice" },
    { id: "2", name: "Bob Smith", username: "@bob" },
    { id: "3", name: "Charlie Da", username: "@charlie" },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>New Chat</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          placeholder="Search users..."
          fullWidth
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Suggested
        </Typography>
        <List>
          {MOCK_USERS.filter((u) =>
            u.name.toLowerCase().includes(search.toLowerCase())
          ).map((user) => (
            <ListItemButton key={user.id} onClick={onClose}>
              <ListItemText primary={user.name} secondary={user.username} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

