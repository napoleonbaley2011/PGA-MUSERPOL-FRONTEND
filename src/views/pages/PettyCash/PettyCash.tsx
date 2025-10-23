import {
    Grid, Typography, Table, TableBody, TableCell, TableRow, TableContainer, Paper,
    TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Stack,
    Tooltip,
    Menu,
    MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import AnalyticCardPetty from "../../../components/AnalyticCardPetty";
import { usePettyCash } from "../../../hooks/usePettyCash";
import { useEffect, useState } from "react";
import { TablePettyCash } from "./TablePettyCash";

export const PettyCash = () => {
    const { petty_cashes, getDataPettyCash, CreateDischarge } = usePettyCash();
    const [openDialog, setOpenDialog] = useState(false);
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [dialogValues, setDialogValues] = useState({
        balance: "",
        responsible: "",
        username: ""
    });

    useEffect(() => {
        getDataPettyCash();
    }, []);

    if (!petty_cashes || !petty_cashes.dataPettyCash) {
        return <Typography variant="h6">Cargando datos de caja chica...</Typography>;
    }

    const { date_recived, name_responsibility, concept, amount, balance, total } = petty_cashes.dataPettyCash;

    const handleCloseDialog = () => setOpenDialog(false);

    const handleDialogChange = (field: keyof typeof dialogValues, value: string) => {
        setDialogValues((prevValues) => ({ ...prevValues, [field]: value }));
    };

    const handleConfirmDialog = () => {
        setOpenDialog(false);
        setOpenConfirmationDialog(true);
    };

    const handleCloseConfirmationDialog = () => setOpenConfirmationDialog(false);

    const handleFinalConfirm = async () => {
        await CreateDischarge(dialogValues.balance, dialogValues.responsible, dialogValues.username).then((res) => {
            if (res) {
                setOpenConfirmationDialog(false);
            }
        });
    };

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleSelectReport = (reportType: string) => {
        console.log("Seleccionaste:", reportType);
        
        setAnchorEl(null);
    };

    return (
        <>
            <Grid container rowSpacing={4.5} columnSpacing={2.75}>
                <Grid item xs={12} sx={{ mb: -2.25 }}>
                    <Typography variant="h5">{concept}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Paper>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, pb: 0 }}>
                            <Typography variant="h6">Datos de Caja Chica</Typography>
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Editar cabecera">
                                    <Button variant="contained" startIcon={<EditIcon />}>
                                        Editar
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Adicionar dinero">
                                    <Button variant="contained" startIcon={<AddIcon />}>
                                        Adicionar dinero
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Seleccionar el reporte">
                                    <Button
                                        variant="contained"
                                        onClick={handleOpenMenu}
                                    >
                                        Reportes
                                    </Button>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleCloseMenu}
                                >
                                    <MenuItem onClick={() => handleSelectReport("libro-diario")}>
                                        Libro Diario
                                    </MenuItem>
                                    <MenuItem onClick={() => handleSelectReport("planilla-rendicion")}>
                                        Planilla de Rendición de Cuentas
                                    </MenuItem>
                                    <MenuItem onClick={() => handleSelectReport("orden-pago")}>
                                        Orden de Pago
                                    </MenuItem>
                                </Menu>
                            </Stack>
                        </Stack>

                        <TableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell><Typography variant="subtitle1">Fecha de Recepción</Typography></TableCell>
                                        <TableCell><Typography variant="body1">{date_recived}</Typography></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><Typography variant="subtitle1">Responsable</Typography></TableCell>
                                        <TableCell><Typography variant="body1">{name_responsibility}</Typography></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4} lg={4}>
                    <AnalyticCardPetty title="Saldo Inicial de Caja Chica" count={amount} extra={'2'} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                    <AnalyticCardPetty title="Descargo de Caja Chica" count={total} extra={'2'} />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                    <AnalyticCardPetty title="Saldo Final de Caja Chica" count={balance} extra={'2'} />
                </Grid>
                <Grid item xs={12} sx={{ mb: -2.25 }}>
                    <Typography variant="h5">SOLICITUDES</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TablePettyCash />
                </Grid>
            </Grid>
            
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Descargo General</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Saldo Inicial"
                        type="text"
                        fullWidth
                        margin="dense"
                        value={dialogValues.balance}
                        onChange={(e) => handleDialogChange("balance", e.target.value)}
                        disabled
                    />
                    <TextField
                        label="Responsable"
                        type="text"
                        fullWidth
                        margin="dense"
                        value={dialogValues.responsible}
                        onChange={(e) => handleDialogChange("responsible", e.target.value)}
                    />
                    <TextField
                        label="usuario"
                        type="text"
                        fullWidth
                        margin="dense"
                        value={dialogValues.username}
                        onChange={(e) => handleDialogChange("username", e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDialog} color="primary">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openConfirmationDialog} onClose={handleCloseConfirmationDialog}>
                <DialogTitle>Confirmación Final</DialogTitle>
                <DialogContent>
                    <Typography>¿Está seguro de realizar esta acción con los siguientes datos?</Typography>
                    <Typography><strong>Saldo Inicial:</strong> {dialogValues.balance}</Typography>
                    <Typography><strong>Responsable:</strong> {dialogValues.responsible}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmationDialog} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleFinalConfirm} color="primary">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
