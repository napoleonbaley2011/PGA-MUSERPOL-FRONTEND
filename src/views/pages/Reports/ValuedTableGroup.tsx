import {
    Table, TableBody, TableContainer, TableHead, TableRow, Typography, Divider
} from '@mui/material';
import {
    StyledHeaderCell, StyledDescriptionCell, StyledBodyCell, StyledFooterCell, StyledTableRow
} from './StyledComponents';

export const ValuedTableGroup = ({ item }: { item: any }) => {

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const lastDayLastYear = `31/12/${lastYear}`;
    return (
        <TableContainer>
            <Typography sx={{ padding: '10px', fontSize: '0.9rem' }}>
                <strong>Grupo:</strong> {item.grupo}
            </Typography>
            <Typography sx={{ padding: '10px', fontSize: '0.9rem' }}>
                <strong>Código:</strong> {item.codigo_grupo}
            </Typography>

            <Table>
                <TableHead>
                    <TableRow>
                        <StyledHeaderCell rowSpan={2}>CÓDIGO</StyledHeaderCell>
                        <StyledHeaderCell rowSpan={2}>DESCRIPCIÓN</StyledHeaderCell>
                        <StyledHeaderCell rowSpan={2}>UNIDAD</StyledHeaderCell>
                        <StyledHeaderCell colSpan={3}>SALDO INICIAL AL {lastDayLastYear}</StyledHeaderCell>
                        <StyledHeaderCell colSpan={3}>ENTRADAS</StyledHeaderCell>
                        <StyledHeaderCell colSpan={3}>SALIDAS</StyledHeaderCell>
                        <StyledHeaderCell colSpan={3}>SALDO</StyledHeaderCell>
                    </TableRow>
                    <TableRow>
                        <StyledHeaderCell>CANTIDAD</StyledHeaderCell>
                        <StyledHeaderCell>PRECIO</StyledHeaderCell>
                        <StyledHeaderCell>TOTAL</StyledHeaderCell>
                        <StyledHeaderCell>CANTIDAD</StyledHeaderCell>
                        <StyledHeaderCell>PRECIO</StyledHeaderCell>
                        <StyledHeaderCell>TOTAL</StyledHeaderCell>
                        <StyledHeaderCell>CANTIDAD</StyledHeaderCell>
                        <StyledHeaderCell>PRECIO</StyledHeaderCell>
                        <StyledHeaderCell>TOTAL</StyledHeaderCell>
                        <StyledHeaderCell>CANTIDAD</StyledHeaderCell>
                        <StyledHeaderCell>PRECIO</StyledHeaderCell>
                        <StyledHeaderCell>TOTAL</StyledHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {item.materiales.map((material: any, index: number) => {
                        const saldoAnteriores = material.saldo_anterior ?? [];
                        const lotes = material.lotes ?? [];
                        const maxRows = Math.max(saldoAnteriores.length, lotes.length);

                        return [...Array(maxRows)].map((_, rowIndex) => {
                            const saldo = saldoAnteriores[rowIndex] || { cantidad_restante: "", precio_unitario: "", valor_restante: "" };
                            const lote = lotes[rowIndex] || {
                                cantidad_inicial: 0,
                                cantidad_restante: 0,
                                precio_unitario: 0,
                                cantidad_1: 0,
                                cantidad_2: 0,
                                cantidad_3: 0
                            };

                            return (
                                <StyledTableRow key={`${index}-${rowIndex}`}>
                                    {rowIndex === 0 && (
                                        <>
                                            <StyledBodyCell rowSpan={maxRows} align="left">
                                                {material.codigo_material}
                                            </StyledBodyCell>
                                            <StyledDescriptionCell rowSpan={maxRows} align="left">
                                                {material.nombre_material}
                                            </StyledDescriptionCell>
                                            <StyledBodyCell rowSpan={maxRows}>
                                                {material.unidad_material}
                                            </StyledBodyCell>
                                        </>
                                    )}

                                    <StyledBodyCell align="center">
                                        {saldo.cantidad_restante !== 0 ? saldo.cantidad_restante : ""}
                                    </StyledBodyCell>
                                    <StyledBodyCell align="right">
                                        {saldo.precio_unitario ? parseFloat(saldo.precio_unitario).toFixed(2) : ""}
                                    </StyledBodyCell>
                                    <StyledBodyCell align="right">
                                        {saldo.valor_restante ? parseFloat(saldo.valor_restante).toFixed(2) : ""}
                                    </StyledBodyCell>

                                    <StyledBodyCell align="center">{lote.cantidad_inicial}</StyledBodyCell>
                                    <StyledBodyCell align="right">{lote.precio_unitario.toFixed(2)}</StyledBodyCell>
                                    <StyledBodyCell align="right">{lote.cantidad_1.toFixed(2)}</StyledBodyCell>

                                    <StyledBodyCell align="center">
                                        {(lote.cantidad_inicial - lote.cantidad_restante)}
                                    </StyledBodyCell>
                                    <StyledBodyCell align="right">{lote.precio_unitario.toFixed(2)}</StyledBodyCell>
                                    <StyledBodyCell align="right">{lote.cantidad_2.toFixed(2)}</StyledBodyCell>

                                    <StyledBodyCell align="center">{lote.cantidad_restante}</StyledBodyCell>
                                    <StyledBodyCell align="right">{lote.precio_unitario.toFixed(2)}</StyledBodyCell>
                                    <StyledBodyCell align="right">{lote.cantidad_3.toFixed(2)}</StyledBodyCell>
                                </StyledTableRow>
                            );
                        });
                    })}

                    <StyledTableRow>
                        <StyledFooterCell colSpan={3}>TOTAL EN BS</StyledFooterCell>
                        <StyledFooterCell align="right">{item.resumen?.saldo_anterior_cantidad ?? ""}</StyledFooterCell>
                        <StyledFooterCell /> { }
                        <StyledFooterCell align="right">{item.resumen?.saldo_anterior_total?.toFixed(2) ?? ""}</StyledFooterCell>

                        <StyledFooterCell align="right">{(item.resumen?.entradas_cantidad - item.resumen?.saldo_anterior_cantidad)}</StyledFooterCell>
                        <StyledFooterCell /> { }
                        <StyledFooterCell align="right">{(item.resumen?.entradas_total - item.resumen?.saldo_anterior_total).toFixed(2)}</StyledFooterCell>

                        <StyledFooterCell align="right">{item.resumen?.salidas_cantidad ?? ""}</StyledFooterCell>
                        <StyledFooterCell />
                        <StyledFooterCell align="right">{item.resumen?.salidas_total?.toFixed(2) ?? ""}</StyledFooterCell>

                        <StyledFooterCell align="right">{item.resumen?.saldo_final_cantidad ?? ""}</StyledFooterCell>
                        <StyledFooterCell />
                        <StyledFooterCell align="right">{item.resumen?.saldo_final_total?.toFixed(2) ?? ""}</StyledFooterCell>
                    </StyledTableRow>
                </TableBody>
            </Table>

            <Divider sx={{ mt: 2 }} />
        </TableContainer>
    );
};
