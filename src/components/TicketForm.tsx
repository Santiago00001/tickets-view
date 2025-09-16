"use client";
import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Divider,
  CircularProgress,
  Chip,
  Stack,
  Grid,
  Card,
  CardContent,
  Fade,
  Zoom,
  Slide,
  IconButton,
  InputAdornment,
  alpha,
  useTheme
} from "@mui/material";
import axios from "axios";
import { Ticket } from "./TicketList";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";

const statusLabels: Record<string, string> = {
  open: "Abierto",
  in_progress: "En proceso",
  closed: "Cerrado",
};

const statusColors: Record<string, "default" | "warning" | "success" | "info" | "error"> = {
  open: "warning",
  in_progress: "info",
  closed: "success",
};

export default function TicketForm() {
  const [formData, setFormData] = useState({ name: "", email: "", description: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [copied, setCopied] = useState(false);
  const theme = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchTicket = async (id: number) => {
    setLoadingTicket(true);
    try {
      const { data } = await axios.get(`/api/tickets/${id}`);

      if (data) {
        setCreatedTicket(data);
        setStatus(null);
      } else {
        setCreatedTicket(null);
        setStatus("❌ No se pudo encontrar el ticket");
      }
    } catch (err: unknown) {
      setCreatedTicket(null);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setStatus("❌ No se pudo encontrar el ticket");
        } else {
          setStatus("❌ Error al buscar el ticket");
        }
      } else {
        console.error(err);
        setStatus("❌ Error inesperado al buscar el ticket");
      }
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("⏳ Enviando ticket...");
    setCreatedTicket(null);

    try {
      const res = await fetch(
        "https://santiagoarango.app.n8n.cloud/webhook-test/b896fe8e-433b-48be-b8d6-48d9d47bd243",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Error al enviar el ticket");

      const { ticket_id } = await res.json();
      setStatus("✅ Ticket enviado correctamente");

      await fetchTicket(ticket_id);

      setFormData({ name: "", email: "", description: "" });
    } catch (err) {
      console.error(err);
      setStatus("❌ Hubo un error al enviar el ticket");
    }
  };

  const handleSearch = async () => {
    if (!searchId) return;
    setStatus(null);
    await fetchTicket(Number(searchId));
  };

  const getStatusIcon = (status: string | null) => {
    if (!status) return null;
    if (status.includes("✅")) return <CheckCircleIcon />;
    if (status.includes("❌")) return <ErrorIcon />;
    if (status.includes("⏳")) return <CircularProgress size={16} />;
    return <InfoIcon />;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Paper
            elevation={12}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              bgcolor: "background.paper",
              boxShadow: "0 16px 32px rgba(0,0,0,0.2)",
              background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
            }}
          >
            {/* Header */}
            <Box textAlign="center" sx={{ mb: 4 }}>
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                🎫 Crear Ticket de Soporte
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Completa el formulario para crear un nuevo ticket de soporte
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {/* Form Section */}
              <Grid size={12}>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  <TextField
                    label="Nombre completo"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />

                  <TextField
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />

                  <TextField
                    label="Descripción del problema"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    multiline
                    rows={5}
                    fullWidth
                    variant="outlined"
                    size="medium"
                    placeholder="Describe detalladamente el problema que estás experimentando..."
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #1565c0, #1976d2)",
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[6]
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    Enviar Ticket
                  </Button>
                </Box>

                {/* Status Alert */}
                {status && (
                  <Fade in={true}>
                    <Alert
                      severity={
                        status.startsWith("✅") ? "success" :
                          status.startsWith("❌") ? "error" :
                            status.startsWith("⏳") ? "info" : "info"
                      }
                      sx={{ mt: 2, borderRadius: 2 }}
                      icon={getStatusIcon(status)}
                    >
                      {status}
                    </Alert>
                  </Fade>
                )}
              </Grid>

              {/* Search Section */}
              <Grid size={12}>
                <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.light, 0.1), borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
                    🔍 Consultar Ticket Existente
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Ingresa el ID de tu ticket para ver su estado y respuestas
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="medium"
                      label="ID del ticket"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleSearch}
                      disabled={!searchId || loadingTicket}
                      sx={{
                        borderRadius: 2,
                        minWidth: 100
                      }}
                    >
                      {loadingTicket ? <CircularProgress size={20} /> : "Buscar"}
                    </Button>
                  </Stack>

                  {loadingTicket && (
                    <Box mt={2} textAlign="center">
                      <CircularProgress size={28} />
                      <Typography variant="body2" mt={1} color="text.secondary">
                        Buscando tu ticket...
                      </Typography>
                    </Box>
                  )}

                  {/* Ticket Details */}
                  {createdTicket && (
                    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                      <Card sx={{ mt: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                        <CardContent>
                          <Stack spacing={2}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              {/* Título a la izquierda */}
                              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                📋 Ticket #{createdTicket.id}
                              </Typography>

                              {/* Contenedor para los iconos a la derecha */}
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={() => copyToClipboard(createdTicket.id.toString())}
                                  color={copied ? "success" : "default"}
                                >
                                  {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                </IconButton>
                                <IconButton onClick={() => setCreatedTicket(null)} size="small">
                                  <CloseIcon />
                                </IconButton>
                              </Box>
                            </Box>

                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Problema:</strong>
                              </Typography>
                              <Typography variant="body1">{createdTicket.description}</Typography>
                            </Box>

                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Categoría:</strong>
                              </Typography>
                              <Chip
                                label={createdTicket.category || "Pendiente de clasificación"}
                                color="primary"
                                size="small"
                                variant="outlined"
                              />
                            </Box>

                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Estado:</strong>
                              </Typography>
                              <Chip
                                label={statusLabels[createdTicket.status || ""] || createdTicket.status}
                                color={statusColors[createdTicket.status || ""] || "default"}
                                size="small"
                              />
                            </Box>

                            {createdTicket.suggested_reply && (
                              <Alert severity="info" sx={{ borderRadius: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  💬 Respuesta del equipo:
                                </Typography>
                                {createdTicket.suggested_reply}
                              </Alert>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Slide>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Footer */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              💡 ¿Necesitas ayuda? Nuestro equipo te responderá en el menor tiempo posible
            </Typography>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
}