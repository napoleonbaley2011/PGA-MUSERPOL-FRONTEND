import { Table, TableBody, TableCell, TableContainer, Paper, TableHead, TableRow, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { styled } from '@mui/material/styles';
import { usePettyCash } from "../../../hooks";
import { useEffect, useState } from "react";
import { ComponentTablePagination, SkeletonComponent } from "../../../components";
import { Cancel, CheckCircle, Print } from "@mui/icons-material";
import { ViewPettyCash } from "./ViewPettyCash";
import { Box } from "@mui/system";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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

    const { note_petty_cashes, flag, getNotePettyCashes, postDeliveyOfResources, postReloadNotePettyCashes, printNoteFormDischarge, printNoteFormVale } = usePettyCash();
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [previousCount, setPreviousCount] = useState(0);
    const limitInit = 5;
    const [limit, setLimit] = useState(limitInit);

    useEffect(() => {
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
        } finally {
            setIsConfirming(false);
        }
    };

    const handleConfirmCancell = async () => {
        if (!noteToConfirm) return;
        try {
            setIsConfirming(true);
            await postReloadNotePettyCashes(noteToConfirm);
            setOpenConfirmCancell(false);
            setNoteToConfirm(null);
            await getNotePettyCashes(page, limit);
        } finally {
            setIsConfirming(false);
        }
    };

    console.log(note_petty_cashes);

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>NRO</StyledTableCell>
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
                                        <StyledBodyCell align="left">{index + 1}</StyledBodyCell>
                                        <StyledBodyCell align="left">{note.employee}</StyledBodyCell>
                                        <StyledBodyCell align="left">{note.concept}</StyledBodyCell>
                                        <StyledBodyCell align="left">{note.state}</StyledBodyCell>
                                        <StyledBodyCell align="left">{note.request_date}</StyledBodyCell>
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
                                                {(note.request_date && note.state === 'En Revision') && (
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

            <Dialog open={openConfirm} onClose={closeConfirmDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Confirmar entrega de recursos</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Vas a confirmar:
                        </Typography>
                        <DialogContentText component="div" sx={{ mt: 0.5 }}>
                            <strong>Monto:</strong> {noteToConfirm?.approximate_cost} Bs
                            <br />
                            <strong>Concepto:</strong> {noteToConfirm?.concept ?? '—'}
                            <br />
                            <strong>Para:</strong> {noteToConfirm?.employee ?? 'el solicitante'}
                        </DialogContentText>
                    </Box>
                    <List dense>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleOutlineIcon color="success" />
                            </ListItemIcon>
                            <ListItemText primary="Firmas de los superiores" secondary="Documento/s aprobados y firmados" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <CheckCircleOutlineIcon color="success" />
                            </ListItemIcon>
                            <ListItemText primary="Entrega del dinero" secondary="Monto listo para ser entregado al solicitante" />
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmDialog} disabled={isConfirming}>Cancelar</Button>
                    <Button onClick={handleConfirm} variant="contained" disabled={isConfirming}>
                        {isConfirming ? 'Confirmando…' : 'Sí, confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openConfirmCancell} onClose={closeConfirmDialogCancell} maxWidth="xs" fullWidth>
                <DialogTitle>Confirmar Anular Solicitud</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Vas a confirmar Anular:
                        </Typography>
                        <DialogContentText component="div" sx={{ mt: 0.5 }}>
                            <strong>Monto:</strong> {noteToConfirm?.approximate_cost} Bs
                            <br />
                            <strong>Concepto:</strong> {noteToConfirm?.concept ?? '—'}
                            <br />
                            <strong>Para:</strong> {noteToConfirm?.employee ?? 'el solicitante'}
                        </DialogContentText>
                    </Box>
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
