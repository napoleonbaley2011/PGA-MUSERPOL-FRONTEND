import { Dialog, DialogContent, DialogTitle, Grid, IconButton, Stack, Typography, Button, TextField, Slide, Box, DialogActions } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { usePettyCash } from "../../../hooks";
import { useEffect, useState } from "react";
import AnalyticCardPetty from "../../../components/AnalyticCardPetty";

interface Props {
    open: boolean;
    location: boolean;
    onClose: () => void;
}

export const EndManagement = ({ open, location, onClose }: Props) => {
    const { funds, petty_cashes, getFunds, getDataPettyCash, postEndManagement, postNewManagement } = usePettyCash();

    const [step, setStep] = useState<1 | 2 | 3>(1);

    const [formValues, setFormValues] = useState({
        assignmentAmount: "",
        responsible: ""
    });

    const [errors, setErrors] = useState<{
        assignmentAmount?: string;
        responsible?: string;
    }>({});

    useEffect(() => {
        if (open) {
            getFunds();
            getDataPettyCash();
            if (location) {
                setStep(3);
            } else {
                setStep(1);
            }
            setFormValues({
                assignmentAmount: "",
                responsible: ""
            });
            setErrors({});
        }
    }, [open]);

    if (!petty_cashes || !petty_cashes.dataPettyCash) {
        return null;
    }

    const { amount, balance, discharges } = petty_cashes.dataPettyCash;

    const handleInternalClose = () => {
        setStep(1);
        setFormValues({
            assignmentAmount: "",
            responsible: ""
        });
        setErrors({});
        onClose();
    };

    const handleChangeForm = (
        field: "assignmentAmount" | "responsible",
        value: string
    ) => {
        setFormValues(prev => ({
            ...prev,
            [field]: value
        }));
        setErrors(prev => ({
            ...prev,
            [field]: undefined
        }));
    };

    const validateForm = () => {
        const newErrors: {
            assignmentAmount?: string;
            responsible?: string;
        } = {};

        if (!formValues.assignmentAmount.trim()) {
            newErrors.assignmentAmount = "La asignación de fondos es obligatoria.";
        }
        if (!formValues.responsible.trim()) {
            newErrors.responsible = "El responsable es obligatorio.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (step === 1) {
            setStep(2);
            return;
        }

        if (step === 2) {
            const payload = {
                discharges: Number(balance || 0)
            };
            await postEndManagement(payload);
            setStep(3);
            return;
        }

        if (step === 3) {
            const isValid = validateForm();
            if (!isValid) return;
            console.log("Cerrar gestión con:", formValues);
            await postNewManagement(formValues);
            await getDataPettyCash();

            handleInternalClose();
        }
    };

    const nextButtonLabel =
        step === 1 ? "Siguiente" : step === 2 ? "Continuar" : "Confirmar y cerrar";

    return (
        <Dialog open={open} onClose={handleInternalClose} fullWidth maxWidth="md">
            <DialogTitle
                sx={{
                    textAlign: "center",
                    background: "#E2F6F0",
                    color: "#333",
                    p: 2,
                    position: "relative"
                }}
            >
                <Typography sx={{ mb: 0.5, fontWeight: "bold" }}>
                    CIERRE DE GESTIÓN
                </Typography>
                <IconButton
                    aria-label="cerrar"
                    onClick={handleInternalClose}
                    sx={{ position: "absolute", right: 8, top: 8, color: "#333" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box
                    sx={{
                        position: "relative",
                        overflow: "hidden",
                        minHeight: 260,
                        mt: 1
                    }}
                >
                    <Slide
                        in={step === 1}
                        direction="right"
                        mountOnEnter
                        unmountOnExit
                    >
                        <Box>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography
                                            variant="h6"
                                            sx={{ mb: 2, fontWeight: "bold" }}
                                        >
                                            Movimientos de Fondos
                                        </Typography>
                                        {(funds ?? []).map(
                                            (item: any, index: number) => (
                                                <Grid
                                                    key={item.id}
                                                    container
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        backgroundColor:
                                                            index % 2 === 0
                                                                ? "#F7F7F7"
                                                                : "#FFFFFF",
                                                        mb: 1,
                                                        border:
                                                            "1px solid #E0E0E0"
                                                    }}
                                                >
                                                    <Grid item xs={6}>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: "0.9rem"
                                                            }}
                                                        >
                                                            {item.type}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid
                                                        item
                                                        xs={6}
                                                        sx={{
                                                            textAlign: "right"
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: "bold",
                                                                fontSize: "0.9rem"
                                                            }}
                                                        >
                                                            {Number(
                                                                item.received_amount
                                                            ).toLocaleString(
                                                                "es-BO",
                                                                {
                                                                    minimumFractionDigits: 2
                                                                }
                                                            )}{" "}
                                                            Bs
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            )
                                        )}
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            <AnalyticCardPetty
                                                title="Saldo Inicial + Repocisiones de Caja Chica"
                                                count={Number(
                                                    amount
                                                ).toLocaleString(
                                                    "es-BO",
                                                    {
                                                        minimumFractionDigits: 2
                                                    }
                                                )}
                                                extra={"2"}
                                            />
                                            <AnalyticCardPetty
                                                title="Gastos con Caja Chica"
                                                count={Number(
                                                    discharges
                                                ).toLocaleString(
                                                    "es-BO",
                                                    {
                                                        minimumFractionDigits: 2
                                                    }
                                                )}
                                                extra={"2"}
                                            />
                                            <AnalyticCardPetty
                                                title="Saldo a Depositar"
                                                count={Number(
                                                    balance
                                                ).toLocaleString(
                                                    "es-BO",
                                                    {
                                                        minimumFractionDigits: 2
                                                    }
                                                )}
                                                extra={"2"}
                                            />
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </Slide>

                    <Slide
                        in={step === 2}
                        direction="left"
                        mountOnEnter
                        unmountOnExit
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{ mb: 2, fontWeight: "bold" }}
                            >
                                Confirmar cierre de gestión
                            </Typography>

                            <Typography sx={{ mb: 1.5 }}>
                                Al continuar, los usuarios{" "}
                                <strong>no podrán solicitar</strong> nuevas solicitudes o hasta que se registre una nueva asignación de fondos.
                            </Typography>
                            <Typography>
                                La caja chica quedará{" "}
                                <strong>temporalmente cerrada para solicitudes</strong>.
                            </Typography>
                        </Box>
                    </Slide>

                    <Slide
                        in={step === 3}
                        direction="left"
                        mountOnEnter
                        unmountOnExit
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{ mb: 2, fontWeight: "bold" }}
                            >
                                Nueva asignación de fondos
                            </Typography>

                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Complete los datos para la siguiente asignación de
                                fondos de caja chica.
                            </Typography>

                            <Stack spacing={2}>
                                <TextField
                                    label="Asignación de fondos a caja chica"
                                    fullWidth
                                    value={formValues.assignmentAmount}
                                    onChange={e =>
                                        handleChangeForm(
                                            "assignmentAmount",
                                            e.target.value
                                        )
                                    }
                                    error={Boolean(errors.assignmentAmount)}
                                    helperText={errors.assignmentAmount}
                                />

                                <TextField
                                    label="Responsable"
                                    fullWidth
                                    value={formValues.responsible}
                                    onChange={e =>
                                        handleChangeForm(
                                            "responsible",
                                            e.target.value
                                        )
                                    }
                                    error={Boolean(errors.responsible)}
                                    helperText={errors.responsible}
                                />
                            </Stack>
                        </Box>
                    </Slide>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleInternalClose} color="inherit">
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleNext}>
                    {nextButtonLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
