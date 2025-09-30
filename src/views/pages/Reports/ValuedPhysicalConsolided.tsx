import { Button, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, CircularProgress } from "@mui/material";
import { styled } from '@mui/material/styles';
import { useReportKardexStore } from "../../../hooks";
import { useEffect, useState } from "react";
import { SkeletonComponent } from "../../../components";
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { PictureAsPdf } from "@mui/icons-material";

interface Report {
    grupo: string;
    codigo_grupo: string;
    resumen: {
        saldo_anterior_cantidad: number;
        saldo_anterior_total: number;
        entradas_cantidad: number;
        entradas_total: number;
        salidas_cantidad: number;
        salidas_total: number;
        saldo_final_cantidad: number;
        saldo_final_total: number;
    };
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    textAlign: 'center',
    border: '1px solid #ddd',
    padding: theme.spacing(0.2),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    height: '24px',
}));

const StyledContainer = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(4, 0),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
}));


export const ValuedPhysicalConsolided = () => {
    const { report_ValuedPhy_Consolids, listManagement, getReportValuedConsolid, PrintReportConsolidatedInventory, DownloadReportConsolidatedInventory, ClosureMagementStore, DownloadReportConsolidatedInventoryExcel } = useReportKardexStore();

    const [openConfirm, setOpenConfirm] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const getPermissionsFromStorage = () => {
        let permissions: string[] = [];

        try {
            const storedPermissions = localStorage.getItem('permission');

            if (storedPermissions) {
                permissions = storedPermissions.split(',');
            }
        } catch (error) {
            console.error("Error processing permissions from localStorage:", error);
            permissions = [];
        }

        return permissions;
    };

    const permissions = getPermissionsFromStorage();

    const handleSubmit = () => {
        ClosureMagementStore();
        setOpenConfirm(false);
    };

    const handleCalculateClick = async () => {
        setLoading(true);
        try {
            await getReportValuedConsolid(startDate, endDate);
        } catch (error) {
            console.error("Error al obtener el reporte:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintClick = () => {
        PrintReportConsolidatedInventory(startDate, endDate);
    };

    const handleDownloadClick = () => {
        DownloadReportConsolidatedInventory(startDate, endDate);
    };

    const handleDownloadClickExcel = () => {
        DownloadReportConsolidatedInventoryExcel(startDate, endDate);
    };

    const handleCloseConfirmDialog = () => {
        setOpenConfirm(false);
    };

    const handleOpenConfirmDialog = () => {
        setOpenConfirm(true);
    };

    useEffect(() => {
        listManagement();
    }, []);

    const calculateTotals = () => {
        let totalSaldoAnteriorCantidad = 0;
        let totalSaldoAnteriorTotal = 0;
        let totalEntradasCantidad = 0;
        let totalEntradasTotal = 0;
        let totalSalidasCantidad = 0;
        let totalSalidasTotal = 0;
        let totalSaldoFinalCantidad = 0;
        let totalSaldoFinalTotal = 0;

        report_ValuedPhy_Consolids?.data.forEach((report: Report) => {
            totalSaldoAnteriorCantidad += report.resumen.saldo_anterior_cantidad;
            totalSaldoAnteriorTotal += report.resumen.saldo_anterior_total;
            totalEntradasCantidad += (report.resumen.entradas_cantidad - report.resumen.saldo_anterior_cantidad);
            totalEntradasTotal += (report.resumen.entradas_total - report.resumen.saldo_anterior_total);
            totalSalidasCantidad += report.resumen.salidas_cantidad;
            totalSalidasTotal += report.resumen.salidas_total;
            totalSaldoFinalCantidad += report.resumen.saldo_final_cantidad;
            totalSaldoFinalTotal += report.resumen.saldo_final_total;
        });

        return {
            totalSaldoAnteriorCantidad,
            totalSaldoAnteriorTotal,
            totalEntradasCantidad,
            totalEntradasTotal,
            totalSalidasCantidad,
            totalSalidasTotal,
            totalSaldoFinalCantidad,
            totalSaldoFinalTotal
        };
    };

    const totals = calculateTotals();

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Inventario Fisico Valorado Consolidado
            </Typography>

            <Grid container spacing={2} alignItems="center">

                <Grid container item spacing={2} alignItems="center">

                    <Grid item xs={12} sm={6} md={6} lg={4}>
                        <Grid container spacing={2} direction="row" alignItems="center">
                            <Grid item>
                                <Typography variant="subtitle2" gutterBottom>
                                    Fecha Inicio
                                </Typography>
                                <TextField
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    sx={{ minWidth: 150 }}
                                    InputLabelProps={{ shrink: true }}
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
                                    sx={{ minWidth: 150 }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} sm={3} md={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleCalculateClick}
                            sx={{ height: '100%', position: 'relative' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            color: 'white',
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            marginTop: '-12px',
                                            marginLeft: '-12px',
                                        }}
                                    />
                                    <span style={{ opacity: 0 }}>Calculando...</span>
                                </>
                            ) : (
                                'Calcular'
                            )}
                        </Button>
                    </Grid>

                    {permissions.includes('create-employee') && (
                        <Grid item xs={12} sm={3} md={3}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handleOpenConfirmDialog}
                            >
                                Cerrar Gestión
                            </Button>
                        </Grid>
                    )}

                    <Grid item>
                        <Tooltip title="Imprimir">
                            <span>
                                <IconButton onClick={handlePrintClick} color="primary">
                                    <PrintIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Tooltip title="Descargar PDF">
                            <span>
                                <IconButton onClick={handleDownloadClick} color="primary">
                                    <PictureAsPdf />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Tooltip title="Descargar Excel">
                            <span>
                                <IconButton onClick={handleDownloadClickExcel} color="info">
                                    <DownloadIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>


            <StyledContainer>
                <Typography variant="h6" align="center" gutterBottom>
                    INVENTARIO FISICO VALORADO CONSOLIDADO
                </Typography>
                <Typography align="center" gutterBottom>
                    (EXPRESADO EN BOLIVIANOS)
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell rowSpan={2}>GRUPO</StyledTableCell>
                                <StyledTableCell rowSpan={2}>DETALLE</StyledTableCell>
                                <StyledTableCell colSpan={2}>SALDO INICIAL</StyledTableCell>
                                <StyledTableCell colSpan={2}>ENTRADAS</StyledTableCell>
                                <StyledTableCell colSpan={2}>SALIDAS </StyledTableCell>
                                <StyledTableCell colSpan={2}>SALDOS</StyledTableCell>
                            </TableRow>
                            <TableRow>
                                <StyledTableCell>FISICO</StyledTableCell>
                                <StyledTableCell>VALOR bs</StyledTableCell>
                                <StyledTableCell>FISICO</StyledTableCell>
                                <StyledTableCell>VALOR bs</StyledTableCell>
                                <StyledTableCell>FISICO</StyledTableCell>
                                <StyledTableCell>VALOR bs</StyledTableCell>
                                <StyledTableCell>FISICO</StyledTableCell>
                                <StyledTableCell>VALOR bs</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                (loading || report_ValuedPhy_Consolids == null) ? (
                                    <SkeletonComponent quantity={4} />
                                ) : (
                                    report_ValuedPhy_Consolids.data.map((report: any, index: number) => (
                                        <StyledTableRow key={index}>
                                            <TableCell>{report.grupo}</TableCell>
                                            <TableCell>{report.codigo_grupo}</TableCell>
                                            <TableCell align="right">{report.resumen.saldo_anterior_cantidad}</TableCell>
                                            <TableCell align="right">{report.resumen.saldo_anterior_total.toFixed(2)}</TableCell>
                                            <TableCell align="right">{(report.resumen.entradas_cantidad - report.resumen.saldo_anterior_cantidad)}</TableCell>
                                            <TableCell align="right">{(report.resumen.entradas_total - report.resumen.saldo_anterior_total).toFixed(2)}</TableCell>
                                            <TableCell align="right">{report.resumen.salidas_cantidad}</TableCell>
                                            <TableCell align="right">{report.resumen.salidas_total.toFixed(2)}</TableCell>
                                            <TableCell align="right">{report.resumen.saldo_final_cantidad}</TableCell>
                                            <TableCell align="right">{report.resumen.saldo_final_total.toFixed(2)}</TableCell>
                                        </StyledTableRow>
                                    ))
                                )
                            }

                            <StyledTableRow>
                                <StyledTableCell colSpan={2} style={{ textAlign: 'center' }}>TOTAL</StyledTableCell>
                                <StyledTableCell align="right">{totals.totalSaldoAnteriorCantidad}</StyledTableCell>
                                <StyledTableCell align="right">{totals.totalSaldoAnteriorTotal.toFixed(2)}</StyledTableCell>
                                <StyledTableCell align="right">{totals.totalEntradasCantidad}</StyledTableCell>
                                <StyledTableCell align="right">{totals.totalEntradasTotal.toFixed(2)}</StyledTableCell>
                                <StyledTableCell align="right">{totals.totalSalidasCantidad}</StyledTableCell>
                                <StyledTableCell align="right">{totals.totalSalidasTotal.toFixed(2)}</StyledTableCell>
                                <StyledTableCell align="right">{totals.totalSaldoFinalCantidad}</StyledTableCell>
                                <StyledTableCell align="right">{totals.totalSaldoFinalTotal.toFixed(2)}</StyledTableCell>
                            </StyledTableRow>
                        </TableBody>

                    </Table>
                </TableContainer>
            </StyledContainer>

            <Dialog
                open={openConfirm}
                onClose={handleCloseConfirmDialog}
            >
                <DialogTitle>Confirmar Cierre de Gestión</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro de que desea cerrar la gestión? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} color="primary" autoFocus>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
