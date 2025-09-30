import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

interface TableProps {
    itemKardex: any;
    date_report: any;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    textAlign: 'center',
    border: '1px solid #ddd',
    padding: theme.spacing(0.2),
}));
const StyledBodyCell = styled(TableCell)({
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '100px',
    maxWidth: '100px',
    fontSize: '0.7rem',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
});

const StyledDetailCell = styled(TableCell)({
    whiteSpace: 'normal',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: 'auto',
    maxWidth: '300px',
    flexGrow: 1,
    fontSize: '0.7rem',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
});
const StyledTotalCell = styled(TableCell)({
    backgroundColor: '#d1f2eb',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    textAlign: 'center',
    border: '1px solid #ddd',
});


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

const formatNumber = (num: number | undefined) => {
    return typeof num === 'number'
        ? new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2 }).format(num)
        : '-';
};


export const TableExistence = (props: TableProps) => {
    const { itemKardex } = props;

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const lastDayLastYear = `31/12/${lastYear}`;

    const DayYear = `01/01/${currentYear}`;

    if (!itemKardex || !itemKardex.kardex_de_existencia) {
        return (
            <StyledContainer>
                <Typography variant="h6" align="center" gutterBottom>
                    Seleccione un Material
                </Typography>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <Typography variant="h6" align="center" gutterBottom>
                KARDEX DE EXISTENCIAS
            </Typography>
            <Typography align="center" gutterBottom>
                (EXPRESADO EN BOLIVIANOS)
            </Typography>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={5}>
                    <Typography sx={{ padding: '10px' }}>
                        <strong>Código: </strong> {itemKardex.code_material}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Typography sx={{ padding: '10px' }}>
                        <strong>Unidad de medida: </strong> {itemKardex.unit_material}
                    </Typography>
                </Grid>
            </Grid>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={5}>
                    <Typography sx={{ padding: '10px' }}>
                        <strong>Descripción: </strong> {itemKardex.description}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Typography sx={{ padding: '10px' }}>
                        <strong>Grupo contable: </strong> {itemKardex.group}
                    </Typography>
                </Grid>
            </Grid>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell rowSpan={2}>FECHA</StyledTableCell>
                            <StyledTableCell rowSpan={2}>DETALLE</StyledTableCell>
                            <StyledTableCell rowSpan={2}>SALDO INICIAL</StyledTableCell>
                            <StyledTableCell colSpan={3}>CANTIDAD</StyledTableCell>
                            <StyledTableCell rowSpan={2}>PRECIO UNITARIO</StyledTableCell>
                            <StyledTableCell rowSpan={2}>SALDO INICIAL</StyledTableCell>
                            <StyledTableCell colSpan={3}>IMPORTES</StyledTableCell>
                        </TableRow>
                        <TableRow>
                            <StyledTableCell>ENTRADA</StyledTableCell>
                            <StyledTableCell>SALIDA</StyledTableCell>
                            <StyledTableCell>SALDO</StyledTableCell>
                            <StyledTableCell>ENTRADA</StyledTableCell>
                            <StyledTableCell>SALIDA</StyledTableCell>
                            <StyledTableCell>SALDO</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        <StyledTableRow>
                            <StyledBodyCell align="left">{DayYear}</StyledBodyCell>
                            <StyledBodyCell align="left">Saldo al {lastDayLastYear}</StyledBodyCell>
                            <StyledBodyCell align="center">{itemKardex.balance_amount_entries}</StyledBodyCell>
                            <StyledBodyCell align="left"></StyledBodyCell>
                            <StyledBodyCell align="left"></StyledBodyCell>
                            <StyledBodyCell align="left"></StyledBodyCell>
                            <StyledBodyCell align="left"></StyledBodyCell>
                            <StyledBodyCell align="center">{formatNumber(itemKardex.balance_cost_total)}</StyledBodyCell>
                            <StyledBodyCell align="left"></StyledBodyCell>
                            <StyledBodyCell align="left"></StyledBodyCell>
                            <StyledBodyCell align="left"></StyledBodyCell>
                        </StyledTableRow>

                        {itemKardex.kardex_de_existencia.map((entry: any, index: number) => (
                            <StyledTableRow key={index}>
                                <StyledBodyCell align="left">{entry.date}</StyledBodyCell>
                                <StyledDetailCell align="left">{entry.description}</StyledDetailCell>
                                <StyledBodyCell align="left"></StyledBodyCell>
                                <StyledBodyCell align="center">{entry.entradas}</StyledBodyCell>
                                <StyledBodyCell align="center">{entry.salidas}</StyledBodyCell>
                                <StyledBodyCell align="right">{entry.stock_fisico}</StyledBodyCell>
                                <StyledBodyCell align="right">{formatNumber(entry.cost_unit)}</StyledBodyCell>
                                <StyledBodyCell align="left"></StyledBodyCell>
                                <StyledBodyCell align="right">{formatNumber(entry.importe_entrada)}</StyledBodyCell>
                                <StyledBodyCell align="right">{formatNumber(entry.importe_salida)}</StyledBodyCell>
                                <StyledBodyCell align="right">{formatNumber(entry.importe_saldo)}</StyledBodyCell>
                            </StyledTableRow>
                        ))}
                        <StyledTableRow>
                            <StyledTotalCell align="left" />
                            <StyledTotalCell align="left">TOTAL</StyledTotalCell>
                            <StyledTotalCell align="left">{itemKardex.balance_amount_entries}</StyledTotalCell>
                            <StyledTotalCell>{itemKardex.totales?.entradas ?? 0}</StyledTotalCell>
                            <StyledTotalCell>{itemKardex.totales?.salidas ?? 0}</StyledTotalCell>
                            <StyledTotalCell>{itemKardex.totales?.stock_fisico ?? 0}</StyledTotalCell>
                            <StyledTotalCell />
                            <StyledTotalCell align="left">{formatNumber(itemKardex.balance_cost_total)}</StyledTotalCell>
                            <StyledTotalCell>{formatNumber(itemKardex.totales?.importe_entrada)}</StyledTotalCell>
                            <StyledTotalCell>{formatNumber(itemKardex.totales?.importe_salida)}</StyledTotalCell>
                            <StyledTotalCell>{formatNumber(itemKardex.totales?.importe_saldo)}</StyledTotalCell>
                        </StyledTableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </StyledContainer>
    );
};
