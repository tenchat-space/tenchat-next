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
  Typography,
  CircularProgress
} from "@mui/material";
import { useAppwrite } from "@/contexts/AppwriteContext";
import { chatService } from "@/lib/appwrite";
import { ConversationsType } from "@/types/appwrite.d";

interface CreateChannelDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateChannelDialog({ open, onClose }: CreateChannelDialogProps) {
  const { currentAccount } = useAppwrite();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!currentAccount || !name) return;

    try {
      setIsLoading(true);
      await chatService.createConversation(
        [currentAccount.$id],
        ConversationsType.CHANNEL,
        name,
        {
          description,
          isPublic: !isPrivate
        }
      );
      onClose();
      setName("");
      setDescription("");
      setIsPrivate(false);
    } catch (error) {
      console.error("Failed to create channel:", error);
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
          />
          <TextField
            label="Description (Optional)"
            fullWidth
            multiline
            rows={3}
            placeholder="What is this channel about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
          <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <FormControlLabel
              control={<Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} color="secondary" disabled={isLoading} />}
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
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleCreate} 
          disabled={!name || isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

