import { Table, TableBody, TableCell, TableContainer, Paper, TableHead, TableRow, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Divider, FormControl, Select, MenuItem, Grid, InputLabel, FormHelperText } from "@mui/material";
import { styled } from '@mui/material/styles';
import { usePettyCash } from "../../../hooks";
import { useEffect, useState } from "react";
import { ComponentTablePagination, SkeletonComponent } from "../../../components";
import { Cancel, CheckCircle, Print } from "@mui/icons-material";
import { ViewPettyCash } from "./ViewPettyCash";
import CloseIcon from '@mui/icons-material/Close';

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

export const TablePettyCash = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedNote, setSelectedNote] = useState<any | null>(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openConfirmCancell, setOpenConfirmCancell] = useState(false);
    const [noteToConfirm, setNoteToConfirm] = useState<any | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [selectedReason, setSelectedReason] = useState<number | ''>('');

    const { note_petty_cashes, flag, types_cancellations, getNotePettyCashes, postDeliveyOfResources, postReloadNotePettyCashes, printNoteFormDischarge, printNoteFormVale, getListTypesCancellations, getDataPettyCash } = usePettyCash();
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [previousCount, setPreviousCount] = useState(0);
    const limitInit = 5;
    const [limit, setLimit] = useState(limitInit);
    const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string | number>>(new Set());

    const getTicketId = (t: any, index: number) =>
        t?.id ?? t?.ticket_id ?? `${t?.id_permission}-${t?.permission_day}-${index}`;

    useEffect(() => {
        setSelectedTicketIds(new Set());
    }, [openConfirm, noteToConfirm?.id]);

    useEffect(() => {
        getListTypesCancellations();
        const fetchData = async () => {
            const totalNotes = await getNotePettyCashes(page, limit);
            setTotal(totalNotes);
            setPreviousCount(totalNotes);
        };
        fetchData();
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, [page, limit, flag, previousCount]);

    const handleOpen = (note: any) => { setSelectedNote(note); setOpenDialog(true); };
    const handleClose = () => { setOpenDialog(false); setSelectedNote(null); };

    const openConfirmDialog = (note: any) => {
        setNoteToConfirm(note);
        setOpenConfirm(true);
    };

    const openConfirmDialogCancell = (note: any) => {
        setNoteToConfirm(note);
        setOpenConfirmCancell(true);
    };

    const closeConfirmDialog = () => {
        if (isConfirming) return;
        setOpenConfirm(false);
        setNoteToConfirm(null);
    };

    const closeConfirmDialogCancell = () => {
        if (isConfirming) return;
        setOpenConfirmCancell(false);
        setNoteToConfirm(null);
    };

    const handleConfirm = async () => {
        if (!noteToConfirm) return;
        try {
            setIsConfirming(true);
            await postDeliveyOfResources(noteToConfirm);
            setOpenConfirm(false);
            setNoteToConfirm(null)
            await getNotePettyCashes(page, limit);
            await getDataPettyCash();
        } finally {
            setIsConfirming(false);
        }
    };
    const handleConfirmCancell = async () => {
        if (!noteToConfirm) return;
        const updatedNote = { ...noteToConfirm, types_cancellations: selectedReason };
        console.log(selectedReason);
        try {
            setIsConfirming(true);
            await postReloadNotePettyCashes(updatedNote);
            setOpenConfirmCancell(false);
            setNoteToConfirm(null);
            await getNotePettyCashes(page, limit);
        } finally {
            setIsConfirming(false);
        }
    };

    const hasError = !selectedReason;

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>SOLICITANTE</StyledTableCell>
                            <StyledTableCell>CONCEPTO</StyledTableCell>
                            <StyledTableCell>ESTADO</StyledTableCell>
                            <StyledTableCell>FECHA DE ENTREGA DE RECURSO</StyledTableCell>
                            <StyledTableCell>FECHA DE ENTREGA</StyledTableCell>
                            <StyledTableCell>ACCIONES</StyledTableCell>
                        </TableRow>
                    </TableHead>

                    {!note_petty_cashes ? (
                        <TableBody>
                            {[...Array(6)].map((_, i) => (
                                <TableRow key={`sk-${i}`}>
                                    <TableCell colSpan={6} sx={{ p: 0 }}>
                                        <SkeletonComponent quantity={1} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    ) : (
                        <TableBody>
                            {note_petty_cashes.map((note: any, index: number) => {
                                const key = note.id ?? note.number_note ?? `${note.employee}-${note.request_date}-${index}`;
                                return (
                                    <TableRow key={key} hover>
                                        <StyledBodyCell align="left">{note.employee}</StyledBodyCell>
                                        <StyledBodyCell align="left">{note.concept}</StyledBodyCell>
                                        <StyledBodyCell align="left">{note.state}</StyledBodyCell>
                                        <StyledBodyCell align="left">{note.request_date ?? '-'}</StyledBodyCell>
                                        <StyledBodyCell align="left">{note.delivery_date ?? '-'}</StyledBodyCell>
                                        <StyledBodyCell align="left">
                                            <Stack alignContent="center" direction="row">
                                                {note.state === 'Aceptado' && (
                                                    <IconButton sx={{ p: 2 }} onClick={() => handleOpen(note)} aria-label="ver nota">
                                                        <CheckCircle color="success" />
                                                    </IconButton>
                                                )}
                                                {note.state === 'En Proceso' && (
                                                    <IconButton sx={{ p: 2 }} onClick={() => openConfirmDialogCancell(note)} aria-label="ver nota">
                                                        <Cancel color="error" />
                                                    </IconButton>
                                                )}
                                                {note.state === 'Finalizado' && (
                                                    <IconButton sx={{ p: 2 }} onClick={() => printNoteFormVale(note)} aria-label="imprimir">
                                                        <Print color="info" />
                                                    </IconButton>
                                                )}
                                                {note.state === 'Finalizado' && (
                                                    <IconButton sx={{ p: 2 }} onClick={() => printNoteFormDischarge(note)} aria-label="otro print">
                                                        <Print color="error" />
                                                    </IconButton>
                                                )}
                                                {!note.request_date && (
                                                    <IconButton
                                                        sx={{ p: 2 }}
                                                        onClick={() => openConfirmDialog(note)}
                                                        aria-label="confirmar entrega"
                                                    >
                                                        <CheckCircle color="info" />
                                                    </IconButton>

                                                )}

                                                {(note.state !== 'Finalizado') && (
                                                    <IconButton
                                                        sx={{ p: 2 }}
                                                        onClick={() => openConfirmDialogCancell(note)}
                                                        aria-label="Anular"
                                                    >
                                                        <Cancel color="error" />
                                                    </IconButton>

                                                )}
                                            </Stack>
                                        </StyledBodyCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    )}
                </Table>
            </TableContainer>

            <ComponentTablePagination
                total={total}
                onPageChange={setPage}
                onRowsPerPageChange={setLimit}
                page={page}
                limit={limit}
            />

            <ViewPettyCash open={openDialog} onClose={handleClose} item={selectedNote} />

            <Dialog open={openConfirm} onClose={closeConfirmDialog} maxWidth="md" fullWidth>
                <DialogTitle sx={{ background: "#E2F6F0", color: "#333", p: 2, position: "relative" }}>
                    <Typography sx={{ mb: 0.5, fontWeight: "bold" }}>Confirmar entrega de recursos</Typography>
                    <IconButton aria-label="cerrar" onClick={closeConfirmDialog} sx={{ position: "absolute", right: 8, top: 8, color: "#333" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Table size="small" sx={{ mb: 2 }}>
                        <TableBody>
                            <TableRow><TableCell sx={{ fontWeight: "bold" }}>Solicitante:</TableCell><TableCell>{noteToConfirm?.employee ?? 'el solicitante'}</TableCell></TableRow>
                            <TableRow><TableCell sx={{ fontWeight: "bold" }}>Concepto:</TableCell><TableCell>{noteToConfirm?.concept ?? 'el solicitante'}</TableCell></TableRow>
                            <TableRow><TableCell sx={{ fontWeight: "bold" }}>Monto:</TableCell><TableCell>{noteToConfirm?.approximate_cost} Bs</TableCell></TableRow>
                        </TableBody>
                    </Table>

                    <Divider sx={{ my: 2, borderBottom: "2px solid #E2F6F0" }} />

                    {noteToConfirm?.type_cash_id === 3 ? (<Table
                        size="small"
                        sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden", mt: 2 }}
                    >
                        <TableHead sx={{ backgroundColor: "#E2F6F0" }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>Permiso</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Día del Permiso</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Ida</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Vuelta</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Costo</TableCell>
                              
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {(noteToConfirm?.tickets ?? []).map((t: any, index: number) => {
                                const ticketId = getTicketId(t, index);
                                const isSelected = selectedTicketIds.has(ticketId);

                                return (
                                    <TableRow
                                        key={ticketId}
                                        hover
                                        selected={isSelected}
                                        sx={{
                                            ...(isSelected && { backgroundColor: "rgba(25,118,210,0.12)" }),
                                            transition: "background-color 120ms ease",
                                        }}
                                    >
                                        <TableCell>{t?.id_permission ?? "-"}</TableCell>
                                        <TableCell>{t?.permission_day ?? "-"}</TableCell>
                                        <TableCell>{t?.from ?? "-"}</TableCell>
                                        <TableCell>{t?.to ?? "-"}</TableCell>
                                        <TableCell>{t?.cost ?? 0}</TableCell>
                                      
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>) : (<Table size="small" sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
                        <TableHead sx={{ backgroundColor: "#E2F6F0" }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>Descripción</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Cantidad</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Precio Unitario</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {(noteToConfirm?.products ?? []).map((p: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>{p.description ?? "-"}</TableCell>
                                    <TableCell>{p.amount_request ?? "-"} uni.</TableCell>
                                    <TableCell>{p.costDetail ?? 0} Bs.</TableCell>
                                    <TableCell>
                                        {((p.costDetail ?? 0) * (p.amount_request ?? 0)).toFixed(2)} Bs.
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmDialog} disabled={isConfirming}>Cancelar</Button>
                    <Button onClick={handleConfirm} variant="contained" disabled={isConfirming}>
                        {isConfirming ? 'Confirmando…' : 'Sí, confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog open={openConfirmCancell} onClose={closeConfirmDialogCancell} maxWidth="md" fullWidth>
                <DialogTitle sx={{ pr: 6 }}>
                    Confirmar anulación de solicitud
                    <IconButton
                        aria-label="Cerrar"
                        onClick={closeConfirmDialogCancell}
                        edge="end"
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary">Solicitante</Typography>
                            <Typography fontWeight={600}>
                                {noteToConfirm?.employee || '—'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <Typography variant="body2" color="text.secondary">Concepto</Typography>
                            <Typography fontWeight={600}>
                                {noteToConfirm?.concept || '—'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Typography variant="body2" color="text.secondary">Monto</Typography>
                            <Typography fontWeight={600}>
                                {noteToConfirm?.approximate_cost}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Stack spacing={1.5}>
                        <Typography variant="body2" color="text.secondary">Motivo de anulación</Typography>
                        <FormControl fullWidth size="small" error={hasError}>
                            <InputLabel id="motivo-label">Seleccionar motivo</InputLabel>
                            <Select
                                labelId="motivo-label"
                                label="Seleccionar motivo"
                                value={selectedReason ?? ''}
                                onChange={(e) => setSelectedReason(e.target.value as number)}
                                displayEmpty={false}
                            >
                                {types_cancellations?.map((type: any) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.description}
                                    </MenuItem>
                                ))}
                            </Select>
                            {hasError && (
                                <FormHelperText>Elegí un motivo para continuar.</FormHelperText>
                            )}
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmDialogCancell} disabled={isConfirming}>Cancelar</Button>
                    <Button onClick={handleConfirmCancell} variant="contained" disabled={isConfirming}>
                        {isConfirming ? 'Confirmando…' : 'Sí, confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
