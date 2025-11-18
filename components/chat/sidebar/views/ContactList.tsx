import {
  Avatar,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Button,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { SidebarPanel } from "./SidebarPanel";

const MOCK_CONTACTS = [
  { id: "1", name: "Alice Chen", status: "online" },
  { id: "2", name: "Bob Smith", status: "last seen 5m ago" },
  { id: "3", name: "Carol Williams", status: "last seen yesterday" },
  { id: "4", name: "David Jones", status: "online" },
];

interface ContactListProps {
  onAddContact: () => void;
}

export function ContactList({ onAddContact }: ContactListProps) {
  return (
    <SidebarPanel
      title="Contacts"
      subtitle={`${MOCK_CONTACTS.length} contacts`}
      actions={
        <Button startIcon={<PersonAdd />} size="small" variant="text" color="secondary" onClick={onAddContact}>
          Add
        </Button>
      }
    >
      <List>
        {MOCK_CONTACTS.map((contact) => (
          <ListItemButton key={contact.id}>
            <ListItemAvatar>
              <Avatar>{contact.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={contact.name}
              secondary={contact.status}
              secondaryTypographyProps={{
                color: contact.status === "online" ? "success.main" : "text.secondary",
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </SidebarPanel>
  );
}
