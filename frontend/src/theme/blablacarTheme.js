import { createTheme } from "@mui/material/styles";

const blablacarTheme = createTheme({
  palette: {
    primary: {
      main: "#00AFF5", // BlaBlaCar blue
    },
    background: {
      default: "#F5F7FA", // soft app background
    },
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    h4: {
      fontWeight: 800,
    },
    h5: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          background: "#fff",
          borderRadius: 10,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#fff",
          color: "#111827",
          boxShadow: "none",
          borderBottom: "1px solid #E5E7EB",
        },
      },
    },
  },
});

export default blablacarTheme;