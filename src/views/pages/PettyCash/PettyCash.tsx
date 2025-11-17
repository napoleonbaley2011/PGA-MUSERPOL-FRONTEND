import { Grid, Typography, Table, TableBody, TableCell, TableRow, TableContainer, Paper, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Tooltip, Menu, MenuItem, Switch, FormControlLabel } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AnalyticCardPetty from "../../../components/AnalyticCardPetty";
import { usePettyCash } from "../../../hooks/usePettyCash";
import { useEffect, useState } from "react";
import { TablePettyCash } from "./TablePettyCash";
import "chart.js/auto";
import { Pie } from "react-chartjs-2";
import { Box } from "@mui/system";

export const PettyCash = () => {
    const { petty_cashes, getDataPettyCash, CreateDischarge, DownloadDiaryBook, downloadAccountabilitySheet, PaymentOrder } = usePettyCash();
    const [openDialog, setOpenDialog] = useState(false);
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const [dialogValues, setDialogValues] = useState({
        amount_replacement: "",
        responsible: "",
        username: ""
    });

    const [openDateRange, setOpenDateRange] = useState(false);
    const [endDate, setEndDate] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [routeSheet, setRouteSheet] = useState<string>("");
    const [flowStep, setFlowStep] = useState<1 | 2>(1);
    const [useDesignationBase, setUseDesignationBase] = useState(false);


    useEffect(() => {
        getDataPettyCash();
    }, []);

    if (!petty_cashes || !petty_cashes.dataPettyCash) {
        return <Typography variant="h6">Cargando datos de caja chica...</Typography>;
    }

    const { name_responsibility, amount, balance, discharges, percentages, has_no_reception_date, designation } = petty_cashes.dataPettyCash;


    const handleCloseDialog = () => setOpenDialog(false);
    const handleCloseDialogRange = () => setOpenDateRange(false);
    const handleDialogChange = (
        field: keyof typeof dialogValues,
        value: string
    ) => {
        setDialogValues((prevValues) => ({ ...prevValues, [field]: value }));
    };
    const handleConfirmDialog = () => {
        setOpenDialog(false);
        setOpenConfirmationDialog(true);
    };
    const handleCloseConfirmationDialog = () => setOpenConfirmationDialog(false);
    const handleFinalConfirm = async () => {
        const payload = {
            name_responsibility: dialogValues.responsible || name_responsibility,
            discharges: Number(dialogValues.amount_replacement || 0)
        };
        await CreateDischarge(payload);
        await getDataPettyCash();
        setOpenDialog(false);
        setOpenConfirmationDialog(false);
    };
    const handleDownloadReport = async () => {
        if (!selectedReport) return;

        if (selectedReport === "libro-diario") {
            await DownloadDiaryBook(startDate, endDate);
            setOpenDateRange(false);
            setAnchorEl(null);
            return;
        }
        if (selectedReport === "planilla-orden") {
            if (!endDate) {
                console.warn("Debe seleccionar una fecha de fin.");
                return;
            }

            if (flowStep === 1) {
                await downloadAccountabilitySheet(startDate, endDate);
                setFlowStep(2);
                return;
            }

            if (flowStep === 2) {
                if (!routeSheet) {
                    console.warn("Debe ingresar la Hoja de Ruta.");
                    return;
                }
                await PaymentOrder(routeSheet);
                setOpenDateRange(false);
                setAnchorEl(null);
                setSelectedReport(null);
                setFlowStep(1);
                setRouteSheet("");
                await getDataPettyCash();
                return;
            }
        }
    };
    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };
    const handleDialogRep = () => {
        setDialogValues({
            amount_replacement: String(discharges ?? ""),
            responsible: String(name_responsibility ?? ""),
            username: ""
        });
        setOpenDialog(true);
    };
    const handleSelectReport = (reportType: string) => {

        if (
            reportType === "planilla-orden" &&
            has_no_reception_date
        ) {

            console.warn(
                "No se puede generar Planilla ni Orden de pago sin fecha de recepción del fondo."
            );
            return;
        }

        setSelectedReport(reportType);
        setStartDate("");
        setEndDate("");
        setRouteSheet("");
        setFlowStep(1);
        setOpenDateRange(true);
        setAnchorEl(null);
    };

    const designationNum = Number(designation ?? 0);
    const pctByAmount = {
        gastos: percentages.discharges,
        saldo: percentages.balance
    };
    const pctByDesignation = designationNum > 0
        ? {

            gastos:
                percentages.discharges_vs_designation,
            saldo:
                percentages.balance_vs_designation,
        }
        : {
            gastos: 0,
            saldo: 0
        };

    const currentPct = useDesignationBase ? pctByDesignation : pctByAmount;

    const data = {
        labels: ["GASTOS", "SALDO"],
        datasets: [
            {
                label: useDesignationBase
                    ? "Porcentaje respecto a Designación"
                    : "Porcentaje respecto al Monto Actual",
                data: [currentPct.gastos, currentPct.saldo],
                backgroundColor: [
                    "rgba(35, 211, 35, 0.8)",
                    "rgba(33, 114, 168, 0.94)"
                ],
                borderColor: ["rgba(65, 99, 75, 0.42)", "rgba(65, 99, 75, 0.42)"],
                borderWidth: 1
            }
        ]
    };

    const options = {
        plugins: { legend: { position: "bottom" as const } },
        maintainAspectRatio: false
    };



    const isLibro = selectedReport === "libro-diario";
    const isFlowPlanillaOrden = selectedReport === "planilla-orden";


    return (
        <>
            <Grid container rowSpacing={4.5} columnSpacing={2.75}>
                <Grid item xs={12} sx={{ mb: -2.25 }}>
                    <Typography variant="h5">ASIGNACIÓN Y REPOSICION DE FONDOS</Typography>
                </Grid>

                <Grid item xs={12}>
                    <Paper>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ p: 2, pb: 0 }}
                        >
                            <Typography variant="h6">Datos de Caja Chica</Typography>
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Realizar Reposición de fondos">
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        disabled={!petty_cashes.dataPettyCash.has_no_reception_date}
                                        onClick={handleDialogRep}
                                    >
                                        REPOSICIÓN DE FONDOS
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Seleccionar el reporte">
                                    <Button variant="contained" onClick={handleOpenMenu}>
                                        Reportes
                                    </Button>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleCloseMenu}
                                >
                                    <MenuItem onClick={() => handleSelectReport("libro-diario")}>
                                        Libro de registros finalizados
                                    </MenuItem>

                                    <MenuItem
                                        disabled={has_no_reception_date}
                                        onClick={() => handleSelectReport("planilla-orden")}
                                    >
                                        Planilla de Rendición de Cuentas + Orden de Pago
                                    </MenuItem>
                                </Menu>

                            </Stack>
                        </Stack>

                        <TableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <Typography variant="subtitle1">
                                                Responsable
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1">
                                                {name_responsibility}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Paper
                                sx={{
                                    p: 2,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: 300
                                }}
                            >
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{ width: "100%", mb: 1 }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={useDesignationBase}
                                                onChange={(e) => setUseDesignationBase(e.target.checked)}
                                                size="small"
                                            />
                                        }
                                        label={
                                            useDesignationBase
                                                ? "Base: Designación"
                                                : "Base: Monto actual"
                                        }
                                    />
                                </Stack>

                                <Box
                                    sx={{
                                        width: "100%",
                                        maxWidth: 350,
                                        aspectRatio: "1"
                                    }}
                                >
                                    <Pie
                                        data={data}
                                        options={{
                                            ...options,
                                            maintainAspectRatio: false,
                                            responsive: true
                                        }}
                                    />
                                </Box>

                                {percentages.discharges >= 70 && (
                                    <Typography
                                        variant="body2"
                                        color="error"
                                        sx={{
                                            mt: 2,
                                            textAlign: "center",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        ⚠️ Atención: Caja chica supera el 70% de gasto.
                                        Solicite una reposición de fondos para evitar
                                        quedarse sin recursos.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>


                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <AnalyticCardPetty
                                    title="Saldo Inicial + Repocisiones de Caja Chica"
                                    count={amount}
                                    extra={"2"}
                                />
                                <AnalyticCardPetty
                                    title="Gastos con Caja Chica"
                                    count={discharges}
                                    extra={"2"}
                                />
                                <AnalyticCardPetty
                                    title="Saldo Final de Caja Chica"
                                    count={balance}
                                    extra={"2"}
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} sx={{ mb: -2.25 }}>
                    <Typography variant="h5">SOLICITUDES</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TablePettyCash />
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Reposición de Fondos</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Saldo Inicial"
                        type="text"
                        fullWidth
                        margin="dense"
                        value={petty_cashes.dataPettyCash.amount_replacement}
                        disabled
                        onChange={(e) =>
                            handleDialogChange("amount_replacement", e.target.value)
                        }
                    />
                    <TextField
                        label="Responsable"
                        type="text"
                        fullWidth
                        margin="dense"
                        value={dialogValues.responsible}
                        onChange={(e) =>
                            handleDialogChange("responsible", e.target.value)
                        }
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

            <Dialog
                open={openConfirmationDialog}
                onClose={handleCloseConfirmationDialog}
            >
                <DialogTitle>Confirmación Final</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro de realizar esta acción con los siguientes
                        datos?
                    </Typography>
                    <Typography>
                        <strong>Saldo Inicial:</strong> {petty_cashes.dataPettyCash.amount_replacement}
                    </Typography>
                    <Typography>
                        <strong>Responsable:</strong> {dialogValues.responsible}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseConfirmationDialog}
                        color="secondary"
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleFinalConfirm} color="primary">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDateRange} onClose={handleCloseDialogRange}>
                <DialogTitle>
                    {isLibro && "Seleccione las fechas para generar el Reporte"}
                    {isFlowPlanillaOrden &&
                        (flowStep === 1
                            ? "Generar Planilla de Rendición de Cuentas"
                            : "Generar Orden de Pago")}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {isLibro &&
                            "Indique la fecha de inicio y la fecha de fin para listar los registros finalizados en ese rango."}

                        {isFlowPlanillaOrden && flowStep === 1 &&
                            "Indique la fecha de fin. Se generará la planilla de rendición de cuentas hasta ese día. Luego podrá generar la Orden de Pago."}

                        {isFlowPlanillaOrden && flowStep === 2 &&
                            "Revise la fecha de fin y complete la Hoja de Ruta para generar la Orden de Pago asociada a la rendición generada."}
                    </Typography>


                    <Grid container spacing={2} alignItems="center">
                        {isLibro && (
                            <>
                                <Grid item>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Fecha Inicio
                                    </Typography>
                                    <TextField
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                    />
                                </Grid>

                                <Grid item>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Fecha Fin
                                    </Typography>
                                    <TextField
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                    />
                                </Grid>
                            </>
                        )}

                        {isFlowPlanillaOrden && (
                            <>
                                <Grid item>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Fecha Fin
                                    </Typography>
                                    <TextField
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                        disabled={flowStep === 2}
                                    />
                                </Grid>

                                {flowStep === 2 && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Hoja de Ruta
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Ej: DAA/UA/CH-0XX/20XX"
                                            value={routeSheet}
                                            onChange={(e) => setRouteSheet(e.target.value)}
                                        />
                                    </Grid>
                                )}
                            </>
                        )}
                    </Grid>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogRange} color="error">
                        Cancelar
                    </Button>
                    <Button onClick={handleDownloadReport} color="primary">
                        {isLibro && "Descargar"}
                        {isFlowPlanillaOrden &&
                            (flowStep === 1
                                ? "Generar Planilla"
                                : "Generar Orden de Pago")}
                    </Button>
                </DialogActions>

            </Dialog>
        </>
    );
};
