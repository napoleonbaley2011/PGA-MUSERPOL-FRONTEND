import {Dialog, DialogTitle, DialogContent, DialogActions,IconButton, Typography, Table, TableBody, TableRow,TableCell, Divider, Button, TableHead
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useMemo, useState } from "react";
import { usePettyCash } from "../../../hooks";
import GroupSelect from "../../../components/GroupSelect";

interface Product {
    product_id?: number;
    invoice_number?: string;
    description?: string;
    amount_request?: number;
    costDetail?: number;
    costDetailsFinal?: number;
    group_id?: number | null;
}

interface PettyCashItem {
    id: number;
    number_note?: string;
    employee?: string;
    concept?: string;
    request_date?: string;
    delivery_date?: string;
    state?: string;
    observation_request?: string;
    products?: Product[];
}

interface PettyCashDialogProps {
    open: boolean;
    onClose: () => void;
    item: PettyCashItem | null;
}

const stableRowKey = (itemId: number | undefined, p: Product, idx: number) =>
    p.product_id != null ? `pid-${p.product_id}` : `note-${itemId ?? "x"}-row-${idx}`;

export const ViewPettyCash = ({ open, onClose, item }: PettyCashDialogProps) => {
    const { listGroups, getListGroup, sendGroupProduct, getDataPettyCash } = usePettyCash();

    const [isApproving, setIsApproving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState<Record<string, string>>({});

    useEffect(() => {
        getListGroup();
    }, []);

    useEffect(() => {
        if (!open) return;
        const next: Record<string, string> = {};
        (item?.products ?? []).forEach((p, idx) => {
            const k = stableRowKey(item?.id, p, idx);
            next[k] = p.group_id != null ? String(p.group_id) : "";
        });
        setSelected(next);
        setIsApproving(false);
    }, [open, item?.id]);

    useEffect(() => {
        if (!open) {
            setSelected({});
            setIsApproving(false);
            setIsLoading(false);
        }
    }, [open]);

    const handleChange = (rowKey: string, value: string) => { setSelected(prev => ({ ...prev, [rowKey]: value })); };

    const allProductsHaveGroup = useMemo(() => {
        const products = item?.products ?? [];
        if (!products.length) return false;
        return products.every((p, idx) => {
            const k = stableRowKey(item?.id, p, idx);
            const v = selected[k];
            return v !== "" && v !== undefined;
        });
    }, [item?.products, item?.id, selected]);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            if (!item?.id) {
                console.error("No hay id de la nota");
                return;
            }

            const items = (item.products ?? []).map((p, idx) => {
                const k = stableRowKey(item.id, p, idx);
                const v = selected[k];
                return {
                    productId: p.product_id ?? null,
                    groupId: v === "" ? null : Number(v)
                };
            });

            const missing = items.filter(i => i.groupId == null || Number.isNaN(i.groupId));
            if (missing.length) {
                console.warn("Falta asignar grupo a algunos productos");
                return;
            }

            const payload = { notePettyCashId: item.id, items };
            console.log("Payload listo:", payload);
            await sendGroupProduct(payload);
            await getDataPettyCash();
             onClose(); 
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsApproving(false);
        }
    };

    const showActions = item?.state !== "Finalizado" && item?.state !== "Cancelado";
    
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ textAlign: "center", background: "#E2F6F0", color: "#333", p: 2, position: "relative" }}>
                <Typography sx={{ mb: 0.5, fontWeight: "bold" }}>Visualizar Nota de Caja Chica</Typography>
                <IconButton aria-label="cerrar" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8, color: "#333" }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {item && (
                    <>
                        <Table size="small" sx={{ mb: 2 }}>
                            <TableBody>
                                <TableRow><TableCell sx={{ fontWeight: "bold" }}>Número:</TableCell><TableCell>{item.number_note ?? "-"}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ fontWeight: "bold" }}>Solicitante:</TableCell><TableCell>{item.employee ?? "-"}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ fontWeight: "bold" }}>Concepto:</TableCell><TableCell>{item.concept ?? "-"}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ fontWeight: "bold" }}>Fecha de Solicitud:</TableCell><TableCell>{item.request_date ?? "-"}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ fontWeight: "bold" }}>Fecha de Entrega:</TableCell><TableCell>{item.delivery_date ?? "-"}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ fontWeight: "bold" }}>Estado:</TableCell><TableCell>{item.state ?? "-"}</TableCell></TableRow>
                                {!!item.observation_request && (
                                    <TableRow><TableCell sx={{ fontWeight: "bold" }}>Comentario:</TableCell><TableCell>{item.observation_request}</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <Divider sx={{ my: 2, borderBottom: "2px solid #E2F6F0" }} />

                        <Table size="small" sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" }}>
                            <TableHead sx={{ backgroundColor: "#E2F6F0" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "bold" }}>Descripción</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Nro de Factura</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Cantidad</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Precio Unitario</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Grupo Presupuestario</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(item.products ?? []).map((p, idx) => {
                                    const k = stableRowKey(item.id, p, idx);
                                    return (
                                        <TableRow key={k}>
                                            <TableCell>{p.description ?? "-"}</TableCell>
                                            <TableCell>{p.invoice_number ?? "-"}</TableCell>
                                            <TableCell>{p.amount_request ?? "-"}</TableCell>
                                            <TableCell>{p.costDetailsFinal ?? "-"}</TableCell>
                                            <TableCell>
                                                <GroupSelect
                                                    value={selected[k] ?? ""}
                                                    groups={Array.isArray(listGroups) ? listGroups : []}
                                                    onChange={(id) => handleChange(k, id)}
                                                    loading={!listGroups}        
                                                    label=""                     
                                                    placeholder="Selecciona grupo..."
                                                    required
                                                    fullWidth
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: "center" }}>
                {showActions && (
                    <>
                        <Button
                            onClick={() => (!isApproving ? setIsApproving(true) : handleSubmit())}
                            variant="contained"
                            color="success"
                            sx={{ borderRadius: "8px", mr: isApproving ? 1 : 0 }}
                            disabled={isLoading || !allProductsHaveGroup}
                        >
                            {isLoading ? "Procesando..." : isApproving ? "Confirmar Aprobación" : "Aprobar"}
                        </Button>
                        {isApproving && (
                            <Button
                                onClick={() => setIsApproving(false)}
                                variant="outlined"
                                color="inherit"
                                sx={{ borderRadius: "8px" }}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};
