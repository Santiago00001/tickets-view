"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Container,
    Box,
    Typography,
    Paper,
    Stack,
    CircularProgress,
    Alert,
    Button,
    Chip,
    MenuItem,
    Select,
    Card,
    CardContent,
    Avatar,
    Grid,
    FormControl,
    InputLabel,
    IconButton,
    Collapse,
    alpha,
    useTheme,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
} from "@mui/material";
import axios from "axios";
import PersonIcon from "@mui/icons-material/Person";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

interface User {
    name: string;
    email: string;
}

export interface Ticket {
    id: number;
    user_id?: string;
    name?: string;
    email?: string;
    description: string;
    category?: string;
    suggested_reply?: string;
    suggestion?: string;
    severity?: number;
    status?: string;
    users: User | User[] | null;
    created_at?: string;
    updated_at?: string;
}

export default function TicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [severityFilter, setSeverityFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const theme = useTheme();

    const fetchTickets = useCallback(async () => {
        try {
            if (!loading) setRefreshing(true);
            const { data } = await axios.get("/api/tickets");
            const sorted = [...data].sort(
                (a, b) =>
                    new Date(b.created_at || "").getTime() -
                    new Date(a.created_at || "").getTime()
            );
            setTickets(sorted);
            setFilteredTickets(sorted);
        } catch (err) {
            console.error(err);
            setError("❌ No se pudieron cargar los tickets");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [loading]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Aplicar filtros
    useEffect(() => {
        let result = tickets;

        if (categoryFilter !== "all") {
            result = result.filter(ticket => ticket.category === categoryFilter);
        }

        if (severityFilter !== "all") {
            result = result.filter(ticket => ticket.severity?.toString() === severityFilter);
        }

        if (statusFilter !== "all") {
            result = result.filter(ticket => ticket.status === statusFilter);
        }

        setFilteredTickets(result);
    }, [tickets, categoryFilter, severityFilter, statusFilter]);

    const handleStatusChange = async (ticketId: number, newStatus: string) => {
        try {
            await axios.patch(`/api/tickets/${ticketId}`, { status: newStatus });
            setTickets((prev) =>
                prev.map((t) =>
                    t.id === ticketId ? { ...t, status: newStatus } : t
                )
            );
            // Actualizar también el ticket seleccionado si es el mismo
            if (selectedTicket && selectedTicket.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
        } catch (err) {
            console.error(err);
            setError("❌ No se pudo actualizar el estado.");
        }
    };

    const handleTicketSelect = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedTicket(null);
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case "open":
                return "Abierto";
            case "in_progress":
                return "En proceso";
            case "closed":
                return "Cerrado";
            default:
                return "Desconocido";
        }
    };

    const getSeverityColor = (severity?: number) => {
        if (!severity) return "default";
        if (severity >= 4) return "error";
        if (severity === 3) return "warning";
        return "success";
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "open":
                return "error";
            case "in_progress":
                return "warning";
            case "closed":
                return "success";
            default:
                return "default";
        }
    };

    const getSeverityText = (severity?: number) => {
        if (!severity) return "?";
        switch (severity) {
            case 1: return "Baja";
            case 2: return "Media";
            case 3: return "Alta";
            case 4: return "Crítica";
            case 5: return "Urgente";
            default: return severity.toString();
        }
    };

    // Obtener categorías únicas
    const categories = ["all", ...new Set(tickets.map(t => t.category).filter(Boolean))] as string[];

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                }}
            >
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                py: 4,
            }}
        >
            <Container maxWidth="xl" sx={{ height: "100%" }}>
                <Paper
                    elevation={6}
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        height: "85vh",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 3 }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main" }}>
                            📝 Tickets Recibidos
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                startIcon={<FilterListIcon />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                Filtros
                            </Button>
                            <Button
                                variant="contained"
                                onClick={fetchTickets}
                                disabled={refreshing}
                            >
                                {refreshing ? "🔄" : "🔄 Actualizar"}
                            </Button>
                        </Stack>
                    </Stack>

                    {/* Filtros */}
                    <Collapse in={showFilters}>
                        <Stack spacing={2} sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid size={12}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Categoría</InputLabel>
                                        <Select
                                            value={categoryFilter}
                                            label="Categoría"
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">Todas las categorías</MenuItem>
                                            {categories.filter(cat => cat !== "all").map((category) => (
                                                <MenuItem key={category} value={category}>
                                                    {category}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={12}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Severidad</InputLabel>
                                        <Select
                                            value={severityFilter}
                                            label="Severidad"
                                            onChange={(e) => setSeverityFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">Todas las severidades</MenuItem>
                                            <MenuItem value="1">Baja (1)</MenuItem>
                                            <MenuItem value="2">Media (2)</MenuItem>
                                            <MenuItem value="3">Alta (3)</MenuItem>
                                            <MenuItem value="4">Crítica (4)</MenuItem>
                                            <MenuItem value="5">Urgente (5)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={12}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            label="Estado"
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">Todos los estados</MenuItem>
                                            <MenuItem value="open">Abierto</MenuItem>
                                            <MenuItem value="in_progress">En proceso</MenuItem>
                                            <MenuItem value="closed">Cerrado</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Stack>
                    </Collapse>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Contenido Principal */}
                    <Box sx={{ flex: 1, display: "flex", gap: 3, overflow: "hidden" }}>
                        {/* Lista de Tickets (Lado Izquierdo) */}
                        <Paper
                            sx={{
                                flex: 1,
                                p: 2,
                                overflow: "auto",
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 2,
                                maxHeight: "100%"
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                                Lista de Tickets ({filteredTickets.length})
                            </Typography>

                            {filteredTickets.length === 0 && !error ? (
                                <Alert severity="info">No hay tickets que coincidan con los filtros.</Alert>
                            ) : (
                                <List sx={{ width: "100%" }}>
                                    {filteredTickets.map((ticket) => (
                                        <ListItem
                                            key={ticket.id}
                                            onClick={() => handleTicketSelect(ticket)}
                                            sx={{
                                                mb: 1,
                                                borderRadius: 2,
                                                border: `1px solid ${theme.palette.divider}`,
                                                "&:hover": {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    borderColor: theme.palette.primary.main,
                                                },
                                                "&.Mui-selected": {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    borderColor: theme.palette.primary.main,
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: "primary.main" }}>
                                                    <PersonIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography variant="subtitle2">
                                                            Ticket #{ticket.id}
                                                        </Typography>
                                                        <Chip
                                                            label={getStatusLabel(ticket.status)}
                                                            color={getStatusColor(ticket.status)}
                                                            size="small"
                                                        />
                                                    </Stack>
                                                }
                                                secondary={
                                                    <Stack spacing={0.5}>
                                                        <Typography variant="body2" color="text.primary">
                                                            {ticket.name || "Cliente anónimo"}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(ticket.created_at || "").toLocaleString()}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1}>
                                                            <Chip
                                                                label={ticket.category || "Sin categoría"}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                            <Chip
                                                                label={`${getSeverityText(ticket.severity)} (${ticket.severity})`}
                                                                color={getSeverityColor(ticket.severity)}
                                                                size="small"
                                                            />
                                                        </Stack>
                                                    </Stack>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>

                        {/* Panel de Detalles (Lado Derecho) */}
                        <Paper
                            sx={{
                                flex: 2,
                                p: 3,
                                overflow: "auto",
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 2,
                                maxHeight: "100%",
                                display: "flex",
                                flexDirection: "column"
                            }}
                        >
                            {selectedTicket ? (
                                <>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                            📋 Ticket #{selectedTicket.id}
                                        </Typography>
                                        <IconButton onClick={() => setSelectedTicket(null)} size="small">
                                            <CloseIcon />
                                        </IconButton>
                                    </Stack>

                                    <Stack spacing={3}>
                                        {/* Información del Cliente */}
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    👤 Información del Cliente
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid size={12}>
                                                        <Typography variant="body2">
                                                            <strong>Nombre:</strong> {selectedTicket.name || "N/D"}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            <strong>Email:</strong> {selectedTicket.email || "N/D"}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={12}>
                                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                                            <Chip
                                                                label={selectedTicket.category || "Sin categoría"}
                                                                color="primary"
                                                                size="small"
                                                            />
                                                            <Chip
                                                                label={`Severidad: ${getSeverityText(selectedTicket.severity)}`}
                                                                color={getSeverityColor(selectedTicket.severity)}
                                                                size="small"
                                                            />
                                                            <Chip
                                                                label={getStatusLabel(selectedTicket.status)}
                                                                color={getStatusColor(selectedTicket.status)}
                                                                size="small"
                                                            />
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>

                                        {/* Descripción del Problema */}
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    📝 Descripción del Problema
                                                </Typography>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                    {selectedTicket.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>

                                        {/* Respuestas y Recomendaciones */}
                                        {selectedTicket.suggested_reply && (
                                            <Alert severity="info">
                                                <Typography variant="subtitle2" gutterBottom>
                                                    💬 Respuesta Sugerida:
                                                </Typography>
                                                {selectedTicket.suggested_reply}
                                            </Alert>
                                        )}

                                        {selectedTicket.suggestion && (
                                            <Alert severity="info">
                                                <Typography variant="subtitle2" gutterBottom>
                                                    🛠️ Recomendación de Solución:
                                                </Typography>
                                                {selectedTicket.suggestion}
                                            </Alert>
                                        )}

                                        {/* Actualizar Estado */}
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    ⚙️ Actualizar Estado
                                                </Typography>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Typography variant="body2">Estado actual:</Typography>
                                                    <Select
                                                        size="small"
                                                        value={selectedTicket.status || "open"}
                                                        onChange={(e) =>
                                                            handleStatusChange(selectedTicket.id, e.target.value)
                                                        }
                                                        sx={{ minWidth: 120 }}
                                                    >
                                                        <MenuItem value="open">Abierto</MenuItem>
                                                        <MenuItem value="in_progress">En proceso</MenuItem>
                                                        <MenuItem value="closed">Cerrado</MenuItem>
                                                    </Select>
                                                </Stack>
                                            </CardContent>
                                        </Card>

                                        {/* Información Adicional */}
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    📊 Información Adicional
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    <Grid size={12}>
                                                        <Typography variant="body2">
                                                            <strong>Fecha de creación:</strong>{" "}
                                                            {new Date(selectedTicket.created_at || "").toLocaleString()}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={12}>
                                                        <Typography variant="body2">
                                                            <strong>Última actualización:</strong>{" "}
                                                            {new Date(selectedTicket.updated_at || selectedTicket.created_at || "").toLocaleString()}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Stack>
                                </>
                            ) : (
                                <Box
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        color: "text.secondary"
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        👈 Selecciona un ticket
                                    </Typography>
                                    <Typography variant="body2" textAlign="center">
                                        Elige un ticket de la lista para ver todos los detalles y gestionarlo
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>

                    {/* Contador de tickets */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="body2" color="text.secondary" align="center">
                            Mostrando {filteredTickets.length} de {tickets.length} tickets
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}