import { useState, useRef } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  AttachFile,
  Call,
  EmojiEmotions,
  Mic,
  MoreVert,
  Send,
  VideoCall,
  Check,
  DoneAll,
  Image as ImageIcon,
} from "@mui/icons-material";
import { Conversation, useMessages } from "@/hooks/useMessaging";
import { storageService } from "@/lib/appwrite/services/storage.service";
import { BUCKET_IDS } from "@/lib/appwrite/config/constants";
import { ExtensionSlotRenderer } from "@/components/extensions/ExtensionSlotRenderer";

interface ChatWindowProps {
  conversation: Conversation | null;
  currentUserId: string;
  isAuthenticated: boolean;
  onConnect: () => void;
}

export function ChatWindow({
  conversation,
  currentUserId,
  isAuthenticated,
  onConnect,
}: ChatWindowProps) {
  const { messages, isLoading, sendMessage } = useMessages(conversation?.$id || "");
  const [composer, setComposer] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!conversation || !composer.trim()) return;
    try {
      await sendMessage({
        conversationId: conversation.$id,
        senderId: currentUserId,
        content: composer.trim(),
        contentType: "text",
      });
      setComposer("");
    } catch (error) {
      console.error("Message send failed", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !conversation) return;

    try {
      setIsUploading(true);
      const uploadedFile = await storageService.uploadMessageAttachment(file);
      
      await sendMessage({
        conversationId: conversation.$id,
        senderId: currentUserId,
        content: "Sent an image",
        contentType: "image",
        metadata: {
          fileId: uploadedFile.$id,
          bucketId: BUCKET_IDS.MESSAGES,
          fileName: file.name,
          mimeType: file.type,
        }
      });
    } catch (error) {
      console.error("File upload failed", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatConversationLabel = (conv: Conversation) => {
    if (conv.name) return conv.name;
    if (conv.participantIds?.length === 2) {
      const other = conv.participantIds.find((id) => id !== currentUserId);
      return other || "Direct chat";
    }
    return "Tenchat room";
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        backgroundImage:
          "radial-gradient(circle at top right, rgba(250,204,21,0.15), transparent 55%), linear-gradient(160deg, rgba(124,58,237,0.7), transparent 65%)",
      }}
    >
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", backdropFilter: "blur(10px)", bgcolor: "rgba(12, 4, 11, 0.5)" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack>
            <Typography variant="h6" sx={{ color: "secondary.main", fontWeight: 600 }}>
              {conversation ? formatConversationLabel(conversation) : "Welcome to Tenchat"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isAuthenticated 
                ? conversation ? "Encrypted • Online" : "Secure Messaging"
                : "Connect wallet to start"}
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            {/* Extension Slot: Header Actions */}
            <ExtensionSlotRenderer slot="chat_header_action" direction="row" />

            {conversation && isAuthenticated && (
              <>
                <Tooltip title="Voice Call">
                  <IconButton color="secondary">
                    <Call />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Video Call">
                  <IconButton color="secondary">
                    <VideoCall />
                  </IconButton>
                </Tooltip>
                <IconButton color="default">
                  <MoreVert />
                </IconButton>
              </>
            )}
            {!isAuthenticated && (
              <Button
                variant="contained"
                color="secondary"
                onClick={onConnect}
                size="small"
              >
                Connect Wallet
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, display: "flex", flexDirection: "column-reverse" }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
               <Typography color="text.secondary">Loading secure messages...</Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.7 }}>
              <Box sx={{ fontSize: 64, mb: 2 }}>🔐</Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No messages here yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send a message to start an encrypted conversation.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} direction="column-reverse">
              {messages.map((message) => {
                const isSelf = message.senderId === currentUserId;
                return (
                  <Box
                    key={message.$id}
                    sx={{
                      alignSelf: isSelf ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isSelf ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        px: 2.5,
                        bgcolor: isSelf ? "primary.main" : "rgba(255,255,255,0.05)",
                        color: isSelf ? "primary.contrastText" : "text.primary",
                        borderRadius: isSelf ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        position: 'relative',
                        backgroundImage: isSelf ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'none',
                        border: isSelf ? 'none' : '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {!isSelf && (
                        <Typography variant="caption" sx={{ color: "secondary.main", fontWeight: 600, display: 'block', mb: 0.5 }}>
                          {message.senderId}
                        </Typography>
                      )}
                      
                      {message.contentType === 'image' && message.metadata?.fileId ? (
                        <Box 
                          component="img"
                          src={storageService.getFilePreview(message.metadata.bucketId, message.metadata.fileId, 400, 0)}
                          alt="Attachment"
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 300,
                            borderRadius: 2,
                            mb: 1,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            if (message.metadata) {
                              window.open(storageService.getFileView(message.metadata.bucketId, message.metadata.fileId), '_blank');
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                          {message.content}
                        </Typography>
                      )}
                      
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} sx={{ mt: 0.5, opacity: 0.7 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          10:30 AM
                        </Typography>
                        {isSelf && (
                           <DoneAll sx={{ fontSize: 14 }} />
                        )}
                      </Stack>
                    </Paper>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, bgcolor: "background.paper", borderTop: 1, borderColor: "divider" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
            />
            
            {/* Extension Slot: Input Actions */}
            <ExtensionSlotRenderer slot="chat_input_action" direction="row" />

            <IconButton 
              color="secondary" 
              disabled={!conversation || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <CircularProgress size={24} color="inherit" /> : <AttachFile />}
            </IconButton>
            
            <TextField
              fullWidth
              placeholder="Write a message..."
              value={composer}
              onChange={(event) => setComposer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!conversation || !isAuthenticated}
              variant="outlined"
              size="medium"
              multiline
              maxRows={4}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.03)",
                  borderRadius: 3,
                  "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                  "&.Mui-focused fieldset": { borderColor: "secondary.main" }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" disabled={!conversation} color="inherit">
                      <EmojiEmotions />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {composer.trim() ? (
              <IconButton 
                color="secondary" 
                onClick={handleSendMessage}
                disabled={!conversation || !isAuthenticated}
                sx={{ 
                  bgcolor: 'rgba(250, 204, 21, 0.1)', 
                  '&:hover': { bgcolor: 'rgba(250, 204, 21, 0.2)' },
                  width: 48,
                  height: 48 
                }}
              >
                <Send />
              </IconButton>
            ) : (
              <IconButton 
                color="default" 
                disabled={!conversation}
                sx={{ width: 48, height: 48 }}
              >
                <Mic />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
