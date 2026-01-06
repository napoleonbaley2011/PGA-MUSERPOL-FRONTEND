import { useState } from 'react';
import { Button, CircularProgress, IconButton, MenuItem, Select, TextField, Tooltip, Typography, Collapse, Grid, FormControl } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useReportKardexStore } from '../../../hooks';
import { SkeletonComponent } from '../../../components';
import { StyledContainer } from './StyledComponents';
import { ValuedTableGroup } from './ValuedTableGroup';
import { DownloadTwoTone, PictureAsPdf } from '@mui/icons-material';

export const ValuedPhysical = () => {
    const { getReportValued, report_ValuedPhys, PrintReportValued, DownloadReportValued, DownloadReportValuedExcel } = useReportKardexStore();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCollapse, setShowCollapse] = useState(false);

    const handleUpdateClick = () => {
        setLoading(true);
        (startDate && endDate ? getReportValued(startDate, endDate) : getReportValued())
            .finally(() => setLoading(false));
        setShowCollapse(true);
    };

    const handlePrintClick = () => {
        setLoading(true);
        PrintReportValued(startDate, endDate).finally(() => setLoading(false));
    };

    const handleDownLoadClick = () => {
        setLoading(true);
        DownloadReportValued(startDate, endDate).finally(() => setLoading(false));
    };

    const handleDownLoadClickExcel = () => {
        setLoading(true);
        DownloadReportValuedExcel(startDate, endDate).finally(() => setLoading(false));
    };

    const parseLocalDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const getFormattedEndDate = () => {
        const today = new Date();
        const date = endDate ? parseLocalDate(endDate) : today;

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).toUpperCase();
    };


    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Inventario Fisico Valorado
            </Typography>

            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    <Typography variant="subtitle2" gutterBottom>
                        Fecha Inicio
                    </Typography>
                    <TextField
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        sx={{ minWidth: 200 }}
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
                        sx={{ minWidth: 200 }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item>
                    <Typography variant="subtitle2" gutterBottom>
                        Acciones
                    </Typography>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item>
                            <Tooltip title="Actualizar">
                                <Button variant="contained" color="primary" onClick={handleUpdateClick} disabled={loading}>
                                    Actualizar
                                </Button>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Imprimir">
                                <IconButton color="primary" onClick={handlePrintClick} disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : <PrintIcon />}
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Descargar">
                                <IconButton color="primary" onClick={handleDownLoadClick} disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : <PictureAsPdf />}
                                </IconButton>
                            </Tooltip>
                        </Grid>

                        <Grid item>
                            <Tooltip title="Descargar Excel">
                                <IconButton color="primary" onClick={handleDownLoadClickExcel} disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : <DownloadTwoTone />}
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Collapse in={showCollapse}>
                <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center" >
                        <Grid item>
                            <Typography variant="subtitle2" gutterBottom>
                                Seleccione el Grupo
                            </Typography>
                            <FormControl sx={{ minWidth: 500 }}>
                                <Select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                >
                                    <MenuItem value="">Todos los Grupos</MenuItem>
                                    {report_ValuedPhys?.data?.map((item: any, index: number) => (
                                        <MenuItem key={index} value={item.codigo_grupo}>
                                            {item.grupo}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
                <StyledContainer>
                    <Typography variant="h6" align="center" gutterBottom>
                        INVENTARIO FISICO VALORADO
                    </Typography>
                    <Typography align="center" gutterBottom>
                        LA PAZ DEL {startDate ? parseLocalDate(startDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        }).toUpperCase() : '1 DE ENERO'} AL {getFormattedEndDate()}
                    </Typography>
                    <Typography align="center" gutterBottom>
                        (EXPRESADO EN BOLIVIANOS)
                    </Typography>
                    {loading ? (
                        <CircularProgress sx={{ display: 'block', margin: 'auto', padding: '20px' }} />
                    ) : !report_ValuedPhys || !report_ValuedPhys.data ? (
                        <Typography variant="body2" align="center">
                            <SkeletonComponent quantity={5} />
                        </Typography>
                    ) : (
                        report_ValuedPhys.data
                            .filter((item: any) => (selectedGroup === '' || item.codigo_grupo === selectedGroup))
                            .map((item: any, index: number) => {
                                return (
                                    <ValuedTableGroup
                                        key={index}
                                        item={item}
                                    />
                                );
                            })
                    )}

                </StyledContainer>
            </Collapse>
        </>
    );
};
