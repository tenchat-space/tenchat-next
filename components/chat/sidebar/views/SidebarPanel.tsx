import { Box, Typography, alpha } from "@mui/material";

interface SidebarPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function SidebarPanel({ title, subtitle, children, actions }: SidebarPanelProps) {
  return (
    <Box
      sx={{
        width: 320,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        backgroundImage:
          "linear-gradient(180deg, rgba(124,58,237,0.05), rgba(15,23,42,0.95))",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          backdropFilter: "blur(10px)",
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: "secondary.main", fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box>{actions}</Box>}
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

